from sqlalchemy.orm import Session
from typing import Dict, Optional
import requests
import os
from datetime import datetime

from app.modules.bot.models.alerta_osne import AlertaOsne
from app.modules.bot.models.config_sistema import ConfigSistema
from app.modules.usuarios.models.usuario import Usuario


class NotificacionesService:
    """
    Servicio para enviar notificaciones a Osne cuando se generan alertas.
    Soporta WhatsApp (Twilio) y Email.
    """

    def __init__(self, db: Session):
        self.db = db
        self.config = self._get_config()

    def _get_config(self) -> ConfigSistema:
        """Obtiene la configuración del sistema."""
        config = self.db.query(ConfigSistema).filter(ConfigSistema.id == 1).first()
        if not config:
            config = ConfigSistema(id=1)
            self.db.add(config)
            self.db.commit()
        return config

    def debe_notificar(self, alerta: AlertaOsne) -> bool:
        """
        Determina si se debe enviar notificación según la configuración.
        """
        if alerta.tipo_alerta == 'urgente' and self.config.notificar_urgentes:
            return True
        if alerta.tipo_alerta == 'oportunidad' and self.config.notificar_oportunidades:
            return True
        if alerta.tipo_alerta == 'seguimiento' and self.config.notificar_seguimientos:
            return True
        return False

    def formatear_mensaje_alerta(self, alerta: AlertaOsne, usuario: Usuario) -> str:
        """
        Formatea el mensaje de alerta para envío.
        """
        emoji_map = {
            'urgente': '🚨',
            'oportunidad': '💰',
            'seguimiento': '👀'
        }

        emoji = emoji_map.get(alerta.tipo_alerta, '📢')
        prioridad_text = '⭐' * alerta.prioridad

        mensaje = f"""
{emoji} *ALERTA {alerta.tipo_alerta.upper()}* {prioridad_text}

👤 *Usuario:* {usuario.nombre} {usuario.apellido}
📊 *Razón:* {alerta.razon}
💡 *Acción sugerida:* {alerta.accion_sugerida}

*Puntos clave:*
{self._formatear_puntos_clave(alerta.puntos_clave)}

🔗 Ver detalles en el dashboard
""".strip()

        return mensaje

    def _formatear_puntos_clave(self, puntos_clave: str) -> str:
        """Formatea los puntos clave como lista."""
        if not puntos_clave:
            return "- Sin puntos adicionales"

        puntos = puntos_clave.split('|')
        return '\n'.join([f"• {punto}" for punto in puntos])

    def enviar_whatsapp(self, mensaje: str, telefono: str) -> bool:
        """
        Envía un mensaje por WhatsApp usando Twilio.
        Requiere configurar las credenciales de Twilio en variables de entorno.
        """
        try:
            # Credenciales de Twilio (deben estar en variables de entorno)
            account_sid = os.getenv('TWILIO_ACCOUNT_SID')
            auth_token = os.getenv('TWILIO_AUTH_TOKEN')
            from_number = os.getenv('TWILIO_WHATSAPP_NUMBER')  # formato: whatsapp:+14155238886

            if not all([account_sid, auth_token, from_number]):
                print("⚠️ Credenciales de Twilio no configuradas")
                return False

            # Asegurar formato whatsapp:+numero
            to_number = f"whatsapp:{telefono}" if not telefono.startswith('whatsapp:') else telefono

            url = f"https://api.twilio.com/2010-04-01/Accounts/{account_sid}/Messages.json"

            data = {
                'From': from_number,
                'To': to_number,
                'Body': mensaje
            }

            response = requests.post(url, data=data, auth=(account_sid, auth_token))

            if response.status_code == 201:
                print(f"✅ WhatsApp enviado a {telefono}")
                return True
            else:
                print(f"❌ Error enviando WhatsApp: {response.text}")
                return False

        except Exception as e:
            print(f"❌ Excepción enviando WhatsApp: {str(e)}")
            return False

    def enviar_email(self, mensaje: str, email: str, asunto: str = "Nueva Alerta de Usuario") -> bool:
        """
        Envía un email usando un servicio SMTP.
        Requiere configurar SMTP en variables de entorno.
        """
        try:
            import smtplib
            from email.mime.text import MIMEText
            from email.mime.multipart import MIMEMultipart

            smtp_server = os.getenv('SMTP_SERVER', 'smtp.gmail.com')
            smtp_port = int(os.getenv('SMTP_PORT', '587'))
            smtp_username = os.getenv('SMTP_USERNAME')
            smtp_password = os.getenv('SMTP_PASSWORD')
            from_email = os.getenv('SMTP_FROM_EMAIL', smtp_username)

            if not all([smtp_username, smtp_password]):
                print("⚠️ Credenciales SMTP no configuradas")
                return False

            # Crear mensaje
            msg = MIMEMultipart()
            msg['From'] = from_email
            msg['To'] = email
            msg['Subject'] = asunto

            # Convertir mensaje de WhatsApp a HTML
            mensaje_html = mensaje.replace('\n', '<br>').replace('*', '<b>').replace('</b>', '</b>')
            msg.attach(MIMEText(mensaje_html, 'html'))

            # Enviar
            server = smtplib.SMTP(smtp_server, smtp_port)
            server.starttls()
            server.login(smtp_username, smtp_password)
            server.send_message(msg)
            server.quit()

            print(f"✅ Email enviado a {email}")
            return True

        except Exception as e:
            print(f"❌ Error enviando email: {str(e)}")
            return False

    def notificar_alerta(self, alerta_id: int) -> Dict:
        """
        Envía notificación a Osne sobre una nueva alerta.
        """
        alerta = self.db.query(AlertaOsne).filter(AlertaOsne.id == alerta_id).first()
        if not alerta:
            return {"success": False, "error": "Alerta no encontrada"}

        # Verificar si debe notificar
        if not self.debe_notificar(alerta):
            return {"success": True, "notificado": False, "razon": "Tipo de alerta no configurado para notificar"}

        # Obtener usuario
        usuario = self.db.query(Usuario).filter(Usuario.id == alerta.usuario_id).first()
        if not usuario:
            return {"success": False, "error": "Usuario no encontrado"}

        # Formatear mensaje
        mensaje = self.formatear_mensaje_alerta(alerta, usuario)

        resultado = {
            "success": False,
            "whatsapp": False,
            "email": False
        }

        # Enviar por WhatsApp si está configurado
        if self.config.telefono_osne:
            resultado["whatsapp"] = self.enviar_whatsapp(mensaje, self.config.telefono_osne)

        # Enviar por Email si está configurado (como respaldo)
        # if self.config.email_notificaciones:
        #     asunto = f"🚨 Alerta {alerta.tipo_alerta}: {usuario.nombre} {usuario.apellido}"
        #     resultado["email"] = self.enviar_email(mensaje, self.config.email_notificaciones, asunto)

        resultado["success"] = resultado["whatsapp"]  # or resultado["email"]

        return resultado

    def enviar_resumen_diario(self) -> Dict:
        """
        Envía un resumen diario de todas las alertas pendientes a Osne.
        """
        alertas_pendientes = self.db.query(AlertaOsne).filter(
            AlertaOsne.estado == 'pendiente'
        ).order_by(AlertaOsne.prioridad).all()

        if not alertas_pendientes:
            mensaje = """
📊 *RESUMEN DIARIO DE ALERTAS*

✅ No hay alertas pendientes.
¡Todo bajo control!
""".strip()
        else:
            urgentes = [a for a in alertas_pendientes if a.tipo_alerta == 'urgente']
            oportunidades = [a for a in alertas_pendientes if a.tipo_alerta == 'oportunidad']
            seguimientos = [a for a in alertas_pendientes if a.tipo_alerta == 'seguimiento']

            mensaje = f"""
📊 *RESUMEN DIARIO DE ALERTAS*
_{datetime.now().strftime('%d/%m/%Y')}_

🚨 *Urgentes:* {len(urgentes)}
💰 *Oportunidades:* {len(oportunidades)}
👀 *Seguimientos:* {len(seguimientos)}

*Total pendientes:* {len(alertas_pendientes)}

🔗 Ver detalles en el dashboard
""".strip()

        resultado = {"success": False, "whatsapp": False}

        if self.config.telefono_osne:
            resultado["whatsapp"] = self.enviar_whatsapp(mensaje, self.config.telefono_osne)
            resultado["success"] = resultado["whatsapp"]

        return resultado

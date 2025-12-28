import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Optional
import logging
import os
from dotenv import load_dotenv

load_dotenv()
logger = logging.getLogger(__name__)


def send_ticket_notification(
    ticket_id: int,
    nombre: str,
    categoria: str,
    prioridad: str,
    asunto: str,
    mensaje: str,
    recipient_email: Optional[str] = None
) -> bool:
    """
    Envía un email de notificación cuando se crea un ticket de soporte.

    Args:
        ticket_id: ID del ticket
        nombre: Nombre del remitente
        categoria: Categoría del ticket
        prioridad: Prioridad del ticket
        asunto: Asunto del ticket
        mensaje: Mensaje del ticket
        recipient_email: Email del destinatario (opcional)

    Returns:
        bool: True si el email se envió exitosamente, False en caso contrario
    """

    # Configuración del servidor SMTP desde variables de entorno
    smtp_server = os.getenv("SMTP_SERVER", "smtp.gmail.com")
    smtp_port = int(os.getenv("SMTP_PORT", "587"))
    sender_email = os.getenv("SMTP_USERNAME")
    sender_password = os.getenv("SMTP_PASSWORD")

    # Email del destinatario desde variable de entorno si no se proporciona
    if recipient_email is None:
        recipient_email = os.getenv("SUPPORT_EMAIL", "edwardgiraldo101@gmail.com")

    # Validar que existan las credenciales
    if not sender_email or not sender_password:
        logger.warning("Credenciales SMTP no configuradas. No se enviará el email.")
        return False

    try:
        # Crear el mensaje
        msg = MIMEMultipart("alternative")
        msg["Subject"] = f"Nuevo Ticket de Soporte #{ticket_id}: {asunto}"
        msg["From"] = sender_email
        msg["To"] = recipient_email

        # Mapear categorías a nombres legibles
        categorias_map = {
            "technical": "Problema Técnico",
            "billing": "Facturación",
            "feature": "Nueva Funcionalidad",
            "other": "Otro"
        }

        # Mapear prioridades a nombres legibles
        prioridades_map = {
            "low": "Baja",
            "medium": "Media",
            "high": "Alta",
            "urgent": "Urgente"
        }

        categoria_texto = categorias_map.get(categoria, categoria)
        prioridad_texto = prioridades_map.get(prioridad, prioridad)

        # Crear el cuerpo del email en HTML
        html = f"""
        <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
                    <h2 style="color: #10b981; border-bottom: 2px solid #10b981; padding-bottom: 10px;">
                        Nuevo Ticket de Soporte
                    </h2>

                    <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
                        <p><strong>Ticket ID:</strong> #{ticket_id}</p>
                        <p><strong>Nombre:</strong> {nombre}</p>
                        <p><strong>Categoría:</strong> {categoria_texto}</p>
                        <p><strong>Prioridad:</strong> <span style="color: {'#ef4444' if prioridad in ['high', 'urgent'] else '#f59e0b' if prioridad == 'medium' else '#3b82f6'}; font-weight: bold;">{prioridad_texto}</span></p>
                        <p><strong>Asunto:</strong> {asunto}</p>
                    </div>

                    <div style="margin: 20px 0;">
                        <h3 style="color: #555;">Mensaje:</h3>
                        <p style="background-color: #f9f9f9; padding: 15px; border-left: 4px solid #10b981; border-radius: 3px;">
                            {mensaje}
                        </p>
                    </div>

                    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #777;">
                        <p>Este es un mensaje automático del sistema de soporte de Momentum Fitness.</p>
                        <p>Por favor, responde al ticket desde el panel de administración.</p>
                    </div>
                </div>
            </body>
        </html>
        """

        # Crear versión en texto plano como fallback
        text = f"""
        Nuevo Ticket de Soporte

        Ticket ID: #{ticket_id}
        Nombre: {nombre}
        Categoría: {categoria_texto}
        Prioridad: {prioridad_texto}
        Asunto: {asunto}

        Mensaje:
        {mensaje}

        ---
        Este es un mensaje automático del sistema de soporte de Momentum Fitness.
        Por favor, responde al ticket desde el panel de administración.
        """

        # Adjuntar ambas partes
        part1 = MIMEText(text, "plain")
        part2 = MIMEText(html, "html")
        msg.attach(part1)
        msg.attach(part2)

        # Enviar el email
        with smtplib.SMTP(smtp_server, smtp_port) as server:
            server.starttls()
            server.login(sender_email, sender_password)
            server.send_message(msg)

        logger.info(f"Email de notificación enviado para ticket #{ticket_id}")
        return True

    except Exception as e:
        logger.error(f"Error al enviar email de notificación para ticket #{ticket_id}: {str(e)}")
        # No lanzamos la excepción para que el ticket se cree incluso si falla el email
        return False

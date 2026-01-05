"""
Servicio para manejar los webhooks entrantes de WhatsApp.
Procesa mensajes recibidos y actualizaciones de estado.
"""

import logging
from typing import Dict, Any, Optional
from datetime import datetime
from sqlalchemy.orm import Session

from app.modules.whatsapp.models.mensaje_whatsapp import (
    MensajeWhatsApp,
    EstadoMensaje,
    TipoMensaje
)
from app.modules.usuarios.models.usuario import Usuario
from app.modules.bot.langchain.bot_service import GymBotService
from app.modules.whatsapp.services.whatsapp_service import WhatsAppService

logger = logging.getLogger(__name__)


class WhatsAppWebhookHandler:
    """
    Maneja los webhooks entrantes de WhatsApp Business API.
    """

    def __init__(self, db: Session):
        self.db = db
        self.bot_service = GymBotService()
        self.whatsapp_service = WhatsAppService()

    async def procesar_webhook(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        """
        Procesa el payload completo del webhook de WhatsApp.

        WhatsApp envía webhooks para:
        - Mensajes entrantes
        - Actualizaciones de estado (enviado, entregado, leído)

        Args:
            payload: Payload JSON del webhook

        Returns:
            Dict con el resultado del procesamiento
        """

        try:
            # Validar estructura del payload
            if "object" not in payload or payload["object"] != "whatsapp_business_account":
                logger.warning(f"Payload inválido recibido: {payload}")
                return {"success": False, "error": "Payload inválido"}

            if "entry" not in payload or not payload["entry"]:
                return {"success": True, "message": "No hay entradas para procesar"}

            # Procesar cada entrada
            for entry in payload["entry"]:
                if "changes" not in entry:
                    continue

                for change in entry["changes"]:
                    if change.get("field") != "messages":
                        continue

                    value = change.get("value", {})

                    # Procesar mensajes entrantes
                    if "messages" in value:
                        for message in value["messages"]:
                            await self._procesar_mensaje_entrante(message, value)

                    # Procesar actualizaciones de estado
                    if "statuses" in value:
                        for status in value["statuses"]:
                            self._procesar_actualizacion_estado(status)

            return {"success": True, "message": "Webhook procesado exitosamente"}

        except Exception as e:
            logger.error(f"Error al procesar webhook: {str(e)}", exc_info=True)
            return {"success": False, "error": str(e)}

    async def _procesar_mensaje_entrante(self, message: Dict[str, Any], value: Dict[str, Any]):
        """
        Procesa un mensaje entrante de un usuario.

        Args:
            message: Datos del mensaje
            value: Datos del contexto (incluye info del contacto)
        """

        try:
            # Extraer datos del mensaje
            from_number = message.get("from")
            message_id = message.get("id")
            timestamp = message.get("timestamp")
            message_type = message.get("type")

            # Extraer el contenido según el tipo
            contenido = ""
            media_url = None

            if message_type == "text":
                contenido = message.get("text", {}).get("body", "")
            elif message_type == "image":
                media_url = message.get("image", {}).get("id")  # O URL si está disponible
                contenido = message.get("image", {}).get("caption", "[Imagen]")
            elif message_type == "audio":
                media_url = message.get("audio", {}).get("id")
                contenido = "[Audio]"
            elif message_type == "video":
                media_url = message.get("video", {}).get("id")
                contenido = message.get("video", {}).get("caption", "[Video]")
            elif message_type == "document":
                media_url = message.get("document", {}).get("id")
                contenido = message.get("document", {}).get("filename", "[Documento]")
            else:
                logger.warning(f"Tipo de mensaje no soportado: {message_type}")
                return

            # Buscar usuario por número de teléfono
            usuario = self.db.query(Usuario).filter(
                Usuario.telefono == from_number
            ).first()

            usuario_id = usuario.id if usuario else None
            nombre_usuario = usuario.nombre if usuario else value.get("contacts", [{}])[0].get("profile", {}).get("name", "Usuario")

            logger.info(f"Mensaje recibido de {from_number} ({nombre_usuario}): {contenido}")

            # Guardar mensaje entrante en la BD
            mensaje_entrante = MensajeWhatsApp(
                whatsapp_message_id=message_id,
                telefono_usuario=from_number,
                usuario_id=usuario_id,
                es_saliente=False,
                tipo_mensaje=TipoMensaje(message_type) if message_type in [t.value for t in TipoMensaje] else TipoMensaje.TEXT,
                contenido=contenido,
                media_url=media_url,
                estado=EstadoMensaje.DELIVERED  # Ya lo recibimos
            )
            self.db.add(mensaje_entrante)
            self.db.commit()
            self.db.refresh(mensaje_entrante)

            # Solo procesar mensajes de texto con el bot
            if message_type == "text" and contenido.strip():
                await self._responder_con_bot(
                    from_number=from_number,
                    mensaje_usuario=contenido,
                    usuario_id=usuario_id,
                    mensaje_entrante_id=mensaje_entrante.id
                )
            else:
                # Para otros tipos de mensaje, enviar respuesta genérica
                await self.whatsapp_service.enviar_mensaje_texto(
                    db=self.db,
                    telefono_destino=from_number,
                    mensaje="Gracias por tu mensaje. Por favor, envía un mensaje de texto para que pueda ayudarte mejor 😊",
                    usuario_id=usuario_id
                )

        except Exception as e:
            logger.error(f"Error al procesar mensaje entrante: {str(e)}", exc_info=True)

    async def _responder_con_bot(
        self,
        from_number: str,
        mensaje_usuario: str,
        usuario_id: Optional[int],
        mensaje_entrante_id: int
    ):
        """
        Procesa el mensaje del usuario con el bot y envía la respuesta por WhatsApp.

        Args:
            from_number: Número de teléfono del usuario
            mensaje_usuario: Mensaje enviado por el usuario
            usuario_id: ID del usuario en la BD (puede ser None)
            mensaje_entrante_id: ID del mensaje entrante en la BD
        """

        try:
            # Si el usuario no existe en la BD, no podemos usar el bot completo
            if not usuario_id:
                logger.warning(f"Usuario con teléfono {from_number} no encontrado en la BD")

                # Enviar mensaje de bienvenida/registro
                respuesta = (
                    "¡Hola! 👋 Bienvenido a Momentum Fitness.\n\n"
                    "Para poder ayudarte mejor, primero necesitas registrarte en nuestro gimnasio. "
                    "Visítanos o comunícate al +57 300 1593136 para comenzar tu transformación 💪"
                )

                await self.whatsapp_service.enviar_mensaje_texto(
                    db=self.db,
                    telefono_destino=from_number,
                    mensaje=respuesta
                )
                return

            # Procesar mensaje con el bot
            resultado_bot = await self.bot_service.chat(
                db=self.db,
                usuario_id=usuario_id,
                mensaje=mensaje_usuario,
                sesion_id=from_number  # Usar el número como sesión
            )

            respuesta_bot = resultado_bot["respuesta"]
            alerta_asesor = resultado_bot.get("alerta_asesor_creada", False)

            # Enviar respuesta por WhatsApp
            resultado_envio = await self.whatsapp_service.enviar_mensaje_texto(
                db=self.db,
                telefono_destino=from_number,
                mensaje=respuesta_bot,
                usuario_id=usuario_id,
                conversacion_id=None,  # Podríamos obtener el ID de la conversación creada
                sesion_id=from_number
            )

            # Si se generó una alerta de asesor, podríamos notificar a Osneither aquí
            if alerta_asesor:
                logger.info(f"Alerta de asesor generada para usuario {usuario_id}")
                # TODO: Enviar notificación push o email a Osneither

            if resultado_envio["success"]:
                logger.info(f"Respuesta enviada exitosamente a {from_number}")
            else:
                logger.error(f"Error al enviar respuesta: {resultado_envio.get('error')}")

        except Exception as e:
            logger.error(f"Error al responder con bot: {str(e)}", exc_info=True)

            # Enviar mensaje de error al usuario
            try:
                await self.whatsapp_service.enviar_mensaje_texto(
                    db=self.db,
                    telefono_destino=from_number,
                    mensaje="Disculpa, tuve un problema al procesar tu mensaje. Por favor intenta nuevamente en un momento. 🙏",
                    usuario_id=usuario_id
                )
            except Exception as e2:
                logger.error(f"Error al enviar mensaje de error: {str(e2)}")

    def _procesar_actualizacion_estado(self, status: Dict[str, Any]):
        """
        Procesa una actualización de estado de un mensaje enviado.

        WhatsApp envía actualizaciones cuando un mensaje es:
        - sent: Enviado al servidor de WhatsApp
        - delivered: Entregado al dispositivo del usuario
        - read: Leído por el usuario
        - failed: Falló el envío

        Args:
            status: Datos de la actualización de estado
        """

        try:
            message_id = status.get("id")
            estado_str = status.get("status")
            timestamp = status.get("timestamp")

            # Mapear estados de WhatsApp a nuestros estados
            estado_map = {
                "sent": EstadoMensaje.SENT,
                "delivered": EstadoMensaje.DELIVERED,
                "read": EstadoMensaje.READ,
                "failed": EstadoMensaje.FAILED
            }

            if estado_str not in estado_map:
                logger.warning(f"Estado desconocido recibido: {estado_str}")
                return

            nuevo_estado = estado_map[estado_str]

            # Extraer mensaje de error si es un fallo
            error_mensaje = None
            if estado_str == "failed":
                errors = status.get("errors", [])
                if errors:
                    error_mensaje = errors[0].get("message", "Error desconocido")

            # Actualizar el mensaje en la BD
            self.whatsapp_service.actualizar_estado_mensaje(
                db=self.db,
                whatsapp_message_id=message_id,
                nuevo_estado=nuevo_estado,
                error_mensaje=error_mensaje
            )

            logger.info(f"Estado actualizado para mensaje {message_id}: {estado_str}")

        except Exception as e:
            logger.error(f"Error al procesar actualización de estado: {str(e)}", exc_info=True)

    def verificar_webhook(self, mode: str, token: str, challenge: str, verify_token: str) -> Optional[str]:
        """
        Verifica el webhook cuando WhatsApp intenta conectarse.

        Args:
            mode: Modo del webhook (debe ser "subscribe")
            token: Token enviado por WhatsApp
            challenge: Challenge enviado por WhatsApp
            verify_token: Token de verificación configurado en tu app

        Returns:
            El challenge si la verificación es exitosa, None si falla
        """

        if mode == "subscribe" and token == verify_token:
            logger.info("Webhook verificado exitosamente")
            return challenge
        else:
            logger.warning(f"Verificación de webhook falló. Mode: {mode}, Token válido: {token == verify_token}")
            return None

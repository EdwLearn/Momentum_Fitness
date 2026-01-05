"""
Servicio para interactuar con la API de WhatsApp Business.
Maneja el envío de mensajes y la gestión de templates.
"""

import httpx
import logging
from typing import Optional, Dict, Any
from datetime import datetime
from sqlalchemy.orm import Session

from app.core.config import settings
from app.modules.whatsapp.models.mensaje_whatsapp import (
    MensajeWhatsApp,
    EstadoMensaje,
    TipoMensaje
)

logger = logging.getLogger(__name__)


class WhatsAppService:
    """
    Servicio para enviar mensajes a través de WhatsApp Business API.
    """

    def __init__(self):
        self.api_url = f"https://graph.facebook.com/v18.0/{settings.WHATSAPP_PHONE_NUMBER_ID}/messages"
        self.token = settings.WHATSAPP_ACCESS_TOKEN
        self.headers = {
            "Authorization": f"Bearer {self.token}",
            "Content-Type": "application/json"
        }

    async def enviar_mensaje_texto(
        self,
        db: Session,
        telefono_destino: str,
        mensaje: str,
        usuario_id: Optional[int] = None,
        conversacion_id: Optional[int] = None,
        sesion_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Envía un mensaje de texto a través de WhatsApp.

        Args:
            db: Sesión de base de datos
            telefono_destino: Número de teléfono del destinatario (formato: +573001234567)
            mensaje: Contenido del mensaje
            usuario_id: ID del usuario en la base de datos (opcional)
            conversacion_id: ID de la conversación relacionada (opcional)
            sesion_id: ID de sesión para agrupar mensajes (opcional)

        Returns:
            Dict con el resultado del envío
        """

        # Limpiar el número de teléfono (asegurar formato correcto)
        telefono_limpio = self._limpiar_telefono(telefono_destino)

        # Crear registro en la BD antes de enviar
        mensaje_db = MensajeWhatsApp(
            telefono_usuario=telefono_limpio,
            usuario_id=usuario_id,
            es_saliente=True,
            tipo_mensaje=TipoMensaje.TEXT,
            contenido=mensaje,
            estado=EstadoMensaje.PENDING,
            sesion_id=sesion_id,
            conversacion_id=conversacion_id
        )
        db.add(mensaje_db)
        db.commit()
        db.refresh(mensaje_db)

        # Payload para WhatsApp API
        payload = {
            "messaging_product": "whatsapp",
            "recipient_type": "individual",
            "to": telefono_limpio,
            "type": "text",
            "text": {
                "preview_url": False,
                "body": mensaje
            }
        }

        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    self.api_url,
                    headers=self.headers,
                    json=payload,
                    timeout=10.0
                )

                response.raise_for_status()
                data = response.json()

                # Actualizar el registro con el ID de WhatsApp
                if "messages" in data and len(data["messages"]) > 0:
                    whatsapp_message_id = data["messages"][0]["id"]
                    mensaje_db.whatsapp_message_id = whatsapp_message_id
                    mensaje_db.estado = EstadoMensaje.SENT
                    mensaje_db.fecha_enviado = datetime.utcnow()
                    db.commit()

                    logger.info(f"Mensaje enviado exitosamente a {telefono_limpio} - ID: {whatsapp_message_id}")

                    return {
                        "success": True,
                        "message_id": whatsapp_message_id,
                        "timestamp": datetime.utcnow().isoformat()
                    }

        except httpx.HTTPStatusError as e:
            error_msg = f"Error HTTP al enviar mensaje: {e.response.status_code} - {e.response.text}"
            logger.error(error_msg)

            mensaje_db.estado = EstadoMensaje.FAILED
            mensaje_db.error_mensaje = error_msg
            db.commit()

            return {
                "success": False,
                "error": error_msg
            }

        except Exception as e:
            error_msg = f"Error inesperado al enviar mensaje: {str(e)}"
            logger.error(error_msg)

            mensaje_db.estado = EstadoMensaje.FAILED
            mensaje_db.error_mensaje = error_msg
            db.commit()

            return {
                "success": False,
                "error": error_msg
            }

    async def enviar_template(
        self,
        db: Session,
        telefono_destino: str,
        template_name: str,
        template_params: Optional[list] = None,
        usuario_id: Optional[int] = None
    ) -> Dict[str, Any]:
        """
        Envía un mensaje usando un template pre-aprobado de WhatsApp.

        Los templates son útiles para mensajes de bienvenida, confirmaciones, etc.
        Deben estar pre-aprobados en Meta Business Manager.

        Args:
            db: Sesión de base de datos
            telefono_destino: Número de teléfono del destinatario
            template_name: Nombre del template aprobado
            template_params: Lista de parámetros para el template
            usuario_id: ID del usuario (opcional)

        Returns:
            Dict con el resultado del envío
        """

        telefono_limpio = self._limpiar_telefono(telefono_destino)

        # Construir componentes del template
        components = []
        if template_params:
            parameters = [{"type": "text", "text": param} for param in template_params]
            components.append({
                "type": "body",
                "parameters": parameters
            })

        payload = {
            "messaging_product": "whatsapp",
            "to": telefono_limpio,
            "type": "template",
            "template": {
                "name": template_name,
                "language": {
                    "code": "es"  # Español
                },
                "components": components
            }
        }

        # Crear registro en BD
        mensaje_db = MensajeWhatsApp(
            telefono_usuario=telefono_limpio,
            usuario_id=usuario_id,
            es_saliente=True,
            tipo_mensaje=TipoMensaje.TEMPLATE,
            contenido=f"Template: {template_name}",
            estado=EstadoMensaje.PENDING
        )
        db.add(mensaje_db)
        db.commit()
        db.refresh(mensaje_db)

        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    self.api_url,
                    headers=self.headers,
                    json=payload,
                    timeout=10.0
                )

                response.raise_for_status()
                data = response.json()

                if "messages" in data and len(data["messages"]) > 0:
                    whatsapp_message_id = data["messages"][0]["id"]
                    mensaje_db.whatsapp_message_id = whatsapp_message_id
                    mensaje_db.estado = EstadoMensaje.SENT
                    mensaje_db.fecha_enviado = datetime.utcnow()
                    db.commit()

                    logger.info(f"Template '{template_name}' enviado a {telefono_limpio}")

                    return {
                        "success": True,
                        "message_id": whatsapp_message_id,
                        "timestamp": datetime.utcnow().isoformat()
                    }

        except Exception as e:
            error_msg = f"Error al enviar template: {str(e)}"
            logger.error(error_msg)

            mensaje_db.estado = EstadoMensaje.FAILED
            mensaje_db.error_mensaje = error_msg
            db.commit()

            return {
                "success": False,
                "error": error_msg
            }

    def actualizar_estado_mensaje(
        self,
        db: Session,
        whatsapp_message_id: str,
        nuevo_estado: EstadoMensaje,
        error_mensaje: Optional[str] = None
    ):
        """
        Actualiza el estado de un mensaje basado en los webhooks de WhatsApp.

        Args:
            db: Sesión de base de datos
            whatsapp_message_id: ID del mensaje de WhatsApp
            nuevo_estado: Nuevo estado del mensaje
            error_mensaje: Mensaje de error si aplica
        """

        mensaje = db.query(MensajeWhatsApp).filter(
            MensajeWhatsApp.whatsapp_message_id == whatsapp_message_id
        ).first()

        if not mensaje:
            logger.warning(f"Mensaje con ID {whatsapp_message_id} no encontrado en BD")
            return

        mensaje.estado = nuevo_estado

        if nuevo_estado == EstadoMensaje.DELIVERED:
            mensaje.fecha_entregado = datetime.utcnow()
        elif nuevo_estado == EstadoMensaje.READ:
            mensaje.fecha_leido = datetime.utcnow()
        elif nuevo_estado == EstadoMensaje.FAILED:
            mensaje.error_mensaje = error_mensaje

        db.commit()
        logger.info(f"Estado del mensaje {whatsapp_message_id} actualizado a {nuevo_estado}")

    def _limpiar_telefono(self, telefono: str) -> str:
        """
        Limpia y formatea el número de teléfono para WhatsApp.

        WhatsApp espera formato: +573001234567 (código país + número sin espacios)

        Args:
            telefono: Número de teléfono en cualquier formato

        Returns:
            Número limpio en formato WhatsApp
        """

        # Eliminar espacios, guiones y paréntesis
        telefono_limpio = telefono.replace(" ", "").replace("-", "").replace("(", "").replace(")", "")

        # Asegurar que empiece con +
        if not telefono_limpio.startswith("+"):
            # Asumir que es Colombia (+57) si no tiene código de país
            if telefono_limpio.startswith("57"):
                telefono_limpio = "+" + telefono_limpio
            else:
                telefono_limpio = "+57" + telefono_limpio

        return telefono_limpio

    async def enviar_imagen(
        self,
        db: Session,
        telefono_destino: str,
        imagen_url: str,
        caption: Optional[str] = None,
        usuario_id: Optional[int] = None
    ) -> Dict[str, Any]:
        """
        Envía una imagen a través de WhatsApp.

        Args:
            db: Sesión de base de datos
            telefono_destino: Número de teléfono del destinatario
            imagen_url: URL pública de la imagen
            caption: Texto descriptivo de la imagen (opcional)
            usuario_id: ID del usuario (opcional)

        Returns:
            Dict con el resultado del envío
        """

        telefono_limpio = self._limpiar_telefono(telefono_destino)

        payload = {
            "messaging_product": "whatsapp",
            "to": telefono_limpio,
            "type": "image",
            "image": {
                "link": imagen_url
            }
        }

        if caption:
            payload["image"]["caption"] = caption

        # Crear registro en BD
        mensaje_db = MensajeWhatsApp(
            telefono_usuario=telefono_limpio,
            usuario_id=usuario_id,
            es_saliente=True,
            tipo_mensaje=TipoMensaje.IMAGE,
            contenido=caption or "Imagen",
            media_url=imagen_url,
            estado=EstadoMensaje.PENDING
        )
        db.add(mensaje_db)
        db.commit()
        db.refresh(mensaje_db)

        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    self.api_url,
                    headers=self.headers,
                    json=payload,
                    timeout=15.0
                )

                response.raise_for_status()
                data = response.json()

                if "messages" in data and len(data["messages"]) > 0:
                    whatsapp_message_id = data["messages"][0]["id"]
                    mensaje_db.whatsapp_message_id = whatsapp_message_id
                    mensaje_db.estado = EstadoMensaje.SENT
                    mensaje_db.fecha_enviado = datetime.utcnow()
                    db.commit()

                    return {
                        "success": True,
                        "message_id": whatsapp_message_id,
                        "timestamp": datetime.utcnow().isoformat()
                    }

        except Exception as e:
            error_msg = f"Error al enviar imagen: {str(e)}"
            logger.error(error_msg)

            mensaje_db.estado = EstadoMensaje.FAILED
            mensaje_db.error_mensaje = error_msg
            db.commit()

            return {
                "success": False,
                "error": error_msg
            }

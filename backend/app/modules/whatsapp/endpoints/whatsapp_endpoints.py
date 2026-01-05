"""
Endpoints para la integración con WhatsApp Business API.
Maneja webhooks y envío de mensajes.
"""

from fastapi import APIRouter, Depends, HTTPException, Request, Query, status
from sqlalchemy.orm import Session
from typing import Dict, Any
import logging

from app.core.database import get_db
from app.core.config import settings
from app.modules.whatsapp.services.whatsapp_service import WhatsAppService
from app.modules.whatsapp.services.webhook_handler import WhatsAppWebhookHandler
from app.modules.whatsapp.schemas.whatsapp_schemas import (
    WhatsAppOutgoingMessage,
    WhatsAppMessageResponse
)

router = APIRouter()
logger = logging.getLogger(__name__)


@router.get("/webhook", status_code=status.HTTP_200_OK)
async def verificar_webhook(
    request: Request,
    hub_mode: str = Query(None, alias="hub.mode"),
    hub_verify_token: str = Query(None, alias="hub.verify_token"),
    hub_challenge: str = Query(None, alias="hub.challenge")
):
    """
    Endpoint de verificación del webhook de WhatsApp.

    WhatsApp llama a este endpoint cuando configuras el webhook por primera vez
    para verificar que tu servidor es legítimo.

    Query params:
    - hub.mode: Debe ser "subscribe"
    - hub.verify_token: Token que configuraste en Meta Developer Console
    - hub.challenge: String que debes devolver para verificar

    Returns:
        El challenge string si la verificación es exitosa
    """

    logger.info(f"Verificación de webhook recibida - Mode: {hub_mode}")

    if not all([hub_mode, hub_verify_token, hub_challenge]):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Parámetros de verificación faltantes"
        )

    # Verificar el token
    if hub_mode == "subscribe" and hub_verify_token == settings.WHATSAPP_VERIFY_TOKEN:
        logger.info("✅ Webhook verificado exitosamente")
        # WhatsApp espera que devolvamos el challenge como plain text
        return int(hub_challenge)
    else:
        logger.error("❌ Token de verificación inválido")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Token de verificación inválido"
        )


@router.post("/webhook", status_code=status.HTTP_200_OK)
async def recibir_webhook(
    request: Request,
    db: Session = Depends(get_db)
):
    """
    Endpoint para recibir webhooks de WhatsApp.

    WhatsApp envía webhooks aquí cuando:
    - Recibes un mensaje de un usuario
    - Un mensaje cambia de estado (enviado, entregado, leído)

    Returns:
        200 OK para confirmar recepción
    """

    try:
        # Obtener el payload JSON
        payload = await request.json()

        logger.info(f"Webhook recibido de WhatsApp: {payload.get('object', 'unknown')}")

        # Procesar el webhook
        handler = WhatsAppWebhookHandler(db)
        resultado = await handler.procesar_webhook(payload)

        if resultado["success"]:
            logger.info(f"✅ Webhook procesado: {resultado.get('message', 'OK')}")
        else:
            logger.error(f"❌ Error al procesar webhook: {resultado.get('error')}")

        # Siempre devolver 200 OK para que WhatsApp no reintente
        return {"status": "ok"}

    except Exception as e:
        logger.error(f"Error crítico en webhook: {str(e)}", exc_info=True)
        # Aún así devolver 200 para evitar reintentos infinitos
        return {"status": "error", "message": str(e)}


@router.post("/send", response_model=WhatsAppMessageResponse, status_code=status.HTTP_200_OK)
async def enviar_mensaje(
    mensaje: WhatsAppOutgoingMessage,
    db: Session = Depends(get_db)
):
    """
    Endpoint para enviar mensajes a través de WhatsApp (uso interno/admin).

    Body:
    - to: Número de teléfono destino (+573001234567)
    - type: Tipo de mensaje (text, image, template)
    - text: Contenido del mensaje (si es texto)
    - media_url: URL del archivo multimedia (si es imagen/video/etc)
    - template_name: Nombre del template (si es template)
    - template_params: Parámetros del template

    Returns:
        Información sobre el envío del mensaje
    """

    try:
        whatsapp_service = WhatsAppService()

        # Enviar según el tipo de mensaje
        if mensaje.type == "text":
            if not mensaje.text:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="El campo 'text' es requerido para mensajes de texto"
                )

            resultado = await whatsapp_service.enviar_mensaje_texto(
                db=db,
                telefono_destino=mensaje.to,
                mensaje=mensaje.text
            )

        elif mensaje.type == "image":
            if not mensaje.media_url:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="El campo 'media_url' es requerido para imágenes"
                )

            resultado = await whatsapp_service.enviar_imagen(
                db=db,
                telefono_destino=mensaje.to,
                imagen_url=mensaje.media_url,
                caption=mensaje.text
            )

        elif mensaje.type == "template":
            if not mensaje.template_name:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="El campo 'template_name' es requerido para templates"
                )

            resultado = await whatsapp_service.enviar_template(
                db=db,
                telefono_destino=mensaje.to,
                template_name=mensaje.template_name,
                template_params=mensaje.template_params
            )

        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Tipo de mensaje no soportado: {mensaje.type}"
            )

        return WhatsAppMessageResponse(**resultado)

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error al enviar mensaje: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al enviar mensaje: {str(e)}"
        )


@router.get("/health", status_code=status.HTTP_200_OK)
async def health_check():
    """
    Endpoint de health check para verificar que el servicio de WhatsApp está funcionando.
    """

    return {
        "status": "healthy",
        "service": "whatsapp",
        "whatsapp_configured": bool(
            settings.WHATSAPP_ACCESS_TOKEN and
            settings.WHATSAPP_PHONE_NUMBER_ID
        )
    }

"""Schemas de WhatsApp"""
from app.modules.whatsapp.schemas.whatsapp_schemas import (
    WhatsAppWebhookVerification,
    WhatsAppIncomingMessage,
    WhatsAppOutgoingMessage,
    WhatsAppStatusUpdate,
    WhatsAppMessageResponse
)

__all__ = [
    "WhatsAppWebhookVerification",
    "WhatsAppIncomingMessage",
    "WhatsAppOutgoingMessage",
    "WhatsAppStatusUpdate",
    "WhatsAppMessageResponse"
]

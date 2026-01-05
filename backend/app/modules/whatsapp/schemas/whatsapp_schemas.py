from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List
from datetime import datetime
from enum import Enum


class MessageType(str, Enum):
    """Tipos de mensaje soportados"""
    text = "text"
    image = "image"
    document = "document"
    audio = "audio"
    video = "video"
    template = "template"


class WhatsAppWebhookVerification(BaseModel):
    """Schema para la verificación del webhook de WhatsApp"""
    hub_mode: str = Field(..., alias="hub.mode")
    hub_verify_token: str = Field(..., alias="hub.verify_token")
    hub_challenge: str = Field(..., alias="hub.challenge")

    class Config:
        populate_by_name = True


class WhatsAppIncomingMessage(BaseModel):
    """Schema para mensajes entrantes de WhatsApp"""
    from_number: str  # Número del remitente
    message_id: str  # ID del mensaje de WhatsApp
    timestamp: str  # Timestamp del mensaje
    type: MessageType  # Tipo de mensaje
    text: Optional[str] = None  # Contenido de texto
    media_url: Optional[str] = None  # URL de media si aplica
    media_id: Optional[str] = None  # ID de media de WhatsApp
    name: Optional[str] = None  # Nombre del contacto


class WhatsAppOutgoingMessage(BaseModel):
    """Schema para enviar mensajes a través de WhatsApp"""
    to: str  # Número de destino (formato: +573001234567)
    type: MessageType = MessageType.text
    text: Optional[str] = None  # Contenido si es texto
    media_url: Optional[str] = None  # URL de media si aplica
    template_name: Optional[str] = None  # Nombre del template si es template
    template_params: Optional[List[str]] = None  # Parámetros del template


class WhatsAppStatusUpdate(BaseModel):
    """Schema para actualizaciones de estado de mensajes"""
    message_id: str  # ID del mensaje de WhatsApp
    status: str  # sent, delivered, read, failed
    timestamp: str
    error_message: Optional[str] = None


class WhatsAppMessageResponse(BaseModel):
    """Respuesta después de enviar un mensaje"""
    success: bool
    message_id: Optional[str] = None
    error: Optional[str] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)


class WhatsAppWebhookPayload(BaseModel):
    """Payload completo del webhook de WhatsApp"""
    object: str
    entry: List[Dict[str, Any]]

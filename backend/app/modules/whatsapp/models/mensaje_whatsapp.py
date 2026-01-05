from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, Boolean, Enum as SQLEnum
from sqlalchemy.orm import relationship
from datetime import datetime
from enum import Enum
from app.core.database import Base


class EstadoMensaje(str, Enum):
    """Estados posibles de un mensaje de WhatsApp"""
    PENDING = "pending"
    SENT = "sent"
    DELIVERED = "delivered"
    READ = "read"
    FAILED = "failed"


class TipoMensaje(str, Enum):
    """Tipos de mensaje soportados"""
    TEXT = "text"
    IMAGE = "image"
    DOCUMENT = "document"
    AUDIO = "audio"
    VIDEO = "video"
    TEMPLATE = "template"


class MensajeWhatsApp(Base):
    """
    Modelo para trackear todos los mensajes de WhatsApp enviados y recibidos.
    """
    __tablename__ = "mensajes_whatsapp"

    id = Column(Integer, primary_key=True, index=True)

    # Identificadores de WhatsApp
    whatsapp_message_id = Column(String, unique=True, nullable=True, index=True)  # ID del mensaje de WhatsApp
    telefono_usuario = Column(String, nullable=False, index=True)  # Número de teléfono del usuario (+573001234567)

    # Relación con usuario (si existe en la BD)
    usuario_id = Column(Integer, ForeignKey("usuarios.id"), nullable=True, index=True)

    # Dirección del mensaje
    es_saliente = Column(Boolean, default=True)  # True = enviado por el bot, False = recibido del usuario

    # Contenido
    tipo_mensaje = Column(SQLEnum(TipoMensaje), default=TipoMensaje.TEXT)
    contenido = Column(Text, nullable=False)
    media_url = Column(String, nullable=True)  # URL del archivo multimedia si aplica

    # Estado (solo para mensajes salientes)
    estado = Column(SQLEnum(EstadoMensaje), default=EstadoMensaje.PENDING)
    error_mensaje = Column(Text, nullable=True)  # Mensaje de error si falla el envío

    # Timestamps
    fecha_creacion = Column(DateTime, default=datetime.utcnow, index=True)
    fecha_enviado = Column(DateTime, nullable=True)
    fecha_entregado = Column(DateTime, nullable=True)
    fecha_leido = Column(DateTime, nullable=True)

    # Contexto
    sesion_id = Column(String, nullable=True, index=True)  # Para agrupar conversaciones
    conversacion_id = Column(Integer, ForeignKey("conversaciones.id"), nullable=True)  # Referencia a la conversación del bot

    # Relaciones
    usuario = relationship("Usuario", back_populates="mensajes_whatsapp")
    conversacion = relationship("Conversacion", backref="mensajes_whatsapp")

    def __repr__(self):
        return f"<MensajeWhatsApp {self.id} - {self.telefono_usuario} - {self.estado}>"

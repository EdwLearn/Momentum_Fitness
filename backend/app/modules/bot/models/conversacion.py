from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base

class Conversacion(Base):
    __tablename__ = "conversaciones"

    id = Column(Integer, primary_key=True, index=True)
    usuario_id = Column(Integer, ForeignKey("usuarios.id"), nullable=False, index=True)

    # Contenido del mensaje
    mensaje_usuario = Column(Text, nullable=False)
    respuesta_bot = Column(Text, nullable=False)

    # Metadatos
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    sesion_id = Column(String, nullable=True, index=True)  # Para agrupar conversaciones de una sesión

    # Análisis de sentimiento (opcional)
    sentimiento = Column(String, nullable=True)  # positivo, neutral, negativo

    # Si fue un mensaje automático (trigger)
    es_trigger = Column(Boolean, default=False)
    tipo_trigger = Column(String, nullable=True)  # racha, peso, inactividad, logro

    # Tracking de respuestas
    fue_respondido = Column(Boolean, default=False)
    fecha_respuesta = Column(DateTime, nullable=True)

    # Relación
    usuario = relationship("Usuario", back_populates="conversaciones")

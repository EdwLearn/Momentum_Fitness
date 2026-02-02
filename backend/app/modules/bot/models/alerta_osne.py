from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, CheckConstraint, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base

class AlertaOsne(Base):
    __tablename__ = "alertas_osne"

    id = Column(Integer, primary_key=True, autoincrement=True)
    usuario_id = Column(Integer, ForeignKey("usuarios.id", ondelete="CASCADE"), nullable=False, index=True)

    # Clasificación de la alerta
    tipo_alerta = Column(String, nullable=False, index=True)  # 'urgente', 'oportunidad', 'seguimiento'
    prioridad = Column(Integer, nullable=False, index=True)  # 1-5, donde 1 es más urgente

    # Qué pasó y qué hacer
    razon = Column(Text, nullable=False)
    accion_sugerida = Column(String, nullable=False)  # 'audio_reconexion', 'audio_celebracion', etc

    # Contexto para Osne
    contexto_json = Column(Text)  # JSON con todo el análisis del LLM
    puntos_clave = Column(Text)  # Array como string: "Meta boda|Venía constante|Respondió positivo"

    # Estado
    estado = Column(String, default='pendiente', index=True)  # 'pendiente', 'atendida', 'descartada'
    fecha_atencion = Column(DateTime, nullable=True)
    notas_osne = Column(Text, nullable=True)  # Lo que hiciste
    resultado = Column(String, nullable=True)  # 'reactivado', 'upgrade', 'canceló', etc

    timestamp = Column(DateTime, default=datetime.utcnow)

    __table_args__ = (
        CheckConstraint('prioridad BETWEEN 1 AND 5', name='check_prioridad'),
    )

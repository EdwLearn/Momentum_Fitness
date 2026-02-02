from sqlalchemy import Column, Integer, Float, DateTime, ForeignKey, Date
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base

class MetricasUsuario(Base):
    __tablename__ = "metricas_usuario"

    usuario_id = Column(Integer, ForeignKey("usuarios.id", ondelete="CASCADE"), primary_key=True)

    # Asistencia
    racha_actual = Column(Integer, default=0)
    racha_maxima = Column(Integer, default=0)
    total_asistencias = Column(Integer, default=0)
    asistencias_mes = Column(Integer, default=0)
    dias_desde_ultima_visita = Column(Integer, nullable=True)
    ultima_asistencia = Column(Date, nullable=True)

    # Peso
    peso_inicial = Column(Float, nullable=True)
    cambio_peso_total = Column(Float, nullable=True)
    cambio_peso_mes = Column(Float, nullable=True)
    semanas_sin_cambio_peso = Column(Integer, default=0)

    # Engagement con bot
    total_mensajes_recibidos = Column(Integer, default=0)
    total_mensajes_respondidos = Column(Integer, default=0)
    tasa_respuesta = Column(Float, nullable=True)  # 0.0 a 1.0
    ultima_respuesta = Column(Date, nullable=True)

    # Alertas generadas
    total_alertas = Column(Integer, default=0)
    ultima_alerta = Column(Date, nullable=True)
    ultima_intervencion_osne = Column(Date, nullable=True)

    # Última actualización
    actualizado_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

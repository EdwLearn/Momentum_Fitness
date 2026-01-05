from sqlalchemy import Column, Integer, String, Boolean, DateTime, CheckConstraint
from datetime import datetime
from app.core.database import Base

class ConfigSistema(Base):
    __tablename__ = "config_sistema"

    id = Column(Integer, primary_key=True, default=1)

    # Modo operación
    modo = Column(String, default='balanceado')  # 'conservador', 'balanceado', 'proactivo'

    # Límites mensajes automáticos
    max_mensajes_auto_semana = Column(Integer, default=1)
    dias_entre_mensajes = Column(Integer, default=7)

    # Umbrales para triggers
    dias_ausencia_urgente = Column(Integer, default=7)
    dias_ausencia_seguimiento = Column(Integer, default=3)
    rachas_notificar = Column(String, default='7,30,60,90,180')  # Como string separado por comas
    semanas_peso_estancado = Column(Integer, default=3)

    # Notificaciones a osne
    telefono_osne = Column(String, nullable=True)
    notificar_urgentes = Column(Boolean, default=True)
    notificar_oportunidades = Column(Boolean, default=True)
    notificar_seguimientos = Column(Boolean, default=False)

    # Horarios (almacenados como VARCHAR en formato HH:MM:SS)
    hora_analisis_diario = Column(String(8), default='08:00:00')
    no_enviar_antes = Column(String(8), default='08:00:00')
    no_enviar_despues = Column(String(8), default='21:00:00')

    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    __table_args__ = (
        CheckConstraint('id = 1', name='check_single_row'),
    )

from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Time, Date
from sqlalchemy.orm import relationship
from datetime import datetime, timezone, timedelta
from app.core.database import Base

# Timezone de Colombia (UTC-5)
COLOMBIA_TZ = timezone(timedelta(hours=-5))

def get_colombia_now():
    """Retorna la hora actual en timezone de Colombia"""
    return datetime.now(COLOMBIA_TZ)

def get_colombia_date():
    """Retorna la fecha actual en timezone de Colombia"""
    return datetime.now(COLOMBIA_TZ).date()

class Asistencia(Base):
    __tablename__ = "asistencias"

    id = Column(Integer, primary_key=True, index=True)
    usuario_id = Column(Integer, ForeignKey("usuarios.id"), nullable=False, index=True)

    # Fecha y hora (usar hora local de Colombia)
    fecha = Column(Date, default=get_colombia_date, index=True)
    hora_entrada = Column(Time, nullable=False)
    hora_salida = Column(Time, nullable=True)
    timestamp_entrada = Column(DateTime, default=get_colombia_now)
    timestamp_salida = Column(DateTime, nullable=True)

    # Notas
    notas = Column(String, nullable=True)

    # Relación
    usuario = relationship("Usuario", back_populates="asistencias")

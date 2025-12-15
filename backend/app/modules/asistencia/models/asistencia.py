from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Time, Date
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base

class Asistencia(Base):
    __tablename__ = "asistencias"

    id = Column(Integer, primary_key=True, index=True)
    usuario_id = Column(Integer, ForeignKey("usuarios.id"), nullable=False, index=True)

    # Fecha y hora
    fecha = Column(Date, default=datetime.utcnow().date, index=True)
    hora_entrada = Column(Time, nullable=False)
    hora_salida = Column(Time, nullable=True)
    timestamp_entrada = Column(DateTime, default=datetime.utcnow)
    timestamp_salida = Column(DateTime, nullable=True)

    # Notas
    notas = Column(String, nullable=True)

    # Relación
    usuario = relationship("Usuario", back_populates="asistencias")

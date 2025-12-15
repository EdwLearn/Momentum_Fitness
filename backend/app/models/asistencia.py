from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Time
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base

class Asistencia(Base):
    __tablename__ = "asistencias"

    id = Column(Integer, primary_key=True, index=True)
    usuario_id = Column(Integer, ForeignKey("usuarios.id"), nullable=False)
    fecha = Column(DateTime, default=datetime.utcnow, index=True)
    hora_entrada = Column(Time, nullable=False)
    hora_salida = Column(Time, nullable=True)
    notas = Column(String, nullable=True)

    usuario = relationship("Usuario", back_populates="asistencias")

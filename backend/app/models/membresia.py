from sqlalchemy import Column, Integer, String, DateTime, Float, Boolean, ForeignKey, Enum
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from app.core.database import Base

class TipoMembresia(str, enum.Enum):
    MENSUAL = "mensual"
    TRIMESTRAL = "trimestral"
    SEMESTRAL = "semestral"
    ANUAL = "anual"

class EstadoMembresia(str, enum.Enum):
    ACTIVA = "activa"
    VENCIDA = "vencida"
    SUSPENDIDA = "suspendida"
    CANCELADA = "cancelada"

class Membresia(Base):
    __tablename__ = "membresias"

    id = Column(Integer, primary_key=True, index=True)
    usuario_id = Column(Integer, ForeignKey("usuarios.id"), nullable=False)
    tipo = Column(Enum(TipoMembresia), nullable=False)
    estado = Column(Enum(EstadoMembresia), default=EstadoMembresia.ACTIVA)
    fecha_inicio = Column(DateTime, default=datetime.utcnow)
    fecha_fin = Column(DateTime, nullable=False)
    precio = Column(Float, nullable=False)
    descripcion = Column(String, nullable=True)

    usuario = relationship("Usuario", back_populates="membresias")

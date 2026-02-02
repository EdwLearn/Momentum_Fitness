from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Enum, Float, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from app.core.database import Base

class TipoLogro(str, enum.Enum):
    RACHA = "racha"  # Racha de asistencia
    PESO = "peso"  # Cambio de peso significativo
    EJERCICIO = "ejercicio"  # Nuevo récord en ejercicio
    MEMBRESIA = "membresia"  # Renovación de membresía
    ASISTENCIAS = "asistencias"  # Número total de asistencias

class Logro(Base):
    __tablename__ = "logros"

    id = Column(Integer, primary_key=True, index=True)
    usuario_id = Column(Integer, ForeignKey("usuarios.id"), nullable=False, index=True)

    # Tipo de logro
    tipo_logro = Column(Enum(TipoLogro), nullable=False, index=True)

    # Detalles del logro
    titulo = Column(String, nullable=False)  # "7 días consecutivos", "Perdiste 5kg", etc.
    descripcion = Column(String, nullable=True)
    valor = Column(Float, nullable=True)  # días de racha, kg perdidos, etc.

    # Fecha del logro
    fecha = Column(DateTime, default=datetime.utcnow, index=True)

    # Si ya se notificó al usuario
    notificado = Column(Boolean, default=False)

    # Si ya generó alerta para Osne
    genero_alerta = Column(Boolean, default=False)

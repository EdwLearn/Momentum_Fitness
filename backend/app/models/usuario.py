from sqlalchemy import Column, Integer, String, DateTime, Boolean, Enum
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from app.core.database import Base

class TipoUsuario(str, enum.Enum):
    ADMIN = "admin"
    ENTRENADOR = "entrenador"
    CLIENTE = "cliente"

class Usuario(Base):
    __tablename__ = "usuarios"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String, nullable=False)
    apellido = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    telefono = Column(String)
    tipo = Column(Enum(TipoUsuario), default=TipoUsuario.CLIENTE)
    activo = Column(Boolean, default=True)
    fecha_registro = Column(DateTime, default=datetime.utcnow)
    fecha_nacimiento = Column(DateTime, nullable=True)

    membresias = relationship("Membresia", back_populates="usuario")
    asistencias = relationship("Asistencia", back_populates="usuario")
    metricas = relationship("Metrica", back_populates="usuario")

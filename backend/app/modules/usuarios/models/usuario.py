from sqlalchemy import Column, Integer, String, DateTime, Boolean, Enum, Float
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
    tipo = Column(Enum(TipoUsuario, values_callable=lambda x: [e.value for e in x]), default=TipoUsuario.CLIENTE)
    activo = Column(Boolean, default=True)

    # Campo de referido
    referido_por_cedula = Column(String, nullable=True, index=True)

    # Campos específicos del gimnasio
    peso_inicial = Column(Float, nullable=True)
    peso_actual = Column(Float, nullable=True)
    altura = Column(Float, nullable=True)
    objetivo = Column(String, nullable=True)  # Objetivos fitness del cliente
    genero = Column(String, nullable=True)    # Masculino/Femenino

    # Fechas
    fecha_registro = Column(DateTime, default=datetime.utcnow, index=True)
    fecha_nacimiento = Column(DateTime, nullable=True)
    ultima_asistencia = Column(DateTime, nullable=True)

    # Relaciones
    membresias = relationship("Membresia", foreign_keys="[Membresia.usuario_id]", back_populates="usuario", cascade="all, delete-orphan")
    asistencias = relationship("Asistencia", back_populates="usuario", cascade="all, delete-orphan")
    metricas = relationship("Metrica", back_populates="usuario", cascade="all, delete-orphan")
    conversaciones = relationship("Conversacion", back_populates="usuario", cascade="all, delete-orphan")
    logros = relationship("Logro", back_populates="usuario", cascade="all, delete-orphan")

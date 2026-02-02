from sqlalchemy import Column, Integer, String, DateTime, Boolean, Enum, Float
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from app.core.database import Base

class TipoUsuario(str, enum.Enum):
    ADMIN = "admin"
    ENTRENADOR = "entrenador"
    CLIENTE = "usuario"

class Usuario(Base):
    __tablename__ = "usuarios"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String, nullable=False)
    apellido = Column(String, nullable=False)
    cedula = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    telefono = Column(String)
    tipo = Column(Enum(TipoUsuario, values_callable=lambda x: [e.value for e in x]), default=TipoUsuario.CLIENTE)
    activo = Column(Boolean, default=False)  # Por defecto False, se activa al crear membresía

    # Campo de referido
    referido_por_cedula = Column(String, nullable=True, index=True)

    # Campos específicos del gimnasio
    peso_inicial = Column(Float, nullable=True)
    peso_actual = Column(Float, nullable=True)
    altura = Column(Float, nullable=True)
    objetivo = Column(String, nullable=True)  # Objetivos fitness del usuario
    genero = Column(String, nullable=True)    # Masculino/Femenino
    dias_entrenados = Column(Integer, default=0, nullable=False)  # Contador de días que ha asistido al gimnasio

    # Fechas
    fecha_registro = Column(DateTime, default=datetime.utcnow, index=True)
    fecha_nacimiento = Column(DateTime, nullable=True)
    ultima_asistencia = Column(DateTime, nullable=True)

    # Relaciones
    membresias = relationship("Membresia", foreign_keys="[Membresia.usuario_id]", back_populates="usuario", cascade="all, delete-orphan")
    asistencias = relationship("Asistencia", back_populates="usuario", cascade="all, delete-orphan")
    mediciones = relationship("Metrica", back_populates="usuario", cascade="all, delete-orphan")

    # Relaciones del bot (DESACTIVADAS)
    # metricas = relationship("MetricasUsuario", back_populates="usuario", uselist=False, cascade="all, delete-orphan")
    # conversaciones = relationship("Conversacion", back_populates="usuario", cascade="all, delete-orphan")
    # logros = relationship("Logro", back_populates="usuario", cascade="all, delete-orphan")
    # alertas_osne = relationship("AlertaOsne", back_populates="usuario", cascade="all, delete-orphan")
    # mensajes_whatsapp = relationship("MensajeWhatsApp", back_populates="usuario", cascade="all, delete-orphan")

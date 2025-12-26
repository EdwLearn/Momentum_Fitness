from sqlalchemy import Column, Integer, String, Float, Date, DateTime, Text, Enum as SQLEnum
from sqlalchemy.orm import relationship
from datetime import datetime
import enum

from app.core.database import Base


class TipoEmpleado(str, enum.Enum):
    ENTRENADOR = "entrenador"
    RECEPCION = "recepcion"


class Empleado(Base):
    __tablename__ = "empleados"

    id = Column(Integer, primary_key=True, index=True)

    # Datos personales
    nombre = Column(String(100), nullable=False)
    apellido = Column(String(100))
    cedula = Column(String(50), unique=True, nullable=False, index=True)
    email = Column(String(255))
    telefono = Column(String(50))
    fecha_nacimiento = Column(Date, nullable=True)
    genero = Column(String(20), nullable=True)
    direccion = Column(Text, nullable=True)

    # Datos laborales
    tipo_empleado = Column(SQLEnum(TipoEmpleado), nullable=False, default=TipoEmpleado.ENTRENADOR)
    fecha_contratacion = Column(Date, nullable=True)
    salario = Column(Float, nullable=True)
    horario = Column(String(100), nullable=True)  # Ej: "8:00 AM - 5:00 PM"
    dias_laborales = Column(String(100), nullable=True)  # Ej: "Lunes-Viernes"

    # Contacto de emergencia
    emergencia_nombre = Column(String(100), nullable=True)
    emergencia_telefono = Column(String(50), nullable=True)
    emergencia_relacion = Column(String(50), nullable=True)

    # Metadata
    fecha_registro = Column(DateTime, default=datetime.utcnow)
    # Estados: -1 = sin entrada (inicio del día), 0 = inactivo (después de marcar salida), 1 = activo (después de marcar entrada)
    activo = Column(Integer, default=-1)

    # Relaciones
    asistencias = relationship("AsistenciaEmpleado", back_populates="empleado", cascade="all, delete-orphan")

from sqlalchemy import Column, Integer, String, Date, Time, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime

from app.core.database import Base


class AsistenciaEmpleado(Base):
    __tablename__ = "asistencias_empleados"

    id = Column(Integer, primary_key=True, index=True)
    empleado_id = Column(Integer, ForeignKey("empleados.id", ondelete="CASCADE"), nullable=False)
    fecha = Column(Date, nullable=False, index=True)
    hora_entrada = Column(Time, nullable=True)
    hora_salida = Column(Time, nullable=True)
    horas_trabajadas = Column(Float, nullable=True)  # Calculado automáticamente

    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relaciones
    empleado = relationship("Empleado", back_populates="asistencias")

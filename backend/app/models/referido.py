from sqlalchemy import Column, Integer, String, DateTime, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base


class Referido(Base):
    __tablename__ = "referidos"

    id = Column(Integer, primary_key=True, index=True)

    # Relaciones con usuarios
    referidor_id = Column(Integer, ForeignKey("usuarios.id"), nullable=False, index=True)
    referido_id = Column(Integer, ForeignKey("usuarios.id"), nullable=False, index=True)

    # Membresía asociada (el plan que compró el referido)
    membresia_id = Column(Integer, ForeignKey("membresias.id"), nullable=True, index=True)

    # Estado del referido
    cumple_condicion = Column(Boolean, default=False, nullable=False)
    beneficio = Column(String, nullable=True)  # Ej: "1 mes gratis", "15% descuento", "Pendiente"

    # Fechas
    fecha_referido = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    fecha_activacion = Column(DateTime, nullable=True)  # Cuando se activó el beneficio

    # Relaciones
    referidor = relationship("Usuario", foreign_keys=[referidor_id], backref="referidos_hechos")
    referido = relationship("Usuario", foreign_keys=[referido_id], backref="referidos_recibidos")
    membresia = relationship("Membresia", foreign_keys=[membresia_id])

    def activar_beneficio(self, tipo_beneficio: str):
        """Activa el beneficio para el referidor"""
        self.cumple_condicion = True
        self.beneficio = tipo_beneficio
        self.fecha_activacion = datetime.utcnow()

    def esta_pendiente(self) -> bool:
        """Verifica si el referido está pendiente de activación"""
        return not self.cumple_condicion and (self.beneficio == "Pendiente" or self.beneficio is None)

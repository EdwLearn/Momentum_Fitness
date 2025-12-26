from sqlalchemy import Column, Integer, String, DateTime, Boolean, Enum, CheckConstraint
from datetime import datetime
import enum
from app.core.database import Base


class NichoCupon(str, enum.Enum):
    """Nichos de cupones disponibles"""
    ALIMENTICIO = "Alimenticio"
    ESTETICO = "Estético"


class Cupon(Base):
    __tablename__ = "cupones"

    id = Column(Integer, primary_key=True, index=True)

    # Información del cupón
    codigo = Column(String, unique=True, nullable=False, index=True)
    nicho = Column(
        Enum(NichoCupon, values_callable=lambda x: [e.value for e in x]),
        nullable=False,
        index=True
    )
    descuento = Column(Integer, nullable=False)  # Porcentaje de descuento (1-100)

    # Estadísticas de uso
    usos_total = Column(Integer, default=0, nullable=False)
    usos_anio = Column(Integer, default=0, nullable=False)

    # Estado
    activo = Column(Boolean, default=True, nullable=False, index=True)

    # Fechas
    fecha_creacion = Column(DateTime, default=datetime.utcnow, nullable=False)
    fecha_expiracion = Column(DateTime, nullable=True)

    # Constraints - Descuento máximo 20% según reglas de negocio
    # (Los cupones NO son acumulables con descuentos por referido)
    __table_args__ = (
        CheckConstraint('descuento > 0 AND descuento <= 20', name='check_descuento_valido'),
        CheckConstraint('usos_total >= 0', name='check_usos_total_positivo'),
        CheckConstraint('usos_anio >= 0', name='check_usos_anio_positivo'),
    )

    def esta_vigente(self) -> bool:
        """Verifica si el cupón está vigente (activo y no expirado)"""
        if not self.activo:
            return False
        if self.fecha_expiracion:
            return self.fecha_expiracion >= datetime.utcnow()
        return True

    def incrementar_uso(self):
        """Incrementa los contadores de uso"""
        self.usos_total += 1
        self.usos_anio += 1

from sqlalchemy import Column, Integer, String, Date, DateTime, Enum as SQLEnum
from sqlalchemy.orm import relationship
from datetime import datetime
import enum

from app.core.database import Base


class TipoMovimiento(str, enum.Enum):
    INGRESO = "ingreso"
    EGRESO = "egreso"


class CategoriaMovimiento(str, enum.Enum):
    MEMBRESIAS = "Membresías"
    SERVICIOS = "Servicios"
    ARRIENDO = "Arriendo"
    NOMINA = "Nómina"
    EQUIPOS = "Equipos"
    SERVICIOS_PUBLICOS = "Servicios públicos"
    MARKETING = "Marketing"
    OTRO = "Otro"


class MovimientoFinanciero(Base):
    __tablename__ = "movimientos_financieros"

    id = Column(Integer, primary_key=True, index=True)
    tipo = Column(SQLEnum(TipoMovimiento), nullable=False)
    descripcion = Column(String(255), nullable=False)
    monto = Column(Integer, nullable=False)
    categoria = Column(SQLEnum(CategoriaMovimiento), nullable=False, default=CategoriaMovimiento.OTRO)
    fecha = Column(Date, nullable=False, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)

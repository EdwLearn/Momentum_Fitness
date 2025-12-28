from sqlalchemy import Column, Integer, String, DateTime, Enum, Text
from sqlalchemy.sql import func
import enum
from app.core.database import Base


class CategoriaTicket(str, enum.Enum):
    """Categorías de tickets de soporte"""
    TECHNICAL = "technical"
    BILLING = "billing"
    FEATURE = "feature"
    OTHER = "other"


class PrioridadTicket(str, enum.Enum):
    """Prioridades de tickets de soporte"""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    URGENT = "urgent"


class EstadoTicket(str, enum.Enum):
    """Estados de tickets de soporte"""
    ABIERTO = "Abierto"
    EN_PROGRESO = "En progreso"
    RESUELTO = "Resuelto"


class TicketSoporte(Base):
    __tablename__ = "tickets_soporte"

    id = Column(Integer, primary_key=True, index=True)

    # Información del ticket
    nombre = Column(String, nullable=False)
    categoria = Column(
        Enum(CategoriaTicket, values_callable=lambda x: [e.value for e in x]),
        nullable=False,
        index=True
    )
    prioridad = Column(
        Enum(PrioridadTicket, values_callable=lambda x: [e.value for e in x]),
        nullable=False,
        index=True
    )
    asunto = Column(String, nullable=False)
    mensaje = Column(Text, nullable=False)

    # Estado
    estado = Column(
        Enum(EstadoTicket, values_callable=lambda x: [e.value for e in x]),
        nullable=False,
        default=EstadoTicket.ABIERTO.value,
        index=True
    )

    # Fechas
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), server_default=func.now())

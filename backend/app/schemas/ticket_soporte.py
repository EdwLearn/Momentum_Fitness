from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class TicketSoporteBase(BaseModel):
    nombre: str
    categoria: str  # "technical", "billing", "feature", "other"
    prioridad: str  # "low", "medium", "high", "urgent"
    asunto: str
    mensaje: str


class TicketSoporteCreate(TicketSoporteBase):
    pass


class TicketSoporteUpdate(BaseModel):
    estado: Optional[str] = None  # "Abierto", "En progreso", "Resuelto"


class TicketSoporte(TicketSoporteBase):
    id: int
    estado: str
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

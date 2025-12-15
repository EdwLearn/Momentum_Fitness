from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from app.models.membresia import TipoMembresia, EstadoMembresia

class MembresiaBase(BaseModel):
    usuario_id: int
    tipo: TipoMembresia
    fecha_fin: datetime
    precio: float
    descripcion: Optional[str] = None

class MembresiaCreate(MembresiaBase):
    pass

class MembresiaUpdate(BaseModel):
    tipo: Optional[TipoMembresia] = None
    estado: Optional[EstadoMembresia] = None
    fecha_fin: Optional[datetime] = None
    precio: Optional[float] = None
    descripcion: Optional[str] = None

class Membresia(MembresiaBase):
    id: int
    estado: EstadoMembresia
    fecha_inicio: datetime

    class Config:
        from_attributes = True

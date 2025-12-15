from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from app.models.metrica import TipoMetrica

class MetricaBase(BaseModel):
    usuario_id: int
    tipo: TipoMetrica
    valor: float
    unidad: str
    notas: Optional[str] = None

class MetricaCreate(MetricaBase):
    pass

class MetricaUpdate(BaseModel):
    valor: Optional[float] = None
    unidad: Optional[str] = None
    notas: Optional[str] = None

class Metrica(MetricaBase):
    id: int
    fecha_registro: datetime

    class Config:
        from_attributes = True

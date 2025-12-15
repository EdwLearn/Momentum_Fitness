from pydantic import BaseModel
from datetime import datetime, time
from typing import Optional

class AsistenciaBase(BaseModel):
    usuario_id: int
    hora_entrada: time
    hora_salida: Optional[time] = None
    notas: Optional[str] = None

class AsistenciaCreate(AsistenciaBase):
    pass

class AsistenciaUpdate(BaseModel):
    hora_salida: Optional[time] = None
    notas: Optional[str] = None

class Asistencia(AsistenciaBase):
    id: int
    fecha: datetime

    class Config:
        from_attributes = True

from pydantic import BaseModel
from typing import Optional
from datetime import date, time, datetime


class AsistenciaEmpleadoBase(BaseModel):
    empleado_id: int
    fecha: date


class AsistenciaEmpleadoCreate(BaseModel):
    empleado_id: int


class MarcarEntrada(BaseModel):
    empleado_id: int
    hora_entrada: Optional[time] = None  # Si no se proporciona, usa hora actual


class MarcarSalida(BaseModel):
    empleado_id: int
    hora_salida: Optional[time] = None  # Si no se proporciona, usa hora actual


class AsistenciaEmpleado(AsistenciaEmpleadoBase):
    id: int
    hora_entrada: Optional[time] = None
    hora_salida: Optional[time] = None
    horas_trabajadas: Optional[float] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class AsistenciaEmpleadoConNombre(AsistenciaEmpleado):
    empleado_nombre: str
    empleado_apellido: Optional[str] = None

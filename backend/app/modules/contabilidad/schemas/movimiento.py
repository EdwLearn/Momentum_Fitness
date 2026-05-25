from pydantic import BaseModel, ConfigDict, field_validator
from datetime import date, datetime
from typing import Optional
from app.modules.contabilidad.models.movimiento import TipoMovimiento, CategoriaMovimiento


class MovimientoCreate(BaseModel):
    tipo: TipoMovimiento
    descripcion: str
    monto: int
    categoria: CategoriaMovimiento
    fecha: date

    @field_validator("monto")
    @classmethod
    def monto_positivo(cls, v: int) -> int:
        if v <= 0:
            raise ValueError("El monto debe ser mayor a 0")
        return v

    @field_validator("descripcion")
    @classmethod
    def descripcion_no_vacia(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("La descripción no puede estar vacía")
        return v.strip()


class MovimientoResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    tipo: TipoMovimiento
    descripcion: str
    monto: int
    categoria: CategoriaMovimiento
    fecha: date
    created_at: datetime


class ResumenFinanciero(BaseModel):
    total_ingresos: int
    total_egresos: int
    balance_neto: int
    total_movimientos: int

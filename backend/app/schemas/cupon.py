from pydantic import BaseModel, Field, validator
from datetime import datetime
from typing import Optional


class NichoCupon(str):
    """Nichos de cupones disponibles"""
    ALIMENTICIO = "Alimenticio"
    ESTETICO = "Estético"


class CuponBase(BaseModel):
    """Schema base para cupón"""
    codigo: str = Field(..., min_length=3, max_length=50, description="Código único del cupón")
    nicho: str = Field(..., description="Nicho del cupón (Alimenticio o Estético)")
    descuento: int = Field(..., ge=1, le=100, description="Porcentaje de descuento (1-100)")
    activo: bool = Field(default=True, description="Estado del cupón")
    fecha_expiracion: Optional[datetime] = Field(None, description="Fecha de expiración del cupón")

    @validator("nicho")
    def validar_nicho(cls, v):
        nichos_validos = ["Alimenticio", "Estético"]
        if v not in nichos_validos:
            raise ValueError(f"El nicho debe ser uno de: {', '.join(nichos_validos)}")
        return v

    @validator("codigo")
    def validar_codigo(cls, v):
        # Convertir a mayúsculas y eliminar espacios
        v = v.upper().strip()
        # Validar que solo contenga letras, números y guiones
        if not all(c.isalnum() or c in ['-', '_'] for c in v):
            raise ValueError("El código solo puede contener letras, números, guiones y guiones bajos")
        return v


class CuponCreate(CuponBase):
    """Schema para crear un cupón"""
    pass


class CuponUpdate(BaseModel):
    """Schema para actualizar un cupón"""
    codigo: Optional[str] = Field(None, min_length=3, max_length=50)
    nicho: Optional[str] = None
    descuento: Optional[int] = Field(None, ge=1, le=100)
    activo: Optional[bool] = None
    fecha_expiracion: Optional[datetime] = None

    @validator("nicho")
    def validar_nicho(cls, v):
        if v is not None:
            nichos_validos = ["Alimenticio", "Estético"]
            if v not in nichos_validos:
                raise ValueError(f"El nicho debe ser uno de: {', '.join(nichos_validos)}")
        return v

    @validator("codigo")
    def validar_codigo(cls, v):
        if v is not None:
            v = v.upper().strip()
            if not all(c.isalnum() or c in ['-', '_'] for c in v):
                raise ValueError("El código solo puede contener letras, números, guiones y guiones bajos")
        return v


class Cupon(CuponBase):
    """Schema completo de cupón (respuesta del backend)"""
    id: int
    usos_total: int = Field(default=0, description="Total de usos del cupón")
    usos_anio: int = Field(default=0, description="Usos del cupón este año")
    fecha_creacion: datetime

    class Config:
        from_attributes = True


class CuponStats(BaseModel):
    """Estadísticas de cupones"""
    total_cupones: int
    cupones_activos: int
    cupones_inactivos: int
    total_usos: int
    total_usos_anio: int
    cupones_por_nicho: dict[str, int]

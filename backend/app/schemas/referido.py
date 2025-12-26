from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional


class ReferidoBase(BaseModel):
    """Schema base para referido"""
    referidor_id: int = Field(..., description="ID del usuario referidor")
    referido_id: int = Field(..., description="ID del usuario referido")
    membresia_id: Optional[int] = Field(None, description="ID de la membresía asociada")


class ReferidoCreate(ReferidoBase):
    """Schema para crear un referido"""
    pass


class ReferidoUpdate(BaseModel):
    """Schema para actualizar un referido"""
    cumple_condicion: Optional[bool] = None
    beneficio: Optional[str] = None
    membresia_id: Optional[int] = None


class Referido(ReferidoBase):
    """Schema completo de referido (respuesta del backend)"""
    id: int
    cumple_condicion: bool
    beneficio: Optional[str]
    fecha_referido: datetime
    fecha_activacion: Optional[datetime]

    class Config:
        from_attributes = True


class ReferidoDetallado(BaseModel):
    """Schema de referido con información detallada de usuarios"""
    id: int
    referidor: str = Field(..., description="Nombre completo del referidor")
    referidor_id: int = Field(..., description="ID del referidor")
    referidos_totales: int = Field(..., description="Total de referidos activos del referidor")
    referido: str = Field(..., description="Nombre completo del referido")
    plan_comprado: Optional[str] = Field(None, description="Tipo de plan comprado")
    cumple_condicion: bool
    beneficio: Optional[str]
    fecha_referido: datetime
    fecha_activacion: Optional[datetime]

    class Config:
        from_attributes = True


class ReferidoStats(BaseModel):
    """Estadísticas del programa de referidos"""
    total_referidos: int
    referidos_activos: int
    referidos_pendientes: int
    beneficios_otorgados: int
    referidos_ultimo_mes: int
    referidos_ultimos_3_meses: int
    top_referidores: list[dict]

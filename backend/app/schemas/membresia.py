from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional
from app.modules.usuarios.models.membresia import TipoPlan, EstadoMembresia, TipoMembresia, TipoPago

# Schema para listar planes disponibles
class PlanDisponible(BaseModel):
    """Información de un plan de membresía disponible"""
    tipo: str = Field(..., description="Tipo de plan (pase_diario, pase_flex, etc)")
    nombre: str = Field(..., description="Nombre del plan")
    precio: int = Field(..., description="Precio en COP")
    duracion_dias: int = Field(..., description="Duración en días")

# Schema simplificado para crear membresía (solo tipo_plan y usuario_id)
class MembresiaCreateSimple(BaseModel):
    """Schema para crear una membresía - solo requiere usuario_id y tipo_plan"""
    usuario_id: int = Field(..., description="ID del usuario")
    tipo_plan: TipoPlan = Field(..., description="Tipo de plan seleccionado")
    tipo_pago: Optional[TipoPago] = Field(None, description="Método de pago utilizado")
    descripcion: Optional[str] = Field(None, description="Notas adicionales opcionales")

# Schema completo para crear membresía (usado internamente)
class MembresiaCreate(BaseModel):
    usuario_id: int
    tipo_plan: TipoPlan
    precio: int
    duracion_dias: int
    fecha_inicio: datetime
    fecha_fin: datetime
    descripcion: Optional[str] = None

class MembresiaUpdate(BaseModel):
    estado: Optional[EstadoMembresia] = None
    fecha_fin: Optional[datetime] = None
    activo: Optional[bool] = None
    descripcion: Optional[str] = None

# Schema de respuesta
class Membresia(BaseModel):
    id: int
    usuario_id: int
    tipo_plan: TipoPlan
    estado: EstadoMembresia
    precio: int
    duracion_dias: int
    fecha_inicio: datetime
    fecha_fin: datetime
    tipo_pago: Optional[TipoPago] = None
    descripcion: Optional[str] = None
    activo: bool

    class Config:
        from_attributes = True

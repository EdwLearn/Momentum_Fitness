from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class ConfiguracionGimnasioBase(BaseModel):
    nombre_gimnasio: str
    nit: Optional[str] = None
    direccion: Optional[str] = None
    telefono: Optional[str] = None
    email: Optional[str] = None
    horario_semana: Optional[str] = None
    horario_finde: Optional[str] = None
    instagram: Optional[str] = None
    facebook: Optional[str] = None
    tiktok: Optional[str] = None
    website: Optional[str] = None


class ConfiguracionGimnasioCreate(ConfiguracionGimnasioBase):
    pass


class ConfiguracionGimnasioUpdate(ConfiguracionGimnasioBase):
    nombre_gimnasio: Optional[str] = None


class ConfiguracionGimnasio(ConfiguracionGimnasioBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

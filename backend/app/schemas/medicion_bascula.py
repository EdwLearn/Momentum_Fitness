from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import Optional


class MedicionBasculaBase(BaseModel):
    usuario_id: int
    peso: float                              # kg
    porcentaje_grasa: Optional[float] = None # %
    grasa_visceral: Optional[int] = None     # nivel
    porcentaje_musculo: Optional[float] = None  # %
    imc: Optional[float] = None              # kg/m²
    metabolismo_basal: Optional[int] = None  # kcal/día
    edad_corporal: Optional[int] = None      # años
    notas: Optional[str] = None


class MedicionBasculaCreate(MedicionBasculaBase):
    pass


class MedicionBasculaUpdate(BaseModel):
    peso: Optional[float] = None
    porcentaje_grasa: Optional[float] = None
    grasa_visceral: Optional[int] = None
    porcentaje_musculo: Optional[float] = None
    imc: Optional[float] = None
    metabolismo_basal: Optional[int] = None
    edad_corporal: Optional[int] = None
    notas: Optional[str] = None


class MedicionBascula(MedicionBasculaBase):
    id: int
    fecha: datetime

    model_config = ConfigDict(from_attributes=True)

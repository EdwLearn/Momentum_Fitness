from pydantic import BaseModel, EmailStr, field_validator
from typing import Optional
from datetime import date, datetime
from enum import Enum


class TipoEmpleado(str, Enum):
    ENTRENADOR = "entrenador"
    RECEPCION = "recepcion"


class EmpleadoBase(BaseModel):
    # Datos personales
    nombre: str
    apellido: Optional[str] = None
    cedula: str
    email: Optional[EmailStr] = None
    telefono: Optional[str] = None
    fecha_nacimiento: Optional[date] = None
    genero: Optional[str] = None
    direccion: Optional[str] = None

    # Datos laborales
    tipo_empleado: TipoEmpleado = TipoEmpleado.ENTRENADOR
    fecha_contratacion: Optional[date] = None
    salario: Optional[float] = None
    horario: Optional[str] = None
    dias_laborales: Optional[str] = None

    # Contacto de emergencia
    emergencia_nombre: Optional[str] = None
    emergencia_telefono: Optional[str] = None
    emergencia_relacion: Optional[str] = None


class EmpleadoCreate(EmpleadoBase):
    pass


class EmpleadoUpdate(BaseModel):
    nombre: Optional[str] = None
    apellido: Optional[str] = None
    cedula: Optional[str] = None
    email: Optional[EmailStr] = None
    telefono: Optional[str] = None
    fecha_nacimiento: Optional[date] = None
    genero: Optional[str] = None
    direccion: Optional[str] = None
    tipo_empleado: Optional[TipoEmpleado] = None
    fecha_contratacion: Optional[date] = None
    salario: Optional[float] = None
    horario: Optional[str] = None
    dias_laborales: Optional[str] = None
    emergencia_nombre: Optional[str] = None
    emergencia_telefono: Optional[str] = None
    emergencia_relacion: Optional[str] = None
    activo: Optional[int] = None


class Empleado(EmpleadoBase):
    id: int
    fecha_registro: datetime
    activo: int

    class Config:
        from_attributes = True

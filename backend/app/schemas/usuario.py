from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional
from app.models.usuario import TipoUsuario

class UsuarioBase(BaseModel):
    nombre: str
    apellido: str
    email: EmailStr
    telefono: Optional[str] = None
    tipo: TipoUsuario = TipoUsuario.CLIENTE
    fecha_nacimiento: Optional[datetime] = None

class UsuarioCreate(UsuarioBase):
    pass

class UsuarioUpdate(BaseModel):
    nombre: Optional[str] = None
    apellido: Optional[str] = None
    email: Optional[EmailStr] = None
    telefono: Optional[str] = None
    tipo: Optional[TipoUsuario] = None
    activo: Optional[bool] = None
    fecha_nacimiento: Optional[datetime] = None

class Usuario(UsuarioBase):
    id: int
    activo: bool
    fecha_registro: datetime

    class Config:
        from_attributes = True

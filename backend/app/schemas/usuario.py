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

    # Campo de referido
    referido_por_cedula: Optional[str] = None

    # Campos del gimnasio
    peso_inicial: Optional[float] = None
    peso_actual: Optional[float] = None
    altura: Optional[float] = None
    objetivo: Optional[str] = None
    genero: Optional[str] = None

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

    # Campo de referido
    referido_por_cedula: Optional[str] = None

    # Campos del gimnasio
    peso_inicial: Optional[float] = None
    peso_actual: Optional[float] = None
    altura: Optional[float] = None
    objetivo: Optional[str] = None
    genero: Optional[str] = None

class Usuario(UsuarioBase):
    id: int
    activo: bool
    fecha_registro: datetime
    ultima_asistencia: Optional[datetime] = None

    class Config:
        from_attributes = True

# Schema para búsqueda de referido
class UsuarioBusqueda(BaseModel):
    id: int
    nombre: str
    apellido: str
    telefono: Optional[str] = None

    class Config:
        from_attributes = True

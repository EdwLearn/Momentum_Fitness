from sqlalchemy.orm import Session
from sqlalchemy import and_
from app.models.usuario import Usuario
from app.modules.usuarios.models.membresia import Membresia, EstadoMembresia, PLANES_VALIDOS_REFERIR
from app.schemas.usuario import UsuarioCreate, UsuarioUpdate
from typing import List, Optional
from datetime import datetime

def get_usuario(db: Session, usuario_id: int) -> Optional[Usuario]:
    return db.query(Usuario).filter(Usuario.id == usuario_id).first()

def get_usuario_by_email(db: Session, email: str) -> Optional[Usuario]:
    return db.query(Usuario).filter(Usuario.email == email).first()

def get_usuario_by_cedula(db: Session, cedula: str) -> Optional[Usuario]:
    """Busca un usuario por su cédula (campo telefono)"""
    return db.query(Usuario).filter(Usuario.telefono == cedula).first()

def get_usuarios(db: Session, skip: int = 0, limit: int = 100) -> List[Usuario]:
    return db.query(Usuario).offset(skip).limit(limit).all()

def create_usuario(db: Session, usuario: UsuarioCreate) -> Usuario:
    db_usuario = Usuario(**usuario.model_dump())
    db.add(db_usuario)
    db.commit()
    db.refresh(db_usuario)
    return db_usuario

def update_usuario(db: Session, usuario_id: int, usuario: UsuarioUpdate) -> Optional[Usuario]:
    db_usuario = get_usuario(db, usuario_id)
    if db_usuario:
        update_data = usuario.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_usuario, key, value)
        db.commit()
        db.refresh(db_usuario)
    return db_usuario

def delete_usuario(db: Session, usuario_id: int) -> bool:
    db_usuario = get_usuario(db, usuario_id)
    if db_usuario:
        db.delete(db_usuario)
        db.commit()
        return True
    return False

def puede_referir(db: Session, cedula: str) -> bool:
    """
    Verifica si un usuario puede referir a otros.
    Reglas: Solo clientes con planes Mensual, Plan 3 Meses, Plan 6 Meses, Elite Anual
    """
    usuario = get_usuario_by_cedula(db, cedula)
    if not usuario:
        return False

    # Buscar membresía activa del usuario
    now = datetime.utcnow()
    membresia_activa = db.query(Membresia).filter(
        and_(
            Membresia.usuario_id == usuario.id,
            Membresia.activo == True,
            Membresia.estado == EstadoMembresia.ACTIVA,
            Membresia.fecha_fin >= now
        )
    ).first()

    if not membresia_activa:
        return False

    # Verificar si el plan permite referir
    return membresia_activa.tipo_plan in PLANES_VALIDOS_REFERIR

def contar_referidos_activos(db: Session, cedula_referidor: str) -> int:
    """
    Cuenta cuántos referidos activos tiene un usuario.
    Solo cuentan referidos con membresía activa.
    """
    # Buscar todos los usuarios referidos por esta cédula
    referidos = db.query(Usuario).filter(Usuario.referido_por_cedula == cedula_referidor).all()

    count = 0
    now = datetime.utcnow()

    for referido in referidos:
        # Verificar si tiene membresía activa
        membresia_activa = db.query(Membresia).filter(
            and_(
                Membresia.usuario_id == referido.id,
                Membresia.activo == True,
                Membresia.estado == EstadoMembresia.ACTIVA,
                Membresia.fecha_fin >= now
            )
        ).first()

        if membresia_activa:
            count += 1

    return count

def get_estadisticas_referidos(db: Session, cedula: str) -> dict:
    """
    Obtiene estadísticas de referidos de un usuario.
    """
    usuario = get_usuario_by_cedula(db, cedula)
    if not usuario:
        return {"error": "Usuario no encontrado"}

    puede_ref = puede_referir(db, cedula)
    referidos_activos = contar_referidos_activos(db, cedula)
    meses_ganados = referidos_activos // 3
    referidos_para_proximo = 3 - (referidos_activos % 3)

    return {
        "usuario_id": usuario.id,
        "nombre_completo": f"{usuario.nombre} {usuario.apellido}",
        "puede_referir": puede_ref,
        "referidos_activos": referidos_activos,
        "meses_gratis_ganados": meses_ganados,
        "referidos_para_proximo_mes": referidos_para_proximo if puede_ref else 0,
    }

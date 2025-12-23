from sqlalchemy.orm import Session
from sqlalchemy import and_
from app.modules.usuarios.models.membresia import Membresia, TipoPlan, EstadoMembresia, PLANES_CONFIG, REFERIDOS_CONFIG
from app.models.usuario import Usuario
from app.schemas.membresia import MembresiaCreate, MembresiaUpdate, MembresiaCreateSimple
from datetime import datetime
from typing import List, Optional

def get_membresia(db: Session, membresia_id: int) -> Optional[Membresia]:
    return db.query(Membresia).filter(Membresia.id == membresia_id).first()

def get_membresias(db: Session, skip: int = 0, limit: int = 100) -> List[Membresia]:
    return db.query(Membresia).offset(skip).limit(limit).all()

def get_membresias_by_usuario(db: Session, usuario_id: int) -> List[Membresia]:
    """Obtiene todas las membresías de un usuario"""
    return db.query(Membresia).filter(Membresia.usuario_id == usuario_id).all()

def get_membresia_activa_by_usuario(db: Session, usuario_id: int) -> Optional[Membresia]:
    """Obtiene la membresía activa y vigente de un usuario"""
    now = datetime.utcnow()
    return db.query(Membresia).filter(
        and_(
            Membresia.usuario_id == usuario_id,
            Membresia.activo == True,
            Membresia.estado == EstadoMembresia.ACTIVA,
            Membresia.fecha_fin >= now
        )
    ).order_by(Membresia.fecha_fin.desc()).first()

def desactivar_membresias_anteriores(db: Session, usuario_id: int) -> int:
    """Desactiva todas las membresías activas anteriores de un usuario"""
    count = db.query(Membresia).filter(
        and_(
            Membresia.usuario_id == usuario_id,
            Membresia.activo == True
        )
    ).update({"activo": False})
    db.commit()
    return count

def create_membresia_simple(db: Session, membresia_simple: MembresiaCreateSimple) -> Membresia:
    """
    Crea una membresía con auto-cálculo de precio, duración y fechas.
    Desactiva automáticamente membresías anteriores del usuario.
    Aplica descuento del 5% si el usuario fue referido.
    """
    # 1. Obtener configuración del plan
    config_plan = PLANES_CONFIG.get(membresia_simple.tipo_plan)
    if not config_plan:
        raise ValueError(f"Plan no válido: {membresia_simple.tipo_plan}")

    # 2. Desactivar membresías anteriores del usuario
    desactivar_membresias_anteriores(db, membresia_simple.usuario_id)

    # 3. Calcular precio (con descuento si fue referido)
    precio_base = config_plan["precio"]
    usuario = db.query(Usuario).filter(Usuario.id == membresia_simple.usuario_id).first()

    # Si fue referido, aplicar descuento del 5%
    if usuario and usuario.referido_por_cedula:
        descuento = REFERIDOS_CONFIG["descuento_referido"]
        precio_final = int(precio_base * (1 - descuento))
    else:
        precio_final = precio_base

    # 4. Calcular fechas
    fecha_inicio = datetime.utcnow()
    fecha_fin = Membresia.calcular_fecha_fin(fecha_inicio, config_plan["dias"])

    # 5. Crear membresía completa
    membresia_data = MembresiaCreate(
        usuario_id=membresia_simple.usuario_id,
        tipo_plan=membresia_simple.tipo_plan,
        precio=precio_final,
        duracion_dias=config_plan["dias"],
        fecha_inicio=fecha_inicio,
        fecha_fin=fecha_fin,
        descripcion=membresia_simple.descripcion
    )

    # 6. Crear el objeto Membresia y guardar en BD
    db_membresia = Membresia(**membresia_data.model_dump())

    # Agregar tipo de pago si se proporcionó
    if membresia_simple.tipo_pago:
        db_membresia.tipo_pago = membresia_simple.tipo_pago

    db.add(db_membresia)
    db.commit()
    db.refresh(db_membresia)

    return db_membresia

def create_membresia(db: Session, membresia: MembresiaCreate) -> Membresia:
    """Crea una membresía con todos los datos especificados (uso interno)"""
    db_membresia = Membresia(**membresia.model_dump())
    db.add(db_membresia)
    db.commit()
    db.refresh(db_membresia)
    return db_membresia

def update_membresia(db: Session, membresia_id: int, membresia: MembresiaUpdate) -> Optional[Membresia]:
    db_membresia = get_membresia(db, membresia_id)
    if db_membresia:
        update_data = membresia.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_membresia, key, value)
        db.commit()
        db.refresh(db_membresia)
    return db_membresia

def delete_membresia(db: Session, membresia_id: int) -> bool:
    db_membresia = get_membresia(db, membresia_id)
    if db_membresia:
        db.delete(db_membresia)
        db.commit()
        return True
    return False

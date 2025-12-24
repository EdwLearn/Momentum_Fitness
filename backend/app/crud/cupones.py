from sqlalchemy.orm import Session
from sqlalchemy import func, extract
from typing import List, Optional
from datetime import datetime
from app.models.cupon import Cupon, NichoCupon
from app.schemas.cupon import CuponCreate, CuponUpdate, CuponStats


def get_cupon(db: Session, cupon_id: int) -> Optional[Cupon]:
    """Obtener cupón por ID"""
    return db.query(Cupon).filter(Cupon.id == cupon_id).first()


def get_cupon_by_codigo(db: Session, codigo: str) -> Optional[Cupon]:
    """Obtener cupón por código"""
    return db.query(Cupon).filter(Cupon.codigo == codigo.upper()).first()


def get_cupones(
    db: Session,
    skip: int = 0,
    limit: int = 100,
    nicho: Optional[str] = None,
    activo: Optional[bool] = None,
    search: Optional[str] = None
) -> List[Cupon]:
    """Obtener lista de cupones con filtros opcionales"""
    query = db.query(Cupon)

    if nicho:
        query = query.filter(Cupon.nicho == nicho)

    if activo is not None:
        query = query.filter(Cupon.activo == activo)

    if search:
        query = query.filter(Cupon.codigo.ilike(f"%{search}%"))

    return query.offset(skip).limit(limit).all()


def create_cupon(db: Session, cupon: CuponCreate) -> Cupon:
    """Crear un nuevo cupón"""
    db_cupon = Cupon(
        codigo=cupon.codigo.upper().strip(),
        nicho=cupon.nicho,
        descuento=cupon.descuento,
        activo=cupon.activo,
        fecha_expiracion=cupon.fecha_expiracion,
        usos_total=0,
        usos_anio=0
    )
    db.add(db_cupon)
    db.commit()
    db.refresh(db_cupon)
    return db_cupon


def update_cupon(db: Session, cupon_id: int, cupon_update: CuponUpdate) -> Optional[Cupon]:
    """Actualizar un cupón existente"""
    db_cupon = get_cupon(db, cupon_id)
    if not db_cupon:
        return None

    update_data = cupon_update.model_dump(exclude_unset=True)

    # Normalizar código si se está actualizando
    if "codigo" in update_data and update_data["codigo"]:
        update_data["codigo"] = update_data["codigo"].upper().strip()

    for field, value in update_data.items():
        setattr(db_cupon, field, value)

    db.commit()
    db.refresh(db_cupon)
    return db_cupon


def delete_cupon(db: Session, cupon_id: int) -> bool:
    """Eliminar un cupón"""
    db_cupon = get_cupon(db, cupon_id)
    if not db_cupon:
        return False

    db.delete(db_cupon)
    db.commit()
    return True


def toggle_cupon_activo(db: Session, cupon_id: int) -> Optional[Cupon]:
    """Alternar estado activo/inactivo de un cupón"""
    db_cupon = get_cupon(db, cupon_id)
    if not db_cupon:
        return None

    db_cupon.activo = not db_cupon.activo
    db.commit()
    db.refresh(db_cupon)
    return db_cupon


def incrementar_uso_cupon(db: Session, cupon_id: int) -> Optional[Cupon]:
    """Incrementar contador de usos de un cupón"""
    db_cupon = get_cupon(db, cupon_id)
    if not db_cupon:
        return None

    db_cupon.incrementar_uso()
    db.commit()
    db.refresh(db_cupon)
    return db_cupon


def aplicar_cupon(db: Session, codigo: str) -> Optional[Cupon]:
    """Aplicar un cupón (incrementa uso si es válido)"""
    db_cupon = get_cupon_by_codigo(db, codigo)

    if not db_cupon:
        return None

    if not db_cupon.esta_vigente():
        return None

    db_cupon.incrementar_uso()
    db.commit()
    db.refresh(db_cupon)
    return db_cupon


def get_cupones_stats(db: Session) -> CuponStats:
    """Obtener estadísticas de cupones"""
    total_cupones = db.query(func.count(Cupon.id)).scalar()
    cupones_activos = db.query(func.count(Cupon.id)).filter(Cupon.activo == True).scalar()
    cupones_inactivos = db.query(func.count(Cupon.id)).filter(Cupon.activo == False).scalar()
    total_usos = db.query(func.sum(Cupon.usos_total)).scalar() or 0
    total_usos_anio = db.query(func.sum(Cupon.usos_anio)).scalar() or 0

    # Cupones por nicho
    cupones_por_nicho = {}
    for nicho in NichoCupon:
        count = db.query(func.count(Cupon.id)).filter(Cupon.nicho == nicho.value).scalar()
        cupones_por_nicho[nicho.value] = count

    return CuponStats(
        total_cupones=total_cupones,
        cupones_activos=cupones_activos,
        cupones_inactivos=cupones_inactivos,
        total_usos=total_usos,
        total_usos_anio=total_usos_anio,
        cupones_por_nicho=cupones_por_nicho
    )


def reset_usos_anuales(db: Session) -> int:
    """Resetear contadores anuales (ejecutar al inicio de cada año)"""
    result = db.query(Cupon).update({"usos_anio": 0})
    db.commit()
    return result

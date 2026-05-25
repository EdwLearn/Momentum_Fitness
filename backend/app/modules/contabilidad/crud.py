from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from datetime import date

from app.modules.contabilidad.models.movimiento import MovimientoFinanciero, TipoMovimiento
from app.modules.contabilidad.schemas.movimiento import MovimientoCreate, ResumenFinanciero


def get_movimientos(
    db: Session,
    skip: int = 0,
    limit: int = 500,
    tipo: Optional[str] = None,
    categoria: Optional[str] = None,
) -> List[MovimientoFinanciero]:
    query = db.query(MovimientoFinanciero)
    if tipo:
        query = query.filter(MovimientoFinanciero.tipo == tipo)
    if categoria:
        query = query.filter(MovimientoFinanciero.categoria == categoria)
    return query.order_by(MovimientoFinanciero.fecha.desc()).offset(skip).limit(limit).all()


def get_movimiento(db: Session, movimiento_id: int) -> Optional[MovimientoFinanciero]:
    return db.query(MovimientoFinanciero).filter(MovimientoFinanciero.id == movimiento_id).first()


def create_movimiento(db: Session, movimiento: MovimientoCreate) -> MovimientoFinanciero:
    db_movimiento = MovimientoFinanciero(**movimiento.model_dump())
    db.add(db_movimiento)
    db.commit()
    db.refresh(db_movimiento)
    return db_movimiento


def delete_movimiento(db: Session, movimiento_id: int) -> bool:
    movimiento = get_movimiento(db, movimiento_id)
    if not movimiento:
        return False
    db.delete(movimiento)
    db.commit()
    return True


def get_resumen(db: Session) -> ResumenFinanciero:
    total_ingresos = db.query(func.sum(MovimientoFinanciero.monto)).filter(
        MovimientoFinanciero.tipo == TipoMovimiento.INGRESO
    ).scalar() or 0

    total_egresos = db.query(func.sum(MovimientoFinanciero.monto)).filter(
        MovimientoFinanciero.tipo == TipoMovimiento.EGRESO
    ).scalar() or 0

    total_movimientos = db.query(func.count(MovimientoFinanciero.id)).scalar() or 0

    return ResumenFinanciero(
        total_ingresos=total_ingresos,
        total_egresos=total_egresos,
        balance_neto=total_ingresos - total_egresos,
        total_movimientos=total_movimientos,
    )

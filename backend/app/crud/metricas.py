from sqlalchemy.orm import Session
from app.models.metrica import Metrica, TipoMetrica
from app.schemas.metrica import MetricaCreate, MetricaUpdate
from typing import List, Optional
from datetime import datetime, date

def get_metrica(db: Session, metrica_id: int) -> Optional[Metrica]:
    return db.query(Metrica).filter(Metrica.id == metrica_id).first()

def get_metricas(db: Session, skip: int = 0, limit: int = 100) -> List[Metrica]:
    return db.query(Metrica).offset(skip).limit(limit).all()

def get_metricas_by_usuario(db: Session, usuario_id: int) -> List[Metrica]:
    return db.query(Metrica).filter(Metrica.usuario_id == usuario_id).all()

def get_metricas_by_tipo(db: Session, usuario_id: int, tipo: TipoMetrica) -> List[Metrica]:
    return db.query(Metrica).filter(
        Metrica.usuario_id == usuario_id,
        Metrica.tipo == tipo
    ).order_by(Metrica.fecha_registro.desc()).all()

def get_metricas_by_periodo(
    db: Session,
    usuario_id: int,
    fecha_inicio: date,
    fecha_fin: date
) -> List[Metrica]:
    start = datetime.combine(fecha_inicio, datetime.min.time())
    end = datetime.combine(fecha_fin, datetime.max.time())
    return db.query(Metrica).filter(
        Metrica.usuario_id == usuario_id,
        Metrica.fecha_registro >= start,
        Metrica.fecha_registro <= end
    ).all()

def create_metrica(db: Session, metrica: MetricaCreate) -> Metrica:
    db_metrica = Metrica(**metrica.model_dump())
    db.add(db_metrica)
    db.commit()
    db.refresh(db_metrica)
    return db_metrica

def update_metrica(db: Session, metrica_id: int, metrica: MetricaUpdate) -> Optional[Metrica]:
    db_metrica = get_metrica(db, metrica_id)
    if db_metrica:
        update_data = metrica.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_metrica, key, value)
        db.commit()
        db.refresh(db_metrica)
    return db_metrica

def delete_metrica(db: Session, metrica_id: int) -> bool:
    db_metrica = get_metrica(db, metrica_id)
    if db_metrica:
        db.delete(db_metrica)
        db.commit()
        return True
    return False

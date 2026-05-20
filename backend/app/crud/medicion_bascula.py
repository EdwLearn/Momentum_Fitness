from sqlalchemy.orm import Session
from app.modules.metricas.models.medicion_bascula import MedicionBascula
from app.schemas.medicion_bascula import MedicionBasculaCreate, MedicionBasculaUpdate
from typing import List, Optional


def get_medicion(db: Session, medicion_id: int) -> Optional[MedicionBascula]:
    return db.query(MedicionBascula).filter(MedicionBascula.id == medicion_id).first()


def get_mediciones_by_usuario(db: Session, usuario_id: int) -> List[MedicionBascula]:
    return (
        db.query(MedicionBascula)
        .filter(MedicionBascula.usuario_id == usuario_id)
        .order_by(MedicionBascula.fecha.desc())
        .all()
    )


def create_medicion(db: Session, medicion: MedicionBasculaCreate) -> MedicionBascula:
    db_medicion = MedicionBascula(**medicion.model_dump())
    db.add(db_medicion)
    db.commit()
    db.refresh(db_medicion)
    return db_medicion


def update_medicion(
    db: Session, medicion_id: int, medicion: MedicionBasculaUpdate
) -> Optional[MedicionBascula]:
    db_medicion = get_medicion(db, medicion_id)
    if db_medicion:
        for key, value in medicion.model_dump(exclude_unset=True).items():
            setattr(db_medicion, key, value)
        db.commit()
        db.refresh(db_medicion)
    return db_medicion


def delete_medicion(db: Session, medicion_id: int) -> bool:
    db_medicion = get_medicion(db, medicion_id)
    if db_medicion:
        db.delete(db_medicion)
        db.commit()
        return True
    return False

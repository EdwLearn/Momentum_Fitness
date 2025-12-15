from sqlalchemy.orm import Session
from app.models.asistencia import Asistencia
from app.schemas.asistencia import AsistenciaCreate, AsistenciaUpdate
from typing import List, Optional
from datetime import datetime, date

def get_asistencia(db: Session, asistencia_id: int) -> Optional[Asistencia]:
    return db.query(Asistencia).filter(Asistencia.id == asistencia_id).first()

def get_asistencias(db: Session, skip: int = 0, limit: int = 100) -> List[Asistencia]:
    return db.query(Asistencia).offset(skip).limit(limit).all()

def get_asistencias_by_usuario(db: Session, usuario_id: int) -> List[Asistencia]:
    return db.query(Asistencia).filter(Asistencia.usuario_id == usuario_id).all()

def get_asistencias_by_fecha(db: Session, fecha: date) -> List[Asistencia]:
    start = datetime.combine(fecha, datetime.min.time())
    end = datetime.combine(fecha, datetime.max.time())
    return db.query(Asistencia).filter(
        Asistencia.fecha >= start,
        Asistencia.fecha <= end
    ).all()

def create_asistencia(db: Session, asistencia: AsistenciaCreate) -> Asistencia:
    db_asistencia = Asistencia(**asistencia.model_dump())
    db.add(db_asistencia)
    db.commit()
    db.refresh(db_asistencia)
    return db_asistencia

def update_asistencia(db: Session, asistencia_id: int, asistencia: AsistenciaUpdate) -> Optional[Asistencia]:
    db_asistencia = get_asistencia(db, asistencia_id)
    if db_asistencia:
        update_data = asistencia.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_asistencia, key, value)
        db.commit()
        db.refresh(db_asistencia)
    return db_asistencia

def delete_asistencia(db: Session, asistencia_id: int) -> bool:
    db_asistencia = get_asistencia(db, asistencia_id)
    if db_asistencia:
        db.delete(db_asistencia)
        db.commit()
        return True
    return False

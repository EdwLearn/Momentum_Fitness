from sqlalchemy.orm import Session
from app.models.membresia import Membresia
from app.schemas.membresia import MembresiaCreate, MembresiaUpdate
from typing import List, Optional

def get_membresia(db: Session, membresia_id: int) -> Optional[Membresia]:
    return db.query(Membresia).filter(Membresia.id == membresia_id).first()

def get_membresias(db: Session, skip: int = 0, limit: int = 100) -> List[Membresia]:
    return db.query(Membresia).offset(skip).limit(limit).all()

def get_membresias_by_usuario(db: Session, usuario_id: int) -> List[Membresia]:
    return db.query(Membresia).filter(Membresia.usuario_id == usuario_id).all()

def create_membresia(db: Session, membresia: MembresiaCreate) -> Membresia:
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

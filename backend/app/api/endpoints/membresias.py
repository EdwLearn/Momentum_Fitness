from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.schemas import membresia as schemas
from app.crud import membresias as crud
from app.crud import usuarios as usuarios_crud

router = APIRouter()

@router.post("/", response_model=schemas.Membresia, status_code=status.HTTP_201_CREATED)
def create_membresia(membresia: schemas.MembresiaCreate, db: Session = Depends(get_db)):
    db_usuario = usuarios_crud.get_usuario(db, usuario_id=membresia.usuario_id)
    if not db_usuario:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no encontrado"
        )
    return crud.create_membresia(db=db, membresia=membresia)

@router.get("/", response_model=List[schemas.Membresia])
def read_membresias(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    membresias = crud.get_membresias(db, skip=skip, limit=limit)
    return membresias

@router.get("/usuario/{usuario_id}", response_model=List[schemas.Membresia])
def read_membresias_by_usuario(usuario_id: int, db: Session = Depends(get_db)):
    membresias = crud.get_membresias_by_usuario(db, usuario_id=usuario_id)
    return membresias

@router.get("/{membresia_id}", response_model=schemas.Membresia)
def read_membresia(membresia_id: int, db: Session = Depends(get_db)):
    db_membresia = crud.get_membresia(db, membresia_id=membresia_id)
    if db_membresia is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Membresía no encontrada"
        )
    return db_membresia

@router.put("/{membresia_id}", response_model=schemas.Membresia)
def update_membresia(membresia_id: int, membresia: schemas.MembresiaUpdate, db: Session = Depends(get_db)):
    db_membresia = crud.update_membresia(db, membresia_id=membresia_id, membresia=membresia)
    if db_membresia is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Membresía no encontrada"
        )
    return db_membresia

@router.delete("/{membresia_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_membresia(membresia_id: int, db: Session = Depends(get_db)):
    success = crud.delete_membresia(db, membresia_id=membresia_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Membresía no encontrada"
        )
    return None

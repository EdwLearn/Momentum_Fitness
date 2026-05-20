from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.schemas import medicion_bascula as schemas
from app.crud import medicion_bascula as crud
from app.crud import usuarios as usuarios_crud

router = APIRouter()


@router.post("/", response_model=schemas.MedicionBascula, status_code=status.HTTP_201_CREATED)
def create_medicion(medicion: schemas.MedicionBasculaCreate, db: Session = Depends(get_db)):
    if not usuarios_crud.get_usuario(db, usuario_id=medicion.usuario_id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Usuario no encontrado")
    return crud.create_medicion(db=db, medicion=medicion)


@router.get("/usuario/{usuario_id}", response_model=List[schemas.MedicionBascula])
def read_mediciones_by_usuario(usuario_id: int, db: Session = Depends(get_db)):
    if not usuarios_crud.get_usuario(db, usuario_id=usuario_id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Usuario no encontrado")
    return crud.get_mediciones_by_usuario(db, usuario_id=usuario_id)


@router.get("/{medicion_id}", response_model=schemas.MedicionBascula)
def read_medicion(medicion_id: int, db: Session = Depends(get_db)):
    db_medicion = crud.get_medicion(db, medicion_id=medicion_id)
    if db_medicion is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Medición no encontrada")
    return db_medicion


@router.put("/{medicion_id}", response_model=schemas.MedicionBascula)
def update_medicion(
    medicion_id: int, medicion: schemas.MedicionBasculaUpdate, db: Session = Depends(get_db)
):
    db_medicion = crud.update_medicion(db, medicion_id=medicion_id, medicion=medicion)
    if db_medicion is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Medición no encontrada")
    return db_medicion


@router.delete("/{medicion_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_medicion(medicion_id: int, db: Session = Depends(get_db)):
    if not crud.delete_medicion(db, medicion_id=medicion_id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Medición no encontrada")
    return None

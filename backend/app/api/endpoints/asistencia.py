from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List
from datetime import date
from app.core.database import get_db
from app.schemas import asistencia as schemas
from app.crud import asistencias as crud
from app.crud import usuarios as usuarios_crud

router = APIRouter()

@router.post("/", response_model=schemas.Asistencia, status_code=status.HTTP_201_CREATED)
def create_asistencia(asistencia: schemas.AsistenciaCreate, db: Session = Depends(get_db)):
    db_usuario = usuarios_crud.get_usuario(db, usuario_id=asistencia.usuario_id)
    if not db_usuario:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no encontrado"
        )
    return crud.create_asistencia(db=db, asistencia=asistencia)

@router.get("/", response_model=List[schemas.Asistencia])
def read_asistencias(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    asistencias = crud.get_asistencias(db, skip=skip, limit=limit)
    return asistencias

@router.get("/usuario/{usuario_id}", response_model=List[schemas.Asistencia])
def read_asistencias_by_usuario(usuario_id: int, db: Session = Depends(get_db)):
    asistencias = crud.get_asistencias_by_usuario(db, usuario_id=usuario_id)
    return asistencias

@router.get("/fecha/{fecha}", response_model=List[schemas.Asistencia])
def read_asistencias_by_fecha(fecha: date, db: Session = Depends(get_db)):
    asistencias = crud.get_asistencias_by_fecha(db, fecha=fecha)
    return asistencias

@router.get("/{asistencia_id}", response_model=schemas.Asistencia)
def read_asistencia(asistencia_id: int, db: Session = Depends(get_db)):
    db_asistencia = crud.get_asistencia(db, asistencia_id=asistencia_id)
    if db_asistencia is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Asistencia no encontrada"
        )
    return db_asistencia

@router.put("/{asistencia_id}", response_model=schemas.Asistencia)
def update_asistencia(asistencia_id: int, asistencia: schemas.AsistenciaUpdate, db: Session = Depends(get_db)):
    db_asistencia = crud.update_asistencia(db, asistencia_id=asistencia_id, asistencia=asistencia)
    if db_asistencia is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Asistencia no encontrada"
        )
    return db_asistencia

@router.delete("/{asistencia_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_asistencia(asistencia_id: int, db: Session = Depends(get_db)):
    success = crud.delete_asistencia(db, asistencia_id=asistencia_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Asistencia no encontrada"
        )
    return None

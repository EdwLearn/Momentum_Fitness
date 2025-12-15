from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date
from app.core.database import get_db
from app.schemas import metrica as schemas
from app.crud import metricas as crud
from app.crud import usuarios as usuarios_crud
from app.models.metrica import TipoMetrica

router = APIRouter()

@router.post("/", response_model=schemas.Metrica, status_code=status.HTTP_201_CREATED)
def create_metrica(metrica: schemas.MetricaCreate, db: Session = Depends(get_db)):
    db_usuario = usuarios_crud.get_usuario(db, usuario_id=metrica.usuario_id)
    if not db_usuario:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no encontrado"
        )
    return crud.create_metrica(db=db, metrica=metrica)

@router.get("/", response_model=List[schemas.Metrica])
def read_metricas(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    metricas = crud.get_metricas(db, skip=skip, limit=limit)
    return metricas

@router.get("/usuario/{usuario_id}", response_model=List[schemas.Metrica])
def read_metricas_by_usuario(usuario_id: int, db: Session = Depends(get_db)):
    metricas = crud.get_metricas_by_usuario(db, usuario_id=usuario_id)
    return metricas

@router.get("/usuario/{usuario_id}/tipo/{tipo}", response_model=List[schemas.Metrica])
def read_metricas_by_tipo(
    usuario_id: int,
    tipo: TipoMetrica,
    db: Session = Depends(get_db)
):
    metricas = crud.get_metricas_by_tipo(db, usuario_id=usuario_id, tipo=tipo)
    return metricas

@router.get("/usuario/{usuario_id}/periodo", response_model=List[schemas.Metrica])
def read_metricas_by_periodo(
    usuario_id: int,
    fecha_inicio: date = Query(..., description="Fecha de inicio del periodo"),
    fecha_fin: date = Query(..., description="Fecha de fin del periodo"),
    db: Session = Depends(get_db)
):
    metricas = crud.get_metricas_by_periodo(
        db,
        usuario_id=usuario_id,
        fecha_inicio=fecha_inicio,
        fecha_fin=fecha_fin
    )
    return metricas

@router.get("/{metrica_id}", response_model=schemas.Metrica)
def read_metrica(metrica_id: int, db: Session = Depends(get_db)):
    db_metrica = crud.get_metrica(db, metrica_id=metrica_id)
    if db_metrica is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Métrica no encontrada"
        )
    return db_metrica

@router.put("/{metrica_id}", response_model=schemas.Metrica)
def update_metrica(metrica_id: int, metrica: schemas.MetricaUpdate, db: Session = Depends(get_db)):
    db_metrica = crud.update_metrica(db, metrica_id=metrica_id, metrica=metrica)
    if db_metrica is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Métrica no encontrada"
        )
    return db_metrica

@router.delete("/{metrica_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_metrica(metrica_id: int, db: Session = Depends(get_db)):
    success = crud.delete_metrica(db, metrica_id=metrica_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Métrica no encontrada"
        )
    return None

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from app.core.database import get_db
from app.modules.contabilidad import crud
from app.modules.contabilidad.schemas.movimiento import MovimientoCreate, MovimientoResponse, ResumenFinanciero

router = APIRouter()


@router.get("/resumen", response_model=ResumenFinanciero)
def get_resumen(db: Session = Depends(get_db)):
    return crud.get_resumen(db)


@router.get("/", response_model=List[MovimientoResponse])
def get_movimientos(
    skip: int = 0,
    limit: int = 500,
    tipo: Optional[str] = Query(None),
    categoria: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    return crud.get_movimientos(db, skip=skip, limit=limit, tipo=tipo, categoria=categoria)


@router.post("/", response_model=MovimientoResponse, status_code=201)
def create_movimiento(movimiento: MovimientoCreate, db: Session = Depends(get_db)):
    return crud.create_movimiento(db, movimiento)


@router.delete("/{movimiento_id}", status_code=204)
def delete_movimiento(movimiento_id: int, db: Session = Depends(get_db)):
    success = crud.delete_movimiento(db, movimiento_id)
    if not success:
        raise HTTPException(status_code=404, detail="Movimiento no encontrado")
    return None

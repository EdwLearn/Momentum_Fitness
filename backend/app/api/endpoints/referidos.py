from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.database import get_db
from app.schemas.referido import Referido, ReferidoCreate, ReferidoUpdate, ReferidoDetallado, ReferidoStats
from app.crud import referidos as crud_referidos

router = APIRouter()


@router.get("/", response_model=List[Referido])
def read_referidos(
    skip: int = 0,
    limit: int = 100,
    referidor_id: Optional[int] = Query(None, description="Filtrar por ID del referidor"),
    referido_id: Optional[int] = Query(None, description="Filtrar por ID del referido"),
    cumple_condicion: Optional[bool] = Query(None, description="Filtrar por condición cumplida"),
    db: Session = Depends(get_db)
):
    """
    Obtener lista de referidos con filtros opcionales
    """
    referidos = crud_referidos.get_referidos(
        db=db,
        skip=skip,
        limit=limit,
        referidor_id=referidor_id,
        referido_id=referido_id,
        cumple_condicion=cumple_condicion
    )
    return referidos


@router.get("/detallados", response_model=List[ReferidoDetallado])
def read_referidos_detallados(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """
    Obtener lista de referidos con información detallada de usuarios y planes
    """
    return crud_referidos.get_referidos_detallados(db=db, skip=skip, limit=limit)


@router.get("/stats", response_model=ReferidoStats)
def read_referidos_stats(db: Session = Depends(get_db)):
    """
    Obtener estadísticas del programa de referidos
    """
    return crud_referidos.get_referidos_stats(db)


@router.get("/{referido_id}", response_model=Referido)
def read_referido(referido_id: int, db: Session = Depends(get_db)):
    """
    Obtener un referido específico por ID
    """
    referido = crud_referidos.get_referido(db, referido_id=referido_id)
    if referido is None:
        raise HTTPException(status_code=404, detail="Referido no encontrado")
    return referido


@router.get("/usuario/{usuario_id}/referidos-hechos", response_model=List[Referido])
def read_referidos_hechos(
    usuario_id: int,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """
    Obtener todos los referidos hechos por un usuario (como referidor)
    """
    return crud_referidos.get_referidos(
        db=db,
        skip=skip,
        limit=limit,
        referidor_id=usuario_id
    )


@router.get("/usuario/{usuario_id}/conteo-activos", response_model=dict)
def conteo_referidos_activos(usuario_id: int, db: Session = Depends(get_db)):
    """
    Contar referidos activos de un usuario
    """
    count = crud_referidos.contar_referidos_activos(db, referidor_id=usuario_id)
    return {"usuario_id": usuario_id, "referidos_activos": count}


@router.post("/", response_model=Referido, status_code=201)
def create_referido(referido: ReferidoCreate, db: Session = Depends(get_db)):
    """
    Crear un nuevo referido
    """
    # Verificar que referidor y referido sean diferentes
    if referido.referidor_id == referido.referido_id:
        raise HTTPException(
            status_code=400,
            detail="El referidor y el referido no pueden ser el mismo usuario"
        )

    return crud_referidos.create_referido(db=db, referido=referido)


@router.put("/{referido_id}", response_model=Referido)
def update_referido(
    referido_id: int,
    referido: ReferidoUpdate,
    db: Session = Depends(get_db)
):
    """
    Actualizar un referido existente
    """
    db_referido = crud_referidos.update_referido(db, referido_id=referido_id, referido_update=referido)
    if db_referido is None:
        raise HTTPException(status_code=404, detail="Referido no encontrado")
    return db_referido


@router.delete("/{referido_id}", status_code=204)
def delete_referido(referido_id: int, db: Session = Depends(get_db)):
    """
    Eliminar un referido
    """
    success = crud_referidos.delete_referido(db, referido_id=referido_id)
    if not success:
        raise HTTPException(status_code=404, detail="Referido no encontrado")
    return None


@router.post("/{referido_id}/activar", response_model=Referido)
def activar_beneficio(
    referido_id: int,
    tipo_beneficio: str = Query(..., description="Tipo de beneficio a otorgar"),
    db: Session = Depends(get_db)
):
    """
    Activar el beneficio para un referido
    """
    db_referido = crud_referidos.activar_beneficio_referido(
        db,
        referido_id=referido_id,
        tipo_beneficio=tipo_beneficio
    )
    if db_referido is None:
        raise HTTPException(status_code=404, detail="Referido no encontrado")
    return db_referido


@router.get("/{referido_id}/verificar-condicion", response_model=dict)
def verificar_condicion(referido_id: int, db: Session = Depends(get_db)):
    """
    Verificar si el referido cumple la condición para otorgar beneficio
    """
    cumple = crud_referidos.verificar_cumple_condicion(db, referido_id=referido_id)
    return {
        "referido_id": referido_id,
        "cumple_condicion": cumple
    }

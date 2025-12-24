from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.database import get_db
from app.schemas.cupon import Cupon, CuponCreate, CuponUpdate, CuponStats
from app.crud import cupones as crud_cupones

router = APIRouter()


@router.get("/", response_model=List[Cupon])
def read_cupones(
    skip: int = 0,
    limit: int = 100,
    nicho: Optional[str] = Query(None, description="Filtrar por nicho"),
    activo: Optional[bool] = Query(None, description="Filtrar por estado activo"),
    search: Optional[str] = Query(None, description="Buscar por código"),
    db: Session = Depends(get_db)
):
    """
    Obtener lista de cupones con filtros opcionales
    """
    cupones = crud_cupones.get_cupones(
        db=db,
        skip=skip,
        limit=limit,
        nicho=nicho,
        activo=activo,
        search=search
    )
    return cupones


@router.get("/stats", response_model=CuponStats)
def read_cupones_stats(db: Session = Depends(get_db)):
    """
    Obtener estadísticas de cupones
    """
    return crud_cupones.get_cupones_stats(db)


@router.get("/{cupon_id}", response_model=Cupon)
def read_cupon(cupon_id: int, db: Session = Depends(get_db)):
    """
    Obtener un cupón específico por ID
    """
    cupon = crud_cupones.get_cupon(db, cupon_id=cupon_id)
    if cupon is None:
        raise HTTPException(status_code=404, detail="Cupón no encontrado")
    return cupon


@router.get("/codigo/{codigo}", response_model=Cupon)
def read_cupon_by_codigo(codigo: str, db: Session = Depends(get_db)):
    """
    Obtener un cupón por su código
    """
    cupon = crud_cupones.get_cupon_by_codigo(db, codigo=codigo)
    if cupon is None:
        raise HTTPException(status_code=404, detail="Cupón no encontrado")
    return cupon


@router.post("/", response_model=Cupon, status_code=201)
def create_cupon(cupon: CuponCreate, db: Session = Depends(get_db)):
    """
    Crear un nuevo cupón
    """
    # Verificar que no exista un cupón con el mismo código
    existing_cupon = crud_cupones.get_cupon_by_codigo(db, codigo=cupon.codigo)
    if existing_cupon:
        raise HTTPException(
            status_code=400,
            detail=f"Ya existe un cupón con el código '{cupon.codigo}'"
        )

    return crud_cupones.create_cupon(db=db, cupon=cupon)


@router.put("/{cupon_id}", response_model=Cupon)
def update_cupon(
    cupon_id: int,
    cupon: CuponUpdate,
    db: Session = Depends(get_db)
):
    """
    Actualizar un cupón existente
    """
    # Si se está actualizando el código, verificar que no exista
    if cupon.codigo:
        existing = crud_cupones.get_cupon_by_codigo(db, codigo=cupon.codigo)
        if existing and existing.id != cupon_id:
            raise HTTPException(
                status_code=400,
                detail=f"Ya existe un cupón con el código '{cupon.codigo}'"
            )

    db_cupon = crud_cupones.update_cupon(db, cupon_id=cupon_id, cupon_update=cupon)
    if db_cupon is None:
        raise HTTPException(status_code=404, detail="Cupón no encontrado")
    return db_cupon


@router.delete("/{cupon_id}", status_code=204)
def delete_cupon(cupon_id: int, db: Session = Depends(get_db)):
    """
    Eliminar un cupón
    """
    success = crud_cupones.delete_cupon(db, cupon_id=cupon_id)
    if not success:
        raise HTTPException(status_code=404, detail="Cupón no encontrado")
    return None


@router.post("/{cupon_id}/toggle", response_model=Cupon)
def toggle_cupon_activo(cupon_id: int, db: Session = Depends(get_db)):
    """
    Alternar estado activo/inactivo de un cupón
    """
    db_cupon = crud_cupones.toggle_cupon_activo(db, cupon_id=cupon_id)
    if db_cupon is None:
        raise HTTPException(status_code=404, detail="Cupón no encontrado")
    return db_cupon


@router.post("/aplicar/{codigo}", response_model=Cupon)
def aplicar_cupon(codigo: str, db: Session = Depends(get_db)):
    """
    Aplicar un cupón (verificar validez e incrementar contador)
    """
    cupon = crud_cupones.aplicar_cupon(db, codigo=codigo)
    if cupon is None:
        raise HTTPException(
            status_code=400,
            detail="Cupón inválido, inactivo o expirado"
        )
    return cupon


@router.post("/reset-anuales", status_code=200)
def reset_usos_anuales(db: Session = Depends(get_db)):
    """
    Resetear contadores anuales de todos los cupones
    (ejecutar al inicio de cada año)
    """
    count = crud_cupones.reset_usos_anuales(db)
    return {"message": f"Se resetearon {count} cupones"}

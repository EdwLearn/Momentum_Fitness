from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from app.core.database import get_db
from app import crud
from app.schemas import empleado as schemas

router = APIRouter()


@router.get("/", response_model=List[schemas.Empleado])
def get_empleados(
    skip: int = 0,
    limit: int = 100,
    tipo_empleado: Optional[str] = Query(None),
    activo: Optional[int] = Query(None),
    db: Session = Depends(get_db)
):
    """Obtener lista de empleados con filtros opcionales"""
    empleados = crud.empleados.get_empleados(
        db, skip=skip, limit=limit, tipo_empleado=tipo_empleado, activo=activo
    )
    return empleados


@router.get("/{empleado_id}", response_model=schemas.Empleado)
def get_empleado(empleado_id: int, db: Session = Depends(get_db)):
    """Obtener un empleado por ID"""
    empleado = crud.empleados.get_empleado(db, empleado_id=empleado_id)
    if not empleado:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Empleado no encontrado"
        )
    return empleado


@router.get("/cedula/{cedula}", response_model=schemas.Empleado)
def get_empleado_by_cedula(cedula: str, db: Session = Depends(get_db)):
    """Obtener un empleado por cédula"""
    empleado = crud.empleados.get_empleado_by_cedula(db, cedula=cedula)
    if not empleado:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Empleado no encontrado"
        )
    return empleado


@router.post("/", response_model=schemas.Empleado, status_code=status.HTTP_201_CREATED)
def create_empleado(empleado: schemas.EmpleadoCreate, db: Session = Depends(get_db)):
    """Crear un nuevo empleado"""
    # Verificar si la cédula ya existe
    db_empleado = crud.empleados.get_empleado_by_cedula(db, cedula=empleado.cedula)
    if db_empleado:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Ya existe un empleado con esta cédula"
        )

    return crud.empleados.create_empleado(db, empleado=empleado)


@router.put("/{empleado_id}", response_model=schemas.Empleado)
def update_empleado(
    empleado_id: int,
    empleado: schemas.EmpleadoUpdate,
    db: Session = Depends(get_db)
):
    """Actualizar un empleado existente"""
    db_empleado = crud.empleados.update_empleado(db, empleado_id=empleado_id, empleado=empleado)
    if not db_empleado:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Empleado no encontrado"
        )
    return db_empleado


@router.delete("/{empleado_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_empleado(empleado_id: int, db: Session = Depends(get_db)):
    """Eliminar un empleado"""
    success = crud.empleados.delete_empleado(db, empleado_id=empleado_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Empleado no encontrado"
        )
    return None


@router.get("/activos/list", response_model=List[schemas.Empleado])
def get_empleados_activos(db: Session = Depends(get_db)):
    """Obtener empleados activos"""
    return crud.empleados.get_empleados_activos(db)

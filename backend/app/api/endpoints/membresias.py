from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.schemas import membresia as schemas
from app.crud import membresias as crud
from app.crud import usuarios as usuarios_crud
from app.modules.usuarios.models.membresia import PLANES_CONFIG, TipoPlan

router = APIRouter()

@router.get("/planes", response_model=List[schemas.PlanDisponible])
def get_planes_disponibles():
    """
    Obtiene la lista de todos los planes de membresía disponibles.
    Útil para mostrar opciones al usuario antes de comprar.
    """
    planes = []
    for tipo_plan, config in PLANES_CONFIG.items():
        planes.append(schemas.PlanDisponible(
            tipo=tipo_plan.value,
            nombre=config["nombre"],
            precio=config["precio"],
            duracion_dias=config["dias"]
        ))
    return planes

@router.post("/", response_model=schemas.Membresia, status_code=status.HTTP_201_CREATED)
def create_membresia(membresia: schemas.MembresiaCreateSimple, db: Session = Depends(get_db)):
    """
    Crea una nueva membresía para un usuario.
    Solo requiere usuario_id y tipo_plan.
    Auto-calcula: precio, duración, fecha_inicio, fecha_fin.
    Desactiva automáticamente membresías anteriores del usuario.
    """
    # Validar que el usuario existe
    db_usuario = usuarios_crud.get_usuario(db, usuario_id=membresia.usuario_id)
    if not db_usuario:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Usuario con ID {membresia.usuario_id} no encontrado"
        )

    # Crear membresía con auto-cálculo
    try:
        return crud.create_membresia_simple(db=db, membresia_simple=membresia)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.post("/renovar/{usuario_id}", response_model=schemas.Membresia, status_code=status.HTTP_201_CREATED)
def renovar_membresia_usuario(
    usuario_id: int,
    datos_renovacion: schemas.MembresiaCreateSimple,
    db: Session = Depends(get_db)
):
    """
    Renueva o cambia el plan de un usuario existente.
    Desactiva automáticamente la membresía anterior.
    """
    # Validar que el usuario existe
    db_usuario = usuarios_crud.get_usuario(db, usuario_id=usuario_id)
    if not db_usuario:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Usuario con ID {usuario_id} no encontrado"
        )

    # Validar que referido_por_id es válido si se proporciona
    if datos_renovacion.referido_por_id:
        referidor = usuarios_crud.get_usuario(db, usuario_id=datos_renovacion.referido_por_id)
        if not referidor:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Referidor con ID {datos_renovacion.referido_por_id} no encontrado"
            )

    # Crear nueva membresía (desactiva automáticamente la anterior)
    try:
        return crud.renovar_membresia(
            db=db,
            usuario_id=usuario_id,
            nuevo_tipo_plan=datos_renovacion.tipo_plan,
            referido_por_id=datos_renovacion.referido_por_id,
            tipo_pago=datos_renovacion.tipo_pago
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.get("/", response_model=List[schemas.Membresia])
def read_membresias(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Obtiene todas las membresías con paginación"""
    membresias = crud.get_membresias(db, skip=skip, limit=limit)
    return membresias

@router.get("/usuario/{usuario_id}", response_model=schemas.Membresia)
def read_membresia_activa_usuario(usuario_id: int, db: Session = Depends(get_db)):
    """
    Obtiene la membresía ACTIVA y vigente de un usuario.
    Solo devuelve la membresía si está activa y no ha vencido.
    """
    membresia_activa = crud.get_membresia_activa_by_usuario(db, usuario_id=usuario_id)
    if not membresia_activa:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Usuario {usuario_id} no tiene membresía activa"
        )
    return membresia_activa

@router.get("/usuario/{usuario_id}/todas", response_model=List[schemas.Membresia])
def read_todas_membresias_usuario(usuario_id: int, db: Session = Depends(get_db)):
    """Obtiene TODAS las membresías de un usuario (activas e inactivas)"""
    membresias = crud.get_membresias_by_usuario(db, usuario_id=usuario_id)
    return membresias

@router.get("/{membresia_id}", response_model=schemas.Membresia)
def read_membresia(membresia_id: int, db: Session = Depends(get_db)):
    """Obtiene una membresía específica por ID"""
    db_membresia = crud.get_membresia(db, membresia_id=membresia_id)
    if db_membresia is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Membresía no encontrada"
        )
    return db_membresia

@router.put("/{membresia_id}", response_model=schemas.Membresia)
def update_membresia(membresia_id: int, membresia: schemas.MembresiaUpdate, db: Session = Depends(get_db)):
    """Actualiza una membresía existente"""
    db_membresia = crud.update_membresia(db, membresia_id=membresia_id, membresia=membresia)
    if db_membresia is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Membresía no encontrada"
        )
    return db_membresia

@router.delete("/{membresia_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_membresia(membresia_id: int, db: Session = Depends(get_db)):
    """Elimina una membresía"""
    success = crud.delete_membresia(db, membresia_id=membresia_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Membresía no encontrada"
        )
    return None

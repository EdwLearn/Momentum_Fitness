from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import and_, func
from typing import List
from datetime import datetime
from pydantic import BaseModel
from app.core.database import get_db
from app.schemas import membresia as schemas
from app.crud import membresias as crud
from app.crud import usuarios as usuarios_crud
from app.modules.usuarios.models.membresia import PLANES_CONFIG, TipoPlan, Membresia, EstadoMembresia
from app.models.usuario import Usuario

router = APIRouter()

class SuscripcionesStats(BaseModel):
    total_activas: int
    por_referidos: int
    tipos_planes: int
    pase_diario: int
    pase_flex: int
    mensual: int
    plan_3_meses: int
    plan_6_meses: int
    elite_anual: int
    cortesia: int

@router.get("/stats", response_model=SuscripcionesStats)
def get_suscripciones_stats(db: Session = Depends(get_db)):
    """
    Obtiene estadísticas de suscripciones para las tarjetas de la página de suscripciones.
    Retorna total activas, por referidos, tipos de planes, y conteo por cada tipo de plan.
    """
    now = datetime.utcnow()

    # Total de membresías activas
    total_activas = db.query(Membresia).filter(
        and_(
            Membresia.activo == True,
            Membresia.estado == EstadoMembresia.ACTIVA,
            Membresia.fecha_fin >= now
        )
    ).count()

    # Membresías activas por referidos
    # Necesitamos hacer join con usuarios para saber si fueron referidos
    por_referidos = db.query(Membresia).join(
        Usuario, Usuario.id == Membresia.usuario_id
    ).filter(
        and_(
            Membresia.activo == True,
            Membresia.estado == EstadoMembresia.ACTIVA,
            Membresia.fecha_fin >= now,
            Usuario.referido_por_cedula.isnot(None)
        )
    ).count()

    # Contar por tipo de plan (solo activas)
    conteo_planes = db.query(
        Membresia.tipo_plan,
        func.count(Membresia.id).label('count')
    ).filter(
        and_(
            Membresia.activo == True,
            Membresia.estado == EstadoMembresia.ACTIVA,
            Membresia.fecha_fin >= now
        )
    ).group_by(Membresia.tipo_plan).all()

    # Crear diccionario con los conteos
    planes_dict = {plan: 0 for plan in TipoPlan}
    for tipo_plan, count in conteo_planes:
        planes_dict[tipo_plan] = count

    return SuscripcionesStats(
        total_activas=total_activas,
        por_referidos=por_referidos,
        tipos_planes=7,  # Número fijo de tipos de planes disponibles (incluyendo cortesía)
        pase_diario=planes_dict[TipoPlan.PASE_DIARIO],
        pase_flex=planes_dict[TipoPlan.PASE_FLEX],
        mensual=planes_dict[TipoPlan.MENSUAL],
        plan_3_meses=planes_dict[TipoPlan.PLAN_3_MESES],
        plan_6_meses=planes_dict[TipoPlan.PLAN_6_MESES],
        elite_anual=planes_dict[TipoPlan.ELITE_ANUAL],
        cortesia=planes_dict[TipoPlan.CORTESIA]
    )

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

@router.post("/cortesia", response_model=schemas.Membresia, status_code=status.HTTP_201_CREATED)
def create_cortesia(cortesia: schemas.CortesiaCreate, db: Session = Depends(get_db)):
    """
    Crea una cortesía flexible para un usuario.

    Permite configurar:
    - duración en días (1-365)
    - visitas limitadas (opcional, como pase flex)
    - motivo de la cortesía

    Características:
    - Precio siempre es 0
    - No aplican cupones ni referidos
    - Desactiva membresías anteriores del usuario
    """
    # Validar que el usuario existe
    db_usuario = usuarios_crud.get_usuario(db, usuario_id=cortesia.usuario_id)
    if not db_usuario:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Usuario con ID {cortesia.usuario_id} no encontrado"
        )

    try:
        return crud.create_cortesia(db=db, cortesia=cortesia)
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

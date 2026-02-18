from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date, datetime, timedelta, timezone

from app.core.database import get_db
from app import crud
from app.schemas import asistencia_empleado as schemas

# Timezone de Colombia (UTC-5)
COLOMBIA_TZ = timezone(timedelta(hours=-5))

router = APIRouter()


@router.post("/entrada", response_model=schemas.AsistenciaEmpleado, status_code=status.HTTP_201_CREATED)
def marcar_entrada(entrada: schemas.MarcarEntrada, db: Session = Depends(get_db)):
    """Marcar entrada de un empleado"""
    # Verificar que el empleado existe
    empleado = crud.empleados.get_empleado(db, empleado_id=entrada.empleado_id)
    if not empleado:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Empleado no encontrado"
        )

    try:
        asistencia = crud.asistencia_empleados.marcar_entrada(
            db, empleado_id=entrada.empleado_id, hora_entrada=entrada.hora_entrada
        )
        return asistencia
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.post("/salida", response_model=schemas.AsistenciaEmpleado)
def marcar_salida(salida: schemas.MarcarSalida, db: Session = Depends(get_db)):
    """Marcar salida de un empleado y calcular horas trabajadas"""
    # Verificar que el empleado existe
    empleado = crud.empleados.get_empleado(db, empleado_id=salida.empleado_id)
    if not empleado:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Empleado no encontrado"
        )

    try:
        asistencia = crud.asistencia_empleados.marcar_salida(
            db, empleado_id=salida.empleado_id, hora_salida=salida.hora_salida
        )
        return asistencia
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.get("/fecha/{fecha}", response_model=List[schemas.AsistenciaEmpleado])
def get_asistencias_por_fecha(fecha: date, db: Session = Depends(get_db)):
    """Obtener todas las asistencias de una fecha específica"""
    return crud.asistencia_empleados.get_asistencias_por_fecha(db, fecha=fecha)


@router.get("/empleado/{empleado_id}", response_model=List[schemas.AsistenciaEmpleado])
def get_asistencias_empleado(
    empleado_id: int,
    fecha_inicio: Optional[date] = Query(None),
    fecha_fin: Optional[date] = Query(None),
    db: Session = Depends(get_db)
):
    """Obtener asistencias de un empleado en un rango de fechas"""
    # Verificar que el empleado existe
    empleado = crud.empleados.get_empleado(db, empleado_id=empleado_id)
    if not empleado:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Empleado no encontrado"
        )

    return crud.asistencia_empleados.get_asistencias_empleado(
        db, empleado_id=empleado_id, fecha_inicio=fecha_inicio, fecha_fin=fecha_fin
    )


@router.get("/empleado/{empleado_id}/horas-semanales")
def get_horas_semanales(empleado_id: int, db: Session = Depends(get_db)):
    """Obtener horas trabajadas en la semana actual por un empleado"""
    # Verificar que el empleado existe
    empleado = crud.empleados.get_empleado(db, empleado_id=empleado_id)
    if not empleado:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Empleado no encontrado"
        )

    horas = crud.asistencia_empleados.get_horas_semanales_empleado(db, empleado_id=empleado_id)
    return {"empleado_id": empleado_id, "horas_semanales": horas}


@router.get("/trabajando-hoy/list")
def get_empleados_trabajando_hoy(db: Session = Depends(get_db)):
    """Obtener empleados que están trabajando hoy"""
    return crud.asistencia_empleados.get_empleados_trabajando_hoy(db)


@router.get("/empleado/{empleado_id}/estado-hoy")
def get_estado_empleado_hoy(empleado_id: int, db: Session = Depends(get_db)):
    """Obtener el estado de asistencia de un empleado para el día de hoy"""
    # Verificar que el empleado existe
    empleado = crud.empleados.get_empleado(db, empleado_id=empleado_id)
    if not empleado:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Empleado no encontrado"
        )

    fecha_hoy = datetime.now(COLOMBIA_TZ).date()
    asistencia = crud.asistencia_empleados.get_asistencia_empleado_fecha(
        db, empleado_id=empleado_id, fecha=fecha_hoy
    )

    if not asistencia:
        return {
            "empleado_id": empleado_id,
            "fecha": fecha_hoy,
            "estado": "sin_marcar",
            "hora_entrada": None,
            "hora_salida": None
        }

    if asistencia.hora_entrada and not asistencia.hora_salida:
        estado = "entrada_marcada"
    elif asistencia.hora_entrada and asistencia.hora_salida:
        estado = "salida_marcada"
    else:
        estado = "sin_marcar"

    return {
        "empleado_id": empleado_id,
        "fecha": fecha_hoy,
        "estado": estado,
        "hora_entrada": asistencia.hora_entrada,
        "hora_salida": asistencia.hora_salida,
        "horas_trabajadas": asistencia.horas_trabajadas
    }


@router.post("/resetear-estados", status_code=status.HTTP_200_OK)
def resetear_estados_empleados(db: Session = Depends(get_db)):
    """Resetear el estado de todos los empleados a 'sin entrada' (-1) al inicio del día"""
    try:
        empleados_actualizados = crud.asistencia_empleados.resetear_estados_empleados(db)
        return {
            "message": "Estados de empleados reseteados exitosamente",
            "empleados_actualizados": empleados_actualizados
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al resetear estados: {str(e)}"
        )

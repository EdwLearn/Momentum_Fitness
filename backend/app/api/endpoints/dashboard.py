from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import and_, func, extract, Date, cast
from app.core.database import get_db
from app.models.usuario import Usuario
from app.modules.usuarios.models.membresia import Membresia, EstadoMembresia, TipoPlan
from app.modules.asistencia.models.asistencia import Asistencia
from datetime import datetime, timedelta, date
from typing import Dict, Any
from pydantic import BaseModel

router = APIRouter()

class ClientesActivosStats(BaseModel):
    total: int
    cambio_porcentual: float

class AsistenciasHoyStats(BaseModel):
    total: int
    cambio_porcentual: float

class PlanesPorVencerStats(BaseModel):
    total: int

class IngresosMesStats(BaseModel):
    total: int
    cambio_porcentual: float

class AsistenciaSemanalItem(BaseModel):
    day: str
    asistencias: int

class PlanDistributionItem(BaseModel):
    name: str
    value: int
    color: str

@router.get("/clientes-activos", response_model=ClientesActivosStats)
def get_clientes_activos_stats(db: Session = Depends(get_db)):
    """
    Retorna el número de clientes activos y el cambio porcentual vs el mes anterior
    """
    now = datetime.utcnow()

    # Clientes activos actuales (con membresía activa)
    clientes_activos_actuales = db.query(Usuario.id).join(
        Membresia, Membresia.usuario_id == Usuario.id
    ).filter(
        and_(
            Membresia.activo == True,
            Membresia.estado == EstadoMembresia.ACTIVA,
            Membresia.fecha_fin >= now
        )
    ).distinct().count()

    # Primer día del mes actual
    primer_dia_mes_actual = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)

    # Primer día del mes anterior
    if now.month == 1:
        primer_dia_mes_anterior = primer_dia_mes_actual.replace(year=now.year - 1, month=12)
    else:
        primer_dia_mes_anterior = primer_dia_mes_actual.replace(month=now.month - 1)

    # Clientes activos el mes anterior (al inicio del mes)
    # Contamos usuarios que tenían membresía activa en el inicio del mes actual
    clientes_activos_mes_anterior = db.query(Usuario.id).join(
        Membresia, Membresia.usuario_id == Usuario.id
    ).filter(
        and_(
            Membresia.activo == True,
            Membresia.fecha_inicio <= primer_dia_mes_actual,
            Membresia.fecha_fin >= primer_dia_mes_actual
        )
    ).distinct().count()

    # Calcular cambio porcentual
    if clientes_activos_mes_anterior > 0:
        cambio_porcentual = ((clientes_activos_actuales - clientes_activos_mes_anterior) / clientes_activos_mes_anterior) * 100
    else:
        cambio_porcentual = 100.0 if clientes_activos_actuales > 0 else 0.0

    return ClientesActivosStats(
        total=clientes_activos_actuales,
        cambio_porcentual=round(cambio_porcentual, 1)
    )

@router.get("/asistencias-hoy", response_model=AsistenciasHoyStats)
def get_asistencias_hoy_stats(db: Session = Depends(get_db)):
    """
    Retorna el número de asistencias de hoy y el cambio porcentual vs ayer
    """
    # Usar timezone de Colombia (UTC-5) para obtener la fecha correcta
    from datetime import timezone
    colombia_tz = timezone(timedelta(hours=-5))
    now = datetime.now(colombia_tz)
    today = now.date()
    yesterday = today - timedelta(days=1)

    # Asistencias de hoy
    asistencias_hoy = db.query(Asistencia).filter(
        Asistencia.fecha == today
    ).count()

    # Asistencias de ayer
    asistencias_ayer = db.query(Asistencia).filter(
        Asistencia.fecha == yesterday
    ).count()

    # Calcular cambio porcentual
    if asistencias_ayer > 0:
        cambio_porcentual = ((asistencias_hoy - asistencias_ayer) / asistencias_ayer) * 100
    else:
        cambio_porcentual = 100.0 if asistencias_hoy > 0 else 0.0

    return AsistenciasHoyStats(
        total=asistencias_hoy,
        cambio_porcentual=round(cambio_porcentual, 1)
    )

@router.get("/planes-por-vencer", response_model=PlanesPorVencerStats)
def get_planes_por_vencer_stats(db: Session = Depends(get_db)):
    """
    Retorna el número de planes que vencen en los próximos 7 días
    """
    now = datetime.utcnow()
    fecha_limite = now + timedelta(days=7)

    # Planes que vencen en los próximos 7 días
    planes_por_vencer = db.query(Membresia).filter(
        and_(
            Membresia.activo == True,
            Membresia.estado == EstadoMembresia.ACTIVA,
            Membresia.fecha_fin >= now,
            Membresia.fecha_fin <= fecha_limite
        )
    ).count()

    return PlanesPorVencerStats(
        total=planes_por_vencer
    )

@router.get("/ingresos-mes", response_model=IngresosMesStats)
def get_ingresos_mes_stats(db: Session = Depends(get_db)):
    """
    Retorna los ingresos del mes actual y el cambio porcentual vs el mes anterior
    """
    now = datetime.utcnow()

    # Primer día del mes actual
    primer_dia_mes_actual = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)

    # Último día del mes actual (primer día del siguiente mes)
    if now.month == 12:
        primer_dia_mes_siguiente = primer_dia_mes_actual.replace(year=now.year + 1, month=1)
    else:
        primer_dia_mes_siguiente = primer_dia_mes_actual.replace(month=now.month + 1)

    # Primer día del mes anterior
    if now.month == 1:
        primer_dia_mes_anterior = primer_dia_mes_actual.replace(year=now.year - 1, month=12)
    else:
        primer_dia_mes_anterior = primer_dia_mes_actual.replace(month=now.month - 1)

    # Calcular ingresos del mes actual
    # Sumamos el precio_final (si existe) o precio de membresías creadas este mes
    ingresos_mes_actual = db.query(
        func.coalesce(func.sum(func.coalesce(Membresia.precio_final, Membresia.precio)), 0)
    ).filter(
        and_(
            Membresia.fecha_inicio >= primer_dia_mes_actual,
            Membresia.fecha_inicio < primer_dia_mes_siguiente
        )
    ).scalar() or 0

    # Calcular ingresos del mes anterior
    ingresos_mes_anterior = db.query(
        func.coalesce(func.sum(func.coalesce(Membresia.precio_final, Membresia.precio)), 0)
    ).filter(
        and_(
            Membresia.fecha_inicio >= primer_dia_mes_anterior,
            Membresia.fecha_inicio < primer_dia_mes_actual
        )
    ).scalar() or 0

    # Calcular cambio porcentual
    if ingresos_mes_anterior > 0:
        cambio_porcentual = ((ingresos_mes_actual - ingresos_mes_anterior) / ingresos_mes_anterior) * 100
    else:
        cambio_porcentual = 100.0 if ingresos_mes_actual > 0 else 0.0

    return IngresosMesStats(
        total=int(ingresos_mes_actual),
        cambio_porcentual=round(cambio_porcentual, 1)
    )

@router.get("/asistencia-semanal", response_model=list[AsistenciaSemanalItem])
def get_asistencia_semanal(db: Session = Depends(get_db)):
    """
    Retorna las asistencias de la semana actual (Lunes a Domingo)
    """
    # Usar timezone de Colombia (UTC-5) para obtener la fecha correcta
    from datetime import timezone
    colombia_tz = timezone(timedelta(hours=-5))
    now = datetime.now(colombia_tz)
    today = now.date()

    # Definir nombres de días en español
    dias_semana = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"]

    # Calcular el lunes de la semana actual
    # weekday(): 0=Lunes, 1=Martes, ..., 6=Domingo
    dias_desde_lunes = today.weekday()
    lunes = today - timedelta(days=dias_desde_lunes)

    # Obtener asistencias de Lunes a Domingo
    resultado = []
    for i in range(7):  # 0=Lun, 1=Mar, ..., 6=Dom
        fecha = lunes + timedelta(days=i)

        # Contar asistencias para ese día
        count = db.query(Asistencia).filter(
            Asistencia.fecha == fecha
        ).count()

        resultado.append(AsistenciaSemanalItem(
            day=dias_semana[i],
            asistencias=count
        ))

    return resultado

@router.get("/distribucion-planes", response_model=list[PlanDistributionItem])
def get_distribucion_planes(db: Session = Depends(get_db)):
    """
    Retorna la distribución de clientes activos por tipo de plan
    """
    now = datetime.utcnow()

    # Mapeo de colores por tipo de plan
    colores_planes = {
        TipoPlan.PASE_DIARIO: "#F97316",      # Naranja
        TipoPlan.PASE_FLEX: "#EC4899",        # Rosa
        TipoPlan.MENSUAL: "#A4FF1A",          # Verde lima
        TipoPlan.PLAN_3_MESES: "#22D3EE",     # Cyan
        TipoPlan.PLAN_6_MESES: "#8B5CF6",     # Púrpura
        TipoPlan.ELITE_ANUAL: "#6366F1",      # Índigo
    }

    # Nombres amigables para los planes
    nombres_planes = {
        TipoPlan.PASE_DIARIO: "Pase Diario",
        TipoPlan.PASE_FLEX: "Pase Flex",
        TipoPlan.MENSUAL: "Mensual",
        TipoPlan.PLAN_3_MESES: "3 Meses",
        TipoPlan.PLAN_6_MESES: "6 Meses",
        TipoPlan.ELITE_ANUAL: "Elite Anual",
    }

    # Contar membresías activas por tipo de plan
    distribucion = db.query(
        Membresia.tipo_plan,
        func.count(func.distinct(Membresia.usuario_id)).label('count')
    ).filter(
        and_(
            Membresia.activo == True,
            Membresia.estado == EstadoMembresia.ACTIVA,
            Membresia.fecha_fin >= now
        )
    ).group_by(Membresia.tipo_plan).all()

    # Construir resultado
    resultado = []
    for tipo_plan, count in distribucion:
        if count > 0:  # Solo incluir planes con al menos 1 cliente
            resultado.append(PlanDistributionItem(
                name=nombres_planes.get(tipo_plan, tipo_plan.value),
                value=count,
                color=colores_planes.get(tipo_plan, "#6B7280")  # Gris por defecto
            ))

    # Ordenar por valor descendente
    resultado.sort(key=lambda x: x.value, reverse=True)

    return resultado

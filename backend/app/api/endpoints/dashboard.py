from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import and_, func, extract, Date, cast
from app.core.database import get_db
from app.models.usuario import Usuario
from app.modules.usuarios.models.membresia import Membresia, EstadoMembresia, TipoPlan
from app.modules.asistencia.models.asistencia import Asistencia
from app.modules.empleados.models.empleado import Empleado
from app.modules.empleados.models.asistencia_empleado import AsistenciaEmpleado
from datetime import datetime, timedelta, date, timezone
from typing import Dict, Any, Optional
from pydantic import BaseModel
from sqlalchemy import or_

# Timezone de Colombia (UTC-5)
COLOMBIA_TZ = timezone(timedelta(hours=-5))

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

class ProximaRenovacionItem(BaseModel):
    id: int
    usuario: str
    plan: str
    fecha_fin: str
    estado: str

class HistorialClienteStats(BaseModel):
    total_dias_activo: int
    fecha_primera_inscripcion: str
    membresias: list[dict]

class EmpleadoDashboardItem(BaseModel):
    id: int
    nombre: str
    cedula: str
    tipo_empleado: str
    dias_trabajados_mes: int
    horas_trabajadas_mes: float
    ultimo_registro: Optional[str]

class HistorialEmpleadoStats(BaseModel):
    total_dias_trabajados: int
    total_horas_trabajadas: float
    fecha_contratacion: str
    asistencias: list[dict]
    comparacion_empleados: list[dict]

@router.get("/usuarios-activos", response_model=ClientesActivosStats)
def get_clientes_activos_stats(db: Session = Depends(get_db)):
    """
    Retorna el número de usuarios activos y el cambio porcentual vs el mes anterior
    """
    now = datetime.now(COLOMBIA_TZ)

    # Usuarios activos actuales (con membresía activa)
    clientes_activos_actuales = db.query(Usuario.id).join(
        Membresia, Membresia.usuario_id == Usuario.id
    ).filter(
        and_(
            Membresia.activo == True,
            Membresia.estado == EstadoMembresia.ACTIVA,
            Membresia.fecha_fin >= now,
            or_(
                Membresia.visitas_disponibles == None,
                Membresia.visitas_disponibles > 0
            )
        )
    ).distinct().count()

    # Primer día del mes actual
    primer_dia_mes_actual = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)

    # Primer día del mes anterior
    if now.month == 1:
        primer_dia_mes_anterior = primer_dia_mes_actual.replace(year=now.year - 1, month=12)
    else:
        primer_dia_mes_anterior = primer_dia_mes_actual.replace(month=now.month - 1)

    # Usuarios activos el mes anterior (al inicio del mes)
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
    now = datetime.now(COLOMBIA_TZ)
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
    now = datetime.now(COLOMBIA_TZ)
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
    now = datetime.now(COLOMBIA_TZ)

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
    now = datetime.now(COLOMBIA_TZ)
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
    Retorna la distribución de usuarios activos por tipo de plan
    """
    now = datetime.now(COLOMBIA_TZ)

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
            Membresia.fecha_fin >= now,
            or_(
                Membresia.visitas_disponibles == None,
                Membresia.visitas_disponibles > 0
            )
        )
    ).group_by(Membresia.tipo_plan).all()

    # Construir resultado
    resultado = []
    for tipo_plan, count in distribucion:
        if count > 0:  # Solo incluir planes con al menos 1 usuario
            resultado.append(PlanDistributionItem(
                name=nombres_planes.get(tipo_plan, tipo_plan.value),
                value=count,
                color=colores_planes.get(tipo_plan, "#6B7280")  # Gris por defecto
            ))

    # Ordenar por valor descendente
    resultado.sort(key=lambda x: x.value, reverse=True)

    return resultado

@router.get("/proximas-renovaciones", response_model=list[ProximaRenovacionItem])
def get_proximas_renovaciones(db: Session = Depends(get_db)):
    """
    Retorna los usuarios con planes que vencen en los próximos 7 días
    """
    now = datetime.now(COLOMBIA_TZ)
    fecha_limite = now + timedelta(days=7)

    # Nombres amigables para los planes
    nombres_planes = {
        TipoPlan.PASE_DIARIO: "Pase Diario",
        TipoPlan.PASE_FLEX: "Pase Flex",
        TipoPlan.MENSUAL: "Mensual",
        TipoPlan.PLAN_3_MESES: "3 Meses",
        TipoPlan.PLAN_6_MESES: "6 Meses",
        TipoPlan.ELITE_ANUAL: "Elite Anual",
    }

    # Obtener membresías que vencen en los próximos 7 días
    membresias_por_vencer = db.query(Membresia).filter(
        and_(
            Membresia.activo == True,
            Membresia.estado == EstadoMembresia.ACTIVA,
            Membresia.fecha_fin >= now,
            Membresia.fecha_fin <= fecha_limite
        )
    ).all()

    # Construir resultado
    resultado = []
    for membresia in membresias_por_vencer:
        usuario = membresia.usuario

        # Calcular estado basado en días restantes
        dias_restantes = (membresia.fecha_fin - now).days
        if dias_restantes < 7:
            estado = "Por vencer"
        else:
            estado = "Activo"

        resultado.append(ProximaRenovacionItem(
            id=usuario.id,
            usuario=f"{usuario.nombre} {usuario.apellido}",
            plan=nombres_planes.get(membresia.tipo_plan, membresia.tipo_plan.value),
            fecha_fin=membresia.fecha_fin.strftime("%Y-%m-%d"),
            estado=estado
        ))

    # Ordenar por fecha de fin (más cercano primero)
    resultado.sort(key=lambda x: x.fecha_fin)

    return resultado

@router.get("/usuarios/{cliente_id}/historial", response_model=HistorialClienteStats)
def get_historial_cliente(cliente_id: int, db: Session = Depends(get_db)):
    """
    Retorna el historial completo de un usuario: tiempo total con suscripción y todas sus membresías
    """
    # Obtener todas las membresías del usuario (ordenadas por fecha de inicio)
    membresias = db.query(Membresia).filter(
        Membresia.usuario_id == cliente_id
    ).order_by(Membresia.fecha_inicio.asc()).all()

    if not membresias:
        # Si no hay membresías, retornar datos vacíos
        return HistorialClienteStats(
            total_dias_activo=0,
            fecha_primera_inscripcion="N/A",
            membresias=[]
        )

    # Nombres amigables para los planes
    nombres_planes = {
        TipoPlan.PASE_DIARIO: "Pase Diario",
        TipoPlan.PASE_FLEX: "Pase Flex",
        TipoPlan.MENSUAL: "Mensual",
        TipoPlan.PLAN_3_MESES: "3 Meses",
        TipoPlan.PLAN_6_MESES: "6 Meses",
        TipoPlan.ELITE_ANUAL: "Elite Anual",
    }

    # Nombres amigables para estados
    nombres_estados = {
        EstadoMembresia.ACTIVA: "Activa",
        EstadoMembresia.VENCIDA: "Vencida",
        EstadoMembresia.SUSPENDIDA: "Suspendida",
        EstadoMembresia.CANCELADA: "Cancelada",
    }

    # Calcular total de días activo (sumando duraciones de todas las membresías)
    total_dias_activo = sum(m.duracion_dias for m in membresias)

    # Fecha de primera inscripción
    fecha_primera_inscripcion = membresias[0].fecha_inicio.strftime("%Y-%m-%d")

    # Obtener fecha actual para comparar estados
    now = datetime.now(COLOMBIA_TZ)

    # Construir lista de membresías con detalles
    membresias_detalle = []
    for m in membresias:
        # Calcular el estado real basado en la fecha de fin y el estado de la membresía
        estado_real = m.estado

        # Si la membresía está marcada como activa pero ya venció, cambiar a vencida
        if m.estado == EstadoMembresia.ACTIVA and m.fecha_fin < now:
            estado_real = EstadoMembresia.VENCIDA
        # Si la membresía no está activa (activo=False) y no está cancelada/suspendida, es vencida
        elif not m.activo and m.estado not in [EstadoMembresia.CANCELADA, EstadoMembresia.SUSPENDIDA]:
            estado_real = EstadoMembresia.VENCIDA

        membresias_detalle.append({
            "id": m.id,
            "tipo_plan": nombres_planes.get(m.tipo_plan, m.tipo_plan.value),
            "estado": nombres_estados.get(estado_real, estado_real.value),
            "fecha_inicio": m.fecha_inicio.strftime("%Y-%m-%d"),
            "fecha_fin": m.fecha_fin.strftime("%Y-%m-%d"),
            "duracion_dias": m.duracion_dias,
            "precio": m.precio_final if m.precio_final else m.precio,
        })

    return HistorialClienteStats(
        total_dias_activo=total_dias_activo,
        fecha_primera_inscripcion=fecha_primera_inscripcion,
        membresias=membresias_detalle
    )

@router.get("/empleados", response_model=list[EmpleadoDashboardItem])
def get_empleados_dashboard(db: Session = Depends(get_db)):
    """
    Retorna todos los empleados con estadísticas del mes actual
    """
    now = datetime.now(COLOMBIA_TZ)

    # Primer día del mes actual
    primer_dia_mes_actual = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)

    # Obtener todos los empleados
    empleados = db.query(Empleado).all()

    # Mapeo de nombres de tipos de empleados
    nombres_tipos = {
        "entrenador": "Entrenador",
        "recepcion": "Recepción",
    }

    resultado = []
    for empleado in empleados:
        # Obtener asistencias del mes actual
        asistencias_mes = db.query(AsistenciaEmpleado).filter(
            and_(
                AsistenciaEmpleado.empleado_id == empleado.id,
                AsistenciaEmpleado.fecha >= primer_dia_mes_actual.date()
            )
        ).all()

        # Calcular días trabajados (días con registro)
        dias_trabajados_mes = len(asistencias_mes)

        # Calcular horas trabajadas
        horas_trabajadas_mes = sum(
            a.horas_trabajadas for a in asistencias_mes if a.horas_trabajadas
        ) or 0.0

        # Obtener último registro
        ultima_asistencia = db.query(AsistenciaEmpleado).filter(
            AsistenciaEmpleado.empleado_id == empleado.id
        ).order_by(AsistenciaEmpleado.fecha.desc()).first()

        ultimo_registro = None
        if ultima_asistencia:
            ultimo_registro = ultima_asistencia.fecha.strftime("%Y-%m-%d")

        resultado.append(EmpleadoDashboardItem(
            id=empleado.id,
            nombre=f"{empleado.nombre} {empleado.apellido or ''}".strip(),
            cedula=empleado.cedula,
            tipo_empleado=nombres_tipos.get(empleado.tipo_empleado.value, empleado.tipo_empleado.value),
            dias_trabajados_mes=dias_trabajados_mes,
            horas_trabajadas_mes=round(horas_trabajadas_mes, 2),
            ultimo_registro=ultimo_registro
        ))

    # Ordenar por nombre
    resultado.sort(key=lambda x: x.nombre)

    return resultado

@router.get("/empleados/{empleado_id}/historial", response_model=HistorialEmpleadoStats)
def get_historial_empleado(empleado_id: int, db: Session = Depends(get_db)):
    """
    Retorna el historial completo de un empleado: tiempo total trabajado y todas sus asistencias
    Incluye comparación de horas trabajadas con otros empleados en los últimos 6 meses
    """
    # Obtener el empleado
    empleado = db.query(Empleado).filter(Empleado.id == empleado_id).first()

    if not empleado:
        # Si no existe el empleado, retornar datos vacíos
        return HistorialEmpleadoStats(
            total_dias_trabajados=0,
            total_horas_trabajadas=0.0,
            fecha_contratacion="N/A",
            asistencias=[],
            comparacion_empleados=[]
        )

    # Obtener todas las asistencias (ordenadas por fecha descendente)
    asistencias = db.query(AsistenciaEmpleado).filter(
        AsistenciaEmpleado.empleado_id == empleado_id
    ).order_by(AsistenciaEmpleado.fecha.desc()).all()

    # Calcular estadísticas
    total_dias_trabajados = len(asistencias)
    total_horas_trabajadas = sum(
        a.horas_trabajadas for a in asistencias if a.horas_trabajadas
    ) or 0.0

    # Fecha de contratación
    fecha_contratacion = empleado.fecha_contratacion.strftime("%Y-%m-%d") if empleado.fecha_contratacion else "N/A"

    # Construir lista de asistencias con detalles
    asistencias_detalle = []
    for a in asistencias:
        asistencias_detalle.append({
            "id": a.id,
            "fecha": a.fecha.strftime("%Y-%m-%d"),
            "hora_entrada": a.hora_entrada.strftime("%H:%M:%S") if a.hora_entrada else None,
            "hora_salida": a.hora_salida.strftime("%H:%M:%S") if a.hora_salida else None,
            "horas_trabajadas": round(a.horas_trabajadas, 2) if a.horas_trabajadas else 0.0,
        })

    # Calcular comparación con otros empleados (últimos 6 meses)
    now = datetime.now(COLOMBIA_TZ)
    seis_meses_atras = (now - timedelta(days=180)).date()

    # Obtener todos los empleados
    todos_empleados = db.query(Empleado).all()

    # Calcular horas mensuales para cada empleado en los últimos 6 meses
    comparacion_empleados = []

    for mes_offset in range(5, -1, -1):  # Últimos 6 meses (del más antiguo al más reciente)
        # Calcular primer y último día del mes
        if mes_offset == 0:
            # Mes actual
            primer_dia = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0).date()
            ultimo_dia = now.date()
        else:
            # Meses anteriores
            fecha_mes = now - timedelta(days=mes_offset * 30)
            primer_dia = fecha_mes.replace(day=1, hour=0, minute=0, second=0, microsecond=0).date()
            # Último día del mes
            if fecha_mes.month == 12:
                siguiente_mes = fecha_mes.replace(year=fecha_mes.year + 1, month=1, day=1)
            else:
                siguiente_mes = fecha_mes.replace(month=fecha_mes.month + 1, day=1)
            ultimo_dia = (siguiente_mes - timedelta(days=1)).date()

        # Nombre del mes
        mes_nombre = primer_dia.strftime("%b %Y")

        # Calcular horas para cada empleado en este mes
        for emp in todos_empleados:
            asistencias_mes = db.query(AsistenciaEmpleado).filter(
                and_(
                    AsistenciaEmpleado.empleado_id == emp.id,
                    AsistenciaEmpleado.fecha >= primer_dia,
                    AsistenciaEmpleado.fecha <= ultimo_dia
                )
            ).all()

            horas_mes = sum(
                a.horas_trabajadas for a in asistencias_mes if a.horas_trabajadas
            ) or 0.0

            # Buscar si ya existe el registro del mes
            mes_existente = next(
                (item for item in comparacion_empleados if item["mes"] == mes_nombre),
                None
            )

            if mes_existente:
                # Agregar las horas del empleado al mes existente
                if emp.id == empleado_id:
                    mes_existente["empleado_actual"] = round(horas_mes, 2)
                else:
                    mes_existente["otros_empleados"] = mes_existente.get("otros_empleados", [])
                    mes_existente["otros_empleados"].append(round(horas_mes, 2))
            else:
                # Crear nuevo registro de mes
                nuevo_mes = {
                    "mes": mes_nombre,
                    "empleado_actual": 0.0,
                    "otros_empleados": []
                }

                if emp.id == empleado_id:
                    nuevo_mes["empleado_actual"] = round(horas_mes, 2)
                else:
                    nuevo_mes["otros_empleados"].append(round(horas_mes, 2))

                comparacion_empleados.append(nuevo_mes)

    # Calcular promedio de otros empleados para cada mes
    for mes_data in comparacion_empleados:
        if mes_data["otros_empleados"]:
            mes_data["promedio_otros"] = round(
                sum(mes_data["otros_empleados"]) / len(mes_data["otros_empleados"]),
                2
            )
        else:
            mes_data["promedio_otros"] = 0.0
        # Eliminar la lista detallada de otros empleados (no la necesitamos en el frontend)
        del mes_data["otros_empleados"]

    return HistorialEmpleadoStats(
        total_dias_trabajados=total_dias_trabajados,
        total_horas_trabajadas=round(total_horas_trabajadas, 2),
        fecha_contratacion=fecha_contratacion,
        asistencias=asistencias_detalle,
        comparacion_empleados=comparacion_empleados
    )

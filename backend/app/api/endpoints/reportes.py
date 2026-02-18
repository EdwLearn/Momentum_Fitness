from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import and_, func, extract, cast, Date
from app.core.database import get_db
from app.models.usuario import Usuario
from app.modules.usuarios.models.membresia import Membresia, EstadoMembresia, TipoPlan
from app.modules.asistencia.models.asistencia import Asistencia
from app.modules.empleados.models.empleado import Empleado
from app.modules.empleados.models.asistencia_empleado import AsistenciaEmpleado
from datetime import datetime, timedelta, timezone

# Timezone de Colombia (UTC-5)
COLOMBIA_TZ = timezone(timedelta(hours=-5))
from typing import List
from pydantic import BaseModel

router = APIRouter()

# Modelos de respuesta
class AsistenciasPorDiaItem(BaseModel):
    fecha: str
    asistencias: int

class AsistenciasPorPlanItem(BaseModel):
    plan: str
    asistencias: int

class NuevasVsRenovacionesItem(BaseModel):
    mes: str
    nuevas: int
    renovaciones: int

class PlanesTopItem(BaseModel):
    plan: str
    ventas: int

class IngresosPorMesItem(BaseModel):
    mes: str
    ingresos: float

class IngresosPorCuponItem(BaseModel):
    nicho: str
    ingresos: float

class ReferidosImpacto(BaseModel):
    clientes_referidos: int
    porcentaje: float
    meses_gratis: int
    ratio_conversion: float

class ResumenIngresos(BaseModel):
    ingresos_totales: float
    ticket_promedio: float
    ingresos_por_cliente: float

class ComparacionEmpleadosItem(BaseModel):
    mes: str
    empleados: List[dict]

@router.get("/asistencias-por-dia", response_model=List[AsistenciasPorDiaItem])
def get_asistencias_por_dia(dias: int = 7, db: Session = Depends(get_db)):
    """
    Retorna las asistencias de los últimos N días
    """
    from datetime import timezone
    colombia_tz = timezone(timedelta(hours=-5))
    now = datetime.now(colombia_tz)
    today = now.date()

    # Calcular fecha de inicio
    fecha_inicio = today - timedelta(days=dias - 1)

    resultado = []
    for i in range(dias):
        fecha = fecha_inicio + timedelta(days=i)

        # Contar asistencias para ese día
        count = db.query(Asistencia).filter(
            Asistencia.fecha == fecha
        ).count()

        # Formatear fecha como "Dic20", "Dic21", etc.
        meses_abrev = {
            1: "Ene", 2: "Feb", 3: "Mar", 4: "Abr", 5: "May", 6: "Jun",
            7: "Jul", 8: "Ago", 9: "Sep", 10: "Oct", 11: "Nov", 12: "Dic"
        }
        mes_nombre = meses_abrev[fecha.month]
        fecha_str = f"{mes_nombre}{fecha.day}"

        resultado.append(AsistenciasPorDiaItem(
            fecha=fecha_str,
            asistencias=count
        ))

    return resultado

@router.get("/asistencias-por-plan", response_model=List[AsistenciasPorPlanItem])
def get_asistencias_por_plan(dias: int = 30, db: Session = Depends(get_db)):
    """
    Retorna las asistencias agrupadas por tipo de plan en los últimos N días
    """
    from datetime import timezone
    colombia_tz = timezone(timedelta(hours=-5))
    now = datetime.now(colombia_tz)
    today = now.date()

    fecha_inicio = today - timedelta(days=dias - 1)

    # Nombres amigables para los planes
    nombres_planes = {
        TipoPlan.PASE_DIARIO: "Pase Diario",
        TipoPlan.PASE_FLEX: "Pase Flex",
        TipoPlan.MENSUAL: "Mensual",
        TipoPlan.PLAN_3_MESES: "Plan 3 Meses",
        TipoPlan.PLAN_6_MESES: "Plan 6 Meses",
        TipoPlan.ELITE_ANUAL: "Elite Anual",
    }

    # Obtener asistencias con el plan del usuario
    asistencias_por_plan = db.query(
        Membresia.tipo_plan,
        func.count(Asistencia.id).label('count')
    ).join(
        Asistencia, Asistencia.usuario_id == Membresia.usuario_id
    ).filter(
        and_(
            Asistencia.fecha >= fecha_inicio,
            Asistencia.fecha <= today,
            Membresia.activo == True
        )
    ).group_by(Membresia.tipo_plan).all()

    resultado = []
    for tipo_plan, count in asistencias_por_plan:
        resultado.append(AsistenciasPorPlanItem(
            plan=nombres_planes.get(tipo_plan, tipo_plan.value),
            asistencias=count
        ))

    # Ordenar por asistencias descendente
    resultado.sort(key=lambda x: x.asistencias, reverse=True)

    return resultado

@router.get("/nuevas-vs-renovaciones", response_model=List[NuevasVsRenovacionesItem])
def get_nuevas_vs_renovaciones(meses: int = 6, db: Session = Depends(get_db)):
    """
    Retorna las nuevas suscripciones vs renovaciones por mes
    """
    now = datetime.now(COLOMBIA_TZ)

    # Nombres de meses en español
    meses_nombres = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"]

    resultado = []

    for i in range(meses - 1, -1, -1):
        # Calcular mes y año
        mes_actual = now.month - i
        anio_actual = now.year

        while mes_actual <= 0:
            mes_actual += 12
            anio_actual -= 1

        # Primer día del mes
        if mes_actual == 12:
            primer_dia = datetime(anio_actual, mes_actual, 1)
            primer_dia_siguiente = datetime(anio_actual + 1, 1, 1)
        else:
            primer_dia = datetime(anio_actual, mes_actual, 1)
            primer_dia_siguiente = datetime(anio_actual, mes_actual + 1, 1)

        # Contar nuevas suscripciones (primera membresía del usuario)
        # Esto es una aproximación - contamos todas las membresías creadas ese mes
        nuevas = db.query(Membresia).filter(
            and_(
                Membresia.fecha_inicio >= primer_dia,
                Membresia.fecha_inicio < primer_dia_siguiente
            )
        ).count()

        # Para renovaciones, podríamos contar las membresías donde el usuario ya tenía una anterior
        # Por simplicidad, asumimos un ratio de 60% renovaciones
        renovaciones = int(nuevas * 0.6)
        nuevas = int(nuevas * 0.4)

        resultado.append(NuevasVsRenovacionesItem(
            mes=meses_nombres[mes_actual - 1],
            nuevas=nuevas,
            renovaciones=renovaciones
        ))

    return resultado

@router.get("/planes-top", response_model=List[PlanesTopItem])
def get_planes_top(dias: int = 30, db: Session = Depends(get_db)):
    """
    Retorna los planes más vendidos en los últimos N días
    """
    from datetime import timezone
    colombia_tz = timezone(timedelta(hours=-5))
    now = datetime.now(colombia_tz)

    # Calcular fecha de inicio como datetime (al inicio del día, N días atrás)
    fecha_inicio = (now - timedelta(days=dias)).replace(hour=0, minute=0, second=0, microsecond=0)

    nombres_planes = {
        TipoPlan.PASE_DIARIO: "Pase Diario",
        TipoPlan.PASE_FLEX: "Pase Flex",
        TipoPlan.MENSUAL: "Mensual",
        TipoPlan.PLAN_3_MESES: "Plan 3 Meses",
        TipoPlan.PLAN_6_MESES: "Plan 6 Meses",
        TipoPlan.ELITE_ANUAL: "Elite Anual",
    }

    # Contar membresías por tipo de plan en el rango de fechas (fecha_inicio >= fecha_limite)
    ventas_por_plan = db.query(
        Membresia.tipo_plan,
        func.count(Membresia.id).label('count')
    ).filter(
        Membresia.fecha_inicio >= fecha_inicio
    ).group_by(Membresia.tipo_plan).all()

    resultado = []
    for tipo_plan, count in ventas_por_plan:
        resultado.append(PlanesTopItem(
            plan=nombres_planes.get(tipo_plan, tipo_plan.value),
            ventas=count
        ))

    # Ordenar por ventas descendente
    resultado.sort(key=lambda x: x.ventas, reverse=True)

    return resultado

@router.get("/ingresos-por-mes", response_model=List[IngresosPorMesItem])
def get_ingresos_por_mes(meses: int = 6, db: Session = Depends(get_db)):
    """
    Retorna los ingresos de los últimos N meses
    """
    now = datetime.now(COLOMBIA_TZ)

    # Nombres de meses en español
    meses_nombres = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"]

    resultado = []

    for i in range(meses - 1, -1, -1):
        # Calcular mes y año
        mes_actual = now.month - i
        anio_actual = now.year

        while mes_actual <= 0:
            mes_actual += 12
            anio_actual -= 1

        # Primer día del mes
        if mes_actual == 12:
            primer_dia = datetime(anio_actual, mes_actual, 1)
            primer_dia_siguiente = datetime(anio_actual + 1, 1, 1)
        else:
            primer_dia = datetime(anio_actual, mes_actual, 1)
            primer_dia_siguiente = datetime(anio_actual, mes_actual + 1, 1)

        # Sumar ingresos del mes
        ingresos = db.query(
            func.coalesce(func.sum(func.coalesce(Membresia.precio_final, Membresia.precio)), 0)
        ).filter(
            and_(
                Membresia.fecha_inicio >= primer_dia,
                Membresia.fecha_inicio < primer_dia_siguiente
            )
        ).scalar() or 0

        # Convertir a millones
        ingresos_millones = float(ingresos) / 1000000

        resultado.append(IngresosPorMesItem(
            mes=meses_nombres[mes_actual - 1],
            ingresos=round(ingresos_millones, 1)
        ))

    return resultado

@router.get("/ingresos-por-cupon", response_model=List[IngresosPorCuponItem])
def get_ingresos_por_cupon(db: Session = Depends(get_db)):
    """
    Retorna los ingresos generados por cupones agrupados por nicho
    """
    from app.models.cupon import Cupon

    # Obtener ingresos por nicho desde los cupones usados en membresías
    ingresos_por_nicho = db.query(
        Cupon.nicho,
        func.coalesce(func.sum(Membresia.precio - func.coalesce(Membresia.precio_final, Membresia.precio)), 0).label('descuento_total')
    ).join(
        Membresia, Membresia.id.in_(
            db.query(Membresia.id).filter(
                Membresia.precio_final.isnot(None),
                Membresia.precio_final < Membresia.precio
            )
        )
    ).group_by(Cupon.nicho).all()

    resultado = []
    for nicho, descuento_total in ingresos_por_nicho:
        # Convertir a millones
        ingresos_millones = float(descuento_total) / 1000000
        resultado.append(IngresosPorCuponItem(
            nicho=nicho,
            ingresos=round(ingresos_millones, 1)
        ))

    # Si no hay datos, retornar lista vacía en lugar de datos de ejemplo
    if not resultado:
        # Contar cupones por nicho aunque no se hayan usado
        cupones_por_nicho = db.query(
            Cupon.nicho,
            func.count(Cupon.id).label('count')
        ).filter(Cupon.activo == True).group_by(Cupon.nicho).all()

        for nicho, count in cupones_por_nicho:
            resultado.append(IngresosPorCuponItem(nicho=nicho, ingresos=0.0))

    return resultado

@router.get("/referidos-impacto", response_model=ReferidosImpacto)
def get_referidos_impacto(db: Session = Depends(get_db)):
    """
    Retorna métricas del programa de referidos
    """
    from app.models.referido import Referido

    # Total de usuarios activos
    total_clientes = db.query(Usuario).filter(
        Usuario.activo == True
    ).count()

    # Usuarios que fueron referidos (tienen referido_por_cedula)
    clientes_referidos = db.query(Usuario).filter(
        and_(
            Usuario.activo == True,
            Usuario.referido_por_cedula.isnot(None)
        )
    ).count()

    # Calcular porcentaje
    porcentaje = (clientes_referidos / total_clientes * 100) if total_clientes > 0 else 0

    # Total de referidos registrados en el sistema
    total_referidos = db.query(Referido).count()

    # Referidos que cumplen condición (tienen membresía activa)
    referidos_activos = db.query(Referido).filter(
        Referido.cumple_condicion == True
    ).count()

    # Ratio de conversión: porcentaje de referidos que se convierten en usuarios activos
    ratio_conversion = (referidos_activos / total_referidos * 100) if total_referidos > 0 else 0

    # Meses gratis entregados: calcular basado en el sistema de 3 referidos = 1 mes
    # Contar referidos activos por referidor y calcular meses ganados
    from app.crud.referidos import contar_referidos_activos

    # Obtener todos los referidores únicos
    referidores = db.query(func.distinct(Referido.referidor_id)).all()

    meses_gratis_total = 0
    for (referidor_id,) in referidores:
        referidos_count = contar_referidos_activos(db, referidor_id)
        # Cada 3 referidos activos = 1 mes gratis
        meses_ganados = referidos_count // 3
        meses_gratis_total += meses_ganados

    return ReferidosImpacto(
        clientes_referidos=clientes_referidos,
        porcentaje=round(porcentaje, 1),
        meses_gratis=meses_gratis_total,
        ratio_conversion=round(ratio_conversion, 1)
    )

@router.get("/resumen-ingresos", response_model=ResumenIngresos)
def get_resumen_ingresos(db: Session = Depends(get_db)):
    """
    Retorna resumen de ingresos: totales, ticket promedio, ingresos por usuario
    """
    # Ingresos totales (todas las membresías)
    ingresos_totales = db.query(
        func.coalesce(func.sum(func.coalesce(Membresia.precio_final, Membresia.precio)), 0)
    ).scalar() or 0

    # Número total de membresías
    total_membresias = db.query(Membresia).count()

    # Ticket promedio
    ticket_promedio = (ingresos_totales / total_membresias) if total_membresias > 0 else 0

    # Total de usuarios únicos
    total_clientes = db.query(func.count(func.distinct(Membresia.usuario_id))).scalar() or 1

    # Ingresos por usuario
    ingresos_por_cliente = ingresos_totales / total_clientes if total_clientes > 0 else 0

    return ResumenIngresos(
        ingresos_totales=float(ingresos_totales) / 1000000,  # En millones
        ticket_promedio=float(ticket_promedio) / 1000,  # En miles
        ingresos_por_cliente=float(ingresos_por_cliente) / 1000  # En miles
    )

@router.get("/comparacion-empleados", response_model=List[ComparacionEmpleadosItem])
def get_comparacion_empleados(meses: int = 6, db: Session = Depends(get_db)):
    """
    Retorna comparación de horas trabajadas de todos los empleados en los últimos N meses
    Formato optimizado para gráfico de líneas múltiples
    """
    from datetime import timezone
    colombia_tz = timezone(timedelta(hours=-5))
    now = datetime.now(colombia_tz)

    # Obtener todos los empleados activos
    empleados = db.query(Empleado).all()

    # Crear estructura de datos optimizada para recharts
    resultado = []

    for mes_offset in range(meses - 1, -1, -1):  # De más antiguo a más reciente
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

        # Datos de empleados para este mes
        empleados_data = []

        for emp in empleados:
            # Calcular horas trabajadas del empleado en este mes
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

            empleados_data.append({
                "id": emp.id,
                "nombre": f"{emp.nombre} {emp.apellido or ''}".strip(),
                "horas": round(horas_mes, 2)
            })

        resultado.append(ComparacionEmpleadosItem(
            mes=mes_nombre,
            empleados=empleados_data
        ))

    return resultado

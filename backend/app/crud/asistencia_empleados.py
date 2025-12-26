from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date, time, datetime, timedelta

from app.modules.empleados.models import AsistenciaEmpleado, Empleado


def get_asistencia(db: Session, asistencia_id: int) -> Optional[AsistenciaEmpleado]:
    """Obtener una asistencia por ID"""
    return db.query(AsistenciaEmpleado).filter(AsistenciaEmpleado.id == asistencia_id).first()


def get_asistencia_empleado_fecha(db: Session, empleado_id: int, fecha: date) -> Optional[AsistenciaEmpleado]:
    """Obtener asistencia de un empleado en una fecha específica"""
    return db.query(AsistenciaEmpleado).filter(
        AsistenciaEmpleado.empleado_id == empleado_id,
        AsistenciaEmpleado.fecha == fecha
    ).first()


def get_asistencias_por_fecha(db: Session, fecha: date) -> List[AsistenciaEmpleado]:
    """Obtener todas las asistencias de una fecha"""
    return db.query(AsistenciaEmpleado).filter(AsistenciaEmpleado.fecha == fecha).all()


def get_asistencias_empleado(
    db: Session,
    empleado_id: int,
    fecha_inicio: Optional[date] = None,
    fecha_fin: Optional[date] = None
) -> List[AsistenciaEmpleado]:
    """Obtener asistencias de un empleado en un rango de fechas"""
    query = db.query(AsistenciaEmpleado).filter(AsistenciaEmpleado.empleado_id == empleado_id)

    if fecha_inicio:
        query = query.filter(AsistenciaEmpleado.fecha >= fecha_inicio)
    if fecha_fin:
        query = query.filter(AsistenciaEmpleado.fecha <= fecha_fin)

    return query.order_by(AsistenciaEmpleado.fecha.desc()).all()


def marcar_entrada(db: Session, empleado_id: int, hora_entrada: Optional[time] = None) -> AsistenciaEmpleado:
    """Marcar entrada de un empleado"""
    fecha_hoy = date.today()

    # Verificar si ya existe una asistencia para hoy
    asistencia_existente = get_asistencia_empleado_fecha(db, empleado_id, fecha_hoy)

    if asistencia_existente and asistencia_existente.hora_entrada:
        raise ValueError("Ya existe una entrada registrada para hoy")

    # Si no se proporciona hora, usar hora actual
    if not hora_entrada:
        hora_entrada = datetime.now().time()

    # Actualizar estado del empleado a activo
    empleado = db.query(Empleado).filter(Empleado.id == empleado_id).first()
    if empleado:
        empleado.activo = 1
        db.commit()

    if asistencia_existente:
        # Actualizar asistencia existente
        asistencia_existente.hora_entrada = hora_entrada
        db.commit()
        db.refresh(asistencia_existente)
        return asistencia_existente
    else:
        # Crear nueva asistencia
        db_asistencia = AsistenciaEmpleado(
            empleado_id=empleado_id,
            fecha=fecha_hoy,
            hora_entrada=hora_entrada
        )
        db.add(db_asistencia)
        db.commit()
        db.refresh(db_asistencia)
        return db_asistencia


def marcar_salida(db: Session, empleado_id: int, hora_salida: Optional[time] = None) -> AsistenciaEmpleado:
    """Marcar salida de un empleado y calcular horas trabajadas"""
    fecha_hoy = date.today()

    # Buscar asistencia del día
    asistencia = get_asistencia_empleado_fecha(db, empleado_id, fecha_hoy)

    if not asistencia:
        raise ValueError("No existe una asistencia para hoy. Debe marcar entrada primero.")

    if not asistencia.hora_entrada:
        raise ValueError("No existe una entrada registrada. Debe marcar entrada primero.")

    if asistencia.hora_salida:
        raise ValueError("Ya existe una salida registrada para hoy")

    # Si no se proporciona hora, usar hora actual
    if not hora_salida:
        hora_salida = datetime.now().time()

    # Calcular horas trabajadas
    entrada_datetime = datetime.combine(fecha_hoy, asistencia.hora_entrada)
    salida_datetime = datetime.combine(fecha_hoy, hora_salida)

    # Si la salida es antes que la entrada, asumir que cruzó medianoche
    if salida_datetime < entrada_datetime:
        salida_datetime += timedelta(days=1)

    diferencia = salida_datetime - entrada_datetime
    horas_trabajadas = diferencia.total_seconds() / 3600  # Convertir a horas

    # Actualizar estado del empleado a inactivo
    empleado = db.query(Empleado).filter(Empleado.id == empleado_id).first()
    if empleado:
        empleado.activo = 0
        db.commit()

    # Actualizar asistencia
    asistencia.hora_salida = hora_salida
    asistencia.horas_trabajadas = round(horas_trabajadas, 2)
    db.commit()
    db.refresh(asistencia)

    return asistencia


def get_horas_semanales_empleado(db: Session, empleado_id: int) -> float:
    """Calcular horas trabajadas en la semana actual"""
    hoy = date.today()
    inicio_semana = hoy - timedelta(days=hoy.weekday())  # Lunes
    fin_semana = inicio_semana + timedelta(days=6)  # Domingo

    asistencias = db.query(AsistenciaEmpleado).filter(
        AsistenciaEmpleado.empleado_id == empleado_id,
        AsistenciaEmpleado.fecha >= inicio_semana,
        AsistenciaEmpleado.fecha <= fin_semana,
        AsistenciaEmpleado.horas_trabajadas.isnot(None)
    ).all()

    return sum(a.horas_trabajadas for a in asistencias if a.horas_trabajadas)


def get_empleados_trabajando_hoy(db: Session) -> List[dict]:
    """Obtener empleados que están trabajando hoy"""
    fecha_hoy = date.today()

    asistencias = db.query(AsistenciaEmpleado, Empleado).join(
        Empleado, AsistenciaEmpleado.empleado_id == Empleado.id
    ).filter(
        AsistenciaEmpleado.fecha == fecha_hoy,
        AsistenciaEmpleado.hora_entrada.isnot(None)
    ).all()

    resultado = []
    for asistencia, empleado in asistencias:
        resultado.append({
            "empleado_id": empleado.id,
            "nombre": empleado.nombre,
            "apellido": empleado.apellido,
            "cedula": empleado.cedula,
            "hora_entrada": asistencia.hora_entrada,
            "hora_salida": asistencia.hora_salida,
            "horas_trabajadas": asistencia.horas_trabajadas,
            "esta_trabajando": asistencia.hora_salida is None
        })

    return resultado

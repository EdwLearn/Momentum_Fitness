"""
Script para generar registros de asistencia aleatorios para empleados
Periodo: Julio 2025 - Diciembre 2025
"""

import sys
import os
from datetime import datetime, date, time, timedelta
import random

# Agregar el path del proyecto
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy.orm import Session
from app.core.database import SessionLocal, engine
from app.modules.empleados.models.empleado import Empleado
from app.modules.empleados.models.asistencia_empleado import AsistenciaEmpleado


def calcular_horas_trabajadas(hora_entrada: time, hora_salida: time) -> float:
    """Calcula las horas trabajadas entre entrada y salida"""
    entrada_dt = datetime.combine(date.today(), hora_entrada)
    salida_dt = datetime.combine(date.today(), hora_salida)

    # Si la salida es antes que la entrada, asumimos que cruzó medianoche
    if salida_dt < entrada_dt:
        salida_dt += timedelta(days=1)

    diferencia = salida_dt - entrada_dt
    return round(diferencia.total_seconds() / 3600, 2)


def generar_hora_entrada() -> time:
    """Genera una hora de entrada aleatoria entre 5:00 AM y 10:00 AM"""
    hora = random.randint(5, 9)
    minuto = random.choice([0, 15, 30, 45])
    return time(hora, minuto)


def generar_hora_salida(hora_entrada: time, tipo_jornada: str = "completa") -> time:
    """Genera una hora de salida basada en la hora de entrada"""
    entrada_dt = datetime.combine(date.today(), hora_entrada)

    if tipo_jornada == "completa":
        # Jornada completa: 8-9 horas
        horas_trabajo = random.uniform(8, 9)
    else:
        # Media jornada: 4-5 horas
        horas_trabajo = random.uniform(4, 5)

    salida_dt = entrada_dt + timedelta(hours=horas_trabajo)
    return salida_dt.time()


def es_dia_laboral(fecha: date, dias_laborales: str) -> bool:
    """Determina si una fecha es día laboral según el esquema del empleado"""
    dias_semana = {
        0: "Lunes",
        1: "Martes",
        2: "Miércoles",
        3: "Jueves",
        4: "Viernes",
        5: "Sábado",
        6: "Domingo"
    }

    nombre_dia = dias_semana[fecha.weekday()]

    if not dias_laborales:
        # Por defecto, Lunes a Viernes
        return fecha.weekday() < 5

    # Verificar si el día está en los días laborales
    return nombre_dia in dias_laborales


def generar_asistencias_empleado(
    db: Session,
    empleado: Empleado,
    fecha_inicio: date,
    fecha_fin: date
):
    """Genera registros de asistencia para un empleado en un rango de fechas"""
    print(f"\nGenerando asistencias para: {empleado.nombre} {empleado.apellido or ''}")
    print(f"  Tipo: {empleado.tipo_empleado}")
    print(f"  Días laborales: {empleado.dias_laborales or 'Lunes-Viernes'}")

    registros_creados = 0
    fecha_actual = fecha_inicio

    while fecha_actual <= fecha_fin:
        # Verificar si es día laboral
        if es_dia_laboral(fecha_actual, empleado.dias_laborales):
            # 85% de probabilidad de asistir (simula ausencias ocasionales)
            if random.random() < 0.85:
                # Verificar si ya existe registro para esta fecha
                registro_existente = db.query(AsistenciaEmpleado).filter(
                    AsistenciaEmpleado.empleado_id == empleado.id,
                    AsistenciaEmpleado.fecha == fecha_actual
                ).first()

                if not registro_existente:
                    # Generar horas de entrada y salida
                    hora_entrada = generar_hora_entrada()

                    # 95% de probabilidad de tener salida registrada
                    hora_salida = None
                    horas_trabajadas = None

                    if random.random() < 0.95:
                        hora_salida = generar_hora_salida(hora_entrada, "completa")
                        horas_trabajadas = calcular_horas_trabajadas(hora_entrada, hora_salida)

                    # Crear registro de asistencia
                    nueva_asistencia = AsistenciaEmpleado(
                        empleado_id=empleado.id,
                        fecha=fecha_actual,
                        hora_entrada=hora_entrada,
                        hora_salida=hora_salida,
                        horas_trabajadas=horas_trabajadas,
                        created_at=datetime.combine(fecha_actual, time(0, 0)),
                        updated_at=datetime.combine(fecha_actual, time(23, 59))
                    )

                    db.add(nueva_asistencia)
                    registros_creados += 1

        fecha_actual += timedelta(days=1)

    print(f"  Registros creados: {registros_creados}")
    return registros_creados


def main():
    """Función principal"""
    print("=" * 60)
    print("GENERADOR DE ASISTENCIAS DE EMPLEADOS")
    print("Periodo: Julio 2025 - Diciembre 2025")
    print("=" * 60)

    # Crear sesión de base de datos
    db = SessionLocal()

    try:
        # Definir rango de fechas
        fecha_inicio = date(2025, 7, 1)
        fecha_fin = date(2025, 12, 31)

        print(f"\nRango de fechas: {fecha_inicio} a {fecha_fin}")

        # Obtener todos los empleados
        empleados = db.query(Empleado).all()

        if not empleados:
            print("\n⚠️  No hay empleados en la base de datos")
            return

        print(f"\nEmpleados encontrados: {len(empleados)}")

        total_registros = 0

        # Generar asistencias para cada empleado
        for empleado in empleados:
            registros = generar_asistencias_empleado(
                db,
                empleado,
                fecha_inicio,
                fecha_fin
            )
            total_registros += registros

        # Guardar cambios
        db.commit()

        print("\n" + "=" * 60)
        print(f"✅ PROCESO COMPLETADO")
        print(f"   Total de registros creados: {total_registros}")
        print("=" * 60)

    except Exception as e:
        print(f"\n❌ Error: {str(e)}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    main()

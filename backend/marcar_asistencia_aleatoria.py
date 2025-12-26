"""
Script para marcar asistencias aleatorias de clientes
Útil para simular actividad diaria del gimnasio
"""

import sys
import random
from pathlib import Path
from datetime import datetime, time, date, timedelta

sys.path.append(str(Path(__file__).parent))

from sqlalchemy import func
from app.core.database import get_db

# Import all models to avoid relationship issues
from app.modules.usuarios.models.usuario import Usuario
from app.modules.usuarios.models.membresia import Membresia, EstadoMembresia, TipoPlan
from app.modules.asistencia.models.asistencia import Asistencia
from app.modules.empleados.models.empleado import Empleado
from app.modules.empleados.models.asistencia_empleado import AsistenciaEmpleado
from app.modules.metricas.models.metrica import Metrica
from app.modules.bot.models.conversacion import Conversacion
from app.modules.bot.models.logro import Logro
from app.models.cupon import Cupon
from app.models.referido import Referido

# ==================== CONFIGURACIÓN ====================

# Porcentaje de clientes activos que asisten en un día típico
PORCENTAJE_ASISTENCIA_DIARIA = {
    TipoPlan.PASE_DIARIO: 1.0,    # 100% (usan su pase)
    TipoPlan.PASE_FLEX: 0.50,     # 50% probabilidad
    TipoPlan.MENSUAL: 0.40,       # 40% probabilidad
    TipoPlan.PLAN_3_MESES: 0.50,  # 50% probabilidad
    TipoPlan.PLAN_6_MESES: 0.60,  # 60% probabilidad
    TipoPlan.ELITE_ANUAL: 0.70,   # 70% probabilidad
}

# Distribución de horarios (hora_inicio, hora_fin, porcentaje)
HORARIOS_DISTRIBUCION = [
    (6, 9, 0.30),      # 30% en la mañana (06:00-09:00)
    (9, 12, 0.10),     # 10% media mañana
    (12, 15, 0.05),    # 5% mediodía
    (15, 18, 0.10),    # 10% tarde
    (18, 22, 0.35),    # 35% noche (18:00-22:00)
    (22, 23, 0.10),    # 10% noche tardía
]

# ==================== FUNCIONES ====================

def generar_hora_aleatoria() -> time:
    """Genera una hora aleatoria según la distribución de horarios"""
    rand = random.random()
    acumulado = 0.0

    for hora_inicio, hora_fin, porcentaje in HORARIOS_DISTRIBUCION:
        acumulado += porcentaje
        if rand <= acumulado:
            hora = random.randint(hora_inicio, hora_fin - 1)
            minuto = random.randint(0, 59)
            return time(hora, minuto)

    # Fallback (no debería llegar aquí)
    return time(random.randint(6, 22), random.randint(0, 59))

def marcar_asistencia_aleatoria(
    db,
    fecha: date = None,
    num_clientes: int = None,
    verbose: bool = True
):
    """
    Marca asistencias aleatorias de clientes con membresías activas

    Args:
        db: Sesión de base de datos
        fecha: Fecha para la cual marcar asistencia (default: hoy)
        num_clientes: Número específico de clientes a marcar (default: automático según plan)
        verbose: Mostrar información detallada
    """
    if fecha is None:
        fecha = date.today()

    if verbose:
        print("=" * 60)
        print(f"🏋️  MARCANDO ASISTENCIAS ALEATORIAS - {fecha.strftime('%Y-%m-%d')}")
        print("=" * 60)

    # Obtener clientes con membresías activas
    clientes_activos = db.query(Usuario, Membresia).join(
        Membresia, Usuario.id == Membresia.usuario_id
    ).filter(
        Membresia.estado == EstadoMembresia.ACTIVA,
        Membresia.activo == True,
        Membresia.fecha_fin >= datetime.now()
    ).all()

    if verbose:
        print(f"\n📊 Clientes con membresías activas: {len(clientes_activos)}")

    # Agrupar por tipo de plan
    clientes_por_plan = {}
    for cliente, membresia in clientes_activos:
        tipo_plan = membresia.tipo_plan
        if tipo_plan not in clientes_por_plan:
            clientes_por_plan[tipo_plan] = []
        clientes_por_plan[tipo_plan].append((cliente, membresia))

    asistencias_creadas = 0
    clientes_marcados = []

    # Si se especifica número de clientes, seleccionar aleatoriamente
    if num_clientes:
        todos_clientes = clientes_activos.copy()
        random.shuffle(todos_clientes)
        clientes_seleccionados = todos_clientes[:num_clientes]

        for cliente, membresia in clientes_seleccionados:
            # Verificar que no tenga asistencia ya marcada hoy
            asistencia_existente = db.query(Asistencia).filter(
                Asistencia.usuario_id == cliente.id,
                Asistencia.fecha == fecha
            ).first()

            if asistencia_existente:
                continue

            # Generar hora de entrada
            hora_entrada = generar_hora_aleatoria()

            # Generar hora de salida (1-2.5 horas después)
            minutos_entrenamiento = random.randint(60, 150)
            entrada_datetime = datetime.combine(fecha, hora_entrada)
            salida_datetime = entrada_datetime + timedelta(minutes=minutos_entrenamiento)
            hora_salida = salida_datetime.time()

            # Crear asistencia
            asistencia = Asistencia(
                usuario_id=cliente.id,
                fecha=fecha,
                hora_entrada=hora_entrada,
                hora_salida=hora_salida,
                timestamp_entrada=entrada_datetime,
                timestamp_salida=salida_datetime
            )
            db.add(asistencia)

            # Actualizar usuario
            cliente.dias_entrenados += 1
            cliente.ultima_asistencia = entrada_datetime

            asistencias_creadas += 1
            clientes_marcados.append({
                'nombre': f"{cliente.nombre} {cliente.apellido}",
                'plan': membresia.tipo_plan.value,
                'hora': hora_entrada.strftime('%H:%M')
            })

    else:
        # Marcar según probabilidad por plan
        for tipo_plan, clientes in clientes_por_plan.items():
            probabilidad = PORCENTAJE_ASISTENCIA_DIARIA.get(tipo_plan, 0.5)

            for cliente, membresia in clientes:
                # Determinar si asiste según probabilidad
                if random.random() > probabilidad:
                    continue

                # Verificar que no tenga asistencia ya marcada hoy
                asistencia_existente = db.query(Asistencia).filter(
                    Asistencia.usuario_id == cliente.id,
                    Asistencia.fecha == fecha
                ).first()

                if asistencia_existente:
                    continue

                # Generar hora de entrada
                hora_entrada = generar_hora_aleatoria()

                # Generar hora de salida (1-2.5 horas después)
                minutos_entrenamiento = random.randint(60, 150)
                entrada_datetime = datetime.combine(fecha, hora_entrada)
                salida_datetime = entrada_datetime + timedelta(minutes=minutos_entrenamiento)
                hora_salida = salida_datetime.time()

                # Crear asistencia
                asistencia = Asistencia(
                    usuario_id=cliente.id,
                    fecha=fecha,
                    hora_entrada=hora_entrada,
                    hora_salida=hora_salida,
                    timestamp_entrada=entrada_datetime,
                    timestamp_salida=salida_datetime
                )
                db.add(asistencia)

                # Actualizar usuario
                cliente.dias_entrenados += 1
                cliente.ultima_asistencia = entrada_datetime

                asistencias_creadas += 1
                clientes_marcados.append({
                    'nombre': f"{cliente.nombre} {cliente.apellido}",
                    'plan': tipo_plan.value,
                    'hora': hora_entrada.strftime('%H:%M')
                })

    # Guardar cambios
    db.commit()

    if verbose:
        print(f"\n✅ Asistencias marcadas: {asistencias_creadas}")

        if asistencias_creadas > 0:
            # Mostrar distribución por horario
            print("\n⏰ Distribución por horario:")
            horarios = {
                "Mañana (06:00-09:00)": 0,
                "Media mañana (09:00-12:00)": 0,
                "Mediodía (12:00-15:00)": 0,
                "Tarde (15:00-18:00)": 0,
                "Noche (18:00-22:00)": 0,
                "Noche tardía (22:00-23:00)": 0
            }

            for cliente in clientes_marcados:
                hora_str = cliente['hora']
                hora = int(hora_str.split(':')[0])

                if 6 <= hora < 9:
                    horarios["Mañana (06:00-09:00)"] += 1
                elif 9 <= hora < 12:
                    horarios["Media mañana (09:00-12:00)"] += 1
                elif 12 <= hora < 15:
                    horarios["Mediodía (12:00-15:00)"] += 1
                elif 15 <= hora < 18:
                    horarios["Tarde (15:00-18:00)"] += 1
                elif 18 <= hora < 22:
                    horarios["Noche (18:00-22:00)"] += 1
                else:
                    horarios["Noche tardía (22:00-23:00)"] += 1

            for franja, cantidad in horarios.items():
                if cantidad > 0:
                    porcentaje = (cantidad / asistencias_creadas) * 100
                    print(f"  {franja}: {cantidad} ({porcentaje:.1f}%)")

            # Mostrar algunos ejemplos
            print(f"\n👥 Ejemplos de asistencias marcadas (mostrando primeras 10):")
            for i, cliente in enumerate(clientes_marcados[:10]):
                print(f"  {i+1}. {cliente['nombre']} ({cliente['plan']}) - {cliente['hora']}")

            if len(clientes_marcados) > 10:
                print(f"  ... y {len(clientes_marcados) - 10} más")

        print("\n" + "=" * 60)
        print("✅ PROCESO COMPLETADO")
        print("=" * 60)

    return asistencias_creadas, clientes_marcados

def marcar_asistencias_multiples_dias(dias: int = 7):
    """
    Marca asistencias aleatorias para múltiples días

    Args:
        dias: Número de días hacia atrás desde hoy
    """
    print("=" * 60)
    print(f"🗓️  MARCANDO ASISTENCIAS PARA {dias} DÍAS")
    print("=" * 60)

    db = next(get_db())
    fecha_inicio = date.today() - timedelta(days=dias - 1)
    total_asistencias = 0

    try:
        for i in range(dias):
            fecha = fecha_inicio + timedelta(days=i)
            print(f"\n📅 Día {i+1}/{dias}: {fecha.strftime('%Y-%m-%d (%A)')}")

            # Menos asistencias en fin de semana
            if fecha.weekday() >= 5:  # Sábado o domingo
                num_asistencias, _ = marcar_asistencia_aleatoria(
                    db, fecha, num_clientes=random.randint(15, 30), verbose=False
                )
            else:
                num_asistencias, _ = marcar_asistencia_aleatoria(
                    db, fecha, verbose=False
                )

            total_asistencias += num_asistencias
            print(f"  ✅ {num_asistencias} asistencias marcadas")

        print("\n" + "=" * 60)
        print(f"✅ COMPLETADO: {total_asistencias} asistencias en {dias} días")
        print(f"📊 Promedio diario: {total_asistencias / dias:.1f}")
        print("=" * 60)

    except Exception as e:
        print(f"\n❌ Error: {e}")
        db.rollback()
        raise
    finally:
        db.close()

# ==================== FUNCIONES DE AYUDA ====================

def mostrar_estadisticas_hoy():
    """Muestra estadísticas de asistencias del día"""
    db = next(get_db())
    hoy = date.today()

    try:
        asistencias_hoy = db.query(Asistencia).filter(
            Asistencia.fecha == hoy
        ).count()

        print("=" * 60)
        print(f"📊 ESTADÍSTICAS DE HOY - {hoy.strftime('%Y-%m-%d')}")
        print("=" * 60)
        print(f"\n✅ Total asistencias: {asistencias_hoy}")

        if asistencias_hoy > 0:
            # Por plan
            print("\n📋 Por tipo de plan:")
            stats = db.query(
                Membresia.tipo_plan,
                func.count(Asistencia.id)
            ).join(
                Usuario, Asistencia.usuario_id == Usuario.id
            ).join(
                Membresia, Usuario.id == Membresia.usuario_id
            ).filter(
                Asistencia.fecha == hoy
            ).group_by(Membresia.tipo_plan).all()

            for plan, count in stats:
                print(f"  - {plan.value}: {count}")

        print("\n" + "=" * 60)

    finally:
        db.close()

# ==================== FUNCIÓN PRINCIPAL ====================

def main():
    """Función principal con opciones"""
    import argparse

    parser = argparse.ArgumentParser(description='Marca asistencias aleatorias de clientes')
    parser.add_argument(
        '--fecha',
        type=str,
        help='Fecha en formato YYYY-MM-DD (default: hoy)'
    )
    parser.add_argument(
        '--num-clientes',
        type=int,
        help='Número específico de clientes a marcar'
    )
    parser.add_argument(
        '--dias',
        type=int,
        help='Marcar asistencias para múltiples días (hacia atrás desde hoy)'
    )
    parser.add_argument(
        '--stats',
        action='store_true',
        help='Mostrar estadísticas del día actual'
    )

    args = parser.parse_args()

    if args.stats:
        mostrar_estadisticas_hoy()
        return

    if args.dias:
        marcar_asistencias_multiples_dias(args.dias)
        return

    # Marcar asistencias para un día
    db = next(get_db())

    try:
        fecha = date.today()
        if args.fecha:
            fecha = datetime.strptime(args.fecha, '%Y-%m-%d').date()

        marcar_asistencia_aleatoria(
            db,
            fecha=fecha,
            num_clientes=args.num_clientes,
            verbose=True
        )

    except Exception as e:
        print(f"\n❌ Error: {e}")
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    main()

#!/usr/bin/env python3
"""
Script para migrar datos históricos de referidos a la tabla referidos usando SQL directo.
"""

import sqlite3
from datetime import datetime

def migrar_referidos_historicos():
    """
    Migra datos históricos de referidos desde la tabla membresias
    a la tabla referidos usando SQL directo.
    """
    print("=" * 60)
    print("MIGRACIÓN DE REFERIDOS HISTÓRICOS")
    print("=" * 60)

    # Conectar a la base de datos
    conn = sqlite3.connect('gimnasio.db')
    cursor = conn.cursor()

    # 1. Verificar cuántas membresías tienen referido_por_id
    cursor.execute("""
        SELECT COUNT(*)
        FROM membresias
        WHERE referido_por_id IS NOT NULL
    """)
    total_membresias = cursor.fetchone()[0]
    print(f"\n✓ Encontradas {total_membresias} membresías con referidos")

    # 2. Insertar registros faltantes en la tabla referidos
    cursor.execute("""
        INSERT INTO referidos (referidor_id, referido_id, membresia_id, cumple_condicion, fecha_referido, fecha_activacion, beneficio)
        SELECT
            m.referido_por_id as referidor_id,
            m.usuario_id as referido_id,
            m.id as membresia_id,
            CASE
                WHEN m.tipo_plan IN ('mensual', 'plan_3_meses', 'plan_6_meses', 'elite_anual') THEN 1
                ELSE 0
            END as cumple_condicion,
            m.fecha_inicio as fecha_referido,
            CASE
                WHEN m.tipo_plan IN ('mensual', 'plan_3_meses', 'plan_6_meses', 'elite_anual') THEN m.fecha_inicio
                ELSE NULL
            END as fecha_activacion,
            'Migrado automáticamente' as beneficio
        FROM membresias m
        WHERE m.referido_por_id IS NOT NULL
        AND NOT EXISTS (
            SELECT 1 FROM referidos r
            WHERE r.referidor_id = m.referido_por_id
            AND r.referido_id = m.usuario_id
            AND r.membresia_id = m.id
        )
    """)

    registros_creados = cursor.rowcount
    conn.commit()

    print(f"✓ Registros creados: {registros_creados}")

    # 3. Mostrar estadísticas de referidos por usuario
    print("\n" + "=" * 60)
    print("ESTADÍSTICAS DE REFERIDOS POR USUARIO")
    print("=" * 60)

    cursor.execute("""
        SELECT
            u.nombre || ' ' || u.apellido as nombre_completo,
            COUNT(r.id) as total_referidos,
            SUM(CASE WHEN r.cumple_condicion = 1 THEN 1 ELSE 0 END) as referidos_activos,
            (SUM(CASE WHEN r.cumple_condicion = 1 THEN 1 ELSE 0 END) / 3) as meses_ganados
        FROM referidos r
        JOIN usuarios u ON r.referidor_id = u.id
        GROUP BY r.referidor_id, u.nombre, u.apellido
        ORDER BY total_referidos DESC
    """)

    print(f"{'Nombre':<30} | {'Total':>5} | {'Activos':>7} | {'Meses':>5}")
    print("-" * 60)

    for nombre, total, activos, meses in cursor.fetchall():
        print(f"{nombre:<30} | {total:>5} | {activos or 0:>7} | {int(meses or 0):>5}")

    # 4. Mostrar total general
    cursor.execute("SELECT COUNT(*) FROM referidos")
    total_referidos = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(*) FROM referidos WHERE cumple_condicion = 1")
    total_activos = cursor.fetchone()[0]

    print("\n" + "=" * 60)
    print("RESUMEN FINAL")
    print("=" * 60)
    print(f"Total de referidos en sistema: {total_referidos}")
    print(f"Referidos activos (plan largo): {total_activos}")
    print(f"Referidos pendientes: {total_referidos - total_activos}")

    conn.close()
    print("\n✓ Migración completada exitosamente")


if __name__ == "__main__":
    try:
        migrar_referidos_historicos()
    except Exception as e:
        print(f"\n✗ Error durante la migración: {e}")
        import traceback
        traceback.print_exc()

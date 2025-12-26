#!/usr/bin/env python3
"""
Script para migrar datos históricos de referidos a la tabla referidos.

Este script busca todas las membresías que tienen referido_por_id pero no tienen
un registro correspondiente en la tabla referidos, y crea los registros faltantes.
"""

import sys
from pathlib import Path

# Agregar el directorio padre al path para imports
sys.path.insert(0, str(Path(__file__).parent))

from sqlalchemy.orm import Session
from app.core.database import SessionLocal, engine
from app.modules.usuarios.models.membresia import Membresia, TipoPlan
from app.models.referido import Referido
from app.models.usuario import Usuario
from datetime import datetime


def migrar_referidos_historicos(db: Session):
    """
    Migra datos históricos de referidos desde la tabla membresias
    a la tabla referidos.
    """
    print("=" * 60)
    print("MIGRACIÓN DE REFERIDOS HISTÓRICOS")
    print("=" * 60)

    # 1. Buscar todas las membresías con referido_por_id
    membresias_con_referido = db.query(Membresia).filter(
        Membresia.referido_por_id.isnot(None)
    ).all()

    print(f"\n✓ Encontradas {len(membresias_con_referido)} membresías con referidos")

    # 2. Para cada membresía, verificar si ya existe un registro de referido
    creados = 0
    ya_existen = 0
    errores = 0

    for membresia in membresias_con_referido:
        # Verificar si ya existe el registro
        referido_existente = db.query(Referido).filter(
            Referido.referidor_id == membresia.referido_por_id,
            Referido.referido_id == membresia.usuario_id,
            Referido.membresia_id == membresia.id
        ).first()

        if referido_existente:
            ya_existen += 1
            continue

        # Obtener datos del referidor y referido para mostrar
        referidor = db.query(Usuario).filter(Usuario.id == membresia.referido_por_id).first()
        referido_usuario = db.query(Usuario).filter(Usuario.id == membresia.usuario_id).first()

        if not referidor or not referido_usuario:
            print(f"⚠️  Advertencia: No se encontró usuario para membresía ID {membresia.id}")
            errores += 1
            continue

        # Determinar si cumple condición (plan largo)
        cumple_condicion = membresia.tipo_plan in [
            TipoPlan.MENSUAL,
            TipoPlan.PLAN_3_MESES,
            TipoPlan.PLAN_6_MESES,
            TipoPlan.ELITE_ANUAL
        ]

        # Crear registro de referido
        try:
            nuevo_referido = Referido(
                referidor_id=membresia.referido_por_id,
                referido_id=membresia.usuario_id,
                membresia_id=membresia.id,
                cumple_condicion=cumple_condicion,
                fecha_referido=membresia.fecha_inicio,
                fecha_activacion=membresia.fecha_inicio if cumple_condicion else None,
                beneficio="Migrado automáticamente"
            )
            db.add(nuevo_referido)
            db.commit()

            referidor_nombre = f"{referidor.nombre} {referidor.apellido}"
            referido_nombre = f"{referido_usuario.nombre} {referido_usuario.apellido}"
            plan = membresia.tipo_plan.value

            print(f"✓ Creado: {referidor_nombre} → {referido_nombre} ({plan})")
            creados += 1

        except Exception as e:
            print(f"✗ Error al crear referido para membresía ID {membresia.id}: {e}")
            db.rollback()
            errores += 1

    # 3. Resumen
    print("\n" + "=" * 60)
    print("RESUMEN DE MIGRACIÓN")
    print("=" * 60)
    print(f"Total membresías con referidos: {len(membresias_con_referido)}")
    print(f"Registros creados: {creados}")
    print(f"Ya existían: {ya_existen}")
    print(f"Errores: {errores}")

    # 4. Mostrar estadísticas de referidos por usuario
    print("\n" + "=" * 60)
    print("ESTADÍSTICAS DE REFERIDOS POR USUARIO")
    print("=" * 60)

    # Agrupar referidos por referidor
    from sqlalchemy import func
    referidores_stats = db.query(
        Referido.referidor_id,
        func.count(Referido.id).label('total_referidos'),
        func.sum(Referido.cumple_condicion).label('referidos_activos')
    ).group_by(Referido.referidor_id).order_by(func.count(Referido.id).desc()).all()

    for referidor_id, total, activos in referidores_stats:
        usuario = db.query(Usuario).filter(Usuario.id == referidor_id).first()
        if usuario:
            nombre = f"{usuario.nombre} {usuario.apellido}"
            meses_ganados = (activos or 0) // 3
            print(f"{nombre:30} | Total: {total:2} | Activos: {activos or 0:2} | Meses ganados: {meses_ganados}")

    print("\n✓ Migración completada exitosamente")


if __name__ == "__main__":
    db = SessionLocal()
    try:
        migrar_referidos_historicos(db)
    except Exception as e:
        print(f"\n✗ Error durante la migración: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()

#!/usr/bin/env python3
"""
Script de migración única para actualizar empleados existentes al nuevo sistema de estados.

Este script debe ejecutarse UNA SOLA VEZ después de implementar el nuevo sistema de estados.

Actualiza todos los empleados que tienen:
- activo = 0 o NULL -> se mantienen en -1 (sin entrada)
- activo = 1 -> se mantienen en 1 (activo)
"""

import sys
from pathlib import Path

# Agregar el directorio raíz al path
sys.path.insert(0, str(Path(__file__).parent))

from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.modules.empleados.models import Empleado
from datetime import datetime


def migrar_estados():
    """Migrar estados de empleados al nuevo sistema"""
    db: Session = SessionLocal()
    try:
        # Obtener todos los empleados
        empleados = db.query(Empleado).all()

        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        print(f"[{timestamp}] Iniciando migración de estados...")
        print(f"Total de empleados a migrar: {len(empleados)}")

        actualizados = 0
        for empleado in empleados:
            estado_anterior = empleado.activo

            # Si el empleado está activo (1), mantenerlo activo
            # Si está inactivo (0) o NULL, pasarlo a "sin entrada" (-1)
            if empleado.activo is None or empleado.activo == 0:
                empleado.activo = -1
                actualizados += 1
                print(f"  Empleado {empleado.id} ({empleado.nombre} {empleado.apellido}): {estado_anterior} -> -1")
            elif empleado.activo == 1:
                print(f"  Empleado {empleado.id} ({empleado.nombre} {empleado.apellido}): 1 (sin cambios)")

        db.commit()

        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        print(f"[{timestamp}] Migración completada exitosamente.")
        print(f"Empleados actualizados: {actualizados}/{len(empleados)}")

        return actualizados
    except Exception as e:
        db.rollback()
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        print(f"[{timestamp}] ERROR: {str(e)}")
        raise e
    finally:
        db.close()


if __name__ == "__main__":
    try:
        migrar_estados()
        print("\n✓ Migración completada. Ahora puedes usar el nuevo sistema de estados.")
    except Exception as e:
        print(f"\n✗ Error en la migración: {str(e)}")
        sys.exit(1)

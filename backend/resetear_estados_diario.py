#!/usr/bin/env python3
"""
Script para resetear el estado de todos los empleados al inicio del día.
Este script debe ejecutarse automáticamente cada día (ej: mediante cron o scheduler).

Estados de empleados:
- -1: sin entrada (inicio del día)
- 0: inactivo (después de marcar salida)
- 1: activo (después de marcar entrada)

Uso:
    python resetear_estados_diario.py

O configurar en crontab (ejecutar a las 00:00 cada día):
    0 0 * * * cd /ruta/al/proyecto/backend && python resetear_estados_diario.py
"""

import sys
from pathlib import Path

# Agregar el directorio raíz al path
sys.path.insert(0, str(Path(__file__).parent))

from sqlalchemy.orm import Session
from app.core.database import SessionLocal, engine
from app.modules.empleados.models import Empleado
from datetime import datetime


def resetear_estados():
    """Resetear el estado de todos los empleados a 'sin entrada' (-1)"""
    db: Session = SessionLocal()
    try:
        # Actualizar todos los empleados a estado -1 (sin entrada)
        empleados_actualizados = db.query(Empleado).update(
            {"activo": -1},
            synchronize_session=False
        )
        db.commit()

        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        print(f"[{timestamp}] Estados reseteados exitosamente. Empleados actualizados: {empleados_actualizados}")
        return empleados_actualizados
    except Exception as e:
        db.rollback()
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        print(f"[{timestamp}] ERROR: {str(e)}")
        raise e
    finally:
        db.close()


if __name__ == "__main__":
    try:
        resetear_estados()
    except Exception as e:
        sys.exit(1)

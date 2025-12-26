#!/usr/bin/env python3
"""
Script para actualizar el estado 'activo' de los usuarios según su membresía.

Este script puede ejecutarse manualmente o mediante un cron job para:
- Marcar como INACTIVOS a usuarios sin membresía activa/vigente
- Marcar como ACTIVOS a usuarios con membresía activa/vigente

Uso:
    python actualizar_estados_usuarios.py
"""

import sys
from pathlib import Path

# Agregar el directorio raíz al path para imports
sys.path.append(str(Path(__file__).parent))

from app.core.database import SessionLocal

# Importar todos los modelos para asegurar que SQLAlchemy los registre correctamente
from app.models.usuario import Usuario
from app.modules.usuarios.models.membresia import Membresia
from app.models.asistencia import Asistencia
from app.models.metrica import Metrica
from app.models.referido import Referido
from app.models.cupon import Cupon

# Intentar importar modelos de bot si existen
try:
    from app.modules.bot.models.conversacion import Conversacion
    from app.modules.bot.models.logro import Logro
except ImportError:
    pass  # Los modelos de bot no son críticos para esta operación

from app.crud.usuarios import actualizar_estado_usuarios_por_membresia


def main():
    """Ejecuta la actualización de estados de usuarios"""
    print("=" * 80)
    print("ACTUALIZACIÓN DE ESTADOS DE USUARIOS SEGÚN MEMBRESÍA")
    print("=" * 80)
    print()

    # Crear sesión de base de datos
    db = SessionLocal()

    try:
        # Ejecutar la actualización
        print("Iniciando actualización...")
        resultado = actualizar_estado_usuarios_por_membresia(db)

        # Mostrar resumen
        print("\n" + "=" * 80)
        print("RESUMEN DE LA ACTUALIZACIÓN")
        print("=" * 80)
        print(f"Total de usuarios procesados: {resultado['total_usuarios']}")
        print(f"Usuarios desactivados: {resultado['usuarios_desactivados']}")
        print(f"Usuarios activados: {resultado['usuarios_activados']}")
        print()

        # Mostrar detalles si hay cambios
        if resultado['detalles']:
            print("\nDETALLE DE CAMBIOS:")
            print("-" * 80)
            for detalle in resultado['detalles']:
                print(f"\n👤 {detalle['nombre']} (ID: {detalle['usuario_id']})")
                print(f"   Acción: {detalle['accion'].upper()}")
                print(f"   Razón: {detalle['razon']}")
        else:
            print("✅ No hubo cambios. Todos los usuarios ya tienen el estado correcto.")

        print("\n" + "=" * 80)
        print("✅ Actualización completada exitosamente")
        print("=" * 80)

    except Exception as e:
        print(f"\n❌ Error durante la actualización: {str(e)}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

    finally:
        db.close()


if __name__ == "__main__":
    main()

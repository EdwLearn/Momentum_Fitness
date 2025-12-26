"""
Script de migración para actualizar el campo activo de empleados.
Los empleados ahora se crean inactivos por defecto y se activan al marcar entrada.
"""

import sqlite3
import sys
from pathlib import Path

# Agregar el directorio raíz al path
sys.path.insert(0, str(Path(__file__).parent))

from app.core.config import settings


def update_empleados_activo():
    """Actualizar el campo activo de empleados existentes"""

    # Conectar a la base de datos
    db_path = settings.DATABASE_URL.replace("sqlite:///", "")
    print(f"Conectando a la base de datos: {db_path}")

    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    try:
        # Verificar si la tabla empleados existe
        cursor.execute("""
            SELECT name FROM sqlite_master
            WHERE type='table' AND name='empleados'
        """)

        if not cursor.fetchone():
            print("La tabla 'empleados' no existe aún. No se requiere migración.")
            return

        # Obtener el conteo de empleados actuales
        cursor.execute("SELECT COUNT(*) FROM empleados")
        total_empleados = cursor.fetchone()[0]

        print(f"\nTotal de empleados en la base de datos: {total_empleados}")

        if total_empleados > 0:
            # Mostrar estado actual de empleados
            cursor.execute("""
                SELECT id, nombre, apellido, activo
                FROM empleados
                ORDER BY id
            """)
            empleados = cursor.fetchall()

            print("\nEstado actual de empleados:")
            print("-" * 60)
            for emp_id, nombre, apellido, activo in empleados:
                estado = "Activo" if activo == 1 else "Inactivo"
                print(f"ID: {emp_id} | {nombre} {apellido or ''} | Estado: {estado}")

            # Preguntar al usuario qué hacer
            print("\n" + "=" * 60)
            print("OPCIONES DE MIGRACIÓN:")
            print("=" * 60)
            print("1. Mantener todos los empleados como están (no cambiar)")
            print("2. Marcar todos los empleados como INACTIVOS")
            print("3. Marcar todos los empleados como ACTIVOS")
            print("4. Cancelar migración")

            opcion = input("\nSelecciona una opción (1-4): ").strip()

            if opcion == "1":
                print("\nNo se realizaron cambios en el estado de los empleados.")
            elif opcion == "2":
                cursor.execute("UPDATE empleados SET activo = 0")
                conn.commit()
                print(f"\n✓ Se marcaron {cursor.rowcount} empleados como INACTIVOS")
                print("  Los empleados se activarán automáticamente al marcar entrada.")
            elif opcion == "3":
                cursor.execute("UPDATE empleados SET activo = 1")
                conn.commit()
                print(f"\n✓ Se marcaron {cursor.rowcount} empleados como ACTIVOS")
            elif opcion == "4":
                print("\nMigración cancelada. No se realizaron cambios.")
            else:
                print("\nOpción inválida. No se realizaron cambios.")
        else:
            print("\nNo hay empleados en la base de datos. No se requiere migración.")

        # Actualizar el valor por defecto de la columna (esto afectará solo nuevos registros)
        print("\n" + "=" * 60)
        print("Actualizando valor por defecto de la columna 'activo'...")
        print("=" * 60)

        # En SQLite, no se puede modificar el default directamente
        # El nuevo valor default (0) se aplicará desde el modelo de SQLAlchemy
        print("✓ El valor por defecto para nuevos empleados será: INACTIVO (0)")
        print("  Esto se aplicará automáticamente desde el modelo de SQLAlchemy.")

        print("\n" + "=" * 60)
        print("MIGRACIÓN COMPLETADA")
        print("=" * 60)
        print("\nRecuerda:")
        print("- Los nuevos empleados se crearán con estado INACTIVO")
        print("- Se activarán automáticamente al marcar entrada")
        print("- Se desactivarán automáticamente al marcar salida")

    except Exception as e:
        print(f"\nError durante la migración: {e}")
        conn.rollback()
        raise
    finally:
        conn.close()


if __name__ == "__main__":
    print("=" * 60)
    print("MIGRACIÓN: Actualizar campo 'activo' de empleados")
    print("=" * 60)
    print("\nEste script actualizará el comportamiento del campo 'activo':")
    print("- Nuevos empleados se crearán como INACTIVOS")
    print("- Se activarán automáticamente al marcar entrada")
    print("- Se desactivarán automáticamente al marcar salida")
    print()

    confirmar = input("¿Deseas continuar? (s/n): ").strip().lower()

    if confirmar in ['s', 'si', 'sí', 'y', 'yes']:
        update_empleados_activo()
    else:
        print("\nMigración cancelada por el usuario.")

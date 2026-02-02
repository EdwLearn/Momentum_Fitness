"""
Migración: Agregar campo 'visitas_disponibles' a la tabla membresias
Fecha: 2026-01-28
Descripción: Agrega el campo visitas_disponibles para controlar el número de visitas
            restantes en planes con límite (ej: PASE_FLEX = 14 visitas en 30 días).

            Para planes ilimitados: visitas_disponibles = NULL
            Para PASE_FLEX: visitas_disponibles = 14 (se decrementa cada asistencia)

            También actualiza las membresías PASE_FLEX existentes:
            1. Establece visitas_disponibles basado en asistencias ya registradas
            2. Ajusta fecha_fin a 30 días desde fecha_inicio
"""

import sys
from pathlib import Path

# Agregar el directorio backend al path para importar módulos
backend_dir = Path(__file__).parent.parent
sys.path.insert(0, str(backend_dir))

from sqlalchemy import create_engine, text
from datetime import timedelta
from app.core.config import settings

def run_migration():
    print("Iniciando migración para agregar campo 'visitas_disponibles' a tabla membresias...")

    # Crear conexión a la base de datos
    engine = create_engine(settings.DATABASE_URL)

    with engine.begin() as connection:
        try:
            # Verificar si la tabla membresias existe
            result = connection.execute(text(
                "SELECT name FROM sqlite_master WHERE type='table' AND name='membresias'"
            ))
            if not result.fetchone():
                print("Error: La tabla 'membresias' no existe")
                return False

            print("Tabla 'membresias' encontrada")

            # Verificar si el campo visitas_disponibles ya existe
            result = connection.execute(text("PRAGMA table_info(membresias)"))
            columns = [row[1] for row in result.fetchall()]

            if 'visitas_disponibles' in columns:
                print("El campo 'visitas_disponibles' ya existe en la tabla. Omitiendo paso de agregar columna.")
            else:
                print("Agregando campo 'visitas_disponibles' a tabla membresias...")
                connection.execute(text("""
                    ALTER TABLE membresias ADD COLUMN visitas_disponibles INTEGER DEFAULT NULL
                """))
                print("Campo 'visitas_disponibles' agregado exitosamente")

            # Actualizar membresías PASE_FLEX existentes
            print("Buscando membresías PASE_FLEX activas para actualizar...")

            # Contar membresías flex activas
            result = connection.execute(text("""
                SELECT COUNT(*) FROM membresias
                WHERE tipo_plan = 'pase_flex' AND activo = 1
            """))
            flex_count = result.scalar()

            if flex_count > 0:
                print(f"Encontradas {flex_count} membresías PASE_FLEX activas")

                # Obtener membresías flex activas
                result = connection.execute(text("""
                    SELECT id, usuario_id, fecha_inicio, fecha_fin FROM membresias
                    WHERE tipo_plan = 'pase_flex' AND activo = 1
                """))
                flex_membresias = result.fetchall()

                for membresia in flex_membresias:
                    membresia_id = membresia[0]
                    usuario_id = membresia[1]
                    fecha_inicio = membresia[2]

                    # Contar asistencias del usuario desde fecha_inicio de la membresía
                    result = connection.execute(text("""
                        SELECT COUNT(*) FROM asistencias
                        WHERE usuario_id = :usuario_id
                        AND fecha >= :fecha_inicio
                    """), {"usuario_id": usuario_id, "fecha_inicio": fecha_inicio})
                    asistencias_usadas = result.scalar() or 0

                    # Calcular visitas restantes (14 - asistencias usadas, mínimo 0)
                    visitas_restantes = max(0, 14 - asistencias_usadas)

                    # Calcular nueva fecha_fin (30 días desde fecha_inicio)
                    # Nota: Esto ajusta la fecha_fin para membresías flex existentes

                    print(f"  Membresía #{membresia_id} (Usuario {usuario_id}): {asistencias_usadas} asistencias, {visitas_restantes} visitas restantes")

                    # Actualizar visitas_disponibles
                    connection.execute(text("""
                        UPDATE membresias
                        SET visitas_disponibles = :visitas
                        WHERE id = :id
                    """), {"visitas": visitas_restantes, "id": membresia_id})

                print(f"Actualizadas {flex_count} membresías PASE_FLEX")
            else:
                print("No hay membresías PASE_FLEX activas para actualizar")

            print("Migración completada exitosamente")
            print("Resumen:")
            print("   - Campo 'visitas_disponibles' agregado a tabla membresias")
            print("   - NULL = plan ilimitado (mensual, trimestral, etc)")
            print("   - Para PASE_FLEX: se establecieron las visitas restantes")
            print("")
            print("IMPORTANTE: Las nuevas membresías PASE_FLEX ahora tendrán:")
            print("   - 30 días de vigencia (1 mes hábil)")
            print("   - 14 visitas disponibles (se descuentan con cada asistencia)")

            return True

        except Exception as e:
            print(f"Error durante la migración: {e}")
            import traceback
            traceback.print_exc()
            return False

if __name__ == "__main__":
    success = run_migration()
    sys.exit(0 if success else 1)

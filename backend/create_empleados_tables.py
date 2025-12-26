"""
Script para crear las tablas de empleados en la base de datos
"""
import sys
import os

# Agregar el directorio backend al path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.core.database import Base, engine
from app.modules.empleados.models.empleado import Empleado
from app.modules.empleados.models.asistencia_empleado import AsistenciaEmpleado

def create_tables():
    """Crear tablas de empleados"""
    print("🔧 Creando tablas de empleados...")

    try:
        # Crear solo las tablas de empleados
        Empleado.__table__.create(bind=engine, checkfirst=True)
        print("✅ Tabla 'empleados' creada")

        AsistenciaEmpleado.__table__.create(bind=engine, checkfirst=True)
        print("✅ Tabla 'asistencias_empleados' creada")

        print("\n🎉 Todas las tablas de empleados fueron creadas exitosamente!")

    except Exception as e:
        print(f"\n❌ Error al crear tablas: {e}")
        raise


if __name__ == "__main__":
    create_tables()

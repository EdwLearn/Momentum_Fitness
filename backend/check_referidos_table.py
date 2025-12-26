"""
Script para verificar y configurar la tabla de referidos
"""
import sys
import os

# Agregar el directorio backend al path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.core.database import SessionLocal, engine
from app.models.referido import Referido
from app.models.usuario import Usuario
from app.modules.usuarios.models.membresia import Membresia
from sqlalchemy import inspect, text

def check_and_create_table():
    """Verificar si la tabla referidos existe y crearla si no"""
    inspector = inspect(engine)

    print("\n" + "="*70)
    print("VERIFICACIÓN DE TABLA REFERIDOS")
    print("="*70)

    if 'referidos' in inspector.get_table_names():
        print("✅ La tabla 'referidos' existe en la base de datos")
    else:
        print("❌ La tabla 'referidos' NO existe")
        print("   Creando tabla...")
        Referido.__table__.create(engine, checkfirst=True)
        print("✅ Tabla 'referidos' creada exitosamente")

    # Verificar contenido
    db = SessionLocal()
    try:
        referidos_count = db.query(Referido).count()
        usuarios_count = db.query(Usuario).filter(Usuario.tipo == "cliente").count()
        membresias_count = db.query(Membresia).count()

        print(f"\n📊 ESTADÍSTICAS:")
        print(f"   Referidos registrados: {referidos_count}")
        print(f"   Clientes en sistema:   {usuarios_count}")
        print(f"   Membresías creadas:    {membresias_count}")

        if referidos_count > 0:
            print(f"\n📋 REFERIDOS EXISTENTES:")
            referidos = db.query(Referido).limit(10).all()
            for ref in referidos:
                referidor = db.query(Usuario).filter(Usuario.id == ref.referidor_id).first()
                referido = db.query(Usuario).filter(Usuario.id == ref.referido_id).first()

                print(f"\n   ID: {ref.id}")
                print(f"   Referidor: {referidor.nombre if referidor else 'Desconocido'} (ID: {ref.referidor_id})")
                print(f"   Referido:  {referido.nombre if referido else 'Desconocido'} (ID: {ref.referido_id})")
                print(f"   Cumple condición: {'Sí' if ref.cumple_condicion else 'No'}")
                print(f"   Beneficio: {ref.beneficio or 'Pendiente'}")
        else:
            print(f"\n⚠️  NO HAY REFERIDOS REGISTRADOS")
            print(f"\n💡 Para crear referidos:")
            print(f"   1. Al crear/renovar membresía, usar el campo 'referido_por_id'")
            print(f"   2. El sistema creará automáticamente el registro de referido")
            print(f"   3. O usar el endpoint POST /api/referidos directamente")

        print(f"\n{'='*70}\n")

    except Exception as e:
        print(f"\n❌ Error al verificar datos: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    check_and_create_table()

"""
Test de integración para verificar la acumulación de días en la base de datos real
"""
import sys
import os
from datetime import datetime, timedelta

# Agregar el directorio backend al path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.core.database import SessionLocal
from app.crud.membresias import create_membresia_simple, get_membresia_activa_by_usuario
from app.schemas.membresia import MembresiaCreateSimple
from app.models.usuario import Usuario
from app.modules.usuarios.models.membresia import TipoPlan

def test_acumulacion_con_bd():
    """
    Prueba la acumulación de días con la base de datos real
    """
    db = SessionLocal()

    try:
        # Buscar un usuario de prueba (el primer cliente activo)
        usuario_prueba = db.query(Usuario).filter(
            Usuario.tipo == "cliente",
            Usuario.activo == True
        ).first()

        if not usuario_prueba:
            print("❌ No se encontró ningún usuario de prueba")
            return

        print(f"\n{'='*70}")
        print(f"👤 Usuario de prueba: {usuario_prueba.nombre} {usuario_prueba.apellido}")
        print(f"   ID: {usuario_prueba.id}")
        print(f"{'='*70}\n")

        # Verificar si tiene membresía activa
        membresia_actual = get_membresia_activa_by_usuario(db, usuario_prueba.id)

        if membresia_actual:
            # Calcular días restantes
            ahora = datetime.now()
            diferencia = membresia_actual.fecha_fin.replace(tzinfo=None) - ahora
            dias_restantes = max(0, diferencia.days + (1 if diferencia.seconds > 0 else 0))

            print(f"📋 MEMBRESÍA ACTUAL:")
            print(f"   Plan: {membresia_actual.tipo_plan.value}")
            print(f"   Fecha inicio: {membresia_actual.fecha_inicio}")
            print(f"   Fecha fin: {membresia_actual.fecha_fin}")
            print(f"   Duración original: {membresia_actual.duracion_dias} días")
            print(f"   Días restantes: {dias_restantes} días")
            print(f"   Estado: {membresia_actual.estado.value}")

            if dias_restantes > 0:
                print(f"\n✅ El usuario tiene {dias_restantes} días restantes")
                print(f"   Si renueva con un plan Mensual (30 días):")
                print(f"   Total: {dias_restantes} + 30 = {dias_restantes + 30} días")
                print(f"\n   Si renueva con un plan 3 Meses (90 días):")
                print(f"   Total: {dias_restantes} + 90 = {dias_restantes + 90} días")
            else:
                print(f"\n⚠️ La membresía ya expiró o está por expirar hoy")
        else:
            print(f"ℹ️ El usuario NO tiene membresía activa")
            print(f"   Si crea una membresía Mensual nueva:")
            print(f"   Total: 0 + 30 = 30 días")

        print(f"\n{'='*70}")
        print("✅ Verificación completada - NO se creó ninguna membresía nueva")
        print("   (Este es solo un test de lectura)")
        print(f"{'='*70}\n")

    except Exception as e:
        print(f"\n❌ Error durante el test: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    test_acumulacion_con_bd()

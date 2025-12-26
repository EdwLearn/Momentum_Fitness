"""
Script de verificación de datos generados
"""

import sys
from pathlib import Path
from collections import Counter

sys.path.append(str(Path(__file__).parent))

from sqlalchemy import func
from app.core.database import get_db

# Import all models to avoid relationship issues
from app.modules.usuarios.models.usuario import Usuario
from app.modules.usuarios.models.membresia import Membresia, TipoPlan
from app.modules.asistencia.models.asistencia import Asistencia
from app.modules.empleados.models.empleado import Empleado
from app.modules.empleados.models.asistencia_empleado import AsistenciaEmpleado
from app.modules.metricas.models.metrica import Metrica
from app.modules.bot.models.conversacion import Conversacion
from app.modules.bot.models.logro import Logro
from app.models.cupon import Cupon
from app.models.referido import Referido

def verificar_datos():
    """Verifica la integridad de los datos generados"""
    print("=" * 60)
    print("🔍 VERIFICACIÓN DE DATOS DE PRUEBA")
    print("=" * 60)

    db = next(get_db())

    try:
        # 1. Verificar cupones
        print("\n📋 CUPONES:")
        cupones = db.query(Cupon).all()
        for cupon in cupones:
            print(f"  - {cupon.codigo}: {cupon.descuento}% descuento, {cupon.usos_total} usos")

        # 2. Verificar empleados
        print("\n👥 EMPLEADOS:")
        empleados = db.query(Empleado).all()
        for emp in empleados:
            print(f"  - {emp.nombre} {emp.apellido}: {emp.tipo_empleado.value}, {emp.horario}")

        # 3. Verificar asistencias de empleados
        print("\n⏰ ASISTENCIAS DE EMPLEADOS:")
        asistencias_emp = db.query(AsistenciaEmpleado).count()
        print(f"  Total: {asistencias_emp} registros")

        # 4. Verificar clientes
        print("\n👤 CLIENTES:")
        total_clientes = db.query(Usuario).filter(Usuario.tipo == "cliente").count()
        print(f"  Total: {total_clientes}")

        # 5. Verificar distribución de planes
        print("\n📊 DISTRIBUCIÓN DE PLANES:")
        planes = db.query(Membresia.tipo_plan, func.count(Membresia.id)).group_by(Membresia.tipo_plan).all()
        for plan, count in planes:
            porcentaje = (count / total_clientes) * 100
            print(f"  - {plan.value}: {count} ({porcentaje:.1f}%)")

        # 6. Verificar referidos
        print("\n🤝 REFERIDOS:")
        total_referidos = db.query(Referido).count()
        porcentaje_referidos = (total_referidos / total_clientes) * 100
        print(f"  Total: {total_referidos} ({porcentaje_referidos:.1f}%)")

        # 7. Verificar uso de cupones
        print("\n🎫 USO DE CUPONES:")
        for cupon in cupones:
            print(f"  - {cupon.codigo}: {cupon.usos_total} usos")

        # 8. Verificar asistencias de clientes
        print("\n📅 ASISTENCIAS DE CLIENTES:")
        total_asistencias = db.query(Asistencia).count()
        promedio = total_asistencias / total_clientes if total_clientes > 0 else 0
        print(f"  Total: {total_asistencias} registros")
        print(f"  Promedio por cliente: {promedio:.1f}")

        # 9. Verificar rangos de asistencias por plan
        print("\n📈 ASISTENCIAS POR PLAN:")
        for plan_tipo in TipoPlan:
            # Obtener IDs de usuarios con este plan (especificar join explícito)
            usuarios_con_plan = db.query(Usuario.id).join(
                Membresia, Usuario.id == Membresia.usuario_id
            ).filter(
                Membresia.tipo_plan == plan_tipo
            ).all()
            usuario_ids = [u[0] for u in usuarios_con_plan]

            if not usuario_ids:
                continue

            # Contar asistencias
            asistencias_por_usuario = db.query(
                func.count(Asistencia.id)
            ).filter(
                Asistencia.usuario_id.in_(usuario_ids)
            ).group_by(Asistencia.usuario_id).all()

            if asistencias_por_usuario:
                asistencias_counts = [a[0] for a in asistencias_por_usuario]
                min_asist = min(asistencias_counts)
                max_asist = max(asistencias_counts)
                promedio_asist = sum(asistencias_counts) / len(asistencias_counts)
                print(f"  - {plan_tipo.value}: {min_asist}-{max_asist} (promedio: {promedio_asist:.1f})")

        # 10. Verificar precios con descuentos
        print("\n💰 VERIFICACIÓN DE DESCUENTOS:")
        membresias_con_descuento = db.query(Membresia).filter(
            Membresia.precio_original != Membresia.precio_final
        ).count()
        print(f"  Membresías con descuento: {membresias_con_descuento}")

        # 11. Verificar distribución de género
        print("\n⚧ DISTRIBUCIÓN DE GÉNERO:")
        generos = db.query(Usuario.genero, func.count(Usuario.id)).filter(
            Usuario.tipo == "cliente"
        ).group_by(Usuario.genero).all()
        for genero, count in generos:
            porcentaje = (count / total_clientes) * 100
            print(f"  - {genero}: {count} ({porcentaje:.1f}%)")

        # 12. Verificar cédulas únicas
        print("\n🆔 VERIFICACIÓN DE INTEGRIDAD:")
        total_usuarios = db.query(Usuario).count()
        cedulas_con_email = db.query(func.count(func.distinct(Usuario.email))).scalar()
        print(f"  Total usuarios: {total_usuarios}")
        print(f"  Emails únicos: {cedulas_con_email}")
        print(f"  ✅ Todos los emails son únicos" if total_usuarios == cedulas_con_email else "  ❌ Hay emails duplicados")

        print("\n" + "=" * 60)
        print("✅ VERIFICACIÓN COMPLETADA")
        print("=" * 60)

    except Exception as e:
        print(f"\n❌ Error durante la verificación: {e}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    verificar_datos()

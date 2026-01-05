"""
Script de prueba para el sistema de alertas de Osneither.
Crea escenarios de prueba y genera alertas automáticas.

Uso:
    python test_alertas.py
"""

import sys
import json
from datetime import datetime, timedelta, date
from sqlalchemy.orm import Session

# Importar modelos antes para evitar errores de orden
from app.core.database import SessionLocal, Base, engine
from app.modules.usuarios.models.usuario import Usuario
from app.modules.usuarios.models.membresia import Membresia
from app.modules.asistencia.models.asistencia import Asistencia
from app.modules.metricas.models.metrica import Metrica
from app.modules.bot.models.conversacion import Conversacion
from app.modules.bot.models.logro import Logro, TipoLogro
from app.modules.bot.models.alerta_osne import AlertaOsne
from app.modules.bot.models.metricas_usuario import MetricasUsuario
from app.modules.bot.models.config_sistema import ConfigSistema
from app.modules.bot.models.historial_analisis import HistorialAnalisis
from app.modules.bot.services.analisis_service import AnalisisService

# Crear tablas si no existen
Base.metadata.create_all(bind=engine)


def limpiar_alertas_test(db: Session):
    """Limpia alertas de prueba anteriores"""
    print("\n🧹 Limpiando alertas de prueba anteriores...")

    # Eliminar alertas de usuarios de prueba
    db.query(AlertaOsne).filter(
        AlertaOsne.razon.like('%TEST:%')
    ).delete(synchronize_session=False)

    db.commit()
    print("✅ Alertas de prueba eliminadas")


def crear_usuario_inactivo(db: Session) -> Usuario:
    """Crea un usuario que lleva 10 días sin asistir (URGENTE)"""
    print("\n📝 Creando usuario TEST: Inactividad Urgente")

    # Buscar o crear usuario
    usuario = db.query(Usuario).filter(Usuario.email == "test.inactivo@momentum.com").first()

    if not usuario:
        usuario = Usuario(
            nombre="Carlos",
            apellido="Inactivo",
            email="test.inactivo@momentum.com",
            telefono="+573001111111",
            objetivo="Perder peso",
            peso_inicial=85.0,
            peso_actual=85.0,
            activo=True
        )
        db.add(usuario)
        db.commit()
        db.refresh(usuario)

    # Crear asistencias hasta hace 10 días
    db.query(Asistencia).filter(Asistencia.usuario_id == usuario.id).delete()

    for i in range(20, 10, -1):  # Del día 20 al día 11 atrás
        asistencia = Asistencia(
            usuario_id=usuario.id,
            fecha=date.today() - timedelta(days=i)
        )
        db.add(asistencia)

    # Crear conversación negativa reciente
    conversacion = Conversacion(
        usuario_id=usuario.id,
        mensaje_usuario="No he podido ir al gym, he estado muy ocupado",
        respuesta_bot="Entiendo que has estado ocupado. ¿Hay algo en lo que podamos ayudarte?",
        sentimiento="negativo",
        timestamp=datetime.utcnow() - timedelta(days=5)
    )
    db.add(conversacion)

    db.commit()

    print(f"✅ Usuario creado: {usuario.nombre} {usuario.apellido}")
    print(f"   - 10 días sin asistir")
    print(f"   - Venía regular antes (10 asistencias)")
    print(f"   - Conversación negativa hace 5 días")

    return usuario


def crear_usuario_racha(db: Session) -> Usuario:
    """Crea un usuario con racha de 30 días (OPORTUNIDAD)"""
    print("\n📝 Creando usuario TEST: Racha Excepcional")

    usuario = db.query(Usuario).filter(Usuario.email == "test.racha@momentum.com").first()

    if not usuario:
        usuario = Usuario(
            nombre="Ana",
            apellido="Constante",
            email="test.racha@momentum.com",
            telefono="+573002222222",
            objetivo="Ganar masa muscular",
            peso_inicial=60.0,
            peso_actual=65.0,
            activo=True
        )
        db.add(usuario)
        db.commit()
        db.refresh(usuario)

    # Crear asistencias consecutivas (30 días)
    db.query(Asistencia).filter(Asistencia.usuario_id == usuario.id).delete()

    for i in range(30, 0, -1):
        asistencia = Asistencia(
            usuario_id=usuario.id,
            fecha=date.today() - timedelta(days=i)
        )
        db.add(asistencia)

    # Asistencia de hoy
    asistencia_hoy = Asistencia(
        usuario_id=usuario.id,
        fecha=date.today()
    )
    db.add(asistencia_hoy)

    # Crear logro de racha
    logro = Logro(
        usuario_id=usuario.id,
        tipo_logro=TipoLogro.RACHA,
        titulo="30 días consecutivos",
        descripcion="¡Increíble racha de 30 días!",
        icono="🔥",
        fecha=date.today()
    )
    db.add(logro)

    # Crear logro de peso
    logro_peso = Logro(
        usuario_id=usuario.id,
        tipo_logro=TipoLogro.PESO,
        titulo="¡5kg ganados!",
        descripcion="Ganaste 5kg de masa muscular",
        icono="💪",
        fecha=date.today() - timedelta(days=7)
    )
    db.add(logro_peso)

    # Conversación positiva
    conversacion = Conversacion(
        usuario_id=usuario.id,
        mensaje_usuario="¡Me siento genial! He ganado 5kg",
        respuesta_bot="¡Felicidades! Tu progreso es increíble 💪",
        sentimiento="positivo",
        timestamp=datetime.utcnow() - timedelta(days=2)
    )
    db.add(conversacion)

    db.commit()

    print(f"✅ Usuario creado: {usuario.nombre} {usuario.apellido}")
    print(f"   - 31 días consecutivos de asistencia")
    print(f"   - Ganó 5kg de masa muscular")
    print(f"   - 2 logros recientes")
    print(f"   - Conversación muy positiva")

    return usuario


def crear_usuario_perdida_peso(db: Session) -> Usuario:
    """Crea un usuario que perdió 8kg (OPORTUNIDAD de celebración)"""
    print("\n📝 Creando usuario TEST: Pérdida de Peso Exitosa")

    usuario = db.query(Usuario).filter(Usuario.email == "test.peso@momentum.com").first()

    if not usuario:
        usuario = Usuario(
            nombre="María",
            apellido="Progreso",
            email="test.peso@momentum.com",
            telefono="+573003333333",
            objetivo="Perder peso para mi boda",
            peso_inicial=75.0,
            peso_actual=67.0,  # Perdió 8kg
            activo=True
        )
        db.add(usuario)
        db.commit()
        db.refresh(usuario)
    else:
        usuario.peso_actual = 67.0
        db.commit()

    # Crear asistencias regulares (15 veces en últimos 30 días)
    db.query(Asistencia).filter(Asistencia.usuario_id == usuario.id).delete()

    dias_asistidos = [1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23, 25, 27, 29]
    for dia in dias_asistidos:
        asistencia = Asistencia(
            usuario_id=usuario.id,
            fecha=date.today() - timedelta(days=30-dia)
        )
        db.add(asistencia)

    # Logro de peso
    logro = Logro(
        usuario_id=usuario.id,
        tipo_logro=TipoLogro.PESO,
        titulo="¡8kg perdidos!",
        descripcion="Excelente progreso hacia tu objetivo",
        icono="⚖️",
        fecha=date.today() - timedelta(days=1)
    )
    db.add(logro)

    # Conversación sobre su meta
    conversacion = Conversacion(
        usuario_id=usuario.id,
        mensaje_usuario="Mi boda es en 2 meses, ¿crees que pueda perder 3kg más?",
        respuesta_bot="Con tu disciplina actual, es totalmente posible. Un asesor puede ayudarte a optimizar tu plan 💪",
        sentimiento="positivo",
        timestamp=datetime.utcnow() - timedelta(days=3)
    )
    db.add(conversacion)

    db.commit()

    print(f"✅ Usuario creado: {usuario.nombre} {usuario.apellido}")
    print(f"   - Perdió 8kg (de 75kg a 67kg)")
    print(f"   - Meta personal: boda en 2 meses")
    print(f"   - Asistencia regular (15 veces en 30 días)")
    print(f"   - Motivada y preguntando por más")

    return usuario


def crear_usuario_solicito_asesor(db: Session) -> Usuario:
    """Crea un usuario que solicitó asesor hace poco (SEGUIMIENTO)"""
    print("\n📝 Creando usuario TEST: Solicitó Asesor")

    usuario = db.query(Usuario).filter(Usuario.email == "test.asesor@momentum.com").first()

    if not usuario:
        usuario = Usuario(
            nombre="Pedro",
            apellido="Novato",
            email="test.asesor@momentum.com",
            telefono="+573004444444",
            objetivo="Crear rutina de ejercicios",
            peso_inicial=70.0,
            peso_actual=70.0,
            activo=True
        )
        db.add(usuario)
        db.commit()
        db.refresh(usuario)

    # Pocas asistencias (es nuevo)
    db.query(Asistencia).filter(Asistencia.usuario_id == usuario.id).delete()

    for i in [1, 2, 4, 5]:
        asistencia = Asistencia(
            usuario_id=usuario.id,
            fecha=date.today() - timedelta(days=i)
        )
        db.add(asistencia)

    # Conversación pidiendo ayuda
    conversacion1 = Conversacion(
        usuario_id=usuario.id,
        mensaje_usuario="Hola, soy nuevo en el gym",
        respuesta_bot="¡Bienvenido! ¿En qué puedo ayudarte?",
        sentimiento="neutral",
        timestamp=datetime.utcnow() - timedelta(days=5)
    )
    db.add(conversacion1)

    conversacion2 = Conversacion(
        usuario_id=usuario.id,
        mensaje_usuario="¿Puedo hablar con un asesor? Necesito ayuda con mi rutina",
        respuesta_bot="¡Perfecto! Un asesor se pondrá en contacto contigo muy pronto 📱 [ALERTA_ASESOR]",
        sentimiento="neutral",
        timestamp=datetime.utcnow() - timedelta(hours=12),
        es_trigger=False
    )
    db.add(conversacion2)

    db.commit()

    print(f"✅ Usuario creado: {usuario.nombre} {usuario.apellido}")
    print(f"   - Nuevo (solo 4 asistencias)")
    print(f"   - Solicitó asesor hace 12 horas")
    print(f"   - Necesita rutina personalizada")

    return usuario


def generar_alertas_manual(db: Session, usuarios: list):
    """Ejecuta el análisis manual para generar alertas"""
    print("\n\n" + "="*60)
    print("🤖 GENERANDO ALERTAS CON IA")
    print("="*60)

    service = AnalisisService(db)

    for usuario in usuarios:
        print(f"\n📊 Analizando: {usuario.nombre} {usuario.apellido}...")

        try:
            analisis = service.analizar_usuario(usuario)

            if analisis:
                # Agregar prefijo TEST a la razón
                analisis["razon"] = f"TEST: {analisis['razon']}"

                alerta = service.crear_alerta_osne(analisis)

                print(f"✅ ALERTA GENERADA:")
                print(f"   Tipo: {alerta.tipo_alerta.upper()}")
                print(f"   Prioridad: {alerta.prioridad}/5")
                print(f"   Razón: {alerta.razon}")
                print(f"   Acción sugerida: {alerta.accion_sugerida}")
                print(f"   Puntos clave: {alerta.puntos_clave.replace('|', ' | ')}")
            else:
                print(f"ℹ️  No requiere intervención en este momento")

        except Exception as e:
            print(f"❌ Error: {str(e)}")


def ver_alertas_generadas(db: Session):
    """Muestra todas las alertas generadas en la prueba"""
    print("\n\n" + "="*60)
    print("📋 RESUMEN DE ALERTAS GENERADAS")
    print("="*60)

    alertas = db.query(AlertaOsne).filter(
        AlertaOsne.estado == 'pendiente',
        AlertaOsne.razon.like('TEST:%')
    ).order_by(AlertaOsne.prioridad, AlertaOsne.timestamp.desc()).all()

    if not alertas:
        print("\n⚠️  No se generaron alertas")
        return

    print(f"\n✅ Total de alertas: {len(alertas)}\n")

    for i, alerta in enumerate(alertas, 1):
        usuario = db.query(Usuario).filter(Usuario.id == alerta.usuario_id).first()

        print(f"{i}. 🚨 {alerta.tipo_alerta.upper()} - Prioridad {alerta.prioridad}/5")
        print(f"   Usuario: {usuario.nombre} {usuario.apellido}")
        print(f"   Razón: {alerta.razon.replace('TEST: ', '')}")
        print(f"   Acción: {alerta.accion_sugerida}")
        print(f"   Puntos: {alerta.puntos_clave.replace('|', ', ')}")
        print(f"   ID: {alerta.id}")
        print()


def test_api_endpoints(db: Session):
    """Prueba los endpoints de la API"""
    print("\n\n" + "="*60)
    print("🔧 PRUEBA DE ENDPOINTS API")
    print("="*60)

    print("\n💡 Puedes probar estos endpoints en http://localhost:8000/docs:\n")

    print("1️⃣ Ver alertas pendientes:")
    print("   GET /api/bot/alertas/pendientes")
    print("   Filtra por tipo: ?tipo_alerta=urgente")
    print("   Filtra por prioridad: ?prioridad_max=2")

    print("\n2️⃣ Ver estadísticas:")
    print("   GET /api/bot/alertas/estadisticas/resumen")

    print("\n3️⃣ Ver alertas de un usuario:")
    print("   GET /api/bot/alertas/usuario/{usuario_id}")

    print("\n4️⃣ Atender una alerta:")
    print("   POST /api/bot/alertas/atender")
    print("   Body: {")
    print("     \"alerta_id\": 1,")
    print("     \"notas_osne\": \"Llamé al cliente, acordamos sesión\",")
    print("     \"resultado\": \"reactivado\"")
    print("   }")

    print("\n5️⃣ Descartar una alerta:")
    print("   POST /api/bot/alertas/descartar/{alerta_id}")


def main():
    """Ejecuta todas las pruebas"""
    print("="*60)
    print("🧪 TEST DE SISTEMA DE ALERTAS - MOMENTUM FITNESS")
    print("="*60)

    db = SessionLocal()

    try:
        # Limpiar pruebas anteriores
        limpiar_alertas_test(db)

        # Crear usuarios de prueba con diferentes escenarios
        usuarios = []

        usuarios.append(crear_usuario_inactivo(db))
        usuarios.append(crear_usuario_racha(db))
        usuarios.append(crear_usuario_perdida_peso(db))
        usuarios.append(crear_usuario_solicito_asesor(db))

        # Generar alertas usando IA
        generar_alertas_manual(db, usuarios)

        # Mostrar resumen
        ver_alertas_generadas(db)

        # Mostrar info de endpoints
        test_api_endpoints(db)

        print("\n" + "="*60)
        print("✅ PRUEBA COMPLETADA")
        print("="*60)

        print("\n📝 Próximos pasos:")
        print("1. Inicia el servidor: python backend/main.py")
        print("2. Ve a http://localhost:8000/docs")
        print("3. Prueba el endpoint GET /api/bot/alertas/pendientes")
        print("4. Verás las 4 alertas de prueba generadas")
        print("\n💡 Tip: Las alertas tienen prefijo 'TEST:' para identificarlas")

    except Exception as e:
        print(f"\n❌ Error durante la prueba: {str(e)}")
        import traceback
        traceback.print_exc()

    finally:
        db.close()


if __name__ == "__main__":
    print("\n⚠️  IMPORTANTE: Esta prueba creará usuarios y alertas de prueba")
    print("Todos tendrán el prefijo 'TEST:' para identificarlos fácilmente")
    print("\n¿Continuar? (presiona Ctrl+C para cancelar)\n")

    try:
        input("Presiona Enter para continuar...")
    except KeyboardInterrupt:
        print("\n\n👋 Prueba cancelada.")
        sys.exit(0)

    main()

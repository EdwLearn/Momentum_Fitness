#!/usr/bin/env python3
"""
Script de prueba para verificar la configuración.
Ejecuta: python test_config.py
"""

from app.core.config import settings

def test_configuration():
    """Prueba que la configuración se cargue correctamente"""
    print("=" * 60)
    print("VERIFICACIÓN DE CONFIGURACIÓN")
    print("=" * 60)
    print()

    # Información del proyecto
    print("📋 INFORMACIÓN DEL PROYECTO")
    print(f"   Nombre: {settings.PROJECT_NAME}")
    print(f"   Versión: {settings.VERSION}")
    print(f"   Entorno: {settings.ENVIRONMENT}")
    print(f"   Debug: {settings.DEBUG}")
    print()

    # Base de datos
    print("🗄️  BASE DE DATOS")
    db_type = "SQLite" if "sqlite" in settings.DATABASE_URL else "PostgreSQL"
    print(f"   Tipo: {db_type}")
    print(f"   URL: {settings.DATABASE_URL}")
    print()

    # CORS
    print("🌐 CORS - ALLOWED_ORIGINS")
    print(f"   Tipo: {type(settings.ALLOWED_ORIGINS)}")
    print(f"   Cantidad: {len(settings.ALLOWED_ORIGINS)}")
    for i, origin in enumerate(settings.ALLOWED_ORIGINS, 1):
        print(f"   {i}. {origin}")
    print()

    # Seguridad
    print("🔐 SEGURIDAD")
    print(f"   SECRET_KEY: {'✅ Configurado' if settings.SECRET_KEY else '❌ No configurado'}")
    print(f"   Algoritmo: {settings.ALGORITHM}")
    print(f"   Token expira en: {settings.ACCESS_TOKEN_EXPIRE_MINUTES} minutos")
    print()

    # Claude API
    print("🤖 CLAUDE API")
    api_key_configured = settings.ANTHROPIC_API_KEY and settings.ANTHROPIC_API_KEY != ""
    print(f"   API Key: {'✅ Configurado' if api_key_configured else '⚠️  No configurado (bot deshabilitado)'}")
    print(f"   Modelo: {settings.BOT_MODEL}")
    print(f"   Bot Name: {settings.BOT_NAME}")
    print()

    # Triggers
    print("⚡ TRIGGERS AUTOMÁTICOS")
    print(f"   Rachas: {settings.RACHA_DIAS_HITOS} días")
    print(f"   Cambios de peso: {settings.CAMBIO_PESO_KG_HITOS} kg")
    print(f"   Inactividad: {settings.DIAS_INACTIVIDAD_HITOS} días")
    print()

    # Computer Vision
    print("👁️  COMPUTER VISION")
    print(f"   Habilitado: {settings.CV_ENABLED}")
    print()

    # Validaciones
    print("=" * 60)
    print("VALIDACIONES")
    print("=" * 60)

    errors = []
    warnings = []

    # Validar ALLOWED_ORIGINS es una lista
    if not isinstance(settings.ALLOWED_ORIGINS, list):
        errors.append("❌ ALLOWED_ORIGINS no es una lista")
    else:
        print("✅ ALLOWED_ORIGINS es una lista correcta")

    # Validar que tenga al menos un origen
    if len(settings.ALLOWED_ORIGINS) == 0:
        errors.append("❌ ALLOWED_ORIGINS está vacío")
    else:
        print(f"✅ ALLOWED_ORIGINS tiene {len(settings.ALLOWED_ORIGINS)} orígenes")

    # Validar SECRET_KEY
    if not settings.SECRET_KEY or len(settings.SECRET_KEY) < 16:
        warnings.append("⚠️  SECRET_KEY es muy corto o no está configurado")
    else:
        print("✅ SECRET_KEY configurado correctamente")

    # Validar ANTHROPIC_API_KEY
    if not api_key_configured:
        warnings.append("⚠️  ANTHROPIC_API_KEY no configurado (el bot no funcionará)")
    else:
        print("✅ ANTHROPIC_API_KEY configurado")

    # Validar DATABASE_URL
    if not settings.DATABASE_URL:
        errors.append("❌ DATABASE_URL no configurado")
    else:
        print(f"✅ DATABASE_URL configurado ({db_type})")

    print()

    # Mostrar errores y advertencias
    if errors:
        print("=" * 60)
        print("ERRORES ENCONTRADOS")
        print("=" * 60)
        for error in errors:
            print(error)
        print()

    if warnings:
        print("=" * 60)
        print("ADVERTENCIAS")
        print("=" * 60)
        for warning in warnings:
            print(warning)
        print()

    # Resultado final
    print("=" * 60)
    if not errors:
        print("✅ CONFIGURACIÓN CORRECTA")
        print("=" * 60)
        print()
        print("🚀 El servidor debería arrancar sin problemas")
        print("   Ejecuta: python run.py")
        print()
        if warnings:
            print("💡 Hay algunas advertencias, pero no son críticas")
        return True
    else:
        print("❌ CONFIGURACIÓN CON ERRORES")
        print("=" * 60)
        print()
        print("🔧 Corrige los errores antes de ejecutar el servidor")
        return False


if __name__ == "__main__":
    import sys
    success = test_configuration()
    sys.exit(0 if success else 1)

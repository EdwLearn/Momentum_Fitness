"""
Script de prueba para la integración con WhatsApp Business.
Ejecuta este script para probar el envío de mensajes.

Uso:
    python test_whatsapp.py
"""

import asyncio
import sys
from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.modules.whatsapp.services.whatsapp_service import WhatsAppService


async def test_enviar_mensaje_texto():
    """Prueba el envío de un mensaje de texto simple"""
    print("\n🧪 Test 1: Enviar mensaje de texto")
    print("-" * 50)

    db = SessionLocal()
    service = WhatsAppService()

    # CAMBIA ESTE NÚMERO POR EL TUYO
    tu_numero = "+573001234567"  # ⚠️ Debe estar agregado en Meta Developer Console

    resultado = await service.enviar_mensaje_texto(
        db=db,
        telefono_destino=tu_numero,
        mensaje="🧪 Test desde Momentum Fitness! El bot de WhatsApp está funcionando correctamente 💪",
        usuario_id=None
    )

    db.close()

    if resultado["success"]:
        print("✅ Mensaje enviado exitosamente!")
        print(f"   Message ID: {resultado.get('message_id')}")
        print(f"   Timestamp: {resultado.get('timestamp')}")
    else:
        print("❌ Error al enviar mensaje:")
        print(f"   {resultado.get('error')}")

    return resultado["success"]


async def test_enviar_template():
    """Prueba el envío de un template pre-aprobado"""
    print("\n🧪 Test 2: Enviar template")
    print("-" * 50)

    db = SessionLocal()
    service = WhatsAppService()

    # CAMBIA ESTE NÚMERO POR EL TUYO
    tu_numero = "+573001234567"

    # Este template debe estar pre-aprobado en Meta Business Manager
    # Puedes usar "hello_world" que viene por defecto para testing
    resultado = await service.enviar_template(
        db=db,
        telefono_destino=tu_numero,
        template_name="hello_world",  # Template por defecto de Meta
        template_params=None,
        usuario_id=None
    )

    db.close()

    if resultado["success"]:
        print("✅ Template enviado exitosamente!")
        print(f"   Message ID: {resultado.get('message_id')}")
    else:
        print("❌ Error al enviar template:")
        print(f"   {resultado.get('error')}")
        print("\nℹ️  Nota: Asegúrate de que el template 'hello_world' esté aprobado en Meta")

    return resultado["success"]


async def test_enviar_imagen():
    """Prueba el envío de una imagen"""
    print("\n🧪 Test 3: Enviar imagen")
    print("-" * 50)

    db = SessionLocal()
    service = WhatsAppService()

    # CAMBIA ESTE NÚMERO POR EL TUYO
    tu_numero = "+573001234567"

    # URL de una imagen pública (debe ser HTTPS)
    imagen_url = "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800"

    resultado = await service.enviar_imagen(
        db=db,
        telefono_destino=tu_numero,
        imagen_url=imagen_url,
        caption="💪 Imagen de prueba desde Momentum Fitness!",
        usuario_id=None
    )

    db.close()

    if resultado["success"]:
        print("✅ Imagen enviada exitosamente!")
        print(f"   Message ID: {resultado.get('message_id')}")
    else:
        print("❌ Error al enviar imagen:")
        print(f"   {resultado.get('error')}")

    return resultado["success"]


async def main():
    """Ejecuta todos los tests"""
    print("=" * 50)
    print("🚀 TESTS DE WHATSAPP BUSINESS API")
    print("=" * 50)

    # Verificar configuración
    from app.core.config import settings

    if not settings.WHATSAPP_ACCESS_TOKEN:
        print("\n❌ ERROR: WHATSAPP_ACCESS_TOKEN no está configurado en .env")
        print("   Agrega tu token de Meta en el archivo .env")
        sys.exit(1)

    if not settings.WHATSAPP_PHONE_NUMBER_ID:
        print("\n❌ ERROR: WHATSAPP_PHONE_NUMBER_ID no está configurado en .env")
        print("   Agrega el Phone Number ID de Meta en el archivo .env")
        sys.exit(1)

    print("\n✅ Configuración encontrada:")
    print(f"   Phone Number ID: {settings.WHATSAPP_PHONE_NUMBER_ID}")
    print(f"   Access Token: {settings.WHATSAPP_ACCESS_TOKEN[:20]}...")

    # Ejecutar tests
    resultados = []

    # Test 1: Mensaje de texto
    resultado1 = await test_enviar_mensaje_texto()
    resultados.append(("Mensaje de texto", resultado1))

    await asyncio.sleep(2)  # Esperar entre requests

    # Test 2: Template (comentado por defecto, descomentar si tienes templates aprobados)
    # resultado2 = await test_enviar_template()
    # resultados.append(("Template", resultado2))
    # await asyncio.sleep(2)

    # Test 3: Imagen
    resultado3 = await test_enviar_imagen()
    resultados.append(("Imagen", resultado3))

    # Resumen
    print("\n" + "=" * 50)
    print("📊 RESUMEN DE TESTS")
    print("=" * 50)

    total = len(resultados)
    exitosos = sum(1 for _, resultado in resultados if resultado)

    for nombre, resultado in resultados:
        status = "✅" if resultado else "❌"
        print(f"{status} {nombre}")

    print(f"\nTotal: {exitosos}/{total} tests exitosos")

    if exitosos == total:
        print("\n🎉 ¡Todos los tests pasaron! WhatsApp está funcionando correctamente.")
    else:
        print("\n⚠️  Algunos tests fallaron. Revisa los errores arriba.")

    print("\n💡 Tip: Revisa la base de datos para ver los mensajes guardados:")
    print("   sqlite3 gimnasio.db \"SELECT * FROM mensajes_whatsapp ORDER BY fecha_creacion DESC LIMIT 5;\"")


if __name__ == "__main__":
    print("\n⚠️  IMPORTANTE: Antes de ejecutar este test:")
    print("1. Configura las variables de entorno en .env")
    print("2. Agrega tu número en Meta Developer Console")
    print("3. Cambia 'tu_numero' en este script por tu número real")
    print("\n¿Continuar? (presiona Ctrl+C para cancelar)")

    try:
        input("\nPresiona Enter para continuar...")
    except KeyboardInterrupt:
        print("\n\n👋 Test cancelado.")
        sys.exit(0)

    # Ejecutar tests
    asyncio.run(main())

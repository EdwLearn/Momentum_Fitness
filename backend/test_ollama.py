#!/usr/bin/env python3
"""
Script de prueba para verificar que Ollama funciona correctamente.
"""
import sys
import os

# Agregar el directorio backend al path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

def test_ollama_connection():
    """Prueba la conexión básica con Ollama"""
    print("🔍 Probando conexión con Ollama...")

    try:
        from langchain_ollama import ChatOllama

        llm = ChatOllama(
            model="qwen2.5:7b",
            base_url="http://localhost:11434"
        )

        response = llm.invoke("Responde solo con: OK")
        print(f"✅ Conexión exitosa")
        print(f"Respuesta: {response.content}")
        return True

    except Exception as e:
        print(f"❌ Error de conexión: {str(e)}")
        print("\n💡 Sugerencias:")
        print("1. Verifica que Ollama esté corriendo: pgrep ollama")
        print("2. Inicia Ollama: ollama serve &")
        print("3. Descarga el modelo: ollama pull qwen2.5:14b")
        return False


def test_llm_config():
    """Prueba el sistema de configuración de LLM"""
    print("\n🔍 Probando configuración de LLM...")

    try:
        from app.core.llm_config import get_llm, get_conversational_llm, get_analytical_llm

        # Probar LLM conversacional
        print("  - LLM conversacional (temperatura 0.7)...")
        llm_conv = get_conversational_llm(use_local=True)
        response = llm_conv.invoke("Di solo: Hola")
        print(f"    ✅ Respuesta: {response.content}")

        # Probar LLM analítico
        print("  - LLM analítico (temperatura 0.3)...")
        llm_anal = get_analytical_llm(use_local=True)
        response = llm_anal.invoke("Responde solo con un número del 1 al 5")
        print(f"    ✅ Respuesta: {response.content}")

        return True

    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return False


def test_bot_service():
    """Prueba el servicio del bot"""
    print("\n🔍 Probando GymBotService...")

    try:
        from app.modules.bot.langchain.bot_service import GymBotService

        bot = GymBotService()
        print("  ✅ Bot inicializado correctamente")
        print(f"  Modelo: {bot.llm.model}")

        return True

    except Exception as e:
        print(f"❌ Error: {str(e)}")
        import traceback
        traceback.print_exc()
        return False


def test_analisis_service():
    """Prueba el servicio de análisis (sin BD)"""
    print("\n🔍 Probando AnalisisService...")

    try:
        # Solo probamos que se puede importar y crear la instancia del LLM
        from app.core.llm_config import get_analytical_llm

        llm = get_analytical_llm(use_local=True)
        print("  ✅ LLM de análisis inicializado correctamente")
        print(f"  Modelo: {llm.model}")

        # Prueba rápida de análisis
        prompt = """Analiza esta situación y responde SOLO con un JSON:
{"requiere_intervencion": true/false, "razon": "breve explicación"}

Situación: Usuario Juan, 7 días sin asistir, tenía racha de 30 días consecutivos."""

        response = llm.invoke(prompt)
        print(f"  ✅ Respuesta de análisis: {response.content[:100]}...")

        return True

    except Exception as e:
        print(f"❌ Error: {str(e)}")
        import traceback
        traceback.print_exc()
        return False


def main():
    print("=" * 60)
    print("🧪 PRUEBA DE OLLAMA + QWEN 2.5")
    print("=" * 60)
    print()

    # Configurar variable de entorno
    os.environ['USE_LOCAL_LLM'] = 'true'
    os.environ['LOCAL_LLM_MODEL'] = 'qwen2.5:7b'
    os.environ['LOCAL_LLM_BASE_URL'] = 'http://localhost:11434'

    results = []

    # Ejecutar pruebas
    results.append(("Conexión Ollama", test_ollama_connection()))
    results.append(("Configuración LLM", test_llm_config()))
    results.append(("Bot Service", test_bot_service()))
    results.append(("Análisis Service", test_analisis_service()))

    # Resumen
    print("\n" + "=" * 60)
    print("📊 RESUMEN DE PRUEBAS")
    print("=" * 60)

    for test_name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{test_name:.<40} {status}")

    total = len(results)
    passed = sum(1 for _, result in results if result)

    print()
    print(f"Total: {passed}/{total} pruebas exitosas")

    if passed == total:
        print("\n🎉 ¡Todas las pruebas pasaron! Ollama está listo para usar.")
        return 0
    else:
        print("\n⚠️  Algunas pruebas fallaron. Revisa los errores arriba.")
        return 1


if __name__ == "__main__":
    sys.exit(main())

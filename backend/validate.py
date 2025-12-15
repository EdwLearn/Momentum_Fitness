#!/usr/bin/env python3
"""
Script de validación del sistema.
Verifica que todas las configuraciones estén correctas antes de ejecutar.
"""

import sys
import os
from pathlib import Path


def print_header(text):
    """Imprime un encabezado formateado"""
    print(f"\n{'='*60}")
    print(f"  {text}")
    print(f"{'='*60}\n")


def print_check(name, status, message=""):
    """Imprime el resultado de una verificación"""
    icon = "✅" if status else "❌"
    print(f"{icon} {name}")
    if message:
        print(f"   → {message}")


def check_python_version():
    """Verifica la versión de Python"""
    version = sys.version_info
    required = (3, 10)

    if version >= required:
        print_check(
            "Versión de Python",
            True,
            f"Python {version.major}.{version.minor}.{version.micro}"
        )
        return True
    else:
        print_check(
            "Versión de Python",
            False,
            f"Se requiere Python 3.10+, tienes {version.major}.{version.minor}"
        )
        return False


def check_env_file():
    """Verifica que exista el archivo .env"""
    env_path = Path(".env")

    if env_path.exists():
        print_check("Archivo .env", True, "Encontrado")
        return True
    else:
        print_check(
            "Archivo .env",
            False,
            "No encontrado. Copia .env.example a .env"
        )
        return False


def check_required_packages():
    """Verifica que los paquetes requeridos estén instalados"""
    required = [
        "fastapi",
        "uvicorn",
        "sqlalchemy",
        "pydantic",
        "langchain",
        "anthropic",
    ]

    all_installed = True

    for package in required:
        try:
            __import__(package)
            print_check(f"Paquete {package}", True)
        except ImportError:
            print_check(
                f"Paquete {package}",
                False,
                "No instalado. Ejecuta: pip install -r requirements.txt"
            )
            all_installed = False

    return all_installed


def check_environment_variables():
    """Verifica las variables de entorno importantes"""
    from dotenv import load_dotenv
    load_dotenv()

    checks = []

    # DATABASE_URL
    db_url = os.getenv("DATABASE_URL")
    if db_url:
        db_type = "PostgreSQL" if "postgresql" in db_url else "SQLite"
        print_check("DATABASE_URL", True, f"Configurado ({db_type})")
        checks.append(True)
    else:
        print_check("DATABASE_URL", False, "No configurado")
        checks.append(False)

    # ANTHROPIC_API_KEY
    api_key = os.getenv("ANTHROPIC_API_KEY")
    if api_key and api_key != "sk-ant-api03-your-key-here":
        print_check("ANTHROPIC_API_KEY", True, "Configurado")
        checks.append(True)
    else:
        print_check(
            "ANTHROPIC_API_KEY",
            False,
            "No configurado o es el valor de ejemplo"
        )
        checks.append(False)

    # SECRET_KEY
    secret = os.getenv("SECRET_KEY")
    if secret and secret != "your-secret-key-here-change-in-production-use-openssl-rand-hex-32":
        print_check("SECRET_KEY", True, "Configurado")
        checks.append(True)
    else:
        print_check(
            "SECRET_KEY",
            False,
            "Usando valor de ejemplo (cambiar en producción)"
        )
        checks.append(False)

    return all(checks)


def check_database_connection():
    """Verifica la conexión a la base de datos"""
    try:
        from app.core.database import engine
        from sqlalchemy import text

        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))

        print_check("Conexión a base de datos", True, "Conectado")
        return True
    except Exception as e:
        print_check(
            "Conexión a base de datos",
            False,
            f"Error: {str(e)[:50]}..."
        )
        return False


def check_models():
    """Verifica que los modelos se puedan importar"""
    try:
        from app.modules.usuarios.models.usuario import Usuario
        from app.modules.usuarios.models.membresia import Membresia
        from app.modules.asistencia.models.asistencia import Asistencia
        from app.modules.metricas.models.metrica import Metrica
        from app.modules.bot.models.conversacion import Conversacion
        from app.modules.bot.models.logro import Logro

        print_check("Modelos de datos", True, "Todos los modelos cargados")
        return True
    except Exception as e:
        print_check("Modelos de datos", False, f"Error: {str(e)[:50]}...")
        return False


def check_endpoints():
    """Verifica que los endpoints se puedan importar"""
    try:
        from app.api.endpoints import usuarios, membresias, asistencia, metricas
        from app.modules.bot.endpoints import bot_endpoints
        from app.modules.computer_vision.endpoints import cv_endpoints_placeholder

        print_check("Endpoints", True, "Todos los routers cargados")
        return True
    except Exception as e:
        print_check("Endpoints", False, f"Error: {str(e)[:50]}...")
        return False


def main():
    """Función principal"""
    print_header("🔍 VALIDACIÓN DEL SISTEMA")

    checks = []

    # 1. Python
    print_header("1. Entorno Python")
    checks.append(check_python_version())

    # 2. Archivos
    print_header("2. Archivos de Configuración")
    checks.append(check_env_file())

    # 3. Paquetes
    print_header("3. Paquetes de Python")
    checks.append(check_required_packages())

    # 4. Variables de entorno
    print_header("4. Variables de Entorno")
    checks.append(check_environment_variables())

    # 5. Base de datos
    print_header("5. Base de Datos")
    checks.append(check_database_connection())

    # 6. Modelos
    print_header("6. Modelos de Datos")
    checks.append(check_models())

    # 7. Endpoints
    print_header("7. Endpoints API")
    checks.append(check_endpoints())

    # Resultado final
    print_header("📊 RESULTADO FINAL")

    total = len(checks)
    passed = sum(checks)

    print(f"Verificaciones pasadas: {passed}/{total}")

    if all(checks):
        print("\n✅ ¡Todo listo! El sistema está correctamente configurado.")
        print("\n🚀 Para iniciar el servidor, ejecuta:")
        print("   python run.py")
        print("\n📚 O consulta INICIO_RAPIDO.md para más opciones")
        return 0
    else:
        print("\n❌ Algunas verificaciones fallaron.")
        print("\n🔧 Por favor, corrige los problemas indicados arriba.")
        print("📖 Consulta INICIO_RAPIDO.md para más ayuda.")
        return 1


if __name__ == "__main__":
    sys.exit(main())

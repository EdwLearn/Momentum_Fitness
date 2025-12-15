#!/usr/bin/env python3
"""
Script de inicio rápido para el Sistema de Gestión de Gimnasio

Uso:
    python run.py              # Desarrollo con auto-reload
    python run.py --prod       # Producción
    python run.py --init-db    # Inicializar base de datos
"""

import sys
import argparse
from app.core.database import init_db


def start_development():
    """Inicia el servidor en modo desarrollo"""
    import uvicorn
    print("🚀 Iniciando servidor en modo DESARROLLO...")
    print("📝 Auto-reload habilitado")
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )


def start_production():
    """Inicia el servidor en modo producción"""
    import uvicorn
    print("🚀 Iniciando servidor en modo PRODUCCIÓN...")
    print("⚡ Múltiples workers habilitados")
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        workers=4,
        log_level="warning"
    )


def initialize_database():
    """Inicializa la base de datos creando todas las tablas"""
    print("📊 Inicializando base de datos...")
    try:
        init_db()
        print("✅ Base de datos inicializada correctamente")
        print("📋 Tablas creadas:")
        print("   - usuarios")
        print("   - membresias")
        print("   - asistencias")
        print("   - metricas")
        print("   - conversaciones")
        print("   - logros")
    except Exception as e:
        print(f"❌ Error al inicializar base de datos: {e}")
        sys.exit(1)


def main():
    parser = argparse.ArgumentParser(
        description="Sistema de Gestión de Gimnasio - Script de Inicio"
    )
    parser.add_argument(
        "--prod",
        action="store_true",
        help="Ejecutar en modo producción"
    )
    parser.add_argument(
        "--init-db",
        action="store_true",
        help="Inicializar base de datos"
    )

    args = parser.parse_args()

    if args.init_db:
        initialize_database()
    elif args.prod:
        start_production()
    else:
        start_development()


if __name__ == "__main__":
    main()

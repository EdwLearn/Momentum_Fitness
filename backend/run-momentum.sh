#!/bin/bash

# Script para ejecutar Momentum Backend
# Sistema de Gestión de Gimnasio

set -e  # Exit on error

echo "🚀 Iniciando Momentum Backend..."
echo "================================"
echo ""

# Verificar que estamos en el directorio correcto
if [ ! -f "main.py" ]; then
    echo "❌ Error: Este script debe ejecutarse desde el directorio backend/"
    echo "Uso: cd backend && ./run-momentum.sh"
    exit 1
fi

# Verificar que el ejecutable existe
if [ ! -f "dist/momentum" ]; then
    echo "❌ Error: No se encontró el ejecutable 'dist/momentum'"
    echo ""
    echo "Para compilar el ejecutable, ejecuta:"
    echo "  pyinstaller momentum.spec"
    echo ""
    exit 1
fi

# Verificar que el archivo .env existe
if [ ! -f ".env" ]; then
    echo "⚠️  Advertencia: No se encontró el archivo .env"
    echo "Creando .env de ejemplo..."
    cat > .env << 'EOF'
# Configuración de la aplicación
PROJECT_NAME=Momentum - Sistema de Gestión de Gimnasio
VERSION=2.0.0
DESCRIPTION=Sistema completo de gestión para gimnasios

# Base de datos
DATABASE_URL=sqlite:///./gimnasio.db

# CORS
ALLOWED_ORIGINS=["http://localhost:3000", "http://localhost:3001"]

# Pool de conexiones (para PostgreSQL)
DB_POOL_SIZE=5
DB_MAX_OVERFLOW=10
DB_POOL_TIMEOUT=30

# Claude API (para bot)
ANTHROPIC_API_KEY=tu_api_key_aqui
EOF
    echo "✅ Archivo .env creado."
    echo ""
fi

# Verificar si el puerto 8000 está en uso
if lsof -Pi :8000 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    echo "⚠️  Advertencia: El puerto 8000 ya está en uso"
    echo "¿Deseas detener el proceso existente? (s/n)"
    read -r response
    if [[ "$response" =~ ^[Ss]$ ]]; then
        echo "Deteniendo procesos en el puerto 8000..."
        lsof -ti:8000 | xargs kill -9 2>/dev/null || true
        sleep 2
    else
        echo "❌ Abortando. Por favor, libera el puerto 8000 primero."
        exit 1
    fi
fi

# Mostrar información del ejecutable
echo "📦 Ejecutable:"
echo "   Ubicación: dist/momentum"
echo "   Tamaño: $(du -h dist/momentum | cut -f1)"
echo "   Tipo: $(file -b dist/momentum | cut -d',' -f1)"
echo ""

# Ejecutar el backend
echo "📡 Servidor iniciando en http://localhost:8000"
echo "📚 Documentación disponible en http://localhost:8000/docs"
echo "🔍 ReDoc disponible en http://localhost:8000/redoc"
echo "💚 Health check: http://localhost:8000/health"
echo ""
echo "Presiona Ctrl+C para detener el servidor"
echo "================================"
echo ""

# Trap para manejar Ctrl+C
trap 'echo -e "\n\n👋 Deteniendo servidor..."; exit 0' INT

# Ejecutar el backend
./dist/momentum

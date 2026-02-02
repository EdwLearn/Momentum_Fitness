#!/bin/bash

# Script de inicio para Momentum Fitness

echo "=================================="
echo "🏋️  Momentum Fitness - Inicio"
echo "=================================="
echo ""

# Verificar que Docker esté instalado
if ! command -v docker &> /dev/null; then
    echo "❌ Docker no está instalado."
    echo "Por favor instala Docker Desktop desde: https://www.docker.com/products/docker-desktop"
    exit 1
fi

# Verificar que Docker esté corriendo
if ! docker info &> /dev/null; then
    echo "❌ Docker no está corriendo."
    echo "Por favor inicia Docker Desktop y vuelve a intentar."
    exit 1
fi

echo "✅ Docker está corriendo"
echo ""

# Verificar si existe .env, si no, copiar desde .env.example
if [ ! -f .env ]; then
    if [ -f .env.example ]; then
        echo "📄 Creando archivo .env desde .env.example..."
        cp .env.example .env
        echo "✅ Archivo .env creado. Puedes editarlo si necesitas configurar API keys."
        echo ""
    fi
fi

# Descargar imágenes actualizadas e iniciar los contenedores
echo "🔄 Descargando imágenes actualizadas..."
echo "Esto puede tomar unos minutos la primera vez..."
echo ""

docker-compose pull
docker-compose up -d

if [ $? -eq 0 ]; then
    echo ""
    echo "=================================="
    echo "✅ Momentum Fitness está corriendo!"
    echo "=================================="
    echo ""
    echo "📱 Frontend: http://localhost:3000"
    echo "🔧 Backend API: http://localhost:8000"
    echo "📚 Documentación: http://localhost:8000/docs"
    echo ""
    echo "Para ver los logs:"
    echo "  docker-compose logs -f"
    echo ""
    echo "Para detener:"
    echo "  docker-compose down"
    echo ""
else
    echo ""
    echo "❌ Hubo un error al iniciar los contenedores."
    echo "Revisa los logs con: docker-compose logs"
    exit 1
fi

#!/bin/bash

# ========================================
# Script de Setup Automático para SQLite
# ========================================

set -e  # Detener en caso de error

echo "🚀 Iniciando configuración del Sistema de Gestión de Gimnasio"
echo "============================================================"
echo ""

# 1. Verificar Python
echo "📋 1/5 - Verificando Python..."
if command -v python3 &> /dev/null; then
    PYTHON_VERSION=$(python3 --version)
    echo "✅ $PYTHON_VERSION encontrado"
else
    echo "❌ Python 3 no encontrado. Instala Python 3.10 o superior."
    exit 1
fi
echo ""

# 2. Crear entorno virtual
echo "📦 2/5 - Creando entorno virtual..."
if [ -d "venv" ]; then
    echo "ℹ️  Entorno virtual ya existe, saltando..."
else
    python3 -m venv venv
    echo "✅ Entorno virtual creado"
fi
echo ""

# 3. Activar entorno virtual e instalar dependencias
echo "📚 3/5 - Instalando dependencias..."
source venv/bin/activate
pip install --upgrade pip > /dev/null 2>&1
pip install -r requirements.txt

if [ $? -eq 0 ]; then
    echo "✅ Dependencias instaladas correctamente"
else
    echo "❌ Error al instalar dependencias"
    exit 1
fi
echo ""

# 4. Verificar archivo .env
echo "⚙️  4/5 - Verificando configuración..."
if [ -f ".env" ]; then
    echo "✅ Archivo .env existe"
    echo "ℹ️  Base de datos configurada: SQLite (gimnasio.db)"
else
    echo "❌ Archivo .env no encontrado"
    exit 1
fi
echo ""

# 5. Inicializar base de datos
echo "🗄️  5/5 - Inicializando base de datos SQLite..."
python run.py --init-db

if [ $? -eq 0 ]; then
    echo "✅ Base de datos inicializada correctamente"
else
    echo "❌ Error al inicializar base de datos"
    exit 1
fi
echo ""

# Resumen final
echo "============================================================"
echo "✅ ¡Configuración completada con éxito!"
echo "============================================================"
echo ""
echo "📊 Base de datos: gimnasio.db (SQLite)"
echo "🤖 Bot: Pendiente configurar ANTHROPIC_API_KEY"
echo ""
echo "🚀 Para iniciar el servidor:"
echo "   source venv/bin/activate"
echo "   python run.py"
echo ""
echo "📚 O ejecuta directamente:"
echo "   ./venv/bin/python run.py"
echo ""
echo "🌐 Luego abre: http://localhost:8000/docs"
echo ""
echo "💡 Para configurar el bot, edita .env y agrega tu ANTHROPIC_API_KEY"
echo "   Obtén tu key en: https://console.anthropic.com/"
echo ""
echo "¡Happy coding! 💻🏋️"

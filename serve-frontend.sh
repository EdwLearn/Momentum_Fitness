#!/bin/bash

# Script para servir el frontend estático
# Sistema de Gestión de Gimnasio - Momentum

set -e

echo "🌐 Iniciando servidor frontend estático..."
echo "========================================"
echo ""

# Verificar que la carpeta out/ existe
if [ ! -d "out" ]; then
    echo "❌ Error: No se encontró la carpeta 'out/'"
    echo ""
    echo "Para generar el build estático, ejecuta:"
    echo "  npm run build"
    echo ""
    exit 1
fi

# Verificar que hay archivos en out/
if [ -z "$(ls -A out)" ]; then
    echo "❌ Error: La carpeta 'out/' está vacía"
    echo ""
    echo "Para generar el build estático, ejecuta:"
    echo "  npm run build"
    echo ""
    exit 1
fi

# Mostrar información del build
echo "📦 Build estático encontrado:"
echo "   Ubicación: out/"
echo "   Tamaño total: $(du -sh out | cut -f1)"
echo "   Archivos HTML: $(find out -name "*.html" | wc -l)"
echo ""

# Verificar si el puerto 3000 está en uso
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    echo "⚠️  Advertencia: El puerto 3000 ya está en uso"
    echo "¿Deseas detener el proceso existente? (s/n)"
    read -r response
    if [[ "$response" =~ ^[Ss]$ ]]; then
        echo "Deteniendo procesos en el puerto 3000..."
        lsof -ti:3000 | xargs kill -9 2>/dev/null || true
        sleep 2
    else
        echo "❌ Abortando. Por favor, libera el puerto 3000 primero."
        exit 1
    fi
fi

echo "🚀 Iniciando servidor en http://localhost:3000"
echo ""
echo "Páginas disponibles:"
echo "  • http://localhost:3000/                - Página principal"
echo "  • http://localhost:3000/dashboard/      - Dashboard"
echo "  • http://localhost:3000/clientes/       - Gestión de clientes"
echo "  • http://localhost:3000/asistencia/     - Control de asistencia"
echo "  • http://localhost:3000/empleados/      - Gestión de empleados"
echo "  • http://localhost:3000/cupones/        - Cupones y promociones"
echo "  • http://localhost:3000/reportes/       - Reportes"
echo "  • http://localhost:3000/configuracion/  - Configuración"
echo ""
echo "⚠️  IMPORTANTE: Asegúrate de que el backend esté corriendo en http://localhost:8000"
echo ""
echo "Presiona Ctrl+C para detener el servidor"
echo "========================================"
echo ""

# Trap para manejar Ctrl+C
trap 'echo -e "\n\n👋 Deteniendo servidor frontend..."; exit 0' INT

# Servir con Python (disponible en la mayoría de los sistemas)
cd out
python3 -m http.server 3000

#!/bin/bash

# Colores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║           MOMENTUM FITNESS - INICIANDO...                  ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Obtener el directorio donde está este script
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

# Verificar que estamos en el directorio correcto
if [ ! -f "backend/main.py" ]; then
    echo -e "${YELLOW}❌ Error: No se encontró backend/main.py${NC}"
    echo "Asegúrate de ejecutar este script desde el directorio raíz del proyecto"
    exit 1
fi

# Función para limpiar procesos al salir
cleanup() {
    echo ""
    echo -e "${YELLOW}🛑 Deteniendo servidores...${NC}"
    kill $(jobs -p) 2>/dev/null
    exit
}

trap cleanup SIGINT SIGTERM

echo -e "${GREEN}[1/3] Iniciando backend (FastAPI)...${NC}"
cd backend

# Activar entorno virtual si existe
if [ -d "../momentum" ]; then
    source ../momentum/bin/activate
elif [ -d "venv" ]; then
    source venv/bin/activate
fi

# Iniciar backend en background
uvicorn main:app --reload --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!

cd ..

echo -e "${GREEN}[2/3] Iniciando frontend (Next.js)...${NC}"
# El frontend está en la raíz del proyecto

# Iniciar frontend en background
npm run dev &
FRONTEND_PID=$!

echo ""
echo -e "${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║              ✅ MOMENTUM FITNESS INICIADO                  ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "🌐 ${BLUE}Frontend:${NC} http://localhost:3000"
echo -e "📡 ${BLUE}Backend:${NC}  http://localhost:8000"
echo -e "📚 ${BLUE}API Docs:${NC} http://localhost:8000/docs"
echo ""
echo -e "🔑 ${YELLOW}Credenciales:${NC}"
echo "   Email:    admin@momentum.com"
echo "   Password: admin123"
echo ""
echo -e "${YELLOW}⚠️  Presiona Ctrl+C para detener los servidores${NC}"
echo ""

# Esperar a que los procesos terminen
wait

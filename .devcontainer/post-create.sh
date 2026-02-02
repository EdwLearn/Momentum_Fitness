#!/bin/bash
set -e

echo "=========================================="
echo "  Momentum Fitness - Configurando entorno"
echo "=========================================="

# Detectar el directorio de trabajo
WORKSPACE_DIR="${PWD}"

# Crear directorio de datos si no existe
mkdir -p "${WORKSPACE_DIR}/backend/data"

# Configurar .env del frontend para Dev Container (puerto 8002)
echo "NEXT_PUBLIC_API_URL=http://localhost:8002" > "${WORKSPACE_DIR}/.env.local"
echo "Archivo .env.local creado con API_URL=http://localhost:8002"

# Copiar backend .env si no existe
if [ ! -f "${WORKSPACE_DIR}/backend/.env" ]; then
    if [ -f "${WORKSPACE_DIR}/backend/.env.example" ]; then
        cp "${WORKSPACE_DIR}/backend/.env.example" "${WORKSPACE_DIR}/backend/.env"
        echo "Archivo backend/.env creado desde .env.example"
    fi
fi

# Actualizar ALLOWED_ORIGINS en backend/.env para incluir puertos del container
if [ -f "${WORKSPACE_DIR}/backend/.env" ]; then
    sed -i 's/ALLOWED_ORIGINS=.*/ALLOWED_ORIGINS=http:\/\/localhost:3002,http:\/\/localhost:8002,http:\/\/localhost:3000,http:\/\/localhost:8000/' "${WORKSPACE_DIR}/backend/.env"
    echo "ALLOWED_ORIGINS actualizado para incluir puertos 3002/8002"
fi

# Instalar dependencias del frontend
echo ""
echo "Instalando dependencias del frontend..."
npm install

# Configurar entorno virtual de Python y dependencias del backend
echo ""
echo "Configurando entorno Python..."
cd "${WORKSPACE_DIR}/backend"

if [ ! -d ".venv" ]; then
    python -m venv .venv
fi

source .venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt

cd "${WORKSPACE_DIR}"

echo ""
echo "=========================================="
echo "Entorno configurado correctamente!"
echo "=========================================="
echo ""
echo "Para iniciar el proyecto ejecuta:"
echo "  npm run dev:container"
echo ""
echo "URLs:"
echo "  Frontend: http://localhost:3002"
echo "  Backend:  http://localhost:8002"
echo "  API Docs: http://localhost:8002/docs"
echo ""

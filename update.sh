#!/bin/bash

# Script de actualización para Momentum Fitness
# Descarga los archivos de configuración más recientes

echo "=================================="
echo "  Momentum Fitness - Actualizar"
echo "=================================="
echo ""

# URL base del repositorio (cambiar por tu repo)
REPO_URL="https://raw.githubusercontent.com/EdwLearn/v0-dashboard-de-gimnasio/main"

echo "Descargando archivos actualizados..."

# Descargar docker-compose.yml
curl -sL "$REPO_URL/docker-compose.yml" -o docker-compose.yml.new
if [ $? -eq 0 ]; then
    mv docker-compose.yml.new docker-compose.yml
    echo "  docker-compose.yml actualizado"
else
    echo "  Error descargando docker-compose.yml"
    rm -f docker-compose.yml.new
fi

# Descargar start.sh
curl -sL "$REPO_URL/start.sh" -o start.sh.new
if [ $? -eq 0 ]; then
    mv start.sh.new start.sh
    chmod +x start.sh
    echo "  start.sh actualizado"
else
    echo "  Error descargando start.sh"
    rm -f start.sh.new
fi

# Descargar .env.example (solo si no existe .env)
if [ ! -f .env ]; then
    curl -sL "$REPO_URL/.env.example" -o .env.example
    echo "  .env.example descargado"
fi

echo ""
echo "Archivos actualizados. Ejecutando start.sh..."
echo ""

./start.sh

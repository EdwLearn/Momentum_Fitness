#!/bin/bash

# Script para crear paquete de distribución de Momentum Fitness

GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

VERSION="1.1.0"
RELEASE_NAME="momentum-fitness-v${VERSION}"
DIST_DIR="dist/momentum-fitness"

clear

echo ""
echo "====================================="
echo "  Creando paquete de distribución"
echo "  Momentum Fitness v${VERSION}"
echo "====================================="
echo ""

# Verificar que existe el directorio de distribución
if [ ! -d "$DIST_DIR" ]; then
    echo "❌ Error: No existe el directorio $DIST_DIR"
    exit 1
fi

echo -e "${BLUE}[1/3]${NC} Verificando archivos necesarios..."

required_files=(
    "docker-compose.yml"
    "start.bat"
    "start.sh"
    "stop.bat"
    "stop.sh"
    "README.md"
    "INICIO_RAPIDO.md"
    ".env.example"
)

for file in "${required_files[@]}"; do
    if [ ! -f "$DIST_DIR/$file" ]; then
        echo "❌ Falta el archivo: $file"
        exit 1
    fi
done

echo -e "${GREEN}✓${NC} Todos los archivos necesarios están presentes"

echo ""
echo -e "${BLUE}[2/3]${NC} Creando archivo comprimido..."

cd dist

# Crear ZIP para Windows
if command -v zip &> /dev/null; then
    zip -r "${RELEASE_NAME}.zip" momentum-fitness/ -x "*.DS_Store" "*.git*"
    echo -e "${GREEN}✓${NC} Creado: ${RELEASE_NAME}.zip"
fi

# Crear TAR.GZ para Linux/Mac
if command -v tar &> /dev/null; then
    tar -czf "${RELEASE_NAME}.tar.gz" momentum-fitness/ --exclude=".DS_Store" --exclude=".git*"
    echo -e "${GREEN}✓${NC} Creado: ${RELEASE_NAME}.tar.gz"
fi

cd ..

echo ""
echo -e "${BLUE}[3/3]${NC} Calculando checksums..."

cd dist

if [ -f "${RELEASE_NAME}.zip" ]; then
    if command -v sha256sum &> /dev/null; then
        sha256sum "${RELEASE_NAME}.zip" > "${RELEASE_NAME}.zip.sha256"
        echo -e "${GREEN}✓${NC} Checksum ZIP creado"
    fi
fi

if [ -f "${RELEASE_NAME}.tar.gz" ]; then
    if command -v sha256sum &> /dev/null; then
        sha256sum "${RELEASE_NAME}.tar.gz" > "${RELEASE_NAME}.tar.gz.sha256"
        echo -e "${GREEN}✓${NC} Checksum TAR.GZ creado"
    fi
fi

cd ..

echo ""
echo "====================================="
echo -e "  ${GREEN}✓ Paquete creado exitosamente${NC}"
echo "====================================="
echo ""
echo "Archivos generados en dist/:"

if [ -f "dist/${RELEASE_NAME}.zip" ]; then
    size=$(du -h "dist/${RELEASE_NAME}.zip" | cut -f1)
    echo "  📦 ${RELEASE_NAME}.zip (${size})"
fi

if [ -f "dist/${RELEASE_NAME}.tar.gz" ]; then
    size=$(du -h "dist/${RELEASE_NAME}.tar.gz" | cut -f1)
    echo "  📦 ${RELEASE_NAME}.tar.gz (${size})"
fi

echo ""
echo "Listo para distribuir!"
echo ""

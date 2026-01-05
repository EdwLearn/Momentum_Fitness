#!/bin/bash
# Script de instalación y configuración de Ollama + Qwen 2.5

echo "🚀 INSTALACIÓN DE OLLAMA + QWEN 2.5"
echo "===================================="
echo ""

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Paso 1: Instalar Ollama
echo -e "${YELLOW}Paso 1/4: Instalando Ollama...${NC}"
if command -v ollama &> /dev/null; then
    echo -e "${GREEN}✅ Ollama ya está instalado${NC}"
    ollama --version
else
    echo "Instalando Ollama..."
    curl -fsSL https://ollama.com/install.sh | sh
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Ollama instalado correctamente${NC}"
    else
        echo -e "${RED}❌ Error instalando Ollama${NC}"
        exit 1
    fi
fi
echo ""

# Paso 2: Iniciar servicio de Ollama
echo -e "${YELLOW}Paso 2/4: Iniciando servicio de Ollama...${NC}"
if pgrep -x "ollama" > /dev/null; then
    echo -e "${GREEN}✅ Ollama ya está corriendo${NC}"
else
    echo "Iniciando Ollama en background..."
    ollama serve > /dev/null 2>&1 &
    sleep 3
    if pgrep -x "ollama" > /dev/null; then
        echo -e "${GREEN}✅ Ollama iniciado correctamente${NC}"
    else
        echo -e "${RED}❌ Error iniciando Ollama${NC}"
        exit 1
    fi
fi
echo ""

# Paso 3: Descargar modelo Qwen 2.5:14b
echo -e "${YELLOW}Paso 3/4: Descargando modelo Qwen 2.5:14b (9GB)...${NC}"
echo "Esto puede tomar varios minutos dependiendo de tu conexión..."
ollama pull qwen2.5:14b
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Modelo descargado correctamente${NC}"
else
    echo -e "${RED}❌ Error descargando el modelo${NC}"
    exit 1
fi
echo ""

# Paso 4: Probar el modelo
echo -e "${YELLOW}Paso 4/4: Probando el modelo...${NC}"
echo "Ejecutando prueba rápida..."
RESPONSE=$(ollama run qwen2.5:14b "Di solo: Hola, soy GymBot y estoy listo para ayudar" 2>/dev/null)
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Prueba exitosa${NC}"
    echo "Respuesta del modelo: $RESPONSE"
else
    echo -e "${RED}❌ Error en la prueba${NC}"
    exit 1
fi
echo ""

# Resumen final
echo "======================================"
echo -e "${GREEN}🎉 INSTALACIÓN COMPLETADA${NC}"
echo "======================================"
echo ""
echo "Modelos disponibles:"
ollama list
echo ""
echo -e "${GREEN}Siguiente paso:${NC}"
echo "1. Copia .env.example a .env: cp .env.example .env"
echo "2. Asegúrate que USE_LOCAL_LLM=true en .env"
echo "3. Ejecuta el backend: python main.py"
echo ""
echo -e "${YELLOW}Comandos útiles:${NC}"
echo "  ollama list              # Ver modelos instalados"
echo "  ollama run qwen2.5:14b   # Probar el modelo en CLI"
echo "  ollama serve             # Iniciar servidor Ollama"
echo "  pkill ollama             # Detener Ollama"
echo ""

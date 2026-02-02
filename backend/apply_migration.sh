#!/bin/bash

# Script para aplicar migraciones SQL
# Uso: ./apply_migration.sh <nombre_archivo_migracion.sql>

if [ -z "$1" ]; then
    echo "Uso: ./apply_migration.sh <nombre_archivo_migracion.sql>"
    echo "Ejemplo: ./apply_migration.sh migrations/update_usuario_activo_default.sql"
    exit 1
fi

MIGRATION_FILE="$1"

if [ ! -f "$MIGRATION_FILE" ]; then
    echo "Error: El archivo $MIGRATION_FILE no existe"
    exit 1
fi

# Cargar variables de entorno desde .env
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
else
    echo "Error: Archivo .env no encontrado"
    exit 1
fi

echo "Aplicando migración: $MIGRATION_FILE"
echo "Base de datos: $POSTGRES_DB"

# Ejecutar migración usando psql
PGPASSWORD=$POSTGRES_PASSWORD psql -h $POSTGRES_HOST -U $POSTGRES_USER -d $POSTGRES_DB -f "$MIGRATION_FILE"

if [ $? -eq 0 ]; then
    echo "✅ Migración aplicada exitosamente"
else
    echo "❌ Error al aplicar la migración"
    exit 1
fi

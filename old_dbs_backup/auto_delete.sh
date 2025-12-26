#!/bin/bash
# Script de auto-eliminación del backup
# Se ejecutará automáticamente en 2 días

BACKUP_DIR="$(cd "$(dirname "$0")" && pwd)"
echo "Eliminando backup de bases de datos innecesarias..."
echo "Directorio: $BACKUP_DIR"
rm -rf "$BACKUP_DIR"
echo "✓ Backup eliminado"

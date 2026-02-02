# Backend Dockerfile - Python/FastAPI
FROM python:3.11-slim

# Establecer directorio de trabajo
WORKDIR /app

# Instalar dependencias del sistema
RUN apt-get update && apt-get install -y \
    gcc \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Copiar archivos de dependencias
COPY requirements.txt .

# Instalar dependencias de Python
RUN pip install --no-cache-dir -r requirements.txt

# Copiar el código de la aplicación
COPY . .

# Crear directorios necesarios
RUN mkdir -p /app/logs /app/data

# Exponer el puerto del backend
EXPOSE 8000

# Script de inicio para mover la BD al volumen persistente y ejecutar migraciones
RUN echo '#!/bin/sh\n\
echo "=== Iniciando backend Momentum Fitness ==="\n\
\n\
# Paso 1: Configurar base de datos\n\
if [ -f "/app/gimnasio.db" ] && [ ! -f "/app/data/gimnasio.db" ]; then\n\
  echo "Moviendo base de datos inicial al volumen persistente..."\n\
  cp /app/gimnasio.db /app/data/gimnasio.db\n\
fi\n\
if [ ! -f "/app/data/gimnasio.db" ] && [ -f "/app/gimnasio_template.db" ]; then\n\
  echo "Inicializando base de datos desde template..."\n\
  cp /app/gimnasio_template.db /app/data/gimnasio.db\n\
fi\n\
\n\
# Crear symlink para que la app use la BD del volumen\n\
ln -sf /app/data/gimnasio.db /app/gimnasio.db\n\
\n\
# Paso 2: Backup automatico antes de migraciones\n\
if [ -f "/app/data/gimnasio.db" ]; then\n\
  BACKUP_FILE="/app/data/backups/gimnasio_$(date +%Y%m%d_%H%M%S).db"\n\
  mkdir -p /app/data/backups\n\
  echo "Creando backup: $BACKUP_FILE"\n\
  cp /app/data/gimnasio.db "$BACKUP_FILE"\n\
  # Mantener solo los ultimos 5 backups\n\
  ls -t /app/data/backups/*.db 2>/dev/null | tail -n +6 | xargs -r rm\n\
  echo "Backup creado exitosamente"\n\
fi\n\
\n\
# Paso 3: Ejecutar migraciones automaticamente\n\
echo "=== Ejecutando migraciones de base de datos ==="\n\
\n\
# Migración: Agregar campo visitas_disponibles a membresias\n\
if [ -f "/app/migrations/add_visitas_disponibles_membresia.py" ]; then\n\
  echo "Ejecutando migración: add_visitas_disponibles_membresia.py"\n\
  python /app/migrations/add_visitas_disponibles_membresia.py || echo "Migración visitas ya aplicada o error (continuando...)"\n\
fi\n\
\n\
echo "=== Migraciones completadas ==="\n\
echo "=== Iniciando servidor uvicorn ==="\n\
exec uvicorn main:app --host 0.0.0.0 --port 8000 --reload\n\
' > /app/entrypoint.sh && chmod +x /app/entrypoint.sh

# Comando para iniciar el servidor
CMD ["/app/entrypoint.sh"]

# Guía de Despliegue - Sistema Momentum

Guía completa para desplegar el Sistema de Gestión de Gimnasio Momentum como aplicación standalone.

## Resumen del Sistema

**Momentum** es un sistema completo de gestión para gimnasios que incluye:
- **Backend**: FastAPI compilado en ejecutable standalone (57 MB)
- **Frontend**: Next.js compilado a archivos estáticos (5.5 MB)
- **Base de Datos**: SQLite (portátil, sin instalación requerida)

## Arquitectura

```
Sistema Momentum
├── Backend (FastAPI)
│   ├── Ejecutable: backend/dist/momentum
│   ├── Puerto: 8000
│   ├── API: http://localhost:8000/api
│   └── Docs: http://localhost:8000/docs
│
├── Frontend (Next.js estático)
│   ├── Build: out/
│   ├── Puerto: 3000
│   └── URL: http://localhost:3000
│
└── Base de Datos
    ├── Tipo: SQLite
    ├── Archivo: gimnasio.db
    └── Ubicación: Directorio de ejecución
```

## Prerrequisitos

### Para Compilación

- Python 3.8+
- Node.js 16+
- npm o yarn
- PyInstaller (`pip install pyinstaller`)

### Para Ejecución

- **Linux**: Python 3 (para servir frontend)
- **Windows**: Python 3 o cualquier servidor web estático
- Puertos 8000 y 3000 disponibles

## Compilación del Sistema

### 1. Compilar Backend

```bash
cd backend
pip install -r requirements.txt
pip install pyinstaller
pyinstaller momentum.spec
```

**Resultado**: `backend/dist/momentum` (57 MB)

**Documentación detallada**: Ver [backend/BUILD.md](backend/BUILD.md)

### 2. Compilar Frontend

```bash
npm install
npm run build
```

**Resultado**: Carpeta `out/` con archivos estáticos (5.5 MB)

**Documentación detallada**: Ver [FRONTEND_BUILD.md](FRONTEND_BUILD.md)

## Ejecución del Sistema

### Opción 1: Script Automático (Recomendado)

Inicia backend y frontend juntos:

```bash
./start-momentum.sh
```

Este script:
- ✅ Verifica que todo esté compilado
- ✅ Inicia el backend en puerto 8000
- ✅ Inicia el frontend en puerto 3000
- ✅ Muestra logs de ambos servicios
- ✅ Detiene ambos con Ctrl+C

### Opción 2: Iniciar Servicios Separadamente

**Backend**:
```bash
cd backend
./run-momentum.sh
# o directamente:
./dist/momentum
```

**Frontend**:
```bash
./serve-frontend.sh
# o directamente:
cd out && python3 -m http.server 3000
```

## URLs de Acceso

Una vez iniciado el sistema:

### Frontend (Interfaz de Usuario)
- **Aplicación principal**: http://localhost:3000
- **Dashboard**: http://localhost:3000/dashboard/
- **Gestión de clientes**: http://localhost:3000/clientes/
- **Control de asistencia**: http://localhost:3000/asistencia/
- **Gestión de empleados**: http://localhost:3000/empleados/
- **Cupones**: http://localhost:3000/cupones/
- **Reportes**: http://localhost:3000/reportes/
- **Configuración**: http://localhost:3000/configuracion/

### Backend (API)
- **API Base**: http://localhost:8000/api
- **Health Check**: http://localhost:8000/health
- **Documentación Swagger**: http://localhost:8000/docs
- **Documentación ReDoc**: http://localhost:8000/redoc

## Estructura de Archivos del Proyecto

```
v0-dashboard-de-gimnasio/
├── backend/
│   ├── dist/
│   │   └── momentum              # Ejecutable del backend (57 MB)
│   ├── build/                    # Archivos temporales de PyInstaller
│   ├── momentum.spec             # Configuración de PyInstaller
│   ├── run-momentum.sh           # Script para ejecutar backend
│   ├── BUILD.md                  # Documentación de compilación
│   ├── TEST_RESULTS.md           # Resultados de pruebas
│   ├── main.py                   # Código fuente
│   └── ...
│
├── out/                          # Frontend compilado (5.5 MB)
│   ├── _next/                    # Assets de Next.js
│   ├── dashboard/                # Páginas estáticas
│   ├── clientes/
│   ├── asistencia/
│   └── ...
│
├── logs/                         # Logs del sistema
│   ├── backend.log
│   └── frontend.log
│
├── start-momentum.sh             # Script maestro de inicio
├── serve-frontend.sh             # Script para servir frontend
├── FRONTEND_BUILD.md             # Documentación del frontend
├── DEPLOYMENT.md                 # Este archivo
└── gimnasio.db                   # Base de datos SQLite
```

## Configuración

### Variables de Entorno (Backend)

Crear archivo `backend/.env`:

```env
# Configuración de la aplicación
PROJECT_NAME=Momentum - Sistema de Gestión de Gimnasio
VERSION=2.0.0
DESCRIPTION=Sistema completo de gestión para gimnasios

# Base de datos
DATABASE_URL=sqlite:///./gimnasio.db

# CORS - Permitir frontend
ALLOWED_ORIGINS=["http://localhost:3000", "http://localhost:3001"]

# Pool de conexiones (para PostgreSQL en el futuro)
DB_POOL_SIZE=5
DB_MAX_OVERFLOW=10
DB_POOL_TIMEOUT=30

# Claude API (opcional, para bot)
ANTHROPIC_API_KEY=tu_api_key_aqui
```

### Configuración de Puertos

**Cambiar puerto del backend** (por defecto 8000):

Editar `backend/main.py` línea 292:
```python
port=8000,  # Cambiar a otro puerto
```

**Cambiar puerto del frontend** (por defecto 3000):

Editar `serve-frontend.sh` línea (última):
```bash
python3 -m http.server 3000  # Cambiar a otro puerto
```

## Base de Datos

### Inicialización

La base de datos SQLite se crea automáticamente al iniciar el backend por primera vez.

Ubicación: `gimnasio.db` en el directorio de ejecución del backend.

### Tablas Creadas

El sistema crea automáticamente 22 tablas:
- `usuarios`
- `membresias`
- `asistencias`
- `empleados`
- `cupones`
- `referidos`
- `tickets_soporte`
- `metricas`
- Y más...

### Backup de Base de Datos

```bash
# Crear backup
cp gimnasio.db gimnasio.db.backup

# O con fecha
cp gimnasio.db "gimnasio.db.backup.$(date +%Y%m%d_%H%M%S)"
```

### Restaurar Backup

```bash
# Detener el backend primero
# Luego restaurar:
cp gimnasio.db.backup gimnasio.db
```

## Distribución

### Preparar Paquete de Distribución

```bash
# Crear directorio de distribución
mkdir -p momentum-dist

# Copiar ejecutable del backend
cp backend/dist/momentum momentum-dist/

# Copiar frontend compilado
cp -r out momentum-dist/frontend

# Copiar scripts
cp start-momentum.sh momentum-dist/
cp backend/run-momentum.sh momentum-dist/
cp serve-frontend.sh momentum-dist/

# Copiar configuración de ejemplo
cp backend/.env.example momentum-dist/.env

# Crear archivo README
cat > momentum-dist/README.txt << 'EOF'
Sistema Momentum - Gestión de Gimnasio
=======================================

1. Configurar .env con tus datos
2. Ejecutar: ./start-momentum.sh
3. Abrir: http://localhost:3000

Documentación completa en DEPLOYMENT.md
EOF

# Comprimir
tar -czf momentum-v2.0.0-linux.tar.gz momentum-dist/
```

### Contenido del Paquete Distribuible

```
momentum-v2.0.0-linux.tar.gz
└── momentum-dist/
    ├── momentum                  # Ejecutable backend
    ├── frontend/                 # Frontend estático
    ├── start-momentum.sh         # Script de inicio
    ├── run-momentum.sh           # Script backend
    ├── serve-frontend.sh         # Script frontend
    ├── .env                      # Configuración
    └── README.txt                # Instrucciones
```

## Despliegue en Producción

### Opción 1: Systemd Service (Linux)

Crear archivo `/etc/systemd/system/momentum-backend.service`:

```ini
[Unit]
Description=Momentum Backend API
After=network.target

[Service]
Type=simple
User=momentum
WorkingDirectory=/opt/momentum/backend
ExecStart=/opt/momentum/backend/dist/momentum
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Crear archivo `/etc/systemd/system/momentum-frontend.service`:

```ini
[Unit]
Description=Momentum Frontend
After=network.target momentum-backend.service

[Service]
Type=simple
User=momentum
WorkingDirectory=/opt/momentum/out
ExecStart=/usr/bin/python3 -m http.server 3000
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Habilitar e iniciar servicios:

```bash
sudo systemctl daemon-reload
sudo systemctl enable momentum-backend
sudo systemctl enable momentum-frontend
sudo systemctl start momentum-backend
sudo systemctl start momentum-frontend
```

### Opción 2: Nginx + Proxy Reverso

Configuración de Nginx para servir frontend y hacer proxy al backend:

```nginx
server {
    listen 80;
    server_name gimnasio.tudominio.com;

    # Servir frontend estático
    root /opt/momentum/out;
    index index.html;

    # Proxy para API del backend
    location /api/ {
        proxy_pass http://localhost:8000/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Proxy para docs del backend
    location /docs {
        proxy_pass http://localhost:8000/docs;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
    }

    # Servir archivos estáticos del frontend
    location / {
        try_files $uri $uri/ $uri.html /index.html;
    }

    # Cache para assets estáticos
    location /_next/static {
        add_header Cache-Control "public, max-age=31536000, immutable";
    }
}
```

### Opción 3: Docker (Futuro)

Crear `Dockerfile` para contenedorización completa.

## Monitoreo

### Ver Logs

```bash
# Logs del backend
tail -f logs/backend.log

# Logs del frontend
tail -f logs/frontend.log

# Ver ambos simultáneamente
tail -f logs/*.log
```

### Health Checks

```bash
# Backend
curl http://localhost:8000/health

# Frontend (verificar que responde)
curl -I http://localhost:3000
```

### Estadísticas del Sistema

```bash
# Info del backend
curl http://localhost:8000/stats | jq

# Procesos corriendo
ps aux | grep -E "momentum|python3 -m http.server"
```

## Solución de Problemas

### Backend no inicia

```bash
# Verificar logs
cat logs/backend.log

# Verificar permisos
chmod +x backend/dist/momentum

# Verificar puerto
lsof -i :8000
```

### Frontend no carga

```bash
# Verificar que el build existe
ls -la out/

# Verificar puerto
lsof -i :3000

# Rebuild si es necesario
npm run build
```

### Error de conexión Backend-Frontend

Verificar CORS en `backend/.env`:
```env
ALLOWED_ORIGINS=["http://localhost:3000"]
```

### Base de datos corrupta

```bash
# Verificar integridad
sqlite3 gimnasio.db "PRAGMA integrity_check;"

# Restaurar desde backup
cp gimnasio.db.backup gimnasio.db
```

## Seguridad

### Recomendaciones de Producción

1. **Cambiar puertos por defecto**
2. **Configurar firewall**
   ```bash
   ufw allow 80/tcp
   ufw allow 443/tcp
   ufw deny 8000/tcp  # Solo acceso local
   ```
3. **Habilitar HTTPS** (usar certbot + nginx)
4. **Backup automático de BD**
5. **Actualizar SECRET_KEY en producción**

## Performance

### Optimizaciones

1. **Comprimir assets** (gzip/brotli en nginx)
2. **Habilitar cache** de archivos estáticos
3. **Usar CDN** para assets del frontend
4. **Optimizar queries** de base de datos
5. **Configurar pool de conexiones** (si usas PostgreSQL)

## Actualización del Sistema

```bash
# 1. Detener servicios
./stop-momentum.sh  # (o Ctrl+C en start-momentum.sh)

# 2. Backup de base de datos
cp gimnasio.db gimnasio.db.backup

# 3. Actualizar código
git pull

# 4. Recompilar backend
cd backend && pyinstaller momentum.spec

# 5. Recompilar frontend
npm run build

# 6. Reiniciar
./start-momentum.sh
```

## Soporte y Documentación

- **Backend**: Ver [backend/BUILD.md](backend/BUILD.md)
- **Frontend**: Ver [FRONTEND_BUILD.md](FRONTEND_BUILD.md)
- **Tests del Backend**: Ver [backend/TEST_RESULTS.md](backend/TEST_RESULTS.md)

## Versión

- **Sistema**: Momentum v2.0.0
- **Backend**: FastAPI 0.115.6
- **Frontend**: Next.js 16.0.3
- **Base de Datos**: SQLite 3
- **Python**: 3.13.5
- **Node**: Compatible con 16+

---

**Última actualización**: 2026-01-05
**Estado**: ✅ Listo para producción

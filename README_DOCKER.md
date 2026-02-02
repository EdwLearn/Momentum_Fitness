# 🏋️ Momentum Fitness - Instalación con Docker

## 📋 Requisitos Previos

### 1. Instalar Docker Desktop

**Windows y Mac:**
- Descarga Docker Desktop: https://www.docker.com/products/docker-desktop
- Ejecuta el instalador
- Reinicia tu computadora si es necesario
- Abre Docker Desktop y espera a que inicie

**Linux:**
```bash
# Ubuntu/Debian
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
```

### 2. Verificar Instalación
```bash
docker --version
docker-compose --version
```

## 🚀 Instalación Rápida (Un Solo Comando)

### Paso 1: Descargar el Proyecto
```bash
git clone https://github.com/tu-usuario/momentum-fitness.git
cd momentum-fitness
```

O descarga el ZIP y descomprímelo, luego abre la terminal en esa carpeta.

### Paso 2: Iniciar la Aplicación
```bash
docker-compose up -d
```

**¡Eso es todo!** 🎉

La aplicación estará disponible en:
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:8000
- **Documentación API:** http://localhost:8000/docs

## 📊 Comandos Útiles

### Ver estado de los contenedores
```bash
docker-compose ps
```

### Ver logs en tiempo real
```bash
# Todos los servicios
docker-compose logs -f

# Solo backend
docker-compose logs -f backend

# Solo frontend
docker-compose logs -f frontend
```

### Detener la aplicación
```bash
docker-compose down
```

### Reiniciar la aplicación
```bash
docker-compose restart
```

### Detener Y eliminar contenedores (mantiene los datos)
```bash
docker-compose down
```

### Reconstruir después de cambios en el código
```bash
docker-compose up -d --build
```

## 🔄 Actualizar a Nueva Versión

Cuando salga una nueva versión del proyecto:

```bash
# 1. Detener la aplicación (los datos se mantienen en volumes)
docker-compose down

# 2. Descargar nueva versión
git pull origin main
# O descarga el nuevo ZIP y reemplaza los archivos

# 3. Reconstruir e iniciar
docker-compose up -d --build
```

**✅ Tus datos (clientes, suscripciones, asistencias) se mantienen intactos**

## 💾 Gestión de Datos

### Ubicación de los Datos Persistentes
Los datos se guardan en Docker Volumes:
- **Base de datos:** `momentum_database`
- **Logs:** `momentum_logs`

### Backup de la Base de Datos
```bash
# Crear backup
docker-compose exec backend cp gimnasio.db /app/gimnasio_backup_$(date +%Y%m%d).db

# Copiar backup a tu computadora
docker cp momentum-backend:/app/gimnasio_backup_YYYYMMDD.db ./
```

### Restaurar Base de Datos
```bash
# Copiar backup al contenedor
docker cp ./gimnasio_backup.db momentum-backend:/app/gimnasio.db

# Reiniciar backend
docker-compose restart backend
```

### Listar volumes
```bash
docker volume ls | grep momentum
```

### Eliminar todos los datos (⚠️ CUIDADO)
```bash
# Esto eliminará TODOS los datos
docker-compose down -v
```

## 🐛 Solución de Problemas

### El puerto 3000 o 8000 ya está en uso
```bash
# Cambiar puertos en docker-compose.yml
# Cambia "3000:3000" por "3001:3000" por ejemplo
```

### Ver errores del backend
```bash
docker-compose logs backend
```

### Ver errores del frontend
```bash
docker-compose logs frontend
```

### Reiniciar desde cero (sin perder datos)
```bash
docker-compose down
docker-compose up -d --build --force-recreate
```

### Reiniciar desde cero (eliminando todo)
```bash
docker-compose down -v
docker system prune -a
docker-compose up -d --build
```

### Verificar salud de los servicios
```bash
docker-compose ps
```

## 🔧 Modo Desarrollo

Si eres desarrollador y quieres trabajar con hot-reload:

1. Edita `docker-compose.yml` y descomenta estas líneas:
```yaml
volumes:
  - ./backend:/app  # Sincroniza código del backend
```

2. Reinicia los contenedores:
```bash
docker-compose down
docker-compose up -d
```

Ahora los cambios en el código se reflejarán automáticamente.

## 📱 Acceso desde Otros Dispositivos

Para acceder desde tu teléfono o tablet en la misma red:

1. Obtén tu IP local:
```bash
# Windows
ipconfig

# Mac/Linux
ifconfig | grep "inet "
```

2. Accede desde otros dispositivos:
```
http://TU-IP-LOCAL:3000
```

Ejemplo: `http://192.168.1.100:3000`

## 🌐 Despliegue en Producción

### Variables de Entorno
Crea un archivo `.env` en la raíz:
```bash
# Backend
DATABASE_URL=sqlite:///./gimnasio.db
ANTHROPIC_API_KEY=tu_api_key_aqui
WHATSAPP_TOKEN=tu_token_aqui

# Frontend
NEXT_PUBLIC_API_URL=http://backend:8000
```

### Usar HTTPS (Recomendado)
Configura un reverse proxy como nginx o Caddy frente a Docker.

## 📞 Soporte

¿Problemas? Contacta al equipo de soporte o abre un issue en GitHub.

## 📄 Licencia

[Tu Licencia Aquí]

---

**¡Disfruta Momentum Fitness!** 💪

# Guia de Actualizacion v1.2 - Momentum Fitness

**Fecha:** 2026-01-30
**Version anterior:** 1.1.0
**Version nueva:** 1.2.0

---

## Cambios Importantes en esta Version

### Cambios en la Base de Datos

Esta version incluye **migraciones automaticas** que se ejecutan al iniciar el contenedor:

1. **Campo `cedula` en usuarios**
   - Ahora es el identificador unico del usuario
   - Los usuarios existentes tendran el valor de `telefono` copiado a `cedula`
   - El campo `telefono` queda disponible para el numero de telefono real

2. **Campo `visitas_disponibles` en membresias**
   - Permite controlar planes con visitas limitadas (ej: PASE_FLEX = 14 visitas)
   - Para planes ilimitados: el valor es NULL
   - Para PASE_FLEX existentes: se calcula automaticamente las visitas restantes

3. **Nuevos planes disponibles**
   - ESTUDIANTE ($45,000 - 30 dias)
   - SOCIO (Gratis - permanente)
   - CORTESIA (Gratis - flexible)

### Otras Mejoras

- Optimizaciones en el sistema de asistencia
- Mejoras en la interfaz de usuario
- Correccion de bugs menores

---

## Instrucciones de Actualizacion

### IMPORTANTE: Hacer Backup Primero

Antes de actualizar, es **MUY RECOMENDABLE** hacer una copia de seguridad:

**Opcion 1: Copia simple de la base de datos**
```bash
# Crear carpeta de backup
mkdir -p backup

# Copiar base de datos desde el contenedor
docker cp momentum-backend:/app/data/gimnasio.db ./backup/gimnasio_backup_$(date +%Y%m%d_%H%M%S).db
```

**Opcion 2: Exportar el volumen completo**
```bash
# Crear un backup del volumen
docker run --rm -v momentum_database:/data -v $(pwd)/backup:/backup alpine tar cvf /backup/momentum_db_backup.tar /data
```

### Paso 1: Descargar las nuevas imagenes

```bash
docker pull edwlearn/momentum-fitness:backend-latest
docker pull edwlearn/momentum-fitness:frontend-latest
```

### Paso 2: Detener la aplicacion actual

```bash
docker-compose down
```

### Paso 3: Iniciar con la nueva version

```bash
docker-compose up -d
```

### Paso 4: Verificar que las migraciones se ejecutaron

```bash
# Ver los logs del backend
docker logs momentum-backend 2>&1 | grep -i "migracion\|migration\|cedula\|visitas"
```

**Salida esperada:**
```
=== Ejecutando migraciones de base de datos ===
Ejecutando migracion: add_cedula_field.py
El campo 'cedula' ya existe en la tabla. Omitiendo migracion.
Ejecutando migracion: add_visitas_disponibles_membresia.py
El campo 'visitas_disponibles' ya existe en la tabla. Omitiendo paso de agregar columna.
=== Migraciones completadas ===
```

### Paso 5: Verificar que la aplicacion funciona

1. Abrir http://localhost:3000
2. Verificar que los clientes existentes aparecen
3. Verificar que las membresias tienen sus datos correctos

---

## Usando el Script de Actualizacion (Recomendado)

Si tienes el paquete de distribucion, simplemente ejecuta:

**Windows:**
```batch
update.bat
```

**Linux/Mac:**
```bash
./update.sh
```

El script hace todo automaticamente:
1. Descarga las nuevas imagenes
2. Detiene la version actual
3. Inicia la version actualizada
4. Las migraciones se ejecutan automaticamente

---

## Verificacion Post-Actualizacion

### Verificar version de las imagenes

```bash
docker images | grep momentum-fitness
```

### Verificar que los contenedores estan corriendo

```bash
docker ps --format "table {{.Names}}\t{{.Status}}"
```

**Resultado esperado:**
```
NAMES               STATUS
momentum-frontend   Up X minutes
momentum-backend    Up X minutes (healthy)
```

### Verificar la salud del backend

```bash
curl http://localhost:8000/health
```

**Resultado esperado:**
```json
{"status":"healthy","version":"2.0.0","database":"connected","bot":"offline"}
```

### Verificar los datos de un usuario

```bash
curl http://localhost:8000/api/usuarios | head -100
```

Verifica que los usuarios tienen el campo `cedula` correctamente poblado.

---

## Solucion de Problemas

### Error: "La tabla 'usuarios' no existe"

Esto significa que es una instalacion nueva sin datos previos. Las tablas se crearan automaticamente.

### Error: "unique constraint failed: usuarios.cedula"

Esto puede ocurrir si hay usuarios con telefonos duplicados. Solucion:
1. Hacer backup de la base de datos
2. Identificar usuarios duplicados
3. Corregir manualmente o contactar soporte

### Los datos no aparecen despues de actualizar

Verificar que el volumen `momentum_database` existe:
```bash
docker volume ls | grep momentum
```

Si no existe, puede que se haya eliminado accidentalmente. Restaurar desde backup.

### El contenedor backend no inicia

Ver logs detallados:
```bash
docker logs momentum-backend --tail 100
```

Buscar errores especificos y contactar soporte si es necesario.

---

## Rollback (Volver a Version Anterior)

Si necesitas volver a la version 1.1:

### Opcion 1: Usar tags especificos

Editar `docker-compose.yml`:
```yaml
services:
  backend:
    image: edwlearn/momentum-fitness:backend-v1.1
  frontend:
    image: edwlearn/momentum-fitness:frontend-v1.1
```

Luego:
```bash
docker-compose pull
docker-compose up -d
```

### Opcion 2: Restaurar backup de base de datos

```bash
# Detener contenedores
docker-compose down

# Restaurar backup
docker cp ./backup/gimnasio_backup_FECHA.db momentum-backend:/app/data/gimnasio.db

# Iniciar con version anterior (editando tags en docker-compose.yml)
docker-compose up -d
```

---

## Preguntas Frecuentes

### Mis datos se van a perder?

**NO.** Los datos estan en un volumen Docker persistente (`momentum_database`) que NO se elimina al actualizar. Solo se eliminan si ejecutas `docker-compose down -v` (con la flag `-v`).

### Que pasa si ya tengo el campo cedula?

La migracion detecta si el campo ya existe y simplemente lo omite. Es seguro ejecutar multiples veces.

### Tengo que hacer algo manual?

**NO.** Las migraciones son 100% automaticas. Solo necesitas:
1. Hacer backup (recomendado)
2. Ejecutar `update.sh` o `update.bat`
3. Verificar que todo funciona

### Cuanto tiempo toma la actualizacion?

- Descarga de imagenes: 2-5 minutos (depende de internet)
- Ejecucion de migraciones: < 30 segundos
- Reinicio de servicios: < 1 minuto

**Total estimado: 5-10 minutos**

---

## Contacto y Soporte

Si tienes problemas con la actualizacion:
- Revisa los logs: `docker logs momentum-backend`
- Docker Hub: https://hub.docker.com/r/edwlearn/momentum-fitness

---

**Estado:** Listo para distribucion

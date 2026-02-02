# Cómo Verificar que la Actualización v1.1 se Aplicó Correctamente

## Métodos de Verificación

### 1. Verificar Versión de las Imágenes Docker

El método más confiable es verificar qué versión de las imágenes están corriendo:

```bash
# Ver las imágenes que están corriendo actualmente
docker ps --format "table {{.Names}}\t{{.Image}}\t{{.Status}}"
```

**Resultado esperado:**
```
NAMES                IMAGE                                        STATUS
momentum-frontend    edwlearn/momentum-fitness:frontend-latest    Up X minutes
momentum-backend     edwlearn/momentum-fitness:backend-latest     Up X minutes
```

### 2. Verificar el Digest de las Imágenes

Para estar 100% seguro de que tienes v1.1:

```bash
# Ver el digest (hash) de las imágenes corriendo
docker inspect momentum-backend --format='{{.Image}}'
docker inspect momentum-frontend --format='{{.Image}}'
```

**Para v1.1, deberías ver:**
- Backend: `sha256:8da7fb9fcc84...` (los primeros caracteres)
- Frontend: `sha256:d0394a571552...` (los primeros caracteres)

**Si ves estos de v1.0, NO se actualizó:**
- Backend v1.0: `sha256:94b1be321bd2...`
- Frontend v1.0: `sha256:79defa0b335f...`

### 3. Verificar Fecha de Creación de los Contenedores

```bash
# Ver cuándo se crearon los contenedores
docker ps --format "table {{.Names}}\t{{.CreatedAt}}"
```

Si ejecutaste `update.bat` hace unos minutos, los contenedores deberían tener una fecha de creación muy reciente.

### 4. Revisar los Logs del Backend

```bash
# Ver los logs del backend para ver la versión
docker logs momentum-backend 2>&1 | head -20
```

Busca mensajes de inicio que podrían indicar cambios recientes.

### 5. Verificar desde la Aplicación Web

Algunas formas de verificar visualmente:

1. **Abre la aplicación:** http://localhost:3000

2. **Prueba las mejoras de v1.1:**
   - Ve a la sección de **Cupones** → Debería tener mejoras en preventa
   - Verifica el **registro de asistencia** → Debería funcionar correctamente
   - Revisa la **interfaz** → Debería verse más pulida

### 6. Comando Todo-en-Uno para Verificación Completa

```bash
echo "=== VERIFICACIÓN DE ACTUALIZACIÓN V1.1 ==="
echo ""
echo "1. Contenedores corriendo:"
docker ps --format "table {{.Names}}\t{{.Image}}\t{{.Status}}"
echo ""
echo "2. Hash de imágenes (Backend):"
docker inspect momentum-backend --format='Backend: {{.Image}}'
echo ""
echo "3. Hash de imágenes (Frontend):"
docker inspect momentum-frontend --format='Frontend: {{.Image}}'
echo ""
echo "4. Fecha de creación:"
docker ps --format "table {{.Names}}\t{{.CreatedAt}}"
echo ""
echo "5. Imágenes locales disponibles:"
docker images | grep "momentum-fitness"
```

---

## Qué Hacer Si NO se Actualizó

### Opción 1: Forzar Actualización Manual

```bash
# 1. Detener los contenedores
docker-compose down

# 2. Eliminar las imágenes antiguas (fuerza descarga nueva)
docker rmi edwlearn/momentum-fitness:backend-latest
docker rmi edwlearn/momentum-fitness:frontend-latest

# 3. Descargar versiones nuevas
docker-compose pull

# 4. Verificar que descargó v1.1
docker images | grep momentum-fitness

# 5. Iniciar con la nueva versión
docker-compose up -d
```

### Opción 2: Usar Tags Específicos de Versión

Edita `docker-compose.yml` temporalmente para forzar v1.1:

```yaml
services:
  backend:
    image: edwlearn/momentum-fitness:backend-v1.1  # Cambiar de :backend-latest
  frontend:
    image: edwlearn/momentum-fitness:frontend-v1.1  # Cambiar de :frontend-latest
```

Luego:
```bash
docker-compose pull
docker-compose up -d
```

---

## Respuestas Esperadas (v1.1 Correcta)

### Comando: `docker images | grep momentum-fitness`

```
edwlearn/momentum-fitness   frontend-latest   d0394a571552   X minutes ago    58.9MB
edwlearn/momentum-fitness   frontend-v1.1     d0394a571552   X minutes ago    58.9MB
edwlearn/momentum-fitness   backend-latest    8da7fb9fcc84   X minutes ago    599MB
edwlearn/momentum-fitness   backend-v1.1      8da7fb9fcc84   X minutes ago    599MB
```

**Clave:** `frontend-latest` y `frontend-v1.1` deben tener el MISMO IMAGE ID (`d0394a571552`)
**Clave:** `backend-latest` y `backend-v1.1` deben tener el MISMO IMAGE ID (`8da7fb9fcc84`)

### Comando: `docker ps`

```
CONTAINER ID   IMAGE                                        STATUS
xxxxx          edwlearn/momentum-fitness:frontend-latest    Up X minutes (healthy)
xxxxx          edwlearn/momentum-fitness:backend-latest     Up X minutes (healthy)
```

---

## Script Automático de Verificación

Crea un archivo `verificar.bat` (Windows) o `verificar.sh` (Linux):

**verificar.bat:**
```batch
@echo off
echo === VERIFICACION DE VERSION ===
echo.
echo Contenedores activos:
docker ps --format "table {{.Names}}\t{{.Image}}"
echo.
echo Hash del Backend:
docker inspect momentum-backend --format="{{.Image}}" 2>nul
echo.
echo Hash del Frontend:
docker inspect momentum-frontend --format="{{.Image}}" 2>nul
echo.
echo Versiones esperadas para v1.1:
echo Backend:  sha256:8da7fb9fcc84...
echo Frontend: sha256:d0394a571552...
echo.
pause
```

---

## Checklist Rápido

- [ ] Contenedores corriendo con `backend-latest` y `frontend-latest`
- [ ] Hash del backend empieza con `8da7fb9fcc84`
- [ ] Hash del frontend empieza con `d0394a571552`
- [ ] Contenedores creados recientemente (después de ejecutar update.bat)
- [ ] Aplicación accesible en http://localhost:3000
- [ ] Sin errores en los logs

Si todos estos puntos están ✅, entonces **la actualización fue exitosa**.

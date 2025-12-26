# Actualización Automática de Estados de Usuarios

## Descripción

Este sistema mantiene actualizado el estado `activo` de los usuarios basándose en si tienen una membresía activa y vigente.

### Regla de Negocio

- **Usuario ACTIVO**: Tiene al menos una membresía con:
  - `activo = True`
  - `estado = "activa"`
  - `fecha_fin >= fecha_actual`

- **Usuario INACTIVO**: No tiene ninguna membresía que cumpla los criterios anteriores

## Métodos de Ejecución

### 1. Endpoint API (Recomendado para uso manual)

```bash
# Usando curl
curl -X POST http://localhost:8000/api/usuarios/actualizar-estados-membresia

# Usando httpie
http POST http://localhost:8000/api/usuarios/actualizar-estados-membresia
```

**Respuesta:**
```json
{
  "total_usuarios": 150,
  "usuarios_desactivados": 12,
  "usuarios_activados": 3,
  "detalles": [
    {
      "usuario_id": 42,
      "nombre": "Juan Pérez",
      "accion": "desactivado",
      "razon": "No tiene membresía activa o vigente"
    },
    {
      "usuario_id": 87,
      "nombre": "María García",
      "accion": "activado",
      "razon": "Tiene membresía vigente hasta 2025-12-31 15:30:00"
    }
  ]
}
```

### 2. Script Manual

```bash
# Desde el directorio backend
cd backend
python actualizar_estados_usuarios.py
```

**Salida esperada:**
```
================================================================================
ACTUALIZACIÓN DE ESTADOS DE USUARIOS SEGÚN MEMBRESÍA
================================================================================

Iniciando actualización...

================================================================================
RESUMEN DE LA ACTUALIZACIÓN
================================================================================
Total de usuarios procesados: 150
Usuarios desactivados: 12
Usuarios activados: 3

DETALLE DE CAMBIOS:
--------------------------------------------------------------------------------

👤 Juan Pérez (ID: 42)
   Acción: DESACTIVADO
   Razón: No tiene membresía activa o vigente

👤 María García (ID: 87)
   Acción: ACTIVADO
   Razón: Tiene membresía vigente hasta 2025-12-31 15:30:00

================================================================================
✅ Actualización completada exitosamente
================================================================================
```

### 3. Automatización con Cron (Recomendado para producción)

Para ejecutar automáticamente cada día a las 2 AM:

```bash
# Editar crontab
crontab -e

# Agregar la siguiente línea
0 2 * * * cd /ruta/al/proyecto/backend && /usr/bin/python3 actualizar_estados_usuarios.py >> /var/log/actualizar_usuarios.log 2>&1
```

Para ejecutar cada hora:

```bash
0 * * * * cd /ruta/al/proyecto/backend && /usr/bin/python3 actualizar_estados_usuarios.py >> /var/log/actualizar_usuarios.log 2>&1
```

## Implementación Técnica

### Función CRUD

**Ubicación:** `backend/app/crud/usuarios.py`

```python
def actualizar_estado_usuarios_por_membresia(db: Session) -> dict:
    """
    Actualiza el estado 'activo' de todos los usuarios basándose en si tienen
    una membresía activa y vigente.
    """
```

### Endpoint API

**Ubicación:** `backend/app/api/endpoints/usuarios.py`

```python
@router.post("/actualizar-estados-membresia")
def actualizar_estados_por_membresia(db: Session = Depends(get_db)):
    """POST /api/usuarios/actualizar-estados-membresia"""
```

### Script Independiente

**Ubicación:** `backend/actualizar_estados_usuarios.py`

Puede ejecutarse independientemente sin necesidad de levantar el servidor FastAPI.

## Casos de Uso

### Escenario 1: Membresía Vencida
- Cliente tenía membresía que expiró ayer
- Al ejecutar la actualización → Usuario marcado como INACTIVO

### Escenario 2: Renovación de Membresía
- Cliente inactivo renueva su membresía
- Al ejecutar la actualización → Usuario marcado como ACTIVO

### Escenario 3: Sin Cambios
- Todos los usuarios tienen el estado correcto
- Al ejecutar la actualización → No se realizan cambios

## Monitoreo

### Verificar Estado de Usuarios

```bash
# Ver usuarios activos
curl http://localhost:8000/api/usuarios?skip=0&limit=100 | jq '.[] | select(.activo == true)'

# Ver usuarios inactivos
curl http://localhost:8000/api/usuarios?skip=0&limit=100 | jq '.[] | select(.activo == false)'
```

### Logs

Si usas cron, revisa los logs:

```bash
tail -f /var/log/actualizar_usuarios.log
```

## Consideraciones

1. **Rendimiento**: La función procesa TODOS los usuarios. Para bases de datos grandes (>10,000 usuarios), considera implementar paginación o procesamiento en lotes.

2. **Transacciones**: La actualización se realiza en una sola transacción. Si falla, todos los cambios se revierten.

3. **Zona Horaria**: Usa UTC para comparaciones de fechas. Asegúrate de que `fecha_fin` esté en UTC.

4. **Seguridad**: El endpoint POST no requiere autenticación actualmente. Considera agregar autenticación en producción.

## Próximos Pasos (Opcional)

1. **Notificaciones**: Enviar email/SMS a usuarios cuando se desactiven
2. **Webhooks**: Integrar con sistemas externos
3. **Auditoría**: Registrar cambios en tabla de auditoría
4. **Dashboard**: Mostrar estadísticas de activación/desactivación

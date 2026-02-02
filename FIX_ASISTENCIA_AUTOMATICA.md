# Fix: Asistencia Automática al Crear Usuario

## Problema Reportado

Al crear un usuario nuevo con **Pase Diario** o **Pase Flex**, se intenta registrar la asistencia automáticamente, pero aparece el error:
- "Usuario no encontrado", o
- "Solo planes de mensual + (asistencia)"

## Causa Raíz

1. **Frontend**: Solo registraba asistencia automática para `PASE_DIARIO`, pero NO para `PASE_FLEX`
2. **Backend**: La función `get_membresia_activa_by_usuario` no verificaba que la `fecha_inicio` de la membresía fuera menor o igual a la fecha actual
3. **Mensajes de error ambiguos**: No quedaba claro cuál era el problema exacto

## Soluciones Implementadas

### 1. Frontend - Incluir Pase Flex

**Archivo**: [components/new-usuario-drawer.tsx](components/new-usuario-drawer.tsx#L332-L347)

```typescript
// ANTES: Solo Pase Diario
if (formData.tipoPlan === TipoPlan.PASE_DIARIO) {
  // registrar asistencia...
}

// DESPUÉS: Pase Diario Y Pase Flex
if (formData.tipoPlan === TipoPlan.PASE_DIARIO || formData.tipoPlan === TipoPlan.PASE_FLEX) {
  // registrar asistencia...
}
```

**Cambio**: Línea 333
- Se agregó validación para `PASE_FLEX` además de `PASE_DIARIO`
- Ahora ambos planes registran asistencia automáticamente al crear el usuario

### 2. Backend - Validación de Membresía Activa

**Archivo**: [backend/app/crud/membresias.py](backend/app/crud/membresias.py#L28-L39)

```python
# ANTES
def get_membresia_activa_by_usuario(db: Session, usuario_id: int) -> Optional[Membresia]:
    now = datetime.now(COLOMBIA_TZ)
    return db.query(Membresia).filter(
        and_(
            Membresia.usuario_id == usuario_id,
            Membresia.activo == True,
            Membresia.estado == EstadoMembresia.ACTIVA,
            Membresia.fecha_fin >= now  # Solo verificaba que no haya expirado
        )
    ).order_by(Membresia.fecha_fin.desc()).first()

# DESPUÉS
def get_membresia_activa_by_usuario(db: Session, usuario_id: int) -> Optional[Membresia]:
    now = datetime.now(COLOMBIA_TZ)
    return db.query(Membresia).filter(
        and_(
            Membresia.usuario_id == usuario_id,
            Membresia.activo == True,
            Membresia.estado == EstadoMembresia.ACTIVA,
            Membresia.fecha_inicio <= now,  # ✅ La membresía ya debe haber iniciado
            Membresia.fecha_fin >= now      # Y no debe haber expirado
        )
    ).order_by(Membresia.fecha_fin.desc()).first()
```

**Cambios**: Línea 36
- Se agregó validación `Membresia.fecha_inicio <= now`
- Esto asegura que la membresía no solo no haya expirado, sino que también ya haya iniciado
- Previene problemas con membresías que tienen fecha de inicio en el futuro

### 3. Backend - Mejores Mensajes de Error

**Archivo**: [backend/app/api/endpoints/asistencia.py](backend/app/api/endpoints/asistencia.py#L23-L37)

```python
# ANTES: Mensaje genérico
if not membresia_activa:
    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="El usuario no tiene una membresía activa"
    )

# DESPUÉS: Mensajes específicos
if not membresia_activa:
    todas_membresias = membresias_crud.get_membresias_by_usuario(db, usuario_id=asistencia.usuario_id)
    if not todas_membresias:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="El usuario no tiene ninguna membresía registrada"
        )
    else:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="El usuario no tiene una membresía activa y vigente en este momento"
        )
```

**Cambios**: Líneas 23-37
- Ahora distingue entre "no tiene ninguna membresía" vs "tiene membresía pero no está activa/vigente"
- Facilita el debugging y la comprensión del problema

## Flujo Corregido

1. Usuario se crea en el frontend con Pase Diario o Pase Flex
2. Backend crea el usuario en la base de datos
3. Backend crea la membresía con:
   - `fecha_inicio` = `datetime.now(COLOMBIA_TZ)`
   - `fecha_fin` = `fecha_inicio + duracion_dias`
   - `activo` = `True`
   - `estado` = `ACTIVA`
4. Frontend intenta registrar asistencia automáticamente
5. Backend verifica:
   - ✅ Usuario existe
   - ✅ Membresía existe
   - ✅ Membresía está activa (`activo == True`)
   - ✅ Membresía tiene estado ACTIVA
   - ✅ Membresía ya inició (`fecha_inicio <= now`)
   - ✅ Membresía no ha expirado (`fecha_fin >= now`)
6. Si todo es correcto, se registra la asistencia

## Testing

### Casos de Prueba

1. **Crear usuario con Pase Diario**
   - ✅ Debe crear usuario
   - ✅ Debe crear membresía
   - ✅ Debe registrar asistencia automáticamente

2. **Crear usuario con Pase Flex**
   - ✅ Debe crear usuario
   - ✅ Debe crear membresía
   - ✅ Debe registrar asistencia automáticamente

3. **Crear usuario con plan Mensual o superior**
   - ✅ Debe crear usuario
   - ✅ Debe crear membresía
   - ❌ NO debe registrar asistencia automáticamente

4. **Marcar asistencia manualmente con Pase Flex**
   - ✅ Ir a la página de Asistencia
   - ✅ Buscar usuario por cédula (que tenga Pase Flex activo)
   - ✅ Debe poder marcar entrada sin errores
   - ✅ Debe aparecer en la lista de asistencias del día

### Comandos para Probar

```bash
# 1. Iniciar backend
cd backend
python main.py

# 2. Iniciar frontend
npm run dev

# 3. Crear usuario con Pase Diario
# - Ir a la interfaz de creación de usuarios
# - Seleccionar "Pase Diario"
# - Completar el formulario
# - Guardar
# - Verificar que no aparezca error
# - Verificar que la asistencia se registró automáticamente

# 4. Crear usuario con Pase Flex
# - Repetir proceso con "Pase Flex"
```

## Archivos Modificados

### Frontend
- ✅ [components/new-usuario-drawer.tsx](components/new-usuario-drawer.tsx)
  - Línea 333: Agregado soporte para Pase Flex

### Backend
- ✅ [backend/app/crud/membresias.py](backend/app/crud/membresias.py)
  - Línea 36: Agregada validación de `fecha_inicio`

- ✅ [backend/app/api/endpoints/asistencia.py](backend/app/api/endpoints/asistencia.py)
  - Líneas 23-37: Mejorados mensajes de error

## Notas Importantes

1. **Zona Horaria**: Todas las fechas usan `COLOMBIA_TZ` (UTC-5)
2. **Atomic Operations**: La creación de usuario, membresía y asistencia son operaciones separadas con manejo de errores independiente
3. **No Bloquea Creación**: Si falla el registro de asistencia, el usuario y membresía se crean igual, solo se muestra un mensaje de error
4. **Planes Elegibles para Asistencia Automática**: Solo `PASE_DIARIO` y `PASE_FLEX` registran asistencia automática al crear el usuario
5. **Asistencia Manual**: TODOS los usuarios con membresía activa (incluido Pase Flex) pueden marcar asistencia manualmente en la página de Asistencia

## Validaciones Relacionadas

Las siguientes validaciones permanecen sin cambios:
- ✅ Pase Día y Pase Flex NO pueden recibir cupones
- ✅ Pase Día y Pase Flex NO pueden recibir descuentos por referidos
- ✅ Solo se puede registrar una asistencia por usuario por día
- ✅ Solo usuarios con membresía activa y vigente pueden registrar asistencia

---

**Fecha**: 2026-01-09
**Versión**: 1.0.0
**Estado**: ✅ Completado y Probado

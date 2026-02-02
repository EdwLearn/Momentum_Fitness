# Fix: Estado de Usuarios al Crear

## Problema Identificado

Cuando se creaba un nuevo usuario, este aparecía con estado "Inactivo" o "Sin membresía" incluso después de asignarle una membresía, lo que generaba confusión.

## Causa Raíz

El modelo `Usuario` tenía el campo `activo` con valor por defecto `TRUE`. Esto causaba que:

1. Los usuarios **CLIENTE** se creaban como "activos" aunque no tuvieran membresía
2. En el frontend, estos usuarios sin membresía se mostraban como "Sin membresía" o visualmente inactivos
3. Cuando se les asignaba una membresía, la lógica de activación solo actuaba si `activo == FALSE`

## Solución Implementada

### 1. Cambio en el Modelo de Usuario

**Archivo modificado:** `backend/app/modules/usuarios/models/usuario.py`

```python
# ANTES:
activo = Column(Boolean, default=True)

# DESPUÉS:
activo = Column(Boolean, default=False)  # Por defecto False, se activa al crear membresía
```

### 2. Lógica de Activación Mejorada

**Archivo modificado:** `backend/app/crud/usuarios.py`

- Los usuarios **ADMIN** y **ENTRENADOR** se activan automáticamente al crearse (no necesitan membresía)
- Los usuarios **CLIENTE** se crean inactivos y se activan al crear su primera membresía

```python
def create_usuario(db: Session, usuario: UsuarioCreate) -> Usuario:
    # ...
    # Activar automáticamente si es ADMIN o ENTRENADOR (no necesitan membresía)
    if db_usuario.tipo in [TipoUsuario.ADMIN, TipoUsuario.ENTRENADOR]:
        db_usuario.activo = True
    # ...
```

**Archivo modificado:** `backend/app/crud/membresias.py`

- Cuando se crea una membresía, el usuario se activa **siempre** (no solo si estaba inactivo)

```python
# 12. Activar usuario automáticamente (ya que tiene una membresía activa y vigente)
usuario = db.query(Usuario).filter(Usuario.id == membresia_simple.usuario_id).first()
if usuario:
    usuario.activo = True
    db.commit()
```

### 3. Migración de Base de Datos

**Archivo creado:** `backend/migrations/update_usuario_activo_default.sql`

```sql
ALTER TABLE usuarios
ALTER COLUMN activo SET DEFAULT FALSE;
```

## Aplicar la Solución

### ✅ Ya Aplicada

La migración ya fue aplicada exitosamente a la base de datos SQLite.

Si necesitas aplicarla nuevamente en otro ambiente:

```bash
cd backend
python migrations/update_usuario_activo_default_sqlite.py
```

### Para PostgreSQL (si migras en el futuro)

```bash
cd backend
./apply_migration.sh migrations/update_usuario_activo_default.sql
```

O con Docker:

```bash
docker exec -i momentum-postgres psql -U momentum_user -d momentum_db < backend/migrations/update_usuario_activo_default.sql
```

## Comportamiento Después del Fix

### Usuarios CLIENTE (Gimnasio)
- ✅ Se crean con `activo = False`
- ✅ Al crear una membresía → `activo = True` → Estado: "Activo"
- ✅ Sin membresía → `activo = False` → Estado: "Sin membresía" o "Inactivo"

### Usuarios ADMIN y ENTRENADOR
- ✅ Se crean con `activo = True` automáticamente
- ✅ No necesitan membresía para estar activos

## Notas Importantes

1. **Usuarios Existentes:** Esta migración NO afecta a los usuarios ya creados en la base de datos. Solo cambia el comportamiento para usuarios nuevos.

2. **Compatibilidad:** El código del frontend no requiere cambios, ya que la lógica de visualización sigue siendo la misma (basada en membresía activa).

3. **Testing:** Después de aplicar la migración, prueba crear:
   - Un usuario CLIENTE con membresía → Debe aparecer "Activo"
   - Un usuario CLIENTE sin membresía → Debe aparecer "Sin membresía"
   - Un usuario ENTRENADOR → Debe aparecer "Activo" inmediatamente

## Verificación

Para verificar que la migración se aplicó correctamente:

**SQLite:**
```bash
sqlite3 gimnasio.db "PRAGMA table_info(usuarios);" | grep activo
# Debe mostrar: 6|activo|BOOLEAN|0|0|0
# El "0" en la columna dflt_value indica FALSE como valor por defecto
```

**PostgreSQL (si aplica):**
```sql
SELECT column_default
FROM information_schema.columns
WHERE table_name = 'usuarios'
  AND column_name = 'activo';
-- Debe devolver: false
```

## Rollback (En caso de problemas)

Si necesitas revertir los cambios:

```sql
ALTER TABLE usuarios
ALTER COLUMN activo SET DEFAULT TRUE;
```

Y revertir los cambios en el código:

```python
# En backend/app/modules/usuarios/models/usuario.py
activo = Column(Boolean, default=True)
```

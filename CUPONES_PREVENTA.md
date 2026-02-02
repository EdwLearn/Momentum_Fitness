# Cupones de Pre-Venta (25% de Descuento)

## Descripción

Se ha agregado una nueva funcionalidad para crear cupones especiales de pre-venta con un descuento del 25%, superior al límite estándar de 20% de los cupones regulares.

## Características

- **Descuento fijo del 25%**: Los cupones de pre-venta tienen un descuento predefinido del 25%
- **No acumulable**: No se puede combinar con otros descuentos o cupones
- **Interfaz dedicada**: Botón y formulario específico para crear cupones de pre-venta
- **Validación automática**: El backend fuerza automáticamente el descuento al 25%

## Uso

### Crear un Cupón de Pre-Venta

1. Navega a la página de **Cupones y Plan de Referidos**
2. Haz clic en el botón **"Cupón Pre-Venta (25%)"**
3. Completa el formulario:
   - **Código del cupón**: Código único (ej: PREVENTA2026, LANZAMIENTO25)
   - **Nicho de origen**: Alimenticio o Estético
   - **Fecha de expiración**: Opcional (dejar vacío para sin expiración)
4. Haz clic en **"Crear cupón de pre-venta"**

### API

#### Endpoint para Cupones de Pre-Venta

```http
POST /api/cupones/preventa
Content-Type: application/json

{
  "codigo": "PREVENTA2026",
  "nicho": "Alimenticio",
  "descuento": 25,
  "activo": true,
  "fecha_expiracion": "2026-12-31T23:59:59"
}
```

**Nota**: El campo `descuento` será forzado a 25 por el backend, independientemente del valor enviado.

#### Endpoint General de Cupones

Los cupones de pre-venta también pueden crearse usando el endpoint general:

```http
POST /api/cupones/
Content-Type: application/json

{
  "codigo": "PREVENTA2026",
  "nicho": "Alimenticio",
  "descuento": 25,
  "activo": true,
  "fecha_expiracion": "2026-12-31T23:59:59"
}
```

## Cambios Técnicos

### Backend

1. **Modelo de Base de Datos** (`backend/app/models/cupon.py`)
   - Actualizado el constraint `check_descuento_valido` de 20% a 25%

2. **Endpoint Nuevo** (`backend/app/api/endpoints/cupones.py`)
   - Agregado endpoint `/api/cupones/preventa` para crear cupones de pre-venta
   - El descuento se fuerza a 25% en el backend

3. **CRUD** (`backend/app/crud/cupones.py`)
   - Sin cambios, utiliza la misma lógica de creación

### Frontend

1. **Servicio** (`lib/services/cupones.ts`)
   - Nueva función `crearCuponPreVenta()` que usa el endpoint `/api/cupones/preventa`

2. **Componente Nuevo** (`components/preventa-coupon-drawer.tsx`)
   - Drawer especializado para crear cupones de pre-venta
   - Interfaz simplificada con descuento fijo del 25%
   - Diseño visual destacado con gradientes

3. **Página de Cupones** (`app/cupones/page.tsx`)
   - Botón nuevo "Cupón Pre-Venta (25%)" junto al botón de cupón regular
   - Integración del drawer de pre-venta

4. **Formulario Regular** (`components/new-coupon-drawer.tsx`)
   - Actualizado el límite máximo de descuento a 25%
   - Actualizado el texto de ayuda para mencionar cupones de pre-venta

## Migración de Base de Datos

### Para Bases de Datos Existentes

Si ya tienes una base de datos en producción, necesitas ejecutar la migración correspondiente según tu tipo de base de datos:

#### PostgreSQL

```sql
ALTER TABLE cupones DROP CONSTRAINT IF EXISTS check_descuento_valido;
ALTER TABLE cupones ADD CONSTRAINT check_descuento_valido
  CHECK (descuento > 0 AND descuento <= 25);
```

#### SQLite

SQLite no permite modificar constraints directamente. Ejecuta el script de migración:

```bash
# Ubicado en: backend/migrations/update_cupon_descuento_constraint.sql
```

**Nota**: Para nuevas instalaciones, el constraint se crea automáticamente al iniciar el servidor.

## Validaciones

- El código del cupón debe ser único
- El nicho debe ser "Alimenticio" o "Estético"
- El descuento está fijado en 25% para cupones de pre-venta
- La fecha de expiración es opcional
- El cupón se crea activo por defecto

## Ejemplos de Uso

### Cupón de Pre-Venta para Nicho Alimenticio

```javascript
await cuponesService.crearCuponPreVenta({
  codigo: "PREVENTA2026",
  nicho: "Alimenticio",
  fecha_expiracion: "2026-06-30T23:59:59"
});
```

### Cupón de Pre-Venta Sin Expiración

```javascript
await cuponesService.crearCuponPreVenta({
  codigo: "LANZAMIENTO25",
  nicho: "Estético",
  fecha_expiracion: null
});
```

## Notas Importantes

1. **No Acumulable**: Los cupones de pre-venta NO se pueden combinar con descuentos por referido u otros cupones
2. **Límite de Descuento**: El 25% es el descuento máximo permitido en el sistema
3. **Validación Backend**: El descuento siempre será 25% independientemente del valor enviado por el frontend
4. **Cupones Activos**: Los cupones de pre-venta se crean activos por defecto

## Soporte

Para reportar problemas o sugerencias relacionadas con esta funcionalidad, crea un issue en el repositorio del proyecto.

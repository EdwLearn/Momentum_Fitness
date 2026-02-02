-- Migración: Actualizar valor por defecto del campo 'activo' en tabla usuarios
-- Fecha: 2026-01-12
-- Descripción: Cambia el valor por defecto de 'activo' de TRUE a FALSE
--              Los usuarios CLIENTE se crearán como inactivos y se activarán al crear membresía
--              Los usuarios ADMIN y ENTRENADOR se activarán automáticamente en el código

-- Paso 1: Modificar el valor por defecto de la columna 'activo'
ALTER TABLE usuarios
ALTER COLUMN activo SET DEFAULT FALSE;

-- Nota: Esta migración NO afecta a los usuarios existentes
-- Solo cambia el comportamiento para nuevos usuarios creados después de esta migración

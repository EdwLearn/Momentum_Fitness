-- Migración para actualizar el constraint de descuento en la tabla cupones
-- Cambio: Descuento máximo de 20% a 25% para permitir cupones de pre-venta

-- Para PostgreSQL
-- ALTER TABLE cupones DROP CONSTRAINT IF EXISTS check_descuento_valido;
-- ALTER TABLE cupones ADD CONSTRAINT check_descuento_valido CHECK (descuento > 0 AND descuento <= 25);

-- Para SQLite (no soporta ALTER CONSTRAINT directamente)
-- Opción 1: Recrear la tabla (más seguro pero requiere downtime)
-- Opción 2: Ignorar el constraint anterior y confiar en la validación de la aplicación

-- NOTA IMPORTANTE:
-- SQLite no permite modificar constraints directamente.
-- El constraint se actualizará automáticamente cuando se recree la tabla
-- usando Base.metadata.create_all() en el startup de la aplicación.
-- Para una base de datos existente, ejecuta uno de estos comandos:

-- POSTGRESQL:
ALTER TABLE cupones DROP CONSTRAINT IF EXISTS check_descuento_valido;
ALTER TABLE cupones ADD CONSTRAINT check_descuento_valido CHECK (descuento > 0 AND descuento <= 25);

-- SQLITE (requiere recrear la tabla):
-- 1. Backup de datos
CREATE TABLE cupones_backup AS SELECT * FROM cupones;

-- 2. Eliminar tabla original
DROP TABLE cupones;

-- 3. Recrear tabla con nuevo constraint (se ejecutará automáticamente al iniciar la app)
-- O recrearla manualmente con:
/*
CREATE TABLE cupones (
    id INTEGER PRIMARY KEY,
    codigo TEXT UNIQUE NOT NULL,
    nicho TEXT NOT NULL,
    descuento INTEGER NOT NULL,
    usos_total INTEGER DEFAULT 0 NOT NULL,
    usos_anio INTEGER DEFAULT 0 NOT NULL,
    activo BOOLEAN DEFAULT 1 NOT NULL,
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
    fecha_expiracion DATETIME,
    CHECK (descuento > 0 AND descuento <= 25),
    CHECK (usos_total >= 0),
    CHECK (usos_anio >= 0)
);
*/

-- 4. Restaurar datos
-- INSERT INTO cupones SELECT * FROM cupones_backup;

-- 5. Eliminar backup
-- DROP TABLE cupones_backup;

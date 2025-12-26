-- Script para crear la tabla de referidos

CREATE TABLE IF NOT EXISTS referidos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    referidor_id INTEGER NOT NULL,
    referido_id INTEGER NOT NULL,
    membresia_id INTEGER,
    cumple_condicion BOOLEAN NOT NULL DEFAULT 0,
    beneficio VARCHAR,
    fecha_referido DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_activacion DATETIME,
    FOREIGN KEY (referidor_id) REFERENCES usuarios (id),
    FOREIGN KEY (referido_id) REFERENCES usuarios (id),
    FOREIGN KEY (membresia_id) REFERENCES membresias (id)
);

-- Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS ix_referidos_id ON referidos (id);
CREATE INDEX IF NOT EXISTS ix_referidos_referidor_id ON referidos (referidor_id);
CREATE INDEX IF NOT EXISTS ix_referidos_referido_id ON referidos (referido_id);
CREATE INDEX IF NOT EXISTS ix_referidos_membresia_id ON referidos (membresia_id);
CREATE INDEX IF NOT EXISTS ix_referidos_fecha_referido ON referidos (fecha_referido);

-- Verificar que la tabla se creó correctamente
SELECT 'Tabla referidos creada exitosamente' as resultado;
SELECT COUNT(*) as total_referidos FROM referidos;

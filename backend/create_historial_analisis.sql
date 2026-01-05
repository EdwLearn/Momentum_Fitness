-- Tabla de historial de análisis del sistema
CREATE TABLE historial_analisis (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    fecha_analisis DATETIME DEFAULT CURRENT_TIMESTAMP,
    tipo_analisis VARCHAR,  -- 'diario', 'evento', 'manual'
    usuarios_analizados INTEGER,
    alertas_generadas INTEGER,
    mensajes_enviados INTEGER,
    errores TEXT NULL,
    duracion_segundos FLOAT NULL
);

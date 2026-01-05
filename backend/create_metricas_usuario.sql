-- Tabla de métricas consolidadas por usuario
CREATE TABLE metricas_usuario (
    usuario_id INTEGER PRIMARY KEY,

    -- Asistencia
    racha_actual INTEGER DEFAULT 0,
    racha_maxima INTEGER DEFAULT 0,
    total_asistencias INTEGER DEFAULT 0,
    asistencias_mes INTEGER DEFAULT 0,
    dias_desde_ultima_visita INTEGER NULL,
    ultima_asistencia DATE NULL,

    -- Peso
    peso_inicial FLOAT NULL,
    cambio_peso_total FLOAT NULL,
    cambio_peso_mes FLOAT NULL,
    semanas_sin_cambio_peso INTEGER DEFAULT 0,

    -- Engagement con bot
    total_mensajes_recibidos INTEGER DEFAULT 0,
    total_mensajes_respondidos INTEGER DEFAULT 0,
    tasa_respuesta FLOAT NULL,  -- 0.0 a 1.0
    ultima_respuesta DATE NULL,

    -- Alertas generadas
    total_alertas INTEGER DEFAULT 0,
    ultima_alerta DATE NULL,
    ultima_intervencion_osne DATE NULL,

    -- Última actualización
    actualizado_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

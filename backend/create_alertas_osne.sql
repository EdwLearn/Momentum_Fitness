-- Tabla de alertas para Osne
CREATE TABLE alertas_osne (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    usuario_id INTEGER NOT NULL,

    -- Clasificación de la alerta
    tipo_alerta VARCHAR NOT NULL,  -- 'urgente', 'oportunidad', 'seguimiento'
    prioridad INTEGER NOT NULL CHECK (prioridad BETWEEN 1 AND 5),

    -- Qué pasó y qué hacer
    razon TEXT NOT NULL,
    accion_sugerida VARCHAR NOT NULL,  -- 'audio_reconexion', 'audio_celebracion', etc

    -- Contexto para ti
    contexto_json TEXT,  -- JSON con todo el análisis
    puntos_clave TEXT,  -- Array como string: "Meta boda|Venía constante|Respondió positivo"

    -- Estado
    estado VARCHAR DEFAULT 'pendiente',  -- 'pendiente', 'atendida', 'descartada'
    fecha_atencion DATETIME NULL,
    notas_osne TEXT NULL,  -- Lo que hiciste
    resultado VARCHAR NULL,  -- 'reactivado', 'upgrade', 'canceló', etc

    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

CREATE INDEX idx_estado ON alertas_osne(estado);
CREATE INDEX idx_usuario ON alertas_osne(usuario_id);
CREATE INDEX idx_prioridad ON alertas_osne(prioridad);

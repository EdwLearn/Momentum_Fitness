-- Tabla para almacenar todos los mensajes del bot hacia usuarios
CREATE TABLE mensajes_bot (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    usuario_id INTEGER NOT NULL,

    -- Contenido
    contenido TEXT NOT NULL,
    tipo_mensaje VARCHAR(50) NOT NULL,
    -- 'bienvenida', 'racha', 'ausencia', 'peso', 'logro', 'chat_directo'

    -- Origen
    es_automatico BOOLEAN DEFAULT 1,
    trigger_evento VARCHAR(100),
    -- 'racha_30_dias', 'ausencia_7_dias', 'peso_estancado', etc

    -- Engagement
    fue_respondido BOOLEAN DEFAULT 0,
    respuesta_usuario TEXT,
    fecha_respuesta DATETIME,

    -- Metadata
    created_at DATETIME DEFAULT (datetime('now')),

    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

CREATE INDEX idx_mensajes_usuario ON mensajes_bot(usuario_id);
CREATE INDEX idx_mensajes_fecha ON mensajes_bot(created_at);


-- Tabla para alertas que requieren intervención humana de Osnes
CREATE TABLE alertas_intervencion (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    usuario_id INTEGER NOT NULL,

    -- Clasificación
    tipo_alerta VARCHAR(20) NOT NULL,
    -- 'urgente', 'oportunidad', 'seguimiento'

    prioridad INTEGER NOT NULL CHECK (prioridad BETWEEN 1 AND 5),
    -- 1 = más urgente, 5 = menos urgente

    -- Descripción
    razon TEXT NOT NULL,
    -- "7 días sin aparecer, venía 4 semanas seguidas"

    accion_sugerida VARCHAR(50) NOT NULL,
    -- 'audio_reconexion', 'audio_celebracion', 'audio_motivacional',
    -- 'mensaje_texto', 'llamada'

    -- Contexto completo para ti (JSON almacenado como TEXT en SQLite)
    contexto_json TEXT,
    -- Todo el análisis del LLM guardado

    puntos_clave TEXT,
    -- JSON array almacenado como TEXT: ["Meta: boda en 2 meses", "Venía muy constante"]

    -- Estado
    estado VARCHAR(20) DEFAULT 'pendiente',
    -- 'pendiente', 'atendida', 'descartada', 'pospuesta'

    fecha_atencion DATETIME,
    atendida_por INTEGER,
    -- Tu user_id cuando la atiendes

    notas_intervencion TEXT,
    -- Lo que hiciste: "Le mandé audio motivacional, respondió bien"

    resultado VARCHAR(50),
    -- 'reactivado', 'upgrade', 'sigue_inactivo', 'canceló'

    -- Timestamps
    created_at DATETIME DEFAULT (datetime('now')),
    updated_at DATETIME DEFAULT (datetime('now')),

    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (atendida_por) REFERENCES usuarios(id)
);

CREATE INDEX idx_alertas_estado ON alertas_intervencion(estado);
CREATE INDEX idx_alertas_prioridad ON alertas_intervencion(prioridad);
CREATE INDEX idx_alertas_tipo ON alertas_intervencion(tipo_alerta);
CREATE INDEX idx_alertas_usuario ON alertas_intervencion(usuario_id);


-- Tabla de configuración del sistema de notificaciones
CREATE TABLE config_notificaciones (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    -- Modo del sistema
    modo VARCHAR(20) DEFAULT 'balanceado',
    -- 'conservador', 'balanceado', 'proactivo'

    -- Frecuencia mensajes automáticos
    max_mensajes_auto_por_semana INTEGER DEFAULT 1,
    dias_minimos_entre_mensajes INTEGER DEFAULT 7,

    -- Umbrales para alertas
    dias_ausencia_urgente INTEGER DEFAULT 7,
    dias_ausencia_seguimiento INTEGER DEFAULT 3,
    dias_racha_celebracion TEXT DEFAULT '30,60,90,180',
    -- JSON array almacenado como TEXT separado por comas
    semanas_peso_estancado INTEGER DEFAULT 3,

    -- Notificaciones a Osnes
    telefono_notificaciones VARCHAR(20),
    email_notificaciones VARCHAR(100),
    notificar_urgentes BOOLEAN DEFAULT 1,
    notificar_oportunidades BOOLEAN DEFAULT 1,
    notificar_seguimientos BOOLEAN DEFAULT 0,

    -- Horarios (almacenados como VARCHAR en formato HH:MM:SS)
    hora_analisis_diario VARCHAR(8) DEFAULT '08:00:00',
    no_enviar_mensajes_antes VARCHAR(8) DEFAULT '08:00:00',
    no_enviar_mensajes_despues VARCHAR(8) DEFAULT '21:00:00',

    -- Metadata
    updated_at DATETIME DEFAULT (datetime('now'))
);

-- Insertar configuración por defecto
INSERT INTO config_notificaciones (modo) VALUES ('balanceado');


-- Tabla para historial de análisis ejecutados
CREATE TABLE historial_analisis (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    -- Ejecución
    fecha_analisis DATETIME DEFAULT (datetime('now')),
    usuarios_analizados INTEGER,
    alertas_generadas INTEGER,
    mensajes_enviados INTEGER,

    -- Detalles
    tipo_analisis VARCHAR(50),
    -- 'diario', 'evento_asistencia', 'evento_peso', 'manual'

    errores TEXT,
    -- JSON array almacenado como TEXT
    duracion_segundos REAL,

    -- Resultados (JSON almacenado como TEXT)
    resultado_json TEXT
);

CREATE INDEX idx_historial_fecha ON historial_analisis(fecha_analisis);

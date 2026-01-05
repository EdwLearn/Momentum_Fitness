-- Tabla de configuración del sistema (solo un registro)
CREATE TABLE config_sistema (
    id INTEGER PRIMARY KEY DEFAULT 1,

    -- Modo operación
    modo VARCHAR DEFAULT 'balanceado',  -- 'conservador', 'balanceado', 'proactivo'

    -- Límites mensajes automáticos
    max_mensajes_auto_semana INTEGER DEFAULT 1,
    dias_entre_mensajes INTEGER DEFAULT 7,

    -- Umbrales para triggers
    dias_ausencia_urgente INTEGER DEFAULT 7,
    dias_ausencia_seguimiento INTEGER DEFAULT 3,
    rachas_notificar TEXT DEFAULT '7,30,60,90,180',  -- Como string separado por comas
    semanas_peso_estancado INTEGER DEFAULT 3,

    -- Notificaciones a osne
    telefono_osne VARCHAR,
    notificar_urgentes BOOLEAN DEFAULT 1,
    notificar_oportunidades BOOLEAN DEFAULT 1,
    notificar_seguimientos BOOLEAN DEFAULT 0,

    -- Horarios
    hora_analisis_diario VARCHAR(8) DEFAULT '08:00:00',
    no_enviar_antes VARCHAR(8) DEFAULT '08:00:00',
    no_enviar_despues VARCHAR(8) DEFAULT '21:00:00',

    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    CHECK (id = 1)  -- Solo un registro
);

-- Inserta configuración inicial
INSERT INTO config_sistema (modo) VALUES ('balanceado');

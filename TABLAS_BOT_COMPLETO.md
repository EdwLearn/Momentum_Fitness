# 📊 Documentación Completa: Tablas del Sistema de Bot e IA

## Índice
1. [Tablas Core del Bot](#1-tablas-core-del-bot)
2. [Sistema de Alertas Inteligentes](#2-sistema-de-alertas-inteligentes)
3. [Métricas y Análisis](#3-métricas-y-análisis)
4. [Configuración del Sistema](#4-configuración-del-sistema)
5. [Historial y Auditoría](#5-historial-y-auditoría)
6. [Diagrama de Relaciones](#6-diagrama-de-relaciones)
7. [Flujos de Trabajo](#7-flujos-de-trabajo)

---

## 1. Tablas Core del Bot

### 1.1 Tabla `conversaciones`

**Propósito**: Almacena TODO el historial de conversaciones (automáticas y manuales).

```sql
CREATE TABLE conversaciones (
    -- Identificación
    id INTEGER PRIMARY KEY,
    usuario_id INTEGER NOT NULL REFERENCES usuarios(id),

    -- Contenido de la conversación
    mensaje_usuario TEXT NOT NULL,
    respuesta_bot TEXT NOT NULL,

    -- Metadatos temporales
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    sesion_id VARCHAR NULL,

    -- Análisis de sentimiento (futuro)
    sentimiento VARCHAR NULL,  -- 'positivo', 'neutral', 'negativo'

    -- Clasificación de mensajes
    es_trigger BOOLEAN DEFAULT FALSE,
    tipo_trigger VARCHAR NULL,  -- 'racha', 'peso', 'inactividad', 'logro'

    -- 🆕 TRACKING DE ENGAGEMENT
    fue_respondido BOOLEAN DEFAULT FALSE,
    fecha_respuesta DATETIME NULL,

    -- Índices
    INDEX idx_usuario (usuario_id),
    INDEX idx_timestamp (timestamp),
    INDEX idx_sesion (sesion_id),
    INDEX idx_fue_respondido (fue_respondido)
);
```

**Campos nuevos**:
| Campo | Tipo | Descripción |
|-------|------|-------------|
| `fue_respondido` | Boolean | Si el usuario respondió este mensaje del bot |
| `fecha_respuesta` | DateTime | Cuándo respondió (para medir tiempo de respuesta) |

**Casos de uso**:
- Medir tasa de respuesta por usuario
- Identificar usuarios desconectados
- Calcular tiempo promedio de respuesta
- Detectar mensajes ignorados

---

### 1.2 Tabla `logros`

**Propósito**: Registra logros alcanzados para evitar notificaciones duplicadas.

```sql
CREATE TABLE logros (
    -- Identificación
    id INTEGER PRIMARY KEY,
    usuario_id INTEGER NOT NULL REFERENCES usuarios(id),

    -- Tipo de logro
    tipo_logro ENUM('racha', 'peso', 'ejercicio', 'membresia', 'asistencias') NOT NULL,

    -- Detalles del logro
    titulo VARCHAR NOT NULL,
    descripcion VARCHAR NULL,
    valor FLOAT NULL,

    -- Estado
    fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
    notificado BOOLEAN DEFAULT FALSE,

    -- Índices
    INDEX idx_usuario (usuario_id),
    INDEX idx_tipo (tipo_logro),
    INDEX idx_fecha (fecha),
    INDEX idx_notificado (notificado)
);
```

**Sin cambios** - Funciona perfecto como está.

---

## 2. Sistema de Alertas Inteligentes

### 2.1 Tabla `alertas_osnes` 🆕

**Propósito**: Sistema de alertas PARA EDUARD, priorizando acciones manuales efectivas.

```sql
CREATE TABLE alertas_osnes (
    id INTEGER PRIMARY KEY,
    usuario_id INTEGER NOT NULL REFERENCES usuarios(id),

    -- 🎯 CLASIFICACIÓN DE LA ALERTA
    tipo_alerta VARCHAR NOT NULL,  -- 'urgente', 'oportunidad', 'seguimiento'
    prioridad INTEGER NOT NULL CHECK (prioridad BETWEEN 1 AND 5),

    -- 📋 QUÉ PASÓ Y QUÉ HACER
    razon TEXT NOT NULL,
    accion_sugerida VARCHAR NOT NULL,  -- 'audio_reconexion', 'audio_celebracion', etc

    -- 🧠 CONTEXTO PARA TI
    contexto_json TEXT,  -- JSON con TODO el análisis
    puntos_clave TEXT,  -- Array como string: "Meta boda|Venía constante|Respondió positivo"

    -- ✅ ESTADO Y RESULTADO
    estado VARCHAR DEFAULT 'pendiente',  -- 'pendiente', 'atendida', 'descartada'
    fecha_atencion DATETIME NULL,
    notas_osnes TEXT NULL,  -- Lo que hiciste
    resultado VARCHAR NULL,  -- 'reactivado', 'upgrade', 'canceló', etc

    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_estado (estado),
    INDEX idx_usuario (usuario_id),
    INDEX idx_prioridad (prioridad),
    INDEX idx_tipo (tipo_alerta)
);
```

### Tipos de Alertas

#### 🔴 Urgente (Prioridad 5)
**Situaciones**:
- Cliente con racha >30 días lleva 3+ días sin venir (RIESGO ALTO de abandono)
- Cliente con objetivo cercano (boda, evento) empieza a faltar
- Cliente pagó plan largo pero lleva semanas sin venir
- Cliente que respondía mensajes dejó de responder

**Acciones sugeridas**:
- `audio_reconexion_urgente`: Audio WhatsApp preguntando si todo bien
- `llamada_personal`: Llamada directa
- `mensaje_personalizado`: Mensaje de texto ultra-personalizado

**Ejemplo de alerta**:
```json
{
  "id": 1,
  "usuario_id": 45,
  "tipo_alerta": "urgente",
  "prioridad": 5,
  "razon": "María llevaba 45 días consecutivos (su mejor racha). Lleva 5 días sin venir. Tiene boda en 2 meses y estaba súper motivada.",
  "accion_sugerida": "audio_reconexion_urgente",
  "contexto_json": "{\"racha_perdida\": 45, \"dias_ausente\": 5, \"objetivo\": \"boda\", \"fecha_evento\": \"2025-04-15\", \"peso_perdido\": 8.5, \"tasa_respuesta_previa\": 0.95}",
  "puntos_clave": "Boda en 2 meses|Mejor racha personal|Perdió 8.5kg|Respondía siempre",
  "estado": "pendiente",
  "timestamp": "2025-01-15T08:00:00Z"
}
```

#### 🟡 Oportunidad (Prioridad 3-4)
**Situaciones**:
- Cliente completó racha importante (30, 60, 90 días)
- Cliente logró objetivo de peso
- Cliente constante podría estar listo para upgrade de plan
- Cliente refirió a alguien que se quedó

**Acciones sugeridas**:
- `audio_celebracion`: Felicitación en audio
- `propuesta_upgrade`: Ofrecer plan más largo con descuento
- `incentivo_referido`: Recordar beneficio por referidos

**Ejemplo**:
```json
{
  "tipo_alerta": "oportunidad",
  "prioridad": 4,
  "razon": "Carlos completó 90 días consecutivos. Es mensual hace 6 meses. Nunca ha faltado.",
  "accion_sugerida": "propuesta_upgrade",
  "puntos_clave": "90 días racha|6 meses mensual|Constancia perfecta|Buen candidato anual"
}
```

#### 🔵 Seguimiento (Prioridad 1-2)
**Situaciones**:
- Cliente nuevo lleva 3 días sin venir (aún está adaptándose)
- Cliente respondió mensaje automático (dar seguimiento)
- Cliente con patrón irregular pero activo
- Check-in de rutina en clientes estables

**Acciones sugeridas**:
- `mensaje_motivacional`: Mensaje simple de ánimo
- `responder_conversacion`: Dar seguimiento a su respuesta
- `check_in_suave`: Pregunta casual

---

### 2.2 Campos Detallados

#### `contexto_json` - Análisis Completo

Estructura JSON con TODA la info:
```json
{
  "analisis_temporal": {
    "racha_actual": 0,
    "racha_maxima": 45,
    "dias_ausente": 5,
    "ultima_asistencia": "2025-01-10",
    "patron_asistencia": "muy_regular"
  },
  "progreso_fitness": {
    "peso_inicial": 78.5,
    "peso_actual": 70.0,
    "cambio_total": -8.5,
    "cambio_mes": -1.2,
    "objetivo": "boda",
    "fecha_objetivo": "2025-04-15"
  },
  "engagement": {
    "total_mensajes": 12,
    "respondidos": 11,
    "tasa_respuesta": 0.92,
    "ultimo_mensaje": "2025-01-05",
    "respondio_ultimo": true,
    "sentimiento_ultimo": "positivo"
  },
  "membresia": {
    "plan_actual": "mensual",
    "fecha_fin": "2025-02-01",
    "meses_activo": 6,
    "valor_pagado_total": 360000
  },
  "riesgo": {
    "nivel": "alto",
    "factores": ["racha_rota", "objetivo_cercano", "engagement_alto_previo"],
    "score": 8.5
  }
}
```

#### `puntos_clave` - Bullets para Eduard

String separado por `|` con los puntos MÁS importantes:
```
"Boda en 2 meses|Mejor racha personal (45 días)|Perdió 8.5kg|Respondía siempre"
```

Se muestra así en UI:
- ✅ Boda en 2 meses
- ✅ Mejor racha personal (45 días)
- ✅ Perdió 8.5kg
- ✅ Respondía siempre

#### `accion_sugerida` - Tipos de Acciones

| Acción | Cuándo | Ejemplo |
|--------|--------|---------|
| `audio_reconexion_urgente` | Cliente constante desaparece | "Hola María! ¿Todo bien? Te extrañamos" |
| `audio_celebracion` | Logro importante | "¡Carlos! 90 días seguidos, eres una máquina" |
| `mensaje_personalizado` | Contexto complejo | Mensaje escrito específico |
| `llamada_personal` | Muy urgente o delicado | Llamada telefónica |
| `propuesta_upgrade` | Oportunidad de venta | "¿Te gustaría plan anual? Descuento especial" |
| `responder_conversacion` | Usuario respondió bot | Continuar conversación |
| `mensaje_motivacional` | Seguimiento suave | "¡Ánimo! Te vemos pronto" |
| `check_in_suave` | Rutina | "¿Cómo vas con tus entrenamientos?" |

#### `resultado` - Outcomes de tu Intervención

Registra qué pasó después de que actuaste:
- `reactivado`: Volvió al gym
- `upgrade`: Compró plan más largo
- `renovo`: Renovó su plan
- `referido`: Trajo a alguien
- `sin_respuesta`: No respondió
- `cancelo`: Canceló membresía
- `excusa_valida`: Razón legítima (viaje, enfermedad)
- `no_necesario`: Falsa alarma

---

## 3. Métricas y Análisis

### 3.1 Tabla `metricas_usuario` 🆕

**Propósito**: Cache de métricas calculadas por usuario para análisis rápido.

```sql
CREATE TABLE metricas_usuario (
    usuario_id INTEGER PRIMARY KEY REFERENCES usuarios(id),

    -- 📊 ASISTENCIA
    racha_actual INTEGER DEFAULT 0,
    racha_maxima INTEGER DEFAULT 0,
    total_asistencias INTEGER DEFAULT 0,
    asistencias_mes INTEGER DEFAULT 0,
    dias_desde_ultima_visita INTEGER NULL,
    ultima_asistencia DATE NULL,

    -- ⚖️ PESO
    peso_inicial FLOAT NULL,
    cambio_peso_total FLOAT NULL,
    cambio_peso_mes FLOAT NULL,
    semanas_sin_cambio_peso INTEGER DEFAULT 0,

    -- 💬 ENGAGEMENT CON BOT
    total_mensajes_recibidos INTEGER DEFAULT 0,
    total_mensajes_respondidos INTEGER DEFAULT 0,
    tasa_respuesta FLOAT NULL,  -- 0.0 a 1.0
    ultima_respuesta DATE NULL,

    -- 🚨 ALERTAS GENERADAS
    total_alertas INTEGER DEFAULT 0,
    ultima_alerta DATE NULL,
    ultima_intervencion_osnes DATE NULL,

    -- ⏰ ÚLTIMA ACTUALIZACIÓN
    actualizado_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);
```

### ¿Por qué esta tabla?

**Problema**: Calcular métricas en tiempo real es costoso
```sql
-- Esto es LENTO si tienes 500+ usuarios
SELECT
    COUNT(*) as total_asistencias,
    MAX(fecha) as ultima_asistencia,
    -- calcular racha actual...
FROM asistencias
WHERE usuario_id = 123;
```

**Solución**: Pre-calcular y cachear
```sql
-- Esto es INSTANTÁNEO
SELECT * FROM metricas_usuario WHERE usuario_id = 123;
```

### Actualización de Métricas

**Trigger automático** cuando hay nueva asistencia:
```sql
-- Pseudocódigo
AFTER INSERT ON asistencias:
    UPDATE metricas_usuario SET
        total_asistencias = total_asistencias + 1,
        asistencias_mes = asistencias_mes + 1,
        ultima_asistencia = NEW.fecha,
        dias_desde_ultima_visita = 0,
        racha_actual = calcular_racha_actual(usuario_id),
        actualizado_at = NOW()
    WHERE usuario_id = NEW.usuario_id;
```

**Job diario** recalcula todo a las 2am:
```python
# Tarea cron diaria
def recalcular_metricas_todos():
    for usuario in usuarios_activos:
        metricas = calcular_metricas_completas(usuario.id)
        actualizar_metricas_usuario(usuario.id, metricas)
```

### Uso en Generación de Alertas

```python
# Rápido: Buscar usuarios en riesgo
usuarios_riesgo = db.query(MetricasUsuario).filter(
    MetricasUsuario.racha_maxima > 30,
    MetricasUsuario.dias_desde_ultima_visita >= 3,
    MetricasUsuario.tasa_respuesta > 0.8
).all()

for metrica in usuarios_riesgo:
    generar_alerta_urgente(metrica.usuario_id)
```

---

## 4. Configuración del Sistema

### 4.1 Tabla `config_sistema` 🆕

**Propósito**: Configuración centralizada del comportamiento del bot y alertas.

```sql
CREATE TABLE config_sistema (
    id INTEGER PRIMARY KEY DEFAULT 1,

    -- 🎚️ MODO OPERACIÓN
    modo VARCHAR DEFAULT 'balanceado',  -- 'conservador', 'balanceado', 'proactivo'

    -- 📨 LÍMITES MENSAJES AUTOMÁTICOS
    max_mensajes_auto_semana INTEGER DEFAULT 1,
    dias_entre_mensajes INTEGER DEFAULT 7,

    -- 🎯 UMBRALES PARA TRIGGERS
    dias_ausencia_urgente INTEGER DEFAULT 7,
    dias_ausencia_seguimiento INTEGER DEFAULT 3,
    rachas_notificar TEXT DEFAULT '7,30,60,90,180',
    semanas_peso_estancado INTEGER DEFAULT 3,

    -- 📱 NOTIFICACIONES A EDUARD
    telefono_osnes VARCHAR,
    notificar_urgentes BOOLEAN DEFAULT TRUE,
    notificar_oportunidades BOOLEAN DEFAULT TRUE,
    notificar_seguimientos BOOLEAN DEFAULT FALSE,

    -- ⏰ HORARIOS
    hora_analisis_diario TIME DEFAULT '08:00:00',
    no_enviar_antes TIME DEFAULT '08:00:00',
    no_enviar_despues TIME DEFAULT '21:00:00',

    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    CHECK (id = 1)  -- Solo un registro de configuración
);

-- Inserta configuración inicial
INSERT INTO config_sistema (modo) VALUES ('balanceado');
```

### Modos de Operación

#### 🟢 Conservador
**Filosofía**: Solo intervenciones críticas, pocas alertas.
```json
{
  "max_mensajes_auto_semana": 0,  // Sin mensajes automáticos
  "dias_ausencia_urgente": 14,     // 2 semanas para alerta urgente
  "dias_ausencia_seguimiento": 7,  // 1 semana para seguimiento
  "notificar_seguimientos": false
}
```
**Cuándo usar**: Clientes muy privados, fase de prueba.

#### 🟡 Balanceado (Default)
**Filosofía**: Mensajes estratégicos, alertas importantes.
```json
{
  "max_mensajes_auto_semana": 1,
  "dias_ausencia_urgente": 7,
  "dias_ausencia_seguimiento": 3,
  "notificar_seguimientos": false
}
```
**Cuándo usar**: Operación normal.

#### 🔴 Proactivo
**Filosofía**: Intervención temprana, muchas alertas.
```json
{
  "max_mensajes_auto_semana": 2,
  "dias_ausencia_urgente": 3,
  "dias_ausencia_seguimiento": 2,
  "notificar_seguimientos": true
}
```
**Cuándo usar**: Época de renovaciones, campaña de retención.

### Configuración de Rachas a Notificar

Campo `rachas_notificar`: String separado por comas
```
"7,30,60,90,180"
```

Significa: Generar alerta/mensaje cuando el usuario complete:
- ✅ 7 días (primera semana)
- ✅ 30 días (primer mes)
- ✅ 60 días (dos meses)
- ✅ 90 días (tres meses)
- ✅ 180 días (seis meses)

Puedes cambiar a: `"7,14,21,30,60,90"` si quieres más frecuente.

### Horarios de Envío

```sql
no_enviar_antes TIME DEFAULT '08:00:00',  -- No mensajes antes de las 8am
no_enviar_despues TIME DEFAULT '21:00:00'  -- No mensajes después de las 9pm
```

**Respeta la privacidad** de los usuarios. Si un mensaje se generaría a las 10pm, se encola para las 8am del día siguiente.

---

## 5. Historial y Auditoría

### 5.1 Tabla `historial_analisis` 🆕

**Propósito**: Auditoría de ejecuciones del sistema de análisis.

```sql
CREATE TABLE historial_analisis (
    id INTEGER PRIMARY KEY,
    fecha_analisis DATETIME DEFAULT CURRENT_TIMESTAMP,
    tipo_analisis VARCHAR,  -- 'diario', 'evento', 'manual'
    usuarios_analizados INTEGER,
    alertas_generadas INTEGER,
    mensajes_enviados INTEGER,
    errores TEXT NULL,
    duracion_segundos FLOAT NULL,

    INDEX idx_fecha (fecha_analisis),
    INDEX idx_tipo (tipo_analisis)
);
```

### Tipos de Análisis

#### `diario` - Job Automático
Corre todos los días a las 8am (configurable):
```python
{
  "fecha_analisis": "2025-01-15T08:00:00Z",
  "tipo_analisis": "diario",
  "usuarios_analizados": 234,
  "alertas_generadas": 12,
  "mensajes_enviados": 8,
  "errores": null,
  "duracion_segundos": 4.5
}
```

#### `evento` - Triggered por Evento
Cuando pasa algo importante:
```python
{
  "tipo_analisis": "evento",
  "usuarios_analizados": 1,  # Solo el usuario del evento
  "alertas_generadas": 1,
  "mensajes_enviados": 0,
  "errores": null,
  "duracion_segundos": 0.2
}
```

**Eventos que disparan**:
- Nueva asistencia después de ausencia larga
- Usuario responde mensaje automático
- Cambio de peso significativo registrado
- Usuario completa racha importante

#### `manual` - Eduard Ejecuta
Desde el panel de admin:
```python
{
  "tipo_analisis": "manual",
  "usuarios_analizados": 500,
  "alertas_generadas": 45,
  "mensajes_enviados": 0,
  "duracion_segundos": 8.3
}
```

### Dashboard de Auditoría

Queries útiles:

**Eficiencia del sistema**:
```sql
SELECT
    DATE(fecha_analisis) as fecha,
    SUM(usuarios_analizados) as usuarios,
    SUM(alertas_generadas) as alertas,
    SUM(mensajes_enviados) as mensajes,
    AVG(duracion_segundos) as tiempo_promedio
FROM historial_analisis
WHERE fecha_analisis >= DATE_SUB(NOW(), INTERVAL 30 DAY)
GROUP BY DATE(fecha_analisis);
```

**Detección de errores**:
```sql
SELECT * FROM historial_analisis
WHERE errores IS NOT NULL
ORDER BY fecha_analisis DESC;
```

---

## 6. Diagrama de Relaciones

```
┌─────────────────────┐
│      usuarios       │
│─────────────────────│
│ id (PK)             │
│ nombre              │◄─────┐
│ apellido            │      │
│ peso_actual         │      │
│ ultima_asistencia   │      │
└─────────────────────┘      │
         │                   │
         │ 1:N               │
    ┌────┴─────┬────────────┬┴────────┬───────────┐
    │          │            │         │           │
    ↓          ↓            ↓         ↓           ↓
┌─────────┐ ┌─────────┐ ┌────────┐ ┌──────────┐ ┌──────────┐
│ logros  │ │conver..│ │alertas_│ │metricas_ │ │asist...  │
│         │ │saciones│ │ osnes  │ │ usuario  │ │          │
│─────────│ │─────────│ │────────│ │──────────│ │──────────│
│usuario_ │ │usuario_ │ │usuario_│ │usuario_id│ │usuario_id│
│  id(FK) │ │  id(FK) │ │  id(FK)│ │   (PK/FK)│ │   (FK)   │
│tipo_    │ │mensaje_ │ │tipo_   │ │racha_    │ │fecha     │
│  logro  │ │ usuario │ │ alerta │ │  actual  │ │hora_entr.│
│titulo   │ │respuesta│ │prior...│ │total_    │ │hora_sal. │
│valor    │ │  _bot   │ │razon   │ │  asist..│ │          │
│notific..│ │es_trigg.│ │accion_ │ │tasa_resp.│ │          │
│         │ │fue_resp.│ │ sugeri.│ │          │ │          │
└─────────┘ └─────────┘ └────────┘ └──────────┘ └──────────┘
                                         │
                                         │ Se actualiza con
                                         ↓
                            ┌──────────────────────┐
                            │ config_sistema       │
                            │──────────────────────│
                            │ modo                 │
                            │ max_mensajes_auto... │
                            │ dias_ausencia_urge.. │
                            │ rachas_notificar     │
                            │ hora_analisis_diario │
                            └──────────────────────┘

┌──────────────────────┐
│ historial_analisis   │  (Tabla de auditoría)
│──────────────────────│
│ fecha_analisis       │
│ tipo_analisis        │
│ usuarios_analizados  │
│ alertas_generadas    │
│ mensajes_enviados    │
│ duracion_segundos    │
└──────────────────────┘
```

---

## 7. Flujos de Trabajo

### 7.1 Flujo Diario Automático

```
08:00 AM - Job Cron se dispara
    │
    ↓
1. Leer config_sistema
    - modo: "balanceado"
    - dias_ausencia_urgente: 7
    - rachas_notificar: "7,30,60,90,180"
    │
    ↓
2. Actualizar metricas_usuario (todos los usuarios)
    - Recalcular rachas
    - Actualizar días desde última visita
    - Calcular tasa de respuesta
    │
    ↓
3. Análisis de Usuarios (según modo)
    │
    ├─ 🔴 URGENTES
    │   Query: racha_maxima > 30 AND dias_desde_ultima_visita >= 7
    │   │
    │   ↓
    │   Generar alerta_osnes:
    │   {
    │     tipo: "urgente",
    │     prioridad: 5,
    │     accion_sugerida: "audio_reconexion_urgente"
    │   }
    │   │
    │   ↓
    │   Si config.notificar_urgentes = TRUE:
    │       Enviar notificación a Eduard (WhatsApp/Email)
    │
    ├─ 🟡 OPORTUNIDADES
    │   Query: racha_actual IN (7,30,60,90,180) AND NOT EXISTS alerta reciente
    │   │
    │   ↓
    │   Generar alerta_osnes:
    │   {
    │     tipo: "oportunidad",
    │     prioridad: 4,
    │     accion_sugerida: "audio_celebracion"
    │   }
    │
    └─ 🔵 SEGUIMIENTOS
        Query: dias_desde_ultima_visita = 3 AND racha_actual > 0
        │
        ↓
        Generar alerta_osnes:
        {
          tipo: "seguimiento",
          prioridad: 2,
          accion_sugerida: "mensaje_motivacional"
        }
    │
    ↓
4. Mensajes Automáticos (si modo != conservador)
    │
    ↓
    Filtrar usuarios elegibles:
    - No han recibido mensaje automático en los últimos X días
    - No superan max_mensajes_auto_semana
    - Están dentro del horario permitido
    │
    ↓
    Enviar mensajes vía bot (Claude)
    │
    ↓
5. Guardar en historial_analisis
    {
      tipo: "diario",
      usuarios_analizados: 234,
      alertas_generadas: 12,
      mensajes_enviados: 8,
      duracion_segundos: 4.5
    }
```

### 7.2 Flujo de Evento (Asistencia Registrada)

```
Cliente marca asistencia en el gym
    │
    ↓
INSERT INTO asistencias (usuario_id, fecha, hora_entrada)
    │
    ↓
TRIGGER: actualizar_metricas_tras_asistencia
    │
    ├─ UPDATE metricas_usuario SET
    │   total_asistencias = total_asistencias + 1,
    │   ultima_asistencia = NOW(),
    │   dias_desde_ultima_visita = 0,
    │   racha_actual = calcular_racha(usuario_id)
    │
    ↓
Verificar si completó racha notificable
    │
    ↓
    SI racha_actual IN (7,30,60,90,180):
    │
    ├─ Generar alerta_osnes:
    │   {
    │     tipo: "oportunidad",
    │     prioridad: 4,
    │     razon: "Juan completó 30 días consecutivos",
    │     accion_sugerida: "audio_celebracion"
    │   }
    │
    └─ Si no existe logro previo:
        INSERT INTO logros (usuario_id, tipo_logro, valor)
        VALUES (usuario_id, 'racha', 30)
    │
    ↓
Verificar si venía ausente (dias_desde_ultima_visita > 3)
    │
    ↓
    SI dias_previos > 3:
    │
    └─ Marcar alerta_osnes previa como "atendida"
        UPDATE alertas_osnes SET
          estado = 'atendida',
          resultado = 'reactivado',
          fecha_atencion = NOW()
        WHERE usuario_id = X AND estado = 'pendiente'
```

### 7.3 Flujo de Respuesta del Usuario

```
Usuario responde mensaje del bot (WhatsApp)
    │
    ↓
Webhook recibe mensaje
    │
    ↓
Identificar conversacion original
    │
    ↓
UPDATE conversaciones SET
  fue_respondido = TRUE,
  fecha_respuesta = NOW()
WHERE id = conversacion_id
    │
    ↓
UPDATE metricas_usuario SET
  total_mensajes_respondidos = total_mensajes_respondidos + 1,
  tasa_respuesta = total_mensajes_respondidos / total_mensajes_recibidos,
  ultima_respuesta = NOW()
WHERE usuario_id = X
    │
    ↓
Generar alerta_osnes:
{
  tipo: "seguimiento",
  prioridad: 3,
  razon: "María respondió al mensaje automático",
  accion_sugerida: "responder_conversacion",
  contexto_json: {
    "mensaje_original": "¿Cómo vas con tu objetivo?",
    "respuesta_usuario": "Voy bien pero me cuesta la constancia",
    "sentimiento": "neutral_positivo"
  }
}
    │
    ↓
Si config.notificar_seguimientos = TRUE:
    Notificar a Eduard que hay conversación pendiente
```

### 7.4 Flujo de Intervención Manual (Eduard)

```
Eduard abre panel de alertas
    │
    ↓
Query: SELECT * FROM alertas_osnes
       WHERE estado = 'pendiente'
       ORDER BY prioridad DESC, timestamp ASC
    │
    ↓
Ve alerta urgente:
{
  usuario: "María López",
  tipo: "urgente",
  razon: "45 días racha, 5 días ausente, boda en 2 meses",
  accion_sugerida: "audio_reconexion_urgente",
  puntos_clave: [
    "Boda en 2 meses",
    "Mejor racha personal",
    "Perdió 8.5kg",
    "Respondía siempre"
  ]
}
    │
    ↓
Eduard decide: "Voy a enviarle audio"
    │
    ↓
Marca alerta como "atendida":
UPDATE alertas_osnes SET
  estado = 'atendida',
  fecha_atencion = NOW(),
  notas_osnes = 'Envié audio preguntando qué pasó, recordé su boda'
WHERE id = alerta_id
    │
    ↓
Eduard envía audio personalizado por WhatsApp
    │
    ↓
UPDATE metricas_usuario SET
  ultima_intervencion_osnes = NOW()
WHERE usuario_id = maria.id
    │
    ↓
[Días después] María vuelve al gym
    │
    ↓
UPDATE alertas_osnes SET
  resultado = 'reactivado'
WHERE id = alerta_id
```

---

## 8. Queries Útiles

### 8.1 Dashboard de Alertas (Vista de Eduard)

```sql
-- Alertas pendientes por prioridad
SELECT
    a.id,
    u.nombre,
    u.apellido,
    a.tipo_alerta,
    a.prioridad,
    a.razon,
    a.accion_sugerida,
    a.puntos_clave,
    a.timestamp,
    m.racha_actual,
    m.dias_desde_ultima_visita,
    m.tasa_respuesta
FROM alertas_osnes a
JOIN usuarios u ON a.usuario_id = u.id
LEFT JOIN metricas_usuario m ON u.id = m.usuario_id
WHERE a.estado = 'pendiente'
ORDER BY a.prioridad DESC, a.timestamp ASC
LIMIT 20;
```

### 8.2 Usuarios en Riesgo Alto

```sql
-- Clientes con racha alta que están desapareciendo
SELECT
    u.id,
    u.nombre,
    u.apellido,
    m.racha_maxima,
    m.dias_desde_ultima_visita,
    m.tasa_respuesta,
    COUNT(a.id) as alertas_pendientes
FROM usuarios u
JOIN metricas_usuario m ON u.id = m.usuario_id
LEFT JOIN alertas_osnes a ON u.id = a.usuario_id AND a.estado = 'pendiente'
WHERE m.racha_maxima > 20
  AND m.dias_desde_ultima_visita >= 3
  AND u.activo = TRUE
GROUP BY u.id
ORDER BY m.racha_maxima DESC, m.dias_desde_ultima_visita DESC;
```

### 8.3 Efectividad de Intervenciones

```sql
-- Tasa de éxito de tus intervenciones
SELECT
    resultado,
    COUNT(*) as total,
    ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 2) as porcentaje
FROM alertas_osnes
WHERE estado = 'atendida'
  AND resultado IS NOT NULL
GROUP BY resultado
ORDER BY total DESC;
```

### 8.4 Usuarios con Mejor Engagement

```sql
-- Top 20 usuarios más comprometidos
SELECT
    u.nombre,
    u.apellido,
    m.racha_actual,
    m.total_asistencias,
    m.tasa_respuesta,
    m.asistencias_mes
FROM metricas_usuario m
JOIN usuarios u ON m.usuario_id = u.id
WHERE u.activo = TRUE
ORDER BY
    m.racha_actual DESC,
    m.tasa_respuesta DESC,
    m.asistencias_mes DESC
LIMIT 20;
```

### 8.5 Análisis de Peso Estancado

```sql
-- Usuarios con progreso de peso estancado
SELECT
    u.nombre,
    u.apellido,
    u.objetivo,
    m.peso_inicial,
    m.cambio_peso_total,
    m.semanas_sin_cambio_peso,
    m.asistencias_mes
FROM metricas_usuario m
JOIN usuarios u ON m.usuario_id = u.id
WHERE m.semanas_sin_cambio_peso >= 3
  AND m.asistencias_mes > 8  -- Viene regularmente
  AND u.objetivo IN ('Perder peso', 'Ganar músculo')
ORDER BY m.semanas_sin_cambio_peso DESC;
```

### 8.6 Conversaciones sin Respuesta

```sql
-- Mensajes que los usuarios ignoraron
SELECT
    u.nombre,
    u.apellido,
    c.mensaje_usuario,
    c.respuesta_bot,
    c.timestamp,
    DATEDIFF(NOW(), c.timestamp) as dias_sin_responder
FROM conversaciones c
JOIN usuarios u ON c.usuario_id = u.id
WHERE c.es_trigger = TRUE
  AND c.fue_respondido = FALSE
  AND c.timestamp >= DATE_SUB(NOW(), INTERVAL 30 DAY)
ORDER BY c.timestamp DESC;
```

---

## 9. Índices Recomendados para Performance

```sql
-- Tabla conversaciones
CREATE INDEX idx_conv_usuario_timestamp ON conversaciones(usuario_id, timestamp DESC);
CREATE INDEX idx_conv_fue_respondido ON conversaciones(fue_respondido) WHERE fue_respondido = FALSE;
CREATE INDEX idx_conv_trigger ON conversaciones(es_trigger, tipo_trigger) WHERE es_trigger = TRUE;

-- Tabla alertas_osnes
CREATE INDEX idx_alert_estado_prioridad ON alertas_osnes(estado, prioridad DESC);
CREATE INDEX idx_alert_usuario_estado ON alertas_osnes(usuario_id, estado);
CREATE INDEX idx_alert_tipo_timestamp ON alertas_osnes(tipo_alerta, timestamp DESC);

-- Tabla metricas_usuario
CREATE INDEX idx_metr_racha ON metricas_usuario(racha_actual, dias_desde_ultima_visita);
CREATE INDEX idx_metr_engagement ON metricas_usuario(tasa_respuesta, total_mensajes_recibidos);

-- Tabla historial_analisis
CREATE INDEX idx_hist_fecha_tipo ON historial_analisis(fecha_analisis DESC, tipo_analisis);
```

---

## 10. Resumen Ejecutivo

### Sistema de 5 Tablas Interconectadas:

1. **conversaciones** (modificada)
   - Añadido tracking de respuestas (`fue_respondido`, `fecha_respuesta`)
   - Permite medir engagement real

2. **logros** (sin cambios)
   - Evita notificaciones duplicadas
   - Historial de achievements

3. **alertas_osnes** (NUEVA) ⭐
   - Sistema de alertas PARA TI
   - Prioriza qué usuarios necesitan atención manual
   - Incluye contexto completo y acción sugerida

4. **metricas_usuario** (NUEVA) ⭐
   - Cache de métricas calculadas
   - Análisis instantáneo sin queries pesados
   - Base para generación de alertas

5. **config_sistema** (NUEVA) ⭐
   - Control centralizado del comportamiento
   - Modos: conservador/balanceado/proactivo
   - Horarios y límites de mensajes

6. **historial_analisis** (NUEVA)
   - Auditoría de ejecuciones
   - Debugging y optimización
   - Métricas de eficiencia del sistema

### Filosofía del Sistema:

🤖 **Bot (Claude)**: Conversaciones y mensajes motivacionales automáticos
👨‍💼 **Eduard**: Intervenciones estratégicas de alto valor en momentos críticos
🎯 **Alertas Inteligentes**: El sistema te dice QUIÉN necesita atención y QUÉ hacer

### Flujo Ideal:

1. Sistema analiza 234 usuarios cada mañana (08:00am)
2. Genera 12 alertas priorizadas
3. Eduard ve alertas y contexto completo
4. Eduard envía 3-4 audios/mensajes personalizados a casos urgentes
5. Bot envía mensajes automáticos a oportunidades/seguimientos
6. Sistema mide resultados y aprende

**Resultado**: Retención alta + Intervención eficiente + Sin spam

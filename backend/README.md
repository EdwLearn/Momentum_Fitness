# Backend - Sistema Integral de Gestión de Gimnasio

## Versión 2.0.0

Sistema completo de gestión de gimnasio con **3 componentes principales**:

1. **Web Dashboard (POS)** - Frontend con Next.js
2. **Backend Central** - API unificada con FastAPI
3. **Bot de Hospitalidad** - Sistema conversacional inteligente con Claude AI

---

## Arquitectura del Sistema

```
┌─────────────────────────────────────────────────────────────┐
│                    WEB DASHBOARD (Next.js)                   │
│  • Gestión de usuarios y membresías                          │
│  • Panel de asistencia y métricas                            │
│  • Chat con el bot                                            │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  │ API REST
                  ▼
┌─────────────────────────────────────────────────────────────┐
│              BACKEND CENTRAL (FastAPI)                       │
├─────────────────────────────────────────────────────────────┤
│  Módulos:                                                     │
│  ├─ Usuarios y Membresías                                    │
│  ├─ Asistencia                                               │
│  ├─ Métricas de Rendimiento                                  │
│  ├─ Bot Conversacional (LangChain + Claude API)              │
│  └─ Computer Vision (preparado para futuro)                  │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  │ SQLAlchemy ORM
                  ▼
┌─────────────────────────────────────────────────────────────┐
│               BASE DE DATOS (PostgreSQL)                     │
│  • usuarios, membresias                                       │
│  • asistencias, metricas                                      │
│  • conversaciones, logros                                     │
└─────────────────────────────────────────────────────────────┘
```

---

## Características Principales

### 🏋️ Gestión de Usuarios y Membresías
- CRUD completo de usuarios (admin, entrenador, cliente)
- Control de membresías (mensual, trimestral, semestral, anual)
- Estados: activa, vencida, suspendida, cancelada
- Seguimiento de peso inicial y actual

### 📊 Métricas y Asistencia
- Registro de entrada/salida con timestamps
- Métricas corporales: peso, medidas, grasa, masa muscular
- Historial de ejercicios realizados (JSON flexible)
- Consultas por fecha y periodo

### 🤖 Bot de Hospitalidad Inteligente

**Características del Bot:**
- Conversación natural con Claude API
- Memoria conversacional por usuario
- Personalización basada en datos del usuario
- Tono cercano y motivador

**Triggers Automáticos:**
- ✅ **Rachas**: 7, 15, 30, 60, 90 días consecutivos
- ⚖️ **Peso**: Cambios de 2kg, 5kg, 10kg
- 😴 **Inactividad**: 3, 7, 14 días sin asistir
- 🏆 **Logros**: Nuevos récords y metas

### 👁️ Computer Vision (Preparado)
- Reconocimiento facial para check-in
- Análisis de posturas
- Conteo de repeticiones
- Análisis de ocupación

---

## Estructura del Proyecto

```
backend/
├── app/
│   ├── core/                          # Configuración central
│   │   ├── config.py                  # Settings y env vars
│   │   ├── database.py                # Conexión a PostgreSQL
│   │   └── triggers/                  # Sistema de triggers
│   │
│   └── modules/                       # Módulos funcionales
│       │
│       ├── usuarios/                  # Gestión de usuarios
│       │   ├── models/
│       │   │   ├── usuario.py
│       │   │   └── membresia.py
│       │   ├── schemas/
│       │   ├── crud/
│       │   └── endpoints/
│       │
│       ├── asistencia/                # Control de asistencia
│       │   ├── models/
│       │   │   └── asistencia.py
│       │   ├── schemas/
│       │   ├── crud/
│       │   └── endpoints/
│       │
│       ├── metricas/                  # Métricas de rendimiento
│       │   ├── models/
│       │   │   └── metrica.py
│       │   ├── schemas/
│       │   ├── crud/
│       │   └── endpoints/
│       │
│       ├── bot/                       # Bot de hospitalidad
│       │   ├── models/
│       │   │   ├── conversacion.py
│       │   │   └── logro.py
│       │   ├── schemas/
│       │   │   └── bot_schemas.py
│       │   ├── langchain/
│       │   │   └── bot_service.py     # Servicio principal del bot
│       │   ├── memory/
│       │   │   └── conversation_memory.py
│       │   ├── triggers/
│       │   │   └── trigger_service.py # Detección de triggers
│       │   └── endpoints/
│       │       └── bot_endpoints.py
│       │
│       └── computer_vision/           # Computer Vision (futuro)
│           ├── README.md
│           └── endpoints/
│               └── cv_endpoints_placeholder.py
│
├── main.py                            # Aplicación principal FastAPI
├── requirements.txt                   # Dependencias
├── .env.example                       # Variables de entorno
└── README.md                          # Este archivo
```

---

## Instalación y Configuración

### 1. Requisitos Previos

- Python 3.10+
- PostgreSQL 14+ (o SQLite para desarrollo)
- API Key de Anthropic (Claude)

### 2. Instalación

```bash
# Clonar el repositorio
cd backend

# Crear entorno virtual
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Instalar dependencias
pip install -r requirements.txt
```

### 3. Configuración de Base de Datos

#### Opción A: PostgreSQL (Producción)

```bash
# Crear base de datos y usuario
psql -U postgres
CREATE DATABASE gimnasio_db;
CREATE USER gimnasio_user WITH PASSWORD 'gimnasio_pass';
GRANT ALL PRIVILEGES ON DATABASE gimnasio_db TO gimnasio_user;
\q
```

#### Opción B: SQLite (Desarrollo)

Comentar la línea de PostgreSQL en `.env` y descomentar SQLite.

### 4. Variables de Entorno

```bash
# Copiar el archivo de ejemplo
cp .env.example .env

# Editar .env con tus configuraciones
nano .env
```

**Configuraciones importantes:**

```env
# Base de datos
DATABASE_URL=postgresql://gimnasio_user:gimnasio_pass@localhost:5432/gimnasio_db

# Claude API
ANTHROPIC_API_KEY=sk-ant-api03-tu-clave-aqui

# Seguridad (generar con: openssl rand -hex 32)
SECRET_KEY=tu-clave-secreta-de-32-caracteres
```

### 5. Inicializar Base de Datos

```bash
# Opción 1: Desde Python
python -c "from app.core.database import init_db; init_db()"

# Opción 2: Con Alembic (recomendado para producción)
alembic init alembic
alembic revision --autogenerate -m "Initial migration"
alembic upgrade head
```

### 6. Ejecutar el Servidor

```bash
# Desarrollo con auto-reload
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Producción
uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4
```

La API estará disponible en: `http://localhost:8000`

---

## API Endpoints

### Documentación Interactiva

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

### Endpoints Principales

#### Usuarios y Membresías

```
POST   /api/usuarios/              # Crear usuario
GET    /api/usuarios/              # Listar usuarios
GET    /api/usuarios/{id}          # Obtener usuario
PUT    /api/usuarios/{id}          # Actualizar usuario
DELETE /api/usuarios/{id}          # Eliminar usuario

POST   /api/membresias/            # Crear membresía
GET    /api/membresias/usuario/{id} # Membresías por usuario
```

#### Asistencia

```
POST   /api/asistencia/            # Registrar asistencia
GET    /api/asistencia/usuario/{id} # Asistencias por usuario
GET    /api/asistencia/fecha/{fecha} # Asistencias por fecha
```

#### Métricas

```
POST   /api/metricas/              # Crear métrica
GET    /api/metricas/usuario/{id}  # Métricas por usuario
GET    /api/metricas/usuario/{id}/tipo/{tipo} # Por tipo
GET    /api/metricas/usuario/{id}/periodo # Por periodo
```

#### Bot de Hospitalidad

```
POST   /api/bot/chat               # Conversación en tiempo real
GET    /api/bot/triggers           # Revisar triggers pendientes
POST   /api/bot/send-motivation    # Enviar mensaje motivacional
GET    /api/bot/history/{usuario_id} # Historial de conversaciones
POST   /api/bot/clear-memory/{usuario_id} # Limpiar memoria
```

#### Computer Vision (Futuro)

```
GET    /api/cv/status              # Estado del módulo CV
```

---

## Uso del Bot de Hospitalidad

### Conversación en Tiempo Real

```python
import requests

response = requests.post(
    "http://localhost:8000/api/bot/chat",
    json={
        "usuario_id": 1,
        "mensaje": "Hola! ¿Cómo puedo mejorar mi rutina de pecho?",
        "sesion_id": "session_123"
    }
)

print(response.json())
```

### Revisar Triggers Pendientes

```python
response = requests.get("http://localhost:8000/api/bot/triggers")

triggers = response.json()
print(f"Triggers pendientes: {triggers['total_triggers']}")

for trigger in triggers['triggers']:
    print(f"Usuario {trigger['usuario_id']}: {trigger['tipo']}")
```

### Enviar Mensaje Motivacional

```python
response = requests.post(
    "http://localhost:8000/api/bot/send-motivation",
    json={
        "usuario_id": 1,
        "tipo": "racha",
        "contexto": {"dias": 7}
    }
)

print(response.json()['mensaje'])
```

---

## Base de Datos

### Modelos Principales

#### Usuario
```python
- id: int
- nombre, apellido, email, telefono
- tipo: admin | entrenador | cliente
- peso_inicial, peso_actual, altura
- fecha_registro, fecha_nacimiento
- ultima_asistencia
```

#### Asistencia
```python
- id: int
- usuario_id: foreign key
- fecha, hora_entrada, hora_salida
- timestamp_entrada, timestamp_salida
- notas
```

#### Metrica
```python
- id: int
- usuario_id: foreign key
- tipo: peso | medidas | grasa_corporal | etc.
- valor, unidad
- medidas: JSON (pecho, cintura, etc.)
- ejercicios_realizados: JSON
- fecha, notas
```

#### Conversacion
```python
- id: int
- usuario_id: foreign key
- mensaje_usuario, respuesta_bot
- timestamp, sesion_id
- es_trigger, tipo_trigger
```

#### Logro
```python
- id: int
- usuario_id: foreign key
- tipo_logro: racha | peso | ejercicio | etc.
- titulo, descripcion, valor
- fecha, notificado
```

---

## Sistema de Triggers

El bot detecta automáticamente:

### Rachas de Asistencia
- 7, 15, 30, 60, 90 días consecutivos
- Celebra con mensajes entusiastas

### Cambios de Peso
- Pérdida/ganancia de 2kg, 5kg, 10kg
- Felicita el progreso

### Inactividad
- 3, 7, 14 días sin asistir
- Envía recordatorios amigables

### Logros
- Nuevos récords personales
- Metas alcanzadas

---

## Tecnologías Utilizadas

### Backend Core
- **FastAPI** 0.115.6 - Framework web moderno
- **SQLAlchemy** 2.0.36 - ORM para base de datos
- **PostgreSQL** - Base de datos principal
- **Pydantic** 2.10.5 - Validación de datos

### IA y Bot
- **LangChain** 0.3.13 - Framework para LLMs
- **LangChain-Anthropic** 0.3.3 - Integración con Claude
- **Anthropic** 0.42.0 - SDK de Claude API

### Utilidades
- **Uvicorn** - Servidor ASGI
- **Alembic** - Migraciones de base de datos
- **Python-dotenv** - Gestión de variables de entorno

---

## Desarrollo y Testing

### Ejecutar en Modo Debug

```bash
# Ver queries SQL
# En app/core/database.py, cambiar: echo=True

uvicorn main:app --reload --log-level debug
```

### Testing (Próximamente)

```bash
pip install pytest pytest-asyncio httpx
pytest tests/
```

---

## Roadmap

### Fase Actual (v2.0) ✅
- [x] Arquitectura modular
- [x] Bot con Claude API
- [x] Sistema de triggers
- [x] PostgreSQL
- [x] Modelos completos

### Próximas Fases

**v2.1**
- [ ] Autenticación JWT
- [ ] Migraciones con Alembic
- [ ] Tests unitarios

**v2.2**
- [ ] WebSockets para chat en tiempo real
- [ ] Notificaciones push
- [ ] Exportación de reportes

**v3.0**
- [ ] Computer Vision
- [ ] Reconocimiento facial
- [ ] Análisis de posturas

---

## Contribución

Este es un proyecto en desarrollo activo. Para contribuir:

1. Fork del repositorio
2. Crear una rama feature
3. Commit de cambios
4. Push a la rama
5. Abrir un Pull Request

---

## Licencia

Proyecto privado - Todos los derechos reservados

---

## Soporte

Para preguntas o problemas:
- Documentación: http://localhost:8000/docs
- Issues: GitHub Issues

---

## Autores

- Sistema desarrollado para gestión integral de gimnasios
- Bot de hospitalidad powered by Claude AI (Anthropic)

---

**Versión**: 2.0.0
**Última actualización**: Diciembre 2024

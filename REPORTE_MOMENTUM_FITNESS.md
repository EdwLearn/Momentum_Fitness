# Reporte Momentum Fitness

## 1. Descripción General

**Momentum Fitness** es un sistema integral de gestión de gimnasio que combina:
- Frontend: Next.js 16 con React 19, TypeScript y Tailwind CSS
- Backend: FastAPI (Python) con PostgreSQL
- IA: Bot de hospitalidad con Claude 3.5 Sonnet (LangChain + Anthropic API)

**Versión actual**: 2.0.0
**Estado**: Activo y funcional
**Deployment**: Vercel

---

## 2. Módulos y Funcionalidades

### 2.1 Gestión de Clientes
- **CRUD completo** de usuarios/clientes
- Registro con datos personales y fitness (peso, altura, objetivo, género)
- Sistema de **referidos** con tracking
- **Historial de peso** con mediciones corporales (circunferencias)
- **Visualización de progreso** individual

### 2.2 Membresías y Planes
**6 tipos de planes disponibles**:
- Pase Diario
- Pase Flex
- Mensual
- Plan 3 Meses
- Plan 6 Meses
- Elite Anual

**Estados**: Activa, Vencida, Suspendida, Cancelada
**Métodos de pago**: Efectivo, Tarjeta, Transferencia, Nequi, Daviplata, Otro

### 2.3 Control de Asistencia
- Registro de **entrada/salida** de clientes
- Tracking de **días entrenados**
- **Asistencia de empleados** con cálculo de horas trabajadas
- Detección automática de rachas

### 2.4 Empleados
- Gestión de entrenadores y recepcionistas
- Control de **horarios y días laborales**
- Registro de **salarios** y datos laborales
- **Contactos de emergencia**

### 2.5 Cupones y Descuentos
**Nichos**:
- Alimenticio
- Estético

**Features**:
- Códigos promocionales
- Seguimiento de usos (total y por año)
- Fecha de expiración
- Estado activo/inactivo

### 2.6 Dashboard y Reportes
**Métricas en tiempo real**:
- Clientes activos (vs mes anterior)
- Asistencias del día (vs día anterior)
- Planes por vencer (próximos 7 días)
- Ingresos del mes (vs mes anterior)

**Visualizaciones**:
- Gráfica de barras: Asistencia semanal
- Gráfica circular: Distribución de planes activos
- Tabla: Próximas renovaciones
- Tabla: Estado de empleados

### 2.7 Bot de Hospitalidad (IA)
**Modelo**: Claude 3.5 Sonnet
**Personalidad**: Amigable, motivador, coach personal

**Capacidades**:
1. **Chat conversacional** con memoria por usuario
2. **Mensajes motivacionales automáticos** (triggers)
3. **Seguimiento personalizado** de progreso

---

## 3. Sistema de Mensajes del Bot

### 3.1 Arquitectura de Mensajes

```
Usuario → Frontend → API /bot/chat → GymBotService → Claude API → Respuesta
                                            ↓
                                    Base de datos
                                    (Conversación)
```

### 3.2 Tipos de Mensajes

#### A) Mensajes de Chat Directo
**Endpoint**: `POST /api/bot/chat`

**Flujo**:
1. Usuario envía mensaje
2. Bot obtiene contexto del usuario (peso, última asistencia, progreso)
3. Carga memoria conversacional previa
4. Genera respuesta personalizada con Claude
5. Guarda conversación en BD

**Estructura del mensaje**:
```typescript
Request: {
  usuario_id: number
  mensaje: string
  sesion_id?: string (opcional)
}

Response: {
  usuario_id: number
  mensaje: string
  respuesta: string
  timestamp: string (ISO)
}
```

#### B) Mensajes Motivacionales (Triggers Automáticos)
**Endpoint**: `POST /api/bot/send-motivation`

**Triggers detectados**:

| Tipo | Condición | Ejemplo |
|------|-----------|---------|
| **Racha** | 7, 15, 30, 60, 90 días consecutivos | "¡Felicidades! 30 días sin parar" |
| **Peso** | Cambio de 2kg, 5kg, 10kg | "¡Has perdido 5kg! Increíble progreso" |
| **Inactividad** | 3, 7, 14 días sin asistir | "Te extrañamos, ¿cómo has estado?" |
| **Logro** | Logro personalizado | "¡Completaste tu primera rutina!" |

**Estructura del mensaje**:
```typescript
Request: {
  usuario_id: number
  tipo: "racha" | "peso" | "inactividad" | "logro"
  contexto: {
    dias?: number
    cambio_kg?: number
    dias_sin_asistir?: number
    descripcion?: string
  }
}

Response: {
  usuario_id: number
  tipo: string
  mensaje: string (generado por Claude)
  timestamp: string
}
```

### 3.3 Prompt del Sistema (Bot)

```
Personalidad:
- Cercano y motivador (amigo coach)
- Entusiasta con logros
- Apoyo en momentos de desmotivación
- Tono informal pero respetuoso
- Positivo y alentador

Rol:
- Mantener motivación
- Celebrar rachas y logros
- Seguimiento de peso y métricas
- Recordar objetivos personales
- Consejos sobre rutinas

Contexto personalizado:
- Nombre del usuario
- Peso inicial vs actual
- Última asistencia
- Días desde última visita
```

### 3.4 Sistema de Memoria

**Memoria por usuario**:
- Cada usuario tiene su `ConversationBufferMemory`
- Persiste el historial de chat en memoria caché
- Se guarda en BD para permanencia

**Endpoints de memoria**:
- `GET /api/bot/history/{usuario_id}?limit=10` - Obtener historial
- `POST /api/bot/clear-memory/{usuario_id}` - Resetear contexto

### 3.5 Composición de Mensajes

#### Mensaje de Chat con Contexto:
```python
Prompt = [
  SystemMessage(
    "Eres GymBot, asistente personal de gimnasio...

    Contexto del usuario:
    Nombre: Juan Pérez
    Peso inicial: 85kg, Peso actual: 80kg (ha perdido 5kg)
    Última asistencia: hace 2 días
    "
  ),
  ChatHistory([...mensajes previos...]),
  HumanMessage("¿Qué ejercicios me recomiendas?")
]

→ Claude API → Respuesta contextualizada
```

#### Mensaje Motivacional (Trigger):
```python
Prompt = "Genera un mensaje celebrando que Juan ha completado
30 días consecutivos de asistencia al gimnasio.
Sé entusiasta y motivador."

→ Claude API → "¡Juan! 🎉 ¡30 días seguidos entrenando!
Esto es disciplina de verdad. Tu constancia está
transformando tu cuerpo y tu mente..."
```

### 3.6 Base de Datos de Conversaciones

**Modelo Conversacion**:
```sql
id: int (PK)
usuario_id: int (FK)
mensaje_usuario: string
respuesta_bot: string
sesion_id: string (nullable)
es_trigger: boolean
tipo_trigger: string (nullable)
fecha_hora: datetime
```

**Modelo Logro**:
```sql
id: int (PK)
usuario_id: int (FK)
tipo_logro: string (racha/peso/otro)
descripcion: string
valor: float
fecha_logro: datetime
notificado: boolean
```

---

## 4. Stack Tecnológico

### Frontend
- **Framework**: Next.js 16 (App Router)
- **UI**: React 19, TypeScript
- **Styling**: Tailwind CSS v4, tailwindcss-animate
- **Components**: Radix UI (Accordion, Dialog, Select, Toast, etc.)
- **Charts**: Recharts
- **Forms**: React Hook Form + Zod
- **Data Fetching**: TanStack Query (React Query)
- **PDF Export**: jsPDF + jsPDF-AutoTable

### Backend
- **Framework**: FastAPI 0.115.6
- **Server**: Uvicorn
- **Database**: PostgreSQL (SQLAlchemy 2.0.36)
- **Migrations**: Alembic 1.14.0
- **Validation**: Pydantic 2.10.5
- **AI**: LangChain 0.3.13 + Anthropic 0.42.0
- **Date Utils**: python-dateutil, pytz

### IA y LangChain
- **Model**: Claude 3.5 Sonnet (claude-3-5-sonnet-20241022)
- **Temperature**: 0.7
- **Max Tokens**: 1024
- **Memory**: ConversationBufferMemory
- **Chain**: ConversationChain

---

## 5. Arquitectura de Comunicación

```
┌─────────────────┐
│   Next.js App   │  (Frontend - React 19)
│   Port: 3000    │
└────────┬────────┘
         │ HTTP/Axios
         │ @tanstack/react-query
         ↓
┌─────────────────┐
│   FastAPI API   │  (Backend - Python)
│   Port: 8000    │
└────────┬────────┘
         │
    ┌────┴────┐
    ↓         ↓
┌─────────┐ ┌──────────────┐
│PostgreSQL│ │ Claude API   │
│ Database│ │ (Anthropic)  │
└─────────┘ └──────────────┘
```

### Endpoints Principales del Bot:
- `POST /api/bot/chat` - Chat directo
- `GET /api/bot/triggers` - Obtener triggers pendientes
- `POST /api/bot/send-motivation` - Enviar mensaje motivacional
- `GET /api/bot/history/{usuario_id}` - Historial de conversaciones
- `POST /api/bot/clear-memory/{usuario_id}` - Limpiar memoria

---

## 6. Flujo de Datos: Ejemplo Completo

### Escenario: Usuario completa 30 días de racha

```
1. Cliente marca asistencia
   → POST /api/asistencia (frontend → backend)

2. Backend actualiza días_entrenados
   → Usuario.dias_entrenados = 30

3. Sistema detecta trigger
   → GET /api/bot/triggers
   → Responde: {tipo: "racha", contexto: {dias: 30}}

4. Frontend/Backend envía mensaje motivacional
   → POST /api/bot/send-motivation
   → Request: {usuario_id: 123, tipo: "racha", contexto: {dias: 30}}

5. Bot genera mensaje con Claude
   → Prompt: "Celebra 30 días consecutivos de Juan..."
   → Claude API → Respuesta motivacional

6. Se guarda en BD
   → Conversacion(es_trigger=true, tipo_trigger="racha")
   → Logro(tipo="racha", valor=30, notificado=true)

7. Frontend muestra notificación
   → Toast/Modal con mensaje del bot
```

---

## 7. Características Destacadas

### 7.1 Personalización con IA
- Cada mensaje considera el **contexto individual** del usuario
- **Memoria conversacional** mantiene coherencia
- **Triggers automáticos** sin intervención manual

### 7.2 Métricas y Analytics
- Dashboard con **comparativas temporales**
- **Visualizaciones interactivas** (barras, pie charts)
- **Filtros avanzados** en tablas

### 7.3 Sistema de Referidos
- Tracking de quién refirió a quién
- Estado de cumplimiento de condiciones
- Beneficios otorgados

### 7.4 Gestión Completa de Datos
- **CRUD** completo en todos los módulos
- **Validación** con Pydantic y Zod
- **Type-safe** con TypeScript

---

## 8. Estado del Proyecto (según commits)

**Última versión**: V.6
**Estado**: Completo y funcional
**Pendiente**:
- Historial de cliente (en progreso)
- Sistema de notificaciones (planificado)

**Commits recientes**:
- `a616c73` - V.6 Completo todo, falta agregar historial de cliente y notificaciones
- `b3413bc` - V.5 Todo limpio y funcionando, solo falta nots y soporte
- `1dd0de3` - V.5 Limpio y funcional todo, solo falta soporte y notificaciones

---

## 9. Configuración

### Variables de entorno necesarias:
```env
# Backend (.env)
DATABASE_URL=postgresql://user:pass@localhost/momentum_fitness
ANTHROPIC_API_KEY=sk-ant-...
PROJECT_NAME=Momentum Fitness
VERSION=2.0.0
BOT_NAME=GymBot
BOT_MODEL=claude-3-5-sonnet-20241022

# Frontend (.env.local)
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## 10. Conclusión

Momentum Fitness es una **solución completa** de gestión de gimnasio con:
- ✅ Sistema de gestión robusto (clientes, empleados, membresías)
- ✅ Bot de IA conversacional y proactivo
- ✅ Analytics y reportes en tiempo real
- ✅ UX moderna y responsive
- ✅ Arquitectura escalable y type-safe

El sistema de mensajes del bot está diseñado para ser:
- **Contextual**: Conoce al usuario y su progreso
- **Proactivo**: Genera mensajes automáticos en momentos clave
- **Conversacional**: Mantiene memoria de interacciones previas
- **Motivador**: Personalidad diseñada para impulsar al usuario

**Tecnologías clave**: Next.js, FastAPI, PostgreSQL, Claude API, LangChain

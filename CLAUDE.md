# Momentum Fitness - Guía del Proyecto para Claude

> Documento de referencia completo para el desarrollo continuo del proyecto Momentum Fitness.
> Última actualización: 2026-03-09

---

## 1. PROPÓSITO DEL PROYECTO

**Momentum Fitness** es un sistema integral de gestión de gimnasio. Permite administrar:
- Membresías y planes de suscripción
- Registro de asistencia (check-in/check-out)
- Métricas y progreso de usuarios
- Programa de referidos
- Cupones de descuento
- Tickets de soporte
- Gestión de empleados
- Reportes y dashboard de estadísticas

---

## 2. STACK TECNOLÓGICO

### Backend
- **Framework:** FastAPI 0.115.6 (Python, async)
- **Servidor:** Uvicorn 0.34.0 (ASGI)
- **ORM:** SQLAlchemy 2.0.36
- **Base de datos:** SQLite (dev) / PostgreSQL (prod)
- **Migraciones:** Alembic 1.14.0
- **Validación:** Pydantic 2.10.5 + Pydantic-Settings
- **LLM (configurado, parcialmente deshabilitado):** LangChain + Anthropic SDK + Ollama
- **WhatsApp:** httpx (integración deshabilitada actualmente)
- **Zona horaria:** Colombia UTC-5 (pytz)

### Frontend
- **Framework:** Next.js 16.1.6 (React 19.2.0, App Router)
- **Lenguaje:** TypeScript
- **Estilos:** Tailwind CSS 4.1.9
- **Componentes UI:** Radix UI (primitivos accesibles)
- **Formularios:** React Hook Form 7.60.0
- **Data fetching:** Axios 1.13.2 + TanStack React Query 5.90.12
- **Gráficos:** Recharts 2.15.4
- **Fechas:** date-fns 4.1.0
- **Notificaciones:** Sonner 1.7.4 (toasts)
- **Iconos:** Lucide React 0.454.0
- **Exportación:** `output: 'export'` (sitio estático servido por Nginx)

### Infraestructura
- **Docker Compose:** backend FastAPI + frontend Nginx
- **Nginx:** reverse proxy + static files
- **Puertos:** Backend en 8000 (dev 8002), Frontend en 3000 → Nginx en 80

---

## 3. ESTRUCTURA DE DIRECTORIOS

```
/home/edwlearn/momentum/
├── backend/                          # FastAPI Python backend
│   ├── main.py                       # Entry point, registro de routers, lifespan
│   ├── requirements.txt
│   ├── Dockerfile
│   └── app/
│       ├── core/
│       │   ├── config.py             # Settings, DATABASE_URL, env vars
│       │   ├── database.py           # SQLAlchemy engine, session factory, init_db
│       │   ├── llm_config.py         # Config para Ollama/Claude API
│       │   └── email.py              # Servicio de email
│       ├── api/
│       │   └── endpoints/            # Routers FastAPI (legacy, algunos movidos a modules)
│       ├── modules/                  # Módulos de dominio (estructura preferida)
│       │   ├── usuarios/             # Gestión de usuarios
│       │   ├── asistencia/           # Registro de asistencia
│       │   ├── metricas/             # Métricas de progreso
│       │   ├── empleados/            # Empleados
│       │   ├── bot/                  # Bot de hospitalidad (deshabilitado)
│       │   ├── whatsapp/             # WhatsApp (deshabilitado)
│       │   └── computer_vision/      # CV (placeholder)
│       ├── crud/                     # Operaciones DB (get, create, update)
│       ├── schemas/                  # Schemas Pydantic para validación
│       ├── models/                   # Modelos ORM (algunos son proxies a modules/)
│       └── services/                 # Lógica de negocio
│
├── app/                              # Next.js App Router (páginas)
│   ├── page.tsx                      # Página principal: dashboard + check-in asistencia
│   ├── layout.tsx                    # Layout raíz con sidebar
│   ├── asistencia/                   # Módulo asistencia
│   ├── clientes/                     # Gestión clientes
│   ├── suscripciones/                # Vista suscripciones
│   ├── dashboard/                    # Dashboard analítico
│   ├── reportes/                     # Reportes
│   ├── cupones/                      # Gestión cupones
│   ├── empleados/                    # Empleados
│   ├── configuracion/                # Configuración del sistema
│   ├── soporte/                      # Tickets de soporte
│   └── notificaciones/               # Notificaciones
│
├── components/                       # Componentes React reutilizables
│   ├── ui/                           # Componentes Radix UI (Button, Card, Dialog, etc.)
│   ├── dashboard-layout.tsx          # Layout principal con navegación
│   ├── metric-card.tsx               # Tarjeta KPI
│   ├── chart-card.tsx                # Contenedor de gráficos
│   ├── data-table.tsx                # Tabla paginada
│   └── protected-route.tsx           # Protección de rutas
│
├── lib/                              # Utilidades del cliente
│   ├── api.ts                        # Instancia Axios + interceptores
│   ├── utils.ts                      # cn() helper (clsx + twMerge)
│   ├── providers.tsx                 # Context providers (React Query)
│   ├── mock-data.ts                  # Datos mock para desarrollo
│   ├── services/                     # Capa de servicios API
│   │   ├── usuarios.ts
│   │   ├── membresias.ts
│   │   ├── asistencia.ts
│   │   ├── dashboard.ts
│   │   └── reportes.ts
│   └── hooks/                        # Custom React hooks
│       ├── useUsuarios.ts
│       ├── useMembresias.ts
│       └── useAsistencia.ts
│
├── types/
│   └── index.ts                      # Todas las interfaces TypeScript centralizadas
│
├── package.json                      # Dependencias frontend + scripts npm
├── next.config.mjs                   # Next.js config (static export)
├── tailwind.config.js
├── tsconfig.json
├── docker-compose.yml
├── Dockerfile                        # Frontend (Node build → Nginx)
├── nginx.conf
├── start-momentum.sh                 # Script inicio desarrollo
└── CLAUDE.md                         # Este archivo
```

---

## 4. MODELOS DE BASE DE DATOS

### USUARIOS
```python
id, nombre, apellido, cedula (unique+indexed), email (unique+indexed),
telefono, tipo (admin|entrenador|usuario), peso_inicial, peso_actual, altura,
objetivo, genero, dias_entrenados, referido_por_cedula,
activo, fecha_registro, fecha_nacimiento, ultima_asistencia
```

### MEMBRESIAS
```python
id, usuario_id (FK), tipo_plan (enum), estado (activa|vencida|suspendida|cancelada),
fecha_inicio, fecha_fin (indexed), precio, precio_original, precio_final,
duracion_dias, visitas_disponibles (nullable - para pase_flex),
referido_por_id (FK), tipo_pago (efectivo|tarjeta|transferencia|nequi|daviplata),
activo
```

**Planes disponibles:** `pase_diario, pase_flex, mensual, estudiante, plan_3_meses, plan_6_meses, elite_anual, socio, cortesia`

**Lógica `esta_activa()`:**
```python
vigente = activo AND estado == "activa" AND fecha_fin >= now_colombia
if vigente and visitas_disponibles is not None:
    return visitas_disponibles > 0
return vigente
```

### ASISTENCIAS
```python
id, usuario_id (FK+indexed), fecha (indexed), hora_entrada, hora_salida,
timestamp_entrada, timestamp_salida, notas
```
**Regla:** Una sola asistencia por usuario por día.

### CUPONES
```python
id, codigo (unique+indexed), nicho (Alimenticio|Estético),
descuento (1-25%), usos_total, usos_anio, activo (indexed),
fecha_creacion, fecha_expiracion
```

### REFERIDOS
```python
id, referidor_id (FK+indexed), referido_id (FK+indexed), membresia_id (FK),
cumple_condicion, beneficio ("1 mes gratis"), fecha_referido, fecha_activacion
```
**Regla:** 3 referidos activos = 1 mes gratis para el referidor.
Solo planes de larga duración pueden referir (no pase_diario, pase_flex).

### METRICAS
Seguimiento de peso y progreso de usuarios.

### TICKETS_SOPORTE
```python
id, nombre, asunto, mensaje, categoria (technical|billing|feature|other),
prioridad (low|medium|high|urgent), estado (Abierto|En progreso|Resuelto),
created_at, updated_at
```

### EMPLEADOS / ASISTENCIA_EMPLEADO
Información básica de empleados y control de turnos.

### CONFIGURACION_GIMNASIO
Configuración y preferencias del gimnasio.

---

## 5. API ENDPOINTS

**Base URL:** `http://localhost:8000` (dev) / `http://localhost:8002` (alt dev)

### Usuarios
```
POST   /api/usuarios/
GET    /api/usuarios/
GET    /api/usuarios/{id}
PUT    /api/usuarios/{id}
DELETE /api/usuarios/{id}
GET    /api/usuarios/buscar-cedula/{cedula}
GET    /api/usuarios/buscar-cedula-asistencia/{cedula}
GET    /api/usuarios/estadisticas-referidos/{cedula}
```

### Membresías
```
POST   /api/membresias/
GET    /api/membresias/
GET    /api/membresias/{id}
PUT    /api/membresias/{id}
DELETE /api/membresias/{id}
GET    /api/membresias/usuario/{usuario_id}
GET    /api/membresias/stats
```

### Asistencia
```
POST   /api/asistencia/
GET    /api/asistencia/
GET    /api/asistencia/usuario/{usuario_id}
GET    /api/asistencia/fecha/{fecha}
GET    /api/asistencia/{id}
PUT    /api/asistencia/{id}
DELETE /api/asistencia/{id}
GET    /api/asistencia/estadisticas/promedio-diario
GET    /api/asistencia/estadisticas/usuarios-inactivos
```

### Otros módulos
```
POST/GET  /api/metricas/
POST/GET  /api/cupones/
POST/GET  /api/referidos/
POST/GET  /api/empleados/
POST/GET  /api/asistencia-empleados/
GET       /api/dashboard/
GET       /api/dashboard/stats
GET       /api/dashboard/tarjetas
GET       /api/reportes/
POST/GET  /api/tickets-soporte/
GET/PUT   /api/configuracion/
GET       /health
GET       /stats
```

---

## 6. ARQUITECTURA Y PATRONES

### Backend

**Patrón de capas:**
1. **Router (FastAPI)** → `api/endpoints/` o `modules/*/endpoints/`
2. **CRUD** → `crud/` — operaciones DB directas con SQLAlchemy
3. **Schema (Pydantic)** → `schemas/` — validación entrada/salida
4. **Model (SQLAlchemy)** → `modules/*/models/` — ORM
5. **Core** → config, database, email, LLM

**Inyección de dependencias:** `Depends(get_db)` para sesiones DB en todos los endpoints.

**Timezone:** Siempre usar `COLOMBIA_TZ = timezone(timedelta(hours=-5))` para fechas.

**Códigos HTTP de error:**
- 404 → recurso no encontrado
- 403 → sin membresía activa
- 409 → conflicto (asistencia duplicada en el día)
- 400 → error de validación

### Frontend

**Data fetching:** React Query (TanStack Query) — queries para lectura, mutations para escritura.

**Organización de servicios:**
- `lib/services/` → funciones que llaman a la API (Axios)
- `lib/hooks/` → custom hooks con `useQuery`/`useMutation`
- Componentes consumen hooks, nunca llaman servicios directamente

**Cache keys de React Query:**
```typescript
['asistencia', 'fecha', '2024-01-15']
['usuarios', userId]
['membresias', 'stats']
```

**Estilos:**
```typescript
import { cn } from "@/lib/utils"
// cn() = clsx() + twMerge()
```

**URL base API:** Variable de entorno `NEXT_PUBLIC_API_URL`, default `http://localhost:9000` (verificar que coincida con el puerto del backend).

---

## 7. COMANDOS DISPONIBLES

```bash
# Desarrollo completo (frontend + backend)
npm run dev:all

# Solo frontend
npm run dev

# Solo backend
npm run backend         # Puerto 8000
npm run backend:dev     # Puerto 8002

# Build producción
npm run build

# Lint
npm run lint

# Scripts de inicio
./start-momentum.sh     # Script principal dev
./start.sh              # Producción
```

---

## 8. AUTENTICACIÓN

**Estado actual: NO implementada completamente.**

**Lo que existe preparado:**
- Backend: configuración JWT HS256, expiración 30 min, SECRET_KEY en Pydantic-Settings
- Frontend: interceptores Axios preparados para Bearer tokens
- Roles definidos: `admin`, `entrenador`, `usuario` (cliente)

**Credenciales de demo (seed data):**
- Admin: `admin@momentum.com` / `admin123`
- Usuarios demo: `juan@example.com`, `maria@example.com`, `carlos@example.com` / `demo123`

---

## 9. REGLAS DE NEGOCIO IMPORTANTES

### Membresías y descuentos
- Precio final = precio original - descuento cupón (1-100%, validado `ge=1, le=100` en Pydantic) O descuento referido (5%)
- No se pueden combinar cupón + referido (se aplica automáticamente el mayor)
- `pase_diario` y `pase_flex` no pueden referir otros usuarios

### Asistencia
- Solo un check-in por usuario por día
- Requiere membresía activa con visitas disponibles (si aplica)
- Zona horaria Colombia (UTC-5) para todas las fechas

### Programa de referidos
- 3 referidos activos → 1 mes gratis para el referidor
- Mínimo 30 días de membresía para ser elegible
- Rastreo por `membresia_id`, no solo `usuario_id`

### Planes con visitas limitadas
- `pase_flex`: `visitas_disponibles` se decrementa en cada check-in
- Cuando llega a 0, la membresía ya no permite acceso aunque esté en fecha

---

## 10. MÓDULOS DESHABILITADOS / FUTUROS

- **Bot de hospitalidad** (`modules/bot/`): deshabilitado, usa LangChain + Anthropic
- **WhatsApp** (`modules/whatsapp/`): deshabilitado, usa httpx para WhatsApp Business API
- **Computer Vision** (`modules/computer_vision/`): placeholder vacío
- **Autenticación completa**: pendiente de implementar

---

## 11. CONFIGURACIÓN DE ENTORNO

Variables de entorno clave (ver `backend/.env.example`):
```bash
DATABASE_URL=sqlite:///./momentum.db           # Dev
DATABASE_URL=postgresql://...                   # Prod
SECRET_KEY=...
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
ANTHROPIC_API_KEY=...                           # Para Claude API (bot)
OLLAMA_BASE_URL=http://localhost:11434          # Para Ollama local
NEXT_PUBLIC_API_URL=http://localhost:8000       # Frontend → Backend URL
```

---

## 12. CONVENCIONES Y ESTÁNDARES

### Python (Backend)
- Nombres en español para modelos y campos (cedula, nombre, apellido, etc.)
- Imports de zona horaria: usar `pytz` o `datetime.timezone` con `COLOMBIA_TZ`
- Schemas Pydantic siempre con `model_config = ConfigDict(from_attributes=True)`

### TypeScript (Frontend)
- Tipos centralizados en `types/index.ts`
- Servicios en `lib/services/`, hooks en `lib/hooks/`
- Usar `cn()` para combinar clases Tailwind
- Fechas en formato `YYYY-MM-DD` para API calls

### Git
- Commits en formato convencional: `fix:`, `feat:`, `refactor:`, etc.
- Rama principal: `main`

---

## 13. DEPLOYMENT

### Desarrollo local
```bash
npm run dev:all
# Backend: http://localhost:8000
# Frontend: http://localhost:3000
```

### Docker Compose (producción)
```bash
docker compose up --build
# Frontend Nginx: puerto 80
# Backend FastAPI: puerto 8000 (interno)
```

**Flujo Docker:**
1. Frontend: Node.js build → `next build` → static export en `/out` → Nginx sirve archivos
2. Backend: Python + requirements → Uvicorn en 0.0.0.0:8000
3. Nginx: proxy `/api/*` → FastAPI, resto → static files

---

## 14. ARCHIVOS CRÍTICOS (leer antes de modificar)

| Archivo | Por qué es crítico |
|---------|-------------------|
| `backend/app/core/database.py` | Configuración DB, init_db, session factory |
| `backend/app/core/config.py` | Variables de entorno y settings globales |
| `backend/main.py` | Registro de todos los routers y lifespan |
| `backend/app/modules/usuarios/models/membresia.py` | Lógica de negocio de membresías, `esta_activa()` |
| `backend/app/api/endpoints/asistencia.py` | Validación de membresía en check-in |
| `lib/api.ts` | Instancia Axios, interceptores, base URL |
| `types/index.ts` | Todos los tipos TypeScript compartidos |
| `app/page.tsx` | Página principal con lógica de check-in |
| `docker-compose.yml` | Orquestación de servicios |

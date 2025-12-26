from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

# 1. CONFIGURACIÓN (primero)
from app.core.config import settings
from app.core.database import engine, Base

# 2. MODELOS (después de Base, para que SQLAlchemy los registre)
# IMPORTANTE: Estos imports deben ocurrir DESPUÉS de definir Base
from app.modules.usuarios.models.usuario import Usuario
from app.modules.usuarios.models.membresia import Membresia
from app.modules.asistencia.models.asistencia import Asistencia
from app.modules.metricas.models.metrica import Metrica
from app.modules.bot.models.conversacion import Conversacion
from app.modules.bot.models.logro import Logro
from app.models.cupon import Cupon
from app.models.referido import Referido
from app.modules.empleados.models.empleado import Empleado
from app.modules.empleados.models.asistencia_empleado import AsistenciaEmpleado

# 3. ENDPOINTS (al final)
# Endpoints legacy (usan modelos a través de app.models que ahora son proxies)
from app.api.endpoints import usuarios, membresias, asistencia, metricas, cupones, referidos, empleados, asistencia_empleados, dashboard

# Nuevos endpoints del bot
from app.modules.bot.endpoints import bot_endpoints
from app.modules.computer_vision.endpoints import cv_endpoints_placeholder


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Gestión del ciclo de vida de la aplicación.
    Se ejecuta al iniciar y al cerrar el servidor.
    """
    # Startup
    print("🚀 Iniciando Sistema de Gestión de Gimnasio v2.0.0")
    print("📊 Creando tablas de base de datos...")
    Base.metadata.create_all(bind=engine)
    print("✅ Base de datos inicializada")
    print("🤖 Bot de hospitalidad listo")
    print(f"📡 Servidor corriendo en: http://localhost:8000")
    print(f"📚 Documentación: http://localhost:8000/docs")

    yield

    # Shutdown
    print("👋 Cerrando servidor...")


# Crear aplicación FastAPI
app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description=settings.DESCRIPTION,
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/api/openapi.json",
)

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==========================================
# ROUTERS - Endpoints de la API
# ==========================================

# Módulos principales
app.include_router(
    usuarios.router,
    prefix="/api/usuarios",
    tags=["👤 Usuarios"]
)

app.include_router(
    membresias.router,
    prefix="/api/membresias",
    tags=["💳 Membresías"]
)

app.include_router(
    asistencia.router,
    prefix="/api/asistencia",
    tags=["📋 Asistencia"]
)

app.include_router(
    metricas.router,
    prefix="/api/metricas",
    tags=["📊 Métricas"]
)

app.include_router(
    cupones.router,
    prefix="/api/cupones",
    tags=["🎟️ Cupones"]
)

app.include_router(
    referidos.router,
    prefix="/api/referidos",
    tags=["👥 Referidos"]
)

app.include_router(
    empleados.router,
    prefix="/api/empleados",
    tags=["👔 Empleados"]
)

app.include_router(
    asistencia_empleados.router,
    prefix="/api/asistencia-empleados",
    tags=["⏰ Asistencia Empleados"]
)

app.include_router(
    dashboard.router,
    prefix="/api/dashboard",
    tags=["📊 Dashboard"]
)

# Bot de Hospitalidad
app.include_router(
    bot_endpoints.router,
    prefix="/api/bot",
    tags=["🤖 Bot de Hospitalidad"]
)

# Computer Vision (Futuro)
app.include_router(
    cv_endpoints_placeholder.router,
    prefix="/api/cv",
    tags=["👁️ Computer Vision (Futuro)"]
)

# ==========================================
# ENDPOINTS RAÍZ
# ==========================================

@app.get("/", tags=["Sistema"])
async def root():
    """
    Endpoint raíz - Información del sistema
    """
    return {
        "sistema": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "descripcion": settings.DESCRIPTION,
        "estado": "activo",
        "modulos": {
            "usuarios": "✅ Activo",
            "membresias": "✅ Activo",
            "asistencia": "✅ Activo",
            "metricas": "✅ Activo",
            "cupones": "✅ Activo",
            "referidos": "✅ Activo",
            "bot_hospitalidad": "✅ Activo",
            "computer_vision": "⏳ Planificado"
        },
        "bot": {
            "nombre": settings.BOT_NAME,
            "modelo": settings.BOT_MODEL,
            "estado": "🤖 En línea"
        },
        "documentacion": {
            "swagger": "/docs",
            "redoc": "/redoc",
            "openapi": "/api/openapi.json"
        },
        "endpoints_principales": {
            "usuarios": "/api/usuarios",
            "membresias": "/api/membresias",
            "asistencia": "/api/asistencia",
            "metricas": "/api/metricas",
            "cupones": "/api/cupones",
            "referidos": "/api/referidos",
            "bot_chat": "/api/bot/chat",
            "bot_triggers": "/api/bot/triggers"
        }
    }


@app.get("/health", tags=["Sistema"])
async def health_check():
    """
    Endpoint de salud del sistema
    """
    return {
        "status": "healthy",
        "version": settings.VERSION,
        "database": "connected",
        "bot": "online"
    }


@app.get("/stats", tags=["Sistema"])
async def system_stats():
    """
    Estadísticas del sistema
    """
    from sqlalchemy.orm import Session
    from app.core.database import SessionLocal

    db = SessionLocal()
    try:
        total_usuarios = db.query(Usuario).count()
        total_asistencias = db.query(Asistencia).count()
        total_conversaciones = db.query(Conversacion).count()
        total_logros = db.query(Logro).count()

        return {
            "sistema": settings.PROJECT_NAME,
            "version": settings.VERSION,
            "estadisticas": {
                "total_usuarios": total_usuarios,
                "total_asistencias": total_asistencias,
                "total_conversaciones_bot": total_conversaciones,
                "total_logros": total_logros
            },
            "base_datos": {
                "tipo": "PostgreSQL" if "postgresql" in settings.DATABASE_URL else "SQLite",
                "estado": "conectada"
            }
        }
    finally:
        db.close()


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )

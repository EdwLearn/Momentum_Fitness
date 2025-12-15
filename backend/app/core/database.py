from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from .config import settings

# Configurar argumentos según el tipo de base de datos
connect_args = {}
if "sqlite" in settings.DATABASE_URL:
    connect_args = {"check_same_thread": False}

# Configuración del engine con pool de conexiones
engine_kwargs = {
    "pool_size": settings.DB_POOL_SIZE,
    "max_overflow": settings.DB_MAX_OVERFLOW,
    "pool_timeout": settings.DB_POOL_TIMEOUT,
    "pool_pre_ping": True,  # Verifica conexiones antes de usarlas
    "echo": False,  # Cambiar a True para debug SQL
}

# Solo aplicar pool para PostgreSQL (no SQLite)
if "postgresql" in settings.DATABASE_URL:
    engine = create_engine(settings.DATABASE_URL, **engine_kwargs)
else:
    engine = create_engine(settings.DATABASE_URL, connect_args=connect_args)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    """
    Dependency para obtener una sesión de base de datos.
    Se cierra automáticamente al finalizar la request.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_db():
    """
    Inicializa la base de datos creando todas las tablas.
    Llamar solo en desarrollo o con migraciones controladas.
    """
    Base.metadata.create_all(bind=engine)

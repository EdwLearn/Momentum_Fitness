from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    # Información del proyecto
    PROJECT_NAME: str = "Gimnasio API - Sistema Integral"
    VERSION: str = "2.0.0"
    DESCRIPTION: str = "API para Sistema de Gestión de Gimnasio con Bot de Hospitalidad y Computer Vision"

    # Base de datos PostgreSQL
    DATABASE_URL: str = "postgresql://gimnasio_user:gimnasio_pass@localhost:5432/gimnasio_db"

    # Para desarrollo local con SQLite (comentar cuando uses PostgreSQL)
    # DATABASE_URL: str = "sqlite:///./gimnasio.db"

    # Configuración del pool de conexiones
    DB_POOL_SIZE: int = 20
    DB_MAX_OVERFLOW: int = 10
    DB_POOL_TIMEOUT: int = 30

    # CORS
    ALLOWED_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:8000",
        "http://localhost:5173",
        "http://localhost:4200",
    ]

    # Seguridad
    SECRET_KEY: str = "your-secret-key-here-change-in-production-use-openssl-rand-hex-32"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # Claude API (Anthropic)
    ANTHROPIC_API_KEY: str = "sk-ant-api03-your-key-here"

    # Bot de Hospitalidad
    BOT_NAME: str = "GymBot"
    BOT_MODEL: str = "claude-3-5-sonnet-20241022"
    BOT_MAX_TOKENS: int = 1024
    BOT_TEMPERATURE: float = 0.7

    # Triggers automáticos
    TRIGGER_CHECK_INTERVAL_MINUTES: int = 60  # Revisar triggers cada hora
    RACHA_DIAS_HITOS: List[int] = [7, 15, 30, 60, 90]
    CAMBIO_PESO_KG_HITOS: List[int] = [2, 5, 10]
    DIAS_INACTIVIDAD_HITOS: List[int] = [3, 7, 14]

    # Computer Vision (preparado para futuro)
    CV_ENABLED: bool = False
    CV_CAMERA_URLS: List[str] = []

    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()

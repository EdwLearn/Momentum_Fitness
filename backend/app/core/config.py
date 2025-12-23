from pydantic_settings import BaseSettings
from pydantic import field_validator
from typing import List, Union
import secrets


class Settings(BaseSettings):
    # Información del proyecto
    PROJECT_NAME: str = "Gimnasio API - Sistema Integral"
    VERSION: str = "2.0.0"
    DESCRIPTION: str = "API para Sistema de Gestión de Gimnasio con Bot de Hospitalidad y Computer Vision"

    # Entorno
    ENVIRONMENT: str = "development"
    DEBUG: bool = True

    # Base de datos
    DATABASE_URL: str = "sqlite:///./gimnasio.db"

    # Configuración del pool de conexiones (solo PostgreSQL)
    DB_POOL_SIZE: int = 20
    DB_MAX_OVERFLOW: int = 10
    DB_POOL_TIMEOUT: int = 30

    # CORS - Acepta tanto string separado por comas como lista
    ALLOWED_ORIGINS: Union[List[str], str] = "http://localhost:3000,http://localhost:8000,http://localhost:5173,http://localhost:4200"

    # Seguridad
    SECRET_KEY: str = secrets.token_urlsafe(32)
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # Claude API (Anthropic)
    ANTHROPIC_API_KEY: str = ""

    # Bot de Hospitalidad
    BOT_NAME: str = "GymBot"
    BOT_MODEL: str = "claude-3-5-sonnet-20241022"
    BOT_MAX_TOKENS: int = 1024
    BOT_TEMPERATURE: float = 0.7

    # Triggers automáticos
    TRIGGER_CHECK_INTERVAL_MINUTES: int = 60
    RACHA_DIAS_HITOS: Union[List[int], str] = "7,15,30,60,90"
    CAMBIO_PESO_KG_HITOS: Union[List[int], str] = "2,5,10"
    DIAS_INACTIVIDAD_HITOS: Union[List[int], str] = "3,7,14"

    # Computer Vision (preparado para futuro)
    CV_ENABLED: bool = False
    CV_CAMERA_URLS: Union[List[str], str] = ""

    @field_validator('ALLOWED_ORIGINS', mode='before')
    @classmethod
    def parse_cors_origins(cls, v):
        """Convierte string separado por comas a lista"""
        if isinstance(v, str):
            return [origin.strip() for origin in v.split(',') if origin.strip()]
        return v

    @field_validator('RACHA_DIAS_HITOS', 'CAMBIO_PESO_KG_HITOS', 'DIAS_INACTIVIDAD_HITOS', mode='before')
    @classmethod
    def parse_int_list(cls, v):
        """Convierte string separado por comas a lista de enteros"""
        if isinstance(v, str):
            return [int(x.strip()) for x in v.split(',') if x.strip()]
        return v

    @field_validator('CV_CAMERA_URLS', mode='before')
    @classmethod
    def parse_camera_urls(cls, v):
        """Convierte string separado por comas a lista de URLs"""
        if isinstance(v, str) and v.strip():
            return [url.strip() for url in v.split(',') if url.strip()]
        elif isinstance(v, str):
            return []
        return v

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()

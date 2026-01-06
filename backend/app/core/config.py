from pydantic_settings import BaseSettings
from pydantic import field_validator
from typing import List, Union
import secrets
import os
import sys
from pathlib import Path


def get_data_dir():
    """
    Obtiene el directorio de datos de la aplicación.
    - En desarrollo: usa el directorio actual
    - En producción (PyInstaller): usa AppData en Windows o home en Linux/Mac
    """
    if getattr(sys, 'frozen', False):
        # Ejecutable de PyInstaller
        if sys.platform == 'win32':
            # Windows: usar AppData/Roaming/MomentumFitness
            data_dir = Path(os.environ.get('APPDATA', os.path.expanduser('~'))) / 'MomentumFitness'
        else:
            # Linux/Mac: usar ~/.momentum-fitness
            data_dir = Path.home() / '.momentum-fitness'

        # Crear directorio si no existe
        data_dir.mkdir(parents=True, exist_ok=True)

        # Copiar BD de plantilla si no existe
        db_path = data_dir / 'gimnasio.db'
        if not db_path.exists():
            # Buscar la BD de plantilla en el bundle de PyInstaller
            if hasattr(sys, '_MEIPASS'):
                # _MEIPASS es el directorio temporal donde PyInstaller extrae los archivos
                template_db = Path(sys._MEIPASS) / 'gimnasio_template.db'
                if template_db.exists():
                    import shutil
                    shutil.copy2(template_db, db_path)
                    print(f"✅ Base de datos precargada copiada a: {db_path}")

        return data_dir
    else:
        # Desarrollo: usar directorio actual
        return Path.cwd()


class Settings(BaseSettings):
    # Información del proyecto
    PROJECT_NAME: str = "Gimnasio API - Sistema Integral"
    VERSION: str = "2.0.0"
    DESCRIPTION: str = "API para Sistema de Gestión de Gimnasio con Bot de Hospitalidad y Computer Vision"

    # Entorno
    ENVIRONMENT: str = "development"
    DEBUG: bool = True

    # Base de datos - usa ruta absoluta en producción
    DATABASE_URL: str = None

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        # Si no se especificó DATABASE_URL, usar la ruta por defecto
        if self.DATABASE_URL is None:
            data_dir = get_data_dir()
            db_path = data_dir / "gimnasio.db"
            self.DATABASE_URL = f"sqlite:///{db_path}"

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

    # Bot de Hospitalidad (usa Ollama/qwen2.5:7b por defecto - ver llm_config.py)
    BOT_NAME: str = "Osneither"
    BOT_MODEL: str = "claude-3-5-sonnet-20241022"  # Solo se usa si USE_LOCAL_LLM=false
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

    # Email Configuration
    SMTP_SERVER: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    SMTP_USERNAME: str = ""
    SMTP_PASSWORD: str = ""
    SUPPORT_EMAIL: str = "edwardgiraldo101@gmail.com"

    # WhatsApp Business API Configuration
    WHATSAPP_ACCESS_TOKEN: str = ""  # Token de acceso permanente de Meta
    WHATSAPP_PHONE_NUMBER_ID: str = ""  # ID del número de teléfono de WhatsApp Business
    WHATSAPP_VERIFY_TOKEN: str = "momentum_fitness_webhook_2024"  # Token para verificación del webhook (puedes cambiarlo)
    WHATSAPP_BUSINESS_ACCOUNT_ID: str = ""  # ID de la cuenta de WhatsApp Business

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

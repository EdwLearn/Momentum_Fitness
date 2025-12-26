from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.sql import func
from app.core.database import Base


class ConfiguracionGimnasio(Base):
    __tablename__ = "configuracion_gimnasio"

    id = Column(Integer, primary_key=True, index=True)
    nombre_gimnasio = Column(String, nullable=False)
    nit = Column(String)
    direccion = Column(String)
    telefono = Column(String)
    email = Column(String)
    horario_semana = Column(String)
    horario_finde = Column(String)
    instagram = Column(String)
    facebook = Column(String)
    tiktok = Column(String)
    website = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), server_default=func.now())

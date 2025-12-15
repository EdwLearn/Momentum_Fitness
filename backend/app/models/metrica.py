from sqlalchemy import Column, Integer, String, DateTime, Float, ForeignKey, Enum
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from app.core.database import Base

class TipoMetrica(str, enum.Enum):
    PESO = "peso"
    ALTURA = "altura"
    IMC = "imc"
    GRASA_CORPORAL = "grasa_corporal"
    MASA_MUSCULAR = "masa_muscular"
    CIRCUNFERENCIA_CINTURA = "circunferencia_cintura"
    CIRCUNFERENCIA_PECHO = "circunferencia_pecho"
    CIRCUNFERENCIA_BRAZO = "circunferencia_brazo"
    CIRCUNFERENCIA_PIERNA = "circunferencia_pierna"

class Metrica(Base):
    __tablename__ = "metricas"

    id = Column(Integer, primary_key=True, index=True)
    usuario_id = Column(Integer, ForeignKey("usuarios.id"), nullable=False)
    tipo = Column(Enum(TipoMetrica), nullable=False)
    valor = Column(Float, nullable=False)
    unidad = Column(String, nullable=False)
    fecha_registro = Column(DateTime, default=datetime.utcnow, index=True)
    notas = Column(String, nullable=True)

    usuario = relationship("Usuario", back_populates="metricas")

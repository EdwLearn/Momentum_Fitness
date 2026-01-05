from sqlalchemy import Column, Integer, String, DateTime, Float, ForeignKey, Enum, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from app.core.database import Base

class TipoMetrica(str, enum.Enum):
    PESO = "peso"
    MEDIDAS = "medidas"
    GRASA_CORPORAL = "grasa_corporal"
    MASA_MUSCULAR = "masa_muscular"
    IMC = "imc"
    EJERCICIO = "ejercicio"

class Metrica(Base):
    __tablename__ = "metricas"

    id = Column(Integer, primary_key=True, index=True)
    usuario_id = Column(Integer, ForeignKey("usuarios.id"), nullable=False, index=True)

    # Tipo y valor
    tipo = Column(Enum(TipoMetrica), nullable=False, index=True)
    valor = Column(Float, nullable=True)  # Para peso, IMC, etc.
    unidad = Column(String, nullable=True)  # kg, cm, %, etc.

    # Fecha
    fecha = Column(DateTime, default=datetime.utcnow, index=True)

    # Medidas corporales (JSON para flexibilidad)
    medidas = Column(JSON, nullable=True)  # {"pecho": 100, "cintura": 80, "cadera": 95, "brazo": 35, "pierna": 55}

    # Ejercicios realizados (JSON)
    ejercicios_realizados = Column(JSON, nullable=True)  # [{"nombre": "Press banca", "peso": 80, "repeticiones": 10, "series": 3}]

    # Notas
    notas = Column(String, nullable=True)

    # Relación
    usuario = relationship("Usuario", back_populates="mediciones")

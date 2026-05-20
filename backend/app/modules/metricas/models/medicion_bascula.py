from sqlalchemy import Column, Integer, Float, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base


class MedicionBascula(Base):
    __tablename__ = "mediciones_bascula"

    id = Column(Integer, primary_key=True, index=True)
    usuario_id = Column(Integer, ForeignKey("usuarios.id"), nullable=False, index=True)

    # Datos de la báscula
    peso = Column(Float, nullable=False)                     # kg
    porcentaje_grasa = Column(Float, nullable=True)          # %
    grasa_visceral = Column(Integer, nullable=True)          # nivel (1-20+)
    porcentaje_musculo = Column(Float, nullable=True)        # %
    imc = Column(Float, nullable=True)                       # kg/m²
    metabolismo_basal = Column(Integer, nullable=True)       # kcal/día
    edad_corporal = Column(Integer, nullable=True)           # años

    # Metadata
    fecha = Column(DateTime, default=datetime.utcnow, index=True)
    notas = Column(String, nullable=True)

    # Relación
    usuario = relationship("Usuario", back_populates="mediciones_bascula")

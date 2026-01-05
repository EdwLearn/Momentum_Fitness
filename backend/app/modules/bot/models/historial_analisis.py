from sqlalchemy import Column, Integer, String, DateTime, Text, Float
from datetime import datetime
from app.core.database import Base

class HistorialAnalisis(Base):
    __tablename__ = "historial_analisis"

    id = Column(Integer, primary_key=True, autoincrement=True)

    # Ejecución
    fecha_analisis = Column(DateTime, default=datetime.utcnow, index=True)
    usuarios_analizados = Column(Integer)
    alertas_generadas = Column(Integer)
    mensajes_enviados = Column(Integer)

    # Detalles
    tipo_analisis = Column(String)  # 'diario', 'evento', 'manual'

    errores = Column(Text, nullable=True)
    duracion_segundos = Column(Float, nullable=True)

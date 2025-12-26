from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import and_, func, extract
from app.core.database import get_db
from app.models.usuario import Usuario
from app.modules.usuarios.models.membresia import Membresia, EstadoMembresia
from datetime import datetime, timedelta
from typing import Dict, Any
from pydantic import BaseModel

router = APIRouter()

class ClientesActivosStats(BaseModel):
    total: int
    cambio_porcentual: float

@router.get("/clientes-activos", response_model=ClientesActivosStats)
def get_clientes_activos_stats(db: Session = Depends(get_db)):
    """
    Retorna el número de clientes activos y el cambio porcentual vs el mes anterior
    """
    now = datetime.utcnow()

    # Clientes activos actuales (con membresía activa)
    clientes_activos_actuales = db.query(Usuario.id).join(
        Membresia, Membresia.usuario_id == Usuario.id
    ).filter(
        and_(
            Membresia.activo == True,
            Membresia.estado == EstadoMembresia.ACTIVA,
            Membresia.fecha_fin >= now
        )
    ).distinct().count()

    # Primer día del mes actual
    primer_dia_mes_actual = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)

    # Primer día del mes anterior
    if now.month == 1:
        primer_dia_mes_anterior = primer_dia_mes_actual.replace(year=now.year - 1, month=12)
    else:
        primer_dia_mes_anterior = primer_dia_mes_actual.replace(month=now.month - 1)

    # Clientes activos el mes anterior (al inicio del mes)
    # Contamos usuarios que tenían membresía activa en el inicio del mes actual
    clientes_activos_mes_anterior = db.query(Usuario.id).join(
        Membresia, Membresia.usuario_id == Usuario.id
    ).filter(
        and_(
            Membresia.activo == True,
            Membresia.fecha_inicio <= primer_dia_mes_actual,
            Membresia.fecha_fin >= primer_dia_mes_actual
        )
    ).distinct().count()

    # Calcular cambio porcentual
    if clientes_activos_mes_anterior > 0:
        cambio_porcentual = ((clientes_activos_actuales - clientes_activos_mes_anterior) / clientes_activos_mes_anterior) * 100
    else:
        cambio_porcentual = 100.0 if clientes_activos_actuales > 0 else 0.0

    return ClientesActivosStats(
        total=clientes_activos_actuales,
        cambio_porcentual=round(cambio_porcentual, 1)
    )

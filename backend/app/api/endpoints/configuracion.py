from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.crud import configuracion as crud_configuracion
from app.schemas.configuracion import ConfiguracionGimnasio, ConfiguracionGimnasioUpdate

router = APIRouter()


@router.get("/", response_model=ConfiguracionGimnasio)
def get_configuracion_gimnasio(
    db: Session = Depends(get_db),
):
    """
    Obtener la configuración del gimnasio
    """
    configuracion = crud_configuracion.get_configuracion(db)
    if not configuracion:
        raise HTTPException(status_code=404, detail="Configuración no encontrada")
    return configuracion


@router.put("/", response_model=ConfiguracionGimnasio)
def update_configuracion_gimnasio(
    configuracion_in: ConfiguracionGimnasioUpdate,
    db: Session = Depends(get_db),
):
    """
    Actualizar la configuración del gimnasio
    """
    configuracion = crud_configuracion.update_configuracion(db, configuracion_in)
    return configuracion

from sqlalchemy.orm import Session
from app.models.configuracion import ConfiguracionGimnasio
from app.schemas.configuracion import ConfiguracionGimnasioCreate, ConfiguracionGimnasioUpdate


def get_configuracion(db: Session):
    """Obtener la configuración del gimnasio (siempre debería haber solo 1 registro)"""
    return db.query(ConfiguracionGimnasio).first()


def create_configuracion(db: Session, configuracion: ConfiguracionGimnasioCreate):
    """Crear configuración inicial del gimnasio"""
    db_configuracion = ConfiguracionGimnasio(**configuracion.dict())
    db.add(db_configuracion)
    db.commit()
    db.refresh(db_configuracion)
    return db_configuracion


def update_configuracion(db: Session, configuracion: ConfiguracionGimnasioUpdate):
    """Actualizar la configuración del gimnasio"""
    db_configuracion = db.query(ConfiguracionGimnasio).first()

    if not db_configuracion:
        # Si no existe, crear una nueva
        return create_configuracion(db, ConfiguracionGimnasioCreate(**configuracion.dict(exclude_unset=True)))

    # Actualizar campos que no sean None
    update_data = configuracion.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_configuracion, field, value)

    db.commit()
    db.refresh(db_configuracion)
    return db_configuracion

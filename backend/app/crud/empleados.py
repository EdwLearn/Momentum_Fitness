from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date

from app.modules.empleados.models import Empleado
from app.schemas.empleado import EmpleadoCreate, EmpleadoUpdate


def get_empleado(db: Session, empleado_id: int) -> Optional[Empleado]:
    """Obtener un empleado por ID"""
    return db.query(Empleado).filter(Empleado.id == empleado_id).first()


def get_empleado_by_cedula(db: Session, cedula: str) -> Optional[Empleado]:
    """Obtener un empleado por cédula"""
    return db.query(Empleado).filter(Empleado.cedula == cedula).first()


def get_empleados(
    db: Session,
    skip: int = 0,
    limit: int = 100,
    tipo_empleado: Optional[str] = None,
    activo: Optional[int] = None
) -> List[Empleado]:
    """Obtener lista de empleados con filtros opcionales"""
    query = db.query(Empleado)

    if tipo_empleado:
        query = query.filter(Empleado.tipo_empleado == tipo_empleado)

    if activo is not None:
        query = query.filter(Empleado.activo == activo)

    return query.offset(skip).limit(limit).all()


def create_empleado(db: Session, empleado: EmpleadoCreate) -> Empleado:
    """Crear un nuevo empleado"""
    db_empleado = Empleado(**empleado.model_dump())
    db.add(db_empleado)
    db.commit()
    db.refresh(db_empleado)
    return db_empleado


def update_empleado(db: Session, empleado_id: int, empleado: EmpleadoUpdate) -> Optional[Empleado]:
    """Actualizar un empleado existente"""
    db_empleado = get_empleado(db, empleado_id)
    if not db_empleado:
        return None

    update_data = empleado.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_empleado, field, value)

    db.commit()
    db.refresh(db_empleado)
    return db_empleado


def delete_empleado(db: Session, empleado_id: int) -> bool:
    """Eliminar un empleado"""
    db_empleado = get_empleado(db, empleado_id)
    if not db_empleado:
        return False

    db.delete(db_empleado)
    db.commit()
    return True


def get_empleados_activos(db: Session) -> List[Empleado]:
    """Obtener empleados activos"""
    return db.query(Empleado).filter(Empleado.activo == 1).all()

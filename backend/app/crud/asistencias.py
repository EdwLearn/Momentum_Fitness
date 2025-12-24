from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.asistencia import Asistencia
from app.models.usuario import Usuario
from app.models.membresia import Membresia
from app.schemas.asistencia import AsistenciaCreate, AsistenciaUpdate
from typing import List, Optional, Dict
from datetime import datetime, date, timezone, timedelta

# Timezone de Colombia (UTC-5)
COLOMBIA_TZ = timezone(timedelta(hours=-5))

def get_asistencia(db: Session, asistencia_id: int) -> Optional[Asistencia]:
    return db.query(Asistencia).filter(Asistencia.id == asistencia_id).first()

def get_asistencias(db: Session, skip: int = 0, limit: int = 100) -> List[Asistencia]:
    return db.query(Asistencia).offset(skip).limit(limit).all()

def get_asistencias_by_usuario(db: Session, usuario_id: int) -> List[Asistencia]:
    return db.query(Asistencia).filter(Asistencia.usuario_id == usuario_id).all()

def get_asistencias_by_fecha(db: Session, fecha: date) -> List[Asistencia]:
    return db.query(Asistencia).filter(
        Asistencia.fecha == fecha
    ).all()

def get_asistencia_hoy(db: Session, usuario_id: int, fecha: date) -> Optional[Asistencia]:
    """Verifica si el usuario ya tiene asistencia registrada en la fecha especificada"""
    return db.query(Asistencia).filter(
        Asistencia.usuario_id == usuario_id,
        Asistencia.fecha == fecha
    ).first()

def create_asistencia(db: Session, asistencia: AsistenciaCreate) -> Asistencia:
    # Validar que no exista asistencia para este usuario hoy (usar hora local Colombia)
    hoy = datetime.now(COLOMBIA_TZ).date()
    asistencia_existente = get_asistencia_hoy(db, asistencia.usuario_id, hoy)

    if asistencia_existente:
        raise ValueError(f"El usuario ya tiene asistencia registrada el día {hoy}")

    # Crear asistencia
    db_asistencia = Asistencia(**asistencia.model_dump())
    db.add(db_asistencia)

    # Actualizar ultima_asistencia del usuario (usar hora local Colombia)
    usuario = db.query(Usuario).filter(Usuario.id == asistencia.usuario_id).first()
    if usuario:
        usuario.ultima_asistencia = db_asistencia.timestamp_entrada or datetime.now(COLOMBIA_TZ)

    db.commit()
    db.refresh(db_asistencia)
    return db_asistencia

def update_asistencia(db: Session, asistencia_id: int, asistencia: AsistenciaUpdate) -> Optional[Asistencia]:
    db_asistencia = get_asistencia(db, asistencia_id)
    if db_asistencia:
        update_data = asistencia.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_asistencia, key, value)
        db.commit()
        db.refresh(db_asistencia)
    return db_asistencia

def delete_asistencia(db: Session, asistencia_id: int) -> bool:
    db_asistencia = get_asistencia(db, asistencia_id)
    if db_asistencia:
        db.delete(db_asistencia)
        db.commit()
        return True
    return False

def get_promedio_diario_30_dias(db: Session) -> float:
    """Calcula el promedio diario de asistencias de los últimos 30 días"""
    hoy = datetime.now(COLOMBIA_TZ).date()
    fecha_inicio = hoy - timedelta(days=30)

    # Contar asistencias totales en los últimos 30 días
    total_asistencias = db.query(func.count(Asistencia.id)).filter(
        Asistencia.fecha >= fecha_inicio,
        Asistencia.fecha <= hoy
    ).scalar()

    # Calcular promedio (dividir entre 30 días)
    promedio = total_asistencias / 30 if total_asistencias else 0
    return round(promedio, 1)

def get_usuarios_sin_asistir_4_dias(db: Session) -> List[Dict]:
    """
    Obtiene usuarios con membresía pase_flex o superior que no han asistido en 4 días seguidos.
    Retorna lista de diccionarios con información del usuario y días sin asistir.
    """
    hoy = datetime.now(COLOMBIA_TZ).date()
    fecha_limite = hoy - timedelta(days=4)

    # Planes elegibles (pase_flex y superiores)
    planes_elegibles = ["pase_flex", "mensual", "plan_3_meses", "plan_6_meses", "elite_anual"]

    # Obtener usuarios con membresías activas en planes elegibles
    usuarios_con_membresia = db.query(Usuario).join(
        Membresia, Usuario.id == Membresia.usuario_id
    ).filter(
        Membresia.activo == True,
        Membresia.estado == "activa",
        Membresia.tipo_plan.in_(planes_elegibles)
    ).all()

    usuarios_sin_asistir = []

    for usuario in usuarios_con_membresia:
        # Obtener última asistencia del usuario
        ultima_asistencia = db.query(Asistencia).filter(
            Asistencia.usuario_id == usuario.id
        ).order_by(Asistencia.fecha.desc()).first()

        # Si no tiene asistencias o la última fue hace más de 4 días
        if not ultima_asistencia or ultima_asistencia.fecha < fecha_limite:
            dias_sin_asistir = (hoy - ultima_asistencia.fecha).days if ultima_asistencia else None
            usuarios_sin_asistir.append({
                "usuario_id": usuario.id,
                "nombre": f"{usuario.nombre} {usuario.apellido}",
                "ultima_asistencia": ultima_asistencia.fecha if ultima_asistencia else None,
                "dias_sin_asistir": dias_sin_asistir
            })

    return usuarios_sin_asistir

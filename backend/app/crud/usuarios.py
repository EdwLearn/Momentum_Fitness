from sqlalchemy.orm import Session
from sqlalchemy import and_
from app.models.usuario import Usuario
from app.modules.usuarios.models.membresia import Membresia, EstadoMembresia, PLANES_VALIDOS_REFERIR
from app.schemas.usuario import UsuarioCreate, UsuarioUpdate
from typing import List, Optional
from datetime import datetime


def _agregar_info_membresia(db: Session, usuario: Usuario) -> None:
    """Agrega información de la membresía activa al objeto usuario"""
    now = datetime.utcnow()
    membresia_activa = db.query(Membresia).filter(
        and_(
            Membresia.usuario_id == usuario.id,
            Membresia.activo == True,
            Membresia.estado == EstadoMembresia.ACTIVA,
            Membresia.fecha_fin >= now
        )
    ).order_by(Membresia.fecha_fin.desc()).first()

    if membresia_activa:
        usuario.plan = membresia_activa.tipo_plan.value
        usuario.tipo_membresia = membresia_activa.tipo_plan.value
    else:
        usuario.plan = None
        usuario.tipo_membresia = None

def get_usuario(db: Session, usuario_id: int) -> Optional[Usuario]:
    usuario = db.query(Usuario).filter(Usuario.id == usuario_id).first()
    if usuario:
        _agregar_info_membresia(db, usuario)
    return usuario

def get_usuario_by_email(db: Session, email: str) -> Optional[Usuario]:
    return db.query(Usuario).filter(Usuario.email == email).first()

def get_usuario_by_cedula(db: Session, cedula: str) -> Optional[Usuario]:
    """Busca un usuario por su cédula (campo telefono)"""
    return db.query(Usuario).filter(Usuario.telefono == cedula).first()

def get_usuarios(db: Session, skip: int = 0, limit: int = 100) -> List[Usuario]:
    usuarios = db.query(Usuario).offset(skip).limit(limit).all()

    # Optimización: Obtener todas las membresías activas en una sola query
    if usuarios:
        usuario_ids = [u.id for u in usuarios]
        now = datetime.utcnow()

        # Query para obtener la membresía más reciente activa de cada usuario
        membresias_activas = db.query(Membresia).filter(
            and_(
                Membresia.usuario_id.in_(usuario_ids),
                Membresia.activo == True,
                Membresia.estado == EstadoMembresia.ACTIVA,
                Membresia.fecha_fin >= now
            )
        ).all()

        # Crear un diccionario para acceso rápido
        membresias_map = {}
        for m in membresias_activas:
            if m.usuario_id not in membresias_map or m.fecha_fin > membresias_map[m.usuario_id].fecha_fin:
                membresias_map[m.usuario_id] = m

        # Asignar plan y tipo_membresia a cada usuario
        for usuario in usuarios:
            if usuario.id in membresias_map:
                membresia = membresias_map[usuario.id]
                usuario.plan = membresia.tipo_plan.value
                usuario.tipo_membresia = membresia.tipo_plan.value
            else:
                usuario.plan = None
                usuario.tipo_membresia = None

    return usuarios

def create_usuario(db: Session, usuario: UsuarioCreate) -> Usuario:
    db_usuario = Usuario(**usuario.model_dump())
    db.add(db_usuario)
    db.commit()
    db.refresh(db_usuario)
    return db_usuario

def update_usuario(db: Session, usuario_id: int, usuario: UsuarioUpdate) -> Optional[Usuario]:
    db_usuario = get_usuario(db, usuario_id)
    if db_usuario:
        update_data = usuario.model_dump(exclude_unset=True)

        # Detectar si se actualizó el peso
        peso_actualizado = 'peso_actual' in update_data

        for key, value in update_data.items():
            setattr(db_usuario, key, value)
        db.commit()
        db.refresh(db_usuario)

        # Actualizar métricas de peso si cambió
        if peso_actualizado:
            try:
                from app.modules.bot.services.metricas_service import MetricasService
                MetricasService.actualizar_metricas_peso(db, usuario_id)
            except Exception as e:
                print(f"Error actualizando métricas de peso: {str(e)}")

    return db_usuario

def delete_usuario(db: Session, usuario_id: int) -> bool:
    db_usuario = get_usuario(db, usuario_id)
    if db_usuario:
        # Eliminar manualmente todos los registros relacionados
        # Esto evita problemas de integridad referencial

        # 1. Eliminar membresías
        db.query(Membresia).filter(Membresia.usuario_id == usuario_id).delete()

        # 2. Eliminar asistencias
        from app.modules.asistencia.models.asistencia import Asistencia
        db.query(Asistencia).filter(Asistencia.usuario_id == usuario_id).delete()

        # 3. Eliminar métricas
        from app.modules.metricas.models.metrica import Metrica
        db.query(Metrica).filter(Metrica.usuario_id == usuario_id).delete()

        # 4. Eliminar conversaciones
        from app.modules.bot.models.conversacion import Conversacion
        db.query(Conversacion).filter(Conversacion.usuario_id == usuario_id).delete()

        # 5. Eliminar logros
        from app.modules.bot.models.logro import Logro
        db.query(Logro).filter(Logro.usuario_id == usuario_id).delete()

        # 6. Actualizar referencias de referidos (SET NULL)
        db.query(Membresia).filter(Membresia.referido_por_id == usuario_id).update(
            {Membresia.referido_por_id: None}
        )

        # Finalmente, eliminar el usuario
        db.delete(db_usuario)
        db.commit()
        return True
    return False

def puede_referir(db: Session, cedula: str) -> bool:
    """
    Verifica si un usuario puede referir a otros.
    Reglas: Solo clientes con planes Mensual, Plan 3 Meses, Plan 6 Meses, Elite Anual
    """
    usuario = get_usuario_by_cedula(db, cedula)
    if not usuario:
        return False

    # Buscar membresía activa del usuario
    now = datetime.utcnow()
    membresia_activa = db.query(Membresia).filter(
        and_(
            Membresia.usuario_id == usuario.id,
            Membresia.activo == True,
            Membresia.estado == EstadoMembresia.ACTIVA,
            Membresia.fecha_fin >= now
        )
    ).first()

    if not membresia_activa:
        return False

    # Verificar si el plan permite referir
    return membresia_activa.tipo_plan in PLANES_VALIDOS_REFERIR

def contar_referidos_activos(db: Session, cedula_referidor: str) -> int:
    """
    Cuenta cuántos referidos activos tiene un usuario.
    Solo cuentan referidos con membresía activa.
    """
    # Buscar todos los usuarios referidos por esta cédula
    referidos = db.query(Usuario).filter(Usuario.referido_por_cedula == cedula_referidor).all()

    count = 0
    now = datetime.utcnow()

    for referido in referidos:
        # Verificar si tiene membresía activa
        membresia_activa = db.query(Membresia).filter(
            and_(
                Membresia.usuario_id == referido.id,
                Membresia.activo == True,
                Membresia.estado == EstadoMembresia.ACTIVA,
                Membresia.fecha_fin >= now
            )
        ).first()

        if membresia_activa:
            count += 1

    return count

def get_estadisticas_referidos(db: Session, cedula: str) -> dict:
    """
    Obtiene estadísticas de referidos de un usuario.
    """
    usuario = get_usuario_by_cedula(db, cedula)
    if not usuario:
        return {"error": "Usuario no encontrado"}

    puede_ref = puede_referir(db, cedula)
    referidos_activos = contar_referidos_activos(db, cedula)
    meses_ganados = referidos_activos // 3
    referidos_para_proximo = 3 - (referidos_activos % 3)

    return {
        "usuario_id": usuario.id,
        "nombre_completo": f"{usuario.nombre} {usuario.apellido}",
        "puede_referir": puede_ref,
        "referidos_activos": referidos_activos,
        "meses_gratis_ganados": meses_ganados,
        "referidos_para_proximo_mes": referidos_para_proximo if puede_ref else 0,
    }

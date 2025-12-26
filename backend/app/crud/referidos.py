from sqlalchemy.orm import Session
from sqlalchemy import func, and_, or_
from typing import List, Optional
from datetime import datetime, timedelta
from app.models.referido import Referido
from app.modules.usuarios.models.usuario import Usuario
from app.modules.usuarios.models.membresia import Membresia, TipoPlan, PLANES_VALIDOS_REFERIR
from app.schemas.referido import ReferidoCreate, ReferidoUpdate, ReferidoDetallado, ReferidoStats


def get_referido(db: Session, referido_id: int) -> Optional[Referido]:
    """Obtener referido por ID"""
    return db.query(Referido).filter(Referido.id == referido_id).first()


def get_referidos(
    db: Session,
    skip: int = 0,
    limit: int = 100,
    referidor_id: Optional[int] = None,
    referido_id: Optional[int] = None,
    cumple_condicion: Optional[bool] = None
) -> List[Referido]:
    """Obtener lista de referidos con filtros opcionales"""
    query = db.query(Referido)

    if referidor_id:
        query = query.filter(Referido.referidor_id == referidor_id)

    if referido_id:
        query = query.filter(Referido.referido_id == referido_id)

    if cumple_condicion is not None:
        query = query.filter(Referido.cumple_condicion == cumple_condicion)

    return query.offset(skip).limit(limit).all()


def get_referidos_detallados(db: Session, skip: int = 0, limit: int = 100) -> List[ReferidoDetallado]:
    """Obtener lista de referidos con información detallada"""
    referidos = db.query(Referido).offset(skip).limit(limit).all()

    result = []
    for ref in referidos:
        # Obtener usuarios
        referidor = db.query(Usuario).filter(Usuario.id == ref.referidor_id).first()
        referido = db.query(Usuario).filter(Usuario.id == ref.referido_id).first()

        # Obtener plan comprado
        plan_nombre = None
        if ref.membresia_id:
            membresia = db.query(Membresia).filter(Membresia.id == ref.membresia_id).first()
            if membresia:
                plan_nombre = membresia.tipo_plan.value

        # Contar referidos activos del referidor
        referidos_activos = contar_referidos_activos(db, ref.referidor_id)

        # Calcular beneficio real del referidor basado en sus referidos activos
        beneficio_texto = "Pendiente"
        if ref.cumple_condicion and referidor:
            # Cada 3 referidos activos = 30 días gratis
            meses_ganados = referidos_activos // 3
            dias_totales = meses_ganados * 30
            referidos_para_proximo = 3 - (referidos_activos % 3)

            if dias_totales > 0:
                if dias_totales >= 365:
                    beneficio_texto = f"{dias_totales // 365} año(s) gratis ({dias_totales} días)"
                elif dias_totales >= 30:
                    beneficio_texto = f"{dias_totales // 30} mes(es) gratis ({dias_totales} días)"
                else:
                    beneficio_texto = f"{dias_totales} días gratis"

                # Agregar info de progreso
                if referidos_para_proximo < 3:
                    beneficio_texto += f" - Faltan {referidos_para_proximo} para el próximo mes"
            else:
                beneficio_texto = f"0 días (faltan {referidos_para_proximo} referidos para 1 mes gratis)"
        elif not ref.cumple_condicion:
            # Verificar si el referido tiene membresía activa
            if ref.membresia_id:
                membresia = db.query(Membresia).filter(Membresia.id == ref.membresia_id).first()
                if membresia and not membresia.esta_activa():
                    beneficio_texto = "Membresía inactiva"
                else:
                    beneficio_texto = "Pendiente de activación"

        result.append(ReferidoDetallado(
            id=ref.id,
            referidor=f"{referidor.nombre} {referidor.apellido}" if referidor else "Desconocido",
            referidor_id=ref.referidor_id,
            referidos_totales=referidos_activos,
            referido=f"{referido.nombre} {referido.apellido}" if referido else "Desconocido",
            plan_comprado=plan_nombre,
            cumple_condicion=ref.cumple_condicion,
            beneficio=beneficio_texto,
            fecha_referido=ref.fecha_referido,
            fecha_activacion=ref.fecha_activacion
        ))

    return result


def create_referido(db: Session, referido: ReferidoCreate) -> Referido:
    """Crear un nuevo referido"""
    db_referido = Referido(
        referidor_id=referido.referidor_id,
        referido_id=referido.referido_id,
        membresia_id=referido.membresia_id,
        cumple_condicion=False,
        beneficio="Pendiente"
    )
    db.add(db_referido)
    db.commit()
    db.refresh(db_referido)
    return db_referido


def update_referido(db: Session, referido_id: int, referido_update: ReferidoUpdate) -> Optional[Referido]:
    """Actualizar un referido existente"""
    db_referido = get_referido(db, referido_id)
    if not db_referido:
        return None

    update_data = referido_update.model_dump(exclude_unset=True)

    for field, value in update_data.items():
        setattr(db_referido, field, value)

    db.commit()
    db.refresh(db_referido)
    return db_referido


def delete_referido(db: Session, referido_id: int) -> bool:
    """Eliminar un referido"""
    db_referido = get_referido(db, referido_id)
    if not db_referido:
        return False

    db.delete(db_referido)
    db.commit()
    return True


def activar_beneficio_referido(db: Session, referido_id: int, tipo_beneficio: str) -> Optional[Referido]:
    """Activar el beneficio para un referido"""
    db_referido = get_referido(db, referido_id)
    if not db_referido:
        return None

    db_referido.activar_beneficio(tipo_beneficio)
    db.commit()
    db.refresh(db_referido)
    return db_referido


def verificar_cumple_condicion(db: Session, referido_id: int) -> bool:
    """
    Verificar si el referido cumple la condición para otorgar beneficio
    (el referido debe tener una membresía activa de plan largo)
    """
    db_referido = get_referido(db, referido_id)
    if not db_referido or not db_referido.membresia_id:
        return False

    membresia = db.query(Membresia).filter(Membresia.id == db_referido.membresia_id).first()
    if not membresia:
        return False

    # Verificar que el plan sea válido para referir y esté activo
    return (
        membresia.tipo_plan in PLANES_VALIDOS_REFERIR and
        membresia.esta_activa()
    )


def contar_referidos_activos(db: Session, referidor_id: int) -> int:
    """Contar referidos activos de un usuario (con membresías válidas)"""
    # Obtener todos los referidos del usuario
    referidos = db.query(Referido).filter(
        Referido.referidor_id == referidor_id,
        Referido.cumple_condicion == True
    ).all()

    count = 0
    for ref in referidos:
        if ref.membresia_id:
            membresia = db.query(Membresia).filter(Membresia.id == ref.membresia_id).first()
            if membresia and membresia.esta_activa():
                count += 1

    return count


def get_referidos_stats(db: Session) -> ReferidoStats:
    """Obtener estadísticas del programa de referidos"""
    total_referidos = db.query(func.count(Referido.id)).scalar()
    referidos_activos = db.query(func.count(Referido.id)).filter(
        Referido.cumple_condicion == True
    ).scalar()
    referidos_pendientes = db.query(func.count(Referido.id)).filter(
        Referido.cumple_condicion == False
    ).scalar()
    beneficios_otorgados = db.query(func.count(Referido.id)).filter(
        Referido.beneficio != "Pendiente",
        Referido.beneficio.isnot(None)
    ).scalar()

    # Referidos último mes
    hace_un_mes = datetime.utcnow() - timedelta(days=30)
    referidos_ultimo_mes = db.query(func.count(Referido.id)).filter(
        Referido.fecha_referido >= hace_un_mes
    ).scalar()

    # Referidos últimos 3 meses
    hace_tres_meses = datetime.utcnow() - timedelta(days=90)
    referidos_ultimos_3_meses = db.query(func.count(Referido.id)).filter(
        Referido.fecha_referido >= hace_tres_meses
    ).scalar()

    # Top referidores
    top_referidores_query = db.query(
        Referido.referidor_id,
        func.count(Referido.id).label('total')
    ).group_by(Referido.referidor_id).order_by(func.count(Referido.id).desc()).limit(5).all()

    top_referidores = []
    for ref_id, total in top_referidores_query:
        usuario = db.query(Usuario).filter(Usuario.id == ref_id).first()
        if usuario:
            top_referidores.append({
                "usuario_id": ref_id,
                "nombre": f"{usuario.nombre} {usuario.apellido}",
                "total_referidos": total
            })

    return ReferidoStats(
        total_referidos=total_referidos,
        referidos_activos=referidos_activos,
        referidos_pendientes=referidos_pendientes,
        beneficios_otorgados=beneficios_otorgados,
        referidos_ultimo_mes=referidos_ultimo_mes,
        referidos_ultimos_3_meses=referidos_ultimos_3_meses,
        top_referidores=top_referidores
    )

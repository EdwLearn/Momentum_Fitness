from sqlalchemy.orm import Session
from sqlalchemy import and_
from app.modules.usuarios.models.membresia import Membresia, TipoPlan, EstadoMembresia, PLANES_CONFIG, REFERIDOS_CONFIG
from app.models.usuario import Usuario
from app.schemas.membresia import MembresiaCreate, MembresiaUpdate, MembresiaCreateSimple
from app.schemas.asistencia import AsistenciaCreate
from app.crud import asistencias as asistencias_crud
from datetime import datetime, timezone, timedelta
from typing import List, Optional

# Timezone de Colombia (UTC-5)
COLOMBIA_TZ = timezone(timedelta(hours=-5))

def get_membresia(db: Session, membresia_id: int) -> Optional[Membresia]:
    return db.query(Membresia).filter(Membresia.id == membresia_id).first()

def get_membresias(db: Session, skip: int = 0, limit: int = 100) -> List[Membresia]:
    return db.query(Membresia).offset(skip).limit(limit).all()

def get_membresias_by_usuario(db: Session, usuario_id: int) -> List[Membresia]:
    """Obtiene todas las membresías de un usuario"""
    return db.query(Membresia).filter(Membresia.usuario_id == usuario_id).all()

def get_membresia_activa_by_usuario(db: Session, usuario_id: int) -> Optional[Membresia]:
    """Obtiene la membresía activa y vigente de un usuario"""
    now = datetime.now(COLOMBIA_TZ)
    return db.query(Membresia).filter(
        and_(
            Membresia.usuario_id == usuario_id,
            Membresia.activo == True,
            Membresia.estado == EstadoMembresia.ACTIVA,
            Membresia.fecha_fin >= now
        )
    ).order_by(Membresia.fecha_fin.desc()).first()

def desactivar_membresias_anteriores(db: Session, usuario_id: int) -> int:
    """Desactiva todas las membresías activas anteriores de un usuario"""
    count = db.query(Membresia).filter(
        and_(
            Membresia.usuario_id == usuario_id,
            Membresia.activo == True
        )
    ).update({"activo": False})
    db.commit()
    return count

def create_membresia_simple(db: Session, membresia_simple: MembresiaCreateSimple) -> Membresia:
    """
    Crea una membresía con auto-cálculo de precio, duración y fechas.
    Desactiva automáticamente membresías anteriores del usuario.
    Aplica descuento del 5% si tiene referido_por_id Y plan != PASE_DIARIO.
    """
    # 1. Obtener configuración del plan
    config_plan = PLANES_CONFIG.get(membresia_simple.tipo_plan)
    if not config_plan:
        raise ValueError(f"Plan no válido: {membresia_simple.tipo_plan}")

    # 2. Desactivar membresías anteriores del usuario
    desactivar_membresias_anteriores(db, membresia_simple.usuario_id)

    # 3. Calcular precio (con descuento si tiene referido Y plan != PASE_DIARIO)
    precio_base = config_plan["precio"]
    precio_con_descuento = precio_base

    # NUEVA LÓGICA: Descuento si tiene referido_por_id Y plan != PASE_DIARIO
    if membresia_simple.referido_por_id and membresia_simple.tipo_plan != TipoPlan.PASE_DIARIO:
        # Validar que el referidor existe y tiene plan >= Mensual
        referidor = db.query(Usuario).filter(Usuario.id == membresia_simple.referido_por_id).first()
        if not referidor:
            raise ValueError(f"El referidor con ID {membresia_simple.referido_por_id} no existe")

        # Verificar que el referidor tiene membresía activa >= Mensual
        membresia_referidor = get_membresia_activa_by_usuario(db, membresia_simple.referido_por_id)
        PLANES_VALIDOS = [TipoPlan.MENSUAL, TipoPlan.PLAN_3_MESES, TipoPlan.PLAN_6_MESES, TipoPlan.ELITE_ANUAL]

        if not membresia_referidor or membresia_referidor.tipo_plan not in PLANES_VALIDOS:
            raise ValueError("El referidor debe tener una membresía activa Mensual o superior")

        # Aplicar descuento del 5%
        descuento = REFERIDOS_CONFIG["descuento_referido"]
        precio_con_descuento = int(precio_base * (1 - descuento))

    # 4. Calcular fechas (usar hora local de Colombia)
    fecha_inicio = datetime.now(COLOMBIA_TZ)

    # Pase Diario expira el mismo día (23:59:59), otros planes usan cálculo normal
    if membresia_simple.tipo_plan == TipoPlan.PASE_DIARIO:
        fecha_fin = fecha_inicio.replace(hour=23, minute=59, second=59, microsecond=999999)
    else:
        fecha_fin = Membresia.calcular_fecha_fin(fecha_inicio, config_plan["dias"])

    # 5. Crear membresía completa
    membresia_data = MembresiaCreate(
        usuario_id=membresia_simple.usuario_id,
        tipo_plan=membresia_simple.tipo_plan,
        precio=precio_con_descuento,  # Mantener por compatibilidad
        precio_original=precio_base,           # NUEVO
        precio_final=precio_con_descuento,     # NUEVO
        duracion_dias=config_plan["dias"],
        fecha_inicio=fecha_inicio,
        fecha_fin=fecha_fin,
        tipo_pago=membresia_simple.tipo_pago,  # NUEVO
        descripcion=membresia_simple.descripcion,
        referido_por_id=membresia_simple.referido_por_id  # NUEVO
    )

    # 6. Crear el objeto Membresia y guardar en BD
    db_membresia = Membresia(**membresia_data.model_dump())

    db.add(db_membresia)
    db.commit()
    db.refresh(db_membresia)

    # 7. Registrar asistencia automática (primera visita al crear membresía)
    try:
        # Usar hora local de Colombia (UTC-5)
        ahora_colombia = datetime.now(COLOMBIA_TZ)
        asistencia_data = AsistenciaCreate(
            usuario_id=membresia_simple.usuario_id,
            hora_entrada=ahora_colombia.strftime("%H:%M:%S"),
            notas="Primera asistencia - Creación de membresía"
        )
        asistencias_crud.create_asistencia(db, asistencia_data)
    except ValueError as e:
        # Si ya tiene asistencia hoy, es esperado - no es un error
        if "ya tiene asistencia registrada" in str(e):
            print(f"Info: Usuario ya tiene asistencia hoy, omitiendo registro automático")
        else:
            print(f"Warning: Error al registrar asistencia automática: {e}")
    except Exception as e:
        # Si falla la asistencia por otro motivo, no queremos que falle toda la creación de membresía
        print(f"Warning: No se pudo registrar asistencia automática: {e}")

    return db_membresia

def create_membresia(db: Session, membresia: MembresiaCreate) -> Membresia:
    """Crea una membresía con todos los datos especificados (uso interno)"""
    db_membresia = Membresia(**membresia.model_dump())
    db.add(db_membresia)
    db.commit()
    db.refresh(db_membresia)
    return db_membresia

def update_membresia(db: Session, membresia_id: int, membresia: MembresiaUpdate) -> Optional[Membresia]:
    db_membresia = get_membresia(db, membresia_id)
    if db_membresia:
        update_data = membresia.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_membresia, key, value)
        db.commit()
        db.refresh(db_membresia)
    return db_membresia

def delete_membresia(db: Session, membresia_id: int) -> bool:
    db_membresia = get_membresia(db, membresia_id)
    if db_membresia:
        db.delete(db_membresia)
        db.commit()
        return True
    return False

def renovar_membresia(
    db: Session,
    usuario_id: int,
    nuevo_tipo_plan: TipoPlan,
    referido_por_id: Optional[int] = None,
    tipo_pago: Optional[str] = None
) -> Membresia:
    """
    Renueva o cambia el plan de un usuario existente.
    Desactiva la membresía anterior y crea una nueva.
    """
    # Validar que el usuario existe
    usuario = db.query(Usuario).filter(Usuario.id == usuario_id).first()
    if not usuario:
        raise ValueError(f"Usuario {usuario_id} no encontrado")

    # Crear nueva membresía usando la función existente
    membresia_simple = MembresiaCreateSimple(
        usuario_id=usuario_id,
        tipo_plan=nuevo_tipo_plan,
        tipo_pago=tipo_pago,
        referido_por_id=referido_por_id,
        descripcion="Renovación de membresía" if referido_por_id is None else "Renovación con descuento por referido"
    )

    return create_membresia_simple(db, membresia_simple)

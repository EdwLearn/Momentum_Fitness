from sqlalchemy.orm import Session
from sqlalchemy import and_
from app.modules.usuarios.models.membresia import Membresia, TipoPlan, EstadoMembresia, PLANES_CONFIG, REFERIDOS_CONFIG
from app.models.usuario import Usuario
from app.models.cupon import Cupon
from app.schemas.membresia import MembresiaCreate, MembresiaUpdate, MembresiaCreateSimple
from app.schemas.asistencia import AsistenciaCreate
from app.schemas.referido import ReferidoCreate
from app.crud import asistencias as asistencias_crud
from app.crud import cupones as cupones_crud
from app.crud import referidos as referidos_crud
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
    Aplica descuento del 5% si tiene referido_por_id Y plan != PASE_DIARIO/PASE_FLEX.
    Aplica descuento de cupón si tiene cupon_codigo (NO acumulable con referido).

    REGLAS DE CUPONES:
    1. Cupones 3M y 6M: SOLO para usuarios que YA tienen Pase Mes activo
    2. Pase Día y Pase Flex: NO pueden recibir cupones ni referidos
    3. Cupón debe estar disponible (activo y no expirado)
    4. Cupones NO son acumulables con descuentos por referido
    """
    # 1. Obtener configuración del plan
    config_plan = PLANES_CONFIG.get(membresia_simple.tipo_plan)
    if not config_plan:
        raise ValueError(f"Plan no válido: {membresia_simple.tipo_plan}")

    # 2. VALIDAR: Pase Día y Pase Flex NO pueden recibir cupones ni referidos
    if membresia_simple.tipo_plan in [TipoPlan.PASE_DIARIO, TipoPlan.PASE_FLEX]:
        if membresia_simple.cupon_codigo:
            raise ValueError("Pase Día y Pase Flex no pueden recibir cupones")
        if membresia_simple.referido_por_id:
            raise ValueError("Pase Día y Pase Flex no pueden recibir beneficios de referidos")

    # 3. VALIDAR CUPÓN si se proporcionó
    cupon_aplicado = None
    if membresia_simple.cupon_codigo:
        # Buscar cupón
        cupon = cupones_crud.get_cupon_by_codigo(db, membresia_simple.cupon_codigo)

        if not cupon:
            raise ValueError(f"Cupón '{membresia_simple.cupon_codigo}' no encontrado")

        # Validar que esté disponible
        if not cupon.esta_vigente():
            if not cupon.activo:
                raise ValueError(f"Cupón '{membresia_simple.cupon_codigo}' no está activo")
            elif cupon.fecha_expiracion and cupon.fecha_expiracion < datetime.utcnow():
                raise ValueError(f"Cupón '{membresia_simple.cupon_codigo}' ha expirado")

        # VALIDAR: Cupones 3M y 6M SOLO para usuarios con Pase Mes activo
        codigo_upper = membresia_simple.cupon_codigo.upper()
        if "3M" in codigo_upper or "UPGRADE-3M" in codigo_upper:
            if membresia_simple.tipo_plan != TipoPlan.PLAN_3_MESES:
                raise ValueError("El cupón '3M' solo aplica al Plan de 3 Meses")

            # Verificar que el usuario tenga Pase Mes activo actualmente
            membresia_actual = get_membresia_activa_by_usuario(db, membresia_simple.usuario_id)
            if not membresia_actual or membresia_actual.tipo_plan != TipoPlan.MENSUAL:
                raise ValueError("El cupón '3M' solo aplica a usuarios que actualmente tienen Pase Mes activo")

        if "6M" in codigo_upper or "UPGRADE-6M" in codigo_upper:
            if membresia_simple.tipo_plan != TipoPlan.PLAN_6_MESES:
                raise ValueError("El cupón '6M' solo aplica al Plan de 6 Meses")

            # Verificar que el usuario tenga Pase Mes activo actualmente
            membresia_actual = get_membresia_activa_by_usuario(db, membresia_simple.usuario_id)
            if not membresia_actual or membresia_actual.tipo_plan != TipoPlan.MENSUAL:
                raise ValueError("El cupón '6M' solo aplica a usuarios que actualmente tienen Pase Mes activo")

        # Cupón válido
        cupon_aplicado = cupon

    # 4. Desactivar membresías anteriores del usuario
    desactivar_membresias_anteriores(db, membresia_simple.usuario_id)

    # 5. Calcular precio con descuento
    precio_base = config_plan["precio"]
    precio_con_descuento = precio_base
    descuento_aplicado_tipo = None

    # PRIORIDAD: Si hay cupón Y referido, NO son acumulables - usar el mayor
    tiene_cupon = cupon_aplicado is not None
    tiene_referido = membresia_simple.referido_por_id is not None

    if tiene_cupon and tiene_referido:
        # Comparar descuentos: cupón vs 5% referido
        descuento_cupon = cupon_aplicado.descuento
        descuento_referido = int(REFERIDOS_CONFIG["descuento_referido"] * 100)

        if descuento_cupon >= descuento_referido:
            # Usar cupón
            precio_con_descuento = int(precio_base * (1 - descuento_cupon / 100))
            descuento_aplicado_tipo = "cupon"
        else:
            # Usar referido
            # Validar referidor
            referidor = db.query(Usuario).filter(Usuario.id == membresia_simple.referido_por_id).first()
            if not referidor:
                raise ValueError(f"El referidor con ID {membresia_simple.referido_por_id} no existe")

            # Verificar que el referidor tiene membresía activa >= Mensual
            membresia_referidor = get_membresia_activa_by_usuario(db, membresia_simple.referido_por_id)
            PLANES_VALIDOS = [TipoPlan.MENSUAL, TipoPlan.PLAN_3_MESES, TipoPlan.PLAN_6_MESES, TipoPlan.ELITE_ANUAL]

            if not membresia_referidor or membresia_referidor.tipo_plan not in PLANES_VALIDOS:
                raise ValueError("El referidor debe tener una membresía activa Mensual o superior")

            descuento = REFERIDOS_CONFIG["descuento_referido"]
            precio_con_descuento = int(precio_base * (1 - descuento))
            descuento_aplicado_tipo = "referido"

    elif tiene_cupon:
        # Solo cupón
        precio_con_descuento = int(precio_base * (1 - cupon_aplicado.descuento / 100))
        descuento_aplicado_tipo = "cupon"

    elif tiene_referido:
        # Solo referido (Y plan != PASE_DIARIO/PASE_FLEX - ya validado arriba)
        referidor = db.query(Usuario).filter(Usuario.id == membresia_simple.referido_por_id).first()
        if not referidor:
            raise ValueError(f"El referidor con ID {membresia_simple.referido_por_id} no existe")

        # Verificar que el referidor tiene membresía activa >= Mensual
        membresia_referidor = get_membresia_activa_by_usuario(db, membresia_simple.referido_por_id)
        PLANES_VALIDOS = [TipoPlan.MENSUAL, TipoPlan.PLAN_3_MESES, TipoPlan.PLAN_6_MESES, TipoPlan.ELITE_ANUAL]

        if not membresia_referidor or membresia_referidor.tipo_plan not in PLANES_VALIDOS:
            raise ValueError("El referidor debe tener una membresía activa Mensual o superior")

        descuento = REFERIDOS_CONFIG["descuento_referido"]
        precio_con_descuento = int(precio_base * (1 - descuento))
        descuento_aplicado_tipo = "referido"

    # 6. Calcular fechas (usar hora local de Colombia)
    fecha_inicio = datetime.now(COLOMBIA_TZ)

    # Pase Diario expira el mismo día (23:59:59), otros planes usan cálculo normal
    if membresia_simple.tipo_plan == TipoPlan.PASE_DIARIO:
        fecha_fin = fecha_inicio.replace(hour=23, minute=59, second=59, microsecond=999999)
    else:
        fecha_fin = Membresia.calcular_fecha_fin(fecha_inicio, config_plan["dias"])

    # 7. Preparar descripción según el descuento aplicado
    descripcion_final = membresia_simple.descripcion
    if descuento_aplicado_tipo == "cupon" and cupon_aplicado:
        descripcion_final = f"Cupón {cupon_aplicado.codigo} aplicado ({cupon_aplicado.descuento}% descuento)"
    elif descuento_aplicado_tipo == "referido":
        descripcion_final = "Descuento 5% por referido aplicado"

    # 8. Crear membresía completa
    # Solo guardar referido_por_id si efectivamente se usó el descuento de referido
    referido_final = membresia_simple.referido_por_id if descuento_aplicado_tipo == "referido" else None

    membresia_data = MembresiaCreate(
        usuario_id=membresia_simple.usuario_id,
        tipo_plan=membresia_simple.tipo_plan,
        precio=precio_con_descuento,  # Mantener por compatibilidad
        precio_original=precio_base,           # NUEVO
        precio_final=precio_con_descuento,     # NUEVO
        duracion_dias=config_plan["dias"],
        fecha_inicio=fecha_inicio,
        fecha_fin=fecha_fin,
        tipo_pago=membresia_simple.tipo_pago,
        descripcion=descripcion_final,
        referido_por_id=referido_final  # Solo si se aplicó descuento de referido
    )

    # 9. Crear el objeto Membresia y guardar en BD
    db_membresia = Membresia(**membresia_data.model_dump())

    db.add(db_membresia)
    db.commit()
    db.refresh(db_membresia)

    # 10. Incrementar uso del cupón si se aplicó
    if descuento_aplicado_tipo == "cupon" and cupon_aplicado:
        cupones_crud.incrementar_uso_cupon(db, cupon_aplicado.id)

    # 11. Crear registro de referido si se aplicó descuento por referido
    if descuento_aplicado_tipo == "referido" and referido_final:
        try:
            referido_data = ReferidoCreate(
                referidor_id=referido_final,
                referido_id=membresia_simple.usuario_id,
                membresia_id=db_membresia.id
            )
            referido_creado = referidos_crud.create_referido(db, referido_data)

            # Verificar y activar si cumple condición (membresía de plan largo)
            if membresia_simple.tipo_plan in [TipoPlan.MENSUAL, TipoPlan.PLAN_3_MESES, TipoPlan.PLAN_6_MESES, TipoPlan.ELITE_ANUAL]:
                # Activar beneficio inmediatamente
                referido_creado.cumple_condicion = True
                referido_creado.fecha_activacion = datetime.now(COLOMBIA_TZ)
                db.commit()
        except Exception as e:
            # Si falla la creación del referido, no queremos que falle toda la membresía
            print(f"Warning: No se pudo crear registro de referido: {e}")

    # 12. Activar usuario (ya que tiene una membresía activa y vigente)
    usuario = db.query(Usuario).filter(Usuario.id == membresia_simple.usuario_id).first()
    if usuario and not usuario.activo:
        usuario.activo = True
        db.commit()

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

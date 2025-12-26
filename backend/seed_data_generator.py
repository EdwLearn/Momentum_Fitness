"""
Generador de datos de prueba para el sistema de gimnasio
Genera 500 clientes con distribución realista y datos coherentes
"""

import random
import sys
from datetime import datetime, timedelta, time, date
from pathlib import Path
from typing import List, Tuple, Optional

# Añadir el directorio raíz al path
sys.path.append(str(Path(__file__).parent))

from sqlalchemy.orm import Session
from app.core.database import engine, Base, get_db

# Import all models first to avoid relationship issues
from app.modules.usuarios.models.usuario import Usuario, TipoUsuario
from app.modules.usuarios.models.membresia import (
    Membresia, TipoPlan, EstadoMembresia, TipoPago, PLANES_CONFIG
)
from app.modules.asistencia.models.asistencia import Asistencia
from app.modules.empleados.models.empleado import Empleado, TipoEmpleado
from app.modules.empleados.models.asistencia_empleado import AsistenciaEmpleado
from app.modules.metricas.models.metrica import Metrica
from app.modules.bot.models.conversacion import Conversacion
from app.modules.bot.models.logro import Logro
from app.models.cupon import Cupon, NichoCupon
from app.models.referido import Referido

# ==================== CONFIGURACIÓN ====================

# Distribución de planes (total 500 clientes)
PLAN_DISTRIBUTION = {
    TipoPlan.PASE_DIARIO: 50,      # 10%
    TipoPlan.PASE_FLEX: 75,        # 15%
    TipoPlan.MENSUAL: 175,         # 35%
    TipoPlan.PLAN_3_MESES: 100,    # 20%
    TipoPlan.PLAN_6_MESES: 70,     # 14%
    TipoPlan.ELITE_ANUAL: 30,      # 6% (Platinum)
}

# Frecuencia de asistencia por plan (rango de días en un mes)
ASISTENCIA_FRECUENCIA = {
    TipoPlan.PASE_DIARIO: (1, 1),
    TipoPlan.PASE_FLEX: (10, 14),
    TipoPlan.MENSUAL: (12, 20),
    TipoPlan.PLAN_3_MESES: (15, 25),
    TipoPlan.PLAN_6_MESES: (18, 28),
    TipoPlan.ELITE_ANUAL: (20, 30),
}

# Horarios de mayor asistencia
HORARIOS_PICO = [
    (6, 9, 0.30),    # 30% entre 06:00-09:00
    (18, 22, 0.25),  # 25% entre 18:00-22:00
]

# Rango de fechas para membresías
FECHA_INICIO_MEMBRESIAS = datetime(2024, 11, 25)
FECHA_FIN_MEMBRESIAS = datetime(2024, 12, 25)

# Rango de fechas para asistencias
FECHA_INICIO_ASISTENCIAS = date(2024, 11, 25)
FECHA_FIN_ASISTENCIAS = date(2024, 12, 25)

# Porcentajes de uso de cupones y referidos
PORCENTAJE_REFERIDOS = 0.30  # 30%
PORCENTAJE_CUPON_PRIMERA_VEZ = 0.15  # 15%
PORCENTAJE_CUPON_RENUEVA = 0.08  # 8%
PORCENTAJE_CUPON_UPGRADE_3M = 0.00  # No usar (deprecated)
PORCENTAJE_CUPON_UPGRADE_6M = 0.05  # 5%

# ==================== DATOS DE PRUEBA ====================

NOMBRES_MASCULINOS = [
    "Carlos", "Juan", "Diego", "Andrés", "Felipe", "Santiago", "Sebastián", "Mateo",
    "Daniel", "David", "Miguel", "Alejandro", "Gabriel", "Nicolás", "Samuel",
    "Julián", "Martín", "Esteban", "Ricardo", "Fernando", "Leonardo", "Camilo",
    "Oscar", "Javier", "Pablo", "Cristian", "José", "Luis", "Manuel", "Fabián",
    "Mauricio", "Jorge", "Álvaro", "Rodrigo", "Gustavo", "Sergio", "Édgar",
    "Hernán", "Raúl", "César", "Iván", "Marco", "Nelson", "Wilson", "Óscar",
    "Héctor", "Germán", "Arturo", "Rubén", "Emilio"
]

NOMBRES_FEMENINOS = [
    "María", "Laura", "Camila", "Valentina", "Daniela", "Sara", "Sofía", "Isabella",
    "Natalia", "Carolina", "Andrea", "Juliana", "Paula", "Alejandra", "Manuela",
    "Ana", "Luisa", "Gabriela", "Diana", "Claudia", "Marcela", "Paola", "Catalina",
    "Viviana", "Mónica", "Sandra", "Adriana", "Lucía", "Elena", "Patricia",
    "Silvia", "Gloria", "Angela", "Beatriz", "Rocío", "Pilar", "Rosa", "Carmen",
    "Teresa", "Mercedes", "Lina", "Johanna", "Kelly", "Yenny", "Milena"
]

APELLIDOS = [
    "García", "Rodríguez", "Martínez", "Hernández", "López", "González", "Pérez", "Sánchez",
    "Ramírez", "Torres", "Flores", "Rivera", "Gómez", "Díaz", "Reyes", "Cruz",
    "Morales", "Jiménez", "Ruiz", "Álvarez", "Romero", "Vargas", "Castro", "Ortiz",
    "Ramos", "Medina", "Guerrero", "Vega", "Silva", "Rojas", "Mendoza", "Gutiérrez",
    "Aguilar", "Navarro", "Cortés", "Campos", "Moreno", "Ríos", "Muñoz", "Acosta",
    "Valencia", "Herrera", "Pacheco", "Salazar", "Contreras", "Mejía", "Cárdenas",
    "Ospina", "Henao", "Parra", "Quintero", "Bedoya", "Zapata", "Londoño", "Montoya"
]

OBJETIVOS_FITNESS = [
    "Perder peso", "Ganar masa muscular", "Tonificar", "Mejorar resistencia",
    "Mantenerse en forma", "Aumentar fuerza", "Mejorar salud cardiovascular",
    "Competición deportiva", "Rehabilitación", "Estilo de vida saludable"
]

# ==================== UTILIDADES ====================

def generar_cedula_unica(cedulas_usadas: set) -> str:
    """Genera una cédula colombiana única de 10 dígitos"""
    while True:
        cedula = str(random.randint(1000000000, 9999999999))
        if cedula not in cedulas_usadas:
            cedulas_usadas.add(cedula)
            return cedula

def generar_email(nombre: str, apellido: str, emails_usados: set) -> str:
    """Genera un email único"""
    dominios = ["gmail.com", "hotmail.com", "outlook.com", "yahoo.com"]
    base = f"{nombre.lower()}.{apellido.lower()}"
    base = base.replace(" ", "").replace("á", "a").replace("é", "e").replace("í", "i").replace("ó", "o").replace("ú", "u")

    contador = 1
    while True:
        if contador == 1:
            email = f"{base}@{random.choice(dominios)}"
        else:
            email = f"{base}{contador}@{random.choice(dominios)}"

        if email not in emails_usados:
            emails_usados.add(email)
            return email
        contador += 1

def generar_telefono() -> str:
    """Genera un número de teléfono colombiano"""
    return f"3{random.randint(100000000, 999999999)}"

def generar_fecha_nacimiento() -> datetime:
    """Genera fecha de nacimiento para edad entre 18-40 años"""
    edad = random.randint(18, 40)
    hoy = datetime.now()
    año_nacimiento = hoy.year - edad
    mes = random.randint(1, 12)
    dia = random.randint(1, 28)
    return datetime(año_nacimiento, mes, dia)

def generar_fecha_membresia() -> datetime:
    """Genera fecha de inicio de membresía entre nov 25 - dic 25, 2024"""
    dias_diferencia = (FECHA_FIN_MEMBRESIAS - FECHA_INICIO_MEMBRESIAS).days
    dias_random = random.randint(0, dias_diferencia)
    fecha = FECHA_INICIO_MEMBRESIAS + timedelta(days=dias_random)
    # Añadir hora aleatoria
    hora = random.randint(6, 21)
    minuto = random.randint(0, 59)
    return fecha.replace(hour=hora, minute=minuto, second=0)

def calcular_precio_con_descuento(precio_base: int, es_referido: bool, cupon_descuento: Optional[int]) -> Tuple[int, int]:
    """
    Calcula precio original y final con descuentos
    Regla: NO se pueden aplicar cupón y referido juntos
    """
    precio_original = precio_base

    if es_referido:
        # 5% descuento por referido
        precio_final = int(precio_base * 0.95)
    elif cupon_descuento:
        # Aplicar descuento del cupón
        precio_final = int(precio_base * (1 - cupon_descuento / 100))
    else:
        precio_final = precio_base

    return precio_original, precio_final

def generar_hora_asistencia(es_pico: bool = False) -> time:
    """Genera hora de asistencia realista"""
    if es_pico:
        # Elegir un horario pico
        hora_inicio, hora_fin, _ = random.choice(HORARIOS_PICO)
        hora = random.randint(hora_inicio, hora_fin - 1)
    else:
        # Horario normal (resto del día, 9-18)
        hora = random.randint(9, 17)

    minuto = random.randint(0, 59)
    return time(hora, minuto)

def es_fin_de_semana(fecha: date) -> bool:
    """Verifica si una fecha es fin de semana"""
    return fecha.weekday() >= 5  # 5=sábado, 6=domingo

# ==================== GENERADORES DE DATOS ====================

def crear_cupones(db: Session):
    """Crea los 3 cupones especificados"""
    print("\n📋 Creando cupones...")

    cupones = [
        {
            "codigo": "PRIMERA_VEZ",
            "nicho": NichoCupon.ESTETICO,
            "descuento": 10,
            "fecha_expiracion": datetime(2026, 2, 28),
            "activo": True,
            "usos_total": 0,
            "usos_anio": 0
        },
        {
            "codigo": "RENUEVA_AHORA",
            "nicho": NichoCupon.ESTETICO,
            "descuento": 10,
            "fecha_expiracion": datetime(2026, 3, 31),
            "activo": True,
            "usos_total": 0,
            "usos_anio": 0
        },
        {
            "codigo": "UPGRADE_6M",
            "nicho": NichoCupon.ESTETICO,
            "descuento": 15,
            "fecha_expiracion": datetime(2026, 3, 31),
            "activo": True,
            "usos_total": 0,
            "usos_anio": 0
        }
    ]

    cupones_creados = []
    for cupon_data in cupones:
        cupon = Cupon(**cupon_data)
        db.add(cupon)
        cupones_creados.append(cupon)

    db.commit()
    print(f"✅ Creados {len(cupones_creados)} cupones")
    return cupones_creados

def crear_empleados(db: Session):
    """Crea los 4 empleados especificados"""
    print("\n👥 Creando empleados...")

    empleados_data = [
        {
            "nombre": "Carlos",
            "apellido": "Ramírez",
            "cedula": "1234567890",
            "email": "carlos.ramirez@momentum.com",
            "telefono": "3001234567",
            "tipo_empleado": TipoEmpleado.ENTRENADOR,
            "horario": "06:00-14:00",
            "dias_laborales": "Lunes-Sábado",
            "fecha_contratacion": date(2024, 1, 15),
            "salario": 2000000,
            "activo": 1
        },
        {
            "nombre": "Laura",
            "apellido": "Gómez",
            "cedula": "1234567891",
            "email": "laura.gomez@momentum.com",
            "telefono": "3001234568",
            "tipo_empleado": TipoEmpleado.ENTRENADOR,
            "horario": "14:00-22:00",
            "dias_laborales": "Lunes-Sábado",
            "fecha_contratacion": date(2024, 1, 15),
            "salario": 2000000,
            "activo": 1
        },
        {
            "nombre": "Andrés",
            "apellido": "Torres",
            "cedula": "1234567892",
            "email": "andres.torres@momentum.com",
            "telefono": "3001234569",
            "tipo_empleado": TipoEmpleado.RECEPCION,
            "horario": "06:00-14:00",
            "dias_laborales": "Lunes-Sábado",
            "fecha_contratacion": date(2024, 2, 1),
            "salario": 1500000,
            "activo": 1
        },
        {
            "nombre": "María",
            "apellido": "Henao",
            "cedula": "1234567893",
            "email": "maria.henao@momentum.com",
            "telefono": "3001234570",
            "tipo_empleado": TipoEmpleado.RECEPCION,
            "horario": "14:00-22:00",
            "dias_laborales": "Lunes-Sábado",
            "fecha_contratacion": date(2024, 2, 1),
            "salario": 1500000,
            "activo": 1
        }
    ]

    empleados_creados = []
    for emp_data in empleados_data:
        empleado = Empleado(**emp_data)
        db.add(empleado)
        empleados_creados.append(empleado)

    db.commit()
    print(f"✅ Creados {len(empleados_creados)} empleados")
    return empleados_creados

def crear_asistencias_empleados(db: Session, empleados: List[Empleado]):
    """Genera asistencias de empleados para 1 mes (nov 25 - dic 25)"""
    print("\n⏰ Generando asistencias de empleados...")

    asistencias_creadas = 0
    fecha_actual = FECHA_INICIO_ASISTENCIAS

    while fecha_actual <= FECHA_FIN_ASISTENCIAS:
        # Solo lunes a sábado
        if fecha_actual.weekday() < 6:  # 0-5 = lun-sáb
            for empleado in empleados:
                # Determinar si el empleado asiste este día
                # 2-3 días sin registro por mes (permisos)
                if random.random() < 0.10:  # 10% chance de ausencia
                    continue

                # Parsear horario del empleado
                horario_parts = empleado.horario.split("-")
                hora_inicio = int(horario_parts[0].split(":")[0])
                hora_fin = int(horario_parts[1].split(":")[0])

                # Generar hora de entrada con variación ±10 min
                minutos_variacion = random.randint(-10, 10)

                # Ocasionalmente llegar tarde (2-4 veces al mes)
                es_tarde = random.random() < 0.08  # ~2-3 veces en 30 días
                if es_tarde:
                    minutos_variacion += random.randint(20, 30)

                hora_entrada = time(
                    hora_inicio,
                    max(0, min(59, minutos_variacion))
                )

                # Generar hora de salida
                minutos_variacion_salida = random.randint(-10, 10)
                hora_salida = time(
                    hora_fin,
                    max(0, min(59, minutos_variacion_salida))
                )

                # Calcular horas trabajadas
                entrada_datetime = datetime.combine(fecha_actual, hora_entrada)
                salida_datetime = datetime.combine(fecha_actual, hora_salida)
                horas_trabajadas = (salida_datetime - entrada_datetime).seconds / 3600

                asistencia = AsistenciaEmpleado(
                    empleado_id=empleado.id,
                    fecha=fecha_actual,
                    hora_entrada=hora_entrada,
                    hora_salida=hora_salida,
                    horas_trabajadas=round(horas_trabajadas, 2)
                )
                db.add(asistencia)
                asistencias_creadas += 1

        fecha_actual += timedelta(days=1)

    db.commit()
    print(f"✅ Creadas {asistencias_creadas} asistencias de empleados")

def crear_clientes_y_membresias(db: Session, cupones: List[Cupon]):
    """Crea 500 clientes con distribución realista de planes y descuentos"""
    print("\n👤 Creando 500 clientes con membresías...")

    cedulas_usadas = set()
    emails_usados = set()
    clientes_creados = []

    # Preparar lista de planes según distribución
    planes_lista = []
    for plan, cantidad in PLAN_DISTRIBUTION.items():
        planes_lista.extend([plan] * cantidad)

    random.shuffle(planes_lista)

    # Determinar qué clientes tendrán referidos y cupones
    total_clientes = len(planes_lista)
    indices_referidos = set(random.sample(range(total_clientes), int(total_clientes * PORCENTAJE_REFERIDOS)))

    # Cupones (mutuamente excluyentes con referidos)
    indices_disponibles = [i for i in range(total_clientes) if i not in indices_referidos]
    n_primera_vez = int(total_clientes * PORCENTAJE_CUPON_PRIMERA_VEZ)
    n_renueva = int(total_clientes * PORCENTAJE_CUPON_RENUEVA)
    n_upgrade_6m = int(total_clientes * PORCENTAJE_CUPON_UPGRADE_6M)

    indices_primera_vez = set(random.sample(indices_disponibles, n_primera_vez))
    indices_disponibles = [i for i in indices_disponibles if i not in indices_primera_vez]
    indices_renueva = set(random.sample(indices_disponibles, n_renueva))
    indices_disponibles = [i for i in indices_disponibles if i not in indices_renueva]
    indices_upgrade_6m = set(random.sample(indices_disponibles, n_upgrade_6m))

    # Crear clientes
    for idx, tipo_plan in enumerate(planes_lista):
        # Determinar género (60% hombres, 40% mujeres)
        es_masculino = random.random() < 0.6
        genero = "Masculino" if es_masculino else "Femenino"

        # Generar datos personales
        nombre = random.choice(NOMBRES_MASCULINOS if es_masculino else NOMBRES_FEMENINOS)
        apellido = f"{random.choice(APELLIDOS)} {random.choice(APELLIDOS)}"
        cedula = generar_cedula_unica(cedulas_usadas)
        email = generar_email(nombre, apellido, emails_usados)
        telefono = generar_telefono()
        fecha_nacimiento = generar_fecha_nacimiento()

        # Crear usuario/cliente
        cliente = Usuario(
            nombre=nombre,
            apellido=apellido,
            email=email,
            telefono=telefono,
            tipo=TipoUsuario.CLIENTE,
            activo=True,
            genero=genero,
            fecha_nacimiento=fecha_nacimiento,
            fecha_registro=generar_fecha_membresia(),
            peso_inicial=random.randint(55, 95) if es_masculino else random.randint(45, 75),
            altura=random.randint(160, 190) if es_masculino else random.randint(150, 175),
            objetivo=random.choice(OBJETIVOS_FITNESS),
            dias_entrenados=0
        )

        db.add(cliente)
        db.flush()  # Para obtener el ID

        # Determinar descuentos
        es_referido = idx in indices_referidos
        cupon_codigo = None
        cupon_descuento = None

        if not es_referido:  # Solo aplicar cupón si NO es referido
            if idx in indices_primera_vez and tipo_plan in [TipoPlan.PLAN_3_MESES, TipoPlan.PLAN_6_MESES, TipoPlan.ELITE_ANUAL]:
                cupon_codigo = "PRIMERA_VEZ"
                cupon_descuento = 10
            elif idx in indices_renueva and tipo_plan in [TipoPlan.MENSUAL, TipoPlan.PLAN_3_MESES, TipoPlan.PLAN_6_MESES, TipoPlan.ELITE_ANUAL]:
                cupon_codigo = "RENUEVA_AHORA"
                cupon_descuento = 10
            elif idx in indices_upgrade_6m and tipo_plan == TipoPlan.PLAN_6_MESES:
                cupon_codigo = "UPGRADE_6M"
                cupon_descuento = 15

        # Crear membresía
        plan_config = PLANES_CONFIG[tipo_plan]
        precio_base = plan_config["precio"]
        precio_original, precio_final = calcular_precio_con_descuento(precio_base, es_referido, cupon_descuento)

        fecha_inicio = generar_fecha_membresia()
        fecha_fin = fecha_inicio + timedelta(days=plan_config["dias"])

        membresia = Membresia(
            usuario_id=cliente.id,
            tipo_plan=tipo_plan,
            estado=EstadoMembresia.ACTIVA,
            fecha_inicio=fecha_inicio,
            fecha_fin=fecha_fin,
            precio=precio_final,  # Legacy
            precio_original=precio_original,
            precio_final=precio_final,
            duracion_dias=plan_config["dias"],
            tipo_pago=random.choice(list(TipoPago)),
            activo=True
        )

        db.add(membresia)
        db.flush()

        # Incrementar uso de cupón si aplica
        if cupon_codigo:
            cupon = next((c for c in cupones if c.codigo == cupon_codigo), None)
            if cupon:
                cupon.incrementar_uso()

        clientes_creados.append({
            "cliente": cliente,
            "membresia": membresia,
            "es_referido": es_referido,
            "tipo_plan": tipo_plan
        })

        if (idx + 1) % 100 == 0:
            print(f"  Creados {idx + 1}/{total_clientes} clientes...")

    db.commit()
    print(f"✅ Creados {len(clientes_creados)} clientes con membresías")

    return clientes_creados

def crear_referidos(db: Session, clientes_data: List[dict]):
    """Crea relaciones de referidos"""
    print("\n🤝 Creando relaciones de referidos...")

    # Filtrar clientes que pueden ser referidores (con planes largos)
    referidores_potenciales = [
        c for c in clientes_data
        if c["tipo_plan"] in [TipoPlan.MENSUAL, TipoPlan.PLAN_3_MESES, TipoPlan.PLAN_6_MESES, TipoPlan.ELITE_ANUAL]
    ]

    # Filtrar clientes que son referidos
    clientes_referidos = [c for c in clientes_data if c["es_referido"]]

    referidos_creados = 0
    for cliente_data in clientes_referidos:
        # Elegir un referidor aleatorio
        referidor_data = random.choice(referidores_potenciales)

        # No puede referirse a sí mismo
        if referidor_data["cliente"].id == cliente_data["cliente"].id:
            continue

        # Actualizar campo en usuario
        cliente_data["cliente"].referido_por_cedula = referidor_data["cliente"].email  # Usar email como identificador

        # Actualizar membresía
        cliente_data["membresia"].referido_por_id = referidor_data["cliente"].id

        # Crear registro en tabla referidos
        referido = Referido(
            referidor_id=referidor_data["cliente"].id,
            referido_id=cliente_data["cliente"].id,
            membresia_id=cliente_data["membresia"].id,
            cumple_condicion=True,
            beneficio="5% descuento",
            fecha_referido=cliente_data["membresia"].fecha_inicio,
            fecha_activacion=cliente_data["membresia"].fecha_inicio
        )
        db.add(referido)
        referidos_creados += 1

    db.commit()
    print(f"✅ Creadas {referidos_creados} relaciones de referidos")

def crear_asistencias_clientes(db: Session, clientes_data: List[dict]):
    """Genera asistencias realistas para clientes según su plan"""
    print("\n📅 Generando asistencias de clientes (nov 25 - dic 25)...")

    asistencias_creadas = 0

    for cliente_data in clientes_data:
        cliente = cliente_data["cliente"]
        tipo_plan = cliente_data["tipo_plan"]
        membresia = cliente_data["membresia"]

        # Obtener rango de frecuencia para este plan
        min_asistencias, max_asistencias = ASISTENCIA_FRECUENCIA[tipo_plan]
        num_asistencias = random.randint(min_asistencias, max_asistencias)

        # Generar fechas de asistencia
        # Crear pool de fechas posibles
        fecha_inicio_cliente = max(membresia.fecha_inicio.date(), FECHA_INICIO_ASISTENCIAS)
        fecha_fin_cliente = min(membresia.fecha_fin.date(), FECHA_FIN_ASISTENCIAS)

        # Si la membresía no está en el rango, saltar
        if fecha_inicio_cliente > FECHA_FIN_ASISTENCIAS or fecha_fin_cliente < FECHA_INICIO_ASISTENCIAS:
            continue

        # Generar fechas de asistencia
        fechas_posibles = []
        fecha_actual = fecha_inicio_cliente
        while fecha_actual <= fecha_fin_cliente:
            # Más asistencias lun-vie que fin de semana
            if es_fin_de_semana(fecha_actual):
                if random.random() < 0.3:  # 30% probabilidad en fin de semana
                    fechas_posibles.append(fecha_actual)
            else:
                fechas_posibles.append(fecha_actual)

            fecha_actual += timedelta(days=1)

        # Seleccionar fechas aleatorias
        if len(fechas_posibles) > num_asistencias:
            fechas_asistencia = random.sample(fechas_posibles, num_asistencias)
        else:
            fechas_asistencia = fechas_posibles

        fechas_asistencia.sort()

        # Crear asistencias
        for fecha in fechas_asistencia:
            # Determinar si es en horario pico
            es_pico = random.random() < 0.55  # 55% en horario pico (30% + 25%)
            hora_entrada = generar_hora_asistencia(es_pico)

            # Hora de salida (1-2 horas después)
            minutos_entrenamiento = random.randint(60, 120)
            hora_entrada_datetime = datetime.combine(fecha, hora_entrada)
            hora_salida_datetime = hora_entrada_datetime + timedelta(minutes=minutos_entrenamiento)
            hora_salida = hora_salida_datetime.time()

            asistencia = Asistencia(
                usuario_id=cliente.id,
                fecha=fecha,
                hora_entrada=hora_entrada,
                hora_salida=hora_salida,
                timestamp_entrada=datetime.combine(fecha, hora_entrada),
                timestamp_salida=datetime.combine(fecha, hora_salida)
            )
            db.add(asistencia)
            asistencias_creadas += 1

        # Actualizar días entrenados y última asistencia
        if fechas_asistencia:
            cliente.dias_entrenados = len(fechas_asistencia)
            cliente.ultima_asistencia = datetime.combine(fechas_asistencia[-1], time(12, 0))

        if (clientes_data.index(cliente_data) + 1) % 100 == 0:
            print(f"  Generadas asistencias para {clientes_data.index(cliente_data) + 1}/{len(clientes_data)} clientes...")

    db.commit()
    print(f"✅ Creadas {asistencias_creadas} asistencias de clientes")

# ==================== FUNCIÓN PRINCIPAL ====================

def generar_seed_data():
    """Función principal que genera todos los datos de prueba"""
    print("=" * 60)
    print("🏋️  GENERADOR DE DATOS DE PRUEBA - MOMENTUM FITNESS")
    print("=" * 60)

    # Crear todas las tablas
    print("\n🗄️  Creando tablas en la base de datos...")
    Base.metadata.create_all(bind=engine)
    print("✅ Tablas creadas")

    # Obtener sesión de base de datos
    db = next(get_db())

    try:
        # 1. Crear cupones
        cupones = crear_cupones(db)

        # 2. Crear empleados
        empleados = crear_empleados(db)

        # 3. Crear asistencias de empleados
        crear_asistencias_empleados(db, empleados)

        # 4. Crear clientes y membresías
        clientes_data = crear_clientes_y_membresias(db, cupones)

        # 5. Crear relaciones de referidos
        crear_referidos(db, clientes_data)

        # 6. Crear asistencias de clientes
        crear_asistencias_clientes(db, clientes_data)

        print("\n" + "=" * 60)
        print("✅ GENERACIÓN DE DATOS COMPLETADA EXITOSAMENTE")
        print("=" * 60)
        print(f"\n📊 Resumen:")
        print(f"  - Cupones: 3")
        print(f"  - Empleados: 4")
        print(f"  - Clientes: 500")
        print(f"  - Asistencias generadas para período nov 25 - dic 25, 2024")
        print(f"\n🎉 Base de datos lista para usar!")

    except Exception as e:
        print(f"\n❌ Error durante la generación de datos: {e}")
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    generar_seed_data()

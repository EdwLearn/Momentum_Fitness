#!/usr/bin/env python3
"""
Script para generar 100 usuarios de prueba en Momentum Fitness con datos realistas.
Genera usuarios, membresías, y asistencias según especificaciones.
"""

import requests
import random
import sqlite3
from datetime import datetime, timedelta, time
from typing import List, Dict, Optional
import sys

# Configuración
BASE_URL = "http://localhost:8000"
TOTAL_USUARIOS = 100
DB_PATH = "gimnasio.db"

# Nombres colombianos comunes
NOMBRES_HOMBRES = [
    "Carlos", "Juan", "Andrés", "Felipe", "David", "Daniel", "Miguel", "Diego",
    "Santiago", "Sebastián", "Alejandro", "José", "Luis", "Jorge", "Pablo",
    "Mauricio", "Camilo", "Julián", "Christian", "Oscar", "Fernando", "Ricardo",
    "Gabriel", "Nicolás", "Mateo", "Samuel", "Tomás", "Martín", "Leonardo"
]

NOMBRES_MUJERES = [
    "María", "Laura", "Daniela", "Valentina", "Carolina", "Andrea", "Camila",
    "Natalia", "Paula", "Sara", "Juliana", "Isabella", "Sofía", "Ana",
    "Alejandra", "Catalina", "Diana", "Marcela", "Paola", "Lucía", "Melissa",
    "Gabriela", "Vanessa", "Jessica", "Katherine", "Adriana", "Claudia"
]

APELLIDOS = [
    "García", "Rodríguez", "González", "Hernández", "López", "Martínez",
    "Pérez", "Ramírez", "Sánchez", "Torres", "Díaz", "Vargas", "Castro",
    "Gómez", "Moreno", "Jiménez", "Rivera", "Restrepo", "Arias", "Valencia",
    "Muñoz", "Rojas", "Mejía", "Ortiz", "Ruiz", "Castaño", "Vélez", "Salazar",
    "Gutiérrez", "Ospina", "Montoya", "Zapata", "Arango", "Bedoya", "Giraldo"
]

DIRECCIONES_MEDELLIN = [
    "Calle 50 #45-23, El Poblado", "Carrera 43A #12-34, El Poblado",
    "Calle 10 #38-15, Laureles", "Carrera 70 #44-20, Laureles",
    "Calle 33 #80-45, Belén", "Carrera 65 #8-92, Belén",
    "Calle 52 #43-104, Los Colores", "Avenida El Poblado #5A-23",
    "Carrera 80 #33-12, Estadio", "Calle 67 #52-20, Manrique",
    "Circular 4 #73-50, Robledo", "Carrera 52 #62-18, Aranjuez",
    "Calle 44 #66-34, Boston", "Transversal 39A #75-105, Calasanz"
]

# Distribución de planes
PLANES_DISTRIBUCION = {
    "pase_diario": 10,
    "pase_flex": 15,
    "mensual": 35,
    "plan_3_meses": 20,
    "plan_6_meses": 15,
    "elite_anual": 5
}

# Frecuencia de asistencia por plan (veces por semana)
FRECUENCIA_ASISTENCIA = {
    "pase_diario": (1, 1),      # Solo 1 vez (día de compra)
    "pase_flex": (2, 3),        # 2-3 veces/semana
    "mensual": (3, 4),          # 3-4 veces/semana
    "plan_3_meses": (4, 5),     # 4-5 veces/semana
    "plan_6_meses": (4, 5),     # 4-5 veces/semana
    "elite_anual": (4, 5)       # 4-5 veces/semana
}

# Cupones disponibles (nota: RENUEVA_AHORA es 20% no $20k, UPGRADE_6M no se usa porque requiere validación especial)
CUPONES = [
    {"codigo": "PRIMERA_VEZ", "probabilidad": 0.12, "requiere": None},
    {"codigo": "RENUEVA_AHORA", "probabilidad": 0.06, "requiere": None}
    # UPGRADE_6M no se incluye porque requiere tener plan mensual activo (validación compleja)
]

# Control global
cedulas_usadas = set()
emails_usados = set()
usuarios_creados = []
usuarios_que_pueden_referir = []

# Estadísticas
stats = {
    "usuarios_creados": 0,
    "membresias_creadas": 0,
    "asistencias_creadas": 0,
    "referidos": 0,
    "cupones_usados": {c["codigo"]: 0 for c in CUPONES},
    "planes": {plan: 0 for plan in PLANES_DISTRIBUCION.keys()}
}


def generar_cedula() -> str:
    """Genera una cédula única de 10 dígitos"""
    while True:
        cedula = str(random.randint(1000000000, 9999999999))
        if cedula not in cedulas_usadas:
            cedulas_usadas.add(cedula)
            return cedula


def generar_email(nombre: str, apellido: str) -> str:
    """Genera un email único"""
    dominios = ["gmail.com", "hotmail.com"]
    base_email = f"{nombre.lower()}.{apellido.lower()}"

    # Intentar email base primero
    for dominio in dominios:
        email = f"{base_email}@{dominio}"
        if email not in emails_usados:
            emails_usados.add(email)
            return email

    # Si existe, agregar número
    for i in range(1, 100):
        for dominio in dominios:
            email = f"{base_email}{i}@{dominio}"
            if email not in emails_usados:
                emails_usados.add(email)
                return email

    raise ValueError("No se pudo generar email único")


def generar_telefono() -> str:
    """Genera un número de teléfono colombiano"""
    return f"3{random.randint(10, 19)}{random.randint(1000000, 9999999)}"


def generar_fecha_nacimiento(edad_min: int = 18, edad_max: int = 40) -> datetime:
    """Genera fecha de nacimiento aleatoria"""
    hoy = datetime.now()
    edad = random.randint(edad_min, edad_max)
    año = hoy.year - edad
    mes = random.randint(1, 12)
    dia = random.randint(1, 28)  # Evitar problemas con febrero
    return datetime(año, mes, dia)


def generar_fecha_inicio_membresia() -> datetime:
    """Genera fecha de inicio aleatoria entre junio 2024 y diciembre 2024"""
    # Ajustado para que las membresías incluyan el presente (diciembre 2024)
    # Fecha base: junio 1, 2024
    fecha_base = datetime(2024, 6, 1)
    # Fecha máxima: diciembre 26, 2024 (hoy)
    fecha_max = datetime(2024, 12, 26)

    dias_diferencia = (fecha_max - fecha_base).days
    dias_aleatorios = random.randint(0, dias_diferencia)

    return fecha_base + timedelta(days=dias_aleatorios)


def calcular_fecha_fin(fecha_inicio: datetime, plan: str) -> datetime:
    """Calcula fecha fin según duración del plan"""
    duraciones = {
        "pase_diario": 1,
        "pase_flex": 14,
        "mensual": 30,
        "plan_3_meses": 90,
        "plan_6_meses": 180,
        "elite_anual": 365
    }
    dias = duraciones.get(plan, 30)
    return fecha_inicio + timedelta(days=dias)


def membresia_activa(fecha_fin: datetime) -> bool:
    """Verifica si una membresía está activa"""
    return fecha_fin >= datetime.now()


def seleccionar_plan() -> str:
    """Selecciona un plan según la distribución"""
    planes = []
    for plan, cantidad in PLANES_DISTRIBUCION.items():
        planes.extend([plan] * cantidad)
    return random.choice(planes)


def puede_usar_cupon(plan: str, cupon: Dict) -> bool:
    """Verifica si el plan puede usar el cupón"""
    if plan in ["pase_diario", "pase_flex"]:
        return False
    if cupon["requiere"] and plan != cupon["requiere"]:
        return False
    return True


def seleccionar_cupon(plan: str) -> Optional[str]:
    """Selecciona un cupón aleatoriamente basado en probabilidad"""
    for cupon in CUPONES:
        if puede_usar_cupon(plan, cupon):
            if random.random() < cupon["probabilidad"]:
                return cupon["codigo"]
    return None


def crear_usuario_con_membresia(numero: int) -> Optional[Dict]:
    """Crea un usuario con su membresía"""
    try:
        # Generar datos personales
        es_hombre = random.random() < 0.6
        nombre = random.choice(NOMBRES_HOMBRES if es_hombre else NOMBRES_MUJERES)
        apellido = random.choice(APELLIDOS)
        cedula = generar_cedula()
        email = generar_email(nombre, apellido)
        telefono = cedula  # Usamos cédula como teléfono según el sistema
        genero = "masculino" if es_hombre else "femenino"

        # Datos físicos
        peso = random.randint(50, 100)
        altura = random.randint(150, 190)
        fecha_nacimiento = generar_fecha_nacimiento()

        # Seleccionar plan
        plan = seleccionar_plan()

        # Decidir si es referido (25% de probabilidad)
        es_referido = False
        referido_por_cedula = None

        # Solo puede ser referido si hay usuarios que pueden referir y plan no es pase diario/flex
        # Aumentar probabilidad a 42% para lograr ~25% de referidos totales (considerando que no todos tienen planes elegibles)
        probabilidad_referido = 0.42 if len(usuarios_que_pueden_referir) >= 5 else 0.0
        if (usuarios_que_pueden_referir and
            plan not in ["pase_diario", "pase_flex"] and
            probabilidad_referido > 0 and
            random.random() < probabilidad_referido):
            es_referido = True
            referidor = random.choice(usuarios_que_pueden_referir)
            referido_por_cedula = referidor["cedula"]
            print(f" [REF:{referidor['cedula'][:4]}...]", end="")

        # Seleccionar cupón (no acumulable con referido)
        cupon_codigo = None
        if not es_referido:
            cupon_codigo = seleccionar_cupon(plan)

        # Crear payload de usuario
        usuario_data = {
            "nombre": nombre,
            "apellido": apellido,
            "email": email,
            "telefono": telefono,
            "tipo": "cliente",
            "genero": genero,
            "peso_inicial": peso,
            "peso_actual": peso,
            "altura": altura,
            "fecha_nacimiento": fecha_nacimiento.isoformat(),
            "objetivo": random.choice(["Bajar de peso", "Ganar masa muscular", "Tonificar", "Mantenimiento"])
        }

        if referido_por_cedula:
            usuario_data["referido_por_cedula"] = referido_por_cedula

        # Crear usuario
        print(f"[{numero}/{TOTAL_USUARIOS}] Creando usuario: {nombre} {apellido} ({plan})...", end=" ")
        response = requests.post(f"{BASE_URL}/api/usuarios", json=usuario_data)

        if response.status_code != 201:
            print(f"❌ Error creando usuario: {response.status_code} - {response.text}")
            return None

        usuario = response.json()
        usuario_id = usuario["id"]

        # Generar fechas de membresía
        fecha_inicio = generar_fecha_inicio_membresia()
        fecha_fin = calcular_fecha_fin(fecha_inicio, plan)
        # Considerar activa si la membresía dura más de 1 mes (para poder seleccionar referidores)
        activa = (fecha_fin - fecha_inicio).days >= 14

        # Crear membresía
        membresia_data = {
            "usuario_id": usuario_id,
            "tipo_plan": plan,
            "tipo_pago": random.choice(["efectivo", "tarjeta", "transferencia", "nequi"])
        }

        if cupon_codigo:
            membresia_data["cupon_codigo"] = cupon_codigo

        response = requests.post(f"{BASE_URL}/api/membresias", json=membresia_data)

        if response.status_code != 201:
            print(f"❌ Error creando membresía: {response.status_code} - {response.text}")
            return None

        print("✅")

        # Actualizar estadísticas
        stats["usuarios_creados"] += 1
        stats["membresias_creadas"] += 1
        stats["planes"][plan] += 1

        if es_referido:
            stats["referidos"] += 1

        if cupon_codigo:
            stats["cupones_usados"][cupon_codigo] += 1

        # Guardar información del usuario
        usuario_info = {
            "id": usuario_id,
            "cedula": cedula,
            "nombre": f"{nombre} {apellido}",
            "plan": plan,
            "fecha_inicio": fecha_inicio,
            "fecha_fin": fecha_fin,
            "activa": activa
        }

        usuarios_creados.append(usuario_info)

        # Si tiene plan que permite referir y está activa, agregarlo a la lista
        if plan in ["mensual", "plan_3_meses", "plan_6_meses", "elite_anual"] and activa:
            usuarios_que_pueden_referir.append(usuario_info)

        return usuario_info

    except Exception as e:
        print(f"❌ Excepción: {str(e)}")
        return None


def generar_horario_asistencia() -> time:
    """Genera un horario de asistencia realista"""
    rand = random.random()

    if rand < 0.35:  # 35% mañana (6-9 AM)
        hora = random.randint(6, 8)
        minuto = random.choice([0, 15, 30, 45])
    elif rand < 0.65:  # 30% tarde/noche (6-9 PM)
        hora = random.randint(18, 20)
        minuto = random.choice([0, 15, 30, 45])
    else:  # 35% resto del día
        hora = random.randint(9, 17)
        minuto = random.choice([0, 15, 30, 45])

    return time(hora, minuto, 0)


def crear_asistencias(usuario: Dict, db_conn: sqlite3.Connection) -> int:
    """Crea asistencias para un usuario según su plan y membresía usando SQLite directamente"""
    plan = usuario["plan"]
    fecha_inicio = usuario["fecha_inicio"]
    fecha_fin = usuario["fecha_fin"]
    usuario_id = usuario["id"]

    # Para pase diario, solo una asistencia el día de compra
    if plan == "pase_diario":
        try:
            hora = generar_horario_asistencia()
            fecha_hora = fecha_inicio.replace(hour=hora.hour, minute=hora.minute, second=0)

            cursor = db_conn.cursor()
            cursor.execute("""
                INSERT INTO asistencias (usuario_id, fecha, hora_entrada, hora_salida, notas)
                VALUES (?, ?, ?, NULL, NULL)
            """, (usuario_id, fecha_hora, hora.strftime("%H:%M:%S")))
            db_conn.commit()
            return 1
        except Exception as e:
            print(f"Error creando asistencia: {e}")
            return 0

    # Obtener frecuencia según plan (veces por semana)
    freq_min, freq_max = FRECUENCIA_ASISTENCIA.get(plan, (3, 4))
    asistencias_por_semana = random.randint(freq_min, freq_max)

    # Calcular número de semanas del período
    dias_total = (min(fecha_fin, datetime.now()) - fecha_inicio).days
    if dias_total <= 0:
        return 0  # Membresía futura, sin asistencias

    semanas = max(1, dias_total // 7)
    total_asistencias_esperadas = semanas * asistencias_por_semana

    # Generar lista de todos los días disponibles en el período
    dias_disponibles = []
    fecha_actual = fecha_inicio

    while fecha_actual <= min(fecha_fin, datetime.now()):
        # 70% probabilidad de ser día de semana elegible (lun-vie)
        # 30% probabilidad de ser fin de semana elegible (sab-dom)
        dia_semana = fecha_actual.weekday()  # 0=lunes, 6=domingo

        if dia_semana < 5:  # Lun-Vie
            if random.random() < 0.7:  # 70% de días laborables son candidatos
                dias_disponibles.append(fecha_actual)
        else:  # Sab-Dom
            if random.random() < 0.3:  # 30% de fines de semana son candidatos
                dias_disponibles.append(fecha_actual)

        fecha_actual += timedelta(days=1)

    # Seleccionar días aleatorios sin repetir
    num_asistencias = min(total_asistencias_esperadas, len(dias_disponibles))
    fechas_seleccionadas = random.sample(dias_disponibles, num_asistencias)
    fechas_seleccionadas.sort()  # Ordenar cronológicamente

    # Crear asistencias en las fechas seleccionadas
    asistencias_creadas = 0
    cursor = db_conn.cursor()

    for fecha_asistencia in fechas_seleccionadas:
        try:
            # Generar hora aleatoria diferente para cada asistencia
            hora = generar_horario_asistencia()
            fecha_hora = fecha_asistencia.replace(hour=hora.hour, minute=hora.minute, second=0)

            cursor.execute("""
                INSERT INTO asistencias (usuario_id, fecha, hora_entrada, hora_salida, notas)
                VALUES (?, ?, ?, NULL, NULL)
            """, (usuario_id, fecha_hora, hora.strftime("%H:%M:%S")))
            asistencias_creadas += 1
        except Exception as e:
            # Si hay error (ej: duplicado), continuar con la siguiente
            pass

    db_conn.commit()
    return asistencias_creadas


def main():
    """Función principal"""
    print("=" * 60)
    print("GENERADOR DE DATOS DE PRUEBA - MOMENTUM FITNESS")
    print("=" * 60)
    print()

    # Verificar conexión con API
    try:
        response = requests.get(f"{BASE_URL}/api/usuarios", params={"limit": 1})
        if response.status_code != 200:
            print("❌ Error: No se puede conectar con la API")
            print(f"   URL: {BASE_URL}")
            print(f"   Status: {response.status_code}")
            sys.exit(1)
    except Exception as e:
        print(f"❌ Error de conexión: {str(e)}")
        print(f"   Asegúrate de que el servidor esté corriendo en {BASE_URL}")
        sys.exit(1)

    print("✅ Conexión con API establecida")
    print()
    print(f"Generando {TOTAL_USUARIOS} usuarios con datos realistas...")
    print()

    # FASE 1: Crear primeros 40 usuarios SIN referidos (para tener base de referidores)
    print("FASE 1: Creando base de usuarios que pueden referir (40 usuarios)...")
    for i in range(1, 41):
        crear_usuario_con_membresia(i)

    print()
    print(f"✅ Base creada: {len(usuarios_que_pueden_referir)} usuarios pueden referir")
    print()

    # FASE 2: Crear restantes 60 usuarios CON 25% de probabilidad de ser referidos
    print("FASE 2: Creando usuarios con referidos (60 usuarios, ~25% referidos)...")
    for i in range(41, TOTAL_USUARIOS + 1):
        crear_usuario_con_membresia(i)

    print()
    print("=" * 60)
    print("ASIGNANDO REFERIDOS EN BASE DE DATOS")
    print("=" * 60)
    print()

    # Asignar referidos directamente en BD (ya que el API no los guarda)
    # Seleccionar ~25 usuarios elegibles para ser referidos (creados después del usuario 40)
    usuarios_nuevos = [u for u in usuarios_creados[40:] if u["plan"] not in ["pase_diario", "pase_flex"]]
    num_referidos_objetivo = int(len(usuarios_creados) * 0.25)  # 25% del total

    print(f"Usuarios disponibles para referir: {len(usuarios_que_pueden_referir)}")
    print(f"Usuarios elegibles para ser referidos: {len(usuarios_nuevos)}")
    print(f"Objetivo de referidos: {num_referidos_objetivo}")
    print()

    db_conn = sqlite3.connect(DB_PATH)
    cursor = db_conn.cursor()

    referidos_asignados = 0

    # Solo asignar referidos si hay usuarios que pueden referir
    if usuarios_que_pueden_referir and usuarios_nuevos:
        usuarios_a_referenciar = random.sample(usuarios_nuevos, min(num_referidos_objetivo, len(usuarios_nuevos)))

        for usuario in usuarios_a_referenciar:
            referidor = random.choice(usuarios_que_pueden_referir)
            try:
                cursor.execute("""
                    UPDATE usuarios
                    SET referido_por_cedula = ?
                    WHERE id = ?
                """, (referidor["cedula"], usuario["id"]))

                # Aplicar descuento del 5% a la membresía
                cursor.execute("""
                    UPDATE membresias
                    SET precio_final = CAST(precio * 0.95 AS INTEGER),
                        precio_original = precio
                    WHERE usuario_id = ?
                """, (usuario["id"],))

                referidos_asignados += 1
                print(f"✅ {usuario['nombre']} fue referido por {referidor['nombre']} (cédula {referidor['cedula'][:4]}...)")
            except Exception as e:
                print(f"❌ Error asignando referido: {e}")

    db_conn.commit()
    db_conn.close()

    stats["referidos"] = referidos_asignados

    print()
    print(f"✅ Total referidos asignados: {referidos_asignados} ({referidos_asignados/len(usuarios_creados)*100:.1f}%)")

    print()
    print("=" * 60)
    print("GENERANDO ASISTENCIAS")
    print("=" * 60)
    print()

    # Conectar a la base de datos para crear asistencias
    db_conn = sqlite3.connect(DB_PATH)

    # Crear asistencias para cada usuario
    for idx, usuario in enumerate(usuarios_creados, 1):
        nombre = usuario["nombre"]
        plan = usuario["plan"]
        print(f"[{idx}/{len(usuarios_creados)}] Generando asistencias para {nombre} ({plan})...", end=" ")

        asistencias = crear_asistencias(usuario, db_conn)
        stats["asistencias_creadas"] += asistencias

        print(f"✅ {asistencias} asistencias")

    # Cerrar conexión
    db_conn.close()

    # FASE 3: Desactivar 30 clientes aleatorios
    print()
    print("=" * 60)
    print("DESACTIVANDO 30 CLIENTES ALEATORIOS")
    print("=" * 60)
    print()

    # Seleccionar 30 usuarios aleatorios para desactivar
    usuarios_a_desactivar = random.sample(usuarios_creados, min(30, len(usuarios_creados)))

    # Conectar a BD para desactivar
    db_conn = sqlite3.connect(DB_PATH)
    cursor = db_conn.cursor()

    desactivados = 0
    for usuario in usuarios_a_desactivar:
        try:
            # Desactivar usuario en la tabla usuarios
            cursor.execute("UPDATE usuarios SET activo = 0 WHERE id = ?", (usuario["id"],))
            # Desactivar membresías del usuario
            cursor.execute("UPDATE membresias SET activo = 0 WHERE usuario_id = ?", (usuario["id"],))
            desactivados += 1
            print(f"✅ Usuario desactivado: {usuario['nombre']} (ID: {usuario['id']})")
        except Exception as e:
            print(f"❌ Error desactivando {usuario['nombre']}: {e}")

    db_conn.commit()
    db_conn.close()

    print()
    print(f"✅ Total desactivados: {desactivados} usuarios")

    # Mostrar resumen
    print()
    print("=" * 60)
    print("RESUMEN FINAL")
    print("=" * 60)
    print()
    print(f"✅ Usuarios creados: {stats['usuarios_creados']}")
    print(f"✅ Usuarios activos: {stats['usuarios_creados'] - desactivados}")
    print(f"✅ Usuarios inactivos: {desactivados}")
    print(f"✅ Membresías creadas: {stats['membresias_creadas']}")
    print(f"✅ Asistencias creadas: {stats['asistencias_creadas']}")
    print()
    print("📊 DISTRIBUCIÓN DE PLANES:")
    for plan, cantidad in stats["planes"].items():
        print(f"   - {plan}: {cantidad}")
    print()
    print(f"👥 Referidos: {stats['referidos']} ({stats['referidos']/stats['usuarios_creados']*100:.1f}%)")
    print()
    print("🎫 CUPONES UTILIZADOS:")
    for cupon, cantidad in stats["cupones_usados"].items():
        if cantidad > 0:
            print(f"   - {cupon}: {cantidad}")
    print()
    print("=" * 60)
    print("✅ PROCESO COMPLETADO CON ÉXITO")
    print("=" * 60)


if __name__ == "__main__":
    main()

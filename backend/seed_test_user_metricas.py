"""
Script de seed: crea usuario de test con métricas de progreso.
Inserta registros cada 15 días durante 3 meses (7 puntos de datos).
Ejecutar desde: /home/edwlearn/momentum/backend/
  python seed_test_user_metricas.py
"""

import sqlite3
import json
from datetime import datetime, timedelta
from pathlib import Path

DB_PATH = Path(__file__).parent / "gimnasio.db"

# ── Datos del usuario de test ──────────────────────────────────────────────────
USUARIO = {
    "nombre": "Carlos Test",
    "apellido": "Progreso",
    "cedula": "9999999999",
    "email": "carlos.test@momentum.com",
    "telefono": "3001234567",
    "tipo": "usuario",
    "activo": 1,
    "peso_inicial": 88.5,
    "peso_actual": 88.5,
    "altura": 175.0,
    "objetivo": "Bajar grasa corporal y ganar masa muscular",
    "genero": "masculino",
    "dias_entrenados": 42,
    "fecha_nacimiento": "1995-06-15 00:00:00",
    "fecha_registro": "2025-12-13 08:00:00",
}

# ── Fechas: cada 15 días, 3 meses atrás desde hoy (2026-03-13) ────────────────
FECHA_INICIO = datetime(2025, 12, 13)
FECHAS = [FECHA_INICIO + timedelta(days=15 * i) for i in range(7)]
# Resultado: 2025-12-13, 2025-12-28, 2026-01-12, 2026-01-27,
#            2026-02-11, 2026-02-26, 2026-03-13

# ── Progreso realista en 3 meses ──────────────────────────────────────────────
# Peso: 88.5 → 82.0 kg (pierde ~1 kg cada 15 días)
PESOS = [88.5, 87.2, 86.0, 84.8, 83.7, 82.8, 82.0]

# Grasa corporal: 24% → 19%
GRASA = [24.0, 23.2, 22.5, 21.7, 21.0, 20.2, 19.5]

# Masa muscular: 63.5 → 66.5 kg
MASA_MUSCULAR = [63.5, 64.0, 64.5, 65.0, 65.5, 66.0, 66.5]

# IMC: basado en peso / (1.75^2)
IMC = [round(p / (1.75 ** 2), 1) for p in PESOS]

# Medidas corporales (en cm): progreso gradual
MEDIDAS = [
    {"pecho": 102, "cintura": 92, "cadera": 101, "brazo": 36, "pierna": 58},
    {"pecho": 103, "cintura": 90, "cadera": 100, "brazo": 36, "pierna": 58},
    {"pecho": 103, "cintura": 89, "cadera": 99,  "brazo": 37, "pierna": 59},
    {"pecho": 104, "cintura": 87, "cadera": 98,  "brazo": 37, "pierna": 59},
    {"pecho": 104, "cintura": 86, "cadera": 97,  "brazo": 38, "pierna": 60},
    {"pecho": 105, "cintura": 85, "cadera": 96,  "brazo": 38, "pierna": 60},
    {"pecho": 105, "cintura": 84, "cadera": 95,  "brazo": 39, "pierna": 61},
]

NOTAS = [
    "Inicio del programa. Evaluación inicial completa.",
    "Buena adherencia a la dieta. Energía estable.",
    "Primer hito: -2.5 kg desde el inicio.",
    "Levantando más peso en press banca y sentadilla.",
    "Zona de cintura reducida notablemente.",
    "Muy buena semana, -6 kg acumulados.",
    "Cierre de los 3 meses. Excelente progreso general.",
]


def insertar_usuario(cursor):
    cursor.execute("SELECT id FROM usuarios WHERE cedula = ?", (USUARIO["cedula"],))
    row = cursor.fetchone()
    if row:
        print(f"  ⚠️  Usuario ya existe (id={row[0]}), usando el existente.")
        return row[0]

    cursor.execute(
        """INSERT INTO usuarios
           (nombre, apellido, cedula, email, telefono, tipo, activo,
            peso_inicial, peso_actual, altura, objetivo, genero,
            dias_entrenados, fecha_nacimiento, fecha_registro)
           VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)""",
        (
            USUARIO["nombre"], USUARIO["apellido"], USUARIO["cedula"],
            USUARIO["email"], USUARIO["telefono"], USUARIO["tipo"],
            USUARIO["activo"], USUARIO["peso_inicial"], USUARIO["peso_actual"],
            USUARIO["altura"], USUARIO["objetivo"], USUARIO["genero"],
            USUARIO["dias_entrenados"], USUARIO["fecha_nacimiento"],
            USUARIO["fecha_registro"],
        ),
    )
    uid = cursor.lastrowid
    print(f"  ✅ Usuario creado: {USUARIO['nombre']} {USUARIO['apellido']} (id={uid})")
    return uid


def insertar_metrica(cursor, usuario_id, tipo, valor, unidad, fecha, medidas, nota):
    cursor.execute(
        """INSERT INTO metricas
           (usuario_id, tipo, valor, unidad, fecha, medidas, notas)
           VALUES (?,?,?,?,?,?,?)""",
        (
            usuario_id, tipo, valor, unidad,
            fecha.strftime("%Y-%m-%d %H:%M:%S"),
            json.dumps(medidas) if medidas else None,
            nota,
        ),
    )


def insertar_historial_peso(cursor, usuario_id, fecha, peso, medidas, nota):
    cursor.execute(
        """INSERT INTO historial_peso
           (usuario_id, peso, fecha_pesaje,
            circunferencia_brazos, circunferencia_pecho,
            circunferencia_cintura, circunferencia_cadera,
            circunferencia_piernas, notas)
           VALUES (?,?,?,?,?,?,?,?,?)""",
        (
            usuario_id, peso,
            fecha.strftime("%Y-%m-%d %H:%M:%S"),
            medidas["brazo"],
            medidas["pecho"],
            medidas["cintura"],
            medidas["cadera"],
            medidas["pierna"],
            nota,
        ),
    )


def main():
    print(f"\n🏋️  Seed: usuario de test con métricas cada 15 días (3 meses)\n")
    print(f"  Base de datos: {DB_PATH}\n")

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    try:
        usuario_id = insertar_usuario(cursor)

        # Eliminar registros anteriores del usuario (re-seed limpio)
        cursor.execute("DELETE FROM metricas WHERE usuario_id = ?", (usuario_id,))
        cursor.execute("DELETE FROM historial_peso WHERE usuario_id = ?", (usuario_id,))
        print(f"  🗑️  Registros anteriores eliminados para el usuario id={usuario_id}\n")

        total = 0
        for i, fecha in enumerate(FECHAS):
            hora = fecha.replace(hour=8, minute=0, second=0)
            label = hora.strftime("%Y-%m-%d")

            # ── historial_peso (lo que usa el frontend en "Ver Progreso") ──
            insertar_historial_peso(cursor, usuario_id, hora, PESOS[i], MEDIDAS[i], NOTAS[i])

            # ── metricas (tabla secundaria con más detalle) ──
            insertar_metrica(cursor, usuario_id, "peso", PESOS[i], "kg",
                             hora, None, NOTAS[i])
            insertar_metrica(cursor, usuario_id, "grasa_corporal", GRASA[i], "%",
                             hora.replace(hour=8, minute=1), None, None)
            insertar_metrica(cursor, usuario_id, "masa_muscular", MASA_MUSCULAR[i], "kg",
                             hora.replace(hour=8, minute=2), None, None)
            insertar_metrica(cursor, usuario_id, "imc", IMC[i], "kg/m²",
                             hora.replace(hour=8, minute=3), None, None)
            insertar_metrica(cursor, usuario_id, "medidas", None, "cm",
                             hora.replace(hour=8, minute=4), MEDIDAS[i], None)

            print(f"  📅 {label} → peso={PESOS[i]}kg | grasa={GRASA[i]}% | "
                  f"músculo={MASA_MUSCULAR[i]}kg | IMC={IMC[i]} | "
                  f"cintura={MEDIDAS[i]['cintura']}cm")
            total += 6  # 1 historial_peso + 5 metricas

        # Actualizar peso_actual del usuario al valor final
        cursor.execute(
            "UPDATE usuarios SET peso_actual = ? WHERE id = ?",
            (PESOS[-1], usuario_id),
        )

        conn.commit()
        print(f"\n  ✅ {total} registros insertados (historial_peso + metricas).")
        print(f"  👤 Cédula: {USUARIO['cedula']}  |  Email: {USUARIO['email']}")
        print(f"  📊 Progreso: {PESOS[0]}→{PESOS[-1]} kg | "
              f"grasa {GRASA[0]}→{GRASA[-1]}% | músculo {MASA_MUSCULAR[0]}→{MASA_MUSCULAR[-1]} kg\n")

    except Exception as e:
        conn.rollback()
        print(f"\n  ❌ Error: {e}")
        raise
    finally:
        conn.close()


if __name__ == "__main__":
    main()

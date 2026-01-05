"""
Script para crear registros de peso y medidas DRAMÁTICOS para Carlos Castro
Para DEMOSTRACIÓN de gráficas - Cambios más bruscos y visibles
OBJETIVO: Subir 2kg (de 94kg a 96kg) con cambios notorios
"""

import sqlite3
from datetime import datetime, timedelta

# Conectar a la base de datos
conn = sqlite3.connect('/home/edwlearn/v0-dashboard-de-gimnasio/backend/gimnasio.db')
cursor = conn.cursor()

# ID del usuario Carlos Castro
usuario_id = 4

# Datos base
peso_inicial = 94.0
peso_final = 96.0  # Subir 2kg
objetivo = "Ganancia de masa muscular (DEMO)"

# Medidas iniciales
medidas_iniciales = {
    'brazos': 36.0,
    'pecho': 105.0,
    'cintura': 95.0,
    'cadera': 102.0,
    'piernas': 58.0
}

# Limpiar registros anteriores
print(f"🗑️  Eliminando registros anteriores de Carlos Castro (ID: {usuario_id})...")
cursor.execute("DELETE FROM historial_peso WHERE usuario_id = ?", (usuario_id,))
print(f"✅ {cursor.rowcount} registros eliminados\n")

# Generar registros para 3 meses (13 semanas)
fecha_inicio = datetime.now() - timedelta(days=90)
registros_creados = 0

print("📊 Creando registros DRAMÁTICOS para demostración (3 meses)...")
print("🎯 Objetivo: SUBIR 2kg (94kg → 96kg) con cambios visibles")
print("=" * 80)

# Definir la progresión de peso (más dramática)
pesos_progresion = [
    94.0,  # Semana 0 - Inicio
    94.3,  # Semana 1
    94.7,  # Semana 2
    95.0,  # Semana 3
    95.3,  # Semana 4
    95.5,  # Semana 5
    95.7,  # Semana 6
    95.8,  # Semana 7
    95.9,  # Semana 8
    96.0,  # Semana 9
    96.1,  # Semana 10
    96.2,  # Semana 11
    96.0,  # Semana 12 - Estabilizado en objetivo
]

for semana in range(13):
    fecha_pesaje = fecha_inicio + timedelta(days=semana * 7)

    # Peso progresivo
    peso = pesos_progresion[semana]

    # Factor de progreso (0 a 1)
    progreso = semana / 12

    # CAMBIOS DRAMÁTICOS EN MEDIDAS (para que se vean bien en gráficas)

    # Brazos: +3cm (ganancia muscular significativa)
    brazos = medidas_iniciales['brazos'] + (progreso * 3.0)

    # Pecho: +5cm (desarrollo muscular notable)
    pecho = medidas_iniciales['pecho'] + (progreso * 5.0)

    # Cintura: -4cm (pérdida de grasa abdominal)
    cintura = medidas_iniciales['cintura'] - (progreso * 4.0)

    # Cadera: -2cm
    cadera = medidas_iniciales['cadera'] - (progreso * 2.0)

    # Piernas: +4cm (desarrollo muscular)
    piernas = medidas_iniciales['piernas'] + (progreso * 4.0)

    # Notas descriptivas
    if semana == 0:
        notas = "🏁 INICIO - Objetivo: Ganar masa muscular"
    elif semana <= 3:
        notas = "💪 Fase 1: Adaptación y primeras ganancias"
    elif semana <= 6:
        notas = "🔥 Fase 2: Progreso acelerado"
    elif semana <= 9:
        notas = "⚡ Fase 3: Resultados visibles"
    else:
        notas = "🏆 Fase 4: Objetivo alcanzado - Mantenimiento"

    # Insertar registro
    cursor.execute("""
        INSERT INTO historial_peso
        (usuario_id, peso, fecha_pesaje, notas,
         circunferencia_brazos, circunferencia_pecho,
         circunferencia_cintura, circunferencia_cadera,
         circunferencia_piernas)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        usuario_id,
        round(peso, 1),
        fecha_pesaje.strftime('%Y-%m-%d %H:%M:%S'),
        notas,
        round(brazos, 1),
        round(pecho, 1),
        round(cintura, 1),
        round(cadera, 1),
        round(piernas, 1)
    ))

    registros_creados += 1

    # Mostrar progreso
    cambio_peso = peso - peso_inicial
    print(f"Semana {semana:2d} | {fecha_pesaje.strftime('%Y-%m-%d')} | "
          f"Peso: {peso:5.1f}kg ({cambio_peso:+.1f}kg) | "
          f"Cintura: {cintura:5.1f}cm | Pecho: {pecho:5.1f}cm | "
          f"Brazos: {brazos:4.1f}cm")

# Actualizar peso actual del usuario
cursor.execute("""
    UPDATE usuarios
    SET peso_actual = ?
    WHERE id = ?
""", (96.0, usuario_id))

conn.commit()

print("=" * 80)
print(f"\n✅ {registros_creados} registros creados exitosamente")
print(f"\n📈 RESUMEN DEL PROGRESO DE CARLOS CASTRO (DEMO):")
print(f"   Objetivo: {objetivo}")
print(f"   Peso inicial: {peso_inicial:.1f} kg")
print(f"   Peso final: 96.0 kg")
print(f"   Cambio total: +2.0 kg ⬆️")
print(f"\n   Medidas iniciales → finales:")
print(f"   • Brazos:   {medidas_iniciales['brazos']:.1f} cm → {brazos:.1f} cm ({brazos - medidas_iniciales['brazos']:+.1f} cm) 💪")
print(f"   • Pecho:    {medidas_iniciales['pecho']:.1f} cm → {pecho:.1f} cm ({pecho - medidas_iniciales['pecho']:+.1f} cm) 💪")
print(f"   • Cintura:  {medidas_iniciales['cintura']:.1f} cm → {cintura:.1f} cm ({cintura - medidas_iniciales['cintura']:+.1f} cm) 🔥")
print(f"   • Cadera:   {medidas_iniciales['cadera']:.1f} cm → {cadera:.1f} cm ({cadera - medidas_iniciales['cadera']:+.1f} cm) 🔥")
print(f"   • Piernas:  {medidas_iniciales['piernas']:.1f} cm → {piernas:.1f} cm ({piernas - medidas_iniciales['piernas']:+.1f} cm) 💪")

print(f"\n💡 Interpretación (DEMO):")
print(f"   ✅ Ganó 2.0 kg de peso (94kg → 96kg)")
print(f"   ✅ Ganó 3.0 cm de brazos (músculo)")
print(f"   ✅ Ganó 5.0 cm de pecho (músculo)")
print(f"   ✅ Perdió 4.0 cm de cintura (grasa)")
print(f"   ✅ Ganó 4.0 cm de piernas (músculo)")
print(f"\n   🎯 PERFECTO PARA DEMOSTRACIÓN: Cambios muy visibles en las gráficas!")

# Verificar
cursor.execute("""
    SELECT COUNT(*) FROM historial_peso WHERE usuario_id = ?
""", (usuario_id,))
total = cursor.fetchone()[0]

print(f"\n✓ Verificación: {total} registros en la base de datos")

conn.close()
print("\n🎉 Datos de demostración creados exitosamente!")
print("📊 Las gráficas mostrarán cambios dramáticos y fáciles de visualizar")

"""
Script para crear registros de peso y medidas progresivos para Carlos Castro
Durante 3 meses con objetivo de Mantenimiento
"""

import sqlite3
from datetime import datetime, timedelta
import random

# Conectar a la base de datos
conn = sqlite3.connect('/home/edwlearn/v0-dashboard-de-gimnasio/backend/gimnasio.db')
cursor = conn.cursor()

# ID del usuario Carlos Castro
usuario_id = 4

# Datos base
peso_inicial = 94.0
objetivo = "Mantenimiento"

# Para mantenimiento, el peso debe mantenerse relativamente estable
# con variaciones naturales de +/- 2kg

# Medidas iniciales estimadas para una persona de 94kg
medidas_iniciales = {
    'brazos': 36.0,  # cm
    'pecho': 105.0,
    'cintura': 95.0,
    'cadera': 102.0,
    'piernas': 58.0
}

# Limpiar registros anteriores de este usuario
print(f"🗑️  Eliminando registros anteriores de Carlos Castro (ID: {usuario_id})...")
cursor.execute("DELETE FROM historial_peso WHERE usuario_id = ?", (usuario_id,))
conn.commit()
print(f"✅ {cursor.rowcount} registros eliminados\n")

# Generar registros para 3 meses (12 semanas, 1 registro por semana)
fecha_inicio = datetime.now() - timedelta(days=90)
registros_creados = 0

print("📊 Creando registros de peso y medidas (3 meses)...")
print("=" * 70)

for semana in range(13):  # 13 registros (0 a 12 semanas)
    fecha_pesaje = fecha_inicio + timedelta(days=semana * 7)

    # Peso: mantenimiento con variaciones naturales
    # Simular variaciones realistas: +/- 0.5kg por semana máximo
    if semana == 0:
        peso = peso_inicial
    else:
        # Variación aleatoria pequeña para mantenimiento
        variacion = random.uniform(-0.5, 0.5)
        peso = peso_inicial + variacion
        # Mantener dentro del rango +/- 2kg del objetivo
        peso = max(92.0, min(96.0, peso))

    # Medidas: ligeras variaciones por cambio de composición corporal
    # En mantenimiento, puede haber recomposición (menos grasa, más músculo)
    progreso_factor = semana / 12  # 0 a 1

    # Brazos: ligero aumento (ganancia muscular)
    brazos = medidas_iniciales['brazos'] + (progreso_factor * 0.5) + random.uniform(-0.2, 0.2)

    # Pecho: ligero aumento (ganancia muscular)
    pecho = medidas_iniciales['pecho'] + (progreso_factor * 1.0) + random.uniform(-0.3, 0.3)

    # Cintura: ligera reducción (pérdida de grasa)
    cintura = medidas_iniciales['cintura'] - (progreso_factor * 2.0) + random.uniform(-0.3, 0.3)

    # Cadera: estable
    cadera = medidas_iniciales['cadera'] - (progreso_factor * 0.5) + random.uniform(-0.2, 0.2)

    # Piernas: ligero aumento (ganancia muscular)
    piernas = medidas_iniciales['piernas'] + (progreso_factor * 0.8) + random.uniform(-0.2, 0.2)

    # Notas descriptivas según el progreso
    if semana == 0:
        notas = "Medición inicial - Objetivo: Mantenimiento"
    elif semana <= 4:
        notas = "Adaptación inicial - Peso estable"
    elif semana <= 8:
        notas = "Recomposición corporal - Ganando músculo, perdiendo grasa"
    else:
        notas = "Mantenimiento óptimo - Excelente composición corporal"

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

    # Mostrar cada registro
    cambio_peso = peso - peso_inicial
    cambio_signo = "+" if cambio_peso >= 0 else ""
    print(f"Semana {semana:2d} | {fecha_pesaje.strftime('%Y-%m-%d')} | "
          f"Peso: {peso:5.1f}kg ({cambio_signo}{cambio_peso:+.1f}kg) | "
          f"Cintura: {cintura:5.1f}cm | Pecho: {pecho:5.1f}cm")

# Actualizar peso actual del usuario
cursor.execute("""
    UPDATE usuarios
    SET peso_actual = ?
    WHERE id = ?
""", (round(peso, 1), usuario_id))

conn.commit()

print("=" * 70)
print(f"\n✅ {registros_creados} registros creados exitosamente")
print(f"\n📈 RESUMEN DEL PROGRESO DE CARLOS CASTRO:")
print(f"   Objetivo: {objetivo}")
print(f"   Peso inicial: {peso_inicial:.1f} kg")
print(f"   Peso final: {peso:.1f} kg")
print(f"   Cambio total: {peso - peso_inicial:+.1f} kg")
print(f"\n   Medidas iniciales → finales:")
print(f"   • Brazos:   {medidas_iniciales['brazos']:.1f} cm → {brazos:.1f} cm ({brazos - medidas_iniciales['brazos']:+.1f} cm)")
print(f"   • Pecho:    {medidas_iniciales['pecho']:.1f} cm → {pecho:.1f} cm ({pecho - medidas_iniciales['pecho']:+.1f} cm)")
print(f"   • Cintura:  {medidas_iniciales['cintura']:.1f} cm → {cintura:.1f} cm ({cintura - medidas_iniciales['cintura']:+.1f} cm)")
print(f"   • Cadera:   {medidas_iniciales['cadera']:.1f} cm → {cadera:.1f} cm ({cadera - medidas_iniciales['cadera']:+.1f} cm)")
print(f"   • Piernas:  {medidas_iniciales['piernas']:.1f} cm → {piernas:.1f} cm ({piernas - medidas_iniciales['piernas']:+.1f} cm)")

print(f"\n💡 Interpretación:")
print(f"   Carlos mantuvo su peso estable (~{peso_inicial:.0f}kg) como objetivo")
print(f"   Logró recomposición corporal:")
print(f"   ✓ Redujo cintura en {abs(cintura - medidas_iniciales['cintura']):.1f} cm (pérdida de grasa)")
print(f"   ✓ Aumentó pecho en {pecho - medidas_iniciales['pecho']:.1f} cm (ganancia muscular)")
print(f"   ✓ Aumentó brazos en {brazos - medidas_iniciales['brazos']:.1f} cm (ganancia muscular)")
print(f"   ✓ Aumentó piernas en {piernas - medidas_iniciales['piernas']:.1f} cm (ganancia muscular)")

# Verificar los datos insertados
cursor.execute("""
    SELECT COUNT(*) FROM historial_peso WHERE usuario_id = ?
""", (usuario_id,))
total = cursor.fetchone()[0]

print(f"\n✓ Verificación: {total} registros en la base de datos")

conn.close()
print("\n🎉 Proceso completado exitosamente!")

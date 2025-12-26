"""
Script para probar la acumulación de días al renovar membresías
"""
from datetime import datetime, timedelta, timezone

# Timezone de Colombia (UTC-5)
COLOMBIA_TZ = timezone(timedelta(hours=-5))

# Configuración de planes (copiado de PLANES_CONFIG)
PLANES_CONFIG = {
    "pase_diario": {"nombre": "Pase Diario", "precio": 5000, "dias": 1},
    "pase_flex": {"nombre": "Pase Flex (14 días/mes)", "precio": 39900, "dias": 30},
    "mensual": {"nombre": "Mensual", "precio": 59900, "dias": 30},
    "plan_3_meses": {"nombre": "Plan 3 Meses", "precio": 149900, "dias": 90},
    "plan_6_meses": {"nombre": "Plan 6 Meses", "precio": 269900, "dias": 180},
    "elite_anual": {"nombre": "Membresía Platinum", "precio": 479900, "dias": 365},
}

def simular_acumulacion(plan_actual: str, dias_restantes: int, plan_nuevo: str):
    """
    Simula la acumulación de días al renovar
    """
    config_nuevo_plan = PLANES_CONFIG.get(plan_nuevo)

    if not config_nuevo_plan:
        print(f"❌ Plan no válido: {plan_nuevo}")
        return

    # Calcular duración total
    dias_nuevo_plan = config_nuevo_plan["dias"]
    duracion_total = dias_nuevo_plan + dias_restantes

    # Calcular fechas
    fecha_inicio = datetime.now(COLOMBIA_TZ)
    fecha_fin = fecha_inicio + timedelta(days=duracion_total)

    print(f"\n{'='*60}")
    print(f"📊 ESCENARIO DE PRUEBA")
    print(f"{'='*60}")
    print(f"Plan actual:           {plan_actual}")
    print(f"Días restantes:        {dias_restantes} días")
    print(f"Plan nuevo:            {plan_nuevo} ({config_nuevo_plan['nombre']})")
    print(f"Días del plan nuevo:   {dias_nuevo_plan} días")
    print(f"{'─'*60}")
    print(f"✅ TOTAL DÍAS:         {duracion_total} días")
    print(f"📅 Fecha inicio:       {fecha_inicio.strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"📅 Fecha fin:          {fecha_fin.strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"{'='*60}")

# Prueba 1: Mensual (7 días restantes) → Mensual
print("\n🧪 PRUEBA 1: Mensual con 7 días restantes → Renovar Mensual")
simular_acumulacion("mensual", 7, "mensual")

# Prueba 2: Mensual (7 días restantes) → Plan 3 Meses
print("\n🧪 PRUEBA 2: Mensual con 7 días restantes → Renovar Plan 3 Meses")
simular_acumulacion("mensual", 7, "plan_3_meses")

# Prueba 3: Plan 3 Meses (45 días restantes) → Mensual
print("\n🧪 PRUEBA 3: Plan 3 Meses con 45 días restantes → Renovar Mensual")
simular_acumulacion("plan_3_meses", 45, "mensual")

# Prueba 4: Plan 6 Meses (90 días restantes) → Élite Anual
print("\n🧪 PRUEBA 4: Plan 6 Meses con 90 días restantes → Renovar Élite Anual")
simular_acumulacion("plan_6_meses", 90, "elite_anual")

# Prueba 5: Mensual (1 día restante) → Plan 3 Meses
print("\n🧪 PRUEBA 5: Mensual con 1 día restante → Renovar Plan 3 Meses")
simular_acumulacion("mensual", 1, "plan_3_meses")

# Prueba 6: Sin días restantes (expirado) → Mensual
print("\n🧪 PRUEBA 6: Membresía expirada (0 días) → Renovar Mensual")
simular_acumulacion("mensual", 0, "mensual")

print("\n" + "="*60)
print("✅ TODAS LAS PRUEBAS COMPLETADAS")
print("="*60 + "\n")

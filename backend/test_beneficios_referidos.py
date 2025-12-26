#!/usr/bin/env python3
"""
Script para verificar los beneficios de referidos
"""

import sys
from pathlib import Path
sys.path.append(str(Path(__file__).parent))

from app.core.database import SessionLocal
from app.models.usuario import Usuario
from app.models.referido import Referido
from app.modules.usuarios.models.membresia import Membresia
from app.models.asistencia import Asistencia
from app.models.metrica import Metrica
from app.models.cupon import Cupon

try:
    from app.modules.bot.models.conversacion import Conversacion
    from app.modules.bot.models.logro import Logro
except ImportError:
    pass

from app.crud.referidos import get_referidos_detallados

db = SessionLocal()

print("=" * 80)
print("VERIFICACIÓN DE BENEFICIOS DE REFERIDOS")
print("=" * 80)

# Obtener referidos detallados
referidos_detallados = get_referidos_detallados(db, skip=0, limit=10)

print(f"\nTotal de referidos encontrados: {len(referidos_detallados)}")
print("\n" + "-" * 80)

for i, ref in enumerate(referidos_detallados, 1):
    print(f"\n{i}. Referido por: {ref.referidor}")
    print(f"   Cliente referido: {ref.referido}")
    print(f"   Plan comprado: {ref.plan_comprado or 'N/A'}")
    print(f"   Cumple condición: {'Sí' if ref.cumple_condicion else 'No'}")
    print(f"   Beneficio otorgado: {ref.beneficio}")
    print(f"   Fecha referido: {ref.fecha_referido}")

print("\n" + "=" * 80)
print("✅ Verificación completada")
print("=" * 80)

db.close()

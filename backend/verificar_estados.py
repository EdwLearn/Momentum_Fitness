#!/usr/bin/env python3
import sys
from pathlib import Path
sys.path.append(str(Path(__file__).parent))

from app.core.database import SessionLocal
from app.models.usuario import Usuario
from app.modules.usuarios.models.membresia import Membresia
from app.models.asistencia import Asistencia
from app.models.metrica import Metrica
from app.models.referido import Referido
from app.models.cupon import Cupon

try:
    from app.modules.bot.models.conversacion import Conversacion
    from app.modules.bot.models.logro import Logro
except ImportError:
    pass

from datetime import datetime

db = SessionLocal()

# Ver algunos usuarios activos
usuarios_activos = db.query(Usuario).filter(Usuario.activo == True).limit(5).all()
print('=== USUARIOS ACTIVOS (primeros 5) ===')
for u in usuarios_activos:
    print(f'ID: {u.id}, Nombre: {u.nombre} {u.apellido}, Activo: {u.activo}')

print('\n=== MEMBRESIAS DE ESTOS USUARIOS ===')
for u in usuarios_activos:
    membresias = db.query(Membresia).filter(Membresia.usuario_id == u.id).all()
    if membresias:
        for m in membresias:
            vigente = 'SÍ' if m.fecha_fin >= datetime.utcnow() else 'NO'
            print(f'Usuario {u.id}: Estado={m.estado}, Activo={m.activo}, Fin={m.fecha_fin}, Vigente={vigente}')
    else:
        print(f'Usuario {u.id}: SIN MEMBRESIAS')

print('\n=== ESTADÍSTICAS GENERALES ===')
total_usuarios = db.query(Usuario).count()
usuarios_activos_count = db.query(Usuario).filter(Usuario.activo == True).count()
usuarios_inactivos_count = db.query(Usuario).filter(Usuario.activo == False).count()

print(f'Total usuarios: {total_usuarios}')
print(f'Usuarios activos: {usuarios_activos_count}')
print(f'Usuarios inactivos: {usuarios_inactivos_count}')

db.close()

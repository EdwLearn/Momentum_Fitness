"""
DEPRECATED: Este módulo es legacy.
Los modelos ahora están en app/modules/*/models/

Este archivo redirige los imports para compatibilidad con código viejo.
"""

# Importar desde los módulos nuevos
from app.modules.usuarios.models.usuario import Usuario, TipoUsuario
from app.modules.usuarios.models.membresia import Membresia, TipoMembresia, EstadoMembresia
from app.modules.asistencia.models.asistencia import Asistencia
from app.modules.metricas.models.metrica import Metrica, TipoMetrica

__all__ = [
    "Usuario",
    "TipoUsuario",
    "Membresia",
    "TipoMembresia",
    "EstadoMembresia",
    "Asistencia",
    "Metrica",
    "TipoMetrica",
]

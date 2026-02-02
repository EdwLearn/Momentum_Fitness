"""
DEPRECATED: Importar desde app.modules.usuarios.models.membresia
Este archivo es solo para compatibilidad con código legacy.
"""
from app.modules.usuarios.models.membresia import Membresia, TipoMembresia, TipoPlan, EstadoMembresia

__all__ = ["Membresia", "TipoMembresia", "TipoPlan", "EstadoMembresia"]

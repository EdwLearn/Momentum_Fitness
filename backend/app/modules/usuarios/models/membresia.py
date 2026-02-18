from sqlalchemy import Column, Integer, String, DateTime, Boolean, ForeignKey, Enum
from sqlalchemy.orm import relationship
from datetime import datetime, timedelta, timezone
import enum
from app.core.database import Base

class TipoPlan(str, enum.Enum):
    """Tipos de planes de membresía disponibles"""
    PASE_DIARIO = "pase_diario"
    PASE_FLEX = "pase_flex"
    MENSUAL = "mensual"
    ESTUDIANTE = "estudiante"
    PLAN_3_MESES = "plan_3_meses"
    PLAN_6_MESES = "plan_6_meses"
    ELITE_ANUAL = "elite_anual"
    SOCIO = "socio"
    CORTESIA = "cortesia"

class EstadoMembresia(str, enum.Enum):
    ACTIVA = "activa"
    VENCIDA = "vencida"
    SUSPENDIDA = "suspendida"
    CANCELADA = "cancelada"

class TipoPago(str, enum.Enum):
    """Métodos de pago disponibles"""
    EFECTIVO = "efectivo"
    TARJETA = "tarjeta"
    TRANSFERENCIA = "transferencia"
    NEQUI = "nequi"
    DAVIPLATA = "daviplata"
    OTRO = "otro"

# Configuración de planes con precios y duración
# Para PASE_FLEX: dias=30 (vigencia 1 mes), visitas=14 (días de entrada disponibles)
PLANES_CONFIG = {
    TipoPlan.PASE_DIARIO: {"nombre": "Pase Diario", "precio": 5000, "dias": 1, "puede_referir": False, "visitas": None},
    TipoPlan.PASE_FLEX: {"nombre": "Pase Flex", "precio": 39900, "dias": 30, "puede_referir": False, "visitas": 14},
    TipoPlan.MENSUAL: {"nombre": "Mensual", "precio": 59900, "dias": 30, "puede_referir": True, "visitas": None},
    TipoPlan.ESTUDIANTE: {"nombre": "Estudiante", "precio": 45000, "dias": 30, "puede_referir": True, "visitas": None},
    TipoPlan.PLAN_3_MESES: {"nombre": "Plan 3 Meses", "precio": 149900, "dias": 90, "puede_referir": True, "visitas": None},
    TipoPlan.PLAN_6_MESES: {"nombre": "Plan 6 Meses", "precio": 269900, "dias": 180, "puede_referir": True, "visitas": None},
    TipoPlan.ELITE_ANUAL: {"nombre": "Membresía Platinum", "precio": 479900, "dias": 365, "puede_referir": True, "visitas": None},
    TipoPlan.SOCIO: {"nombre": "Socio", "precio": 0, "dias": 36500, "puede_referir": False, "visitas": None},
    TipoPlan.CORTESIA: {"nombre": "Cortesía", "precio": 0, "dias": 36500, "puede_referir": False, "visitas": None},
}

# Planes válidos para referir (solo planes largos)
PLANES_VALIDOS_REFERIR = [
    TipoPlan.MENSUAL,
    TipoPlan.PLAN_3_MESES,
    TipoPlan.PLAN_6_MESES,
    TipoPlan.ELITE_ANUAL,
]

# Configuración del sistema de referidos
REFERIDOS_CONFIG = {
    "referidos_por_mes_gratis": 3,  # Cada 3 referidos activos = 1 mes gratis
    "dias_por_recompensa": 30,  # 30 días por cada recompensa
    "descuento_referido": 0.05,  # 5% de descuento para el referido
}

# Mantener compatibilidad con código legacy
class TipoMembresia(str, enum.Enum):
    """DEPRECATED: Usar TipoPlan en su lugar"""
    MENSUAL = "mensual"
    TRIMESTRAL = "trimestral"
    SEMESTRAL = "semestral"
    ANUAL = "anual"

class Membresia(Base):
    __tablename__ = "membresias"

    id = Column(Integer, primary_key=True, index=True)
    usuario_id = Column(Integer, ForeignKey("usuarios.id"), nullable=False, index=True)

    # Tipo de plan y estado
    tipo_plan = Column(Enum(TipoPlan, values_callable=lambda x: [e.value for e in x]), nullable=False, index=True)
    estado = Column(Enum(EstadoMembresia, values_callable=lambda x: [e.value for e in x]), default=EstadoMembresia.ACTIVA, index=True)

    # Fechas
    fecha_inicio = Column(DateTime, default=datetime.utcnow, nullable=False)
    fecha_fin = Column(DateTime, nullable=False, index=True)

    # Precio y duración
    precio = Column(Integer, nullable=False)  # Precio en COP (DEPRECATED - usar precio_final)
    precio_original = Column(Integer, nullable=True)  # Precio base del plan
    precio_final = Column(Integer, nullable=True)     # Precio con descuento aplicado
    duracion_dias = Column(Integer, nullable=False)  # Duración en días

    # Para planes con visitas limitadas (ej: PASE_FLEX = 14 visitas en 30 días)
    visitas_disponibles = Column(Integer, nullable=True)  # None = ilimitadas, número = restantes

    # Referido (ahora por membresía, no por usuario)
    referido_por_id = Column(Integer, ForeignKey("usuarios.id"), nullable=True, index=True)

    # Tipo de pago
    tipo_pago = Column(Enum(TipoPago, values_callable=lambda x: [e.value for e in x]), nullable=True)

    # Campo opcional para notas
    descripcion = Column(String, nullable=True)

    # Control
    activo = Column(Boolean, default=True, nullable=False)

    # Relaciones
    usuario = relationship("Usuario", foreign_keys=[usuario_id], back_populates="membresias")
    referidor = relationship("Usuario", foreign_keys=[referido_por_id])

    @staticmethod
    def calcular_fecha_fin(fecha_inicio: datetime, duracion_dias: int) -> datetime:
        """Calcula la fecha fin basado en fecha inicio y duración"""
        return fecha_inicio + timedelta(days=duracion_dias)

    @staticmethod
    def get_config_plan(tipo_plan: TipoPlan) -> dict:
        """Obtiene la configuración de un plan específico"""
        return PLANES_CONFIG.get(tipo_plan)

    def esta_activa(self) -> bool:
        """Verifica si la membresía está activa y vigente"""
        colombia_tz = timezone(timedelta(hours=-5))
        now = datetime.now(colombia_tz)
        vigente = self.activo and self.estado == EstadoMembresia.ACTIVA and self.fecha_fin >= now
        # Para planes con visitas limitadas, verificar que aún tenga visitas
        if vigente and self.visitas_disponibles is not None:
            return self.visitas_disponibles > 0
        return vigente

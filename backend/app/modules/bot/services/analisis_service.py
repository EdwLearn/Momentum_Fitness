from sqlalchemy.orm import Session
from sqlalchemy import func, and_
from typing import Dict, Optional, List
from datetime import datetime, timedelta, date
import json

from app.modules.usuarios.models.usuario import Usuario
from app.modules.asistencia.models.asistencia import Asistencia
from app.modules.bot.models.logro import Logro, TipoLogro
from app.modules.bot.models.conversacion import Conversacion
from app.modules.bot.models.alerta_osne import AlertaOsne
from app.modules.bot.models.config_sistema import ConfigSistema
from app.modules.bot.models.metricas_usuario import MetricasUsuario
from app.modules.bot.models.historial_analisis import HistorialAnalisis

from langchain_core.prompts import ChatPromptTemplate
from app.core.llm_config import get_analytical_llm


class AnalisisService:
    """
    Servicio para analizar usuarios y generar alertas inteligentes para Osne.
    Usa LLM para determinar qué situaciones requieren intervención humana.
    """

    def __init__(self, db: Session):
        self.db = db
        self.config = self._get_config()
        # Usa LLM local (Ollama) con temperatura baja para análisis más determinístico
        self.llm = get_analytical_llm(use_local=True)

    def _get_config(self) -> ConfigSistema:
        """Obtiene la configuración del sistema."""
        config = self.db.query(ConfigSistema).filter(ConfigSistema.id == 1).first()
        if not config:
            # Crear configuración por defecto si no existe
            config = ConfigSistema(id=1)
            self.db.add(config)
            self.db.commit()
        return config

    def analizar_usuario(self, usuario: Usuario) -> Optional[Dict]:
        """
        Analiza un usuario específico y determina si requiere alerta.
        Retorna dict con info de alerta o None si no requiere intervención.
        """
        # Obtener contexto completo del usuario
        contexto = self._obtener_contexto_usuario(usuario)

        # Determinar si requiere análisis
        if not self._requiere_analisis(contexto):
            return None

        # Usar LLM para análisis inteligente
        resultado_llm = self._analizar_con_llm(usuario, contexto)

        if resultado_llm.get("requiere_intervencion"):
            return resultado_llm

        return None

    def _obtener_contexto_usuario(self, usuario: Usuario) -> Dict:
        """Obtiene todo el contexto relevante de un usuario."""
        # Asistencias recientes
        asistencias_30d = self.db.query(Asistencia).filter(
            Asistencia.usuario_id == usuario.id,
            Asistencia.fecha >= date.today() - timedelta(days=30)
        ).count()

        # Última asistencia
        ultima_asistencia = self.db.query(Asistencia).filter(
            Asistencia.usuario_id == usuario.id
        ).order_by(Asistencia.fecha.desc()).first()

        dias_sin_asistir = None
        if ultima_asistencia:
            dias_sin_asistir = (date.today() - ultima_asistencia.fecha).days

        # Conversaciones recientes
        conversaciones = self.db.query(Conversacion).filter(
            Conversacion.usuario_id == usuario.id
        ).order_by(Conversacion.timestamp.desc()).limit(5).all()

        # Logros recientes
        logros = self.db.query(Logro).filter(
            Logro.usuario_id == usuario.id
        ).order_by(Logro.fecha.desc()).limit(3).all()

        # Métricas
        metricas = self.db.query(MetricasUsuario).filter(
            MetricasUsuario.usuario_id == usuario.id
        ).first()

        return {
            "usuario_id": usuario.id,
            "nombre": f"{usuario.nombre} {usuario.apellido}",
            "objetivo": usuario.objetivo,
            "dias_sin_asistir": dias_sin_asistir,
            "asistencias_30d": asistencias_30d,
            "peso_inicial": usuario.peso_inicial,
            "peso_actual": usuario.peso_actual,
            "cambio_peso": usuario.peso_actual - usuario.peso_inicial if usuario.peso_actual and usuario.peso_inicial else None,
            "racha_actual": metricas.racha_actual if metricas else 0,
            "racha_maxima": metricas.racha_maxima if metricas else 0,
            "tasa_respuesta": metricas.tasa_respuesta if metricas else 0,
            "conversaciones_recientes": [
                {
                    "mensaje": c.mensaje_usuario,
                    "respuesta": c.respuesta_bot,
                    "sentimiento": c.sentimiento,
                    "fecha": c.timestamp.isoformat()
                }
                for c in conversaciones
            ],
            "logros_recientes": [
                {
                    "tipo": l.tipo_logro.value,
                    "titulo": l.titulo,
                    "fecha": l.fecha.isoformat()
                }
                for l in logros
            ]
        }

    def _requiere_analisis(self, contexto: Dict) -> bool:
        """Determina si un usuario requiere análisis basado en umbrales básicos."""
        # Inactividad urgente
        if contexto["dias_sin_asistir"] and contexto["dias_sin_asistir"] >= self.config.dias_ausencia_urgente:
            return True

        # Racha significativa (oportunidad de celebrar/upsell)
        rachas_notificar = [int(x) for x in self.config.rachas_notificar.split(',')]
        if contexto["racha_actual"] in rachas_notificar:
            return True

        # Cambio de peso significativo
        if contexto["cambio_peso"] and abs(contexto["cambio_peso"]) >= 2:
            return True

        # Logros recientes no celebrados adecuadamente
        if len(contexto["logros_recientes"]) > 0:
            return True

        return False

    def _analizar_con_llm(self, usuario: Usuario, contexto: Dict) -> Dict:
        """Usa LLM para análisis inteligente y generación de alerta."""

        prompt = ChatPromptTemplate.from_messages([
            ("system", """Eres un asistente de análisis para un gimnasio. Tu trabajo es analizar usuarios y determinar si requieren intervención humana de Osne (el dueño).

Clasifica la situación en:
- URGENTE (prioridad 1-2): Requiere acción inmediata (riesgo de cancelación, inactividad crítica)
- OPORTUNIDAD (prioridad 3): Momento ideal para upgrade, venta adicional, celebración
- SEGUIMIENTO (prioridad 4-5): Situación a monitorear pero no urgente

Responde SOLO con un JSON válido con esta estructura:
{{
    "requiere_intervencion": true/false,
    "tipo_alerta": "urgente/oportunidad/seguimiento",
    "prioridad": 1-5,
    "razon": "Explicación corta de qué pasó",
    "accion_sugerida": "audio_reconexion/audio_celebracion/audio_motivacional/mensaje_texto/llamada",
    "puntos_clave": ["punto1", "punto2", "punto3"],
    "contexto_analisis": "Análisis detallado para Osne"
}}"""),
            ("human", """Analiza este usuario:

Nombre: {nombre}
Objetivo: {objetivo}
Días sin asistir: {dias_sin_asistir}
Asistencias últimos 30 días: {asistencias_30d}
Racha actual: {racha_actual} días
Racha máxima histórica: {racha_maxima} días
Cambio de peso: {cambio_peso} kg
Tasa de respuesta a mensajes: {tasa_respuesta}%

Logros recientes:
{logros}

Conversaciones recientes:
{conversaciones}

¿Requiere intervención de Osne? Analiza y responde en JSON.""")
        ])

        # Formatear datos para el prompt
        logros_text = "\n".join([
            f"- {l['titulo']} ({l['tipo']}) - {l['fecha']}"
            for l in contexto["logros_recientes"]
        ]) or "Sin logros recientes"

        conv_text = "\n".join([
            f"- Usuario: {c['mensaje']}\n  Bot: {c['respuesta']}\n  Sentimiento: {c['sentimiento']}"
            for c in contexto["conversaciones_recientes"]
        ]) or "Sin conversaciones recientes"

        chain = prompt | self.llm

        response = chain.invoke({
            "nombre": contexto["nombre"],
            "objetivo": contexto["objetivo"] or "No especificado",
            "dias_sin_asistir": contexto["dias_sin_asistir"] or 0,
            "asistencias_30d": contexto["asistencias_30d"],
            "racha_actual": contexto["racha_actual"],
            "racha_maxima": contexto["racha_maxima"],
            "cambio_peso": f"{contexto['cambio_peso']:.1f}" if contexto["cambio_peso"] else "N/A",
            "tasa_respuesta": f"{contexto['tasa_respuesta']*100:.0f}" if contexto["tasa_respuesta"] else "0",
            "logros": logros_text,
            "conversaciones": conv_text
        })

        # Parsear respuesta JSON
        try:
            resultado = json.loads(response.content)
            resultado["usuario_id"] = usuario.id
            resultado["contexto_completo"] = contexto
            return resultado
        except json.JSONDecodeError:
            # Fallback si el LLM no responde con JSON válido
            return {
                "requiere_intervencion": False,
                "error": "No se pudo parsear respuesta del LLM"
            }

    def crear_alerta_osne(self, analisis: Dict) -> AlertaOsne:
        """Crea una alerta en la base de datos."""
        alerta = AlertaOsne(
            usuario_id=analisis["usuario_id"],
            tipo_alerta=analisis["tipo_alerta"],
            prioridad=analisis["prioridad"],
            razon=analisis["razon"],
            accion_sugerida=analisis["accion_sugerida"],
            contexto_json=json.dumps(analisis.get("contexto_completo", {})),
            puntos_clave="|".join(analisis["puntos_clave"]),
            estado="pendiente"
        )

        self.db.add(alerta)
        self.db.commit()
        self.db.refresh(alerta)

        # Actualizar métricas del usuario
        self._actualizar_metricas_alerta(analisis["usuario_id"])

        return alerta

    def _actualizar_metricas_alerta(self, usuario_id: int):
        """Actualiza las métricas de alertas del usuario."""
        metricas = self.db.query(MetricasUsuario).filter(
            MetricasUsuario.usuario_id == usuario_id
        ).first()

        if metricas:
            metricas.total_alertas += 1
            metricas.ultima_alerta = date.today()
            self.db.commit()

    def analizar_todos_usuarios(self, tipo_analisis: str = "manual") -> Dict:
        """
        Analiza todos los usuarios activos y genera alertas.
        Retorna resumen de la ejecución.
        """
        inicio = datetime.utcnow()

        usuarios = self.db.query(Usuario).filter(Usuario.activo == True).all()

        usuarios_analizados = 0
        alertas_generadas = 0
        errores = []

        for usuario in usuarios:
            try:
                analisis = self.analizar_usuario(usuario)
                usuarios_analizados += 1

                if analisis:
                    self.crear_alerta_osne(analisis)
                    alertas_generadas += 1

            except Exception as e:
                errores.append(f"Usuario {usuario.id}: {str(e)}")

        # Guardar en historial
        duracion = (datetime.utcnow() - inicio).total_seconds()

        historial = HistorialAnalisis(
            tipo_analisis=tipo_analisis,
            usuarios_analizados=usuarios_analizados,
            alertas_generadas=alertas_generadas,
            mensajes_enviados=0,  # Se actualiza cuando se envíen mensajes
            errores="|".join(errores) if errores else None,
            duracion_segundos=duracion
        )

        self.db.add(historial)
        self.db.commit()

        return {
            "usuarios_analizados": usuarios_analizados,
            "alertas_generadas": alertas_generadas,
            "errores": errores,
            "duracion_segundos": duracion
        }

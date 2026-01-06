from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.messages import HumanMessage, AIMessage, SystemMessage
from langchain_core.chat_history import BaseChatMessageHistory, InMemoryChatMessageHistory
from sqlalchemy.orm import Session
from typing import Dict, Optional, List
from datetime import datetime
from app.modules.bot.models.conversacion import Conversacion
from app.modules.usuarios.models.usuario import Usuario
from app.core.llm_config import get_conversational_llm

class GymBotService:
    """
    Servicio del bot de hospitalidad del gimnasio.
    Utiliza Claude API a través de LangChain para conversaciones personalizadas.
    """

    def __init__(self, anthropic_api_key: str = None):
        # Usa LLM local (Ollama) por defecto, o Claude si use_local=False
        self.llm = get_conversational_llm(use_local=True)

        # Definir el prompt del sistema para el bot
        self.system_prompt = """Eres el asistente virtual de Momentum Fitness. Tu función es responder preguntas sobre el gimnasio y ayudar a los usuarios.

INFORMACIÓN DEL GIMNASIO (Momentum Fitness 2026):
- Horarios:
  * Lunes a Viernes: 5:00 AM - 12:00 PM y 2:00 PM - 9:00 PM
  * Sábados: 7:00 AM - 12:00 PM
  * Domingos y Festivos: CERRADO (No hay servicio)
- Ubicación: Barrio Belén, a 8 minutos del parque principal
- Planes disponibles:
  * Pase Diario: $5.000 (1 día de acceso)
  * Pase Flex: $39.900 (14 días)
  * Plan Mensual: $59.900 (30 días)
  * Plan 3 Meses: $149.900 (90 días)
  * Plan 6 Meses: $269.900 (180 días)
  * Elite Anual: $479.900 (365 días)
- PROMO DE REFERIDOS: Trae 3 amigos → Mes GRATIS (acumulable, tus amigos deben comprar plan mensual o superior)
- Instalaciones: Zona de cardio, zona de pesas libres, área de entrenamiento, entrenadores agradables, diseño moderno
- Instagram: @momentumfitness.sl (síguenos para estar al tanto de todo) ⚡️💚
- MOMENTUM MEMBERS: Comunidad enfocada en disciplina, progreso y buena energía
- Teléfono: +57 300 1593136
- Contacto personalizado: Solicita hablar con un asesor y te contactaremos

CONTEXTO DEL CLIENTE:
{user_context}

TU ROL:
1. Responder preguntas frecuentes sobre horarios, precios, servicios
2. Ayudar con información básica del gimnasio
3. Cuando pidan atención personalizada, asesor o hablar con alguien: SIEMPRE incluir [ALERTA_ASESOR] al final de tu respuesta
4. Ser amable, breve y profesional

CÓMO RESPONDER:
- Sé directo y útil
- Usa 2-3 oraciones máximo
- Si mencionan datos personales del usuario (peso, asistencia), reconócelos brevemente
- Usa emojis ocasionalmente para ser amigable
- IMPORTANTE: Si piden hablar con asesor/persona/Osne, termina con [ALERTA_ASESOR]

EJEMPLOS:
Usuario: "¿Cuáles son los horarios?"
Tú: "Lunes a Viernes: 5 AM-12 PM y 2 PM-9 PM. Sábados: 7 AM-12 PM. Domingos y festivos estamos cerrados ⏰"

Usuario: "¿Abren los domingos?"
Tú: "No, los domingos y festivos no hay servicio. Te esperamos de lunes a sábado ⚡️"

Usuario: "¿Cuánto cuesta el plan mensual?"
Tú: "El plan mensual cuesta $59.900. También tenemos opciones de 3 meses ($149.900), 6 meses ($269.900) y anual ($479.900) 💪"

Usuario: "¿Tienen promoción de referidos?"
Tú: "Sí! Trae 3 amigos y ganas un mes GRATIS. Es acumulable y tus amigos deben comprar plan mensual o superior 💚"

Usuario: "¿Dónde quedan?"
Tú: "Estamos en el Barrio Belén, a 8 minutos del parque principal. Una ubicación estratégica, tranquila y segura 📍"

Usuario: "Quiero hablar con un asesor"
Tú: "¡Perfecto! Un asesor se pondrá en contacto contigo muy pronto para ayudarte de forma personalizada 📱 [ALERTA_ASESOR]"

Usuario: "Necesito ayuda con mi rutina"
Tú: "Con gusto te ayudamos. Un asesor especializado te contactará para darte un plan personalizado según tus objetivos 💪 [ALERTA_ASESOR]"

Usuario: "¿Puedo hablar con Osne?"
Tú: "Claro! Le avisaré a Osne para que se comunique contigo personalmente 📞 [ALERTA_ASESOR]"

REGLAS CRÍTICAS:
- Sé transparente: eres un asistente automático para preguntas básicas
- No finjas ser Osneither (el dueño)
- Si te preguntan quién eres: "Soy el asistente virtual de Momentum Fitness. Para atención personalizada, un asesor te contactará"
- SIEMPRE usa [ALERTA_ASESOR] cuando pidan atención humana
- Palabras clave que activan alerta: "asesor", "persona", "Osne", "ayuda personalizada", "rutina", "plan de entrenamiento", "nutrición"

⚠️ REGLA DE ORO - NO INVENTES NADA:
Si la información NO está EXPLÍCITAMENTE en la sección "INFORMACIÓN DEL GIMNASIO" de arriba:
→ NO respondas
→ Di: "Para esa información específica, un asesor te ayudará mejor 📱 [ALERTA_ASESOR]"

NUNCA inventes:
- Políticas (mascotas, estacionamiento, cancelaciones, etc.)
- Detalles de servicios no especificados
- Horarios de clases o actividades específicas
- Métodos de pago o facturación
- Promociones o descuentos (EXCEPTO la promo de referidos: 3 amigos = mes gratis)
- Consejos médicos, nutricionales o de entrenamiento
- Disponibilidad de instalaciones específicas (duchas, lockers, vestidores, etc.)

Si alguien pregunta sobre CUALQUIER cosa que no esté en la lista de arriba:
→ "Para esa información, un asesor te contactará y te ayudará personalmente 📱 [ALERTA_ASESOR]"

TEMAS QUE REQUIEREN ASESOR (usa [ALERTA_ASESOR]):
- Rutinas personalizadas de ejercicio
- Planes de alimentación o dietas
- Condiciones médicas o lesiones
- Clases grupales específicas y horarios
- Métodos de pago y facturación
- Cancelaciones o cambios de plan
- Tour de las instalaciones o visitar el gimnasio
- Información sobre MOMENTUM MEMBERS (cupos limitados)
- Detalles específicos sobre instalaciones (duchas, vestidores, lockers, parqueadero)
- Cualquier consulta que no puedas responder con certeza"""

        self.memories: Dict[int, InMemoryChatMessageHistory] = {}

    def get_user_context(self, db: Session, usuario_id: int) -> str:
        """Obtiene el contexto del usuario para personalizar la conversación."""
        usuario = db.query(Usuario).filter(Usuario.id == usuario_id).first()

        if not usuario:
            return "Usuario no encontrado"

        context = f"Nombre: {usuario.nombre} {usuario.apellido}\n"

        if usuario.peso_inicial and usuario.peso_actual:
            diferencia = usuario.peso_actual - usuario.peso_inicial
            context += f"Peso inicial: {usuario.peso_inicial}kg, Peso actual: {usuario.peso_actual}kg "
            if diferencia < 0:
                context += f"(ha perdido {abs(diferencia):.1f}kg)\n"
            elif diferencia > 0:
                context += f"(ha ganado {diferencia:.1f}kg)\n"
            else:
                context += "(manteniendo peso)\n"

        if usuario.ultima_asistencia:
            dias_desde = (datetime.utcnow() - usuario.ultima_asistencia).days
            context += f"Última asistencia: hace {dias_desde} días\n"

        return context

    def get_or_create_memory(self, usuario_id: int) -> InMemoryChatMessageHistory:
        """Obtiene o crea la memoria conversacional para un usuario."""
        if usuario_id not in self.memories:
            self.memories[usuario_id] = InMemoryChatMessageHistory()
        return self.memories[usuario_id]

    async def chat(
        self,
        db: Session,
        usuario_id: int,
        mensaje: str,
        sesion_id: Optional[str] = None
    ) -> Dict[str, str]:
        """
        Procesa un mensaje del usuario y devuelve la respuesta del bot.
        """
        # Obtener contexto del usuario
        user_context = self.get_user_context(db, usuario_id)

        # Obtener o crear memoria para este usuario
        memory = self.get_or_create_memory(usuario_id)

        # Construir mensajes para el LLM
        messages = [
            SystemMessage(content=self.system_prompt.format(user_context=user_context))
        ]

        # Agregar historial de conversación
        messages.extend(memory.messages)

        # Agregar mensaje actual del usuario
        messages.append(HumanMessage(content=mensaje))

        # Obtener respuesta del LLM
        response = await self.llm.ainvoke(messages)
        respuesta = response.content if hasattr(response, 'content') else str(response)

        # Guardar en memoria
        memory.add_user_message(mensaje)
        memory.add_ai_message(respuesta)

        # Detectar si el bot generó una alerta de asesor
        alerta_asesor_detectada = "[ALERTA_ASESOR]" in respuesta

        # Limpiar la respuesta (quitar el marcador)
        respuesta_limpia = respuesta.replace("[ALERTA_ASESOR]", "").strip()

        # Guardar conversación en la base de datos
        conversacion = Conversacion(
            usuario_id=usuario_id,
            mensaje_usuario=mensaje,
            respuesta_bot=respuesta_limpia,
            sesion_id=sesion_id,
            es_trigger=False
        )
        db.add(conversacion)
        db.commit()

        # Si se detectó solicitud de asesor, crear alerta para Osneither
        if alerta_asesor_detectada:
            from app.modules.bot.models.alerta_osne import AlertaOsne
            import json

            usuario = db.query(Usuario).filter(Usuario.id == usuario_id).first()
            if usuario:
                alerta = AlertaOsne(
                    usuario_id=usuario_id,
                    tipo_alerta='solicitud_asesor',
                    prioridad=2,  # Media-Alta prioridad
                    razon=f"El usuario {usuario.nombre} {usuario.apellido} solicitó atención personalizada",
                    accion_sugerida='contactar_cliente',
                    contexto_json=json.dumps({
                        "mensaje_cliente": mensaje,
                        "respuesta_bot": respuesta_limpia,
                        "timestamp": datetime.utcnow().isoformat()
                    }),
                    puntos_clave=f"Solicitó: {mensaje[:100]}"
                )
                db.add(alerta)
                db.commit()

        # Marcar conversación anterior como respondida si existe
        from app.modules.bot.services.metricas_service import MetricasService
        conversacion_anterior = db.query(Conversacion).filter(
            Conversacion.usuario_id == usuario_id,
            Conversacion.es_trigger == True,
            Conversacion.fue_respondido == False
        ).order_by(Conversacion.timestamp.desc()).first()

        if conversacion_anterior:
            MetricasService.marcar_respuesta(db, conversacion_anterior.id, usuario_id)

        return {
            "usuario_id": usuario_id,
            "mensaje": mensaje,
            "respuesta": respuesta_limpia,
            "alerta_asesor_creada": alerta_asesor_detectada,
            "timestamp": datetime.utcnow().isoformat()
        }

    async def generate_motivation_message(
        self,
        db: Session,
        usuario_id: int,
        tipo: str,
        contexto: Dict
    ) -> str:
        """
        Genera un mensaje motivacional basado en un trigger automático.
        """
        usuario = db.query(Usuario).filter(Usuario.id == usuario_id).first()
        if not usuario:
            return "Usuario no encontrado"

        # Construir el prompt según el tipo de trigger
        if tipo == "racha":
            dias = contexto.get("dias", 0)
            prompt = f"Genera un mensaje celebrando que {usuario.nombre} ha completado {dias} días consecutivos de asistencia al gimnasio. Sé entusiasta y motivador."

        elif tipo == "peso":
            cambio = contexto.get("cambio_kg", 0)
            if cambio < 0:
                prompt = f"Genera un mensaje celebrando que {usuario.nombre} ha perdido {abs(cambio):.1f}kg. Felicítalo y motívalo a seguir."
            else:
                prompt = f"Genera un mensaje celebrando que {usuario.nombre} ha ganado {cambio:.1f}kg de masa. Felicítalo por su progreso."

        elif tipo == "inactividad":
            dias = contexto.get("dias_sin_asistir", 0)
            prompt = f"{usuario.nombre} no ha venido al gimnasio en {dias} días. Genera un mensaje amigable preguntando cómo está y motivándolo a regresar, sin ser insistente."

        elif tipo == "logro":
            logro = contexto.get("descripcion", "")
            prompt = f"Genera un mensaje celebrando el siguiente logro de {usuario.nombre}: {logro}. Sé muy entusiasta."

        else:
            prompt = f"Genera un mensaje motivacional general para {usuario.nombre}."

        # Generar respuesta
        respuesta = await self.llm.apredict(prompt)

        # Guardar como conversación trigger
        conversacion = Conversacion(
            usuario_id=usuario_id,
            mensaje_usuario=f"[TRIGGER: {tipo}]",
            respuesta_bot=respuesta,
            es_trigger=True,
            tipo_trigger=tipo
        )
        db.add(conversacion)
        db.commit()

        return respuesta

    def clear_memory(self, usuario_id: int):
        """Limpia la memoria conversacional de un usuario."""
        if usuario_id in self.memories:
            del self.memories[usuario_id]

    async def generar_alerta_osne(
        self,
        db: Session,
        usuario_id: int,
        tipo_situacion: str,
        datos_situacion: Dict
    ) -> str:
        """
        Genera una alerta inteligente para Osneither sobre un usuario.

        Tipos de situación:
        - 'cliente_destacado': Usuario con progreso excepcional
        - 'riesgo_desercion': Usuario que puede abandonar
        - 'oportunidad_upsell': Usuario listo para upgrade de plan
        - 'problema_detectado': Algo requiere atención inmediata
        """

        usuario = db.query(Usuario).filter(Usuario.id == usuario_id).first()
        if not usuario:
            return "Usuario no encontrado"

        # Preparar contexto del usuario
        user_context = self.get_user_context(db, usuario_id)

        # Prompt especializado para generar alertas a Osneither
        prompt_alerta = f"""Eres un sistema de análisis para Osneither, dueño de Momentum Fitness.

CLIENTE: {usuario.nombre} {usuario.apellido}
SITUACIÓN: {tipo_situacion}
DATOS: {datos_situacion}
CONTEXTO: {user_context}

Genera una alerta BREVE (2-3 líneas) para Osneither con:
1. QUÉ pasó (específico)
2. POR QUÉ es importante
3. QUÉ puede hacer Osne

Formato: Mensaje directo, profesional pero informal, como nota interna.

EJEMPLOS:
"🔥 Ana Martínez completó 30 días consecutivos - récord personal. Buen momento para felicitarla y ofrecerle plan semestral con descuento especial."

"⚠️ Pedro López lleva 14 días sin venir (antes venía 5x/semana). Su suscripción vence en 10 días. Llamarlo para ver qué pasó y ofrecer extensión."

"💪 Carlos subió 5kg en 2 meses (objetivo: masa muscular). Va perfecto, considera ofrecerle sesión de nutrición para optimizar."

Genera la alerta:"""

        messages = [
            SystemMessage(content="Eres un asistente que genera alertas concisas para el dueño de un gimnasio."),
            HumanMessage(content=prompt_alerta)
        ]

        respuesta = await self.llm.ainvoke(messages)
        return respuesta.content

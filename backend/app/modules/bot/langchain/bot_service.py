from langchain_anthropic import ChatAnthropic
from langchain.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain.memory import ConversationBufferMemory
from langchain.chains import ConversationChain
from sqlalchemy.orm import Session
from typing import Dict, Optional
from datetime import datetime
from app.modules.bot.models.conversacion import Conversacion
from app.modules.usuarios.models.usuario import Usuario

class GymBotService:
    """
    Servicio del bot de hospitalidad del gimnasio.
    Utiliza Claude API a través de LangChain para conversaciones personalizadas.
    """

    def __init__(self, anthropic_api_key: str):
        self.llm = ChatAnthropic(
            model="claude-3-5-sonnet-20241022",
            anthropic_api_key=anthropic_api_key,
            temperature=0.7,
            max_tokens=1024
        )

        # Definir el prompt del sistema para el bot
        self.system_prompt = """Eres un asistente personal de gimnasio amigable y motivador. Tu nombre es GymBot.

Tu personalidad:
- Eres cercano y motivador, como un amigo coach
- Celebras los logros de los usuarios con entusiasmo
- Ofreces apoyo cuando alguien está desmotivado
- Das consejos prácticos sobre ejercicio y hábitos saludables
- Usas un tono informal pero respetuoso
- Eres positivo y alentador

Tu rol:
- Ayudar a los usuarios a mantener su motivación
- Celebrar rachas de asistencia y logros
- Dar seguimiento al progreso de peso y métricas
- Recordar objetivos y metas personales
- Ofrecer consejos sobre rutinas y ejercicios

Contexto del usuario actual:
{user_context}

Mantén las respuestas concisas y enfocadas. No olvides celebrar los pequeños logros."""

        self.memories: Dict[int, ConversationBufferMemory] = {}

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

    def get_or_create_memory(self, usuario_id: int) -> ConversationBufferMemory:
        """Obtiene o crea la memoria conversacional para un usuario."""
        if usuario_id not in self.memories:
            self.memories[usuario_id] = ConversationBufferMemory(
                return_messages=True,
                memory_key="chat_history"
            )
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

        # Crear el prompt con contexto
        prompt = ChatPromptTemplate.from_messages([
            ("system", self.system_prompt.format(user_context=user_context)),
            MessagesPlaceholder(variable_name="chat_history"),
            ("human", "{input}")
        ])

        # Crear la cadena de conversación
        conversation = ConversationChain(
            llm=self.llm,
            memory=memory,
            prompt=prompt,
            verbose=False
        )

        # Obtener respuesta
        respuesta = await conversation.apredict(input=mensaje)

        # Guardar conversación en la base de datos
        conversacion = Conversacion(
            usuario_id=usuario_id,
            mensaje_usuario=mensaje,
            respuesta_bot=respuesta,
            sesion_id=sesion_id,
            es_trigger=False
        )
        db.add(conversacion)
        db.commit()

        return {
            "usuario_id": usuario_id,
            "mensaje": mensaje,
            "respuesta": respuesta,
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

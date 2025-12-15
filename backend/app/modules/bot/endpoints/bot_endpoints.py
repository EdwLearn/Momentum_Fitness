from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime

from app.core.database import get_db
from app.core.config import settings
from app.modules.bot.schemas.bot_schemas import (
    ChatRequest,
    ChatResponse,
    MotivationRequest,
    MotivationResponse,
    TriggersResponse,
    TriggerInfo,
    MemoryStatsResponse,
    ConversacionHistorial
)
from app.modules.bot.langchain.bot_service import GymBotService
from app.modules.bot.triggers.trigger_service import TriggerService
from app.modules.bot.memory.conversation_memory import ConversationMemoryService

router = APIRouter()

# Instancia global del bot (se inicializa con la API key de configuración)
bot_service = None

def get_bot_service():
    """Dependency para obtener la instancia del bot."""
    global bot_service
    if bot_service is None:
        bot_service = GymBotService(anthropic_api_key=settings.ANTHROPIC_API_KEY)
    return bot_service

@router.post("/chat", response_model=ChatResponse, status_code=status.HTTP_200_OK)
async def chat_with_bot(
    request: ChatRequest,
    db: Session = Depends(get_db),
    bot: GymBotService = Depends(get_bot_service)
):
    """
    Endpoint para conversación en tiempo real con el bot.

    - **usuario_id**: ID del usuario que envía el mensaje
    - **mensaje**: Mensaje del usuario
    - **sesion_id**: (Opcional) ID de la sesión para agrupar conversaciones
    """
    try:
        result = await bot.chat(
            db=db,
            usuario_id=request.usuario_id,
            mensaje=request.mensaje,
            sesion_id=request.sesion_id
        )
        return ChatResponse(**result)

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al procesar el mensaje: {str(e)}"
        )

@router.get("/triggers", response_model=TriggersResponse)
def get_pending_triggers(db: Session = Depends(get_db)):
    """
    Obtiene todos los triggers pendientes de notificación.

    Detecta:
    - Rachas de asistencia (7, 15, 30, 60, 90 días)
    - Cambios de peso significativos (2kg, 5kg, 10kg)
    - Inactividad (3, 7, 14 días sin asistir)
    - Logros pendientes
    """
    try:
        triggers = TriggerService.obtener_todos_los_triggers(db)

        trigger_list = [
            TriggerInfo(
                usuario_id=t["usuario_id"],
                tipo=t["tipo"],
                contexto=t["contexto"]
            )
            for t in triggers
        ]

        return TriggersResponse(
            total_triggers=len(trigger_list),
            triggers=trigger_list
        )

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al obtener triggers: {str(e)}"
        )

@router.post("/send-motivation", response_model=MotivationResponse)
async def send_motivation_message(
    request: MotivationRequest,
    db: Session = Depends(get_db),
    bot: GymBotService = Depends(get_bot_service)
):
    """
    Envía un mensaje motivacional automático basado en un trigger.

    - **usuario_id**: ID del usuario destinatario
    - **tipo**: Tipo de trigger (racha, peso, inactividad, logro)
    - **contexto**: Información adicional del trigger
    """
    try:
        mensaje = await bot.generate_motivation_message(
            db=db,
            usuario_id=request.usuario_id,
            tipo=request.tipo,
            contexto=request.contexto
        )

        # Si es un logro, marcarlo como notificado
        if request.tipo in ["racha", "peso", "logro"]:
            if "dias" in request.contexto:
                TriggerService.marcar_logro_notificado(
                    db, request.usuario_id, "racha", request.contexto["dias"]
                )
            elif "cambio_kg" in request.contexto:
                # Determinar el umbral alcanzado
                cambio = abs(request.contexto["cambio_kg"])
                for umbral in [2, 5, 10]:
                    if cambio >= umbral:
                        TriggerService.marcar_logro_notificado(
                            db, request.usuario_id, "peso", umbral
                        )
                        break

        return MotivationResponse(
            usuario_id=request.usuario_id,
            tipo=request.tipo,
            mensaje=mensaje,
            timestamp=datetime.utcnow().isoformat()
        )

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al enviar mensaje motivacional: {str(e)}"
        )

@router.get("/history/{usuario_id}", response_model=MemoryStatsResponse)
def get_conversation_history(
    usuario_id: int,
    limit: int = 10,
    db: Session = Depends(get_db)
):
    """
    Obtiene el historial de conversaciones de un usuario.

    - **usuario_id**: ID del usuario
    - **limit**: Número máximo de conversaciones a retornar
    """
    try:
        conversaciones = ConversationMemoryService.get_recent_conversations(
            db, usuario_id, limit
        )

        historial = [
            ConversacionHistorial.from_orm(conv) for conv in conversaciones
        ]

        return MemoryStatsResponse(
            usuario_id=usuario_id,
            total_conversaciones=len(historial),
            conversaciones_recientes=historial
        )

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al obtener historial: {str(e)}"
        )

@router.post("/clear-memory/{usuario_id}", status_code=status.HTTP_200_OK)
def clear_user_memory(
    usuario_id: int,
    bot: GymBotService = Depends(get_bot_service)
):
    """
    Limpia la memoria conversacional en caché de un usuario.
    (Útil para resetear el contexto de la conversación)
    """
    bot.clear_memory(usuario_id)
    return {"message": f"Memoria del usuario {usuario_id} limpiada exitosamente"}

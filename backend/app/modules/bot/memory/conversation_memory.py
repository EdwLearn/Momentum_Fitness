from sqlalchemy.orm import Session
from typing import List, Dict
from datetime import datetime, timedelta
from app.modules.bot.models.conversacion import Conversacion

class ConversationMemoryService:
    """
    Servicio para gestionar la memoria conversacional persistente.
    Permite recuperar conversaciones pasadas y mantener contexto.
    """

    @staticmethod
    def get_recent_conversations(
        db: Session,
        usuario_id: int,
        limit: int = 10
    ) -> List[Conversacion]:
        """Obtiene las conversaciones recientes de un usuario."""
        return db.query(Conversacion).filter(
            Conversacion.usuario_id == usuario_id
        ).order_by(
            Conversacion.timestamp.desc()
        ).limit(limit).all()

    @staticmethod
    def get_session_conversations(
        db: Session,
        sesion_id: str
    ) -> List[Conversacion]:
        """Obtiene todas las conversaciones de una sesión específica."""
        return db.query(Conversacion).filter(
            Conversacion.sesion_id == sesion_id
        ).order_by(
            Conversacion.timestamp.asc()
        ).all()

    @staticmethod
    def get_conversations_by_date_range(
        db: Session,
        usuario_id: int,
        fecha_inicio: datetime,
        fecha_fin: datetime
    ) -> List[Conversacion]:
        """Obtiene conversaciones en un rango de fechas."""
        return db.query(Conversacion).filter(
            Conversacion.usuario_id == usuario_id,
            Conversacion.timestamp >= fecha_inicio,
            Conversacion.timestamp <= fecha_fin
        ).order_by(
            Conversacion.timestamp.asc()
        ).all()

    @staticmethod
    def get_trigger_messages(
        db: Session,
        usuario_id: int,
        tipo_trigger: str = None
    ) -> List[Conversacion]:
        """Obtiene mensajes automáticos (triggers) enviados a un usuario."""
        query = db.query(Conversacion).filter(
            Conversacion.usuario_id == usuario_id,
            Conversacion.es_trigger == True
        )

        if tipo_trigger:
            query = query.filter(Conversacion.tipo_trigger == tipo_trigger)

        return query.order_by(Conversacion.timestamp.desc()).all()

    @staticmethod
    def format_conversation_history(
        conversaciones: List[Conversacion]
    ) -> List[Dict[str, str]]:
        """
        Formatea las conversaciones para usarlas en el contexto del bot.
        """
        history = []
        for conv in conversaciones:
            history.append({
                "role": "user",
                "content": conv.mensaje_usuario,
                "timestamp": conv.timestamp.isoformat()
            })
            history.append({
                "role": "assistant",
                "content": conv.respuesta_bot,
                "timestamp": conv.timestamp.isoformat()
            })
        return history

    @staticmethod
    def get_conversation_summary(
        db: Session,
        usuario_id: int,
        dias: int = 7
    ) -> Dict:
        """
        Obtiene un resumen de las conversaciones recientes.
        """
        fecha_inicio = datetime.utcnow() - timedelta(days=dias)
        conversaciones = ConversationMemoryService.get_conversations_by_date_range(
            db, usuario_id, fecha_inicio, datetime.utcnow()
        )

        total = len(conversaciones)
        triggers = sum(1 for c in conversaciones if c.es_trigger)
        usuario_msgs = total - triggers if total > 0 else 0

        return {
            "usuario_id": usuario_id,
            "periodo_dias": dias,
            "total_conversaciones": total,
            "mensajes_usuario": usuario_msgs,
            "mensajes_automaticos": triggers,
            "ultima_conversacion": conversaciones[-1].timestamp.isoformat() if conversaciones else None
        }

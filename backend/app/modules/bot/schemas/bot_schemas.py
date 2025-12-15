from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List, Dict

class ChatRequest(BaseModel):
    usuario_id: int
    mensaje: str
    sesion_id: Optional[str] = None

class ChatResponse(BaseModel):
    usuario_id: int
    mensaje: str
    respuesta: str
    timestamp: str

class MotivationRequest(BaseModel):
    usuario_id: int
    tipo: str  # racha, peso, inactividad, logro
    contexto: Dict

class MotivationResponse(BaseModel):
    usuario_id: int
    tipo: str
    mensaje: str
    timestamp: str

class TriggerInfo(BaseModel):
    usuario_id: int
    tipo: str
    contexto: Dict

class TriggersResponse(BaseModel):
    total_triggers: int
    triggers: List[TriggerInfo]

class ConversacionHistorial(BaseModel):
    id: int
    usuario_id: int
    mensaje_usuario: str
    respuesta_bot: str
    timestamp: datetime
    es_trigger: bool
    tipo_trigger: Optional[str]

    class Config:
        from_attributes = True

class MemoryStatsResponse(BaseModel):
    usuario_id: int
    total_conversaciones: int
    conversaciones_recientes: List[ConversacionHistorial]

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel

from app.core.database import get_db
from app.modules.bot.models.alerta_osne import AlertaOsne
from app.modules.bot.services.analisis_service import AnalisisService
from app.modules.bot.services.metricas_service import MetricasService
from app.modules.usuarios.models.usuario import Usuario

router = APIRouter(prefix="/alertas", tags=["Alertas Osne"])


# Schemas
class AlertaResponse(BaseModel):
    id: int
    usuario_id: int
    nombre_usuario: str
    tipo_alerta: str
    prioridad: int
    razon: str
    accion_sugerida: str
    puntos_clave: List[str]
    estado: str
    timestamp: datetime
    fecha_atencion: Optional[datetime]
    notas_osne: Optional[str]
    resultado: Optional[str]

    class Config:
        from_attributes = True


class AtenderAlertaRequest(BaseModel):
    alerta_id: int
    notas_osne: str
    resultado: str  # 'reactivado', 'upgrade', 'sigue_inactivo', 'canceló'


class AnalisisManualRequest(BaseModel):
    usuario_id: Optional[int] = None  # Si es None, analiza todos


@router.get("/pendientes", response_model=List[AlertaResponse])
def obtener_alertas_pendientes(
    tipo_alerta: Optional[str] = Query(None, description="Filtrar por tipo: urgente, oportunidad, seguimiento"),
    prioridad_max: Optional[int] = Query(None, description="Prioridad máxima (1 es más urgente)"),
    db: Session = Depends(get_db)
):
    """
    Obtiene todas las alertas pendientes para Osne.
    """
    query = db.query(AlertaOsne).filter(AlertaOsne.estado == 'pendiente')

    if tipo_alerta:
        query = query.filter(AlertaOsne.tipo_alerta == tipo_alerta)

    if prioridad_max:
        query = query.filter(AlertaOsne.prioridad <= prioridad_max)

    alertas = query.order_by(AlertaOsne.prioridad, AlertaOsne.timestamp.desc()).all()

    # Enriquecer con datos del usuario
    resultado = []
    for alerta in alertas:
        usuario = db.query(Usuario).filter(Usuario.id == alerta.usuario_id).first()
        resultado.append(AlertaResponse(
            id=alerta.id,
            usuario_id=alerta.usuario_id,
            nombre_usuario=f"{usuario.nombre} {usuario.apellido}" if usuario else "Desconocido",
            tipo_alerta=alerta.tipo_alerta,
            prioridad=alerta.prioridad,
            razon=alerta.razon,
            accion_sugerida=alerta.accion_sugerida,
            puntos_clave=alerta.puntos_clave.split('|') if alerta.puntos_clave else [],
            estado=alerta.estado,
            timestamp=alerta.timestamp,
            fecha_atencion=alerta.fecha_atencion,
            notas_osne=alerta.notas_osne,
            resultado=alerta.resultado
        ))

    return resultado


@router.get("/usuario/{usuario_id}", response_model=List[AlertaResponse])
def obtener_alertas_usuario(
    usuario_id: int,
    incluir_atendidas: bool = Query(False, description="Incluir alertas ya atendidas"),
    db: Session = Depends(get_db)
):
    """
    Obtiene todas las alertas de un usuario específico.
    """
    query = db.query(AlertaOsne).filter(AlertaOsne.usuario_id == usuario_id)

    if not incluir_atendidas:
        query = query.filter(AlertaOsne.estado == 'pendiente')

    alertas = query.order_by(AlertaOsne.timestamp.desc()).all()

    usuario = db.query(Usuario).filter(Usuario.id == usuario_id).first()
    nombre_usuario = f"{usuario.nombre} {usuario.apellido}" if usuario else "Desconocido"

    resultado = []
    for alerta in alertas:
        resultado.append(AlertaResponse(
            id=alerta.id,
            usuario_id=alerta.usuario_id,
            nombre_usuario=nombre_usuario,
            tipo_alerta=alerta.tipo_alerta,
            prioridad=alerta.prioridad,
            razon=alerta.razon,
            accion_sugerida=alerta.accion_sugerida,
            puntos_clave=alerta.puntos_clave.split('|') if alerta.puntos_clave else [],
            estado=alerta.estado,
            timestamp=alerta.timestamp,
            fecha_atencion=alerta.fecha_atencion,
            notas_osne=alerta.notas_osne,
            resultado=alerta.resultado
        ))

    return resultado


@router.get("/{alerta_id}", response_model=AlertaResponse)
def obtener_detalle_alerta(
    alerta_id: int,
    db: Session = Depends(get_db)
):
    """
    Obtiene el detalle completo de una alerta incluyendo el contexto JSON.
    """
    alerta = db.query(AlertaOsne).filter(AlertaOsne.id == alerta_id).first()

    if not alerta:
        raise HTTPException(status_code=404, detail="Alerta no encontrada")

    usuario = db.query(Usuario).filter(Usuario.id == alerta.usuario_id).first()

    return AlertaResponse(
        id=alerta.id,
        usuario_id=alerta.usuario_id,
        nombre_usuario=f"{usuario.nombre} {usuario.apellido}" if usuario else "Desconocido",
        tipo_alerta=alerta.tipo_alerta,
        prioridad=alerta.prioridad,
        razon=alerta.razon,
        accion_sugerida=alerta.accion_sugerida,
        puntos_clave=alerta.puntos_clave.split('|') if alerta.puntos_clave else [],
        estado=alerta.estado,
        timestamp=alerta.timestamp,
        fecha_atencion=alerta.fecha_atencion,
        notas_osne=alerta.notas_osne,
        resultado=alerta.resultado
    )


@router.post("/atender")
def atender_alerta(
    request: AtenderAlertaRequest,
    db: Session = Depends(get_db)
):
    """
    Marca una alerta como atendida por Osne.
    """
    alerta = db.query(AlertaOsne).filter(AlertaOsne.id == request.alerta_id).first()

    if not alerta:
        raise HTTPException(status_code=404, detail="Alerta no encontrada")

    alerta.estado = 'atendida'
    alerta.fecha_atencion = datetime.utcnow()
    alerta.notas_osne = request.notas_osne
    alerta.resultado = request.resultado

    db.commit()

    # Actualizar métricas del usuario
    MetricasService.registrar_intervencion_osne(db, alerta.usuario_id, alerta.id)

    return {"message": "Alerta atendida exitosamente", "alerta_id": alerta.id}


@router.post("/descartar/{alerta_id}")
def descartar_alerta(
    alerta_id: int,
    db: Session = Depends(get_db)
):
    """
    Marca una alerta como descartada.
    """
    alerta = db.query(AlertaOsne).filter(AlertaOsne.id == alerta_id).first()

    if not alerta:
        raise HTTPException(status_code=404, detail="Alerta no encontrada")

    alerta.estado = 'descartada'
    db.commit()

    return {"message": "Alerta descartada", "alerta_id": alerta.id}


@router.post("/analisis-manual")
def ejecutar_analisis_manual(
    request: AnalisisManualRequest,
    db: Session = Depends(get_db)
):
    """
    Ejecuta un análisis manual para generar alertas.
    Si usuario_id es None, analiza todos los usuarios activos.
    """
    analisis_service = AnalisisService(db)

    if request.usuario_id:
        # Analizar un solo usuario
        usuario = db.query(Usuario).filter(Usuario.id == request.usuario_id).first()
        if not usuario:
            raise HTTPException(status_code=404, detail="Usuario no encontrado")

        analisis = analisis_service.analizar_usuario(usuario)

        if analisis:
            alerta = analisis_service.crear_alerta_osne(analisis)
            return {
                "message": "Análisis completado",
                "alertas_generadas": 1,
                "alerta_id": alerta.id
            }
        else:
            return {
                "message": "El usuario no requiere intervención en este momento",
                "alertas_generadas": 0
            }

    else:
        # Analizar todos los usuarios
        resultado = analisis_service.analizar_todos_usuarios(tipo_analisis="manual")
        return {
            "message": "Análisis completo finalizado",
            **resultado
        }


@router.get("/estadisticas/resumen")
def obtener_estadisticas_alertas(db: Session = Depends(get_db)):
    """
    Obtiene estadísticas generales de alertas.
    """
    total_pendientes = db.query(AlertaOsne).filter(AlertaOsne.estado == 'pendiente').count()
    total_urgentes = db.query(AlertaOsne).filter(
        AlertaOsne.estado == 'pendiente',
        AlertaOsne.tipo_alerta == 'urgente'
    ).count()
    total_oportunidades = db.query(AlertaOsne).filter(
        AlertaOsne.estado == 'pendiente',
        AlertaOsne.tipo_alerta == 'oportunidad'
    ).count()
    total_atendidas_hoy = db.query(AlertaOsne).filter(
        AlertaOsne.estado == 'atendida',
        AlertaOsne.fecha_atencion >= datetime.utcnow().date()
    ).count()

    return {
        "total_pendientes": total_pendientes,
        "urgentes": total_urgentes,
        "oportunidades": total_oportunidades,
        "atendidas_hoy": total_atendidas_hoy
    }

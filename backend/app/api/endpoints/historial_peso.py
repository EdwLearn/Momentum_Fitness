from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from typing import List
from datetime import datetime
from pydantic import BaseModel
from app.core.database import get_db

router = APIRouter()

# Schemas
class HistorialPesoCreate(BaseModel):
    usuario_id: int
    peso: float
    circunferencia_brazos: float | None = None
    circunferencia_pecho: float | None = None
    circunferencia_cintura: float | None = None
    circunferencia_cadera: float | None = None
    circunferencia_piernas: float | None = None
    notas: str | None = None

class HistorialPesoResponse(BaseModel):
    id: int
    usuario_id: int
    peso: float
    fecha_pesaje: datetime
    circunferencia_brazos: float | None
    circunferencia_pecho: float | None
    circunferencia_cintura: float | None
    circunferencia_cadera: float | None
    circunferencia_piernas: float | None
    notas: str | None

    class Config:
        from_attributes = True


@router.post("/historial-peso", response_model=HistorialPesoResponse)
def crear_registro_peso(registro: HistorialPesoCreate, db: Session = Depends(get_db)):
    """Crear un nuevo registro de peso en el historial"""

    # Validar que el usuario existe
    usuario_query = text("SELECT id FROM usuarios WHERE id = :usuario_id")
    usuario = db.execute(usuario_query, {"usuario_id": registro.usuario_id}).fetchone()

    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    # Validar peso
    if registro.peso <= 0 or registro.peso > 300:
        raise HTTPException(status_code=400, detail="El peso debe estar entre 0 y 300 kg")

    # Insertar registro
    insert_query = text("""
        INSERT INTO historial_peso (
            usuario_id, peso, circunferencia_brazos, circunferencia_pecho,
            circunferencia_cintura, circunferencia_cadera, circunferencia_piernas,
            notas, fecha_pesaje
        )
        VALUES (
            :usuario_id, :peso, :circunferencia_brazos, :circunferencia_pecho,
            :circunferencia_cintura, :circunferencia_cadera, :circunferencia_piernas,
            :notas, CURRENT_TIMESTAMP
        )
    """)

    db.execute(insert_query, {
        "usuario_id": registro.usuario_id,
        "peso": registro.peso,
        "circunferencia_brazos": registro.circunferencia_brazos,
        "circunferencia_pecho": registro.circunferencia_pecho,
        "circunferencia_cintura": registro.circunferencia_cintura,
        "circunferencia_cadera": registro.circunferencia_cadera,
        "circunferencia_piernas": registro.circunferencia_piernas,
        "notas": registro.notas
    })
    db.commit()

    # Obtener el registro recién creado
    select_query = text("""
        SELECT id, usuario_id, peso, fecha_pesaje, circunferencia_brazos,
               circunferencia_pecho, circunferencia_cintura, circunferencia_cadera,
               circunferencia_piernas, notas
        FROM historial_peso
        WHERE usuario_id = :usuario_id
        ORDER BY fecha_pesaje DESC
        LIMIT 1
    """)

    result = db.execute(select_query, {"usuario_id": registro.usuario_id}).fetchone()

    if not result:
        raise HTTPException(status_code=500, detail="Error al crear el registro")

    return {
        "id": result[0],
        "usuario_id": result[1],
        "peso": result[2],
        "fecha_pesaje": result[3],
        "circunferencia_brazos": result[4],
        "circunferencia_pecho": result[5],
        "circunferencia_cintura": result[6],
        "circunferencia_cadera": result[7],
        "circunferencia_piernas": result[8],
        "notas": result[9]
    }


@router.get("/historial-peso/{usuario_id}", response_model=List[HistorialPesoResponse])
def obtener_historial_peso(usuario_id: int, db: Session = Depends(get_db)):
    """Obtener el historial de peso de un usuario"""

    query = text("""
        SELECT id, usuario_id, peso, fecha_pesaje, circunferencia_brazos,
               circunferencia_pecho, circunferencia_cintura, circunferencia_cadera,
               circunferencia_piernas, notas
        FROM historial_peso
        WHERE usuario_id = :usuario_id
        ORDER BY fecha_pesaje DESC
    """)

    results = db.execute(query, {"usuario_id": usuario_id}).fetchall()

    return [
        {
            "id": row[0],
            "usuario_id": row[1],
            "peso": row[2],
            "fecha_pesaje": row[3],
            "circunferencia_brazos": row[4],
            "circunferencia_pecho": row[5],
            "circunferencia_cintura": row[6],
            "circunferencia_cadera": row[7],
            "circunferencia_piernas": row[8],
            "notas": row[9]
        }
        for row in results
    ]


@router.delete("/historial-peso/{registro_id}")
def eliminar_registro_peso(registro_id: int, db: Session = Depends(get_db)):
    """Eliminar un registro de peso del historial"""

    # Verificar que existe
    select_query = text("SELECT id FROM historial_peso WHERE id = :id")
    result = db.execute(select_query, {"id": registro_id}).fetchone()

    if not result:
        raise HTTPException(status_code=404, detail="Registro no encontrado")

    # Eliminar
    delete_query = text("DELETE FROM historial_peso WHERE id = :id")
    db.execute(delete_query, {"id": registro_id})
    db.commit()

    return {"message": "Registro eliminado correctamente"}

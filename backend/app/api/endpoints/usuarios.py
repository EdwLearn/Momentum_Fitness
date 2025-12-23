from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.schemas import usuario as schemas
from app.crud import usuarios as crud

router = APIRouter()

@router.post("/", response_model=schemas.Usuario, status_code=status.HTTP_201_CREATED)
def create_usuario(usuario: schemas.UsuarioCreate, db: Session = Depends(get_db)):
    db_usuario = crud.get_usuario_by_email(db, email=usuario.email)
    if db_usuario:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El email ya está registrado"
        )
    return crud.create_usuario(db=db, usuario=usuario)

@router.get("/", response_model=List[schemas.Usuario])
def read_usuarios(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    usuarios = crud.get_usuarios(db, skip=skip, limit=limit)
    return usuarios

@router.get("/{usuario_id}", response_model=schemas.Usuario)
def read_usuario(usuario_id: int, db: Session = Depends(get_db)):
    db_usuario = crud.get_usuario(db, usuario_id=usuario_id)
    if db_usuario is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no encontrado"
        )
    return db_usuario

@router.put("/{usuario_id}", response_model=schemas.Usuario)
def update_usuario(usuario_id: int, usuario: schemas.UsuarioUpdate, db: Session = Depends(get_db)):
    db_usuario = crud.update_usuario(db, usuario_id=usuario_id, usuario=usuario)
    if db_usuario is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no encontrado"
        )
    return db_usuario

@router.delete("/{usuario_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_usuario(usuario_id: int, db: Session = Depends(get_db)):
    success = crud.delete_usuario(db, usuario_id=usuario_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no encontrado"
        )
    return None

@router.get("/buscar-cedula/{cedula}", response_model=schemas.UsuarioBusqueda)
def buscar_usuario_por_cedula(cedula: str, db: Session = Depends(get_db)):
    """
    Busca un usuario por su cédula (campo telefono).
    Retorna información básica del usuario si existe.
    Valida si el usuario puede referir a otros (solo planes largos).
    """
    db_usuario = crud.get_usuario_by_cedula(db, cedula=cedula)
    if db_usuario is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no encontrado con esa cédula"
        )

    # Verificar si puede referir
    puede_ref = crud.puede_referir(db, cedula)
    if not puede_ref:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Este cliente no puede referir. Solo clientes con planes Mensual, 3 Meses, 6 Meses o Elite Anual pueden referir."
        )

    return db_usuario

@router.get("/estadisticas-referidos/{cedula}")
def obtener_estadisticas_referidos(cedula: str, db: Session = Depends(get_db)):
    """
    Obtiene estadísticas de referidos de un usuario.
    - Referidos activos
    - Meses gratis ganados
    - Referidos que faltan para el próximo mes gratis
    """
    estadisticas = crud.get_estadisticas_referidos(db, cedula)
    if "error" in estadisticas:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=estadisticas["error"]
        )
    return estadisticas

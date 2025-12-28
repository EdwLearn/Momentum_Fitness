from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.database import get_db
from app.schemas.ticket_soporte import TicketSoporte, TicketSoporteCreate, TicketSoporteUpdate
from app.crud import tickets_soporte as crud
from app.core.email import send_ticket_notification

router = APIRouter()


@router.post("/", response_model=TicketSoporte, status_code=status.HTTP_201_CREATED)
def create_ticket(
    ticket: TicketSoporteCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """
    Crear un nuevo ticket de soporte y enviar notificación por email
    """
    # Crear el ticket
    db_ticket = crud.create_ticket(db=db, ticket=ticket)

    # Enviar email de notificación en segundo plano
    background_tasks.add_task(
        send_ticket_notification,
        ticket_id=db_ticket.id,
        nombre=db_ticket.nombre,
        categoria=db_ticket.categoria,
        prioridad=db_ticket.prioridad,
        asunto=db_ticket.asunto,
        mensaje=db_ticket.mensaje
    )

    return db_ticket


@router.get("/", response_model=List[TicketSoporte])
def get_tickets(
    skip: int = 0,
    limit: int = 100,
    estado: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    Obtener lista de tickets de soporte
    Filtros opcionales:
    - estado: Filtrar por estado (Abierto, En progreso, Resuelto)
    """
    return crud.get_tickets(db=db, skip=skip, limit=limit, estado=estado)


@router.get("/{ticket_id}", response_model=TicketSoporte)
def get_ticket(
    ticket_id: int,
    db: Session = Depends(get_db)
):
    """
    Obtener un ticket específico por ID
    """
    db_ticket = crud.get_ticket(db=db, ticket_id=ticket_id)
    if not db_ticket:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ticket no encontrado"
        )
    return db_ticket


@router.put("/{ticket_id}", response_model=TicketSoporte)
def update_ticket_estado(
    ticket_id: int,
    ticket_update: TicketSoporteUpdate,
    db: Session = Depends(get_db)
):
    """
    Actualizar el estado de un ticket
    """
    db_ticket = crud.update_ticket_estado(db=db, ticket_id=ticket_id, ticket_update=ticket_update)
    if not db_ticket:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ticket no encontrado"
        )
    return db_ticket


@router.delete("/{ticket_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_ticket(
    ticket_id: int,
    db: Session = Depends(get_db)
):
    """
    Eliminar un ticket
    """
    if not crud.delete_ticket(db=db, ticket_id=ticket_id):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ticket no encontrado"
        )

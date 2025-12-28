from sqlalchemy.orm import Session
from app.models.ticket_soporte import TicketSoporte, EstadoTicket
from app.schemas.ticket_soporte import TicketSoporteCreate, TicketSoporteUpdate
from typing import List, Optional


def create_ticket(db: Session, ticket: TicketSoporteCreate) -> TicketSoporte:
    """Crear un nuevo ticket de soporte"""
    db_ticket = TicketSoporte(
        **ticket.dict(),
        estado=EstadoTicket.ABIERTO.value
    )
    db.add(db_ticket)
    db.commit()
    db.refresh(db_ticket)
    return db_ticket


def get_ticket(db: Session, ticket_id: int) -> Optional[TicketSoporte]:
    """Obtener un ticket por su ID"""
    return db.query(TicketSoporte).filter(TicketSoporte.id == ticket_id).first()


def get_tickets(
    db: Session,
    skip: int = 0,
    limit: int = 100,
    estado: Optional[str] = None
) -> List[TicketSoporte]:
    """Obtener lista de tickets con filtros opcionales"""
    query = db.query(TicketSoporte)

    if estado:
        query = query.filter(TicketSoporte.estado == estado)

    return query.order_by(TicketSoporte.created_at.desc()).offset(skip).limit(limit).all()


def update_ticket_estado(db: Session, ticket_id: int, ticket_update: TicketSoporteUpdate) -> Optional[TicketSoporte]:
    """Actualizar el estado de un ticket"""
    db_ticket = get_ticket(db, ticket_id)

    if not db_ticket:
        return None

    if ticket_update.estado:
        db_ticket.estado = ticket_update.estado

    db.commit()
    db.refresh(db_ticket)
    return db_ticket


def delete_ticket(db: Session, ticket_id: int) -> bool:
    """Eliminar un ticket"""
    db_ticket = get_ticket(db, ticket_id)

    if not db_ticket:
        return False

    db.delete(db_ticket)
    db.commit()
    return True

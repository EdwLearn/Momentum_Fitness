"""
Configuración de fixtures para pytest.
Crea una base de datos de prueba en memoria para cada sesión de tests.
"""
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.core.database import Base, get_db
from main import app


# Base de datos SQLite en memoria para tests
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)

TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(scope="function")
def db_session():
    """
    Crea una nueva sesión de base de datos para cada test.
    Las tablas se crean antes del test y se eliminan después.
    """
    Base.metadata.create_all(bind=engine)
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def client(db_session):
    """
    Cliente de prueba que usa la base de datos de test.
    """
    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db

    with TestClient(app) as test_client:
        yield test_client

    app.dependency_overrides.clear()


@pytest.fixture
def usuario_data():
    """Datos de ejemplo para crear un usuario."""
    return {
        "nombre": "Juan",
        "apellido": "Pérez",
        "cedula": "1234567890",
        "email": "juan.perez@test.com",
        "telefono": "3001234567",
        "tipo": "CLIENTE"
    }


@pytest.fixture
def empleado_data():
    """Datos de ejemplo para crear un empleado."""
    return {
        "nombre": "Carlos",
        "apellido": "García",
        "cedula": "0987654321",
        "email": "carlos.garcia@test.com",
        "telefono": "3009876543",
        "tipo_empleado": "entrenador",
        "horario": "8:00 AM - 5:00 PM",
        "dias_laborales": "Lunes-Viernes"
    }


@pytest.fixture
def empleado_recepcion_data():
    """Datos de ejemplo para crear un empleado de recepción."""
    return {
        "nombre": "María",
        "apellido": "López",
        "cedula": "1122334455",
        "email": "maria.lopez@test.com",
        "telefono": "3001112233",
        "tipo_empleado": "recepcion",
        "horario": "6:00 AM - 2:00 PM",
        "dias_laborales": "Lunes-Sábado"
    }

"""
Tests para el endpoint de empleados.
"""
import pytest
from fastapi import status


class TestCrearEmpleado:
    """Tests para POST /api/empleados/"""

    def test_crear_empleado_entrenador(self, client, empleado_data):
        """Debe crear un empleado entrenador correctamente."""
        response = client.post("/api/empleados/", json=empleado_data)

        assert response.status_code == status.HTTP_201_CREATED
        data = response.json()
        assert data["nombre"] == empleado_data["nombre"]
        assert data["apellido"] == empleado_data["apellido"]
        assert data["cedula"] == empleado_data["cedula"]
        assert data["tipo_empleado"] == "entrenador"
        assert data["activo"] == -1  # Estado inicial: sin entrada
        assert "id" in data

    def test_crear_empleado_recepcion(self, client, empleado_recepcion_data):
        """Debe crear un empleado de recepción correctamente."""
        response = client.post("/api/empleados/", json=empleado_recepcion_data)

        assert response.status_code == status.HTTP_201_CREATED
        data = response.json()
        assert data["tipo_empleado"] == "recepcion"

    def test_crear_empleado_cedula_duplicada(self, client, empleado_data):
        """No debe permitir crear empleados con cédula duplicada."""
        # Crear primer empleado
        client.post("/api/empleados/", json=empleado_data)

        # Intentar crear con misma cédula
        response = client.post("/api/empleados/", json=empleado_data)

        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "cédula" in response.json()["detail"].lower()

    def test_crear_empleado_sin_cedula(self, client):
        """Debe fallar si no se proporciona cédula."""
        empleado_sin_cedula = {
            "nombre": "Test",
            "apellido": "Empleado",
            "email": "test@test.com"
        }

        response = client.post("/api/empleados/", json=empleado_sin_cedula)

        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY


class TestListarEmpleados:
    """Tests para GET /api/empleados/"""

    def test_listar_empleados_vacio(self, client):
        """Debe retornar lista vacía si no hay empleados."""
        response = client.get("/api/empleados/")

        assert response.status_code == status.HTTP_200_OK
        assert response.json() == []

    def test_listar_empleados_con_datos(self, client, empleado_data):
        """Debe retornar lista con empleados creados."""
        # Crear empleado
        client.post("/api/empleados/", json=empleado_data)

        response = client.get("/api/empleados/")

        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert len(data) == 1
        assert data[0]["cedula"] == empleado_data["cedula"]

    def test_listar_empleados_filtrar_por_tipo(self, client, empleado_data, empleado_recepcion_data):
        """Debe filtrar empleados por tipo."""
        # Crear empleados de diferentes tipos
        client.post("/api/empleados/", json=empleado_data)
        client.post("/api/empleados/", json=empleado_recepcion_data)

        # Filtrar solo entrenadores
        response = client.get("/api/empleados/?tipo_empleado=entrenador")

        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert len(data) == 1
        assert data[0]["tipo_empleado"] == "entrenador"


class TestBuscarEmpleadoPorCedula:
    """Tests para GET /api/empleados/cedula/{cedula}"""

    def test_buscar_empleado_por_cedula(self, client, empleado_data):
        """Debe encontrar un empleado por cédula."""
        # Crear empleado
        client.post("/api/empleados/", json=empleado_data)

        response = client.get(f"/api/empleados/cedula/{empleado_data['cedula']}")

        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["cedula"] == empleado_data["cedula"]
        assert data["nombre"] == empleado_data["nombre"]

    def test_buscar_empleado_cedula_no_existente(self, client):
        """Debe retornar 404 si la cédula no existe."""
        response = client.get("/api/empleados/cedula/9999999999")

        assert response.status_code == status.HTTP_404_NOT_FOUND
        assert "no encontrado" in response.json()["detail"].lower()


class TestObtenerEmpleado:
    """Tests para GET /api/empleados/{id}"""

    def test_obtener_empleado_existente(self, client, empleado_data):
        """Debe retornar el empleado si existe."""
        # Crear empleado
        create_response = client.post("/api/empleados/", json=empleado_data)
        empleado_id = create_response.json()["id"]

        response = client.get(f"/api/empleados/{empleado_id}")

        assert response.status_code == status.HTTP_200_OK
        assert response.json()["id"] == empleado_id

    def test_obtener_empleado_no_existente(self, client):
        """Debe retornar 404 si el empleado no existe."""
        response = client.get("/api/empleados/99999")

        assert response.status_code == status.HTTP_404_NOT_FOUND


class TestActualizarEmpleado:
    """Tests para PUT /api/empleados/{id}"""

    def test_actualizar_empleado(self, client, empleado_data):
        """Debe actualizar los datos del empleado."""
        # Crear empleado
        create_response = client.post("/api/empleados/", json=empleado_data)
        empleado_id = create_response.json()["id"]

        # Actualizar
        update_data = {"nombre": "Carlos Alberto", "salario": 2500000.0}
        response = client.put(f"/api/empleados/{empleado_id}", json=update_data)

        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["nombre"] == "Carlos Alberto"
        assert data["salario"] == 2500000.0

    def test_actualizar_empleado_no_existente(self, client):
        """Debe retornar 404 si el empleado no existe."""
        response = client.put("/api/empleados/99999", json={"nombre": "Test"})

        assert response.status_code == status.HTTP_404_NOT_FOUND


class TestEliminarEmpleado:
    """Tests para DELETE /api/empleados/{id}"""

    def test_eliminar_empleado(self, client, empleado_data):
        """Debe eliminar el empleado correctamente."""
        # Crear empleado
        create_response = client.post("/api/empleados/", json=empleado_data)
        empleado_id = create_response.json()["id"]

        # Eliminar
        response = client.delete(f"/api/empleados/{empleado_id}")

        assert response.status_code == status.HTTP_204_NO_CONTENT

        # Verificar que ya no existe
        get_response = client.get(f"/api/empleados/{empleado_id}")
        assert get_response.status_code == status.HTTP_404_NOT_FOUND

    def test_eliminar_empleado_no_existente(self, client):
        """Debe retornar 404 si el empleado no existe."""
        response = client.delete("/api/empleados/99999")

        assert response.status_code == status.HTTP_404_NOT_FOUND


class TestEmpleadosActivos:
    """Tests para GET /api/empleados/activos/list"""

    def test_listar_empleados_activos_vacio(self, client, empleado_data):
        """Inicialmente no hay empleados activos (estado -1)."""
        # Crear empleado
        client.post("/api/empleados/", json=empleado_data)

        response = client.get("/api/empleados/activos/list")

        assert response.status_code == status.HTTP_200_OK
        # El empleado empieza con activo = -1 (sin entrada)
        assert response.json() == []

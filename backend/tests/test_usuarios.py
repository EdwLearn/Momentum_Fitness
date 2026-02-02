"""
Tests para el endpoint de usuarios.
"""
import pytest
from fastapi import status


class TestCrearUsuario:
    """Tests para POST /api/usuarios/"""

    def test_crear_usuario_cliente(self, client, usuario_data):
        """Debe crear un usuario cliente correctamente."""
        response = client.post("/api/usuarios/", json=usuario_data)

        assert response.status_code == status.HTTP_201_CREATED
        data = response.json()
        assert data["nombre"] == usuario_data["nombre"]
        assert data["apellido"] == usuario_data["apellido"]
        assert data["email"] == usuario_data["email"]
        assert data["tipo"] == "CLIENTE"
        assert "id" in data

    def test_crear_usuario_email_duplicado(self, client, usuario_data):
        """No debe permitir crear usuarios con email duplicado."""
        # Crear primer usuario
        client.post("/api/usuarios/", json=usuario_data)

        # Intentar crear con mismo email
        response = client.post("/api/usuarios/", json=usuario_data)

        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "email ya está registrado" in response.json()["detail"]

    def test_crear_usuario_sin_email(self, client):
        """Debe fallar si no se proporciona email."""
        usuario_sin_email = {
            "nombre": "Test",
            "apellido": "Usuario",
            "telefono": "123456"
        }

        response = client.post("/api/usuarios/", json=usuario_sin_email)

        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY


class TestListarUsuarios:
    """Tests para GET /api/usuarios/"""

    def test_listar_usuarios_vacio(self, client):
        """Debe retornar lista vacía si no hay usuarios."""
        response = client.get("/api/usuarios/")

        assert response.status_code == status.HTTP_200_OK
        assert response.json() == []

    def test_listar_usuarios_con_datos(self, client, usuario_data):
        """Debe retornar lista con usuarios creados."""
        # Crear usuario
        client.post("/api/usuarios/", json=usuario_data)

        response = client.get("/api/usuarios/")

        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert len(data) == 1
        assert data[0]["email"] == usuario_data["email"]

    def test_listar_usuarios_con_paginacion(self, client):
        """Debe respetar parámetros de paginación."""
        # Crear 3 usuarios
        for i in range(3):
            client.post("/api/usuarios/", json={
                "nombre": f"Usuario{i}",
                "apellido": "Test",
                "cedula": f"100000000{i}",
                "email": f"usuario{i}@test.com",
                "telefono": f"30012345{i}",
                "tipo": "CLIENTE"
            })

        # Obtener solo 2 usuarios
        response = client.get("/api/usuarios/?limit=2")

        assert response.status_code == status.HTTP_200_OK
        assert len(response.json()) == 2


class TestObtenerUsuario:
    """Tests para GET /api/usuarios/{id}"""

    def test_obtener_usuario_existente(self, client, usuario_data):
        """Debe retornar el usuario si existe."""
        # Crear usuario
        create_response = client.post("/api/usuarios/", json=usuario_data)
        usuario_id = create_response.json()["id"]

        response = client.get(f"/api/usuarios/{usuario_id}")

        assert response.status_code == status.HTTP_200_OK
        assert response.json()["id"] == usuario_id

    def test_obtener_usuario_no_existente(self, client):
        """Debe retornar 404 si el usuario no existe."""
        response = client.get("/api/usuarios/99999")

        assert response.status_code == status.HTTP_404_NOT_FOUND
        assert "Usuario no encontrado" in response.json()["detail"]


class TestActualizarUsuario:
    """Tests para PUT /api/usuarios/{id}"""

    def test_actualizar_usuario(self, client, usuario_data):
        """Debe actualizar los datos del usuario."""
        # Crear usuario
        create_response = client.post("/api/usuarios/", json=usuario_data)
        usuario_id = create_response.json()["id"]

        # Actualizar
        update_data = {"nombre": "Juan Carlos", "apellido": "Pérez García"}
        response = client.put(f"/api/usuarios/{usuario_id}", json=update_data)

        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["nombre"] == "Juan Carlos"
        assert data["apellido"] == "Pérez García"

    def test_actualizar_usuario_no_existente(self, client):
        """Debe retornar 404 si el usuario no existe."""
        response = client.put("/api/usuarios/99999", json={"nombre": "Test"})

        assert response.status_code == status.HTTP_404_NOT_FOUND


class TestEliminarUsuario:
    """Tests para DELETE /api/usuarios/{id}"""

    def test_eliminar_usuario(self, client, usuario_data):
        """Debe eliminar el usuario correctamente."""
        # Crear usuario
        create_response = client.post("/api/usuarios/", json=usuario_data)
        usuario_id = create_response.json()["id"]

        # Eliminar
        response = client.delete(f"/api/usuarios/{usuario_id}")

        assert response.status_code == status.HTTP_204_NO_CONTENT

        # Verificar que ya no existe
        get_response = client.get(f"/api/usuarios/{usuario_id}")
        assert get_response.status_code == status.HTTP_404_NOT_FOUND

    def test_eliminar_usuario_no_existente(self, client):
        """Debe retornar 404 si el usuario no existe."""
        response = client.delete("/api/usuarios/99999")

        assert response.status_code == status.HTTP_404_NOT_FOUND

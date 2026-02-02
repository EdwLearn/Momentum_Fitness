"""
Tests para el endpoint de asistencia de empleados.
Pruebas para marcar entrada/salida y consultar asistencias.
"""
import pytest
from fastapi import status
from datetime import date, time


class TestMarcarEntrada:
    """Tests para POST /api/asistencia-empleados/entrada"""

    def test_marcar_entrada_exitosa(self, client, empleado_data):
        """Debe marcar entrada correctamente."""
        # Crear empleado
        create_response = client.post("/api/empleados/", json=empleado_data)
        empleado_id = create_response.json()["id"]

        # Marcar entrada
        response = client.post("/api/asistencia-empleados/entrada", json={
            "empleado_id": empleado_id
        })

        assert response.status_code == status.HTTP_201_CREATED
        data = response.json()
        assert data["empleado_id"] == empleado_id
        assert data["hora_entrada"] is not None
        assert data["hora_salida"] is None
        assert data["fecha"] == str(date.today())

    def test_marcar_entrada_con_hora_especifica(self, client, empleado_data):
        """Debe marcar entrada con hora específica."""
        # Crear empleado
        create_response = client.post("/api/empleados/", json=empleado_data)
        empleado_id = create_response.json()["id"]

        # Marcar entrada con hora específica
        response = client.post("/api/asistencia-empleados/entrada", json={
            "empleado_id": empleado_id,
            "hora_entrada": "08:30:00"
        })

        assert response.status_code == status.HTTP_201_CREATED
        data = response.json()
        assert "08:30" in data["hora_entrada"]

    def test_marcar_entrada_empleado_no_existente(self, client):
        """Debe fallar si el empleado no existe."""
        response = client.post("/api/asistencia-empleados/entrada", json={
            "empleado_id": 99999
        })

        assert response.status_code == status.HTTP_404_NOT_FOUND
        assert "no encontrado" in response.json()["detail"].lower()

    def test_marcar_entrada_duplicada(self, client, empleado_data):
        """No debe permitir marcar entrada dos veces el mismo día."""
        # Crear empleado
        create_response = client.post("/api/empleados/", json=empleado_data)
        empleado_id = create_response.json()["id"]

        # Marcar primera entrada
        client.post("/api/asistencia-empleados/entrada", json={
            "empleado_id": empleado_id
        })

        # Intentar marcar segunda entrada
        response = client.post("/api/asistencia-empleados/entrada", json={
            "empleado_id": empleado_id
        })

        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "ya existe" in response.json()["detail"].lower()

    def test_marcar_entrada_actualiza_estado_empleado(self, client, empleado_data):
        """Debe actualizar el estado del empleado a activo (1)."""
        # Crear empleado
        create_response = client.post("/api/empleados/", json=empleado_data)
        empleado_id = create_response.json()["id"]

        # Verificar estado inicial
        empleado = client.get(f"/api/empleados/{empleado_id}").json()
        assert empleado["activo"] == -1

        # Marcar entrada
        client.post("/api/asistencia-empleados/entrada", json={
            "empleado_id": empleado_id
        })

        # Verificar estado actualizado
        empleado = client.get(f"/api/empleados/{empleado_id}").json()
        assert empleado["activo"] == 1


class TestMarcarSalida:
    """Tests para POST /api/asistencia-empleados/salida"""

    def test_marcar_salida_exitosa(self, client, empleado_data):
        """Debe marcar salida correctamente."""
        # Crear empleado
        create_response = client.post("/api/empleados/", json=empleado_data)
        empleado_id = create_response.json()["id"]

        # Marcar entrada primero
        client.post("/api/asistencia-empleados/entrada", json={
            "empleado_id": empleado_id,
            "hora_entrada": "08:00:00"
        })

        # Marcar salida
        response = client.post("/api/asistencia-empleados/salida", json={
            "empleado_id": empleado_id,
            "hora_salida": "17:00:00"
        })

        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["hora_salida"] is not None
        assert data["horas_trabajadas"] is not None
        # 9 horas de trabajo (8:00 a 17:00)
        assert data["horas_trabajadas"] == 9.0

    def test_marcar_salida_sin_entrada(self, client, empleado_data):
        """Debe fallar si no hay entrada registrada."""
        # Crear empleado
        create_response = client.post("/api/empleados/", json=empleado_data)
        empleado_id = create_response.json()["id"]

        # Intentar marcar salida sin entrada
        response = client.post("/api/asistencia-empleados/salida", json={
            "empleado_id": empleado_id
        })

        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_marcar_salida_duplicada(self, client, empleado_data):
        """No debe permitir marcar salida dos veces."""
        # Crear empleado
        create_response = client.post("/api/empleados/", json=empleado_data)
        empleado_id = create_response.json()["id"]

        # Marcar entrada
        client.post("/api/asistencia-empleados/entrada", json={
            "empleado_id": empleado_id
        })

        # Marcar primera salida
        client.post("/api/asistencia-empleados/salida", json={
            "empleado_id": empleado_id
        })

        # Intentar marcar segunda salida
        response = client.post("/api/asistencia-empleados/salida", json={
            "empleado_id": empleado_id
        })

        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_marcar_salida_actualiza_estado_empleado(self, client, empleado_data):
        """Debe actualizar el estado del empleado a inactivo (0)."""
        # Crear empleado
        create_response = client.post("/api/empleados/", json=empleado_data)
        empleado_id = create_response.json()["id"]

        # Marcar entrada
        client.post("/api/asistencia-empleados/entrada", json={
            "empleado_id": empleado_id
        })

        # Verificar estado activo
        empleado = client.get(f"/api/empleados/{empleado_id}").json()
        assert empleado["activo"] == 1

        # Marcar salida
        client.post("/api/asistencia-empleados/salida", json={
            "empleado_id": empleado_id
        })

        # Verificar estado inactivo
        empleado = client.get(f"/api/empleados/{empleado_id}").json()
        assert empleado["activo"] == 0


class TestEstadoEmpleadoHoy:
    """Tests para GET /api/asistencia-empleados/empleado/{empleado_id}/estado-hoy"""

    def test_estado_sin_marcar(self, client, empleado_data):
        """Debe retornar estado 'sin_marcar' si no hay asistencia."""
        # Crear empleado
        create_response = client.post("/api/empleados/", json=empleado_data)
        empleado_id = create_response.json()["id"]

        response = client.get(f"/api/asistencia-empleados/empleado/{empleado_id}/estado-hoy")

        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["estado"] == "sin_marcar"
        assert data["hora_entrada"] is None
        assert data["hora_salida"] is None

    def test_estado_entrada_marcada(self, client, empleado_data):
        """Debe retornar estado 'entrada_marcada' después de marcar entrada."""
        # Crear empleado
        create_response = client.post("/api/empleados/", json=empleado_data)
        empleado_id = create_response.json()["id"]

        # Marcar entrada
        client.post("/api/asistencia-empleados/entrada", json={
            "empleado_id": empleado_id
        })

        response = client.get(f"/api/asistencia-empleados/empleado/{empleado_id}/estado-hoy")

        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["estado"] == "entrada_marcada"
        assert data["hora_entrada"] is not None
        assert data["hora_salida"] is None

    def test_estado_salida_marcada(self, client, empleado_data):
        """Debe retornar estado 'salida_marcada' después de marcar salida."""
        # Crear empleado
        create_response = client.post("/api/empleados/", json=empleado_data)
        empleado_id = create_response.json()["id"]

        # Marcar entrada y salida
        client.post("/api/asistencia-empleados/entrada", json={
            "empleado_id": empleado_id
        })
        client.post("/api/asistencia-empleados/salida", json={
            "empleado_id": empleado_id
        })

        response = client.get(f"/api/asistencia-empleados/empleado/{empleado_id}/estado-hoy")

        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["estado"] == "salida_marcada"
        assert data["hora_entrada"] is not None
        assert data["hora_salida"] is not None


class TestEmpleadosTrabajandoHoy:
    """Tests para GET /api/asistencia-empleados/trabajando-hoy/list"""

    def test_nadie_trabajando(self, client, empleado_data):
        """Debe retornar lista vacía si nadie está trabajando."""
        # Crear empleado sin marcar entrada
        client.post("/api/empleados/", json=empleado_data)

        response = client.get("/api/asistencia-empleados/trabajando-hoy/list")

        assert response.status_code == status.HTTP_200_OK
        assert response.json() == []

    def test_empleados_trabajando(self, client, empleado_data, empleado_recepcion_data):
        """Debe retornar empleados con entrada marcada."""
        # Crear empleados
        emp1 = client.post("/api/empleados/", json=empleado_data).json()
        emp2 = client.post("/api/empleados/", json=empleado_recepcion_data).json()

        # Solo el primero marca entrada
        client.post("/api/asistencia-empleados/entrada", json={
            "empleado_id": emp1["id"]
        })

        response = client.get("/api/asistencia-empleados/trabajando-hoy/list")

        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert len(data) == 1
        assert data[0]["empleado_id"] == emp1["id"]
        assert data[0]["esta_trabajando"] is True

    def test_empleado_termino_jornada(self, client, empleado_data):
        """Empleado que marcó salida no está trabajando activamente."""
        # Crear empleado
        create_response = client.post("/api/empleados/", json=empleado_data)
        empleado_id = create_response.json()["id"]

        # Marcar entrada y salida
        client.post("/api/asistencia-empleados/entrada", json={
            "empleado_id": empleado_id
        })
        client.post("/api/asistencia-empleados/salida", json={
            "empleado_id": empleado_id
        })

        response = client.get("/api/asistencia-empleados/trabajando-hoy/list")

        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        # Aparece en la lista pero esta_trabajando es False
        assert len(data) == 1
        assert data[0]["esta_trabajando"] is False


class TestAsistenciasPorFecha:
    """Tests para GET /api/asistencia-empleados/fecha/{fecha}"""

    def test_asistencias_fecha_sin_datos(self, client):
        """Debe retornar lista vacía si no hay asistencias."""
        fecha_hoy = str(date.today())
        response = client.get(f"/api/asistencia-empleados/fecha/{fecha_hoy}")

        assert response.status_code == status.HTTP_200_OK
        assert response.json() == []

    def test_asistencias_fecha_con_datos(self, client, empleado_data):
        """Debe retornar asistencias de la fecha."""
        # Crear empleado y marcar entrada
        create_response = client.post("/api/empleados/", json=empleado_data)
        empleado_id = create_response.json()["id"]

        client.post("/api/asistencia-empleados/entrada", json={
            "empleado_id": empleado_id
        })

        fecha_hoy = str(date.today())
        response = client.get(f"/api/asistencia-empleados/fecha/{fecha_hoy}")

        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert len(data) == 1
        assert data[0]["empleado_id"] == empleado_id


class TestHorasSemanales:
    """Tests para GET /api/asistencia-empleados/empleado/{empleado_id}/horas-semanales"""

    def test_horas_semanales_sin_asistencias(self, client, empleado_data):
        """Debe retornar 0 horas si no hay asistencias completadas."""
        # Crear empleado
        create_response = client.post("/api/empleados/", json=empleado_data)
        empleado_id = create_response.json()["id"]

        response = client.get(f"/api/asistencia-empleados/empleado/{empleado_id}/horas-semanales")

        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["empleado_id"] == empleado_id
        assert data["horas_semanales"] == 0

    def test_horas_semanales_con_jornada_completa(self, client, empleado_data):
        """Debe calcular horas trabajadas correctamente."""
        # Crear empleado
        create_response = client.post("/api/empleados/", json=empleado_data)
        empleado_id = create_response.json()["id"]

        # Marcar entrada y salida
        client.post("/api/asistencia-empleados/entrada", json={
            "empleado_id": empleado_id,
            "hora_entrada": "08:00:00"
        })
        client.post("/api/asistencia-empleados/salida", json={
            "empleado_id": empleado_id,
            "hora_salida": "16:00:00"
        })

        response = client.get(f"/api/asistencia-empleados/empleado/{empleado_id}/horas-semanales")

        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["horas_semanales"] == 8.0  # 8 horas trabajadas


class TestFlujoCompletoAsistencia:
    """Tests de integración para el flujo completo de asistencia."""

    def test_flujo_completo_jornada_laboral(self, client, empleado_data):
        """Test del flujo completo: crear empleado, marcar entrada, marcar salida."""
        # 1. Crear empleado
        create_response = client.post("/api/empleados/", json=empleado_data)
        assert create_response.status_code == status.HTTP_201_CREATED
        empleado_id = create_response.json()["id"]

        # 2. Verificar estado inicial
        empleado = client.get(f"/api/empleados/{empleado_id}").json()
        assert empleado["activo"] == -1  # Sin entrada

        # 3. Buscar por cédula (la funcionalidad que estaba fallando)
        cedula_response = client.get(f"/api/empleados/cedula/{empleado_data['cedula']}")
        assert cedula_response.status_code == status.HTTP_200_OK
        assert cedula_response.json()["id"] == empleado_id

        # 4. Marcar entrada
        entrada_response = client.post("/api/asistencia-empleados/entrada", json={
            "empleado_id": empleado_id,
            "hora_entrada": "08:00:00"
        })
        assert entrada_response.status_code == status.HTTP_201_CREATED

        # 5. Verificar estado activo
        empleado = client.get(f"/api/empleados/{empleado_id}").json()
        assert empleado["activo"] == 1

        # 6. Verificar que aparece en trabajando hoy
        trabajando = client.get("/api/asistencia-empleados/trabajando-hoy/list").json()
        assert len(trabajando) == 1
        assert trabajando[0]["esta_trabajando"] is True

        # 7. Marcar salida
        salida_response = client.post("/api/asistencia-empleados/salida", json={
            "empleado_id": empleado_id,
            "hora_salida": "17:00:00"
        })
        assert salida_response.status_code == status.HTTP_200_OK
        assert salida_response.json()["horas_trabajadas"] == 9.0

        # 8. Verificar estado inactivo
        empleado = client.get(f"/api/empleados/{empleado_id}").json()
        assert empleado["activo"] == 0

        # 9. Verificar horas semanales
        horas = client.get(f"/api/asistencia-empleados/empleado/{empleado_id}/horas-semanales").json()
        assert horas["horas_semanales"] == 9.0

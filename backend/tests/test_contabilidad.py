import pytest
from fastapi import status


class TestContabilidadEndpoints:

    def test_listar_movimientos_vacio(self, client):
        response = client.get("/api/contabilidad/")
        assert response.status_code == status.HTTP_200_OK
        assert response.json() == []

    def test_crear_ingreso(self, client):
        data = {
            "tipo": "ingreso",
            "descripcion": "Mensualidad enero",
            "monto": 150000,
            "categoria": "Membresías",
            "fecha": "2026-05-25",
        }
        response = client.post("/api/contabilidad/", json=data)
        assert response.status_code == status.HTTP_201_CREATED
        body = response.json()
        assert body["tipo"] == "ingreso"
        assert body["monto"] == 150000
        assert body["categoria"] == "Membresías"
        assert "id" in body

    def test_crear_egreso(self, client):
        data = {
            "tipo": "egreso",
            "descripcion": "Pago arriendo",
            "monto": 2000000,
            "categoria": "Arriendo",
            "fecha": "2026-05-25",
        }
        response = client.post("/api/contabilidad/", json=data)
        assert response.status_code == status.HTTP_201_CREATED
        assert response.json()["tipo"] == "egreso"

    def test_monto_invalido(self, client):
        data = {
            "tipo": "ingreso",
            "descripcion": "Test",
            "monto": 0,
            "categoria": "Otro",
            "fecha": "2026-05-25",
        }
        response = client.post("/api/contabilidad/", json=data)
        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY

    def test_resumen_calcula_correctamente(self, client):
        client.post("/api/contabilidad/", json={
            "tipo": "ingreso", "descripcion": "A", "monto": 500000,
            "categoria": "Membresías", "fecha": "2026-05-25"
        })
        client.post("/api/contabilidad/", json={
            "tipo": "egreso", "descripcion": "B", "monto": 200000,
            "categoria": "Nómina", "fecha": "2026-05-25"
        })
        response = client.get("/api/contabilidad/resumen")
        assert response.status_code == status.HTTP_200_OK
        body = response.json()
        assert body["total_ingresos"] == 500000
        assert body["total_egresos"] == 200000
        assert body["balance_neto"] == 300000

    def test_eliminar_movimiento(self, client):
        create = client.post("/api/contabilidad/", json={
            "tipo": "ingreso", "descripcion": "Borrar", "monto": 10000,
            "categoria": "Otro", "fecha": "2026-05-25"
        })
        mov_id = create.json()["id"]
        delete = client.delete(f"/api/contabilidad/{mov_id}")
        assert delete.status_code == status.HTTP_204_NO_CONTENT
        lista = client.get("/api/contabilidad/")
        assert all(m["id"] != mov_id for m in lista.json())

    def test_eliminar_no_existente(self, client):
        response = client.delete("/api/contabilidad/99999")
        assert response.status_code == status.HTTP_404_NOT_FOUND

    def test_filtro_por_tipo(self, client):
        client.post("/api/contabilidad/", json={
            "tipo": "ingreso", "descripcion": "I1", "monto": 100000,
            "categoria": "Servicios", "fecha": "2026-05-25"
        })
        client.post("/api/contabilidad/", json={
            "tipo": "egreso", "descripcion": "E1", "monto": 50000,
            "categoria": "Marketing", "fecha": "2026-05-25"
        })
        response = client.get("/api/contabilidad/?tipo=ingreso")
        assert all(m["tipo"] == "ingreso" for m in response.json())

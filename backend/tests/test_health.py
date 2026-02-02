"""
Tests para endpoints del sistema (health, root, stats).
"""
import pytest
from fastapi import status


class TestHealthEndpoints:
    """Tests para endpoints de salud del sistema."""

    def test_root_endpoint(self, client):
        """El endpoint raíz debe retornar información del sistema."""
        response = client.get("/")

        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert "sistema" in data
        assert "version" in data
        assert "estado" in data
        assert data["estado"] == "activo"

    def test_health_endpoint(self, client):
        """El endpoint /health debe retornar estado healthy."""
        response = client.get("/health")

        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["status"] == "healthy"
        assert "version" in data

    def test_stats_endpoint(self, client):
        """El endpoint /stats debe retornar estadísticas."""
        response = client.get("/stats")

        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert "estadisticas" in data
        assert "total_usuarios" in data["estadisticas"]
        assert "total_asistencias" in data["estadisticas"]

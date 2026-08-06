"""
ProjectSense AI - Basic Backend Tests
"""
import pytest
from httpx import AsyncClient, ASGITransport
from main import app


@pytest.mark.asyncio
async def test_health_check():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["app"] == "ProjectSense AI"


@pytest.mark.asyncio
async def test_register_and_login():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        # Register
        reg = await client.post("/api/auth/register", json={
            "full_name": "Test Student",
            "email": "test@example.com",
            "password": "testpassword123",
            "role": "student",
        })
        assert reg.status_code == 201
        token = reg.json()["access_token"]
        assert token

        # Me endpoint
        me = await client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
        assert me.status_code == 200
        assert me.json()["email"] == "test@example.com"
        assert me.json()["role"] == "student"

from fastapi.testclient import TestClient
from backend.api.main import app
import pytest

client = TestClient(app)

def test_read_main():
    response = client.get("/")
    assert response.status_code == 200
    assert "Welcome to" in response.json()["message"]

def test_predict_no_file():
    response = client.post("/api/v1/predict")
    assert response.status_code == 422  # Unprocessable entity (missing file)

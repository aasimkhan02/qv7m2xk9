from fastapi.testclient import TestClient

from main import app

client = TestClient(app)


def test_root():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json()["status"] == "running"


def test_health():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_metrics():
    response = client.get("/metrics")
    assert response.status_code == 200
    data = response.json()
    assert "mae_mw" in data
    assert "rmse_mw" in data
    assert "wape_percent" in data


def test_comparisons():
    response = client.get("/comparisons?limit=5")
    assert response.status_code == 200
    data = response.json()
    assert data["limit"] == 5
    assert len(data["items"]) <= 5


def test_daily_summary():
    response = client.get("/daily-summary")
    assert response.status_code == 200
    assert "items" in response.json()

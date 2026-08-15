from fastapi.testclient import TestClient
from app import app
import pytest

client = TestClient(app)

def test_create_item):
    response = client.post(
        "/items/",
        json={"name": "Foo", "price": 42.0},
    )
    assert response.status_code == 200
    assert response.json()["name"] == "Foo"
    assert response.json()["price"] == 42.0
from sqlalchemy.orm import Session
from main import SessionLocal, Currency
import pytest
from fastapi.testclient import TestClient
from main import app
client = TestClient(app)


def test_get_all_currencies():
    response = client.get("/currenciess/db")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    if data:
        currency = data[0]
        assert "id" in currency
        assert "currency" in currency
        assert "code" in currency
        assert "rate" in currency
        assert "effective_date" in currency


def test_db_connection():
    db: Session = SessionLocal()
    try:
        currencies = db.query(Currency).limit(1).all()
        assert isinstance(currencies, list)
    finally:
        db.close()

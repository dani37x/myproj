from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, ConfigDict
from datetime import date
from fastapi import Query, HTTPException
from typing import Optional
from typing import List, Optional
from fastapi import Depends, Query, HTTPException
from fastapi import FastAPI, HTTPException
from sqlalchemy import create_engine, Column, Integer, String, Float, Date
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
import requests
from datetime import datetime
from fastapi import Depends
from sqlalchemy.orm import Session
from typing import List
from pydantic import BaseModel

# # Database setup
# DATABASE_URL = "postgresql://postgres:yourpassword@localhost:5432/nbp_exchange"

import os

DB_HOST = os.getenv("POSTGRES_HOST", "localhost")
DB_USER = os.getenv("POSTGRES_USER", "postgres")
DB_PASSWORD = os.getenv("POSTGRES_PASSWORD", "yourpassword")
DB_NAME = os.getenv("POSTGRES_DB", "nbp_exchange")

DATABASE_URL = "postgresql://postgres:yourpassword@postgres:5432/nbp_exchange"


engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


Base.metadata.create_all(bind=engine)


app = FastAPI()

# CORS settings
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4200"],  # allow your Angular app
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

NBP_API_URL = "http://api.nbp.pl/api/exchangerates/tables/A"


class Currency(Base):
    __tablename__ = "currencies"
    id = Column(Integer, primary_key=True, index=True)
    currency = Column(String, index=True, nullable=False)
    code = Column(String, index=True, nullable=False)
    rate = Column(Float, nullable=False)
    effective_date = Column(Date, nullable=False)


class CurrencyOut(BaseModel):
    id: int
    currency: str
    code: str
    rate: float
    effective_date: date

    model_config = ConfigDict(from_attributes=True)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@app.get("/currencies")
def get_currencies():
    response = requests.get(f"{NBP_API_URL}?format=json")
    if response.status_code != 200:
        raise HTTPException(
            status_code=500, detail="Failed to fetch currencies")
    data = response.json()
    return [rate["code"] for rate in data[0]["rates"]]


@app.get("/currencies/{date}")
def get_currencies_by_date(date: str):
    try:
        datetime.strptime(date, "%Y-%m-%d")
    except ValueError:
        raise HTTPException(
            status_code=400, detail="Date must be in YYYY-MM-DD format")

    response = requests.get(f"{NBP_API_URL}/{date}?format=json")
    if response.status_code == 404:
        raise HTTPException(
            status_code=404, detail="Data not found for given date")
    elif response.status_code != 200:
        raise HTTPException(status_code=500, detail="Failed to fetch data")

    data = response.json()
    return data[0]["rates"]


@app.post("/currencies/fetch")
def fetch_and_store():
    response = requests.get(f"{NBP_API_URL}?format=json")
    if response.status_code != 200:
        raise HTTPException(
            status_code=500, detail="Failed to fetch data from NBP API")

    data = response.json()[0]
    effective_date_str = data["effectiveDate"]
    effective_date = datetime.strptime(effective_date_str, "%Y-%m-%d").date()
    rates = data["rates"]

    db: Session = SessionLocal()
    try:
        for rate in rates:
            currency = Currency(
                currency=rate["currency"],
                code=rate["code"],
                rate=rate["mid"],
                effective_date=effective_date
            )
            db.add(currency)
        db.commit()
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"DB error: {str(e)}")
    finally:
        db.close()

    return {"message": f"Inserted {len(rates)} currencies for {effective_date_str}"}


@app.get("/currenciess/db", response_model=List[CurrencyOut])
def get_all_currencies(db: Session = Depends(get_db)):
    try:
        currencies = db.query(Currency).all()
        return currencies
    except Exception as e:
        # Log the error message
        print(f"Error fetching currencies: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")

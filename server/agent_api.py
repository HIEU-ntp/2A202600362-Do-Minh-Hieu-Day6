import json
import sys
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "src" / "03_recommendation_engine"))
sys.path.insert(0, str(ROOT / "src" / "05_calculator_lead"))

from calculator import calculator_summary
from recommend import recommend_top3, load_vehicles, vehicle_slug

app = FastAPI(title="VinFast agent tools")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class RecommendBody(BaseModel):
    budget_million_max: int = Field(ge=50)
    family_size: int = Field(default=5, ge=1, le=9)
    usage: str = "balanced"
    km_per_month: int = 0
    priority: list[str] = []
    vehicle_type: str = "car"


class CalculateBody(BaseModel):
    vehicle_id: str
    down_payment_percent: float = 20
    tenure_months: int = 60
    annual_interest_rate: float = 0.1


@app.post("/api/recommend")
def api_recommend(body: RecommendBody):
    profile = {
        "budget_million_max": body.budget_million_max,
        "family_size": body.family_size,
        "usage": body.usage,
        "km_per_month": body.km_per_month,
        "priority": body.priority,
        "vehicle_type": body.vehicle_type,
    }
    return recommend_top3(profile)


@app.post("/api/calculate")
def api_calculate(body: CalculateBody):
    vehicles = load_vehicles()
    v = next((x for x in vehicles if vehicle_slug(x) == body.vehicle_id.strip()), None)
    if not v:
        return {"error": "vehicle_not_found", "vehicle_id": body.vehicle_id}
    return calculator_summary(
        v,
        down_payment_percent=body.down_payment_percent,
        annual_interest_rate=body.annual_interest_rate,
        tenure_months=body.tenure_months,
    )


@app.get("/api/health")
def health():
    return {"ok": True}

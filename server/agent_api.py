import json
import sys
import time
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

LOG_DIR = ROOT / "chat_logs"


class RecommendBody(BaseModel):
    budget_million_max: int = Field(ge=10)
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


class CompareBody(BaseModel):
    vehicle_ids: list[str]

class ChatLogBody(BaseModel):
    session_id: str = Field(min_length=6, max_length=80)
    app: str = "Hackathon/Demo"
    model: str | None = None
    messages: list[dict] = []
    tool_events: list[dict] = []
    meta: dict = {}


def _safe_session_id(s: str) -> str:
    keep = []
    for ch in str(s):
        if ch.isalnum() or ch in ("-", "_"):
            keep.append(ch)
    out = "".join(keep)[:80]
    return out or f"session_{int(time.time())}"


def _atomic_write_json(path: Path, data: dict) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    tmp = path.with_suffix(path.suffix + ".tmp")
    tmp.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
    tmp.replace(path)


@app.post("/api/compare")
def api_compare(body: CompareBody):
    vehicles = load_vehicles()
    results = []
    for vid in body.vehicle_ids[:3]:
        vid_lower = vid.strip().lower()
        vid_compact = vid_lower.replace(" ", "")
        
        # Hàm tìm linh hoạt mờ
        found = None
        for x in vehicles:
            slug = vehicle_slug(x)
            model = str(x.get("model", "")).lower()
            if slug == vid_lower:
                found = x
                break
            elif slug.startswith(vid_compact) or slug.startswith(vid_lower):
                found = x
                break
            elif vid_lower in model or vid_compact in model.replace(" ", ""):
                found = x
                break
        
        if found:
            # Avoid duplicates if AI sends identical IDs
            if not any(vehicle_slug(r) == vehicle_slug(found) for r in results):
                results.append(found)

    if len(results) < 2:
        return {"error": f"Cần ít nhất 2 mã xe hợp lệ để so sánh. Mã LLM gửi: {body.vehicle_ids}"}
    return {"vehicles": results}


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


@app.post("/api/chat_log")
def api_chat_log(body: ChatLogBody):
    sid = _safe_session_id(body.session_id)
    now = int(time.time())
    path = LOG_DIR / f"{sid}.json"

    payload = {
        "session_id": sid,
        "updated_at_unix": now,
        "app": body.app,
        "model": body.model,
        "messages": body.messages,
        "tool_events": body.tool_events,
        "meta": body.meta or {},
    }
    _atomic_write_json(path, payload)
    return {"ok": True, "path": str(path)}

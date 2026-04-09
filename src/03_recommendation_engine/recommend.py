import json
from pathlib import Path
from typing import Any, Dict, List, Optional

ROOT = Path(__file__).resolve().parents[2]
VEHICLES_PATH = ROOT / "data" / "vehicles.json"


def load_vehicles() -> list[dict[str, Any]]:
    data = json.loads(VEHICLES_PATH.read_text(encoding="utf-8"))
    return data["vehicles"]


def vehicle_slug(v: dict[str, Any]) -> str:
    m = str(v.get("model", "")).lower().replace(" ", "")
    vr = str(v.get("variant", "")).lower().replace(" ", "_")
    return f"{m}_{vr}" if vr else m or "unknown"


class VinFastRecommendationEngine:
    def __init__(self, vehicles: Optional[list[dict[str, Any]]] = None) -> None:
        self.vehicles = vehicles if vehicles is not None else load_vehicles()

    def filter_by_budget(self, vehicles: List[Dict], max_budget_million: int) -> List[Dict]:
        return [v for v in vehicles if v["price_million"] <= max_budget_million]

    def filter_by_seats(self, vehicles: List[Dict], min_seats: int) -> List[Dict]:
        return [v for v in vehicles if v["seats"] >= min_seats]

    def filter_by_type(self, vehicles: List[Dict], vehicle_type: str) -> List[Dict]:
        return [v for v in vehicles if str(v["type"]).lower() == vehicle_type.lower()]

    def filter_by_demand(self, vehicles: List[Dict], demand: str) -> List[Dict]:
        demand = demand.lower()
        if demand == "economy":
            return [v for v in vehicles if v["price_million"] < 100]
        if demand == "comfort":
            comfort_vehicles = [
                v
                for v in vehicles
                if any(
                    pro in str(v.get("pros", ""))
                    for pro in ["Trang bị", "sang trọng", "cao cấp"]
                )
            ]
            return comfort_vehicles if comfort_vehicles else vehicles
        if demand == "family":
            return [v for v in vehicles if v["seats"] >= 6]
        if demand == "performance":
            return [v for v in vehicles if v.get("motor_power_hp", 0) > 30]
        if demand == "eco":
            return [v for v in vehicles if v.get("range_km", 0) >= 150]
        return vehicles

    def calculate_score(
        self,
        vehicle: Dict,
        budget_million: int,
        min_seats: int,
        demand: str = "balanced",
        priority: Optional[Dict[str, float]] = None,
    ) -> float:
        if priority is None:
            priority = {
                "price": 0.25,
                "comfort": 0.20,
                "performance": 0.20,
                "efficiency": 0.15,
                "range": 0.20,
            }
        score = 0.0
        price_ratio = vehicle["price_million"] / max(budget_million, 1)
        price_score = max(0, 100 - price_ratio * 100)
        score += price_score * priority.get("price", 0.25)
        comfort_score = min(100, len(vehicle.get("features", [])) * 10)
        score += comfort_score * priority.get("comfort", 0.20)
        power = vehicle.get("motor_power_hp", 0)
        perf_score = min(100, (power / 70) * 100)
        score += perf_score * priority.get("performance", 0.20)
        range_km = vehicle.get("range_km", 0)
        if range_km > 0:
            efficiency_score = min(100, (range_km / 350) * 100)
        else:
            monthly_cost = vehicle.get("monthly_charging_cost_vnd", 1000000)
            efficiency_score = max(0, 100 - (monthly_cost / 2000000) * 100)
        efficiency_score = min(100, efficiency_score)
        score += efficiency_score * priority.get("range", priority.get("efficiency", 0.20))
        if vehicle["seats"] >= min_seats:
            score += 10
        elif vehicle["type"] == "motobike":
            score -= 5
        else:
            score -= 15
        pros_count = len(vehicle.get("pros", []))
        cons_count = len(vehicle.get("cons", []))
        score += pros_count * 2
        score -= cons_count * 1
        return round(score, 0)

    def get_recommendations(
        self,
        budget_million: int,
        seats: int,
        vehicle_type: str = "all",
        demand: str = "balanced",
        priority: Optional[Dict[str, float]] = None,
        top_n: int = 3,
    ) -> Dict[str, Any]:
        seats = max(1, int(seats))
        vt = vehicle_type.lower()
        if vt == "motobike":
            seats = 1
        candidates = list(self.vehicles)
        candidates = self.filter_by_budget(candidates, budget_million)
        candidates = self.filter_by_seats(candidates, seats)
        if vt != "all":
            candidates = self.filter_by_type(candidates, vehicle_type)
        if demand != "balanced":
            candidates = self.filter_by_demand(candidates, demand)
        scored = []
        for vehicle in candidates:
            sc = int(
                self.calculate_score(vehicle, budget_million, seats, demand, priority)
            )
            scored.append(
                {
                    "id": vehicle_slug(vehicle),
                    "model": vehicle["model"],
                    "variant": vehicle.get("variant", ""),
                    "price_million": vehicle["price_million"],
                    "type": vehicle["type"],
                    "segments": vehicle.get("segment", ""),
                    "range_km": vehicle.get("range_km", 0),
                    "seats": vehicle["seats"],
                    "colors": vehicle.get("color", []),
                    "score": sc,
                }
            )
        scored.sort(key=lambda x: x["score"], reverse=True)
        return {"top3": scored[:top_n], "total_candidates": len(scored)}

    def get_vehicle_by_id(self, slug: str) -> Optional[Dict]:
        for vehicle in self.vehicles:
            if vehicle_slug(vehicle) == slug:
                return vehicle
        return None


def priority_from_profile(priorities: list[str]) -> Dict[str, float]:
    base = {
        "price": 0.2,
        "comfort": 0.2,
        "performance": 0.2,
        "efficiency": 0.1,
        "range": 0.3,
    }
    if not priorities:
        return base
    p = {k: 0.05 for k in base}
    for x in priorities:
        k = str(x).lower()
        if k in ("budget", "cheap", "re", "tiet_kiem"):
            p["price"] += 0.35
        elif k in ("space", "comfort", "rong", "gia_dinh"):
            p["comfort"] += 0.35
        elif k in ("tech", "cong_nghe", "performance", "hieu_suat"):
            p["performance"] += 0.35
        elif k in ("range", "long", "xa", "pin", "eco"):
            p["range"] += 0.35
        else:
            p["comfort"] += 0.15
    s = sum(p.values()) or 1.0
    return {k: v / s for k, v in p.items()}


def usage_to_demand(usage: str) -> str:
    u = str(usage).lower()
    if "gia" in u or "family" in u:
        return "family"
    if "xa" in u or "long" in u or "du_lich" in u:
        return "eco"
    if "business" in u or "cong" in u:
        return "comfort"
    if "tiet" in u or "economy" in u:
        return "economy"
    return "balanced"


def recommend_top3(
    profile: dict[str, Any], vehicles: list[dict[str, Any]] | None = None
) -> dict[str, Any]:
    budget = int(profile.get("budget_million_max") or profile.get("budget_max_million") or 0)
    if budget <= 0:
        budget = 2000
    vehicle_type = str(profile.get("vehicle_type") or "car").lower()
    if vehicle_type not in ("car", "motobike", "all"):
        vehicle_type = "car"
    raw_seats = profile.get("family_size")
    if raw_seats is None:
        raw_seats = profile.get("seats")
    if raw_seats is not None:
        seats = max(1, int(raw_seats))
    else:
        seats = 1 if vehicle_type == "motobike" else 2
    usage = str(profile.get("usage") or "balanced")
    demand = str(profile.get("demand") or usage_to_demand(usage))
    pri = profile.get("priority") or profile.get("priorities") or []
    if isinstance(pri, str):
        pri = [pri]
    priority_weights = priority_from_profile(list(pri))
    engine = VinFastRecommendationEngine(vehicles)
    return engine.get_recommendations(
        budget_million=budget,
        seats=seats,
        vehicle_type=vehicle_type,
        demand=demand,
        priority=priority_weights,
        top_n=3,
    )


if __name__ == "__main__":
    r = recommend_top3(
        {
            "budget_million_max": 1500,
            "family_size": 5,
            "usage": "family",
            "priority": ["space"],
        }
    )
    print(json.dumps(r, ensure_ascii=True))

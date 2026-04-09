from typing import Any


def build_vehicle_id(vehicle: dict[str, Any]) -> str:
    if vid := str(vehicle.get("id", "")).strip():
        return vid
    model = str(vehicle.get("model", "")).lower().replace(" ", "")
    variant = str(vehicle.get("variant", "")).lower().replace(" ", "_")
    if model and variant:
        return f"{model}_{variant}"
    if model:
        return model
    return "unknown"


def build_display_name(vehicle: dict[str, Any]) -> str:
    if dn := str(vehicle.get("display_name", "")).strip():
        return dn
    model = str(vehicle.get("model", "")).strip()
    variant = str(vehicle.get("variant", "")).strip()
    return f"{model} {variant}".strip() or "Vehicle"


def _price_million(vehicle: dict[str, Any]) -> float:
    if "price_million" in vehicle and vehicle["price_million"] is not None:
        return float(vehicle["price_million"])
    if vehicle.get("price_promo_million_vnd") is not None:
        return float(vehicle["price_promo_million_vnd"])
    if vehicle.get("price_list_million_vnd") is not None:
        return float(vehicle["price_list_million_vnd"])
    return 0.0


def vehicle_to_calc_view(vehicle: dict[str, Any]) -> dict[str, Any]:
    range_km = vehicle.get("range_km")
    if range_km is None and vehicle.get("wltp_range_km") is not None:
        range_km = int(vehicle["wltp_range_km"])
    elif range_km is not None:
        range_km = int(range_km)
    else:
        range_km = 0
    seats = int(vehicle.get("seats", 0) or 0)
    mc = vehicle.get("monthly_charging_cost_vnd")
    return {
        "id": build_vehicle_id(vehicle),
        "display_name": build_display_name(vehicle),
        "price_million": _price_million(vehicle),
        "monthly_charging_cost_vnd": int(mc) if mc is not None else 0,
        "seats": seats,
        "range_km": range_km,
        "segment": str(vehicle.get("segment", "") or ""),
        "battery_kwh": float(vehicle.get("battery_kwh", 0) or 0),
    }

import json
from datetime import UTC, datetime
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[2]
MOCK_LEADS = ROOT / "data" / "mock_leads.jsonl"


def validate_lead(payload: dict[str, Any]) -> list[str]:
    errors: list[str] = []
    if not str(payload.get("name", "")).strip():
        errors.append("name is required")
    phone = str(payload.get("phone", "")).strip()
    email = str(payload.get("email", "")).strip()
    if not phone and not email:
        errors.append("phone or email is required")
    if not str(payload.get("preferred_vehicle_id", "")).strip():
        errors.append("preferred_vehicle_id is required")
    if "wants_test_drive" in payload and not isinstance(
        payload["wants_test_drive"], bool
    ):
        errors.append("wants_test_drive must be boolean")
    return errors


def normalize_lead(payload: dict[str, Any]) -> dict[str, Any]:
    return {
        "name": str(payload.get("name", "")).strip(),
        "phone": str(payload.get("phone", "")).strip(),
        "email": str(payload.get("email", "")).strip().lower(),
        "preferred_vehicle_id": str(payload.get("preferred_vehicle_id", "")).strip(),
        "preferred_vehicle_name": str(payload.get("preferred_vehicle_name", "")).strip(),
        "wants_test_drive": bool(payload.get("wants_test_drive", False)),
        "notes": str(payload.get("notes", "")).strip(),
        "source": "web_prototype",
        "created_at": datetime.now(UTC).isoformat(),
    }


def append_lead(payload: dict[str, Any]) -> None:
    errors = validate_lead(payload)
    if errors:
        raise ValueError("; ".join(errors))
    normalized = normalize_lead(payload)
    MOCK_LEADS.parent.mkdir(parents=True, exist_ok=True)
    line = json.dumps(normalized, ensure_ascii=False) + "\n"
    with MOCK_LEADS.open("a", encoding="utf-8") as f:
        f.write(line)

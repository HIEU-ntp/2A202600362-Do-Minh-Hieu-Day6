import json
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[2]
MOCK_LEADS = ROOT / "data" / "mock_leads.jsonl"


def append_lead(payload: dict[str, Any]) -> None:
    MOCK_LEADS.parent.mkdir(parents=True, exist_ok=True)
    line = json.dumps(payload, ensure_ascii=False) + "\n"
    with MOCK_LEADS.open("a", encoding="utf-8") as f:
        f.write(line)

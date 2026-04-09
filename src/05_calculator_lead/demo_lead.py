import json
import sys
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(Path(__file__).resolve().parent))

import lead as lead_mod

CONTRACT = ROOT / "data" / "standard_contract.json"


def main() -> int:
    data = json.loads(CONTRACT.read_text(encoding="utf-8"))
    example = dict(data["lead_payload_example"])
    vehicle = data["vehicles"][0]
    example["preferred_vehicle_id"] = vehicle["id"]
    example["preferred_vehicle_name"] = vehicle["display_name"]
    with tempfile.TemporaryDirectory() as tmp:
        lead_mod.MOCK_LEADS = Path(tmp) / "mock_leads.jsonl"
        lead_mod.append_lead(example)
        lines = lead_mod.MOCK_LEADS.read_text(encoding="utf-8").strip().splitlines()
        assert len(lines) == 1
        saved = json.loads(lines[0])
        assert saved["preferred_vehicle_id"] == vehicle["id"]
        assert saved["source"] == "web_prototype"
    assert lead_mod.validate_lead({"name": ""})
    err = lead_mod.validate_lead({"name": "A"})
    assert "phone or email" in " ".join(err).lower()
    print("ok")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

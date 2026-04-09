import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(Path(__file__).resolve().parent))

from calculator import calculator_summary, five_year_total_cost

CONTRACT = ROOT / "data" / "standard_contract.json"


def main() -> int:
    data = json.loads(CONTRACT.read_text(encoding="utf-8"))
    vehicle = data["vehicles"][0]
    ex = data.get("calculator_input_example", {})
    s1 = calculator_summary(vehicle)
    s2 = calculator_summary(
        vehicle,
        down_payment_percent=float(ex.get("down_payment_percent", 20)),
        annual_interest_rate=float(ex.get("annual_interest_rate", 0.1)),
        tenure_months=int(ex.get("tenure_months", 36)),
    )
    s3 = five_year_total_cost(vehicle, ex)
    import pprint

    pprint.pprint(s1)
    pprint.pprint(s2)
    assert s1["vehicle_id"] == s3["vehicle_id"]
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

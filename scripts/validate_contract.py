import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CONTRACT = ROOT / "data" / "standard_contract.json"


def main() -> int:
    data = json.loads(CONTRACT.read_text(encoding="utf-8"))
    assert data.get("schema_version")
    assert isinstance(data.get("user_intake"), dict)
    vs = data.get("vehicles")
    assert isinstance(vs, list) and len(vs) == 1
    v = vs[0]
    for k in (
        "id",
        "display_name",
        "colors",
        "price_list_million_vnd",
        "price_promo_million_vnd",
        "seats",
    ):
        assert k in v, k
    print("ok", CONTRACT)
    return 0


if __name__ == "__main__":
    sys.exit(main())

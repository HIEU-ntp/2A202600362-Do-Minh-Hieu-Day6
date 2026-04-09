import json
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[2]
CONTRACT_PATH = ROOT / "data" / "standard_contract.json"


def load_contract() -> dict[str, Any]:
    return json.loads(CONTRACT_PATH.read_text(encoding="utf-8"))


def load_vehicles() -> list[dict[str, Any]]:
    return load_contract()["vehicles"]


def recommend_top3(profile: dict[str, Any], vehicles: list[dict[str, Any]] | None = None) -> dict[str, Any]:
    vehicles = vehicles or load_vehicles()
    raise NotImplementedError


if __name__ == "__main__":
    c = load_contract()
    print(len(c["vehicles"]), "vehicle(s) in contract")

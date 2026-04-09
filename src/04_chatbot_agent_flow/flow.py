from enum import Enum, auto
from typing import Any


class Step(Enum):
    AUTH_OR_GUEST = auto()
    ASK_BUDGET = auto()
    ASK_FAMILY = auto()
    ASK_USAGE = auto()
    ASK_DISTANCE = auto()
    ASK_PRIORITY = auto()
    READY_FOR_RECOMMEND = auto()
    SHOW_TOP3 = auto()
    EXPLAIN = auto()
    CALCULATOR = auto()
    LEAD_CAPTURE = auto()


STEP_ORDER = [
    Step.ASK_BUDGET,
    Step.ASK_FAMILY,
    Step.ASK_USAGE,
    Step.ASK_DISTANCE,
    Step.ASK_PRIORITY,
    Step.READY_FOR_RECOMMEND,
]


def intake_prompt(step: Step) -> str:
    prompts = {
        Step.ASK_BUDGET: "Ban mua xe voi ngan sac toi da khoang bao nhieu trieu VND? (chi nhap so, vi du 900)",
        Step.ASK_FAMILY: "Thuong xuyen cho bao nhieu nguoi? (nhap so ghe toi thieu can, vi du 5)",
        Step.ASK_USAGE: "Muc dich chinh? (di lam / gia dinh / di xa / cong tac)",
        Step.ASK_DISTANCE: "Quang duong trung binh hang thang khoang bao nhieu km? (vi du 1200)",
        Step.ASK_PRIORITY: "Uu tien chinh? (re / rong / cong nghe / tam xa — co the nhap nhieu, cach nhau dau phay)",
    }
    return prompts.get(step, "")


def _has(state: dict[str, Any], key: str) -> bool:
    v = state.get(key)
    return v is not None and v != ""


def next_step(state: dict[str, Any]) -> Step:
    if not _has(state, "budget_million_max"):
        return Step.ASK_BUDGET
    if not _has(state, "family_size"):
        return Step.ASK_FAMILY
    if not _has(state, "usage"):
        return Step.ASK_USAGE
    if not _has(state, "km_per_month"):
        return Step.ASK_DISTANCE
    if not _has(state, "priority"):
        return Step.ASK_PRIORITY
    return Step.READY_FOR_RECOMMEND


def build_intake_payload(state: dict[str, Any]) -> dict[str, Any]:
    pri = state.get("priority")
    if isinstance(pri, str):
        priority_list = [p.strip() for p in pri.split(",") if p.strip()]
    elif isinstance(pri, list):
        priority_list = [str(p).strip() for p in pri if str(p).strip()]
    else:
        priority_list = []
    return {
        "budget_million_max": int(state["budget_million_max"]),
        "family_size": int(state["family_size"]),
        "usage": str(state["usage"]).strip(),
        "km_per_month": int(state["km_per_month"]),
        "priority": priority_list,
        "vehicle_type": str(state.get("vehicle_type") or "car"),
    }

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


def next_step(state: dict[str, Any]) -> Step:
    raise NotImplementedError


def build_intake_payload(state: dict[str, Any]) -> dict[str, Any]:
    raise NotImplementedError

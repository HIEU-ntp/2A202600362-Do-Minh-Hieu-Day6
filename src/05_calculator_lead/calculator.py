from typing import Any


def monthly_installment(
    price_million: float,
    down_payment_percent: float,
    annual_rate: float,
    tenure_months: int,
) -> float:
    raise NotImplementedError


def monthly_energy_cost(
    km_per_month: float,
    kwh_per_100km: float,
    vnd_per_kwh: float,
) -> float:
    raise NotImplementedError


def five_year_total_cost(
    vehicle_row: dict[str, Any],
    calc_input: dict[str, Any],
) -> dict[str, Any]:
    raise NotImplementedError

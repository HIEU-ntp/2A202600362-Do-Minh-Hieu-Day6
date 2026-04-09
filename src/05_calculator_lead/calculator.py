from typing import Any

from adapters import vehicle_to_calc_view


def monthly_energy_cost(
    km_per_month: float,
    kwh_per_100km: float,
    vnd_per_kwh: float,
) -> float:
    return km_per_month * (kwh_per_100km / 100.0) * vnd_per_kwh


def get_monthly_charging_cost(vehicle: dict[str, Any], custom_cost: int | None = None) -> int:
    if custom_cost is not None:
        return int(custom_cost)
    v = vehicle.get("monthly_charging_cost_vnd")
    if v is not None:
        return int(v)
    km = float(vehicle.get("km_per_month") or 0)
    kwh = float(vehicle.get("kwh_per_100km") or 0)
    price = float(vehicle.get("electricity_vnd_per_kwh") or 0)
    if km > 0 and kwh > 0 and price > 0:
        return int(round(monthly_energy_cost(km, kwh, price)))
    return 0


def monthly_installment(
    price_million: float,
    down_payment_percent: float,
    annual_rate: float,
    tenure_months: int,
) -> float:
    if price_million < 0:
        raise ValueError("price_million must be >= 0")
    if tenure_months <= 0:
        raise ValueError("tenure_months must be > 0")
    if not (0 <= down_payment_percent <= 100):
        raise ValueError("down_payment_percent must be between 0 and 100")
    if annual_rate < 0:
        raise ValueError("annual_rate must be >= 0")
    loan_principal = price_million * (1 - down_payment_percent / 100)
    if loan_principal <= 0:
        return 0.0
    if annual_rate == 0:
        return round(loan_principal / tenure_months, 2)
    monthly_rate = annual_rate / 12
    factor = (1 + monthly_rate) ** tenure_months
    emi = loan_principal * (monthly_rate * factor) / (factor - 1)
    return round(emi, 2)


def calculator_summary(
    vehicle: dict[str, Any],
    down_payment_percent: float = 20,
    annual_interest_rate: float = 0.1,
    tenure_months: int = 60,
    custom_monthly_charging_cost_vnd: int | None = None,
) -> dict[str, Any]:
    car = vehicle_to_calc_view(vehicle)
    price_million = car["price_million"]
    monthly_charging_cost_vnd = get_monthly_charging_cost(
        vehicle, custom_monthly_charging_cost_vnd
    )
    down_payment_million = round(price_million * down_payment_percent / 100, 2)
    loan_principal_million = round(price_million - down_payment_million, 2)
    monthly_installment_million = monthly_installment(
        price_million=price_million,
        down_payment_percent=down_payment_percent,
        annual_rate=annual_interest_rate,
        tenure_months=tenure_months,
    )
    yearly_charging_cost_vnd = monthly_charging_cost_vnd * 12
    five_year_charging_cost_vnd = monthly_charging_cost_vnd * 60
    months_for_installment_total = min(tenure_months, 60)
    five_year_installment_total_million = round(
        monthly_installment_million * months_for_installment_total, 2
    )
    five_year_total_cost_vnd = int(
        down_payment_million * 1_000_000
        + five_year_installment_total_million * 1_000_000
        + five_year_charging_cost_vnd
    )
    return {
        "vehicle_id": car["id"],
        "vehicle_name": car["display_name"],
        "price_million": price_million,
        "monthly_charging_cost_vnd": monthly_charging_cost_vnd,
        "yearly_charging_cost_vnd": yearly_charging_cost_vnd,
        "five_year_charging_cost_vnd": five_year_charging_cost_vnd,
        "down_payment_percent": down_payment_percent,
        "down_payment_million": down_payment_million,
        "loan_principal_million": loan_principal_million,
        "annual_interest_rate": annual_interest_rate,
        "tenure_months": tenure_months,
        "monthly_installment_million": monthly_installment_million,
        "five_year_installment_total_million": five_year_installment_total_million,
        "five_year_total_cost_vnd": five_year_total_cost_vnd,
    }


def five_year_total_cost(
    vehicle_row: dict[str, Any],
    calc_input: dict[str, Any],
) -> dict[str, Any]:
    return calculator_summary(
        vehicle_row,
        down_payment_percent=float(calc_input.get("down_payment_percent", 20)),
        annual_interest_rate=float(calc_input.get("annual_interest_rate", 0.1)),
        tenure_months=int(calc_input.get("tenure_months", 60)),
        custom_monthly_charging_cost_vnd=calc_input.get("custom_monthly_charging_cost_vnd"),
    )

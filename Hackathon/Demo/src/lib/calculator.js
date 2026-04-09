export function monthlyInstallment(priceMillion, downPaymentPercent, annualRate, tenureMonths) {
  if (priceMillion < 0) throw new Error("price_million must be >= 0");
  if (tenureMonths <= 0) throw new Error("tenure_months must be > 0");
  if (downPaymentPercent < 0 || downPaymentPercent > 100) {
    throw new Error("down_payment_percent must be between 0 and 100");
  }
  if (annualRate < 0) throw new Error("annual_rate must be >= 0");
  const loanPrincipal = priceMillion * (1 - downPaymentPercent / 100);
  if (loanPrincipal <= 0) return 0;
  if (annualRate === 0) return Math.round((loanPrincipal / tenureMonths) * 100) / 100;
  const monthlyRate = annualRate / 12;
  const factor = (1 + monthlyRate) ** tenureMonths;
  const emi = (loanPrincipal * (monthlyRate * factor)) / (factor - 1);
  return Math.round(emi * 100) / 100;
}

export function getMonthlyChargingCost(vehicle, customVnd) {
  if (customVnd != null && customVnd !== "") return Math.round(Number(customVnd));
  const v = vehicle?.monthly_charging_cost_vnd;
  if (v != null) return Math.round(Number(v));
  return 0;
}

export function calculatorSummary(vehicle, options = {}) {
  const priceMillion = Number(vehicle?.price_million ?? 0);
  const downPaymentPercent = Number(options.downPaymentPercent ?? 20);
  const annualInterestRate = Number(options.annualInterestRate ?? 0.1);
  const tenureMonths = Number(options.tenureMonths ?? 60);
  const monthlyChargingCostVnd = getMonthlyChargingCost(
    vehicle,
    options.customMonthlyChargingVnd,
  );
  const downPaymentMillion = Math.round(priceMillion * (downPaymentPercent / 100) * 100) / 100;
  const loanPrincipalMillion = Math.round((priceMillion - downPaymentMillion) * 100) / 100;
  const monthlyInstallmentMillion = monthlyInstallment(
    priceMillion,
    downPaymentPercent,
    annualInterestRate,
    tenureMonths,
  );
  const yearlyChargingCostVnd = monthlyChargingCostVnd * 12;
  const fiveYearChargingCostVnd = monthlyChargingCostVnd * 60;
  const monthsCap = Math.min(tenureMonths, 60);
  const fiveYearInstallmentTotalMillion =
    Math.round(monthlyInstallmentMillion * monthsCap * 100) / 100;
  const fiveYearTotalCostVnd = Math.round(
    downPaymentMillion * 1_000_000 +
      fiveYearInstallmentTotalMillion * 1_000_000 +
      fiveYearChargingCostVnd,
  );
  return {
    vehicle_id: options.vehicleId || "",
    vehicle_name: options.vehicleName || "",
    price_million: priceMillion,
    monthly_charging_cost_vnd: monthlyChargingCostVnd,
    yearly_charging_cost_vnd: yearlyChargingCostVnd,
    five_year_charging_cost_vnd: fiveYearChargingCostVnd,
    down_payment_percent: downPaymentPercent,
    down_payment_million: downPaymentMillion,
    loan_principal_million: loanPrincipalMillion,
    annual_interest_rate: annualInterestRate,
    tenure_months: tenureMonths,
    monthly_installment_million: monthlyInstallmentMillion,
    five_year_installment_total_million: fiveYearInstallmentTotalMillion,
    five_year_total_cost_vnd: fiveYearTotalCostVnd,
  };
}

export default function CompassCalculator({
  vehicleName,
  summary,
  downPaymentPercent,
  tenureMonths,
  annualRate,
  onDownPaymentChange,
  onTenureChange,
  onAnnualRateChange,
  disclaimer,
}) {
  if (!summary) {
    return (
      <section className="compass-calculator">
        <div className="compass-headline">
          <h3>Calculator</h3>
          <p>Chon mot xe o muc Top 3 de xem gia, tra gop va chi phi sac.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="compass-calculator">
      <div className="compass-headline">
        <h3>Calculator</h3>
        <p>{vehicleName}</p>
      </div>

      <div className="calc-grid">
        <label>
          <span>Tra truoc (%)</span>
          <input
            type="number"
            step="1"
            min="0"
            max="90"
            value={downPaymentPercent}
            onChange={(e) => onDownPaymentChange(Number(e.target.value))}
          />
        </label>

        <label>
          <span>Ky han (thang)</span>
          <input
            type="number"
            step="1"
            min="12"
            max="96"
            value={tenureMonths}
            onChange={(e) => onTenureChange(Number(e.target.value))}
          />
        </label>

        <label>
          <span>Lai suat nam (0-1)</span>
          <input
            type="number"
            step="0.01"
            min="0"
            max="0.3"
            value={annualRate}
            onChange={(e) => onAnnualRateChange(Number(e.target.value))}
          />
        </label>
      </div>

      <div className="calc-output">
        <p>
          Gia xe: <strong>{summary.price_million} trieu</strong>
        </p>
        <p>
          Chi phi sac/thang:{" "}
          <strong>{(summary.monthly_charging_cost_vnd / 1_000_000).toFixed(2)} trieu VND</strong>
        </p>
        <p>
          Tra gop/thang: <strong>{summary.monthly_installment_million} trieu</strong>
        </p>
        <p>
          Tong uoc tinh 5 nam (tra truoc + tra gop trong ky + sac):{" "}
          <strong>{(summary.five_year_total_cost_vnd / 1_000_000).toFixed(1)} trieu VND</strong>
        </p>
      </div>

      {disclaimer && <p className="price-disclaimer">{disclaimer}</p>}
    </section>
  );
}

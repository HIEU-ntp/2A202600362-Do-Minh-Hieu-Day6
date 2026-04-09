export default function CompassCalculator({
  budget,
  passengers,
  priority,
  estimatedMonthly,
  onBudgetChange,
  onPassengersChange,
  onPriorityChange,
}) {
  return (
    <section className="compass-calculator">
      <div className="compass-headline">
        <h3>Calculator</h3>
        <p>Uoc tinh kha nang chi tra va goi y nhanh</p>
      </div>

      <div className="calc-grid">
        <label>
          <span>Ngan sach toi da (ty VND)</span>
          <input
            type="number"
            step="0.1"
            min="0.4"
            value={budget}
            onChange={(event) => onBudgetChange(Number(event.target.value))}
          />
        </label>

        <label>
          <span>So nguoi thuong di</span>
          <input
            type="number"
            min="2"
            max="8"
            value={passengers}
            onChange={(event) => onPassengersChange(Number(event.target.value))}
          />
        </label>

        <label>
          <span>Uu tien</span>
          <select value={priority} onChange={(event) => onPriorityChange(event.target.value)}>
            <option value="budget">Tiet kiem chi phi</option>
            <option value="balance">Can bang tong the</option>
            <option value="space">Rong rai, nhieu tien nghi</option>
          </select>
        </label>
      </div>

      <p className="calc-summary">
        Uoc tinh tra gop an toan: <strong>{estimatedMonthly} trieu/thang</strong> (tam tinh theo 84 thang).
      </p>
    </section>
  );
}

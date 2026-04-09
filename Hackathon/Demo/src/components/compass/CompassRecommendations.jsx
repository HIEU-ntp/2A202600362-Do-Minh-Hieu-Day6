export default function CompassRecommendations({ recommendations, selectedId, onSelect }) {
  return (
    <section className="recommend-list-wrap">
      <div className="compass-headline">
        <h3>Top 3 goi y</h3>
        <p>Chon mot xe de tinh chi phi va de lai lead</p>
      </div>

      <div className="recommend-list">
        {recommendations.map((item, index) => {
          const name = `${item.model || ""} ${item.variant || ""}`.trim() || item.name;
          const active = item.id === selectedId;
          return (
            <button
              type="button"
              key={item.id || name}
              className={`recommend-item pick ${active ? "selected" : ""}`}
              onClick={() => onSelect?.(item)}
            >
              <div className="recommend-item-text">
                <p className="rank">#{index + 1}</p>
                <h4>{name}</h4>
                <p className="reason">{item.reason || `${item.seats} cho · ${item.range_km} km`}</p>
                <p className="vehicle-id">{item.id}</p>
              </div>
              <div className="match-pill">{item.score}%</div>
            </button>
          );
        })}
      </div>
    </section>
  );
}

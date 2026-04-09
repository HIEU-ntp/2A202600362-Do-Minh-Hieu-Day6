export default function CompassRecommendations({ recommendations }) {
  return (
    <section className="recommend-list-wrap">
      <div className="compass-headline">
        <h3>Top 3 xe phu hop</h3>
        <p>Du lieu mock JSON, cap nhat theo calculator</p>
      </div>

      <div className="recommend-list">
        {recommendations.map((item, index) => (
          <article className="recommend-item" key={item.name}>
            <div>
              <p className="rank">#{index + 1}</p>
              <h4>{item.name}</h4>
              <p className="reason">{item.reason}</p>
            </div>
            <div className="match-pill">{item.match}%</div>
          </article>
        ))}
      </div>
    </section>
  );
}

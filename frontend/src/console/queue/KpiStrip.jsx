// Pipeline summary KPI strip (4 cards). Stats are computed in QueueView.
export default function KpiStrip({ stats }) {
  return (
    <div className="kpi-strip">
      {stats.map((s) => (
        <div className="kpi-card" key={s.label}>
          <div className="kpi-card__label">{s.label}</div>
          <div className="kpi-card__valrow">
            <span className={`kpi-card__value${s.accent ? ' kpi-card__value--accent' : ''}`}>
              {s.value}
            </span>
            <span className="kpi-card__unit">{s.unit}</span>
          </div>
          <div className="kpi-card__sub">{s.sub}</div>
        </div>
      ))}
    </div>
  )
}

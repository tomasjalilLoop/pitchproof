// Detail header: company name + status, tagline, meta row, big overall score.
export default function DeckHeader({ d }) {
  return (
    <div className="detail__header">
      <div className="detail__headleft">
        <div className="detail__titlerow">
          <h1 className="detail__title">{d.name}</h1>
          <span
            className="status-pill"
            style={{ background: d.statusBg, color: d.statusFg }}
          >
            {d.statusLabel}
          </span>
        </div>
        {d.tagline && <p className="detail__tagline">{d.tagline}</p>}
        <div className="detail__meta">
          <span>
            <b>{d.stage}</b> · {d.sector}
          </span>
          <span>
            Raising <b>{d.ask}</b>
          </span>
          <span>Submitted {d.submittedLabel}</span>
        </div>
      </div>
      <div className="detail__scorebox">
        <div className="detail__scoreval">
          <span className="detail__scorenum">{d.score}</span>
          <span className="detail__scoremax">/100</span>
        </div>
        <div className="detail__scorecap">Pitch Proof score</div>
      </div>
    </div>
  )
}

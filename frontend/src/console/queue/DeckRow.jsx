// One clickable deck row in the queue table. `row` comes from viewmodel.toRow.
export default function DeckRow({ row, onOpen }) {
  return (
    <button type="button" className="deck-row" onClick={() => onOpen(row.id)}>
      <div className="cell-company">
        <span className="company__name">{row.name}</span>
        {row.tagline && <span className="company__tagline">{row.tagline}</span>}
      </div>

      <div className="cell-stage">
        <span className="cell-stage__stage">{row.stage}</span>
        <span className="cell-stage__sector">{row.sector}</span>
      </div>

      <div className="cell-score">{row.score}</div>

      <div className="cell-match">
        <span className="cell-match__pct">{row.match}%</span>
        <div className="mini-bar">
          <div className="mini-bar__fill" style={{ width: `${row.match}%` }} />
        </div>
      </div>

      <div className="cell-ask">{row.ask}</div>

      <div className="cell-submitted">{row.submittedLabel}</div>

      <div>
        <span
          className="status-pill"
          style={{ background: row.statusBg, color: row.statusFg }}
        >
          {row.statusLabel}
        </span>
      </div>
    </button>
  )
}

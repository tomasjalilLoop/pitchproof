// Two columns: Strengths (green checks) and Watch-outs (gold numbers).
// Real decks map strengths ← founder_view.fortalezas, watch-outs ← vc_view.red_flags.
export default function StrengthsWatchouts({ strengths, fixes }) {
  return (
    <div className="sw-cols">
      <div>
        <h3 className="sw-col__title">Strengths</h3>
        <div className="sw-list">
          {strengths.map((s, i) => (
            <div className="sw-bullet" key={i}>
              <span className="sw-bullet__mark">✓</span>
              {s.text}
            </div>
          ))}
        </div>
      </div>
      <div>
        <h3 className="sw-col__title">Watch-outs</h3>
        <div className="sw-list">
          {fixes.map((f) => (
            <div className="sw-bullet" key={f.n}>
              <span className="sw-bullet__mark sw-bullet__mark--gold">{f.n}</span>
              {f.text}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

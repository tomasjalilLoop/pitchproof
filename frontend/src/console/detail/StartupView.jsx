// Founder-facing panel. Renders deck.founderView (constructive, startup-side).
// Guards against a missing founderView so the view never crashes.
export default function StartupView({ founderView }) {
  const fv = founderView || {}
  const score = Number.isFinite(Number(fv.score)) ? Number(fv.score) : 0
  const strengths = Array.isArray(fv.strengths) ? fv.strengths : []
  const improvements = Array.isArray(fv.improvements) ? fv.improvements : []
  const hypotheses = Array.isArray(fv.hypotheses) ? fv.hypotheses : []
  const summary = fv.summary || ''

  return (
    <div className="startup-view">
      <div className="startup-view__scorebox">
        <div className="detail__scoreval">
          <span className="detail__scorenum">{score}</span>
          <span className="detail__scoremax">/100</span>
        </div>
        <div className="detail__scorecap">Founder readiness score</div>
      </div>

      <div className="sw-cols">
        <div>
          <h3 className="sw-col__title">What&apos;s working</h3>
          <div className="sw-list">
            {strengths.length === 0 ? (
              <div className="sw-bullet">No strengths recorded yet.</div>
            ) : (
              strengths.map((s, i) => (
                <div className="sw-bullet" key={i}>
                  <span className="sw-bullet__mark">✓</span>
                  {s}
                </div>
              ))
            )}
          </div>
        </div>
        <div>
          <h3 className="sw-col__title">Areas to improve</h3>
          <div className="sw-list">
            {improvements.length === 0 ? (
              <div className="sw-bullet">No improvement areas recorded yet.</div>
            ) : (
              improvements.map((s, i) => (
                <div className="sw-bullet" key={i}>
                  <span className="sw-bullet__mark sw-bullet__mark--gold">{i + 1}</span>
                  {s}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <h3 className="detail__h3">PMF hypotheses to test</h3>
      <div className="sw-list startup-view__hypotheses">
        {hypotheses.length === 0 ? (
          <div className="sw-bullet">No hypotheses recorded yet.</div>
        ) : (
          hypotheses.map((h, i) => (
            <div className="sw-bullet" key={i}>
              <span className="sw-bullet__mark">→</span>
              {h}
            </div>
          ))
        )}
      </div>

      {summary && (
        <div className="thesis-panel startup-view__summary">
          <div className="thesis-panel__head">
            <h3 className="thesis-panel__title">Where to focus next</h3>
          </div>
          <p className="thesis-panel__reason">{summary}</p>
        </div>
      )}
    </div>
  )
}

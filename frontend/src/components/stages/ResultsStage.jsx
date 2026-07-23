/**
 * Stage 4 — results. Renders entirely from the `result` object returned by
 * api/analysis.analyzeDeck(). Swap the mock for the real API and this screen
 * updates automatically — no markup changes needed.
 *
 * @param {Object} props
 * @param {import('../../api/analysis.js').AnalysisResult} props.result
 * @param {() => void} props.onReset          "Analyze another deck"
 * @param {() => void} props.onSubmitToFirms  VC submit CTA
 */
export default function ResultsStage({ result, onReset, onSubmitToFirms }) {
  const {
    score,
    verdict,
    categories,
    working,
    fixes,
    matchTitle,
    matchTier,
    matchBlurb,
    matches,
  } = result

  return (
    <section className="results">
      {/* Score header */}
      <div className="results__score-head">
        <div className="eyebrow">Your deck score</div>
        <div className="results__score">
          <span className="results__score-num">{score}</span>
          <span className="results__score-max">/100</span>
        </div>
        <p className="results__verdict">{verdict}</p>
      </div>

      {/* Category grid */}
      <div className="cat-grid">
        {categories.map((c) => (
          <div className="cat-card" key={c.label}>
            <div className="cat-card__head">
              <span className="cat-card__label">{c.label}</span>
              <span className="cat-card__score">{c.score}</span>
            </div>
            <div className="cat-card__track">
              <div className="cat-card__bar" style={{ width: c.pct }} />
            </div>
            <p className="cat-card__note">{c.note}</p>
          </div>
        ))}
      </div>

      {/* Two feedback columns */}
      <div className="feedback-cols">
        <div>
          <h3 className="feedback-col__title">What's working</h3>
          <div className="feedback-col__list">
            {working.map((item, i) => (
              <div className="feedback-bullet" key={i}>
                <span className="feedback-bullet__mark">✓</span>
                {item}
              </div>
            ))}
          </div>
        </div>
        <div>
          <h3 className="feedback-col__title">Fix these first</h3>
          <div className="feedback-col__list">
            {fixes.map((item, i) => (
              <div className="feedback-bullet" key={i}>
                <span className="feedback-bullet__mark feedback-bullet__mark--gold">
                  {i + 1}
                </span>
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* VC match card */}
      <div className="vc-match">
        <div className="vc-match__head">
          <span className="vc-match__title">{matchTitle}</span>
          <span className="chip chip--strong">{matchTier}</span>
        </div>
        <p className="vc-match__blurb">{matchBlurb}</p>
        <div className="vc-match__list">
          {matches.map((m) => (
            <div className="vc-match__row" key={m.firm}>
              <span className="vc-match__firm">{m.firm}</span>
              <span className="vc-match__thesis">{m.thesis}</span>
            </div>
          ))}
        </div>
        <button type="button" className="btn-accent" onClick={onSubmitToFirms}>
          Submit my deck to these firms
        </button>
        <div className="vc-match__caption">
          You control every introduction — nothing is shared without your
          go-ahead.
        </div>
      </div>

      <div className="results__reset">
        <button type="button" className="btn-text" onClick={onReset}>
          ← Analyze another deck
        </button>
      </div>
    </section>
  )
}

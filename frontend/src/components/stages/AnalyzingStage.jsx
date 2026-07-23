import { ANALYZING_STEPS } from '../../content.js'

// Staggered reveal delays for the checklist lines (seconds), from the handoff.
const STEP_DELAYS = ['0.1s', '0.7s', '1.3s', '1.9s', '2.5s']

/**
 * Stage 2 — the "Analyzing…" screen. Purely visual; the real analysis runs
 * in App via api/analysis.analyzeDeck(). App advances to the email stage when
 * the request resolves (and at least the animation minimum has elapsed).
 */
export default function AnalyzingStage() {
  return (
    <section className="analyzing">
      <div className="analyzing__spinner" aria-hidden="true" />
      <h2 className="analyzing__title">Analyzing your deck…</h2>
      <p className="analyzing__sub">
        This usually takes under a minute. Hang tight.
      </p>

      <div className="analyzing__track">
        <div className="analyzing__fill" />
      </div>

      <div className="analyzing__list">
        {ANALYZING_STEPS.map((line, i) => (
          <div
            className="analyzing__item"
            key={line}
            style={{ animationDelay: STEP_DELAYS[i] }}
          >
            <span>✓</span>
            {line}
          </div>
        ))}
      </div>
    </section>
  )
}

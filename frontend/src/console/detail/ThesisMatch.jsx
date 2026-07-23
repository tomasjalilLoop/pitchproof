// Thesis-match panel. Match % and rationale are placeholders until the backend
// computes a real thesis match (see mapping.js deriveMatch / deriveMatchReason).
export default function ThesisMatch({ match, matchReason }) {
  return (
    <div className="thesis-panel">
      <div className="thesis-panel__head">
        <span className="thesis-panel__title">Thesis match</span>
        <span className="thesis-panel__pct">{match}%</span>
      </div>
      <p className="thesis-panel__reason">{matchReason}</p>
    </div>
  )
}

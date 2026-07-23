// Category score cards. For real decks these are the backend's vc_view.scores
// (relabeled); the note line is omitted when the backend gives none.
export default function CategoryScores({ categories }) {
  return (
    <>
      <h3 className="detail__h3">Category scores</h3>
      <div className="c-cat-grid">
        {categories.map((c) => (
          <div className="c-cat-card" key={c.label}>
            <div className="c-cat-card__head">
              <span className="c-cat-card__label">{c.label}</span>
              <span className="c-cat-card__score">{c.score}</span>
            </div>
            <div className="c-cat-card__track">
              <div className="c-cat-card__bar" style={{ width: c.pct }} />
            </div>
            {c.note && <p className="c-cat-card__note">{c.note}</p>}
          </div>
        ))}
      </div>
    </>
  )
}

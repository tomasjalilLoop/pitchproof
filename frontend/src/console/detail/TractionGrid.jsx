// Traction KPI grid (4 cards). Values come from the backend's extraccion.kpis
// for real decks, or the sample deck metrics.
export default function TractionGrid({ traction }) {
  return (
    <div className="traction-grid">
      {traction.map((t, i) => (
        <div className="traction-card" key={`${t.label}-${i}`}>
          <div className="traction-card__label">{t.label}</div>
          <div className="traction-card__value">{t.value}</div>
          <div className="traction-card__sub">{t.sub}</div>
        </div>
      ))}
    </div>
  )
}

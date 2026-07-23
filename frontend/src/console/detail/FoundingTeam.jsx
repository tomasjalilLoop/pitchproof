// Founding team card. Real decks have no structured founder list yet — only a
// free-text team summary (extraccion.team.resumen) — so we show that as a
// fallback. TOMI: add structured founders (name/role/LinkedIn) to light this up.
export default function FoundingTeam({ founders, teamNote }) {
  return (
    <div className="team-panel">
      <h3 className="team-panel__title">Founding team</h3>
      {founders.length > 0 ? (
        <div className="team-panel__list">
          {founders.map((p) => (
            <div className="founder" key={p.name}>
              <div className="founder__avatar" aria-hidden="true">
                {p.initials}
              </div>
              <div className="founder__info">
                <div className="founder__name">{p.name}</div>
                <div className="founder__role">
                  {p.role} · {p.detail}
                </div>
              </div>
              <a
                className="founder__link"
                href={p.url}
                target="_blank"
                rel="noreferrer"
              >
                in ↗
              </a>
            </div>
          ))}
        </div>
      ) : (
        <p className="team-note">
          {teamNote || 'No structured founder details available for this deck yet.'}
        </p>
      )}
    </div>
  )
}

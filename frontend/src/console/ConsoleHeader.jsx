import { PARTNER, partnerInitials } from './config.js'

// Persistent header for both console views. Partner identity comes from
// config.js (auth stub).
export default function ConsoleHeader() {
  return (
    <header className="c-header">
      <div className="c-brand">
        <div className="c-brand__avatar" aria-hidden="true">
          P
        </div>
        <span className="c-brand__word">Pitch Proof</span>
        <span className="c-pill">Partner console</span>
      </div>
      <div className="c-user">
        <div className="c-user__text">
          <div className="c-user__name">{PARTNER.name}</div>
          <div className="c-user__firm">{PARTNER.firm}</div>
        </div>
        <div className="c-user__avatar" aria-hidden="true">
          {partnerInitials()}
        </div>
      </div>
    </header>
  )
}

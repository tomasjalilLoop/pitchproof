import { VC_ROW_FIRMS } from '../../content.js'

// "Selected decks are shared with" firm row (form stage only).
export default function VcRow() {
  return (
    <section className="vc-row">
      <div className="vc-row__label">Selected decks are shared with</div>
      <div className="vc-row__firms">
        {VC_ROW_FIRMS.map((firm) => (
          <span key={firm}>{firm}</span>
        ))}
      </div>
    </section>
  )
}

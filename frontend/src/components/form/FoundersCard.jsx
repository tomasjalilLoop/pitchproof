import { FOUNDER_ROLES } from '../../content.js'

/**
 * Optional founding-team card. Repeatable rows of {role, url}. The remove
 * button is disabled when only one row remains.
 *
 * @param {Object} props
 * @param {Array<{role:string,url:string}>} props.founders
 * @param {(i:number, field:'role'|'url', value:string) => void} props.onChange
 * @param {() => void} props.onAdd
 * @param {(i:number) => void} props.onRemove
 */
export default function FoundersCard({ founders, onChange, onAdd, onRemove }) {
  const filled = founders.filter((f) => f.url.trim()).length
  const single = founders.length === 1
  const addedLabel =
    filled === 1 ? '1 founder added' : `${filled} founders added`

  return (
    <div className="team-card">
      <div className="team-card__head">
        <div className="team-card__title-wrap">
          <span className="team-card__title">Add your founding team</span>
          <span className="chip">Optional</span>
        </div>
        {filled > 0 && <span className="team-card__added">✓ {addedLabel}</span>}
      </div>

      <p className="team-card__help">
        Add each founder's role and LinkedIn URL and we'll factor team strength
        into your feedback.
      </p>

      <div className="team-card__rows">
        {founders.map((f, i) => (
          <div className="founder-row" key={i}>
            <select
              className="founder-row__select"
              value={f.role}
              onChange={(e) => onChange(i, 'role', e.target.value)}
              aria-label={`Founder ${i + 1} role`}
            >
              {FOUNDER_ROLES.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>

            <input
              className="founder-row__url"
              type="url"
              value={f.url}
              onChange={(e) => onChange(i, 'url', e.target.value)}
              placeholder="https://linkedin.com/in/…"
              aria-label={`Founder ${i + 1} LinkedIn URL`}
            />

            <button
              type="button"
              className="founder-row__remove"
              onClick={() => onRemove(i)}
              disabled={single}
              title="Remove"
              aria-label={`Remove founder ${i + 1}`}
            >
              ×
            </button>
          </div>
        ))}
      </div>

      <button type="button" className="btn-text team-card__add" onClick={onAdd}>
        + Add another founder
      </button>
    </div>
  )
}

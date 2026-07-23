/**
 * Row of filter chips. `variant` drives the active color (status = ink,
 * stage = accent) via CSS.
 *
 * @param {Object} props
 * @param {{val:string,label:string}[]} props.options
 * @param {string} props.active
 * @param {(val:string) => void} props.onSelect
 * @param {'status'|'stage'} props.variant
 * @param {string} [props.label]  optional leading label (e.g. "Stage")
 */
export default function FilterChips({ options, active, onSelect, variant, label }) {
  return (
    <div className={variant === 'stage' ? 'queue__stagerow' : 'chips'}>
      {label && <span className="queue__stagelabel">{label}</span>}
      {options.map((o) => (
        <button
          key={o.val}
          type="button"
          className={`chip-btn chip-btn--${variant}${active === o.val ? ' is-active' : ''}`}
          onClick={() => onSelect(o.val)}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

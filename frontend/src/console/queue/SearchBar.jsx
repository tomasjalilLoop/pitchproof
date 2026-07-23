// Company/sector search input with a leading magnifier glyph.
export default function SearchBar({ value, onChange }) {
  return (
    <div className="search">
      <span className="search__icon" aria-hidden="true">
        ⌕
      </span>
      <input
        className="search__input"
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search company…"
        aria-label="Search company or sector"
      />
    </div>
  )
}

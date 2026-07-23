import DeckRow from './DeckRow.jsx'
import { caret } from '../viewmodel.js'

// Sortable table header columns. `key: null` = not sortable.
const COLUMNS = [
  { key: 'company', label: 'Company' },
  { key: null, label: 'Stage / Sector' },
  { key: 'score', label: 'Score' },
  { key: 'match', label: 'Thesis match' },
  { key: 'ask', label: 'Raise' },
  { key: 'submitted', label: 'Submitted' },
  { key: null, label: 'Status' },
]

/**
 * @param {Object} props
 * @param {object[]} props.rows       display rows (viewmodel.toRow)
 * @param {{key:string,dir:string}} props.sort
 * @param {(key:string) => void} props.onSort
 * @param {(id:string) => void} props.onOpenDeck
 * @param {() => void} props.onClearFilters
 */
export default function DeckTable({ rows, sort, onSort, onOpenDeck, onClearFilters }) {
  return (
    <div className="deck-table">
      <div className="deck-table__head">
        {COLUMNS.map((col, i) =>
          col.key ? (
            <button
              key={col.key}
              type="button"
              className="deck-table__sort"
              onClick={() => onSort(col.key)}
            >
              {col.label} {caret(sort.key, sort.dir, col.key)}
            </button>
          ) : (
            <span key={`static-${i}`}>{col.label}</span>
          ),
        )}
      </div>

      {rows.length > 0 ? (
        rows.map((row) => <DeckRow key={row.id} row={row} onOpen={onOpenDeck} />)
      ) : (
        <div className="deck-table__empty">
          No decks match these filters.{' '}
          <button type="button" className="btn-text" onClick={onClearFilters}>
            Clear filters
          </button>
        </div>
      )}
    </div>
  )
}

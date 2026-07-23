import { PARTNER } from './config.js'
import { STATUS_KEYS, STAGES, statusToken } from './status.js'
import { effectiveStatus } from './api/decks.js'
import { toRow } from './viewmodel.js'
import KpiStrip from './queue/KpiStrip.jsx'
import SearchBar from './queue/SearchBar.jsx'
import FilterChips from './queue/FilterChips.jsx'
import DeckTable from './queue/DeckTable.jsx'

/**
 * Queue view: KPI strip + filter controls + sortable deck table.
 * Filter/sort state lives in the parent (survives navigation to detail and back).
 */
export default function QueueView({
  decks,
  overrides,
  sample,
  search,
  onSearch,
  stage,
  onStage,
  status,
  onStatus,
  sort,
  onSort,
  onClearFilters,
  onOpenDeck,
}) {
  const eff = (deck) => effectiveStatus(deck, overrides)

  // --- Summary KPIs -------------------------------------------------------
  const avg = decks.length
    ? Math.round(decks.reduce((a, d) => a + d.score, 0) / decks.length)
    : 0
  const newCount = decks.filter((d) => eff(d) === 'New').length
  const awaiting = decks.filter((d) => ['New', 'Reviewing'].includes(eff(d))).length
  const meetings = decks.filter((d) => eff(d) === 'Meeting').length
  const stats = [
    { label: 'New this week', value: String(newCount), unit: 'decks', sub: 'Awaiting first look', accent: true },
    { label: 'Avg thesis score', value: String(avg), unit: '/100', sub: 'Across matched decks' },
    { label: 'Awaiting review', value: String(awaiting), unit: 'open', sub: 'New + in review' },
    { label: 'Meetings booked', value: String(meetings), unit: 'this month', sub: 'Advanced to intro', accent: true },
  ]

  // --- Filter + sort ------------------------------------------------------
  const q = search.trim().toLowerCase()
  let filtered = decks.filter(
    (d) =>
      (!q || d.name.toLowerCase().includes(q) || d.sector.toLowerCase().includes(q)) &&
      (stage === 'All' || d.stage === stage) &&
      (status === 'All' || eff(d) === status),
  )

  const dir = sort.dir === 'desc' ? -1 : 1
  filtered = filtered.slice().sort((a, b) => {
    if (sort.key === 'company') {
      const av = a.name.toLowerCase()
      const bv = b.name.toLowerCase()
      return av < bv ? dir : av > bv ? -dir : 0
    }
    let av
    let bv
    if (sort.key === 'ask') {
      av = a.askNum
      bv = b.askNum
    } else if (sort.key === 'submitted') {
      av = -a.days
      bv = -b.days
    } else {
      av = a[sort.key]
      bv = b[sort.key]
    }
    return (av - bv) * dir
  })

  const rows = filtered.map((d) => toRow(d, eff(d), PARTNER.accent))

  // --- Chips --------------------------------------------------------------
  const stageOptions = STAGES.map((v) => ({ val: v, label: v }))
  const statusOptions = [
    { val: 'All', label: 'All' },
    ...STATUS_KEYS.map((v) => ({ val: v, label: statusToken(v).label })),
  ]

  return (
    <div className="queue">
      <div className="queue__titlerow">
        <div className="queue__titleblock">
          <div className="queue__eyebrow">
            <span className="queue__eyebrow-dot" />
            Matched to your thesis
          </div>
          <h1 className="queue__h1">Deck review queue</h1>
        </div>
        <p className="queue__subtitle">
          {decks.length} decks matched to {PARTNER.firm} by stage, sector and check size.
        </p>
      </div>

      {sample && (
        <div className="sample-banner">
          <span aria-hidden="true">●</span> Sample data — the backend has no analyses
          yet, so these are placeholder decks.
        </div>
      )}

      <KpiStrip stats={stats} />

      <div className="queue__controls">
        <SearchBar value={search} onChange={onSearch} />
        <FilterChips options={statusOptions} active={status} onSelect={onStatus} variant="status" />
      </div>

      <FilterChips
        options={stageOptions}
        active={stage}
        onSelect={onStage}
        variant="stage"
        label="Stage"
      />

      <DeckTable
        rows={rows}
        sort={sort}
        onSort={onSort}
        onOpenDeck={onOpenDeck}
        onClearFilters={onClearFilters}
      />

      <div className="queue__footer">
        Showing {rows.length} of {decks.length} matched decks · click any row to open the
        full review
      </div>
    </div>
  )
}

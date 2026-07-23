import { useEffect, useState } from 'react'
import { PARTNER } from '../console/config.js'
import {
  listDecks,
  getDeck,
  getStatusOverrides,
  setStatusOverride,
  effectiveStatus,
} from '../console/api/decks.js'
import ConsoleHeader from '../console/ConsoleHeader.jsx'
import ConsoleFooter from '../console/ConsoleFooter.jsx'
import QueueView from '../console/QueueView.jsx'
import DetailView from '../console/DetailView.jsx'
import '../styles/console.css'

const DEFAULT_SORT = { key: 'match', dir: 'desc' }

export default function Console() {
  // Data
  const [decks, setDecks] = useState([])
  const [sample, setSample] = useState(false)
  const [loading, setLoading] = useState(true)
  const [overrides, setOverrides] = useState({})

  // Navigation
  const [view, setView] = useState('pipeline') // "pipeline" | "detail"
  const [selected, setSelected] = useState(null)
  const [detailDeck, setDetailDeck] = useState(null)
  const [detailLoading, setDetailLoading] = useState(false)

  // Queue filter/sort state (kept here so it survives navigation to detail)
  const [search, setSearch] = useState('')
  const [stage, setStage] = useState('All')
  const [status, setStatus] = useState('All')
  const [sort, setSort] = useState(DEFAULT_SORT)

  // Load the deck list + persisted status overrides once.
  useEffect(() => {
    let alive = true
    setOverrides(getStatusOverrides())
    listDecks().then(({ decks: d, sample: s }) => {
      if (!alive) return
      setDecks(d)
      setSample(s)
      setLoading(false)
    })
    return () => {
      alive = false
    }
  }, [])

  // --- Handlers -----------------------------------------------------------
  const openDeck = (id) => {
    setSelected(id)
    setView('detail')
    setDetailDeck(null)
    setDetailLoading(true)
    window.scrollTo(0, 0)
    getDeck(id).then(({ deck }) => {
      setDetailDeck(deck)
      setDetailLoading(false)
    })
  }

  const backToQueue = () => {
    setView('pipeline')
    setSelected(null)
    window.scrollTo(0, 0)
  }

  const onSort = (key) => {
    setSort((prev) =>
      prev.key === key
        ? { key, dir: prev.dir === 'desc' ? 'asc' : 'desc' }
        : { key, dir: key === 'company' ? 'asc' : 'desc' },
    )
  }

  const clearFilters = () => {
    setSearch('')
    setStage('All')
    setStatus('All')
  }

  const setDeckStatus = (newStatus) => {
    if (!selected) return
    setOverrides(setStatusOverride(selected, newStatus))
  }

  return (
    <div className="console" style={{ '--c-accent': PARTNER.accent }}>
      <ConsoleHeader />

      {loading ? (
        <div className="console-state">Loading matched decks…</div>
      ) : view === 'pipeline' ? (
        <QueueView
          decks={decks}
          overrides={overrides}
          sample={sample}
          search={search}
          onSearch={setSearch}
          stage={stage}
          onStage={setStage}
          status={status}
          onStatus={setStatus}
          sort={sort}
          onSort={onSort}
          onClearFilters={clearFilters}
          onOpenDeck={openDeck}
        />
      ) : detailLoading ? (
        <div className="console-state">Loading review…</div>
      ) : detailDeck ? (
        <DetailView
          deck={detailDeck}
          status={effectiveStatus(detailDeck, overrides)}
          onBack={backToQueue}
          onSetStatus={setDeckStatus}
        />
      ) : (
        <div className="console-state">This deck could not be loaded.</div>
      )}

      <ConsoleFooter />
    </div>
  )
}

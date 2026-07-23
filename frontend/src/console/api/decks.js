// ============================================================================
// Deck data facade for the partner console.
// ----------------------------------------------------------------------------
// Partial real wiring: fetches decks from Tomi's backend and fills the gaps
// (see mapping.js). If the backend is unreachable, returns 503 (no DATABASE_URL),
// or yields an empty list, it falls back to the mock sample decks so the console
// stays reviewable. Callers get a `sample` flag to surface that in the UI.
//
// Status se persiste server-side vía PATCH /analyses/:id/status. localStorage
// se mantiene como cache optimista/offline (y para el modo sample con mocks).
// ============================================================================

import { API_BASE_URL, PARTNER } from '../config.js'
import { MOCK_DECKS } from './mockDecks.js'
import { mapAnalysisSummary, mapAnalysisDetail } from './mapping.js'

const OVERRIDES_KEY = 'pp-console-status-overrides'

async function apiGet(path) {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    headers: { Accept: 'application/json' },
  })
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`)
  return res.json()
}

/**
 * List matched decks for the queue.
 * @returns {Promise<{ decks: object[], sample: boolean }>}
 */
export async function listDecks() {
  try {
    const data = await apiGet('/analyses')
    const rows = data?.analyses || []
    if (!rows.length) return { decks: MOCK_DECKS, sample: true } // empty backend → sample
    return {
      decks: rows.map((r) => mapAnalysisSummary(r, { firm: PARTNER.firm })),
      sample: false,
    }
  } catch {
    // Backend down / 503 (no DATABASE_URL) / network error → sample data.
    return { decks: MOCK_DECKS, sample: true }
  }
}

/**
 * Fetch one deck's full detail.
 * @returns {Promise<{ deck: object|null, sample: boolean }>}
 */
export async function getDeck(id) {
  try {
    const row = await apiGet(`/analyses/${encodeURIComponent(id)}`)
    return { deck: mapAnalysisDetail(row, { firm: PARTNER.firm }), sample: false }
  } catch {
    // Fallback: a mock deck with this id (sample mode uses mock ids).
    const deck = MOCK_DECKS.find((d) => d.id === id) || null
    return { deck, sample: !!deck }
  }
}

// ---- Status overrides (localStorage) --------------------------------------

export function getStatusOverrides() {
  try {
    return JSON.parse(localStorage.getItem(OVERRIDES_KEY)) || {}
  } catch {
    return {}
  }
}

export function setStatusOverride(id, status) {
  const next = { ...getStatusOverrides(), [id]: status }
  try {
    localStorage.setItem(OVERRIDES_KEY, JSON.stringify(next))
  } catch {
    /* ignore quota/availability errors — status just won't persist locally */
  }
  // Persistencia real en el backend (best-effort). Si falla (offline, modo
  // sample con id mock, 404), el override local igual mantiene la UI coherente.
  persistStatus(id, status)
  return next
}

/** PATCH best-effort del status al backend. No lanza. */
async function persistStatus(id, status) {
  try {
    const res = await fetch(`${API_BASE_URL}/analyses/${encodeURIComponent(id)}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ status }),
    })
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`)
  } catch (err) {
    // eslint-disable-next-line no-console
    console.info('[console] status no persistido en backend (queda local):', err.message)
  }
}

/** Effective status = override ?? the deck's original status. */
export function effectiveStatus(deck, overrides) {
  return overrides[deck.id] || deck.status
}

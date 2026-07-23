// ============================================================================
// Backend → dashboard field mapping
// ----------------------------------------------------------------------------
// 👋 TOMI — this file bridges your backend response to what the console renders.
//
// Your backend today stores/returns (per lib/db.js + lib/openai.js):
//   list  GET /analyses      → { id, created_at, filename, vertical, score_vc, score_founder }
//   full  GET /analyses/:id  → + slide_count, extraccion, vc_view, founder_view
//
// The dashboard needs several fields the backend does NOT produce yet. Those are
// marked [MOCK] / [DERIVED] below with exactly what you'd need to add server-side
// to make them real. Everything marked [REAL] already comes from your response.
// ============================================================================

// ---- Derive helpers --------------------------------------------------------

/** [DERIVED] Company name — backend has no company name, only the deck filename. */
export function companyNameFromFilename(filename) {
  if (!filename) return 'Untitled deck'
  return filename.replace(/\.[^.]+$/, '').replace(/[_-]+/g, ' ').trim() || 'Untitled deck'
}

/** [REAL] Relative "submitted" label from created_at. */
export function daysSince(createdAt) {
  if (!createdAt) return 0
  const ms = Date.now() - new Date(createdAt).getTime()
  return Math.max(0, Math.floor(ms / 86_400_000))
}

// [MOCK] Backend stores no funding stage. Deterministic placeholder from the id
// so the Stage filter has something to work with. TODO(tomi): add a `stage` column.
const STAGE_POOL = ['Pre-seed', 'Seed', 'Series A']
export function deriveStage(id = '') {
  let h = 0
  for (let i = 0; i < id.length; i++) h = (h + id.charCodeAt(i)) % STAGE_POOL.length
  return STAGE_POOL[h]
}

// [MOCK] Backend computes no thesis-match score. Placeholder derived from the
// overall score. TODO(tomi): compute real match vs the firm's thesis and return it.
export function deriveMatch(score = 0) {
  return Math.max(40, Math.min(97, Math.round(score) + 6))
}

// [MOCK] Backend stores no raise amount. TODO(tomi): add an `ask` / `raise` field.
export function deriveRaise() {
  return { ask: '—', askNum: 0 }
}

// [MOCK] Backend stores no per-firm rationale. Generic placeholder.
// TODO(tomi): return a real thesis-match rationale from the matching step.
export function deriveMatchReason(firm, sector) {
  return `Matched to ${firm} on ${sector || 'sector'} fit. (Placeholder — the real thesis-match rationale is not produced by the backend yet.)`
}

// [REAL] Traction cards from extraccion.kpis[{ nombre, valor, verificable }].
function kpisToTraction(kpis = []) {
  const cards = kpis.slice(0, 4).map((k) => ({
    label: k.nombre || 'KPI',
    value: k.valor || '—',
    sub: k.verificable ? 'Verifiable in deck' : 'Unverified claim',
  }))
  // Pad to 4 so the grid stays even.
  while (cards.length < 4) cards.push({ label: '—', value: '—', sub: 'Not in deck' })
  return cards
}

// [REAL] Category scores from vc_view.scores (0–10 → 0–100), relabeled to the
// dimensions your model actually returns (NOT the handoff's Narrative/Market/…).
const VC_SCORE_LABELS = [
  ['team_market_fit', 'Team-Market Fit'],
  ['evidencia_pmf', 'Evidence of PMF'],
  ['realismo_tam', 'TAM Realism'],
  ['unit_economics', 'Unit Economics'],
  ['defensibilidad', 'Defensibility'],
]
function scoresToCats(scores = {}) {
  return VC_SCORE_LABELS.map(([key, label]) => {
    const s10 = Number(scores?.[key] ?? 0)
    return [label, Math.round(s10 * 10), ''] // note is empty — backend gives none per-dimension
  })
}

// ---- Public mappers --------------------------------------------------------

/**
 * Map a lightweight `GET /analyses` row → partial deck (enough for the queue table).
 * Detail fields are filled in later by mapAnalysisDetail via getDeck().
 */
export function mapAnalysisSummary(row, { firm }) {
  const score = Number(row.score_vc ?? 0)
  const { ask, askNum } = deriveRaise()
  return {
    id: row.id,
    name: companyNameFromFilename(row.filename), // [DERIVED]
    tagline: '', // [MOCK] not in list payload
    stage: deriveStage(row.id), // [MOCK]
    sector: row.vertical || '—', // [REAL]
    score, // [REAL]
    match: deriveMatch(score), // [MOCK]
    ask, // [MOCK]
    askNum, // [MOCK]
    days: daysSince(row.created_at), // [REAL]
    status: 'New', // [MOCK] no backend status; override lives in localStorage
    sample: false,
    // Detail-only fields left empty until getDeck() fetches the full row:
    traction: [], cats: [], strengths: [], fixes: [], matchReason: '', founders: [], teamNote: '', slides: [],
  }
}

/**
 * Map a full `GET /analyses/:id` row → complete deck for the detail view.
 */
export function mapAnalysisDetail(row, { firm }) {
  const extraccion = row.extraccion || {}
  const vc = row.vc_view || {}
  const founder = row.founder_view || {}
  const score = Number(vc.score_general ?? row.score_vc ?? 0)
  const sector = extraccion.vertical || row.vertical || '—'
  const { ask, askNum } = deriveRaise()

  return {
    id: row.id,
    name: companyNameFromFilename(row.filename), // [DERIVED]
    tagline: extraccion.modelo_negocio || '', // [REAL-ish] business model as a one-liner
    stage: deriveStage(row.id), // [MOCK]
    sector, // [REAL]
    score, // [REAL]
    match: deriveMatch(score), // [MOCK]
    ask, // [MOCK]
    askNum, // [MOCK]
    days: daysSince(row.created_at), // [REAL]
    status: 'New', // [MOCK] override in localStorage
    traction: kpisToTraction(extraccion.kpis), // [REAL]
    cats: scoresToCats(vc.scores), // [REAL] (relabeled)
    strengths: founder.fortalezas || [], // [REAL]
    fixes: vc.red_flags || [], // [REAL]
    matchReason: deriveMatchReason(firm, sector), // [MOCK]
    founders: [], // [MOCK] backend has no structured founder list…
    teamNote: extraccion.team?.resumen || '', // …only this free-text team summary [REAL]
    slides: Array.from({ length: row.slide_count || 0 }, () => ''), // [REAL count] no titles
    sample: false,
  }
}

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

/** Iniciales para el avatar del founder. */
function initialsFromName(name = '') {
  const parts = String(name).trim().split(/\s+/)
  return ((parts[0] || '')[0] || '') + ((parts[1] || '')[0] || '')
}

// [REAL] Founding team desde los perfiles de LinkedIn scrapeados (team_profiles).
// Shape que consume FoundingTeam.jsx: { name, initials, role, detail, url }.
export function foundersFromProfiles(profiles = []) {
  return (Array.isArray(profiles) ? profiles : []).map((p) => {
    const top = (p.experience && p.experience[0]) || null
    return {
      name: p.name || 'Founder',
      initials: initialsFromName(p.name).toUpperCase() || 'F',
      role: p.role || (top && top.role) || '—',
      detail: p.headline || (top ? `${top.role} @ ${top.company}` : p.location || ''),
      url: p.url || '',
    }
  })
}

/** [REAL] Relative "submitted" label from created_at. */
export function daysSince(createdAt) {
  if (!createdAt) return 0
  const ms = Date.now() - new Date(createdAt).getTime()
  return Math.max(0, Math.floor(ms / 86_400_000))
}

// [REAL] Funding stage. El backend ahora infiere `etapa` en la extracción
// (pre-seed/seed/serie A/B+). Lo mapeamos al vocabulario del console. Si no hay
// señal, caemos al placeholder determinístico para que el filtro Stage funcione.
const STAGE_POOL = ['Pre-seed', 'Seed', 'Series A']
const ETAPA_TO_STAGE = {
  'pre-seed': 'Pre-seed',
  seed: 'Seed',
  'serie A': 'Series A',
  'serie B+': 'Series A', // el console no tiene B+; lo agrupamos en Series A
}
export function deriveStage(id = '') {
  let h = 0
  for (let i = 0; i < id.length; i++) h = (h + id.charCodeAt(i)) % STAGE_POOL.length
  return STAGE_POOL[h]
}
/** [REAL] etapa del backend -> label del console; fallback determinístico. */
export function stageFromEtapa(etapa, id = '') {
  return ETAPA_TO_STAGE[(etapa || '').trim()] || deriveStage(id)
}

// [MOCK] Backend computes no thesis-match score. Placeholder derived from the
// overall score. TODO(tomi): compute real match vs the firm's thesis and return it.
export function deriveMatch(score = 0) {
  return Math.max(40, Math.min(97, Math.round(score) + 6))
}

// [REAL] Monto del ask. El backend ahora extrae `extraccion.ask` (string, ej
// "US$500K", "$2.5M"). Parseamos askNum en millones para poder ordenar/filtrar.
export function parseAsk(askStr) {
  if (!askStr || /no especificado/i.test(askStr)) return { ask: '—', askNum: 0 }
  const m = String(askStr).replace(/[,\s]/g, '').match(/([\d.]+)\s*([mMkK])?/)
  let askNum = 0
  if (m) {
    let n = parseFloat(m[1])
    const unit = (m[2] || '').toLowerCase()
    if (unit === 'k') n = n / 1000 // a millones
    askNum = Number.isFinite(n) ? n : 0
  }
  return { ask: askStr, askNum }
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
  const { ask, askNum } = parseAsk(row.ask) // [REAL] via extraccion->>'ask'
  return {
    id: row.id,
    name: companyNameFromFilename(row.filename), // [DERIVED]
    tagline: '', // [MOCK] not in list payload
    stage: stageFromEtapa(row.etapa, row.id), // [REAL] via extraccion->>'etapa'
    sector: row.vertical || '—', // [REAL]
    score, // [REAL]
    match: deriveMatch(score), // [MOCK]
    ask, // [REAL]
    askNum, // [REAL]
    days: daysSince(row.created_at), // [REAL]
    status: row.status || 'New', // [REAL] status persistido en el backend
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
  const { ask, askNum } = parseAsk(extraccion.ask) // [REAL]

  return {
    id: row.id,
    name: companyNameFromFilename(row.filename), // [DERIVED]
    tagline: extraccion.modelo_negocio || '', // [REAL-ish] business model as a one-liner
    stage: stageFromEtapa(extraccion.etapa, row.id), // [REAL]
    sector, // [REAL]
    score, // [REAL]
    match: deriveMatch(score), // [MOCK]
    ask, // [REAL]
    askNum, // [REAL]
    days: daysSince(row.created_at), // [REAL]
    status: row.status || 'New', // [REAL] persistido en el backend
    traction: kpisToTraction(extraccion.kpis), // [REAL]
    cats: scoresToCats(vc.scores), // [REAL] (relabeled)
    strengths: founder.fortalezas || [], // [REAL]
    fixes: vc.red_flags || [], // [REAL]
    matchReason: deriveMatchReason(firm, sector), // [MOCK]
    founders: foundersFromProfiles(row.team_profiles), // [REAL] LinkedIn scrapeado vía Apify
    teamNote: extraccion.team?.resumen || '', // fallback: resumen de equipo del deck [REAL]
    slides: Array.from({ length: row.slide_count || 0 }, () => ''), // [REAL count] no titles
    sample: false,
  }
}

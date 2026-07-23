// ============================================================================
// Deck analysis API layer
// ----------------------------------------------------------------------------
// Capa de integración con el backend de PitchProof.
//
// `analyzeDeck()` sube el deck al backend (POST /analyze), que extrae el texto,
// llama a OpenAI (server-side, la key vive SOLO en el backend) y devuelve
// { extraccion, vc_view, founder_view }. Acá lo MAPEAMOS a la forma
// `AnalysisResult` que consume la UI actual, así ningún componente cambia.
//
// Cuando el back cambie o lleguen las views nuevas (VC / startup), se ajusta
// el mapeo acá — los componentes siguen leyendo `AnalysisResult`.
//
// Base URL del backend: VITE_API_BASE_URL (ej https://pitchproof-production.up.railway.app).
// Vacío = mismo origen.
// ============================================================================

const API_BASE = (import.meta.env?.VITE_API_BASE_URL || '').replace(/\/$/, '')

/**
 * @typedef {Object} Category
 * @property {string} label
 * @property {string} score  numeric string, or "—" when not scored
 * @property {string} pct    CSS width for the bar, e.g. "82%"
 * @property {string} note   one-line explanation
 *
 * @typedef {Object} VcMatch
 * @property {string} firm
 * @property {string} thesis
 *
 * @typedef {Object} AnalysisResult
 * @property {number}      score
 * @property {string}      verdict
 * @property {Category[]}  categories
 * @property {string[]}    working
 * @property {string[]}    fixes
 * @property {string}      matchTitle
 * @property {string}      matchTier
 * @property {string}      matchBlurb
 * @property {VcMatch[]}   matches
 */

/**
 * Analiza un pitch deck contra el backend real.
 *
 * @param {Object}   args
 * @param {File}     args.file      el deck subido (.pptx o .pdf)
 * @param {Array<{role:string,url:string}>} args.founders
 * @returns {Promise<AnalysisResult>}
 */
export async function analyzeDeck({ file, founders }) {
  const form = new FormData()
  form.append('deck', file)
  // El backend hoy ignora founders, pero lo mandamos para cuando lo use.
  form.append('founders', JSON.stringify(founders || []))

  const res = await fetch(`${API_BASE}/analyze`, { method: 'POST', body: form })
  if (!res.ok) {
    let detail = ''
    try {
      detail = (await res.json())?.error || ''
    } catch {
      /* respuesta no-JSON */
    }
    throw new Error(`Analysis failed: ${res.status}${detail ? ` — ${detail}` : ''}`)
  }

  const data = await res.json()
  return toAnalysisResult(data)
}

/**
 * Persist the lead's email. TODO: endpoint de leads en el backend. No-op.
 */
export async function submitLead({ email, result }) {
  // eslint-disable-next-line no-console
  console.info('[stub] submitLead — falta endpoint en el backend', { email, score: result?.score })
  return { ok: true }
}

/**
 * Submit the deck to matched firms. TODO: endpoint real. No-op.
 */
export async function submitToFirms({ file, email, matches }) {
  // eslint-disable-next-line no-console
  console.info('[stub] submitToFirms — falta endpoint en el backend', {
    email,
    firms: matches?.map((m) => m.firm),
  })
  return { ok: true }
}

// ----------------------------------------------------------------------------
// Mapeo backend -> AnalysisResult
// ----------------------------------------------------------------------------

const CATEGORY_LABELS = {
  team_market_fit: 'Team-Market Fit',
  evidencia_pmf: 'Evidencia PMF',
  realismo_tam: 'Realismo TAM',
  unit_economics: 'Unit Economics',
  defensibilidad: 'Defensibilidad',
}

// Nota corta derivada del score 0-10 de cada categoría.
function noteForScore(n) {
  if (n >= 8) return 'Muy sólido.'
  if (n >= 6) return 'Bien, con margen de mejora.'
  if (n >= 4) return 'Aceptable, conviene reforzarlo.'
  return 'Punto débil — priorizá esto.'
}

function clamp100(n) {
  const v = Number(n)
  if (!Number.isFinite(v)) return 0
  return Math.max(0, Math.min(100, Math.round(v)))
}

/** Mapea { extraccion, vc_view, founder_view } -> AnalysisResult. */
function toAnalysisResult(data) {
  const extraccion = data?.extraccion || {}
  const vc = data?.vc_view || {}
  const founder = data?.founder_view || {}
  const scores = vc.scores || {}

  const score = clamp100(vc.score_general)

  const categories = Object.keys(CATEGORY_LABELS).map((key) => {
    const raw = Number(scores[key])
    const has = Number.isFinite(raw)
    const pct = has ? Math.max(0, Math.min(10, raw)) * 10 : 0
    return {
      label: CATEGORY_LABELS[key],
      score: has ? String(Math.round(raw)) : '—',
      pct: `${pct}%`,
      note: has ? noteForScore(raw) : 'Sin señal suficiente en el deck.',
    }
  })

  const working = arr(founder.fortalezas)
  // "Fix these first": priorizamos lo accionable del founder; si no hay, red flags del VC.
  const fixes = arr(founder.areas_a_mejorar).length
    ? arr(founder.areas_a_mejorar)
    : arr(vc.red_flags)

  const verdict =
    founder.resumen_constructivo || vc.resumen_duro || 'Análisis del deck completado.'

  const match = buildMatch(extraccion.etapa, score)

  return { score, verdict, categories, working, fixes, ...match }
}

function arr(x) {
  return Array.isArray(x) ? x.filter((s) => typeof s === 'string' && s.trim()) : []
}

// ----------------------------------------------------------------------------
// VC matching por etapa (datos de fondos ficticios pero coherentes)
// ----------------------------------------------------------------------------

const STAGE_ORDER = ['pre-seed', 'seed', 'serie A', 'serie B+']

// Cada fondo tiene una etapa objetivo (no es matching real, es para el demo).
const FUNDS = [
  { firm: 'Khosla Ventures', stage: 'pre-seed', thesis: 'Deep tech en etapa muy temprana' },
  { firm: 'Myriad', stage: 'seed', thesis: 'Equipos capital-efficient con primeros clientes' },
  { firm: 'Anthos Capital', stage: 'seed', thesis: 'Consumer y SaaS incipiente' },
  { firm: 'Greylock', stage: 'serie A', thesis: 'Product-market fit y crecimiento con métricas' },
  { firm: 'Emergence Capital', stage: 'serie B+', thesis: 'SaaS enterprise en escala' },
]

function tierForScore(score) {
  if (score >= 85) return 'Top 5%'
  if (score >= 75) return 'Top 15%'
  if (score >= 60) return 'Top 30%'
  return 'En desarrollo'
}

function buildMatch(etapa, score) {
  const known = STAGE_ORDER.includes(etapa)
  // Sin señal de etapa, usamos "seed" como centro para ordenar por cercanía.
  const anchorIdx = known ? STAGE_ORDER.indexOf(etapa) : STAGE_ORDER.indexOf('seed')

  const ranked = FUNDS.map((f) => ({
    ...f,
    dist: Math.abs(STAGE_ORDER.indexOf(f.stage) - anchorIdx),
  }))
    .sort((a, b) => a.dist - b.dist)
    .slice(0, 3)

  const matches = ranked.map((f, i) => ({
    firm: f.firm,
    thesis:
      i === 0 && known
        ? `${f.thesis} · Mejor fit para ${etapa}`
        : `${f.thesis} · ${f.stage}`,
  }))

  const matchTitle = known
    ? `Fondos que mejor matchean con una startup ${etapa}`
    : 'Fondos sugeridos por perfil'

  const matchBlurb = known
    ? `Tu deck luce como una startup ${etapa}. Estos fondos invierten en esa etapa; el primero es el que mejor encaja.`
    : 'No pudimos inferir la etapa con claridad desde el deck. Estos son los fondos con mejor encaje por perfil general.'

  return { matchTitle, matchTier: tierForScore(score), matchBlurb, matches }
}

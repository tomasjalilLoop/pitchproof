// ============================================================================
// Pure presentation helpers — turn a `deck` domain object into the display
// shapes the queue row and detail view render. No React, no side effects.
// ============================================================================

import { statusToken, SLIDE_TINTS } from './status.js'

/** Relative "submitted" label (matches the handoff). */
export function dayLabel(n) {
  if (n === 0) return 'Today'
  if (n === 1) return 'Yesterday'
  if (n < 7) return `${n}d ago`
  return `${Math.round(n / 7)}w ago`
}

/** Caret glyph for a sortable table header. */
export function caret(activeKey, dir, key) {
  if (activeKey !== key) return ''
  return dir === 'desc' ? '↓' : '↑'
}

/** deck → queue table row. `status` is the effective (override-aware) status. */
export function toRow(deck, status, accent) {
  const st = statusToken(status)
  return {
    id: deck.id,
    name: deck.name,
    tagline: deck.tagline,
    stage: deck.stage,
    sector: deck.sector,
    score: deck.score,
    scoreColor: accent,
    match: deck.match,
    ask: deck.ask,
    submittedLabel: dayLabel(deck.days),
    statusLabel: st.label,
    statusBg: st.bg,
    statusFg: st.fg,
  }
}

/** deck → detail view-model. */
export function toDetail(deck, status) {
  const st = statusToken(status)
  return {
    id: deck.id,
    name: deck.name,
    tagline: deck.tagline,
    stage: deck.stage,
    sector: deck.sector,
    ask: deck.ask,
    score: deck.score,
    match: deck.match,
    submittedLabel: dayLabel(deck.days),
    matchReason: deck.matchReason,
    statusLabel: st.label,
    statusBg: st.bg,
    statusFg: st.fg,
    traction: deck.traction,
    categories: deck.cats.map(([label, score, note]) => ({
      label,
      score: String(score),
      pct: `${score}%`,
      note,
    })),
    strengths: deck.strengths.map((text) => ({ text })),
    fixes: deck.fixes.map((text, i) => ({ n: String(i + 1), text })),
    founders: deck.founders,
    teamNote: deck.teamNote,
    slides: deck.slides.map((title, i) => ({
      n: String(i + 1),
      title,
      tint: SLIDE_TINTS[i % SLIDE_TINTS.length],
    })),
  }
}

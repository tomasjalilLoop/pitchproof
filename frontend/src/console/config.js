// ============================================================================
// Partner console config
// ----------------------------------------------------------------------------
// AUTH STUB: there is no login yet. The logged-in partner's identity is
// hardcoded here. When real auth lands, replace these with values from the
// authenticated session (e.g. a /me endpoint) — the console reads them only
// through this module, so nothing else needs to change.
// ============================================================================

export const PARTNER = {
  name: 'Sarah Chen',
  firm: 'Khosla Ventures',
  // Single accent used for scores, bars, links, primary buttons, match %.
  // Handoff swatch options: #1f6f4f, #1d4e6f, #7a3f6f, #a05a2c.
  accent: '#1f6f4f',
}

/** Initials for the header avatar, derived from the partner name. */
export function partnerInitials(name = PARTNER.name) {
  const parts = name.trim().split(/\s+/)
  return ((parts[0] || '')[0] || '') + ((parts[1] || '')[0] || '')
}

// Base URL of Tomi's backend. Empty → same-origin (dev proxy or reverse proxy).
// Set VITE_API_BASE_URL in .env.local to point at the deployed backend.
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || ''

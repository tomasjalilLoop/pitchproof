// ============================================================================
// Deck status system — shared by the queue table and the detail view.
// ============================================================================

// Ink & tints match the handoff's Status tokens exactly.
export const STATUS = {
  New: { label: 'New', bg: '#e5efe8', fg: '#1f6f4f' },
  Reviewing: { label: 'Reviewing', bg: '#f6ecd6', fg: '#b8862f' },
  Shortlisted: { label: 'Shortlisted', bg: '#e0ecdf', fg: '#1f6f4f' },
  Meeting: { label: 'Meeting booked', bg: '#1f6f4f', fg: '#f6f2e9' },
  Passed: { label: 'Passed', bg: 'rgba(32,29,24,.07)', fg: '#8a857b' },
}

// Order for the status filter chips ("All" is prepended in the UI).
export const STATUS_KEYS = ['New', 'Reviewing', 'Shortlisted', 'Meeting', 'Passed']

export const STAGES = ['All', 'Pre-seed', 'Seed', 'Series A']

// Rotating pastel tints for slide thumbnails (by index).
export const SLIDE_TINTS = [
  '#f0f6f1', '#f3efe4', '#eef3f4', '#f5eef0',
  '#eef1ec', '#f4f1e8', '#eef2f4', '#f2eff3',
]

/** Safe lookup — unknown status falls back to New styling. */
export function statusToken(key) {
  return STATUS[key] || STATUS.New
}

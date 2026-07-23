// ============================================================================
// Deck analysis API layer
// ----------------------------------------------------------------------------
// 👋 TOMI — THIS IS THE FILE TO WIRE UP THE OPENAI INTEGRATION.
//
// Right now `analyzeDeck()` returns MOCK data after a short delay so the UI
// flow works end-to-end. Everything the UI needs is described by the
// `AnalysisResult` shape below — as long as the real API returns that same
// shape, no component needs to change.
//
// SECURITY: never call OpenAI directly from the browser — the API key would
// be exposed to every visitor. Stand up a small backend endpoint (e.g.
// POST /api/analyze) that receives the file, calls OpenAI server-side with
// the key from process.env.OPENAI_API_KEY, and returns the JSON result.
// The browser only talks to *your* endpoint.
//
// Suggested real implementation (replace the mock body):
//
//   export async function analyzeDeck({ file, founders }) {
//     const form = new FormData()
//     form.append('deck', file)                       // the real File object
//     form.append('founders', JSON.stringify(founders))
//     const res = await fetch('/api/analyze', { method: 'POST', body: form })
//     if (!res.ok) throw new Error(`Analysis failed: ${res.status}`)
//     return await res.json()                         // must match AnalysisResult
//   }
//
// On the backend you'd: extract text/images from the deck (pdf/pptx/keynote),
// send them to OpenAI with a scoring prompt, force structured JSON output
// (response_format json_schema), then shape it into AnalysisResult.
// ============================================================================

/**
 * @typedef {Object} Category
 * @property {string} label  e.g. "Narrative"
 * @property {string} score  numeric string, or "—" when not scored (e.g. team)
 * @property {string} pct    CSS width for the bar, e.g. "82%" or "0%"
 * @property {string} note   one-line explanation
 *
 * @typedef {Object} VcMatch
 * @property {string} firm    e.g. "Khosla Ventures"
 * @property {string} thesis  e.g. "Early-stage deep tech · pre-seed to A"
 *
 * @typedef {Object} AnalysisResult
 * @property {number}      score       overall score out of 100
 * @property {string}      verdict     one-line italic summary
 * @property {Category[]}  categories  the 5 category cards
 * @property {string[]}    working     "What's working" bullets
 * @property {string[]}    fixes       "Fix these first" bullets (ordered)
 * @property {string}      matchTitle  e.g. "Matched to 3 firms by thesis"
 * @property {string}      matchTier   chip label, e.g. "Top 12%"
 * @property {string}      matchBlurb  paragraph under the match title
 * @property {VcMatch[]}   matches     matched firm rows
 */

/** Simulated latency for the mock so the analyzing animation has time to play. */
const MOCK_DELAY_MS = 2600

/**
 * Analyze a pitch deck and return structured feedback.
 *
 * @param {Object}   args
 * @param {File}     args.file      the uploaded deck (real File object)
 * @param {Array<{role:string,url:string}>} args.founders  founding-team rows
 * @returns {Promise<AnalysisResult>}
 */
export async function analyzeDeck({ file, founders }) {
  // --- MOCK IMPLEMENTATION (remove once the real endpoint is ready) ---------
  await new Promise((resolve) => setTimeout(resolve, MOCK_DELAY_MS))
  return buildMockResult(founders)
}

/**
 * Persist the lead's email (and VC opt-in) after they unlock results.
 * TOMI: wire this to your CRM / email service / backend. No-op for now.
 *
 * @param {Object}  args
 * @param {string}  args.email
 * @param {AnalysisResult} args.result
 */
export async function submitLead({ email, result }) {
  // eslint-disable-next-line no-console
  console.info('[stub] submitLead — wire to backend', { email, score: result?.score })
  return { ok: true }
}

/**
 * Submit the deck to the matched VC firms after the founder opts in.
 * TOMI: wire this to your backend once matching is real. No-op for now.
 */
export async function submitToFirms({ file, email, matches }) {
  // eslint-disable-next-line no-console
  console.info('[stub] submitToFirms — wire to backend', {
    email,
    firms: matches?.map((m) => m.firm),
  })
  return { ok: true }
}

// ----------------------------------------------------------------------------
// Mock data builder — mirrors the placeholder scores from the design handoff.
// The team category is dynamic: it only gets a score once the founder added
// at least one LinkedIn URL (matches the prototype behavior).
// ----------------------------------------------------------------------------
function buildMockResult(founders = []) {
  const filled = founders.filter((f) => f.url && f.url.trim()).length
  const teamScored = filled > 0

  const categories = [
    {
      label: 'Narrative',
      score: '82',
      pct: '82%',
      note: 'Your story is clear and compelling from the first slide.',
    },
    {
      label: 'Market',
      score: '74',
      pct: '74%',
      note: 'Opportunity is credible but the sizing needs a bottoms-up case.',
    },
    {
      label: 'Traction',
      score: '68',
      pct: '68%',
      note: 'Early signals are promising; make the growth trend explicit.',
    },
    {
      label: 'Team',
      score: teamScored ? '79' : '—',
      pct: teamScored ? '79%' : '0%',
      note: teamScored
        ? `Strong, complementary founding team across ${filled} ${
            filled === 1 ? 'profile.' : 'profiles.'
          }`
        : 'Add founder LinkedIn URLs above for a team-strength assessment.',
    },
    {
      label: 'Design',
      score: '85',
      pct: '85%',
      note: 'Clean, confident and easy to skim — a real asset.',
    },
  ]

  return {
    score: 78,
    verdict:
      'A strong deck with a clear story — a few fixes will meaningfully raise your odds with investors.',
    categories,
    working: [
      'A sharp problem statement that lands in the first two slides.',
      "Clean, confident visual design that's easy to skim.",
      'Credible early traction signals framed as momentum.',
    ],
    fixes: [
      'Quantify your market with a bottoms-up TAM, not a top-down headline.',
      'Make the business model & unit economics explicit on one slide.',
      'Tighten the ask: amount, use of funds, and milestones it buys.',
    ],
    matchTitle: 'Matched to 3 firms by thesis',
    matchTier: 'Top 12%',
    matchBlurb:
      'Your deck ranks in the top tier for its stage and sector. Opt in to submit it to the firms whose thesis fits best.',
    matches: [
      { firm: 'Khosla Ventures', thesis: 'Early-stage deep tech · pre-seed to A' },
      { firm: 'Emergence Capital', thesis: 'Enterprise SaaS & applied AI' },
      { firm: 'Myriad', thesis: 'Founder-led, capital-efficient teams' },
    ],
  }
}

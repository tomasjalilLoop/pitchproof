// ============================================================================
// Static marketing copy — exact text from the design handoff.
// This is presentational content, safe to edit. The *analysis* content
// (scores, notes, matches) is NOT here — that comes from the API layer
// (see src/api/analysis.js). Keep the two separate.
// ============================================================================

export const HERO = {
  eyebrow: 'AI-powered deck review for founders',
  // `em` is rendered italic + green.
  titleBefore: 'Get expert feedback on your pitch deck — ',
  titleEm: 'before',
  titleAfter: ' the partners do.',
  sub: "Upload your deck and receive a detailed, AI-powered critique in minutes. The strongest decks are submitted to top VC firms — matched to each firm's investment thesis.",
}

export const FOUNDER_ROLES = [
  { value: '', label: 'Role…' },
  { value: 'Founder', label: 'Founder' },
  { value: 'Co-founder', label: 'Co-founder' },
  { value: 'CEO', label: 'CEO' },
  { value: 'CTO', label: 'CTO' },
  { value: 'COO', label: 'COO' },
  { value: 'CPO', label: 'CPO' },
  { value: 'CMO', label: 'CMO' },
  { value: 'Other', label: 'Other' },
]

export const HOW_STEPS = [
  {
    num: '01',
    title: 'Upload & analyze',
    note: 'We read every slide and score narrative, market, traction, team and design.',
  },
  {
    num: '02',
    title: 'Get actionable notes',
    note: 'A slide-by-slide critique with specific, prioritized fixes — in minutes.',
  },
  {
    num: '03',
    title: 'Reach the right VCs',
    note: 'Top decks are matched to partner firms by their investment thesis.',
  },
]

// Firms shown in the "Selected decks are shared with" row (form stage).
export const VC_ROW_FIRMS = [
  'Khosla Ventures',
  'Greylock',
  'Emergence Capital',
  'Anthos Capital',
  'Myriad',
]

// Lines shown one-by-one (staggered) during the analyzing stage.
export const ANALYZING_STEPS = [
  'Reading every slide & extracting your story',
  'Assessing market size & positioning',
  'Evaluating traction & business model',
  'Reviewing founding team strength',
  'Scoring design & clarity',
]

export const FAQS = [
  {
    q: 'What happens after I upload my deck?',
    a: 'Our AI reads every slide and scores your deck on narrative, market, traction, team and design — then returns specific, actionable notes you can act on right away.',
  },
  {
    q: 'Why add my team’s LinkedIn?',
    a: "It's optional, but adding a founder or company LinkedIn lets us assess team strength — a factor VCs weigh heavily — and fold it into your overall feedback and match quality.",
  },
  {
    q: 'Who sees my pitch deck?',
    a: "Your deck is confidential by default. It's only ever shared with a VC firm if you opt in and your deck is selected as one of the strongest in its category.",
  },
  {
    q: 'How does VC matching work?',
    a: 'Top-scoring decks are matched to partner firms by their stated investment thesis — stage, sector and check size — so your deck reaches the investors most likely to lead.',
  },
  {
    q: 'Which firms are involved?',
    a: 'Selected decks can be submitted to Khosla Ventures, Greylock, Emergence Capital, Anthos Capital and Myriad, with more firms added over time.',
  },
  {
    q: 'How much does it cost?',
    a: "Uploading your deck and getting full AI feedback is free. There's no charge to be considered for VC matching.",
  },
  {
    q: 'What file formats can I upload?',
    a: 'PDF, PowerPoint (.ppt/.pptx) and Keynote files up to 50MB. For best results, export your deck as a PDF.',
  },
]

// Accepted upload types for the file input (`accept` attribute).
export const ACCEPTED_FILE_TYPES = '.pdf,.ppt,.pptx,.key'

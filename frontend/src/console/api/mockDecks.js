// ============================================================================
// Mock sample decks — verbatim sample data from the design handoff.
// Used as the fallback when the real backend is unreachable / empty (see
// api/decks.js). All company names, scores and metrics are placeholders.
// ============================================================================

// Raw handoff shape (compact). Normalized to the unified `deck` shape below.
const RAW = [
  { id: 'cadence', name: 'Cadence', tagline: 'Runtime observability for AI agents in production', stage: 'Seed', sector: 'Applied AI · DevTools', score: 86, match: 94, askNum: 4, ask: '$4M', days: 1, status: 'New',
    arr: '$620K', growth: '+22% MoM', users: '140 teams',
    cats: [['Narrative', 88, 'A tight, inevitable-feeling story — the agent-ops gap is obvious by slide two.'], ['Market', 82, 'Credible bottoms-up TAM tied to the AI-infra spend curve.'], ['Traction', 84, 'Fast MoM growth with real logos; retention framed as momentum.'], ['Team', 90, 'Ex-Datadog + ex-OpenAI infra — exactly the right pedigree.'], ['Design', 85, 'Clean, confident, skimmable.']],
    strengths: ['Founders shipped agent infra at scale before — rare domain fit.', 'Growth is genuinely fast and framed as retention-led, not paid.', 'Wedge is sharp: one painful problem, one buyer.'],
    fixes: ['Make the expansion path beyond observability explicit.', 'Show gross margin at current infra costs.', 'Name the 2-3 competitors and why you win.'],
    matchReason: "Squarely in Khosla's early deep-tech thesis: technical founders, infra layer, pre-seed to A. Check size and stage both fit; sector is a stated 2026 focus.",
    founders: [['Maya Okafor', 'MO', 'CEO', 'ex-Datadog, led agent platform', 'https://linkedin.com'], ['Dev Raman', 'DR', 'CTO', 'ex-OpenAI infra', 'https://linkedin.com']],
    slides: ['Problem', 'Solution', 'Why now', 'Product', 'Traction', 'Market', 'Team', 'The ask'] },
  { id: 'lumen', name: 'Lumen Health', tagline: 'AI triage that cuts ER wait times for regional hospitals', stage: 'Series A', sector: 'Digital health', score: 88, match: 91, askNum: 12, ask: '$12M', days: 4, status: 'Reviewing',
    arr: '$3.2M', growth: '+9% MoM', users: '18 hospitals',
    cats: [['Narrative', 86, 'Clear before/after with a quantified clinical outcome.'], ['Market', 89, 'Large, underserved regional-hospital segment.'], ['Traction', 90, 'Enterprise ARR with signed multi-year contracts.'], ['Team', 84, 'Strong clinical + ML, thinner on enterprise sales.'], ['Design', 88, 'Polished, data-forward.']],
    strengths: ['Signed multi-year hospital contracts de-risk revenue.', 'Measurable clinical outcome (wait time down 31%).', 'Regulatory path already cleared in two states.'],
    fixes: ['Sales motion is founder-led — show the hiring plan.', 'Clarify reimbursement dependency risk.', 'Payback period on long enterprise cycles.'],
    matchReason: "At the upper edge of Khosla's check size but a strong fit on applied-AI-in-healthcare. Series A stage matches; outcome data is the kind of proof the thesis rewards.",
    founders: [['Dr. Aisha Bello', 'AB', 'CEO', 'practicing ER physician', 'https://linkedin.com'], ['Tomás Vega', 'TV', 'CTO', 'ex-Google Health ML', 'https://linkedin.com']],
    slides: ['Problem', 'Outcome', 'Product', 'Clinical proof', 'Traction', 'Market', 'Team', 'Ask'] },
  { id: 'harborline', name: 'Harborline', tagline: 'Embedded payments rails for cross-border marketplaces', stage: 'Seed', sector: 'Fintech · Payments', score: 81, match: 89, askNum: 6, ask: '$6M', days: 2, status: 'Meeting',
    arr: '$1.4M', growth: '+12% MoM', users: '60 marketplaces',
    cats: [['Narrative', 83, 'Good wedge; the cross-border pain is well told.'], ['Market', 85, 'Sizable and growing; regulatory moat plausible.'], ['Traction', 80, 'Solid ARR, healthy growth, some concentration.'], ['Team', 82, 'Payments veterans with prior exit.'], ['Design', 78, 'Functional; a few dense slides.']],
    strengths: ['Team previously built and sold a payments company.', 'Revenue concentration improving quarter over quarter.', 'Regulatory licenses already in hand for 3 corridors.'],
    fixes: ['Top-2 customers are >40% of ARR — show diversification.', 'Unit economics per corridor.', 'Competitive fence vs. incumbents.'],
    matchReason: "Fintech infra with a licensing moat fits Khosla's fintech thesis. Seed stage and $6M ask are in range; prior-exit team is a strong positive signal.",
    founders: [['Elena Cruz', 'EC', 'CEO', 'ex-Stripe, prior exit', 'https://linkedin.com'], ['Ben Adeyemi', 'BA', 'COO', 'ex-Wise ops', 'https://linkedin.com']],
    slides: ['Problem', 'Solution', 'Corridors', 'Product', 'Traction', 'Regulatory', 'Team', 'Ask'] },
  { id: 'atlas', name: 'Atlas Security', tagline: 'Autonomous pentesting for cloud-native infrastructure', stage: 'Series A', sector: 'Cybersecurity', score: 83, match: 87, askNum: 10, ask: '$10M', days: 3, status: 'New',
    arr: '$2.6M', growth: '+14% MoM', users: '90 customers',
    cats: [['Narrative', 84, 'Compelling shift from periodic to continuous testing.'], ['Market', 86, 'Security budgets are resilient; clear buyer.'], ['Traction', 82, 'Healthy ARR and net retention above 120%.'], ['Team', 80, 'Deep security research, growing GTM.'], ['Design', 83, 'Confident and technical.']],
    strengths: ['Net revenue retention above 120%.', 'Founders are recognized security researchers.', 'Product replaces an expensive manual line item.'],
    fixes: ['Show how AI findings avoid false-positive fatigue.', 'Enterprise procurement timeline realism.', 'Margin at scale with compute-heavy scans.'],
    matchReason: 'Security infra with a technical founding team is core Khosla territory. Series A ARR profile and retention meet the bar; compute intensity is worth a diligence conversation.',
    founders: [['Priya Nair', 'PN', 'CEO', 'ex-Project Zero', 'https://linkedin.com'], ['Marcus Hale', 'MH', 'CTO', 'ex-CrowdStrike', 'https://linkedin.com']],
    slides: ['Problem', 'Approach', 'Product', 'Findings', 'Traction', 'Market', 'Team', 'Ask'] },
  { id: 'forge', name: 'Forge Robotics', tagline: 'General-purpose bin-picking arms for mid-size warehouses', stage: 'Seed', sector: 'Deep tech · Robotics', score: 77, match: 85, askNum: 7, ask: '$7M', days: 6, status: 'Reviewing',
    arr: '$400K', growth: '+18% MoM', users: '9 pilots',
    cats: [['Narrative', 78, "Strong 'why now' on labor + hardware cost curves."], ['Market', 82, 'Big TAM but adoption cycle is slow.'], ['Traction', 68, 'Early pilots; revenue nascent.'], ['Team', 84, 'Serious robotics + manufacturing chops.'], ['Design', 74, 'Engineering-led; needs a clearer story slide.']],
    strengths: ['Hardware BOM cost down 40% vs. last generation.', 'Founders shipped robots at industrial scale.', 'Pilots converting to paid at a healthy rate.'],
    fixes: ['Deployment/servicing model at scale.', 'Gross margin on hardware + software split.', 'Cash intensity vs. milestone plan.'],
    matchReason: 'Capital-intensive but exactly the frontier hardware Khosla backs. Seed stage fits; the milestone-to-cash plan will be the crux of diligence.',
    founders: [['Sam Reyes', 'SR', 'CEO', 'ex-Boston Dynamics', 'https://linkedin.com'], ['Lin Zhou', 'LZ', 'CTO', 'robotics PhD, ex-Amazon Robotics', 'https://linkedin.com']],
    slides: ['Problem', 'Why now', 'Product', 'Pilots', 'Unit econ', 'Market', 'Team', 'Ask'] },
  { id: 'meridian', name: 'Meridian Bio', tagline: 'Foundation models for protein-binding prediction', stage: 'Seed', sector: 'Biotech · Tools', score: 71, match: 78, askNum: 8, ask: '$8M', days: 9, status: 'Reviewing',
    arr: 'Pre-revenue', growth: '—', users: '4 design partners',
    cats: [['Narrative', 74, 'Ambitious; the scientific edge is clear.'], ['Market', 76, 'Real pull from pharma but long sales cycles.'], ['Traction', 58, 'Design partners only; no revenue yet.'], ['Team', 82, 'Elite ML + computational biology.'], ['Design', 70, 'Dense; needs a plain-language slide.']],
    strengths: ['Benchmark results beat published state of the art.', 'Two top-20 pharma design partners engaged.', 'Founders bridge ML and wet-lab rigor.'],
    fixes: ['Path from design partners to booked revenue.', 'Data moat vs. big-pharma internal efforts.', 'Compute cost per model generation.'],
    matchReason: 'Frontier AI-for-science aligns with the thesis, though pre-revenue and long pharma cycles push it earlier than the typical check. Team quality carries it into review.',
    founders: [['Dr. Hana Kim', 'HK', 'CEO', 'computational biology, ex-DeepMind', 'https://linkedin.com'], ['Omar Farah', 'OF', 'CTO', 'ex-Recursion ML', 'https://linkedin.com']],
    slides: ['Problem', 'Science', 'Model', 'Benchmarks', 'Partners', 'Market', 'Team', 'Ask'] },
  { id: 'verdant', name: 'Verdant Grid', tagline: 'Software to orchestrate distributed home batteries as a virtual plant', stage: 'Pre-seed', sector: 'Climate · Energy', score: 74, match: 82, askNum: 2.5, ask: '$2.5M', days: 5, status: 'New',
    arr: 'Pre-revenue', growth: '—', users: '3 utility pilots',
    cats: [['Narrative', 78, 'Clear, timely, well-scoped for pre-seed.'], ['Market', 80, 'Grid-flexibility tailwinds are strong.'], ['Traction', 62, 'Utility pilots signed, revenue to come.'], ['Team', 76, 'Energy + software, first-time founders.'], ['Design', 72, 'Clean but light on the business model.']],
    strengths: ['Three signed utility pilots at pre-seed is strong.', 'Regulatory tailwinds accelerating in target states.', 'Capital-efficient, software-only wedge.'],
    fixes: ['Revenue model per pilot needs one clear slide.', 'First-time-founder execution risk.', 'Utility sales cycles are long — show the plan.'],
    matchReason: 'Capital-efficient climate software fits the founder-led thesis. Pre-seed ask is small for Khosla but the pilot traction and timing merit a first conversation.',
    founders: [['Nora Vance', 'NV', 'CEO', 'ex-Tesla Energy', 'https://linkedin.com'], ['Kai Mbeki', 'KM', 'CTO', 'grid software eng', 'https://linkedin.com']],
    slides: ['Problem', 'Solution', 'Pilots', 'Product', 'Market', 'Model', 'Team', 'Ask'] },
  { id: 'parcel', name: 'Parcel', tagline: 'Last-mile routing OS for regional courier fleets', stage: 'Seed', sector: 'Logistics SaaS', score: 69, match: 73, askNum: 5, ask: '$5M', days: 14, status: 'Passed',
    arr: '$900K', growth: '+6% MoM', users: '220 fleets',
    cats: [['Narrative', 70, 'Solid but crowded space; wedge is thin.'], ['Market', 72, 'Fragmented; hard to consolidate.'], ['Traction', 72, 'Decent ARR, growth slowing.'], ['Team', 66, 'Capable but no clear unfair advantage.'], ['Design', 68, 'Functional, unmemorable.']],
    strengths: ['Broad fleet footprint gives useful routing data.', 'Recurring, sticky operational product.', 'Reasonable capital efficiency to date.'],
    fixes: ['Growth decelerating — diagnose why.', 'Differentiation vs. established routing tools.', 'Expansion revenue is flat.'],
    matchReason: 'Outside the current thesis: growth is decelerating and the moat is unclear versus incumbents. Recorded as a pass, kept for reference.',
    founders: [['Greg Olsen', 'GO', 'CEO', 'ex-logistics ops', 'https://linkedin.com'], ['Ivy Tran', 'IT', 'CPO', 'product, ex-Flexport', 'https://linkedin.com']],
    slides: ['Problem', 'Solution', 'Product', 'Traction', 'Market', 'Team', 'Roadmap', 'Ask'] },
  { id: 'kindred', name: 'Kindred', tagline: 'Interest-first social network for hobby communities', stage: 'Pre-seed', sector: 'Consumer social', score: 65, match: 61, askNum: 1.5, ask: '$1.5M', days: 18, status: 'New',
    arr: 'Pre-revenue', growth: '+30% MoM', users: '40K MAU',
    cats: [['Narrative', 72, 'Energetic; the wedge community is charming.'], ['Market', 64, 'Consumer social is high-risk, winner-take-most.'], ['Traction', 70, 'Fast user growth, no revenue model yet.'], ['Team', 60, 'Passionate but unproven at scale.'], ['Design', 76, 'Delightful product feel.']],
    strengths: ['Organic 30% MoM user growth with low spend.', 'High engagement within niche communities.', 'Distinctive, lovable product design.'],
    fixes: ['No revenue model articulated.', 'Consumer-social retention cliff risk.', 'Path to defensibility unclear.'],
    matchReason: "Consumer social sits outside Khosla's core enterprise/deep-tech thesis and the match score reflects that. Included for completeness; growth is notable but off-thesis.",
    founders: [['Jaya Kapoor', 'JK', 'CEO', 'community builder', 'https://linkedin.com'], ['Leo Marsh', 'LM', 'CTO', 'full-stack, ex-startup', 'https://linkedin.com']],
    slides: ['Problem', 'Product', 'Community', 'Growth', 'Vision', 'Team', 'Model', 'Ask'] },
]

// Build the 4 traction cards the detail view expects from the compact fields.
function tractionOf(raw) {
  return [
    { label: 'ARR', value: raw.arr, sub: raw.arr === 'Pre-revenue' ? 'Not yet monetized' : 'Annual recurring' },
    { label: 'Growth', value: raw.growth, sub: 'Month over month' },
    { label: 'Users', value: raw.users, sub: 'Current footprint' },
    { label: 'Raising', value: raw.ask, sub: `${raw.stage} round` },
  ]
}

// Normalize to the unified `deck` shape consumed across the console.
function normalize(raw) {
  return {
    id: raw.id,
    name: raw.name,
    tagline: raw.tagline,
    stage: raw.stage,
    sector: raw.sector,
    score: raw.score,
    match: raw.match,
    askNum: raw.askNum,
    ask: raw.ask,
    days: raw.days,
    status: raw.status,
    traction: tractionOf(raw),
    cats: raw.cats, // [label, score(0-100), note][]
    strengths: raw.strengths, // string[]
    fixes: raw.fixes, // string[]
    matchReason: raw.matchReason,
    founders: raw.founders.map(([name, initials, role, detail, url]) => ({ name, initials, role, detail, url })),
    teamNote: '', // real-mapped decks use this when there's no structured founder list
    slides: raw.slides, // title[]
    sample: true, // flags these as placeholder data in the UI
  }
}

export const MOCK_DECKS = RAW.map(normalize)

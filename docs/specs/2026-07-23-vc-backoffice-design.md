# VC Backoffice (Partner Console) — Design

**Date:** 2026-07-23 · **Branch:** `feat/vc-backoffice` · **Handoff:** `design_handoff_vc_dashboard/`

## Goal
A partner console where a VC reviews the pitch decks Pitch Proof matched to their firm.
Two views: **Queue** (KPI strip + filterable/sortable table) and **Deck detail** (score,
action bar, traction, category scores, strengths/watch-outs, slides, founders, thesis match).
Recreated 1:1 from the handoff's visual system (shared with the founder landing).

## Placement
Lives inside the existing `frontend/` app as a route (`/console`), via `react-router-dom` v6.
- `src/App.jsx` → router
- `src/routes/Landing.jsx` → the current landing (moved verbatim)
- `src/routes/Console.jsx` → the dashboard

## Data strategy — partial real wiring
The console fetches real decks from Tomi's backend and fills the gaps the backend does
not yet produce. Data layer in `src/console/api/`:

- `listDecks()` → `GET /analyses`
- `getDeck(id)` → `GET /analyses/:id`
- `updateStatus(id, status)` → `localStorage` (seam for real persistence)

**Fallback:** if the API is unreachable, returns 503 (no `DATABASE_URL`), or an empty list,
the console falls back to the 9 mock sample decks from the handoff, flagged with a subtle
"sample data" indicator. Keeps it reviewable now and wired for real later.

### Field mapping (backend → dashboard)
| Dashboard field | Real source | Strategy |
|---|---|---|
| score | `vc_view.score_general` | real |
| category scores (5) | `vc_view.scores.*` (0–10 ×10) | real, **relabeled** to backend's 5: Team-Market Fit, Evidencia PMF, Realismo TAM, Unit Economics, Defensibilidad |
| strengths | `founder_view.fortalezas` | real |
| watch-outs | `vc_view.red_flags` | real |
| traction KPIs | `extraccion.kpis[]` | real (name/value) |
| sector | `extraccion.vertical` | real |
| company name | `filename` (no extension) | derived (no real name stored) |
| submitted | `created_at` → relative | real |
| slides | `Slide 1..N` from `slide_count` | mock (text stored, not renders) |
| thesis match % + reason | — | mock/derived |
| stage, raise | — | mock |
| status | — | local (localStorage) |
| founders (structured + LinkedIn) | `extraccion.team.resumen` only | mock (no structured list) |

Every mock/derived field is commented for Tomi with the endpoint/field he'd need to add.

## Component structure
```
src/console/
├── config.js          partnerName / firmName / accent (auth stub) + API base
├── status.js          status tokens (New/Reviewing/Shortlisted/Meeting/Passed)
├── api/
│   ├── mockDecks.js   9 sample decks (verbatim from handoff)
│   ├── mapping.js     backend row → deck view-model + derive helpers (Tomi comments)
│   └── decks.js       listDecks / getDeck / updateStatus (fetch + fallback)
├── ConsoleHeader.jsx
├── QueueView.jsx      composes the queue
│   ├── KpiStrip.jsx · SearchBar.jsx · FilterChips.jsx · DeckTable.jsx · DeckRow.jsx
└── DetailView.jsx     composes the detail
    ├── DeckHeader.jsx · ActionBar.jsx · TractionGrid.jsx · CategoryScores.jsx
    ├── StrengthsWatchouts.jsx · SlideGrid.jsx · FoundingTeam.jsx · ThesisMatch.jsx
```
Styles in `src/styles/console.css`, reusing `tokens.css`. Flat editorial look, no shadows.
Animations `pp-bar` / `pp-fade`.

## Behavior
- Queue state (search / stage / status / sort) is client-side over the fetched list.
  Search = substring on name OR sector; stage = exact; status = effective (override ?? original).
  Sort keys: company (alpha), score/match/ask (numeric), submitted (recency). Default `match` desc.
- Status overrides persist in `localStorage`, keyed by deck id. Effective status = override ?? original.
- Loading / error / empty states are handled (handoff only specs empty).
- Auth stubbed via `config.js`; seam for real login later.

## Out of scope (v1)
Real auth/login, real thesis-match computation, real slide renders, structured founders
with LinkedIn, status persistence in the backend. All left as documented seams for Tomi.

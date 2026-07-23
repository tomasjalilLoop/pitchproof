# Pitch Proof

Landing page for early-stage founders to upload a pitch deck and get AI-powered
feedback. Built as a single-page React app (Vite) that runs a four-stage flow:

```
form → analyzing → email capture → results
```

Recreated faithfully from the design handoff in
`../design_handoff_pitch_proof/`.

## Getting started

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build → dist/
npm run preview  # serve the production build
```

## Project structure

```
src/
  main.jsx                 App entry
  App.jsx                  Flow state machine (stage transitions, wiring)
  content.js               Static marketing copy (hero, FAQ, steps, firms)
  api/analysis.js          👈 API layer — OpenAI integration goes HERE
  styles/
    tokens.css             Design tokens (colors, type, spacing, radius)
    global.css             Component styles (flat editorial look, no shadows)
  components/
    Header.jsx  Footer.jsx
    form/                  FormStage building blocks (dropzone, founders, FAQ…)
    stages/                FormStage / AnalyzingStage / EmailStage / ResultsStage
```

## 🔌 OpenAI integration — for Tomi

Everything AI-related is isolated in **`src/api/analysis.js`**. The UI already
consumes it; you only need to replace the mock bodies.

- `analyzeDeck({ file, founders })` → returns an `AnalysisResult` (score,
  verdict, category cards, "what's working", "fix these first", VC matches).
  The JSDoc `@typedef` at the top of the file documents the exact shape — keep
  it and the components won't need to change.
- `submitLead({ email, result })` → persist the lead / send the report email.
- `submitToFirms({ file, email, matches })` → submit the deck to matched VCs.

**Security:** never call OpenAI from the browser — the key would be exposed to
every visitor. Add a backend endpoint (e.g. `POST /api/analyze`) that:

1. receives the deck file (+ founders),
2. extracts text/images from the deck (PDF / PPTX / Keynote),
3. calls OpenAI server-side with `OPENAI_API_KEY` and a scoring prompt,
4. forces structured JSON output and shapes it into `AnalysisResult`.

The frontend only ever talks to your endpoint. See `.env.example` for env vars.

## Notes

- All scores/percentages are **mock placeholders** until the API is wired.
- The team category stays unscored ("—") until at least one founder LinkedIn
  URL is entered — this behavior is preserved in the mock.
- Fonts (Newsreader, Libre Franklin, Space Grotesk) load from Google Fonts in
  `index.html`.

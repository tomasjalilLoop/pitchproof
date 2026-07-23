# Pitch Proof

Pre-screening de pitch decks con IA para founders early-stage. Monorepo con dos apps:

```
pitchproof/
├── frontend/   React + Vite — landing y flujo form → analyzing → email → results
└── backend/    Node + Express — POST /analyze (.pptx) → OpenAI → vc_view / founder_view
```

## Apps

| App | Stack | Correr | Docs |
|-----|-------|--------|------|
| [`frontend/`](./frontend) | React 18, Vite | `cd frontend && npm install && npm run dev` | [README](./frontend/README.md) |
| [`backend/`](./backend) | Express, Multer, JSZip, pg, OpenAI | `cd backend && npm install && npm start` | [README](./backend/README.md) |

## Cómo se conectan

El frontend llama al backend en `src/api/analysis.js`. Hoy ese archivo devuelve
datos **mock**; el paso pendiente es apuntarlo al `POST /analyze` real del backend.

⚠️ **Contrato aún no alineado** (pendiente de resolver):
- El backend acepta solo **`.pptx`**; el dropzone del frontend acepta pdf/ppt/pptx/key.
- El backend devuelve `{ extraccion, vc_view, founder_view }`; el frontend espera
  `AnalysisResult { score, categories, working, fixes, matches, ... }`.
  Hay que mapear una forma a la otra (o alinear ambas).

## Deploy

- **Backend** → Railway. Como vive en `backend/`, en el servicio de Railway hay
  que setear **Root Directory = `backend`** para que tome `railway.json` y
  `package.json`. Env var requerida: `OPENAI_API_KEY`.
- **Frontend** → build estático (`cd frontend && npm run build` → `frontend/dist`).

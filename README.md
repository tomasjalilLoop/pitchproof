# PitchProof — Backend

Pre-screening automático de pitch decks (`.pptx`). Un founder sube el deck y recibe
dos vistas: una **VC** (score + red flags, dura) y una **founder** (feedback constructivo + hipótesis de PMF).

## Stack
Node 18+ · Express · CORS · Multer (memoria) · JSZip · fetch nativo · OpenAI `gpt-4o`.

## Correr local
```bash
npm install
cp .env.example .env   # y completá OPENAI_API_KEY
npm start
```
Escucha en `PORT` (default `3000`).

## Endpoint

### `POST /analyze`
`multipart/form-data`, campo **`deck`** = archivo `.pptx`.

Flujo: extrae texto de las slides (`ppt/slides/slideN.xml` → nodos `<a:t>`) →
llamada 1 a OpenAI (extracción estructurada) → llamada 2 (scoring + vistas).

Respuesta:
```json
{ "extraccion": { ... }, "vc_view": { ... }, "founder_view": { ... } }
```

Ejemplo:
```bash
curl -X POST http://localhost:3000/analyze -F "deck=@mi-deck.pptx"
```

### `GET /`
Healthcheck: `{ "ok": true, "service": "pitchproof-backend" }`.

## Deploy en Railway
Detecta Node automáticamente. Config en `railway.json` (`npm start`).
Setear la env var **`OPENAI_API_KEY`** en el panel de Railway. `PORT` lo inyecta Railway.

## Notas
- La API key sale de `process.env.OPENAI_API_KEY`, nunca se hardcodea ni se expone al cliente.
- Estado en memoria (sin DB) — es un hackathon.

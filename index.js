"use strict";

const express = require("express");
const cors = require("cors");
const multer = require("multer");

const { extractDeckText } = require("./lib/pptx");
const { extraerSenal, evaluarDeck } = require("./lib/openai");

const app = express();

// El front puede estar en otro dominio/puerto -> CORS abierto.
app.use(cors());
app.use(express.json());

// Multer en memoria (no disco): el .pptx queda en req.file.buffer.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB, suficiente para un deck
});

// Healthcheck para Railway / smoke test rapido.
app.get("/", (_req, res) => {
  res.json({ ok: true, service: "pitchproof-backend" });
});

// ---------------------------------------------------------------------------
// POST /analyze
// multipart/form-data, campo "deck" (.pptx)
// ---------------------------------------------------------------------------
app.post("/analyze", upload.single("deck"), async (req, res) => {
  // 1) Validar archivo
  if (!req.file || !req.file.buffer || req.file.buffer.length === 0) {
    return res.status(400).json({ error: "Falta el archivo. Envialo en el campo 'deck' (.pptx)." });
  }

  // 2) Extraer texto del pptx
  let deckText;
  try {
    const result = await extractDeckText(req.file.buffer);
    deckText = result.text;
    console.log(`[analyze] deck parseado: ${result.slideCount} slides, ${deckText.length} chars`);
  } catch (err) {
    console.error("[analyze] error parseando pptx:", err.message);
    return res.status(400).json({ error: `No se pudo procesar el .pptx: ${err.message}` });
  }

  // 3) Llamada 1 — extraccion estructurada
  let extraccion;
  try {
    extraccion = await extraerSenal(deckText);
  } catch (err) {
    console.error("[analyze] error en llamada 1 (extraccion):", err.message);
    return res.status(500).json({ error: `Fallo la extraccion estructurada: ${err.message}` });
  }

  // 4) Llamada 2 — scoring + vistas (usa el JSON de la 1 + el texto original)
  let evaluacion;
  try {
    evaluacion = await evaluarDeck(extraccion, deckText);
  } catch (err) {
    console.error("[analyze] error en llamada 2 (evaluacion):", err.message);
    return res.status(500).json({ error: `Fallo la evaluacion/scoring: ${err.message}` });
  }

  // 5) Respuesta final al front
  return res.json({
    extraccion,
    vc_view: evaluacion.vc_view,
    founder_view: evaluacion.founder_view,
  });
});

// Handler de errores de multer (ej: archivo demasiado grande).
app.use((err, _req, res, _next) => {
  console.error("[error]", err.message);
  res.status(400).json({ error: err.message });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`PitchProof backend escuchando en :${PORT}`);
});

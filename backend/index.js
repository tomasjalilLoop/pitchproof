"use strict";

// Carga .env en local. En Railway no hay archivo .env y usa las env vars
// inyectadas por la plataforma; require es inofensivo si el archivo no existe.
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const multer = require("multer");

const { extractDeckText } = require("./lib/deck");
const { extraerSenal, evaluarDeck } = require("./lib/openai");
const db = require("./lib/db");

const app = express();

// El front puede estar en otro dominio/puerto -> CORS abierto.
app.use(cors());
app.use(express.json());

// Multer en memoria (no disco): el .pptx queda en req.file.buffer.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB, suficiente para un deck
  fileFilter: (_req, file, cb) => {
    const name = file.originalname || "";
    const ok =
      /\.(pptx|pdf)$/i.test(name) ||
      file.mimetype === "application/pdf" ||
      file.mimetype ===
        "application/vnd.openxmlformats-officedocument.presentationml.presentation";
    if (!ok) {
      return cb(new Error("El archivo debe ser un .pptx o .pdf"));
    }
    cb(null, true);
  },
});

// Healthcheck para Railway / smoke test rapido.
app.get("/", (_req, res) => {
  res.json({ ok: true, service: "pitchproof-backend", db: db.isEnabled() });
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
  let slideCount;
  try {
    const result = await extractDeckText(req.file.buffer, {
      filename: req.file.originalname,
      mimetype: req.file.mimetype,
    });
    deckText = result.text;
    slideCount = result.slideCount;
    console.log(`[analyze] deck parseado (${result.format}): ${slideCount} slides, ${deckText.length} chars`);
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

  // 5) Persistir (si hay DB). No debe tirar la request si falla el guardado.
  let id = null;
  try {
    id = await db.saveAnalysis({
      filename: req.file.originalname,
      slideCount,
      deckText,
      extraccion,
      vc_view: evaluacion.vc_view,
      founder_view: evaluacion.founder_view,
    });
  } catch (err) {
    console.error("[analyze] no se pudo guardar en DB (sigo igual):", err.message);
  }

  // 6) Respuesta final al front
  return res.json({
    id,
    extraccion,
    vc_view: evaluacion.vc_view,
    founder_view: evaluacion.founder_view,
  });
});

// ---------------------------------------------------------------------------
// GET /analyses  -> historial (metadata liviana)
// ---------------------------------------------------------------------------
app.get("/analyses", async (_req, res) => {
  if (!db.isEnabled()) {
    return res.status(503).json({ error: "Persistencia deshabilitada (sin DATABASE_URL)." });
  }
  try {
    const rows = await db.listAnalyses();
    res.json({ analyses: rows });
  } catch (err) {
    console.error("[analyses] error listando:", err.message);
    res.status(500).json({ error: `No se pudo listar el historial: ${err.message}` });
  }
});

// ---------------------------------------------------------------------------
// GET /analyses/:id  -> un analisis completo
// ---------------------------------------------------------------------------
app.get("/analyses/:id", async (req, res) => {
  if (!db.isEnabled()) {
    return res.status(503).json({ error: "Persistencia deshabilitada (sin DATABASE_URL)." });
  }
  try {
    const row = await db.getAnalysis(req.params.id);
    if (!row) {
      return res.status(404).json({ error: "Analisis no encontrado." });
    }
    res.json(row);
  } catch (err) {
    console.error("[analyses/:id] error:", err.message);
    res.status(500).json({ error: `No se pudo traer el analisis: ${err.message}` });
  }
});

// Handler de errores (ej: multer con archivo demasiado grande o no-.pptx).
app.use((err, _req, res, _next) => {
  console.error("[error]", err.message);
  res.status(400).json({ error: err.message });
});

const PORT = process.env.PORT || 3000;

// Arranca la DB (idempotente) y despues levanta el server.
async function start() {
  db.init();
  try {
    await db.migrate();
    if (db.isEnabled()) console.log("[db] tabla 'analyses' lista.");
  } catch (err) {
    console.error("[db] fallo la migracion (sigo sin persistencia):", err.message);
  }
  app.listen(PORT, () => {
    console.log(`PitchProof backend escuchando en :${PORT}`);
  });
}

// Solo arranca solo si se ejecuta directo (node index.js). Si se importa
// (ej: tests), se expone `app` para levantarlo con un Pool inyectado.
if (require.main === module) {
  start();
}

module.exports = { app, start };

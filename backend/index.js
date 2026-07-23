"use strict";

// Carga .env en local. En Railway no hay archivo .env y usa las env vars
// inyectadas por la plataforma; require es inofensivo si el archivo no existe.
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const multer = require("multer");

const { extractDeckText } = require("./lib/deck");
const { extraerSenal, evaluarDeck } = require("./lib/openai");
const { scrapeLinkedInProfiles, publicIdFromUrl } = require("./lib/apify");
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

  // 2.5) Enriquecimiento de equipo: si vienen URLs de LinkedIn en 'founders',
  // las scrapeamos con Apify. Degradable: si falla, seguimos sin perfiles.
  let teamProfiles = [];
  try {
    const founders = parseFounders(req.body?.founders);
    const urls = founders.map((f) => f.url).filter(isLinkedInUrl);
    if (urls.length) {
      const profiles = await scrapeLinkedInProfiles(urls);
      // Adjuntamos el rol declarado por el founder (matcheando por public id).
      const roleBySlug = new Map(
        founders.filter((f) => isLinkedInUrl(f.url)).map((f) => [publicIdFromUrl(f.url), f.role || ""])
      );
      teamProfiles = profiles.map((p) => ({ ...p, role: roleBySlug.get(p.publicIdentifier) || p.role || "" }));
      console.log(`[analyze] LinkedIn: ${urls.length} URLs -> ${teamProfiles.length} perfiles scrapeados`);
    }
  } catch (err) {
    console.error("[analyze] scraping de LinkedIn fallo (sigo sin perfiles):", err.message);
    teamProfiles = [];
  }

  // 3) Llamada 1 — extraccion estructurada (enriquecida con LinkedIn si hay)
  let extraccion;
  try {
    extraccion = await extraerSenal(deckText, teamProfiles);
  } catch (err) {
    console.error("[analyze] error en llamada 1 (extraccion):", err.message);
    return res.status(500).json({ error: `Fallo la extraccion estructurada: ${err.message}` });
  }

  // 4) Llamada 2 — scoring + vistas (usa el JSON de la 1 + el texto + LinkedIn)
  let evaluacion;
  try {
    evaluacion = await evaluarDeck(extraccion, deckText, teamProfiles);
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
      teamProfiles,
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
    team_profiles: teamProfiles,
  });
});

// Parsea el campo 'founders' del multipart (viene como JSON string desde el front).
function parseFounders(raw) {
  if (!raw) return [];
  try {
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

function isLinkedInUrl(url) {
  return typeof url === "string" && /linkedin\.com\/in\//i.test(url.trim());
}

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

// ---------------------------------------------------------------------------
// PATCH /analyses/:id/status  -> actualiza el estado de review (console queue)
// body: { "status": "New"|"Reviewing"|"Shortlisted"|"Meeting"|"Passed" }
// ---------------------------------------------------------------------------
app.patch("/analyses/:id/status", async (req, res) => {
  if (!db.isEnabled()) {
    return res.status(503).json({ error: "Persistencia deshabilitada (sin DATABASE_URL)." });
  }
  const { status } = req.body || {};
  if (!status) {
    return res.status(400).json({ error: "Falta 'status' en el body." });
  }
  try {
    const updated = await db.updateStatus(req.params.id, status);
    if (!updated) {
      return res.status(404).json({ error: "Analisis no encontrado." });
    }
    res.json(updated);
  } catch (err) {
    // Status inválido -> 400; el resto -> 500.
    const invalid = /inv[aá]lido/i.test(err.message);
    console.error("[analyses/:id/status] error:", err.message);
    res.status(invalid ? 400 : 500).json({ error: err.message });
  }
});

// ---------------------------------------------------------------------------
// DELETE /analyses/:id  -> borra un analisis
// ---------------------------------------------------------------------------
app.delete("/analyses/:id", async (req, res) => {
  if (!db.isEnabled()) {
    return res.status(503).json({ error: "Persistencia deshabilitada (sin DATABASE_URL)." });
  }
  try {
    const del = await db.deleteAnalysis(req.params.id);
    if (!del) {
      return res.status(404).json({ error: "Analisis no encontrado." });
    }
    res.json({ deleted: del.id });
  } catch (err) {
    console.error("[analyses/:id DELETE] error:", err.message);
    res.status(500).json({ error: `No se pudo borrar: ${err.message}` });
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

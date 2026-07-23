"use strict";

// Capa de persistencia sobre Postgres (Railway inyecta DATABASE_URL).
// Diseño degradable: si NO hay DATABASE_URL, la app sigue funcionando sin
// persistir (util para correr local sin DB o para no tirar la demo).
//
// Para tests locales sin server real, se puede inyectar un Pool alternativo
// (ej: pg-mem) via setPool().

const { Pool } = require("pg");
const crypto = require("crypto");

let pool = null;
let enabled = false;

// Railway/Neon/etc requieren SSL; en localhost no. Detectamos por el host.
// Override manual via DATABASE_SSL: "require" fuerza SSL, "disable" lo apaga.
function needsSsl(connectionString) {
  const override = (process.env.DATABASE_SSL || "").toLowerCase();
  if (override === "require") return true;
  if (override === "disable") return false;
  try {
    const host = new URL(connectionString).hostname;
    return host !== "localhost" && host !== "127.0.0.1";
  } catch {
    return false;
  }
}

function init() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    enabled = false;
    console.warn("[db] DATABASE_URL no seteada -> corriendo SIN persistencia.");
    return;
  }
  pool = new Pool({
    connectionString: url,
    ssl: needsSsl(url) ? { rejectUnauthorized: false } : false,
  });
  enabled = true;
}

// Permite inyectar un Pool para tests (pg-mem).
function setPool(customPool) {
  pool = customPool;
  enabled = true;
}

function isEnabled() {
  return enabled;
}

// Crea la tabla si no existe. Idempotente.
async function migrate() {
  if (!enabled) return;
  await pool.query(`
    CREATE TABLE IF NOT EXISTS analyses (
      id            TEXT PRIMARY KEY,
      created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
      filename      TEXT,
      slide_count   INTEGER,
      deck_text     TEXT,
      vertical      TEXT,
      score_vc      INTEGER,
      score_founder INTEGER,
      extraccion    JSONB NOT NULL,
      vc_view       JSONB NOT NULL,
      founder_view  JSONB NOT NULL
    );
  `);
}

/**
 * Guarda un análisis y devuelve el id. Si la DB está deshabilitada, devuelve null.
 */
async function saveAnalysis({ filename, slideCount, deckText, extraccion, vc_view, founder_view }) {
  if (!enabled) return null;
  const id = crypto.randomUUID();
  await pool.query(
    `INSERT INTO analyses
      (id, filename, slide_count, deck_text, vertical, score_vc, score_founder, extraccion, vc_view, founder_view)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
    [
      id,
      filename || null,
      slideCount || null,
      deckText || null,
      extraccion?.vertical || null,
      vc_view?.score_general ?? null,
      founder_view?.score_general ?? null,
      JSON.stringify(extraccion),
      JSON.stringify(vc_view),
      JSON.stringify(founder_view),
    ]
  );
  return id;
}

/**
 * Lista los análisis recientes (metadata liviana para un historial).
 */
async function listAnalyses(limit = 50) {
  if (!enabled) return [];
  const { rows } = await pool.query(
    `SELECT id, created_at, filename, vertical, score_vc, score_founder
       FROM analyses
      ORDER BY created_at DESC
      LIMIT $1`,
    [limit]
  );
  return rows;
}

/**
 * Trae un análisis completo por id, o null si no existe.
 */
async function getAnalysis(id) {
  if (!enabled) return null;
  const { rows } = await pool.query(
    `SELECT id, created_at, filename, slide_count, vertical, score_vc, score_founder,
            extraccion, vc_view, founder_view
       FROM analyses
      WHERE id = $1`,
    [id]
  );
  return rows[0] || null;
}

module.exports = { init, setPool, isEnabled, migrate, saveAnalysis, listAnalyses, getAnalysis };

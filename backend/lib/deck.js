"use strict";

// Router de extraccion: detecta el formato del deck (pptx o pdf) y delega
// al parser correspondiente. Ambos devuelven { text, slideCount } con el
// mismo formato "Slide 1: ...\nSlide 2: ...".

const { extractPptxText } = require("./pptx");
const { extractPdfText } = require("./pdf");

const PPTX_MIME =
  "application/vnd.openxmlformats-officedocument.presentationml.presentation";

// Detecta el tipo real mirando los magic bytes del buffer, con fallback al
// nombre/mimetype. pptx = zip (PK\x03\x04); pdf = "%PDF".
function detectType(buffer, filename = "", mimetype = "") {
  const head = buffer.slice(0, 4).toString("latin1");
  if (head === "%PDF") return "pdf";
  if (head.startsWith("PK")) return "pptx"; // zip -> asumimos pptx
  if (/\.pdf$/i.test(filename) || mimetype === "application/pdf") return "pdf";
  if (/\.pptx$/i.test(filename) || mimetype === PPTX_MIME) return "pptx";
  return "unknown";
}

/**
 * Extrae el texto de un deck (.pptx o .pdf).
 * @param {Buffer} buffer
 * @param {{ filename?: string, mimetype?: string }} [meta]
 * @returns {Promise<{ text: string, slideCount: number, format: string }>}
 */
async function extractDeckText(buffer, meta = {}) {
  const type = detectType(buffer, meta.filename, meta.mimetype);

  if (type === "pptx") {
    const res = await extractPptxText(buffer);
    return { ...res, format: "pptx" };
  }
  if (type === "pdf") {
    const res = await extractPdfText(buffer);
    return { ...res, format: "pdf" };
  }
  throw new Error("Formato no soportado. Subi un .pptx o un .pdf.");
}

module.exports = { extractDeckText, detectType };

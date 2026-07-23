"use strict";

// Router de extraccion: detecta el formato del deck (pptx o pdf) y delega
// al parser de texto. Si el deck NO tiene texto extraible (escaneado o slides
// que son imagenes), cae al "visualizer": renderiza/extrae las imagenes y las
// transcribe con gpt-4o vision. Todo devuelve { text, slideCount, format } con
// el mismo formato "Slide 1: ...\nSlide 2: ...".

const { extractPptxText, extractPptxImages } = require("./pptx");
const { extractPdfText, renderPdfToImages } = require("./pdf");
const { transcribeDeckImages } = require("./vision");

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

// Considera "sin texto util" si, sacando los labels "Slide N:", queda muy poco.
function isTooShort(text) {
  const stripped = String(text || "")
    .replace(/Slide \d+:/g, "")
    .replace(/\s+/g, " ")
    .trim();
  return stripped.length < 80;
}

// Intenta extraer texto; si no hay (o es muy poco), cae a vision sobre imagenes.
async function extractOrVision(format, buffer, textFn, imagesFn) {
  let textResult = null;
  try {
    textResult = await textFn(buffer);
  } catch {
    textResult = null; // el parser tiró (ej: "sin texto extraible")
  }

  if (textResult && !isTooShort(textResult.text)) {
    return { ...textResult, format };
  }

  // Fallback visualizer: imagenes -> gpt-4o vision.
  let images = [];
  try {
    images = await imagesFn(buffer, 15);
  } catch (err) {
    images = [];
    console.error(`[deck] no se pudieron obtener imagenes (${format}):`, err.message);
  }

  if (!images.length) {
    throw new Error("El deck no tiene texto ni imagenes extraibles.");
  }

  console.log(`[deck] deck sin texto -> visualizer: transcribiendo ${images.length} imagenes con vision`);
  const text = await transcribeDeckImages(images);
  return { text, slideCount: images.length, format: `${format}-vision` };
}

/**
 * Extrae el texto de un deck (.pptx o .pdf), con fallback a vision si es imagen.
 * @param {Buffer} buffer
 * @param {{ filename?: string, mimetype?: string }} [meta]
 * @returns {Promise<{ text: string, slideCount: number, format: string }>}
 */
async function extractDeckText(buffer, meta = {}) {
  const type = detectType(buffer, meta.filename, meta.mimetype);

  if (type === "pptx") {
    return extractOrVision("pptx", buffer, extractPptxText, extractPptxImages);
  }
  if (type === "pdf") {
    return extractOrVision("pdf", buffer, extractPdfText, renderPdfToImages);
  }
  throw new Error("Formato no soportado. Subi un .pptx o un .pdf.");
}

module.exports = { extractDeckText, detectType };

"use strict";

// Extrae texto de un PDF. Muchos decks se exportan a PDF, asi que soportamos
// ambos formatos. pdf-parse@1.1.1 solo corre su harness de debug cuando se
// ejecuta como main; importado como dependencia (module.parent definido) no.
const pdfParse = require("pdf-parse");

// Render por pagina: separamos cada pagina con un form-feed (\f) para poder
// reconstruir limites de "slide" despues (el PDF no tiene el concepto nativo).
function renderPage(pageData) {
  return pageData.getTextContent({ normalizeWhitespace: true }).then((tc) => {
    let text = "";
    for (const item of tc.items) text += item.str + " ";
    return "\f" + text;
  });
}

/**
 * Extrae el texto de un buffer PDF, formateado igual que el de pptx:
 * "Slide 1: ...\nSlide 2: ...".
 * @param {Buffer} buffer
 * @returns {Promise<{ text: string, slideCount: number }>}
 */
async function extractPdfText(buffer) {
  const data = await pdfParse(buffer, { pagerender: renderPage });

  const pages = (data.text || "")
    .split("\f")
    .map((p) => p.replace(/\s+/g, " ").trim())
    .filter(Boolean);

  if (pages.length === 0) {
    throw new Error("El PDF no tiene texto extraible (puede ser escaneado o solo imagenes).");
  }

  const text = pages.map((p, i) => `Slide ${i + 1}: ${p}`).join("\n");
  return { text, slideCount: data.numpages || pages.length };
}

/**
 * Renderiza las paginas del PDF a imagenes PNG (para el fallback de vision
 * cuando el PDF es escaneado / sin texto). Usa pdf-to-img (ESM) via import().
 * @param {Buffer} buffer
 * @param {number} maxPages
 * @returns {Promise<Buffer[]>}
 */
async function renderPdfToImages(buffer, maxPages = 15) {
  const { pdf } = await import("pdf-to-img");
  const doc = await pdf(buffer, { scale: 2 });
  const images = [];
  for await (const img of doc) {
    images.push(img);
    if (images.length >= maxPages) break;
  }
  return images;
}

module.exports = { extractPdfText, renderPdfToImages };

"use strict";

const JSZip = require("jszip");

// Un .pptx es un zip. Cada slide es ppt/slides/slideN.xml.
// El texto visible vive en nodos <a:t>...</a:t>.
// Devolvemos un string tipo "Slide 1: ...\nSlide 2: ..." concatenando por slide.

// Decodifica las entidades XML basicas que aparecen dentro de <a:t>.
function decodeXmlEntities(str) {
  return str
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(parseInt(dec, 10)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
    // &amp; al final para no romper las otras entidades
    .replace(/&amp;/g, "&");
}

// Extrae todo el texto de un XML de slide concatenando los <a:t>.
function extractTextFromSlideXml(xml) {
  const matches = xml.match(/<a:t>([\s\S]*?)<\/a:t>/g);
  if (!matches) return "";
  return matches
    .map((node) => node.replace(/<a:t>([\s\S]*?)<\/a:t>/, "$1"))
    .map(decodeXmlEntities)
    .map((s) => s.trim())
    .filter(Boolean)
    .join(" ");
}

/**
 * Extrae el texto de todas las slides de un buffer .pptx.
 * @param {Buffer} buffer - contenido del archivo .pptx
 * @returns {Promise<{ text: string, slideCount: number }>}
 */
async function extractPptxText(buffer) {
  const zip = await JSZip.loadAsync(buffer);

  // Filtramos solo los slides reales (no notesSlide, no layouts, no masters)
  // y los ordenamos numericamente (slide2 antes que slide10).
  const slideFiles = Object.keys(zip.files)
    .filter((name) => /^ppt\/slides\/slide\d+\.xml$/.test(name))
    .sort((a, b) => {
      const na = parseInt(a.match(/slide(\d+)\.xml$/)[1], 10);
      const nb = parseInt(b.match(/slide(\d+)\.xml$/)[1], 10);
      return na - nb;
    });

  if (slideFiles.length === 0) {
    throw new Error("El archivo no parece un .pptx valido (no se encontraron slides).");
  }

  const parts = [];
  for (let i = 0; i < slideFiles.length; i++) {
    const xml = await zip.files[slideFiles[i]].async("string");
    const slideText = extractTextFromSlideXml(xml);
    parts.push(`Slide ${i + 1}: ${slideText}`);
  }

  const text = parts.join("\n");

  // Chequeo de que haya algo de texto real y no solo los labels "Slide N:".
  const hasRealText = parts.some((p) => p.replace(/^Slide \d+:\s*/, "").trim().length > 0);
  if (!hasRealText) {
    throw new Error("El .pptx no tiene texto extraible (deck vacio o solo imagenes).");
  }

  return { text, slideCount: slideFiles.length };
}

/**
 * Extrae las imagenes embebidas del pptx (ppt/media/*) para el fallback de
 * vision cuando las slides son imagenes sin texto. Descarta imagenes muy chicas
 * (iconos/logos) por tamaño.
 * @param {Buffer} buffer
 * @param {number} maxImages
 * @returns {Promise<Buffer[]>}
 */
async function extractPptxImages(buffer, maxImages = 15) {
  const zip = await JSZip.loadAsync(buffer);
  const names = Object.keys(zip.files)
    .filter((n) => /^ppt\/media\/.*\.(png|jpe?g)$/i.test(n))
    .sort((a, b) => {
      const na = parseInt((a.match(/(\d+)\.\w+$/) || [])[1] || "0", 10);
      const nb = parseInt((b.match(/(\d+)\.\w+$/) || [])[1] || "0", 10);
      return na - nb;
    });

  const images = [];
  for (const name of names) {
    const buf = await zip.files[name].async("nodebuffer");
    if (buf.length >= 5000) images.push(buf); // descarta iconos/logos chicos
    if (images.length >= maxImages) break;
  }
  return images;
}

module.exports = { extractPptxText, extractPptxImages };

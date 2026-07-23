"use strict";

// Fallback "visualizer": cuando un deck no tiene texto extraible (PDF escaneado
// o slides que son imagenes), transcribimos las imagenes a texto con gpt-4o
// vision. El resto del pipeline (extraccion + scoring) sigue igual, consumiendo
// ese texto.
//
// Self-contained (no depende de openai.js): su propio fetch a la API de OpenAI.

const OPENAI_URL = "https://api.openai.com/v1/chat/completions";
const MODEL = "gpt-4o";
const TIMEOUT_MS = 120000; // vision con varias imagenes puede tardar

/**
 * Transcribe una lista de imagenes (slides) a texto "Slide 1: ...\nSlide 2: ...".
 * @param {Buffer[]} images - PNG/JPEG buffers, en orden de slide
 * @returns {Promise<string>} texto transcripto
 */
async function transcribeDeckImages(images) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("Falta OPENAI_API_KEY en el entorno.");
  if (!Array.isArray(images) || images.length === 0) {
    throw new Error("No hay imagenes para transcribir.");
  }

  const content = [
    {
      type: "text",
      text:
        "Estas imagenes son las slides de un pitch deck (en orden). Transcribí TODO el texto " +
        "visible de cada slide (titulos, bullets, numeros, metricas, labels de graficos y tablas). " +
        "Devolve SOLO la transcripcion con el formato exacto 'Slide 1: ...', nueva linea, 'Slide 2: ...', etc. " +
        "No opines ni resumas; no inventes datos que no esten en la imagen.",
    },
    ...images.map((buf) => ({
      type: "image_url",
      image_url: { url: `data:image/png;base64,${buf.toString("base64")}`, detail: "high" },
    })),
  ];

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  let res;
  try {
    res = await fetch(OPENAI_URL, {
      method: "POST",
      headers: { "content-type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: MODEL,
        temperature: 0.1,
        messages: [{ role: "user", content }],
      }),
      signal: controller.signal,
    });
  } catch (err) {
    if (err.name === "AbortError") throw new Error(`OpenAI vision no respondio en ${TIMEOUT_MS / 1000}s.`);
    throw new Error(`Error de red con OpenAI vision: ${err.message}`);
  } finally {
    clearTimeout(timer);
  }

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`OpenAI vision respondio ${res.status}: ${body.slice(0, 300)}`);
  }

  const data = await res.json();
  const text = (data?.choices?.[0]?.message?.content || "").trim();
  if (!text) throw new Error("OpenAI vision no devolvio transcripcion.");
  return text;
}

module.exports = { transcribeDeckImages };

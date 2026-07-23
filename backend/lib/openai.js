"use strict";

// Cliente minimo de OpenAI Chat Completions usando fetch nativo (Node 18+).
// La API key SIEMPRE sale de process.env.OPENAI_API_KEY, nunca hardcodeada
// ni devuelta al cliente.

const OPENAI_URL = "https://api.openai.com/v1/chat/completions";
const MODEL = "gpt-4o";
const TIMEOUT_MS = 60000; // corta si OpenAI tarda demasiado (no colgar la demo)

/**
 * Hace una llamada a Chat Completions forzando JSON valido y lo parsea.
 * @param {{ system: string, user: string }} params
 * @returns {Promise<object>} el JSON ya parseado
 */
async function chatJson({ system, user }) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("Falta OPENAI_API_KEY en el entorno.");
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  let res;
  try {
    res = await fetch(OPENAI_URL, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: MODEL,
        temperature: 0.2,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
      }),
      signal: controller.signal,
    });
  } catch (err) {
    if (err.name === "AbortError") {
      throw new Error(`OpenAI no respondio en ${TIMEOUT_MS / 1000}s (timeout).`);
    }
    throw new Error(`Error de red hablando con OpenAI: ${err.message}`);
  } finally {
    clearTimeout(timer);
  }

  if (!res.ok) {
    const errBody = await res.text().catch(() => "");
    throw new Error(`OpenAI respondio ${res.status}: ${errBody.slice(0, 500)}`);
  }

  const data = await res.json();
  const content = data?.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error("OpenAI no devolvio contenido en la respuesta.");
  }

  // Como usamos response_format json_object el content ya deberia ser JSON,
  // igual envolvemos en try/catch por las dudas.
  try {
    return JSON.parse(content);
  } catch (e) {
    throw new Error(`OpenAI devolvio algo no parseable como JSON: ${content.slice(0, 500)}`);
  }
}

// ---------------------------------------------------------------------------
// LLAMADA 1 — extraccion estructurada (sin opinar todavia)
// ---------------------------------------------------------------------------
async function extraerSenal(deckText) {
  const system = [
    "Sos un analista que lee pitch decks y extrae senal estructurada sin opinar todavia.",
    "No evalues ni puntues: solo extrae lo que el deck afirma.",
    "Responde SIEMPRE en espanol y devolve EXCLUSIVAMENTE un objeto JSON con esta forma exacta:",
    `{
  "vertical": string,
  "modelo_negocio": string,
  "etapa": "pre-seed"|"seed"|"serie A"|"serie B+"|"no especificado",
  "kpis": [{ "nombre": string, "valor": string, "verificable": boolean }],
  "claims": [{ "texto": string, "categoria": "roadmap"|"cliente"|"mercado"|"equipo"|"otro" }],
  "team": { "menciona_equipo": boolean, "resumen": string },
  "mercado": { "tam_mencionado": boolean, "metodo": "top-down"|"bottom-up"|"no especificado", "resumen": string }
}`,
    "Regla para kpis.verificable: poné false si el founder afirma un numero sin mostrar fuente, curva o metodo de calculo; true solo si hay evidencia visible.",
    "Regla para etapa: inferila del monto del ask, la traccion y el lenguaje. Ej: sin revenue o idea temprana = pre-seed; primeros clientes/MRR bajo = seed; PMF y crecimiento con metricas = serie A; escala consolidada = serie B+. Si no hay senal, 'no especificado'.",
  ].join("\n");

  const user = `Texto del pitch deck:\n\n${deckText}`;

  return chatJson({ system, user });
}

// ---------------------------------------------------------------------------
// LLAMADA 2 — razonamiento y scoring (alimenta dos vistas)
// ---------------------------------------------------------------------------
async function evaluarDeck(extraccion, deckText) {
  const system = [
    "Sos un inversor senior evaluando este deck con rigor, pero el output debe alimentar DOS vistas distintas:",
    "una vista VC (dura, directa, con red flags) y una vista founder (constructiva, accionable).",
    "Responde SIEMPRE en espanol y devolve EXCLUSIVAMENTE un objeto JSON con esta forma exacta:",
    `{
  "vc_view": {
    "score_general": number,
    "scores": {
      "team_market_fit": number,
      "evidencia_pmf": number,
      "realismo_tam": number,
      "unit_economics": number,
      "defensibilidad": number
    },
    "red_flags": [string],
    "resumen_duro": string
  },
  "founder_view": {
    "score_general": number,
    "fortalezas": [string],
    "areas_a_mejorar": [string],
    "hipotesis_pmf_a_testear": [string],
    "resumen_constructivo": string
  }
}`,
    "score_general va de 0 a 100. Los scores internos van de 0 a 10.",
    "evidencia_pmf debe basarse en retencion y uso organico, NO en growth vanidoso.",
    "resumen_duro: 2-3 frases, directo, sin suavizar.",
    "hipotesis_pmf_a_testear: sugerencias accionables y concretas (ej: 'instrumentar cohortes de retencion a 30/60/90 dias').",
  ].join("\n");

  const user = [
    "Senal estructurada extraida del deck (JSON):",
    JSON.stringify(extraccion, null, 2),
    "",
    "Texto original del deck:",
    deckText,
  ].join("\n");

  return chatJson({ system, user });
}

module.exports = { extraerSenal, evaluarDeck };

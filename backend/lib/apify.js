"use strict";

// Enriquecimiento de equipo vía Apify (actor harvestapi/linkedin-profile-scraper).
// Dado un set de URLs de LinkedIn, scrapea los perfiles y los resume a un shape
// compacto que se le pasa a OpenAI para evaluar el equipo, y que además alimenta
// la ficha de "Founding team" del console.
//
// El token sale de APIFY_API_TOKEN (nunca hardcodeado). Si falta, o si el scrape
// falla/tarda, el llamador degrada: el análisis sigue sin datos de LinkedIn.

const ACTOR_ID = "LpVuK3Zozwuipa5bp"; // harvestapi/linkedin-profile-scraper
const SCRAPER_MODE = "Profile details no email ($4 per 1k)";
const TIMEOUT_MS = 100000; // el run-sync puede tardar; cortamos a 100s

// Extrae el "public identifier" (slug) de una URL de LinkedIn para matchear
// perfiles scrapeados contra las URLs de entrada.
function publicIdFromUrl(url = "") {
  const m = String(url).match(/linkedin\.com\/in\/([^/?#]+)/i);
  return m ? m[1].toLowerCase() : String(url).trim().toLowerCase();
}

function normalizeSkills(p) {
  const top = Array.isArray(p.topSkills) ? p.topSkills : [];
  if (top.length) return top.slice(0, 12);
  const skills = Array.isArray(p.skills) ? p.skills : [];
  return skills
    .map((s) => (typeof s === "string" ? s : s?.name || s?.title || ""))
    .filter(Boolean)
    .slice(0, 12);
}

// Reduce el perfil crudo de Apify a lo útil para el análisis (compacto para el prompt).
function summarizeProfile(p) {
  const name = [p.firstName, p.lastName].filter(Boolean).join(" ") || p.publicIdentifier || "";
  return {
    query: p.originalQuery?.query || p.linkedinUrl || "",
    publicIdentifier: (p.publicIdentifier || "").toLowerCase(),
    url: p.linkedinUrl || "",
    name,
    headline: p.headline || "",
    location: p.location?.linkedinText || p.location?.parsed?.text || "",
    about: (p.about || "").slice(0, 600),
    experience: (p.experience || []).slice(0, 6).map((e) => ({
      role: e.position || "",
      company: e.companyName || "",
      duration: e.duration || "",
      description: (e.description || "").slice(0, 200),
    })),
    education: (p.education || []).slice(0, 4).map((e) => ({
      school: e.schoolName || "",
      degree: e.degree || "",
      field: e.fieldOfStudy || "",
      period: e.period || "",
    })),
    skills: normalizeSkills(p),
    followers: p.followerCount ?? null,
    connections: p.connectionsCount ?? null,
  };
}

/**
 * Scrapea perfiles de LinkedIn y los resume.
 * @param {string[]} urls - URLs de LinkedIn (in/…)
 * @returns {Promise<object[]>} perfiles resumidos (uno por perfil scrapeado)
 * @throws si falta el token o la API responde error (el llamador debe degradar)
 */
async function scrapeLinkedInProfiles(urls) {
  const clean = [...new Set((urls || []).map((u) => String(u).trim()).filter(Boolean))];
  if (clean.length === 0) return [];

  const token = process.env.APIFY_API_TOKEN;
  if (!token) throw new Error("Falta APIFY_API_TOKEN en el entorno.");

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  let res;
  try {
    res = await fetch(
      `https://api.apify.com/v2/acts/${ACTOR_ID}/run-sync-get-dataset-items?token=${encodeURIComponent(token)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ queries: clean, profileScraperMode: SCRAPER_MODE }),
        signal: controller.signal,
      }
    );
  } catch (err) {
    if (err.name === "AbortError") throw new Error(`Apify no respondio en ${TIMEOUT_MS / 1000}s (timeout).`);
    throw new Error(`Error de red con Apify: ${err.message}`);
  } finally {
    clearTimeout(timer);
  }

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Apify respondio ${res.status}: ${body.slice(0, 300)}`);
  }

  const items = await res.json();
  if (!Array.isArray(items)) return [];
  return items.map(summarizeProfile);
}

module.exports = { scrapeLinkedInProfiles, publicIdFromUrl };

// Funció serverless: guarda i llegeix les dades compartides de la web
// (anuncis, vots de l'enquesta, dades editables) fent servir Netlify Blobs,
// l'emmagatzematge propi de Netlify — no cal cap compte ni clau externa.

const { getStore } = require("@netlify/blobs");

// Només aquestes claus es poden llegir/escriure, per seguretat.
// "editor-unlocked" i "my-poll-votes" NO hi són: són dades personals
// de cada navegador i es guarden amb localStorage, no aquí.
const ALLOWED_KEYS = new Set([
  "flat-ads",
  "poll-votes",
  "ticket-data",
  "map-data-v2",
  "aids-data",
  "news-items",
]);

exports.handler = async function (event) {
  let store;
  try {
    // Normalment Netlify configura Netlify Blobs automàticament, però en
    // aquest projecte cal indicar-ho manualment amb el Site ID i un token
    // (es guarden com a variables d'entorn a Netlify, no aquí al codi).
    if (process.env.NETLIFY_SITE_ID && process.env.NETLIFY_BLOBS_TOKEN) {
      store = getStore({
        name: "habitatge-data",
        siteID: process.env.NETLIFY_SITE_ID,
        token: process.env.NETLIFY_BLOBS_TOKEN,
      });
    } else {
      store = getStore("habitatge-data");
    }
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "No s'ha pogut inicialitzar l'emmagatzematge: " + err.message }),
    };
  }

  if (event.httpMethod === "GET") {
    const key = (event.queryStringParameters || {}).key;
    if (!ALLOWED_KEYS.has(key)) {
      return { statusCode: 400, body: JSON.stringify({ error: "Clau no vàlida" }) };
    }
    try {
      const value = await store.get(key);
      return {
        statusCode: 200,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(value !== null && value !== undefined ? { value } : null),
      };
    } catch (err) {
      return { statusCode: 500, body: JSON.stringify({ error: "Error llegint: " + err.message }) };
    }
  }

  if (event.httpMethod === "POST") {
    let key, value;
    try {
      const data = JSON.parse(event.body);
      key = data.key;
      value = data.value;
    } catch (e) {
      return { statusCode: 400, body: JSON.stringify({ error: "Petició no vàlida" }) };
    }
    if (!ALLOWED_KEYS.has(key)) {
      return { statusCode: 400, body: JSON.stringify({ error: "Clau no vàlida" }) };
    }
    if (typeof value !== "string" || value.length > 300000) {
      return { statusCode: 400, body: JSON.stringify({ error: "Valor no vàlid" }) };
    }
    try {
      await store.set(key, value);
      return {
        statusCode: 200,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ success: true }),
      };
    } catch (err) {
      return { statusCode: 500, body: JSON.stringify({ error: "Error guardant: " + err.message }) };
    }
  }

  return { statusCode: 405, body: "Mètode no permès" };
};

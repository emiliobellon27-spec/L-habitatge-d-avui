// Funció serverless: rep un correu des del formulari de la web
// i el dona d'alta a la teva llista de Brevo, sense exposar la clau API.
//
// La clau (BREVO_API_KEY) i l'ID de la llista (BREVO_LIST_ID) es guarden
// com a "variables d'entorn" a Netlify, NO aquí al codi.

exports.handler = async function (event) {
  // Només acceptem peticions POST
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Mètode no permès" };
  }

  let email;
  try {
    const data = JSON.parse(event.body);
    email = (data.email || "").trim();
  } catch (e) {
    return { statusCode: 400, body: JSON.stringify({ error: "Petició no vàlida" }) };
  }

  // Validació bàsica del correu
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    return { statusCode: 400, body: JSON.stringify({ error: "Correu no vàlid" }) };
  }

  const BREVO_API_KEY = process.env.BREVO_API_KEY;
  const BREVO_LIST_ID = process.env.BREVO_LIST_ID; // número de la llista a Brevo

  if (!BREVO_API_KEY || !BREVO_LIST_ID) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Falta configurar BREVO_API_KEY o BREVO_LIST_ID a Netlify" }),
    };
  }

  try {
    const response = await fetch("https://api.brevo.com/v3/contacts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": BREVO_API_KEY,
      },
      body: JSON.stringify({
        email: email,
        listIds: [parseInt(BREVO_LIST_ID, 10)],
        updateEnabled: true, // si ja existeix, no dona error
      }),
    });

    // Brevo retorna 201 (creat) o 204 (actualitzat) quan tot va bé
    if (response.status === 201 || response.status === 204) {
      return {
        statusCode: 200,
        body: JSON.stringify({ success: true }),
      };
    }

    const errorData = await response.json().catch(() => ({}));
    return {
      statusCode: response.status,
      body: JSON.stringify({ error: errorData.message || "Error connectant amb Brevo" }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Error inesperat: " + err.message }),
    };
  }
};

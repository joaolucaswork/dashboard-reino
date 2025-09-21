// Teste simples da API com JSForce
const fetch = require("node-fetch");

async function testarAPI() {
  try {
    console.log("🔄 Testando API do Salesforce com JSForce...");

    const response = await fetch(
      "http://localhost:5173/api/carteiras?source=salesforce"
    );
    const data = await response.text();

    console.log("📊 Status:", response.status);
    console.log("📄 Resposta:", data);

    if (response.ok) {
      const json = JSON.parse(data);
      console.log("✅ Total de carteiras:", json.total);
      console.log("📝 Primeiras 3 carteiras:", json.carteiras.slice(0, 3));
    }
  } catch (error) {
    console.error("❌ Erro:", error.message);
  }
}

testarAPI();

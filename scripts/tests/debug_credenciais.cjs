#!/usr/bin/env node

/**
 * Script para debugar problema de credenciais
 * Verifica se as credenciais estão sendo salvas e enviadas corretamente
 */

const BASE_URL = "http://localhost:5173";

async function debugCredenciais() {
  console.log("🔍 Debugando problema de credenciais...\n");

  try {
    // Teste 1: Verificar se o localStorage está funcionando
    console.log("📋 Teste 1: Verificando localStorage via browser...");
    console.log("Execute no console do browser (F12):");
    console.log("localStorage.getItem('comdinheiro_username')");
    console.log("localStorage.getItem('comdinheiro_password')");
    console.log("");

    // Teste 2: Fazer uma requisição de teste para ver os headers
    console.log("📋 Teste 2: Testando requisição com headers...");
    
    const testCredentials = {
      username: "reino.backoffice",
      password: "Casa102asd@"
    };

    const response = await fetch(`${BASE_URL}/api/comdinheiro`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-comdinheiro-username": testCredentials.username,
        "x-comdinheiro-password": testCredentials.password,
      },
      body: JSON.stringify({
        action: "consultar",
        carteira: "Luiz_Antonio_De_Andrade_Galamba",
        data_final: "2025-09-19",
        view_type: "consolidado"
      }),
    });

    console.log(`Status: ${response.status}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.log(`Erro: ${errorText}`);
    } else {
      const data = await response.json();
      console.log(`Sucesso: ${data.success}`);
      if (!data.success) {
        console.log(`Erro da API: ${data.error}`);
      }
    }

  } catch (error) {
    console.error("❌ Erro no debug:", error.message);
  }
}

debugCredenciais();

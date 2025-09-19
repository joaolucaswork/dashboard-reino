/**
 * Script de Teste Completo - API Comdinheiro SvelteKit Nativa
 *
 * Este script testa nossa implementação SvelteKit 100% nativa da API Comdinheiro.
 * Implementação otimizada, leve e sem dependências externas.
 */

const BASE_URL = "http://localhost:5173"; // URL do SvelteKit dev server

// Credenciais de teste (substitua pelas suas)
const CREDENTIALS = {
  username: "seu.usuario@email.com",
  password: "sua_senha_aqui",
};

// Cores para output no console
const colors = {
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  reset: "\x1b[0m",
  bold: "\x1b[1m",
};

function log(message, color = "reset") {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function testarAPI() {
  log("🚀 Iniciando testes da API Comdinheiro SvelteKit Nativa", "bold");
  log("=" * 60, "blue");

  try {
    // Teste 1: Listar ferramentas disponíveis
    log("\n📋 Teste 1: Listando ferramentas disponíveis", "yellow");
    const ferramentasResponse = await fetch(
      `${BASE_URL}/api/comdinheiro?action=ferramentas`
    );
    const ferramentasData = await ferramentasResponse.json();

    if (ferramentasData.success) {
      log(
        `✅ ${ferramentasData.ferramentas.length} ferramentas encontradas`,
        "green"
      );
      ferramentasData.ferramentas.slice(0, 5).forEach((ferramenta) => {
        log(`   • ${ferramenta}`, "blue");
      });
      if (ferramentasData.ferramentas.length > 5) {
        log(
          `   ... e mais ${ferramentasData.ferramentas.length - 5} ferramentas`,
          "blue"
        );
      }
    } else {
      log("❌ Erro ao listar ferramentas", "red");
      return;
    }

    // Teste 2: Gerar código JavaScript
    log("\n🔧 Teste 2: Gerando código JavaScript", "yellow");
    const codigoParams = new URLSearchParams({
      action: "gerar-codigo",
      username: CREDENTIALS.username,
      password: CREDENTIALS.password,
      url: "HistoricoCotacao002.php?x=NTNB_15082004_15052024+CDI&data_ini=13032024&data_fim=14032024",
      format: "JSON3",
      language: "JavaScript",
    });

    const codigoResponse = await fetch(
      `${BASE_URL}/api/comdinheiro?${codigoParams}`
    );
    const codigoData = await codigoResponse.json();

    if (codigoData.success) {
      log("✅ Código JavaScript gerado com sucesso", "green");
      log("📄 Primeiras linhas do código:", "blue");
      const linhas = codigoData.codigo.split("\n").slice(0, 3);
      linhas.forEach((linha) => log(`   ${linha}`, "blue"));
    } else {
      log("❌ Erro ao gerar código", "red");
    }

    // Teste 3: Consulta real (apenas se credenciais válidas)
    if (CREDENTIALS.username !== "seu.usuario@email.com") {
      log("\n🔍 Teste 3: Executando consulta real", "yellow");

      const consultaResponse = await fetch(`${BASE_URL}/api/comdinheiro`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: CREDENTIALS.username,
          password: CREDENTIALS.password,
          url: "HistoricoCotacao002.php?x=NTNB_15082004_15052024+CDI&data_ini=13032024&data_fim=14032024",
          format: "JSON3",
        }),
      });

      const consultaData = await consultaResponse.json();

      if (consultaData.success) {
        log("✅ Consulta executada com sucesso", "green");
        log(`📊 Formato: ${consultaData.format}`, "blue");
        log(`🔗 URL: ${consultaData.url}`, "blue");

        // Analisar estrutura dos dados
        if (consultaData.data && typeof consultaData.data === "object") {
          const keys = Object.keys(consultaData.data);
          log(
            `📋 Estrutura dos dados: ${keys.length} propriedades principais`,
            "blue"
          );
          keys.slice(0, 3).forEach((key) => {
            log(`   • ${key}`, "blue");
          });
        }
      } else {
        log(`❌ Erro na consulta: ${consultaData.error}`, "red");
      }
    } else {
      log("\n⚠️  Teste 3: Pulado (configure credenciais válidas)", "yellow");
    }

    // Teste 4: Validação de parâmetros
    log("\n🛡️  Teste 4: Validação de parâmetros", "yellow");

    const invalidResponse = await fetch(`${BASE_URL}/api/comdinheiro`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: "",
        password: "",
        url: "",
        format: "INVALID",
      }),
    });

    const invalidData = await invalidResponse.json();

    if (!invalidData.success && invalidData.error) {
      log("✅ Validação funcionando corretamente", "green");
      log(`📝 Erro esperado: ${invalidData.error}`, "blue");
    } else {
      log("❌ Validação não está funcionando", "red");
    }

    log("\n" + "=" * 60, "blue");
    log("🎉 Testes concluídos!", "bold");
  } catch (error) {
    log(`\n❌ Erro durante os testes: ${error.message}`, "red");
    log(
      "💡 Certifique-se de que o servidor SvelteKit está rodando em localhost:5173",
      "yellow"
    );
  }
}

// Função para testar performance
async function testarPerformance() {
  log("\n⚡ Teste de Performance", "yellow");

  const start = Date.now();

  try {
    const response = await fetch(
      `${BASE_URL}/api/comdinheiro?action=ferramentas`
    );
    const data = await response.json();

    const end = Date.now();
    const tempo = end - start;

    if (data.success) {
      log(`✅ Resposta em ${tempo}ms`, "green");
      if (tempo < 100) {
        log("🚀 Performance excelente!", "green");
      } else if (tempo < 500) {
        log("👍 Performance boa", "blue");
      } else {
        log("⚠️  Performance pode ser melhorada", "yellow");
      }
    }
  } catch (error) {
    log(`❌ Erro no teste de performance: ${error.message}`, "red");
  }
}

// Executar testes
async function main() {
  await testarAPI();
  await testarPerformance();

  log("\n📖 Como usar:", "bold");
  log("1. Configure suas credenciais no objeto CREDENTIALS", "blue");
  log("2. Inicie o servidor SvelteKit: npm run dev", "blue");
  log("3. Execute este script: node teste_comdinheiro_completo.js", "blue");
  log("4. Acesse a interface em: http://localhost:5173/comdinheiro", "blue");
  log("5. ✨ Aproveite a implementação nativa otimizada!", "blue");
}

// Verificar se está sendo executado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { testarAPI, testarPerformance };

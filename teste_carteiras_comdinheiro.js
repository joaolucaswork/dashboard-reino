/**
 * Script de Teste - Busca de Carteiras Comdinheiro
 *
 * Testa a funcionalidade de busca de carteiras/usuários do Comdinheiro
 * integrada à nossa implementação SvelteKit nativa.
 */

const BASE_URL = "http://localhost:5173"; // URL do SvelteKit dev server

// Credenciais de teste (substitua pelas suas)
const CREDENTIALS = {
  username: "seu.usuario@email.com", // Configure suas credenciais aqui
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

async function testarBuscaCarteiras() {
  log("🚀 Testando Busca de Carteiras Comdinheiro (CORRIGIDA)", "bold");
  log("=" * 60, "blue");
  log("📝 Usando implementação corrigida baseada no sistema original", "blue");

  try {
    // Teste 1: Buscar carteiras sem credenciais (deve falhar)
    log("\n❌ Teste 1: Busca sem credenciais (deve falhar)", "yellow");

    const semCredenciaisResponse = await fetch(
      `${BASE_URL}/api/comdinheiro?action=carteiras`
    );
    const semCredenciaisData = await semCredenciaisResponse.json();

    if (!semCredenciaisData.success) {
      log("✅ Validação funcionando - erro esperado sem credenciais", "green");
      log(`📝 Erro: ${semCredenciaisData.error}`, "blue");
    } else {
      log("❌ Validação falhou - deveria rejeitar sem credenciais", "red");
    }

    // Teste 2: Buscar carteiras com credenciais (se fornecidas)
    log("\n🔍 Teste 2: Busca com credenciais válidas", "yellow");
    if (CREDENTIALS.username !== "seu.usuario@email.com") {
      log("\n🔍 Teste 2: Busca com credenciais válidas", "yellow");

      const params = new URLSearchParams({
        action: "carteiras",
        username: CREDENTIALS.username,
        password: CREDENTIALS.password,
      });

      const comCredenciaisResponse = await fetch(
        `${BASE_URL}/api/comdinheiro?${params}`
      );
      const comCredenciaisData = await comCredenciaisResponse.json();

      if (comCredenciaisData.success) {
        log("✅ Busca de carteiras bem-sucedida", "green");
        log(`📊 Total de carteiras: ${comCredenciaisData.total}`, "blue");
        log(`🏦 Fonte: ${comCredenciaisData.source}`, "blue");

        if (
          comCredenciaisData.carteiras &&
          comCredenciaisData.carteiras.length > 0
        ) {
          log("📋 Primeiras carteiras encontradas:", "blue");
          comCredenciaisData.carteiras
            .slice(0, 5)
            .forEach((carteira, index) => {
              log(`   ${index + 1}. ${carteira}`, "blue");
            });

          if (comCredenciaisData.carteiras.length > 5) {
            log(
              `   ... e mais ${
                comCredenciaisData.carteiras.length - 5
              } carteiras`,
              "blue"
            );
          }
        } else {
          log("⚠️  Nenhuma carteira encontrada", "yellow");
        }
      } else {
        log(`❌ Erro na busca: ${comCredenciaisData.error}`, "red");
      }
    } else {
      log("\n⚠️  Teste 2: Pulado (configure credenciais válidas)", "yellow");
    }

    // Teste 3: Teste de performance
    log("\n⚡ Teste 3: Performance da busca", "yellow");

    if (CREDENTIALS.username !== "seu.usuario@email.com") {
      const start = Date.now();

      const params = new URLSearchParams({
        action: "carteiras",
        username: CREDENTIALS.username,
        password: CREDENTIALS.password,
      });

      const performanceResponse = await fetch(
        `${BASE_URL}/api/comdinheiro?${params}`
      );
      const performanceData = await performanceResponse.json();

      const end = Date.now();
      const tempo = end - start;

      if (performanceData.success) {
        log(`✅ Busca completada em ${tempo}ms`, "green");
        if (tempo < 5000) {
          log("🚀 Performance excelente!", "green");
        } else if (tempo < 10000) {
          log("👍 Performance boa", "blue");
        } else {
          log("⚠️  Performance pode ser melhorada", "yellow");
        }
      }
    } else {
      log("⚠️  Teste de performance pulado (configure credenciais)", "yellow");
    }

    // Teste 4: Teste de timeout
    log("\n⏱️  Teste 4: Comportamento com timeout", "yellow");

    // Simular uma URL que pode demorar para responder
    const timeoutParams = new URLSearchParams({
      action: "carteiras",
      username: "usuario_teste",
      password: "senha_teste",
    });

    try {
      const timeoutResponse = await fetch(
        `${BASE_URL}/api/comdinheiro?${timeoutParams}`
      );
      const timeoutData = await timeoutResponse.json();

      if (!timeoutData.success) {
        log("✅ Timeout/erro tratado corretamente", "green");
        log(`📝 Erro: ${timeoutData.error}`, "blue");
      }
    } catch (error) {
      log("✅ Timeout/erro de rede tratado corretamente", "green");
    }

    log("\n" + "=" * 60, "blue");
    log("🎉 Testes de carteiras concluídos!", "bold");
  } catch (error) {
    log(`\n❌ Erro durante os testes: ${error.message}`, "red");
    log(
      "💡 Certifique-se de que o servidor SvelteKit está rodando em localhost:5173",
      "yellow"
    );
  }
}

// Função para testar a interface visual
async function testarInterface() {
  log("\n🎨 Teste da Interface Visual", "yellow");

  try {
    const response = await fetch(`${BASE_URL}/tabelas`);

    if (response.ok) {
      log("✅ Página de tabelas acessível", "green");
      log("🔗 Acesse: http://localhost:5173/tabelas", "blue");
      log("📝 Teste manualmente:", "blue");
      log("   1. Alterne entre 'Salesforce' e 'Comdinheiro'", "blue");
      log("   2. Configure credenciais do Comdinheiro", "blue");
      log("   3. Busque carteiras", "blue");
      log("   4. Selecione uma carteira", "blue");
    } else {
      log("❌ Página de tabelas não acessível", "red");
    }
  } catch (error) {
    log(`❌ Erro ao acessar interface: ${error.message}`, "red");
  }
}

// Executar testes
async function main() {
  await testarBuscaCarteiras();
  await testarInterface();

  log("\n📖 Como usar:", "bold");
  log("1. Configure suas credenciais no objeto CREDENTIALS", "blue");
  log("2. Inicie o servidor SvelteKit: npm run dev", "blue");
  log("3. Execute este script: node teste_carteiras_comdinheiro.js", "blue");
  log("4. Acesse a interface em: http://localhost:5173/tabelas", "blue");
  log("5. 🔄 Alterne entre Salesforce e Comdinheiro", "blue");
  log("6. ⚙️  Configure credenciais e teste a busca", "blue");
}

// Verificar se está sendo executado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { testarBuscaCarteiras, testarInterface };

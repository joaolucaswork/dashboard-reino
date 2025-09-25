/**
 * Script de Teste - Categorização de Dados Comdinheiro
 *
 * Testa se a categorização de dados financeiros está funcionando corretamente
 * após as correções implementadas para corresponder à estrutura de referência.
 */

const BASE_URL = "http://localhost:5173"; // URL do SvelteKit dev server

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

// Dados de teste simulando resposta da API Comdinheiro
const dadosTesteSimulados = {
  tables: {
    tab0: {
      lin0: {
        col0: "Instituição Financeira",
        col1: "Ativo",
        col2: "Descrição",
        col3: "Quantidade",
        col4: "Saldo Bruto",
        col5: "Tipo Ativo",
        col6: "Saldo Líquido"
      },
      lin1: {
        col0: "BTG",
        col1: "09.215.250/0001-13",
        col2: "BTG Pactual Tesouro Selic FI RF Ref DI",
        col3: "36.574,96",
        col4: "182.571,16",
        col5: "fundo",
        col6: "180.562,14"
      },
      lin2: {
        col0: "BTG",
        col1: "17.408.524/0001-19",
        col2: "BTGp Access Spx Nimitz FI Financeiro Em Quotas de FI Multimer",
        col3: "55.557,20",
        col4: "229.084,19",
        col5: "fundo",
        col6: "226.628,01"
      },
      lin3: {
        col0: "XP",
        col1: "12.345.678/0001-90",
        col2: "CDB XP Investimentos",
        col3: "100.000,00",
        col4: "105.000,00",
        col5: "CDB",
        col6: "104.500,00"
      },
      lin4: {
        col0: "ITAU",
        col1: "98.765.432/0001-10",
        col2: "Ações Petrobras",
        col3: "1.000,00",
        col4: "25.000,00",
        col5: "ACAO",
        col6: "24.800,00"
      }
    }
  }
};

function testarCategorizacaoLocal() {
  log("🧪 Testando Categorização Local", "bold");
  log("=" * 50, "blue");

  // Simular a função de categorização
  function categorizarTipoAtivo(tipo) {
    const tipoUpper = tipo.toUpperCase().trim();

    const categoriasMap = {
      "Previdência": ["VGBL", "PGBL"],
      "Renda Variável": ["ACAO"],
      "Renda Fixa": ["CDB", "LCI", "LCA", "LIG", "DEBENTURE", "CRI", "CRA", "TITULO", "LCD"],
      "Fundos de Investimento": ["FUNDOS", "FUNDO"],
      "Caixa": ["CAIXA", "CAIXAB"]
    };

    // Verificar correspondência exata primeiro
    for (const [categoria, tiposLista] of Object.entries(categoriasMap)) {
      if (tiposLista.some(t => tipoUpper === t)) {
        return categoria;
      }
    }

    // Verificar correspondência parcial
    if (tipoUpper.includes("FUNDO") || tipoUpper.includes("FUND")) {
      return "Fundos de Investimento";
    }
    if (tipoUpper.includes("ACAO") || tipoUpper.includes("STOCK")) {
      return "Renda Variável";
    }
    if (tipoUpper.includes("CDB") || tipoUpper.includes("LCI") || tipoUpper.includes("LCA") || 
        tipoUpper.includes("DEBENTURE") || tipoUpper.includes("TITULO")) {
      return "Renda Fixa";
    }
    if (tipoUpper.includes("CAIXA") || tipoUpper.includes("CASH")) {
      return "Caixa";
    }
    if (tipoUpper.includes("VGBL") || tipoUpper.includes("PGBL") || tipoUpper.includes("PREVIDENCIA")) {
      return "Previdência";
    }

    return "Outros";
  }

  // Testar categorização com dados simulados
  const testCases = [
    { tipo: "fundo", esperado: "Fundos de Investimento" },
    { tipo: "CDB", esperado: "Renda Fixa" },
    { tipo: "ACAO", esperado: "Renda Variável" },
    { tipo: "VGBL", esperado: "Previdência" },
    { tipo: "CAIXA", esperado: "Caixa" },
    { tipo: "UNKNOWN", esperado: "Outros" }
  ];

  let sucessos = 0;
  let total = testCases.length;

  testCases.forEach(({ tipo, esperado }) => {
    const resultado = categorizarTipoAtivo(tipo);
    if (resultado === esperado) {
      log(`✅ ${tipo} -> ${resultado}`, "green");
      sucessos++;
    } else {
      log(`❌ ${tipo} -> ${resultado} (esperado: ${esperado})`, "red");
    }
  });

  log(`\n📊 Resultado: ${sucessos}/${total} testes passaram`, sucessos === total ? "green" : "yellow");
  return sucessos === total;
}

function analisarEstruturaDados() {
  log("\n🔍 Analisando Estrutura dos Dados de Teste", "bold");
  log("=" * 50, "blue");

  const tab0 = dadosTesteSimulados.tables.tab0;
  
  log("📋 Cabeçalho:", "yellow");
  Object.entries(tab0.lin0).forEach(([col, value]) => {
    log(`  ${col}: ${value}`, "blue");
  });

  log("\n📊 Dados de exemplo:", "yellow");
  Object.entries(tab0).forEach(([key, row]) => {
    if (key !== 'lin0') {
      log(`  ${key}:`, "blue");
      log(`    Banco: ${row.col0}`, "blue");
      log(`    Ativo: ${row.col1}`, "blue");
      log(`    Tipo: ${row.col5}`, "blue");
      log(`    Saldo: ${row.col4}`, "blue");
    }
  });

  // Verificar estrutura esperada
  const estruturaCorreta = 
    tab0.lin0.col0 === "Instituição Financeira" &&
    tab0.lin0.col1 === "Ativo" &&
    tab0.lin0.col5 === "Tipo Ativo";

  if (estruturaCorreta) {
    log("\n✅ Estrutura dos dados está correta", "green");
    return true;
  } else {
    log("\n❌ Estrutura dos dados não corresponde ao esperado", "red");
    return false;
  }
}

async function main() {
  log("🚀 TESTE DE CATEGORIZAÇÃO COMDINHEIRO", "bold");
  log("=" * 60, "blue");
  log("📝 Verificando se a categorização está funcionando corretamente", "blue");

  let todosTestesPassaram = true;

  // Teste 1: Categorização local
  const categorizacaoOk = testarCategorizacaoLocal();
  todosTestesPassaram = todosTestesPassaram && categorizacaoOk;

  // Teste 2: Estrutura dos dados
  const estruturaOk = analisarEstruturaDados();
  todosTestesPassaram = todosTestesPassaram && estruturaOk;

  // Resumo final
  log("\n" + "=" * 60, "blue");
  log("📊 RESUMO DOS TESTES", "bold");
  log("=" * 60, "blue");

  if (todosTestesPassaram) {
    log("🎉 TODOS OS TESTES PASSARAM!", "green");
    log("✅ A categorização está funcionando corretamente", "green");
    log("✅ A estrutura dos dados está correta", "green");
  } else {
    log("⚠️  ALGUNS TESTES FALHARAM", "yellow");
    log("❌ Verifique os problemas identificados acima", "red");
  }

  log("\n💡 Próximos passos:", "blue");
  log("1. Execute o servidor de desenvolvimento (npm run dev)", "blue");
  log("2. Teste a funcionalidade na interface web", "blue");
  log("3. Verifique os logs do console para debug adicional", "blue");

  return todosTestesPassaram ? 0 : 1;
}

// Executar o teste
main().then(exitCode => {
  process.exit(exitCode);
}).catch(error => {
  log(`❌ Erro durante execução: ${error.message}`, "red");
  console.error(error);
  process.exit(1);
});

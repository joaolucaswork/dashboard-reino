#!/usr/bin/env node

/**
 * Teste de Integração Completa: Salesforce + API Comdinheiro
 * 
 * Este script testa o fluxo completo:
 * 1. Buscar carteiras do Salesforce
 * 2. Usar nome do Comdinheiro para consultar posição consolidada
 * 3. Verificar se os dados são retornados corretamente
 */

const BASE_URL = "http://localhost:5173";

// Configurações de teste
const CREDENTIALS = {
  username: "reino.backoffice", // Configure suas credenciais
  password: "Casa102asd@"       // Configure suas credenciais
};

// Função para logs coloridos
function log(message, color = 'white') {
  const colors = {
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    white: '\x1b[37m',
    reset: '\x1b[0m'
  };
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function testeIntegracaoCompleta() {
  log("🚀 Iniciando Teste de Integração Completa", 'cyan');
  log("=" * 60, 'cyan');

  try {
    // Teste 1: Buscar carteiras do Salesforce
    log("\n📊 Teste 1: Buscando carteiras do Salesforce...", 'yellow');
    
    const responseCarteiras = await fetch(`${BASE_URL}/api/carteiras?source=salesforce`);
    const dataCarteiras = await responseCarteiras.json();

    if (!dataCarteiras.success) {
      throw new Error(`Erro ao buscar carteiras: ${dataCarteiras.error}`);
    }

    log(`✅ ${dataCarteiras.total} carteiras encontradas no Salesforce`, 'green');
    
    // Mostrar algumas carteiras de exemplo
    const carteirasExemplo = dataCarteiras.carteiras_detalhadas.slice(0, 5);
    log("\n📋 Exemplos de carteiras encontradas:", 'blue');
    carteirasExemplo.forEach((carteira, index) => {
      log(`  ${index + 1}. ${carteira.nome} → ${carteira.nome_comdinheiro}`, 'white');
    });

    // Teste 2: Selecionar uma carteira para teste
    const carteiraParaTeste = carteirasExemplo.find(c => c.nome_comdinheiro);
    
    if (!carteiraParaTeste) {
      throw new Error("Nenhuma carteira com nome_comdinheiro encontrada");
    }

    log(`\n🎯 Carteira selecionada para teste: ${carteiraParaTeste.nome_comdinheiro}`, 'magenta');

    // Teste 3: Consultar posição consolidada
    log("\n💰 Teste 2: Consultando posição consolidada...", 'yellow');
    
    const dataFinal = new Date().toISOString().split('T')[0]; // Data atual
    
    const responseConsolidada = await fetch(`${BASE_URL}/api/comdinheiro`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-comdinheiro-username": CREDENTIALS.username,
        "x-comdinheiro-password": CREDENTIALS.password,
      },
      body: JSON.stringify({
        action: "consultar",
        carteira: carteiraParaTeste.nome_comdinheiro,
        data_final: dataFinal,
        view_type: "consolidado"
      }),
    });

    if (!responseConsolidada.ok) {
      const errorText = await responseConsolidada.text();
      throw new Error(`Erro HTTP ${responseConsolidada.status}: ${errorText}`);
    }

    const dataConsolidada = await responseConsolidada.json();

    if (!dataConsolidada.success) {
      throw new Error(`Erro na consulta: ${dataConsolidada.error}`);
    }

    log("✅ Posição consolidada obtida com sucesso!", 'green');
    
    // Analisar dados retornados
    const dados = dataConsolidada.data;
    log("\n📈 Análise dos dados retornados:", 'blue');
    log(`  - Tem tabelas: ${!!dados.tables}`, 'white');
    log(`  - Tipo de tabelas: ${Array.isArray(dados.tables) ? 'array' : 'object'}`, 'white');
    
    if (Array.isArray(dados.tables)) {
      log(`  - Número de tabelas: ${dados.tables.length}`, 'white');
    } else if (dados.tables && typeof dados.tables === 'object') {
      log(`  - Chaves das tabelas: ${Object.keys(dados.tables).join(', ')}`, 'white');
    }

    // Teste 4: Verificar se há dados financeiros
    log("\n💵 Teste 3: Verificando dados financeiros...", 'yellow');
    
    let temDadosFinanceiros = false;
    
    if (dados.tables && typeof dados.tables === 'object' && dados.tables.tab0) {
      const tab0 = dados.tables.tab0;
      const numLinhas = Object.keys(tab0).filter(key => key !== 'lin0').length;
      log(`✅ Encontradas ${numLinhas} linhas de dados na tab0`, 'green');
      temDadosFinanceiros = numLinhas > 0;
    } else if (Array.isArray(dados.tables) && dados.tables.length > 0) {
      log(`✅ Encontradas ${dados.tables.length} tabelas`, 'green');
      temDadosFinanceiros = true;
    } else {
      log("⚠️ Nenhum dado financeiro encontrado", 'yellow');
    }

    // Resumo final
    log("\n" + "=" * 60, 'cyan');
    log("📊 RESUMO DO TESTE DE INTEGRAÇÃO", 'cyan');
    log("=" * 60, 'cyan');
    log(`✅ Carteiras Salesforce: ${dataCarteiras.total} encontradas`, 'green');
    log(`✅ Carteira testada: ${carteiraParaTeste.nome_comdinheiro}`, 'green');
    log(`✅ API Comdinheiro: ${dataConsolidada.success ? 'Funcionando' : 'Com problemas'}`, 'green');
    log(`${temDadosFinanceiros ? '✅' : '⚠️'} Dados financeiros: ${temDadosFinanceiros ? 'Encontrados' : 'Não encontrados'}`, temDadosFinanceiros ? 'green' : 'yellow');
    
    if (temDadosFinanceiros) {
      log("\n🎉 INTEGRAÇÃO COMPLETA FUNCIONANDO!", 'green');
      log("A integração Salesforce → API Comdinheiro está operacional.", 'green');
    } else {
      log("\n⚠️ INTEGRAÇÃO PARCIAL", 'yellow');
      log("A API está funcionando, mas não retornou dados financeiros.", 'yellow');
      log("Verifique se a carteira existe no Comdinheiro e tem dados.", 'yellow');
    }

  } catch (error) {
    log("\n❌ ERRO NO TESTE DE INTEGRAÇÃO", 'red');
    log(`Erro: ${error.message}`, 'red');
    
    if (error.message.includes("credenciais")) {
      log("\n💡 Dica: Configure suas credenciais do Comdinheiro em:", 'yellow');
      log("  http://localhost:5173/settings", 'yellow');
    }
    
    process.exit(1);
  }
}

// Executar teste
if (require.main === module) {
  testeIntegracaoCompleta();
}

module.exports = { testeIntegracaoCompleta };

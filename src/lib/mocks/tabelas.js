// Mock data para o sistema de tabelas financeiras

// Lista de carteiras disponíveis
export const mockCarteiras = [
  "João_Silva",
  "Maria_Santos",
  "Pedro_Oliveira",
  "Ana_Costa",
  "Carlos_Ferreira",
  "Lucia_Almeida",
  "Roberto_Lima",
  "Fernanda_Rocha",
  "Gustavo_Mendes",
  "Patricia_Barbosa",
  "Reino_Capital_Master",
  "Fundo_Conservador",
  "Fundo_Moderado",
  "Fundo_Sofisticado",
];

// Opções de bancos
export const mockBancos = [
  { value: "", label: "Selecione o Banco" },
  { value: "todos", label: "Todos os bancos" },
  { value: "Itaú", label: "Itaú" },
  { value: "BTG", label: "BTG" },
  { value: "XP Investimentos", label: "XP" },
  { value: "Ágora", label: "Ágora" },
  { value: "Banco do Brasil", label: "Banco do Brasil" },
];

// Opções de operação
export const mockOperacoes = [
  { value: "C+V", label: "Compras e Vendas" },
  { value: "C", label: "Somente Compras" },
  { value: "V", label: "Somente Vendas" },
  { value: "todos", label: "Todas as operações" },
];

// Perfis de referência para Asset Allocation
export const mockPerfis = [
  { value: "", label: "Selecione o Perfil de Referência" },
  { value: "conservador", label: "Conservador" },
  { value: "moderado", label: "Moderado" },
  { value: "sofisticado", label: "Sofisticado" },
];

// Perfis padrão com percentuais
export const perfisReferencia = {
  conservador: {
    pre: 30,
    pos: 30,
    ipca: 30,
    rv_mm: 10,
    global: 0,
  },
  moderado: {
    pre: 20,
    pos: 25,
    ipca: 30,
    rv_mm: 20,
    global: 5,
  },
  sofisticado: {
    pre: 10,
    pos: 15,
    ipca: 25,
    rv_mm: 40,
    global: 10,
  },
};

// Mock data para modo relatório
export const mockRelatorioData = {
  tables: {
    tab0: {
      lin0: {
        col1: "Instituição Financeira",
        col2: "Tipo de Ativo",
        col3: "Ativo",
        col4: "Quantidade",
        col5: "Valor Atual (R$)",
        col6: "% da Carteira",
      },
      lin1: {
        col1: "Itaú",
        col2: "Renda Fixa",
        col3: "CDB Itaú 120% CDI",
        col4: "1000",
        col5: 105000.5,
        col6: "15.2%",
      },
      lin2: {
        col1: "BTG",
        col2: "Renda Variável",
        col3: "PETR4",
        col4: "500",
        col5: 87500.0,
        col6: "12.7%",
      },
      lin3: {
        col1: "XP",
        col2: "FII",
        col3: "HGLG11",
        col4: "300",
        col5: 45000.0,
        col6: "6.5%",
      },
    },
  },
  total_geral: "692,450.75",
  carteira: "João_Silva",
  data_final: "2024-01-15",
};

// Mock data detalhado para modo Posição Consolidada
export const mockConsolidadoData = {
  agrupados: {
    "Itaú Unibanco": {
      _total_banco: 2850000.0,
      "Renda Fixa": {
        _total_categoria: 1950000.0,
        CDB: {
          _total_tipo: 850000.0,
          linhas: [
            {
              col2: "CDB Itaú 120% CDI",
              col3: "1000",
              col4: 350000.0,
              col5: "5.1%",
            },
            {
              col2: "CDB Itaú 130% CDI",
              col3: "800",
              col4: 280000.0,
              col5: "4.0%",
            },
            {
              col2: "CDB Itaú Pré 12%",
              col3: "500",
              col4: 220000.0,
              col5: "3.2%",
            },
          ],
        },
        LCI: {
          _total_tipo: 650000.0,
          linhas: [
            {
              col2: "LCI Itaú 110% CDI",
              col3: "1200",
              col4: 420000.0,
              col5: "6.1%",
            },
            {
              col2: "LCI Itaú IPCA+5%",
              col3: "600",
              col4: 230000.0,
              col5: "3.3%",
            },
          ],
        },
        LCA: {
          _total_tipo: 450000.0,
          linhas: [
            {
              col2: "LCA Itaú 115% CDI",
              col3: "900",
              col4: 450000.0,
              col5: "6.5%",
            },
          ],
        },
      },
      "Renda Variável": {
        _total_categoria: 650000.0,
        Ações: {
          _total_tipo: 450000.0,
          linhas: [
            {
              col2: "ITUB4",
              col3: "1000",
              col4: 180000.0,
              col5: "2.6%",
            },
            {
              col2: "BBDC4",
              col3: "800",
              col4: 150000.0,
              col5: "2.2%",
            },
            {
              col2: "VALE3",
              col3: "600",
              col4: 120000.0,
              col5: "1.7%",
            },
          ],
        },
        FIIs: {
          _total_tipo: 200000.0,
          linhas: [
            {
              col2: "HGLG11",
              col3: "1500",
              col4: 120000.0,
              col5: "1.7%",
            },
            {
              col2: "XPLG11",
              col3: "800",
              col4: 80000.0,
              col5: "1.2%",
            },
          ],
        },
      },
      Fundos: {
        _total_categoria: 250000.0,
        Multimercado: {
          _total_tipo: 250000.0,
          linhas: [
            {
              col2: "Itaú Selection",
              col3: "2500",
              col4: 250000.0,
              col5: "3.6%",
            },
          ],
        },
      },
    },
    "BTG Pactual": {
      _total_banco: 2200000.0,
      "Renda Fixa": {
        _total_categoria: 1100000.0,
        CDB: {
          _total_tipo: 600000.0,
          linhas: [
            {
              col2: "CDB BTG 135% CDI",
              col3: "1200",
              col4: 400000.0,
              col5: "5.8%",
            },
            {
              col2: "CDB BTG Pré 13%",
              col3: "400",
              col4: 200000.0,
              col5: "2.9%",
            },
          ],
        },
        Debêntures: {
          _total_tipo: 500000.0,
          linhas: [
            {
              col2: "Debênture CPFL",
              col3: "500",
              col4: 300000.0,
              col5: "4.3%",
            },
            {
              col2: "Debênture Suzano",
              col3: "400",
              col4: 200000.0,
              col5: "2.9%",
            },
          ],
        },
      },
      "Renda Variável": {
        _total_categoria: 800000.0,
        Ações: {
          _total_tipo: 550000.0,
          linhas: [
            {
              col2: "PETR4",
              col3: "1500",
              col4: 200000.0,
              col5: "2.9%",
            },
            {
              col2: "MGLU3",
              col3: "2000",
              col4: 150000.0,
              col5: "2.2%",
            },
            {
              col2: "WEGE3",
              col3: "800",
              col4: 120000.0,
              col5: "1.7%",
            },
            {
              col2: "ASAI3",
              col3: "600",
              col4: 80000.0,
              col5: "1.2%",
            },
          ],
        },
        ETFs: {
          _total_tipo: 250000.0,
          linhas: [
            {
              col2: "BOVA11",
              col3: "2000",
              col4: 150000.0,
              col5: "2.2%",
            },
            {
              col2: "IVVB11",
              col3: "1000",
              col4: 100000.0,
              col5: "1.4%",
            },
          ],
        },
      },
      Fundos: {
        _total_categoria: 300000.0,
        Ações: {
          _total_tipo: 200000.0,
          linhas: [
            {
              col2: "BTG Dividendos",
              col3: "1800",
              col4: 200000.0,
              col5: "2.9%",
            },
          ],
        },
        Multimercado: {
          _total_tipo: 100000.0,
          linhas: [
            {
              col2: "BTG Absoluto",
              col3: "1000",
              col4: 100000.0,
              col5: "1.4%",
            },
          ],
        },
      },
    },
    "XP Investimentos": {
      _total_banco: 1870000.0,
      "Renda Fixa": {
        _total_categoria: 950000.0,
        CDB: {
          _total_tipo: 400000.0,
          linhas: [
            {
              col2: "CDB XP 125% CDI",
              col3: "800",
              col4: 250000.0,
              col5: "3.6%",
            },
            {
              col2: "CDB XP Pré 11.5%",
              col3: "600",
              col4: 150000.0,
              col5: "2.2%",
            },
          ],
        },
        LCI: {
          _total_tipo: 350000.0,
          linhas: [
            {
              col2: "LCI XP 105% CDI",
              col3: "700",
              col4: 220000.0,
              col5: "3.2%",
            },
            {
              col2: "LCI XP IPCA+4.5%",
              col3: "500",
              col4: 130000.0,
              col5: "1.9%",
            },
          ],
        },
        "Tesouro Direto": {
          _total_tipo: 200000.0,
          linhas: [
            {
              col2: "Tesouro Selic 2029",
              col3: "200",
              col4: 120000.0,
              col5: "1.7%",
            },
            {
              col2: "Tesouro IPCA+ 2035",
              col3: "150",
              col4: 80000.0,
              col5: "1.2%",
            },
          ],
        },
      },
      "Renda Variável": {
        _total_categoria: 720000.0,
        Ações: {
          _total_tipo: 520000.0,
          linhas: [
            {
              col2: "ABEV3",
              col3: "2500",
              col4: 180000.0,
              col5: "2.6%",
            },
            {
              col2: "JBSS3",
              col3: "1200",
              col4: 140000.0,
              col5: "2.0%",
            },
            {
              col2: "RENT3",
              col3: "800",
              col4: 100000.0,
              col5: "1.4%",
            },
            {
              col2: "RADL3",
              col3: "600",
              col4: 100000.0,
              col5: "1.4%",
            },
          ],
        },
        FIIs: {
          _total_tipo: 200000.0,
          linhas: [
            {
              col2: "MXRF11",
              col3: "1800",
              col4: 120000.0,
              col5: "1.7%",
            },
            {
              col2: "KNRI11",
              col3: "1000",
              col4: 80000.0,
              col5: "1.2%",
            },
          ],
        },
      },
      Fundos: {
        _total_categoria: 200000.0,
        "Renda Fixa": {
          _total_tipo: 120000.0,
          linhas: [
            {
              col2: "XP Allocation RF",
              col3: "1200",
              col4: 120000.0,
              col5: "1.7%",
            },
          ],
        },
        Multimercado: {
          _total_tipo: 80000.0,
          linhas: [
            {
              col2: "XP Macro",
              col3: "800",
              col4: 80000.0,
              col5: "1.2%",
            },
          ],
        },
      },
    },
  },
  cabecalho: {
    col2: "Ativo",
    col3: "Quantidade",
    col4: "Valor Atual (R$)",
    col5: "% da Carteira",
  },
  total_geral: "6,920,000.00",
  carteira: "João_Silva",
  data_final: "2024-01-15",
};

// Mock data para Asset Allocation
export const mockAssetAllocationData = {
  saldo_bruto: 692450.75,
  rentabilidade_ano: "125.3% do CDI",
  grafico1: {
    "Pré-fixado": 25.5,
    "Pós-fixado": 30.2,
    IPCA: 20.8,
    RV: 18.5,
    Global: 5.0,
  },
};

// Função para simular busca de carteiras
export async function buscarCarteiras(filtro = "") {
  // Simular delay de API
  await new Promise((resolve) => setTimeout(resolve, 300));

  const carteiras = mockCarteiras.filter((carteira) =>
    carteira.toLowerCase().includes(filtro.toLowerCase())
  );

  return {
    success: true,
    carteiras: carteiras,
  };
}

// Função para obter dados mock baseado no modo
export function getMockDataByMode(modo, params = {}) {
  const baseData = {
    timestamp: new Date().toISOString(),
    modo: modo,
    carteira: params.carteira || "João_Silva",
    data_final: params.data_final || new Date().toISOString().split("T")[0],
  };

  switch (modo) {
    case "relatorio":
      return { ...baseData, ...mockRelatorioData };

    case "consolidado":
      return { ...baseData, ...mockConsolidadoData };

    case "asset_allocation":
      return {
        ...baseData,
        asset_allocation_data: mockAssetAllocationData,
        perfil_data:
          perfisReferencia[params.perfil] || perfisReferencia.moderado,
      };

    default:
      return baseData;
  }
}

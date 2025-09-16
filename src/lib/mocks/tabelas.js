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
    // TEMPORARILY DISABLED - Uncomment to restore
    // case 'relatorio':
    //   return { ...baseData, ...mockRelatorioData };

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

/**
 * Sistema centralizado de características dos bancos
 * Cores, taxas e outras informações específicas de cada instituição financeira
 */

/** @typedef {Object} TaxasBanco
 * @property {number} corretagem
 * @property {number} custodia
 */

/** @typedef {Object} ConfigBanco
 * @property {string} cor
 * @property {string} corHex
 * @property {string} corInactive
 * @property {TaxasBanco} taxas
 * @property {string} categoria
 * @property {string} sigla
 */

/** @type {Record<string, ConfigBanco>} */
export const bancosConfig = {
  "Itaú Unibanco": {
    cor: "#EC7000", // Laranja oficial do Itaú
    corHex: "bg-orange-500",
    corInactive: "#EC700040", // Laranja com transparência para estado inativo
    taxas: {
      corretagem: 0.005, // 0.5%
      custodia: 0.003, // 0.3%
    },
    categoria: "banco",
    sigla: "ITAU",
  },
  Itaú: {
    cor: "#EC7000",
    corHex: "bg-orange-500",
    corInactive: "#EC700040",
    taxas: {
      corretagem: 0.005,
      custodia: 0.003,
    },
    categoria: "banco",
    sigla: "ITAU",
  },
  Itau: {
    cor: "#EC7000", // Variação sem acento
    corHex: "bg-orange-500",
    corInactive: "#EC700040",
    taxas: {
      corretagem: 0.005,
      custodia: 0.003,
    },
    categoria: "banco",
    sigla: "ITAU",
  },
  BTG: {
    cor: "#003366", // Azul escuro oficial BTG Pactual
    corHex: "bg-blue-900",
    corInactive: "#00336640",
    taxas: {
      corretagem: 0.0025, // 0.25%
      custodia: 0.002, // 0.2%
    },
    categoria: "banco_investimento",
    sigla: "BTG",
  },
  "BTG Pactual": {
    cor: "#003366",
    corHex: "bg-blue-900",
    corInactive: "#00336640",
    taxas: {
      corretagem: 0.0025,
      custodia: 0.002,
    },
    categoria: "banco_investimento",
    sigla: "BTG",
  },
  "XP Investimentos": {
    cor: "#FFD700", // Amarelo dourado oficial XP
    corHex: "bg-yellow-400",
    corInactive: "#FFD70040",
    taxas: {
      corretagem: 0.003, // 0.3%
      custodia: 0.0025, // 0.25%
    },
    categoria: "corretora",
    sigla: "XP",
  },
  XP: {
    cor: "#FFD700",
    corHex: "bg-yellow-400",
    corInactive: "#FFD70040",
    taxas: {
      corretagem: 0.003,
      custodia: 0.0025,
    },
    categoria: "corretora",
    sigla: "XP",
  },
  Ágora: {
    cor: "#00A651", // Verde oficial Ágora
    corHex: "bg-green-600",
    corInactive: "#00A65140",
    taxas: {
      corretagem: 0.002, // 0.2%
      custodia: 0.0015, // 0.15%
    },
    categoria: "corretora",
    sigla: "AGORA",
  },
  Agora: {
    cor: "#00A651", // Variação sem acento
    corHex: "bg-green-600",
    corInactive: "#00A65140",
    taxas: {
      corretagem: 0.002,
      custodia: 0.0015,
    },
    categoria: "corretora",
    sigla: "AGORA",
  },
  "Banco do Brasil": {
    cor: "#FFD700", // Amarelo oficial BB
    corHex: "bg-yellow-500",
    corInactive: "#FFD70040",
    taxas: {
      corretagem: 0.004, // 0.4%
      custodia: 0.003, // 0.3%
    },
    categoria: "banco",
    sigla: "BB",
  },
  BB: {
    cor: "#FFD700",
    corHex: "bg-yellow-500",
    corInactive: "#FFD70040",
    taxas: {
      corretagem: 0.004,
      custodia: 0.003,
    },
    categoria: "banco",
    sigla: "BB",
  },
  Bradesco: {
    cor: "#CC092F", // Vermelho oficial Bradesco
    corHex: "bg-red-600",
    corInactive: "#CC092F40",
    taxas: {
      corretagem: 0.004, // 0.4%
      custodia: 0.003, // 0.3%
    },
    categoria: "banco",
    sigla: "BRADESCO",
  },
  Caixa: {
    cor: "#0066CC", // Azul oficial Caixa
    corHex: "bg-blue-600",
    corInactive: "#0066CC40",
    taxas: {
      corretagem: 0.005, // 0.5%
      custodia: 0.004, // 0.4%
    },
    categoria: "banco",
    sigla: "CAIXA",
  },
  "Caixa Econômica Federal": {
    cor: "#0066CC",
    corHex: "bg-blue-600",
    corInactive: "#0066CC40",
    taxas: {
      corretagem: 0.005,
      custodia: 0.004,
    },
    categoria: "banco",
    sigla: "CAIXA",
  },
};

/**
 * Obtém a configuração de um banco específico
 * @param {string} nomeBanco - Nome do banco
 * @returns {ConfigBanco|null} Configuração do banco ou null se não encontrado
 */
export function getBancoConfig(nomeBanco) {
  return bancosConfig[nomeBanco] || null;
}

/**
 * Obtém a cor de um banco específico
 * @param {string} nomeBanco - Nome do banco
 * @returns {string} Cor hexadecimal ou cor padrão
 */
export function getBancoCor(nomeBanco) {
  const config = getBancoConfig(nomeBanco);
  return config?.cor || "#6B7280"; // Cor padrão (gray-500)
}

/**
 * Obtém a classe CSS de cor de um banco específico
 * @param {string} nomeBanco - Nome do banco
 * @returns {string} Classe CSS de cor ou classe padrão
 */
export function getBancoCorHex(nomeBanco) {
  const config = getBancoConfig(nomeBanco);
  return config?.corHex || "bg-gray-500"; // Classe padrão
}

/**
 * Lista todos os bancos configurados
 * @returns {string[]} Array com nomes dos bancos
 */
export function listarBancos() {
  return Object.keys(bancosConfig);
}

/**
 * Obtém todas as configurações dos bancos
 * @returns {object} Objeto com todas as configurações
 */
export function todasConfiguracoesBancos() {
  return bancosConfig;
}

/**
 * Obtém a cor inativa de um banco específico
 * @param {string} nomeBanco - Nome do banco
 * @returns {string} Cor hexadecimal inativa ou cor padrão
 */
export function getBancoCorInactive(nomeBanco) {
  const config = getBancoConfig(nomeBanco);
  return config?.corInactive || "#6B728040"; // Cor padrão com transparência
}

/**
 * Obtém as cores de um banco (ativa e inativa)
 * @param {string} nomeBanco - Nome do banco
 * @returns {object} Objeto com cores ativa e inativa
 */
export function getBancoCores(nomeBanco) {
  const config = getBancoConfig(nomeBanco);
  return {
    ativa: config?.cor || "#6B7280",
    inativa: config?.corInactive || "#6B728040",
    hex: config?.corHex || "bg-gray-500",
  };
}

/**
 * Verifica se um banco está configurado
 * @param {string} nomeBanco - Nome do banco
 * @returns {boolean} True se o banco está configurado
 */
export function isBancoConfigurado(nomeBanco) {
  return !!getBancoConfig(nomeBanco);
}

/**
 * Obtém informações completas de um banco incluindo cores e categoria
 * @param {string} nomeBanco - Nome do banco
 * @returns {object|null} Informações completas do banco ou null
 */
export function getBancoInfo(nomeBanco) {
  const config = getBancoConfig(nomeBanco);
  if (!config) return null;

  return {
    nome: nomeBanco,
    sigla: config.sigla,
    categoria: config.categoria,
    cores: {
      ativa: config.cor,
      inativa: config.corInactive,
      hex: config.corHex,
    },
    taxas: config.taxas,
  };
}

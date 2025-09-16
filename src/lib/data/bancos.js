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
 * @property {TaxasBanco} taxas
 * @property {string} categoria
 * @property {string} sigla
 */

/** @type {Record<string, ConfigBanco>} */
export const bancosConfig = {
  "Itaú Unibanco": {
    cor: "#EC7000", // Laranja oficial do Itaú
    corHex: "bg-orange-500",
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
    taxas: {
      corretagem: 0.005,
      custodia: 0.003,
    },
    categoria: "banco",
    sigla: "ITAU",
  },
  BTG: {
    cor: "#1E40AF", // Azul BTG
    corHex: "bg-blue-700",
    taxas: {
      corretagem: 0.0025, // 0.25%
      custodia: 0.002, // 0.2%
    },
    categoria: "banco_investimento",
    sigla: "BTG",
  },
  "XP Investimentos": {
    cor: "#FACC15", // Amarelo XP
    corHex: "bg-yellow-400",
    taxas: {
      corretagem: 0.003, // 0.3%
      custodia: 0.0025, // 0.25%
    },
    categoria: "corretora",
    sigla: "XP",
  },
  XP: {
    cor: "#FACC15",
    corHex: "bg-yellow-400",
    taxas: {
      corretagem: 0.003,
      custodia: 0.0025,
    },
    categoria: "corretora",
    sigla: "XP",
  },
  Ágora: {
    cor: "#16A34A", // Verde Ágora
    corHex: "bg-green-600",
    taxas: {
      corretagem: 0.002, // 0.2%
      custodia: 0.0015, // 0.15%
    },
    categoria: "corretora",
    sigla: "AGORA",
  },
  "Banco do Brasil": {
    cor: "#EAB308", // Amarelo BB
    corHex: "bg-yellow-500",
    taxas: {
      corretagem: 0.004, // 0.4%
      custodia: 0.003, // 0.3%
    },
    categoria: "banco",
    sigla: "BB",
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

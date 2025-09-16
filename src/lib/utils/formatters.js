/**
 * Utilitários para formatação de dados financeiros
 */

/**
 * Formata um número como moeda brasileira
 * @param {number} valor - Valor a ser formatado
 * @param {boolean} simbolo - Se deve incluir o símbolo R$
 * @returns {string} Valor formatado
 */
export function formatarMoeda(valor, simbolo = true) {
  if (valor === null || valor === undefined || isNaN(valor)) {
    return simbolo ? "R$ 0,00" : "0,00";
  }

  const formatado = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(valor);

  return simbolo ? formatado : formatado.replace("R$", "").trim();
}

/**
 * Formata um número como percentual
 * @param {number} valor - Valor a ser formatado (ex: 15.5 para 15,5%)
 * @param {number} decimais - Número de casas decimais
 * @returns {string} Valor formatado
 */
export function formatarPercentual(valor, decimais = 1) {
  if (valor === null || valor === undefined || isNaN(valor)) {
    return "0,0%";
  }

  return new Intl.NumberFormat("pt-BR", {
    style: "percent",
    minimumFractionDigits: decimais,
    maximumFractionDigits: decimais,
  }).format(valor / 100);
}

/**
 * Formata um número simples com separadores brasileiros
 * @param {number} valor - Valor a ser formatado
 * @param {number} decimais - Número de casas decimais
 * @returns {string} Valor formatado
 */
export function formatarNumero(valor, decimais = 2) {
  if (valor === null || valor === undefined || isNaN(valor)) {
    return "0";
  }

  return new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: decimais,
    maximumFractionDigits: decimais,
  }).format(valor);
}

/**
 * Formata uma data no padrão brasileiro
 * @param {string|Date} data - Data a ser formatada
 * @param {boolean} incluirHora - Se deve incluir a hora
 * @returns {string} Data formatada
 */
export function formatarData(data, incluirHora = false) {
  if (!data) return "";

  const dataObj = typeof data === "string" ? new Date(data) : data;

  if (isNaN(dataObj.getTime())) return "";

  const opcoes = {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  };

  if (incluirHora) {
    opcoes.hour = "2-digit";
    opcoes.minute = "2-digit";
  }

  return dataObj.toLocaleDateString("pt-BR", opcoes);
}

/**
 * Formata nome de carteira removendo underscores
 * @param {string} nome - Nome da carteira
 * @returns {string} Nome formatado
 */
export function formatarNomeCarteira(nome) {
  if (!nome) return "";
  return nome.replace(/_/g, " ");
}

/**
 * Obtém iniciais de um nome para avatar
 * @param {string} nome - Nome completo
 * @param {number} max - Máximo de iniciais
 * @returns {string} Iniciais
 */
export function obterIniciais(nome, max = 2) {
  if (!nome) return "";

  return nome
    .replace(/_/g, " ")
    .split(" ")
    .filter((palavra) => palavra.length > 0)
    .map((palavra) => palavra[0])
    .join("")
    .toUpperCase()
    .slice(0, max);
}

/**
 * Formata um valor seguindo o padrão do template original
 * Converte formato americano para brasileiro
 * @param {number} valor - Valor numérico
 * @returns {string} Valor formatado no padrão brasileiro
 */
export function formatarValorOriginal(valor) {
  if (valor === null || valor === undefined || isNaN(valor)) {
    return "0,00";
  }

  // Formato original: '{:,.2f}'.format(val).replace(',', '_').replace('.', ',').replace('_', '.')
  return valor.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/**
 * Formata número brasileiro seguindo exatamente o padrão do template HTML
 * Implementa: {{ '{:,.2f}'.format(val).replace(',', '_').replace('.', ',').replace('_', '.') }}
 * @param {any} value - Valor a ser formatado
 * @returns {string} Valor formatado ou '--' para valores vazios
 */
export function formatBrazilianNumber(value) {
  // Seguir exatamente a lógica do template HTML:
  // {{ val | safe if 'col_diff' in col_key else (val or '--') }}
  if (value === null || value === undefined || value === "") {
    return "--";
  }

  // Se não for número, retornar como string ou '--'
  if (typeof value !== "number") {
    return value || "--";
  }

  // Aplicar formatação brasileira para números
  return value.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/**
 * Formata valor de célula da tabela seguindo a lógica do template HTML
 * @param {any} value - Valor da célula
 * @param {string} columnKey - Chave da coluna (para detectar col_diff)
 * @returns {string} Valor formatado
 */
export function formatTableCellValue(value, columnKey = "") {
  // Lógica especial para colunas col_diff (HTML safe)
  if (columnKey.includes("col_diff")) {
    return value || "--";
  }

  // Para números, aplicar formatação brasileira
  if (typeof value === "number") {
    return formatBrazilianNumber(value);
  }

  // Para outros valores, retornar como string ou '--'
  return value || "--";
}

/**
 * Calcula diferença entre duas datas em dias
 * @param {string|Date} dataInicial - Data inicial
 * @param {string|Date} dataFinal - Data final
 * @returns {number} Diferença em dias
 */
export function calcularDiferencaDias(dataInicial, dataFinal) {
  const inicio =
    typeof dataInicial === "string" ? new Date(dataInicial) : dataInicial;
  const fim = typeof dataFinal === "string" ? new Date(dataFinal) : dataFinal;

  const diffTime = Math.abs(fim - inicio);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Formata período de datas para exibição
 * @param {string|Date} dataInicial - Data inicial
 * @param {string|Date} dataFinal - Data final
 * @returns {string} Período formatado
 */
export function formatarPeriodo(dataInicial, dataFinal) {
  if (!dataInicial || !dataFinal) return "";

  const inicio = formatarData(dataInicial);
  const fim = formatarData(dataFinal);
  const dias = calcularDiferencaDias(dataInicial, dataFinal);

  if (inicio === fim) {
    return `${inicio} (1 dia)`;
  }

  return `${inicio} até ${fim} (${dias} dias)`;
}

/**
 * Trunca texto com reticências
 * @param {string} texto - Texto a ser truncado
 * @param {number} limite - Limite de caracteres
 * @returns {string} Texto truncado
 */
export function truncarTexto(texto, limite = 50) {
  if (!texto || texto.length <= limite) return texto;
  return texto.slice(0, limite) + "...";
}

/**
 * Formata valor de rentabilidade com sinal
 * @param {number} valor - Valor da rentabilidade
 * @param {boolean} comSinal - Se deve incluir sinal + para positivos
 * @returns {string} Rentabilidade formatada
 */
export function formatarRentabilidade(valor, comSinal = true) {
  if (valor === null || valor === undefined || isNaN(valor)) {
    return "0,0%";
  }

  const percentual = formatarPercentual(valor);

  if (comSinal && valor > 0) {
    return `+${percentual}`;
  }

  return percentual;
}

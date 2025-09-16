/**
 * Utilitários para validação de dados do formulário de tabelas
 */

/**
 * Valida se uma data está no formato correto e é válida
 * @param {string} data - Data no formato YYYY-MM-DD
 * @returns {boolean} Se a data é válida
 */
export function validarData(data) {
  if (!data) return false;

  const dataObj = new Date(data);
  return !isNaN(dataObj.getTime()) && data.match(/^\d{4}-\d{2}-\d{2}$/);
}

/**
 * Valida se a data inicial é anterior ou igual à data final
 * @param {string} dataInicial - Data inicial
 * @param {string} dataFinal - Data final
 * @returns {boolean} Se o período é válido
 */
export function validarPeriodo(dataInicial, dataFinal) {
  if (!dataInicial || !dataFinal) return true; // Permite campos vazios

  if (!validarData(dataInicial) || !validarData(dataFinal)) return false;

  return new Date(dataInicial) <= new Date(dataFinal);
}

/**
 * Valida se a data não é futura
 * @param {string} data - Data a ser validada
 * @returns {boolean} Se a data não é futura
 */
export function validarDataNaoFutura(data) {
  if (!data) return true;

  if (!validarData(data)) return false;

  const hoje = new Date();
  hoje.setHours(23, 59, 59, 999); // Fim do dia atual

  return new Date(data) <= hoje;
}

/**
 * Valida nome de carteira
 * @param {string} carteira - Nome da carteira
 * @returns {boolean} Se o nome é válido
 */
export function validarCarteira(carteira) {
  if (!carteira || typeof carteira !== "string") return false;

  // Deve ter pelo menos 2 caracteres e não conter caracteres especiais perigosos
  return carteira.length >= 2 && !/[<>\"'&]/.test(carteira);
}

/**
 * Valida seleção de banco
 * @param {string} banco - Banco selecionado
 * @param {boolean} obrigatorio - Se a seleção é obrigatória
 * @returns {boolean} Se a seleção é válida
 */
export function validarBanco(banco, obrigatorio = false) {
  if (!obrigatorio && !banco) return true;

  const bancosValidos = [
    "todos",
    "Itaú",
    "BTG",
    "XP Investimentos",
    "Ágora",
    "Banco do Brasil",
  ];
  return bancosValidos.includes(banco);
}

/**
 * Valida seleção de operação
 * @param {string} operacao - Operação selecionada
 * @returns {boolean} Se a operação é válida
 */
export function validarOperacao(operacao) {
  const operacoesValidas = ["C+V", "C", "V", "todos"];
  return operacoesValidas.includes(operacao);
}

/**
 * Valida seleção de perfil de referência
 * @param {string} perfil - Perfil selecionado
 * @param {boolean} obrigatorio - Se a seleção é obrigatória
 * @returns {boolean} Se o perfil é válido
 */
export function validarPerfil(perfil, obrigatorio = false) {
  if (!obrigatorio && !perfil) return true;

  const perfisValidos = ["conservador", "moderado", "sofisticado"];
  return perfisValidos.includes(perfil);
}

/**
 * Valida modo de visualização
 * @param {string} modo - Modo selecionado
 * @returns {boolean} Se o modo é válido
 */
export function validarModoVisualizacao(modo) {
  // TEMPORARILY DISABLED - Uncomment to restore full list
  // const modosValidos = ['relatorio', 'consolidado', 'movimentacoes', 'analise', 'asset_allocation'];
  const modosValidos = ["consolidado", "asset_allocation"]; // Only active modes
  return modosValidos.includes(modo);
}

/**
 * Valida formulário completo baseado no modo selecionado
 * @param {Object} dados - Dados do formulário
 * @returns {Object} Resultado da validação
 */
export function validarFormulario(dados) {
  const erros = [];
  const {
    modoVisualizacao,
    carteira,
    dataInicial,
    dataFinal,
    banco,
    operacao,
    perfil,
  } = dados;

  // Validações básicas
  if (!validarModoVisualizacao(modoVisualizacao)) {
    erros.push("Modo de visualização inválido");
  }

  if (!validarCarteira(carteira)) {
    erros.push("Nome da carteira é obrigatório e deve ser válido");
  }

  if (!validarData(dataFinal)) {
    erros.push("Data final é obrigatória e deve ser válida");
  }

  if (!validarDataNaoFutura(dataFinal)) {
    erros.push("Data final não pode ser futura");
  }

  // Validações específicas por modo
  switch (modoVisualizacao) {
    // TEMPORARILY DISABLED - Uncomment to restore
    // case 'movimentacoes':
    //   if (!validarData(dataInicial)) {
    //     erros.push('Data inicial é obrigatória para movimentações');
    //   }
    //   if (!validarBanco(banco, true)) {
    //     erros.push('Seleção de banco é obrigatória para movimentações');
    //   }
    //   if (!validarOperacao(operacao)) {
    //     erros.push('Tipo de operação inválido');
    //   }
    //   break;

    // TEMPORARILY DISABLED - Uncomment to restore
    // case 'analise':
    //   if (!validarData(dataInicial)) {
    //     erros.push('Data inicial é obrigatória para análises');
    //   }
    //   break;

    case "asset_allocation":
      if (!validarPerfil(perfil, true)) {
        erros.push("Perfil de referência é obrigatório para Asset Allocation");
      }
      break;
  }

  // Validação de período
  if (dataInicial && dataFinal && !validarPeriodo(dataInicial, dataFinal)) {
    erros.push("Data inicial deve ser anterior ou igual à data final");
  }

  return {
    valido: erros.length === 0,
    erros,
  };
}

/**
 * Sanitiza entrada de texto removendo caracteres perigosos
 * @param {string} texto - Texto a ser sanitizado
 * @returns {string} Texto sanitizado
 */
export function sanitizarTexto(texto) {
  if (!texto || typeof texto !== "string") return "";

  return texto
    .replace(/[<>\"'&]/g, "") // Remove caracteres HTML perigosos
    .trim()
    .slice(0, 100); // Limita tamanho
}

/**
 * Valida se um valor numérico está dentro de um range
 * @param {number} valor - Valor a ser validado
 * @param {number} min - Valor mínimo
 * @param {number} max - Valor máximo
 * @returns {boolean} Se o valor está no range
 */
export function validarRange(valor, min = 0, max = 100) {
  if (isNaN(valor)) return false;
  return valor >= min && valor <= max;
}

/**
 * Valida percentuais de asset allocation
 * @param {Object} percentuais - Objeto com percentuais por categoria
 * @returns {Object} Resultado da validação
 */
export function validarAssetAllocation(percentuais) {
  const erros = [];
  const { pre, pos, ipca, rv_mm, global } = percentuais;

  // Validar se todos são números válidos
  const valores = [pre, pos, ipca, rv_mm, global];
  const valoresNumericos = valores.map((v) => parseFloat(v) || 0);

  // Validar ranges individuais
  valoresNumericos.forEach((valor, index) => {
    if (!validarRange(valor, 0, 100)) {
      const nomes = ["Pré-fixado", "Pós-fixado", "IPCA", "RV + MM", "Global"];
      erros.push(`${nomes[index]} deve estar entre 0% e 100%`);
    }
  });

  // Validar soma total
  const total = valoresNumericos.reduce((acc, val) => acc + val, 0);
  if (Math.abs(total - 100) > 0.1) {
    erros.push(
      `A soma dos percentuais deve ser 100%. Atual: ${total.toFixed(1)}%`
    );
  }

  return {
    valido: erros.length === 0,
    erros,
    total,
  };
}

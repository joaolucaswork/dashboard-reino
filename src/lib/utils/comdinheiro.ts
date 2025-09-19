import type {
  ComdinheiroFormat,
  ComdinheiroLanguage,
  ValidationResult,
  ComdinheiroRequest
} from "$lib/types/comdinheiro";

// Constantes da API
export const COMDINHEIRO_CONFIG = {
  endpoint: "https://www.comdinheiro.com.br/Clientes/API/EndPoint001.php?code=import_data",
  baseUrl: "https://www.comdinheiro.com.br/",
  timeout: 30000,
  maxRetries: 3
};

// Formatos suportados
export const FORMATOS_DISPONIVEIS: ComdinheiroFormat[] = [
  "JSON",
  "JSON2", 
  "JSON3",
  "XML",
  "XML2"
];

// Linguagens para geração de código
export const LINGUAGENS_DISPONIVEIS: ComdinheiroLanguage[] = [
  "JavaScript",
  "Python",
  "PHP",
  "cURL"
];

// Ferramentas conhecidas com suas descrições
export const FERRAMENTAS_CONHECIDAS = {
  "FundScreener001": {
    nome: "Fund Screener",
    descricao: "Busca e filtragem de fundos de investimento",
    exemplo: "FundScreener001.php?categoria=RF&rentabilidade_min=5"
  },
  "HistoricoCotacao002": {
    nome: "Histórico de Cotações",
    descricao: "Dados históricos de cotações de ativos",
    exemplo: "HistoricoCotacao002.php?x=NTNB_15082004_15052024+CDI&data_ini=13032024&data_fim=14032024"
  },
  "IndicadoresEconomicos001": {
    nome: "Indicadores Econômicos",
    descricao: "Dados de indicadores econômicos brasileiros",
    exemplo: "IndicadoresEconomicos001.php?indicador=SELIC&periodo=12m"
  },
  "RentabilidadeFundos001": {
    nome: "Rentabilidade de Fundos",
    descricao: "Análise de rentabilidade de fundos",
    exemplo: "RentabilidadeFundos001.php?cnpj=12345678000100&periodo=1a"
  },
  "ComparacaoFundos001": {
    nome: "Comparação de Fundos",
    descricao: "Comparativo entre diferentes fundos",
    exemplo: "ComparacaoFundos001.php?fundos=FUND1,FUND2&benchmark=CDI"
  }
};

// Validação de credenciais
export function validarCredenciais(username: string, password: string): ValidationResult {
  const erros: string[] = [];

  if (!username || username.trim().length === 0) {
    erros.push("Usuário é obrigatório");
  }

  if (!password || password.trim().length === 0) {
    erros.push("Senha é obrigatória");
  }

  if (username && username.length < 3) {
    erros.push("Usuário deve ter pelo menos 3 caracteres");
  }

  if (password && password.length < 6) {
    erros.push("Senha deve ter pelo menos 6 caracteres");
  }

  return {
    valido: erros.length === 0,
    erros,
    avisos: password && password === username ? ["Senha igual ao usuário não é recomendada"] : undefined
  };
}

// Validação de URL de consulta
export function validarUrlConsulta(url: string): ValidationResult {
  const erros: string[] = [];
  const avisos: string[] = [];

  if (!url || url.trim().length === 0) {
    erros.push("URL da consulta é obrigatória");
    return { valido: false, erros };
  }

  const urlLimpa = url.trim();

  // Verificar se não contém o domínio
  if (urlLimpa.includes("comdinheiro.com.br")) {
    erros.push("Não inclua o domínio 'comdinheiro.com.br' na URL");
  }

  // Verificar se é um arquivo PHP
  if (!urlLimpa.includes(".php")) {
    erros.push("URL deve apontar para um arquivo .php");
  }

  // Verificar se começa com barra
  if (urlLimpa.startsWith("/")) {
    avisos.push("URL não deve começar com '/'");
  }

  // Verificar se contém parâmetros
  if (!urlLimpa.includes("?")) {
    avisos.push("URL sem parâmetros pode não retornar dados");
  }

  // Verificar ferramentas conhecidas
  const ferramenta = extrairNomeFerramenta(urlLimpa);
  if (ferramenta && !FERRAMENTAS_CONHECIDAS[ferramenta as keyof typeof FERRAMENTAS_CONHECIDAS]) {
    avisos.push(`Ferramenta '${ferramenta}' não está na lista de ferramentas conhecidas`);
  }

  return {
    valido: erros.length === 0,
    erros,
    avisos: avisos.length > 0 ? avisos : undefined
  };
}

// Validação de formato
export function validarFormato(format: string): ValidationResult {
  const erros: string[] = [];

  if (!format) {
    erros.push("Formato é obrigatório");
  } else if (!FORMATOS_DISPONIVEIS.includes(format as ComdinheiroFormat)) {
    erros.push(`Formato inválido. Use: ${FORMATOS_DISPONIVEIS.join(", ")}`);
  }

  return {
    valido: erros.length === 0,
    erros
  };
}

// Validação completa de requisição
export function validarRequisicao(request: ComdinheiroRequest): ValidationResult {
  const erros: string[] = [];
  const avisos: string[] = [];

  // Validar credenciais
  const validacaoCredenciais = validarCredenciais(request.username, request.password);
  erros.push(...validacaoCredenciais.erros);
  if (validacaoCredenciais.avisos) {
    avisos.push(...validacaoCredenciais.avisos);
  }

  // Validar URL
  const validacaoUrl = validarUrlConsulta(request.url);
  erros.push(...validacaoUrl.erros);
  if (validacaoUrl.avisos) {
    avisos.push(...validacaoUrl.avisos);
  }

  // Validar formato
  const validacaoFormato = validarFormato(request.format);
  erros.push(...validacaoFormato.erros);

  return {
    valido: erros.length === 0,
    erros,
    avisos: avisos.length > 0 ? avisos : undefined
  };
}

// Extrair nome da ferramenta da URL
export function extrairNomeFerramenta(url: string): string | null {
  const match = url.match(/^([^.?]+)/);
  return match ? match[1] : null;
}

// Formatar URL completa para visualização
export function formatarUrlCompleta(url: string): string {
  const urlLimpa = url.startsWith("/") ? url.substring(1) : url;
  return `${COMDINHEIRO_CONFIG.baseUrl}${urlLimpa}`;
}

// Gerar exemplo de URL para ferramenta
export function gerarExemploUrl(ferramenta: string): string {
  const info = FERRAMENTAS_CONHECIDAS[ferramenta as keyof typeof FERRAMENTAS_CONHECIDAS];
  return info ? info.exemplo : `${ferramenta}.php?parametro=valor`;
}

// Formatar dados de resposta baseado no formato
export function formatarResposta(data: any, format: ComdinheiroFormat): string {
  try {
    if (format.includes("JSON")) {
      return typeof data === "string" ? data : JSON.stringify(data, null, 2);
    } else {
      // Para XML, retornar como está
      return typeof data === "string" ? data : String(data);
    }
  } catch (error) {
    return "Erro ao formatar resposta: " + (error instanceof Error ? error.message : "Erro desconhecido");
  }
}

// Detectar tipo de dados na resposta
export function detectarTipoDados(data: any): string {
  if (!data) return "Vazio";
  
  if (typeof data === "string") {
    if (data.trim().startsWith("<")) return "XML";
    if (data.trim().startsWith("{") || data.trim().startsWith("[")) return "JSON";
    return "Texto";
  }
  
  if (Array.isArray(data)) return "Array";
  if (typeof data === "object") return "Objeto";
  
  return typeof data;
}

// Sanitizar credenciais para log (remover senha)
export function sanitizarCredenciais(request: ComdinheiroRequest): Partial<ComdinheiroRequest> {
  return {
    username: request.username,
    password: "***",
    url: request.url,
    format: request.format,
    language: request.language
  };
}

// Gerar ID único para consulta
export function gerarIdConsulta(): string {
  return `cmd_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Calcular hash simples para cache
export function calcularHashConsulta(request: ComdinheiroRequest): string {
  const str = `${request.username}:${request.url}:${request.format}`;
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(36);
}

// Verificar se resposta é válida
export function validarResposta(data: any, format: ComdinheiroFormat): ValidationResult {
  const erros: string[] = [];

  if (!data) {
    erros.push("Resposta vazia");
    return { valido: false, erros };
  }

  if (format.includes("JSON")) {
    try {
      if (typeof data === "string") {
        JSON.parse(data);
      }
    } catch (error) {
      erros.push("Resposta não é um JSON válido");
    }
  }

  // Verificar se contém erro da API
  if (typeof data === "string" && data.toLowerCase().includes("erro")) {
    erros.push("Resposta contém indicação de erro");
  }

  return {
    valido: erros.length === 0,
    erros
  };
}

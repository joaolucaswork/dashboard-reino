// Tipos para integração com API Comdinheiro

export interface ComdinheirCredentials {
  username: string;
  password: string;
}

export interface ComdinheiroRequest {
  username: string;
  password: string;
  url: string;
  format: ComdinheiroFormat;
  language?: ComdinheiroLanguage;
}

export interface ComdinheiroResponse {
  success: boolean;
  data?: any;
  error?: string;
  format?: ComdinheiroFormat;
  url?: string;
}

export interface ComdinheiroCodeResponse {
  success: boolean;
  codigo?: string;
  parametros?: ComdinheiroRequest;
  error?: string;
}

export interface ComdinheiroFerramentasResponse {
  success: boolean;
  ferramentas?: string[];
  total?: number;
  error?: string;
}

// Formatos suportados pela API
export type ComdinheiroFormat = "JSON" | "JSON2" | "JSON3" | "XML" | "XML2";

// Linguagens para geração de código
export type ComdinheiroLanguage = "JavaScript" | "Python" | "PHP" | "cURL";

// Ferramentas disponíveis na API
export interface ComdinheiroFerramenta {
  id: string;
  nome: string;
  descricao: string;
  url_exemplo?: string;
  parametros?: ComdinheiroParametro[];
}

export interface ComdinheiroParametro {
  nome: string;
  tipo: "string" | "number" | "date" | "boolean";
  obrigatorio: boolean;
  descricao: string;
  valor_padrao?: any;
  opcoes?: string[];
}

// Configuração de consulta
export interface ComdinheiroConsulta {
  id?: string;
  nome: string;
  ferramenta: string;
  url: string;
  parametros: Record<string, any>;
  formato: ComdinheiroFormat;
  criado_em?: string;
  atualizado_em?: string;
}

// Estado da aplicação para Comdinheiro
export interface ComdinheiroState {
  credenciais: ComdinheirCredentials | null;
  consultas: ComdinheiroConsulta[];
  consultaAtiva: ComdinheiroConsulta | null;
  loading: boolean;
  erro: string | null;
  ultimoResultado: any;
}

// Dados históricos de cotação (exemplo de estrutura)
export interface HistoricoCotacao {
  data: string;
  valor: number;
  ativo: string;
  tipo: string;
}

// Dados de fundos (exemplo de estrutura)
export interface DadosFundo {
  nome: string;
  cnpj: string;
  rentabilidade_mes: number;
  rentabilidade_ano: number;
  patrimonio: number;
  categoria: string;
}

// Indicadores econômicos (exemplo de estrutura)
export interface IndicadorEconomico {
  nome: string;
  valor: number;
  data: string;
  unidade: string;
  fonte: string;
}

// Configurações da aplicação para Comdinheiro
export interface ComdinheiroConfig {
  endpoint: string;
  timeout: number;
  retry_attempts: number;
  cache_duration: number;
  formatos_preferidos: ComdinheiroFormat[];
}

// Resultado de validação
export interface ValidationResult {
  valido: boolean;
  erros: string[];
  avisos?: string[];
}

// Log de requisições
export interface ComdinheiroLog {
  id: string;
  timestamp: string;
  url: string;
  formato: ComdinheiroFormat;
  sucesso: boolean;
  tempo_resposta: number;
  erro?: string;
  tamanho_resposta?: number;
}

// Estatísticas de uso
export interface ComdinheiroStats {
  total_requisicoes: number;
  requisicoes_sucesso: number;
  requisicoes_erro: number;
  tempo_medio_resposta: number;
  formatos_mais_usados: Record<ComdinheiroFormat, number>;
  ferramentas_mais_usadas: Record<string, number>;
}

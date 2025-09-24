import { writable, derived, get } from "svelte/store";
import type {
  ComdinheiroState,
  ComdinheirCredentials,
  ComdinheiroConsulta,
  ComdinheiroRequest,
  ComdinheiroResponse,
  ComdinheiroFerramentasResponse,
  ComdinheiroCodeResponse,
  ComdinheiroFormat,
  ComdinheiroLanguage
} from "$lib/types/comdinheiro";

// Estado principal do Comdinheiro
const initialState: ComdinheiroState = {
  credenciais: null,
  consultas: [],
  consultaAtiva: null,
  loading: false,
  erro: null,
  ultimoResultado: null
};

export const comdinheiroState = writable<ComdinheiroState>(initialState);

// Stores derivados para facilitar o acesso
export const credenciais = derived(
  comdinheiroState,
  ($state) => $state.credenciais
);

export const consultas = derived(
  comdinheiroState,
  ($state) => $state.consultas
);

export const consultaAtiva = derived(
  comdinheiroState,
  ($state) => $state.consultaAtiva
);

export const loading = derived(
  comdinheiroState,
  ($state) => $state.loading
);

export const erro = derived(
  comdinheiroState,
  ($state) => $state.erro
);

export const ultimoResultado = derived(
  comdinheiroState,
  ($state) => $state.ultimoResultado
);

// Store para ferramentas disponíveis
export const ferramentasDisponiveis = writable<string[]>([]);

// Store para histórico de consultas
export const historicoConsultas = writable<ComdinheiroConsulta[]>([]);

// Funções para gerenciar credenciais
export function definirCredenciais(credenciais: ComdinheirCredentials) {
  comdinheiroState.update(state => ({
    ...state,
    credenciais,
    erro: null
  }));
  
  // Salvar no localStorage (sem a senha por segurança)
  if (typeof window !== "undefined") {
    localStorage.setItem("comdinheiro_username", credenciais.username);
  }
}

export function limparCredenciais() {
  comdinheiroState.update(state => ({
    ...state,
    credenciais: null
  }));
  
  if (typeof window !== "undefined") {
    localStorage.removeItem("comdinheiro_username");
  }
}

// Função para carregar credenciais salvas
export function carregarCredenciais() {
  if (typeof window !== "undefined") {
    const username = localStorage.getItem("comdinheiro_username");
    if (username) {
      comdinheiroState.update(state => ({
        ...state,
        credenciais: { username, password: "" }
      }));
    }
  }
}

// Função para buscar ferramentas disponíveis
export async function buscarFerramentas(): Promise<string[]> {
  try {
    comdinheiroState.update(state => ({ ...state, loading: true, erro: null }));

    const response = await fetch("/api/comdinheiro?action=ferramentas");
    const data: ComdinheiroFerramentasResponse = await response.json();

    if (data.success && data.ferramentas) {
      ferramentasDisponiveis.set(data.ferramentas);
      return data.ferramentas;
    } else {
      throw new Error(data.error || "Erro ao buscar ferramentas");
    }
  } catch (error) {
    const mensagem = error instanceof Error ? error.message : "Erro desconhecido";
    comdinheiroState.update(state => ({ ...state, erro: mensagem }));
    throw error;
  } finally {
    comdinheiroState.update(state => ({ ...state, loading: false }));
  }
}

// Função para executar consulta
export async function executarConsulta(request: ComdinheiroRequest): Promise<any> {
  try {
    comdinheiroState.update(state => ({ ...state, loading: true, erro: null }));

    const response = await fetch("/api/comdinheiro", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(request)
    });

    const data: ComdinheiroResponse = await response.json();

    if (data.success) {
      comdinheiroState.update(state => ({
        ...state,
        ultimoResultado: data.data
      }));
      
      // Salvar no histórico
      const consulta: ComdinheiroConsulta = {
        id: Date.now().toString(),
        nome: `Consulta ${new Date().toLocaleString()}`,
        ferramenta: extrairFerramenta(request.url),
        url: request.url,
        parametros: request,
        formato: request.format,
        criado_em: new Date().toISOString()
      };
      
      adicionarAoHistorico(consulta);
      
      return data.data;
    } else {
      throw new Error(data.error || "Erro na consulta");
    }
  } catch (error) {
    const mensagem = error instanceof Error ? error.message : "Erro desconhecido";
    comdinheiroState.update(state => ({ ...state, erro: mensagem }));
    throw error;
  } finally {
    comdinheiroState.update(state => ({ ...state, loading: false }));
  }
}

// Função para gerar código
export async function gerarCodigo(
  request: ComdinheiroRequest & { language: ComdinheiroLanguage }
): Promise<string> {
  try {
    const params = new URLSearchParams({
      action: "gerar-codigo",
      username: request.username,
      password: request.password,
      url: request.url,
      format: request.format,
      language: request.language
    });

    const response = await fetch(`/api/comdinheiro?${params}`);
    const data: ComdinheiroCodeResponse = await response.json();

    if (data.success && data.codigo) {
      return data.codigo;
    } else {
      throw new Error(data.error || "Erro ao gerar código");
    }
  } catch (error) {
    const mensagem = error instanceof Error ? error.message : "Erro desconhecido";
    comdinheiroState.update(state => ({ ...state, erro: mensagem }));
    throw error;
  }
}

// Função para adicionar consulta ao histórico
function adicionarAoHistorico(consulta: ComdinheiroConsulta) {
  historicoConsultas.update(historico => {
    const novoHistorico = [consulta, ...historico];
    
    // Manter apenas os últimos 50 itens
    if (novoHistorico.length > 50) {
      novoHistorico.splice(50);
    }
    
    // Salvar no localStorage
    if (typeof window !== "undefined") {
      localStorage.setItem("comdinheiro_historico", JSON.stringify(novoHistorico));
    }
    
    return novoHistorico;
  });
}

// Função para carregar histórico do localStorage
export function carregarHistorico() {
  if (typeof window !== "undefined") {
    const historico = localStorage.getItem("comdinheiro_historico");
    if (historico) {
      try {
        const dados = JSON.parse(historico);
        historicoConsultas.set(dados);
      } catch (error) {
        console.error("Erro ao carregar histórico:", error);
      }
    }
  }
}

// Função para limpar histórico
export function limparHistorico() {
  historicoConsultas.set([]);
  if (typeof window !== "undefined") {
    localStorage.removeItem("comdinheiro_historico");
  }
}

// Função para definir consulta ativa
export function definirConsultaAtiva(consulta: ComdinheiroConsulta | null) {
  comdinheiroState.update(state => ({
    ...state,
    consultaAtiva: consulta
  }));
}

// Função para limpar erro
export function limparErro() {
  comdinheiroState.update(state => ({
    ...state,
    erro: null
  }));
}

// Função auxiliar para extrair nome da ferramenta da URL
function extrairFerramenta(url: string): string {
  const match = url.match(/^([^.]+)/);
  return match ? match[1] : "Desconhecida";
}

// Função para validar credenciais
export function validarCredenciais(credenciais: ComdinheirCredentials): boolean {
  return !!(credenciais.username && credenciais.password);
}

// Função para validar URL de consulta
export function validarUrlConsulta(url: string): { valido: boolean; erro?: string } {
  if (!url.trim()) {
    return { valido: false, erro: "URL é obrigatória" };
  }
  
  if (url.includes("comdinheiro.com.br")) {
    return { valido: false, erro: "Não inclua o domínio na URL" };
  }
  
  if (!url.includes(".php")) {
    return { valido: false, erro: "URL deve apontar para um arquivo .php" };
  }
  
  return { valido: true };
}

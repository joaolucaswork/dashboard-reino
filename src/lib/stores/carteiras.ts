import { writable, derived } from "svelte/store";
import { browser } from "$app/environment";
import { appConfig } from "./config.js";

// =====================================================================
// Types
// =====================================================================

export interface CarteiraOption {
  value: string;
  label: string;
}

export interface CarteiraDetalhada {
  id: string;
  nome: string;
  numero_conta: string | null;
  banco: string | null;
  patrimonio: number;
  porcentagem: number;
  mensalidade: number;
  data_modificacao: string;
  fonte: string;
}

export interface CarteirasResponse {
  success: boolean;
  carteiras: string[];
  carteiras_detalhadas?: CarteiraDetalhada[];
  total?: number;
  source: "salesforce" | "database";
  error?: string;
}

// =====================================================================
// Stores
// =====================================================================

// Estado das carteiras carregadas
export const carteirasDisponiveis = writable<string[]>([]);

// Estado das carteiras detalhadas (com dados financeiros)
export const carteirasDetalhadas = writable<CarteiraDetalhada[]>([]);

// Estado de carregamento
export const carregandoCarteiras = writable<boolean>(false);

// Erro ao carregar carteiras
export const erroCarteiras = writable<string | null>(null);

/**
 * Busca carteiras usando a fonte configurada globalmente
 */
export async function buscarCarteirasConfig(): Promise<CarteirasResponse> {
  if (!browser) {
    return {
      success: false,
      carteiras: [],
      source: "database",
      error: "Função disponível apenas no navegador",
    };
  }

  let fonte: "salesforce" | "database" = "database";

  // Obter fonte atual da configuração
  appConfig.subscribe((config) => {
    fonte = config.fonteCarteiras;
  })();

  return await buscarCarteiras(fonte);
}

// Store derivado para opções do combobox
export const carteiraOptions = derived(carteirasDisponiveis, ($carteiras) =>
  $carteiras
    .map(
      (carteira): CarteiraOption => ({
        value: carteira,
        label: formatarNomeCarteira(carteira),
      })
    )
    .sort((a, b) => a.label.localeCompare(b.label, "pt-BR"))
);

// Store derivado para carteiras detalhadas ordenadas por patrimônio
export const carteirasOrdenadas = derived(carteirasDetalhadas, ($carteiras) =>
  [...$carteiras].sort((a, b) => b.patrimonio - a.patrimonio)
);

// Store derivado para estatísticas das carteiras
export const estatisticasCarteiras = derived(
  carteirasDetalhadas,
  ($carteiras) => {
    if ($carteiras.length === 0) {
      return {
        total: 0,
        patrimonioTotal: 0,
        mensalidadeTotal: 0,
        mediaPorcentagem: 0,
      };
    }

    const patrimonioTotal = $carteiras.reduce(
      (sum, c) => sum + c.patrimonio,
      0
    );
    const mensalidadeTotal = $carteiras.reduce(
      (sum, c) => sum + c.mensalidade,
      0
    );
    const mediaPorcentagem =
      $carteiras.reduce((sum, c) => sum + c.porcentagem, 0) / $carteiras.length;

    return {
      total: $carteiras.length,
      patrimonioTotal,
      mensalidadeTotal,
      mediaPorcentagem,
    };
  }
);

// =====================================================================
// Funções de API
// =====================================================================

/**
 * Busca carteiras do backend Python
 */
export async function buscarCarteiras(
  source: "salesforce" | "database" = "database"
): Promise<CarteirasResponse> {
  if (!browser) {
    return {
      success: false,
      carteiras: [],
      source,
      error: "Função disponível apenas no navegador",
    };
  }

  carregandoCarteiras.set(true);
  erroCarteiras.set(null);

  try {
    const url = `/api/carteiras?source=${source}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: CarteirasResponse = await response.json();

    if (data.success) {
      carteirasDisponiveis.set(data.carteiras);
      // Atualizar carteiras detalhadas se disponível
      if (data.carteiras_detalhadas) {
        carteirasDetalhadas.set(data.carteiras_detalhadas);
      }
      erroCarteiras.set(null);
    } else {
      erroCarteiras.set(data.error || "Erro ao buscar carteiras");
    }

    return data;
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Erro desconhecido";
    erroCarteiras.set(errorMessage);

    return {
      success: false,
      carteiras: [],
      source,
      error: errorMessage,
    };
  } finally {
    carregandoCarteiras.set(false);
  }
}

/**
 * Atualiza carteiras forçando nova busca
 */
export async function atualizarCarteiras(
  source: "salesforce" | "database" = "database"
): Promise<CarteirasResponse> {
  // Limpar dados atuais
  carteirasDisponiveis.set([]);

  // Buscar novamente
  return await buscarCarteiras(source);
}

/**
 * Busca carteiras com filtro local
 */
export function filtrarCarteiras(termo: string): CarteiraOption[] {
  let carteiras: string[] = [];
  carteirasDisponiveis.subscribe((value) => {
    carteiras = value;
  })();

  if (!termo.trim()) {
    return carteiras.map((carteira) => ({
      value: carteira,
      label: formatarNomeCarteira(carteira),
    }));
  }

  const termoLower = termo.toLowerCase();
  return carteiras
    .filter(
      (carteira) =>
        carteira.toLowerCase().includes(termoLower) ||
        formatarNomeCarteira(carteira).toLowerCase().includes(termoLower)
    )
    .map((carteira) => ({
      value: carteira,
      label: formatarNomeCarteira(carteira),
    }))
    .sort((a, b) => a.label.localeCompare(b.label, "pt-BR"));
}

// =====================================================================
// Funções utilitárias
// =====================================================================

/**
 * Formatar nome da carteira para exibição
 */
export function formatarNomeCarteira(nome: string): string {
  return nome
    .replace(/_/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .split(" ")
    .map(
      (palavra) =>
        palavra.charAt(0).toUpperCase() + palavra.slice(1).toLowerCase()
    )
    .join(" ")
    .trim();
}

/**
 * Obter iniciais da carteira para o avatar
 */
export function obterIniciaisCarteira(nome: string): string {
  return formatarNomeCarteira(nome)
    .split(" ")
    .map((palavra) => palavra[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

/**
 * Validar se carteira existe na lista
 */
export function validarCarteira(nome: string): boolean {
  let carteiras: string[] = [];
  carteirasDisponiveis.subscribe((value) => {
    carteiras = value;
  })();

  return carteiras.includes(nome);
}

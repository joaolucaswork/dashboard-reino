import { writable, derived } from "svelte/store";
import { browser } from "$app/environment";

// Tipos
export interface ComdinheiroCredentials {
  username: string;
  password: string;
}

export interface CarteirasComdinheiroState {
  carteiras: string[];
  loading: boolean;
  error: string | null;
  credentials: ComdinheiroCredentials | null;
  lastFetch: number | null;
}

export interface CarteiraComdinheiroOption {
  value: string;
  label: string;
  formatted: string;
}

// Estado inicial
const initialState: CarteirasComdinheiroState = {
  carteiras: [],
  loading: false,
  error: null,
  credentials: null,
  lastFetch: null,
};

// Store principal
export const carteirasComdinheiroState =
  writable<CarteirasComdinheiroState>(initialState);

// Stores derivados para facilitar o uso
export const carteirasComdinheiro = derived(
  carteirasComdinheiroState,
  ($state) => $state.carteiras
);

export const carregandoCarteirasComdinheiro = derived(
  carteirasComdinheiroState,
  ($state) => $state.loading
);

export const erroCarteirasComdinheiro = derived(
  carteirasComdinheiroState,
  ($state) => $state.error
);

export const credenciaisComdinheiro = derived(
  carteirasComdinheiroState,
  ($state) => $state.credentials
);

// Store derivado para verificar se o usuário está logado no comdinheiro
export const usuarioLogadoComdinheiro = derived(
  carteirasComdinheiroState,
  ($state) => {
    // User is considered authenticated if they have valid credentials
    // Wallets will be fetched automatically in the background
    return !!(
      $state.credentials &&
      $state.credentials.username &&
      $state.credentials.password
    );
  }
);

// Store derivado para verificar se o usuário tem carteiras carregadas
export const carteirasCarregadas = derived(
  carteirasComdinheiroState,
  ($state) => {
    return $state.carteiras.length > 0;
  }
);

// Store derivado para opções formatadas
export const carteirasComdinheiroOptions = derived(
  carteirasComdinheiro,
  ($carteiras) => {
    return $carteiras
      .map(
        (carteira): CarteiraComdinheiroOption => ({
          value: carteira,
          label: formatarNomeCarteira(carteira),
          formatted: carteira,
        })
      )
      .sort((a, b) => a.label.localeCompare(b.label, "pt-BR"));
  }
);

// Constantes
const STORAGE_KEY = "comdinheiro_credentials";
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

// Funções utilitárias
export function formatarNomeCarteira(nome: string): string {
  return nome
    .replace(/_/g, " ")
    .replace(/\b\w/g, (l) => l.toUpperCase())
    .trim();
}

// Carregar credenciais do localStorage
export function carregarCredenciais(): ComdinheiroCredentials | null {
  if (!browser) return null;

  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const credentials = JSON.parse(saved);
      if (credentials.username && credentials.password) {
        return credentials;
      }
    }
  } catch (error) {
    console.error("Erro ao carregar credenciais:", error);
  }

  return null;
}

// Salvar credenciais no localStorage
export function salvarCredenciais(credentials: ComdinheiroCredentials): void {
  if (!browser) return;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(credentials));
    carteirasComdinheiroState.update((state) => ({
      ...state,
      credentials,
    }));
  } catch (error) {
    console.error("Erro ao salvar credenciais:", error);
  }
}

// Limpar credenciais
export function limparCredenciais(): void {
  if (!browser) return;

  try {
    localStorage.removeItem(STORAGE_KEY);
    carteirasComdinheiroState.update((state) => ({
      ...state,
      credentials: null,
      carteiras: [],
      error: null,
    }));
  } catch (error) {
    console.error("Erro ao limpar credenciais:", error);
  }
}

// Verificar se o cache ainda é válido
function isCacheValid(lastFetch: number | null): boolean {
  if (!lastFetch) return false;
  return Date.now() - lastFetch < CACHE_DURATION;
}

// Buscar carteiras do Comdinheiro
export async function buscarCarteirasComdinheiro(
  credentials?: ComdinheiroCredentials,
  forceRefresh = false
): Promise<{ success: boolean; error?: string; carteiras?: string[] }> {
  if (!browser) {
    return { success: false, error: "Função disponível apenas no navegador" };
  }

  // Usar credenciais fornecidas ou carregadas
  const creds = credentials || carregarCredenciais();
  if (!creds || !creds.username || !creds.password) {
    return {
      success: false,
      error: "Credenciais do Comdinheiro não configuradas",
    };
  }

  // Verificar cache se não for refresh forçado
  const currentState = carteirasComdinheiroState;
  let state: CarteirasComdinheiroState;
  currentState.subscribe((s) => (state = s))();

  if (
    !forceRefresh &&
    isCacheValid(state!.lastFetch) &&
    state!.carteiras.length > 0 &&
    state!.credentials?.username === creds.username
  ) {
    return { success: true, carteiras: state!.carteiras };
  }

  // Iniciar loading
  carteirasComdinheiroState.update((state) => ({
    ...state,
    loading: true,
    error: null,
  }));

  try {
    const params = new URLSearchParams({
      action: "carteiras",
      username: creds.username,
      password: creds.password,
    });

    const response = await fetch(`/api/comdinheiro?${params}`);
    const data = await response.json();

    if (data.success) {
      const carteiras = data.carteiras || [];

      carteirasComdinheiroState.update((state) => ({
        ...state,
        carteiras,
        loading: false,
        error: null,
        credentials: creds,
        lastFetch: Date.now(),
      }));

      // Salvar credenciais se a busca foi bem-sucedida
      salvarCredenciais(creds);

      return { success: true, carteiras };
    } else {
      throw new Error(data.error || "Erro ao buscar carteiras");
    }
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Erro desconhecido";

    carteirasComdinheiroState.update((state) => ({
      ...state,
      loading: false,
      error: errorMessage,
    }));

    return { success: false, error: errorMessage };
  }
}

// Filtrar carteiras
export function filtrarCarteirasComdinheiro(
  termo: string
): CarteiraComdinheiroOption[] {
  let carteiras: string[] = [];
  carteirasComdinheiro.subscribe((value) => (carteiras = value))();

  if (!termo.trim()) {
    return carteiras.map((carteira) => ({
      value: carteira,
      label: formatarNomeCarteira(carteira),
      formatted: carteira,
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
      formatted: carteira,
    }))
    .sort((a, b) => a.label.localeCompare(b.label, "pt-BR"));
}

// Resetar estado
export function resetarCarteirasComdinheiro(): void {
  carteirasComdinheiroState.set(initialState);
}

// Inicializar store (carregar credenciais salvas e buscar carteiras)
export async function inicializarCarteirasComdinheiro(): Promise<void> {
  if (!browser) return;

  const credentials = carregarCredenciais();
  if (credentials) {
    // Atualizar estado com credenciais
    carteirasComdinheiroState.update((state) => ({
      ...state,
      credentials,
    }));

    // Buscar carteiras automaticamente se temos credenciais válidas
    // Não bloquear a inicialização se falhar - apenas log o erro
    try {
      await buscarCarteirasComdinheiro(credentials);
    } catch (error) {
      console.warn(
        "Aviso: Não foi possível restaurar carteiras na inicialização:",
        error
      );
      // Não limpar credenciais - pode ser um erro temporário de rede
      // O usuário ainda pode tentar fazer login manualmente
    }
  }
}

// Auto-inicializar se estiver no browser
if (browser) {
  // Use setTimeout to ensure DOM is ready and avoid blocking
  setTimeout(() => {
    inicializarCarteirasComdinheiro();
  }, 0);
}

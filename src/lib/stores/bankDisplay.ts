import { writable, derived } from "svelte/store";
import { browser } from "$app/environment";

// Tipo para definir como os bancos devem ser exibidos
export type BankDisplayMode = "logo" | "colored-dot";

// Key para localStorage
const BANK_DISPLAY_KEY = "reino-bank-display-mode";

// Função para carregar a preferência do localStorage
function loadBankDisplayMode(): BankDisplayMode {
  if (!browser) return "colored-dot";

  try {
    const saved = localStorage.getItem(BANK_DISPLAY_KEY);
    return saved === "logo" ? "logo" : "colored-dot";
  } catch {
    return "colored-dot";
  }
}

// Função para salvar a preferência no localStorage
function saveBankDisplayMode(mode: BankDisplayMode) {
  if (!browser) return;

  try {
    localStorage.setItem(BANK_DISPLAY_KEY, mode);
  } catch {
    // Falha silenciosa se localStorage não estiver disponível
  }
}

// Store principal para o modo de exibição dos bancos
function createBankDisplayStore() {
  const { subscribe, set } = writable<BankDisplayMode>(loadBankDisplayMode());

  return {
    subscribe,
    setMode: (mode: BankDisplayMode) => {
      set(mode);
      saveBankDisplayMode(mode);
    },
    toggleMode: () => {
      const currentMode = loadBankDisplayMode();
      const newMode = currentMode === "logo" ? "colored-dot" : "logo";
      set(newMode);
      saveBankDisplayMode(newMode);
    },
    reset: () => {
      set("colored-dot");
      saveBankDisplayMode("colored-dot");
    },
  };
}

export const bankDisplayMode = createBankDisplayStore();

// Store derivado para verificar se está no modo logo
export const isLogoMode = derived(bankDisplayMode, ($mode) => $mode === "logo");

// Store derivado para verificar se está no modo bola colorida
export const isColoredDotMode = derived(
  bankDisplayMode,
  ($mode) => $mode === "colored-dot"
);

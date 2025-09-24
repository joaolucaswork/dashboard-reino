import { writable } from "svelte/store";
import { browser } from "$app/environment";

// =====================================================================
// Types
// =====================================================================

export interface AppConfig {
  fonteCarteiras: "salesforce" | "database";
  atualizacaoAutomatica: boolean;
  tempoTimeoutProcessamento: number;
  diretorioRelatorios: string;
}

// =====================================================================
// Default Configuration
// =====================================================================

const defaultConfig: AppConfig = {
  fonteCarteiras: "salesforce",
  atualizacaoAutomatica: true,
  tempoTimeoutProcessamento: 30,
  diretorioRelatorios: "downloads",
};

// =====================================================================
// Stores
// =====================================================================

export const appConfig = writable<AppConfig>(defaultConfig);

// =====================================================================
// Configuration Management
// =====================================================================

/**
 * Carrega configurações do localStorage
 */
export function carregarConfiguracoes(): void {
  if (!browser) return;

  try {
    const saved = localStorage.getItem("dashboard-reino-config");
    if (saved) {
      const config = JSON.parse(saved);
      appConfig.set({ ...defaultConfig, ...config });
    }
  } catch (error) {
    console.warn("Erro ao carregar configurações:", error);
    appConfig.set(defaultConfig);
  }
}

/**
 * Salva configurações no localStorage
 */
export function salvarConfiguracoes(config: AppConfig): void {
  if (!browser) return;

  try {
    localStorage.setItem("dashboard-reino-config", JSON.stringify(config));
    appConfig.set(config);
  } catch (error) {
    console.error("Erro ao salvar configurações:", error);
  }
}

/**
 * Atualiza uma configuração específica
 */
export function atualizarConfiguracao<K extends keyof AppConfig>(
  chave: K,
  valor: AppConfig[K]
): void {
  appConfig.update((config) => {
    const novaConfig = { ...config, [chave]: valor };
    if (browser) {
      try {
        localStorage.setItem(
          "dashboard-reino-config",
          JSON.stringify(novaConfig)
        );
      } catch (error) {
        console.error("Erro ao salvar configuração:", error);
      }
    }
    return novaConfig;
  });
}

/**
 * Reseta configurações para o padrão
 */
export function resetarConfiguracoes(): void {
  if (browser) {
    localStorage.removeItem("dashboard-reino-config");
  }
  appConfig.set(defaultConfig);
}

// =====================================================================
// Derived Stores
// =====================================================================

export const fonteCarteiras = writable<"salesforce" | "database">("database");

// Sincronizar com appConfig
appConfig.subscribe((config) => {
  fonteCarteiras.set(config.fonteCarteiras);
});

// Sincronizar mudanças na fonte com appConfig
fonteCarteiras.subscribe((fonte) => {
  appConfig.update((config) => ({
    ...config,
    fonteCarteiras: fonte,
  }));
});

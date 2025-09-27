import { toast as sonnerToast } from "svelte-sonner";
import LoadingSpinner from "$lib/components/ui/LoadingSpinner.svelte";
import { get } from "svelte/store";

/**
 * Toast utility functions with Portuguese messages
 * Following the project's styling standards and Portuguese language requirements
 *
 * Authentication-aware notifications: Financial data notifications are only shown
 * to authenticated users to prevent system notifications from appearing to
 * unauthenticated users.
 */

// Import authentication store - using dynamic import to avoid circular dependencies
let usuarioLogadoComdinheiro: any = null;

/**
 * Initialize authentication store reference
 * This is called lazily to avoid circular dependency issues
 */
async function getAuthStore() {
  if (!usuarioLogadoComdinheiro) {
    try {
      const { usuarioLogadoComdinheiro: authStore } = await import(
        "$lib/stores/carteirasComdinheiro.js"
      );
      usuarioLogadoComdinheiro = authStore;
    } catch (error) {
      console.warn("Could not load authentication store:", error);
      return null;
    }
  }
  return usuarioLogadoComdinheiro;
}

/**
 * Check if user is authenticated for financial data notifications
 */
async function isUserAuthenticated(): Promise<boolean> {
  try {
    const authStore = await getAuthStore();
    if (!authStore) return false;
    return get(authStore) || false;
  } catch (error) {
    console.warn("Authentication check failed:", error);
    return false;
  }
}

export const toast = {
  /**
   * Show a success toast notification
   */
  success: (message: string, options?: any) => {
    return sonnerToast.success(message, {
      duration: 4000,
      ...options,
    });
  },

  /**
   * Show an error toast notification
   */
  error: (message: string, options?: any) => {
    return sonnerToast.error(message, {
      duration: 6000, // Longer duration for errors
      ...options,
    });
  },

  /**
   * Show a loading toast notification with custom spinner component
   */
  loading: (message: string, options?: any) => {
    return sonnerToast(message, {
      duration: Infinity, // Loading toasts should persist until dismissed
      icon: LoadingSpinner,
      ...options,
    });
  },

  /**
   * Show an info toast notification
   */
  info: (message: string, options?: any) => {
    return sonnerToast.info(message, {
      duration: 4000,
      ...options,
    });
  },

  /**
   * Show a warning toast notification
   */
  warning: (message: string, options?: any) => {
    return sonnerToast.warning(message, {
      duration: 5000,
      ...options,
    });
  },

  /**
   * Dismiss a specific toast by ID
   */
  dismiss: (toastId?: string | number) => {
    return sonnerToast.dismiss(toastId);
  },

  /**
   * Dismiss all toasts
   */
  dismissAll: () => {
    return sonnerToast.dismiss();
  },

  /**
   * Update an existing toast
   */
  update: (toastId: string | number, data: any) => {
    return sonnerToast(data.description || "", {
      id: toastId,
      ...data,
    });
  },
};

/**
 * Predefined toast messages in Portuguese for common scenarios
 */
export const toastMessages = {
  // Success messages
  success: {
    dataLoaded: "Dados carregados",
    dataSaved: "Dados salvos",
    operationCompleted: "Operação concluída",
    configurationSaved: "Configuração salva",
    portfolioUpdated: "Portfolio atualizado",
    transactionProcessed: "Transação processada",
  },

  // Error messages
  error: {
    dataLoadFailed: "Erro ao carregar dados",
    saveFailed: "Erro ao salvar",
    networkError: "Erro de conexão",
    validationError: "Dados inválidos",
    unexpectedError: "Erro inesperado",
    portfolioError: "Erro no portfolio",
    transactionError: "Erro na transação",
  },

  // Loading messages
  loading: {
    consultingData: "Consultando dados...",
    savingData: "Salvando dados...",
    processing: "Processando...",
    loading: "Carregando...",
    analyzingPortfolio: "Analisando portfolio...",
    calculatingReturns: "Calculando retornos...",
  },

  // Info messages
  info: {
    noDataFound: "Nenhum dado encontrado",
    selectOptions: "Selecione as opções",
    configureSettings: "Configure as opções",
    portfolioInfo: "Portfolio atualizado",
    marketUpdate: "Mercado atualizado",
  },

  // Warning messages
  warning: {
    unsavedChanges: "Alterações não salvas",
    invalidData: "Dados incorretos",
    checkConfiguration: "Verifique configuração",
    portfolioRisk: "Portfolio com risco",
    marketVolatility: "Mercado volátil",
  },
};

/**
 * Convenience functions using predefined messages
 */
export const showToast = {
  // Success toasts
  dataLoaded: () => toast.success(toastMessages.success.dataLoaded),
  portfolioUpdated: () => toast.success(toastMessages.success.portfolioUpdated),
  transactionProcessed: () =>
    toast.success(toastMessages.success.transactionProcessed),
  configurationSaved: () =>
    toast.success(toastMessages.success.configurationSaved),

  // Error toasts
  dataLoadFailed: (error?: string) =>
    toast.error(error || toastMessages.error.dataLoadFailed),
  portfolioError: (error?: string) =>
    toast.error(error || toastMessages.error.portfolioError),
  transactionError: (error?: string) =>
    toast.error(error || toastMessages.error.transactionError),
  networkError: () => toast.error(toastMessages.error.networkError),
  validationError: () => toast.error(toastMessages.error.validationError),
  unexpectedError: () => toast.error(toastMessages.error.unexpectedError),

  // Loading toasts
  consultingData: () => toast.loading(toastMessages.loading.consultingData),
  analyzingPortfolio: () =>
    toast.loading(toastMessages.loading.analyzingPortfolio),
  calculatingReturns: () =>
    toast.loading(toastMessages.loading.calculatingReturns),
  savingData: () => toast.loading(toastMessages.loading.savingData),

  // Info toasts
  portfolioInfo: () => toast.info(toastMessages.info.portfolioInfo),
  marketUpdate: () => toast.info(toastMessages.info.marketUpdate),
  noDataFound: () => toast.info(toastMessages.info.noDataFound),

  // Warning toasts
  portfolioRisk: () => toast.warning(toastMessages.warning.portfolioRisk),
  marketVolatility: () => toast.warning(toastMessages.warning.marketVolatility),
  unsavedChanges: () => toast.warning(toastMessages.warning.unsavedChanges),
};

/**
 * Authentication-aware toast functions for financial data notifications
 * These functions check if the user is authenticated before showing notifications
 * related to financial data, wallets, portfolios, and system operations.
 */
export const authToast = {
  /**
   * Show authentication-aware success toast for financial operations
   */
  success: async (message: string, options?: any) => {
    const isAuthenticated = await isUserAuthenticated();
    if (isAuthenticated) {
      return toast.success(message, options);
    }
    // Silently ignore notification for unauthenticated users
    return null;
  },

  /**
   * Show authentication-aware error toast for financial operations
   * Note: Critical errors may still be shown to unauthenticated users
   */
  error: async (
    message: string,
    options?: any,
    showToUnauthenticated = false
  ) => {
    const isAuthenticated = await isUserAuthenticated();
    if (isAuthenticated || showToUnauthenticated) {
      return toast.error(message, options);
    }
    // Silently ignore notification for unauthenticated users
    return null;
  },

  /**
   * Show authentication-aware info toast for financial operations
   */
  info: async (message: string, options?: any) => {
    const isAuthenticated = await isUserAuthenticated();
    if (isAuthenticated) {
      return toast.info(message, options);
    }
    // Silently ignore notification for unauthenticated users
    return null;
  },

  /**
   * Show authentication-aware loading toast for financial operations
   */
  loading: async (message: string, options?: any) => {
    const isAuthenticated = await isUserAuthenticated();
    if (isAuthenticated) {
      return toast.loading(message, options);
    }
    // Silently ignore notification for unauthenticated users
    return null;
  },

  /**
   * Show authentication-aware warning toast for financial operations
   */
  warning: async (message: string, options?: any) => {
    const isAuthenticated = await isUserAuthenticated();
    if (isAuthenticated) {
      return toast.warning(message, options);
    }
    // Silently ignore notification for unauthenticated users
    return null;
  },
};

/**
 * Authentication-aware convenience functions for common financial notifications
 * These replace the showToast functions for financial data operations
 */
export const authShowToast = {
  // Success toasts for financial operations
  dataLoaded: () => authToast.success(toastMessages.success.dataLoaded),
  portfolioUpdated: () =>
    authToast.success(toastMessages.success.portfolioUpdated),
  transactionProcessed: () =>
    authToast.success(toastMessages.success.transactionProcessed),
  configurationSaved: () =>
    authToast.success(toastMessages.success.configurationSaved),

  // Wallet/Portfolio specific success messages
  walletsLoaded: (count: number) =>
    authToast.success(`${count} carteiras carregadas`),
  walletSelected: (name: string) =>
    authToast.success(`Carteira "${name}" selecionada`),
  loginSuccess: (message: string) => authToast.success(message),

  // Error toasts for financial operations
  dataLoadFailed: (error?: string) =>
    authToast.error(error || toastMessages.error.dataLoadFailed),
  portfolioError: (error?: string) =>
    authToast.error(error || toastMessages.error.portfolioError),
  transactionError: (error?: string) =>
    authToast.error(error || toastMessages.error.transactionError),
  networkError: () => authToast.error(toastMessages.error.networkError),

  // Wallet/Portfolio specific error messages
  walletLoadFailed: (error?: string) =>
    authToast.error(error || "Erro ao carregar carteiras"),
  loginFailed: (error?: string) =>
    authToast.error(error || "Erro ao fazer login"),
  credentialsError: (error?: string) =>
    authToast.error(error || "Erro nas credenciais"),

  // Loading toasts for financial operations
  consultingData: () => authToast.loading(toastMessages.loading.consultingData),
  analyzingPortfolio: () =>
    authToast.loading(toastMessages.loading.analyzingPortfolio),
  calculatingReturns: () =>
    authToast.loading(toastMessages.loading.calculatingReturns),
  savingData: () => authToast.loading(toastMessages.loading.savingData),

  // Wallet/Portfolio specific loading messages
  loadingWallets: () => authToast.loading("Carregando carteiras..."),
  connectingToService: () => authToast.loading("Conectando ao serviço..."),

  // Info toasts for financial operations
  portfolioInfo: () => authToast.info(toastMessages.info.portfolioInfo),
  marketUpdate: () => authToast.info(toastMessages.info.marketUpdate),
  noDataFound: () => authToast.info(toastMessages.info.noDataFound),

  // Warning toasts for financial operations
  portfolioRisk: () => authToast.warning(toastMessages.warning.portfolioRisk),
  marketVolatility: () =>
    authToast.warning(toastMessages.warning.marketVolatility),
  unsavedChanges: () => authToast.warning(toastMessages.warning.unsavedChanges),
};

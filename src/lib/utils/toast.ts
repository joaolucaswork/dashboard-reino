import { toast as sonnerToast } from "svelte-sonner";
import LoadingSpinner from "$lib/components/ui/LoadingSpinner.svelte";

/**
 * Toast utility functions with Portuguese messages
 * Following the project's styling standards and Portuguese language requirements
 */

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

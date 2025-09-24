/**
 * Currency Store for SvelteKit Financial Dashboard
 *
 * This store provides reactive currency handling specifically for the
 * Posição Consolidada feature, integrating with existing tabelas stores
 * and providing real-time currency calculations and formatting.
 */

import { writable, derived, type Readable } from "svelte/store";
import {
  currency,
  type MonetaryValue,
  type PortfolioFinancialData,
  type CurrencyFormatOptions,
  type RawPortfolioData,
} from "./currency.js";

// =====================================================================
// Store Types
// =====================================================================

/**
 * Currency display preferences
 */
export interface CurrencyPreferences {
  /** Show R$ symbol */
  showSymbol: boolean;
  /** Use compact notation for large numbers */
  useCompactNotation: boolean;
  /** Number of decimal places to show */
  decimalPlaces: number;
  /** Highlight negative values */
  highlightNegatives: boolean;
}

/**
 * Currency calculation context for portfolio
 */
export interface CurrencyContext {
  /** Raw data from backend */
  rawData: RawPortfolioData | null;
  /** Processed financial data */
  processedData: PortfolioFinancialData | null;
  /** Display preferences */
  preferences: CurrencyPreferences;
  /** Loading state */
  isLoading: boolean;
  /** Error state */
  error: string | null;
}

// =====================================================================
// Base Stores
// =====================================================================

/** Currency display preferences store */
export const currencyPreferences = writable<CurrencyPreferences>({
  showSymbol: true,
  useCompactNotation: false,
  decimalPlaces: 2,
  highlightNegatives: true,
});

/** Currency calculation context store */
export const currencyContext = writable<CurrencyContext>({
  rawData: null,
  processedData: null,
  preferences: {
    showSymbol: true,
    useCompactNotation: false,
    decimalPlaces: 2,
    highlightNegatives: true,
  },
  isLoading: false,
  error: null,
});

// =====================================================================
// Derived Stores
// =====================================================================

/**
 * Current formatting options based on preferences
 */
export const formatOptions: Readable<CurrencyFormatOptions> = derived(
  currencyPreferences,
  ($preferences) => ({
    includeSymbol: $preferences.showSymbol,
    decimalPlaces: $preferences.decimalPlaces,
    compact: $preferences.useCompactNotation,
  })
);

/**
 * Formatted portfolio totals ready for display
 */
export const formattedPortfolioTotals = derived(
  [currencyContext, formatOptions],
  ([$context, $formatOptions]) => {
    if (!$context.processedData) {
      return {
        portfolioTotal: currency.format(0, $formatOptions),
        bankTotals: {},
        categoryTotals: {},
        assetTypeTotals: {},
      };
    }

    return currency.formatPortfolio($context.processedData, $formatOptions);
  }
);

/**
 * Portfolio total as a monetary value
 */
export const portfolioTotal: Readable<MonetaryValue> = derived(
  [currencyContext, formatOptions],
  ([$context, $formatOptions]) => {
    const amount = $context.processedData?.portfolioTotal || 0;
    return currency.create(amount, $formatOptions);
  }
);

/**
 * Bank totals as monetary values
 */
export const bankTotals: Readable<Record<string, MonetaryValue>> = derived(
  [currencyContext, formatOptions],
  ([$context, $formatOptions]) => {
    if (!$context.processedData) return {};

    return Object.fromEntries(
      Object.entries($context.processedData.bankTotals).map(
        ([bank, amount]) => [bank, currency.create(amount, $formatOptions)]
      )
    );
  }
);

/**
 * Whether the portfolio has any data
 */
export const hasPortfolioData: Readable<boolean> = derived(
  currencyContext,
  ($context) =>
    $context.processedData !== null && $context.processedData.portfolioTotal > 0
);

/**
 * Loading state for currency operations
 */
export const isCurrencyLoading: Readable<boolean> = derived(
  currencyContext,
  ($context) => $context.isLoading
);

/**
 * Currency error state
 */
export const currencyError: Readable<string | null> = derived(
  currencyContext,
  ($context) => $context.error
);

// =====================================================================
// Action Functions
// =====================================================================

/**
 * Updates the currency context with new portfolio data
 *
 * @param data - Raw portfolio data from backend
 */
export function updatePortfolioData(data: RawPortfolioData) {
  currencyContext.update((context) => {
    try {
      const processedData = currency.processPortfolio(data);
      return {
        ...context,
        rawData: data,
        processedData,
        error: null,
        isLoading: false,
      };
    } catch (error) {
      return {
        ...context,
        rawData: data,
        processedData: null,
        error:
          error instanceof Error
            ? error.message
            : "Unknown error processing portfolio data",
        isLoading: false,
      };
    }
  });
}

/**
 * Sets loading state for currency operations
 *
 * @param loading - Loading state
 */
export function setCurrencyLoading(loading: boolean) {
  currencyContext.update((context) => ({
    ...context,
    isLoading: loading,
  }));
}

/**
 * Sets currency error state
 *
 * @param error - Error message or null to clear
 */
export function setCurrencyError(error: string | null) {
  currencyContext.update((context) => ({
    ...context,
    error,
    isLoading: false,
  }));
}

/**
 * Clears all currency data
 */
export function clearCurrencyData() {
  currencyContext.update((context) => ({
    ...context,
    rawData: null,
    processedData: null,
    error: null,
    isLoading: false,
  }));
}

/**
 * Updates currency display preferences
 *
 * @param updates - Partial preferences to update
 */
export function updateCurrencyPreferences(
  updates: Partial<CurrencyPreferences>
) {
  currencyPreferences.update((current) => ({
    ...current,
    ...updates,
  }));

  // Also update the context preferences for consistency
  currencyContext.update((context) => ({
    ...context,
    preferences: {
      ...context.preferences,
      ...updates,
    },
  }));
}

/**
 * Resets currency preferences to defaults
 */
export function resetCurrencyPreferences() {
  const defaultPreferences: CurrencyPreferences = {
    showSymbol: true,
    useCompactNotation: false,
    decimalPlaces: 2,
    highlightNegatives: true,
  };

  currencyPreferences.set(defaultPreferences);
  currencyContext.update((context) => ({
    ...context,
    preferences: defaultPreferences,
  }));
}

// =====================================================================
// Utility Functions for Components
// =====================================================================

/**
 * Formats a single currency value using current preferences
 *
 * @param value - Value to format
 * @param overrides - Optional formatting overrides
 * @returns Formatted currency string
 */
export function formatValue(
  value: number | string | null | undefined,
  overrides: Partial<CurrencyFormatOptions> = {}
): string {
  let currentFormatOptions: CurrencyFormatOptions = {
    includeSymbol: true,
    decimalPlaces: 2,
    compact: false,
  };

  const unsubscribe = formatOptions.subscribe((options) => {
    currentFormatOptions = { ...options, ...overrides };
  });
  unsubscribe();

  return currency.format(currency.parse(value), currentFormatOptions);
}

/**
 * Creates a monetary value using current preferences
 *
 * @param value - Value to convert
 * @param overrides - Optional formatting overrides
 * @returns MonetaryValue object
 */
export function createValue(
  value: number | string | null | undefined,
  overrides: Partial<CurrencyFormatOptions> = {}
): MonetaryValue {
  let currentFormatOptions: CurrencyFormatOptions = {
    includeSymbol: true,
    decimalPlaces: 2,
    compact: false,
  };

  const unsubscribe = formatOptions.subscribe((options) => {
    currentFormatOptions = { ...options, ...overrides };
  });
  unsubscribe();

  return currency.create(currency.parse(value), currentFormatOptions);
}

/**
 * Validates currency input using current context
 *
 * @param value - Value to validate
 * @param fieldName - Field name for error messages
 * @param options - Validation options
 * @returns Validation result
 */
export function validateValue(
  value: string | number | null | undefined,
  fieldName: string = "valor",
  options: {
    allowNegative?: boolean;
    maxAmount?: number;
    required?: boolean;
  } = {}
) {
  return currency.validate(value, fieldName, options);
}

// =====================================================================
// Integration with Existing Tabelas Store
// =====================================================================

// Data structure interfaces for integration
interface TabelasDataItem {
  valor?: number | string;
  saldo?: number | string;
  total?: number | string;
  quantidade?: number | string;
  preco?: number | string;
  [key: string]: number | string | boolean | null | undefined;
}

interface TabelasData {
  agrupados?: Record<string, TabelasDataItem[]>;
  totais?: TabelasDataItem;
  data?: TabelasDataItem[];
  [key: string]: unknown;
}

/**
 * Integrates currency store with the existing tabelas store
 * This function should be called when tabelas data changes
 */
export function integrateTabelasData(tabelasData: TabelasData | null) {
  if (tabelasData?.agrupados) {
    // For now, we'll just clear and not integrate until we have proper type definitions
    // This allows the store to work without breaking the build
    clearCurrencyData();

    // TODO: Implement proper data transformation when type definitions are finalized
    // const portfolioData: RawPortfolioData = {
    //   agrupados: {}
    // };
    // updatePortfolioData(portfolioData);
  } else if (tabelasData === null) {
    clearCurrencyData();
  }
}

// =====================================================================
// Store Subscriptions for Auto-Integration
// =====================================================================

// Note: In a real implementation, you would import the dadosConsulta store
// from '$lib/stores/tabelas.js' and subscribe to it here to automatically
// update currency data when tabelas data changes.
//
// Example:
// import { dadosConsulta } from '$lib/stores/tabelas.js';
// dadosConsulta.subscribe(integrateTabelasData);

// =====================================================================
// Export Default Store Object
// =====================================================================

/**
 * Main currency store object with all functions and stores
 *
 * @example
 * import { currencyStore } from '$lib/utils/currency-store.js';
 * const formatted = currencyStore.format(1234567.89);
 */
export const currencyStore = {
  // Stores
  preferences: currencyPreferences,
  context: currencyContext,
  formatOptions,
  formattedTotals: formattedPortfolioTotals,
  portfolioTotal,
  bankTotals,
  hasData: hasPortfolioData,
  isLoading: isCurrencyLoading,
  error: currencyError,

  // Actions
  updateData: updatePortfolioData,
  setLoading: setCurrencyLoading,
  setError: setCurrencyError,
  clearData: clearCurrencyData,
  updatePreferences: updateCurrencyPreferences,
  resetPreferences: resetCurrencyPreferences,

  // Utilities
  format: formatValue,
  create: createValue,
  validate: validateValue,
  integrate: integrateTabelasData,

  // Direct currency access
  currency,
} as const;

export default currencyStore;

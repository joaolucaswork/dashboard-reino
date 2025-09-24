/**
 * Comprehensive Currency Module for Brazilian Real (R$)
 *
 * This module provides a unified interface for handling monetary values
 * in the Reino Capital Financial Dashboard, specifically optimized for
 * the "Posição Consolidada" feature and Brazilian financial conventions.
 *
 * Features:
 * - Brazilian Real (R$) formatting with proper thousand separators and decimal places
 * - Currency parsing from various input formats (strings, numbers)
 * - Mathematical operations with currency values
 * - Type-safe TypeScript interfaces
 * - Input validation and error handling
 * - Integration with existing SvelteKit patterns
 * - ES5 compatible (no Object.entries, Object.fromEntries, etc.)
 */

// =====================================================================
// ES5 Compatibility Helpers
// =====================================================================

/**
 * ES5-compatible Object.entries polyfill
 */
function objectEntries<T>(obj: Record<string, T>): Array<[string, T]> {
  const entries: Array<[string, T]> = [];
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      entries.push([key, obj[key]]);
    }
  }
  return entries;
}

/**
 * ES5-compatible Object.fromEntries polyfill
 */
function objectFromEntries<T>(entries: Array<[string, T]>): Record<string, T> {
  const obj: Record<string, T> = {};
  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i];
    obj[entry[0]] = entry[1];
  }
  return obj;
}

/**
 * ES5-compatible Number.MAX_SAFE_INTEGER
 */
const MAX_SAFE_INTEGER = 9007199254740991;

// =====================================================================
// Type Definitions
// =====================================================================

/**
 * Represents a monetary value in Brazilian Real
 */
export interface MonetaryValue {
  /** The raw numeric value */
  amount: number;
  /** The formatted currency string for display */
  formatted: string;
  /** Currency code (always 'BRL' for this module) */
  currency: "BRL";
}

/**
 * Configuration options for currency formatting
 */
export interface CurrencyFormatOptions {
  /** Include the R$ symbol (default: true) */
  includeSymbol?: boolean;
  /** Number of decimal places (default: 2) */
  decimalPlaces?: number;
  /** Use compact notation for large numbers (default: false) */
  compact?: boolean;
  /** Prefix for negative values (default: "-") */
  negativePrefix?: string;
}

/**
 * Options for currency parsing
 */
export interface CurrencyParseOptions {
  /** Strict mode: throw errors for invalid inputs (default: false) */
  strict?: boolean;
  /** Default value to return for invalid inputs when not in strict mode */
  defaultValue?: number;
}

/**
 * Result of currency calculation operations
 */
export interface CurrencyCalculationResult {
  /** The result as a MonetaryValue */
  value: MonetaryValue;
  /** Whether the operation was successful */
  success: boolean;
  /** Error message if operation failed */
  error?: string;
}

/**
 * Portfolio financial data structure for Posição Consolidada
 */
export interface PortfolioFinancialData {
  /** Bank totals */
  bankTotals: Record<string, number>;
  /** Category totals within banks */
  categoryTotals: Record<string, Record<string, number>>;
  /** Asset type totals within categories */
  assetTypeTotals: Record<string, Record<string, Record<string, number>>>;
  /** Overall portfolio total */
  portfolioTotal: number;
}

/**
 * Raw portfolio data structure from backend
 */
export interface RawPortfolioData {
  agrupados?: Record<string, RawBankData>;
  [key: string]: unknown;
}

/**
 * Raw bank data structure from backend
 */
export interface RawBankData {
  _total_banco?: number | string;
  [categoryName: string]: RawCategoryData | number | string | undefined;
}

/**
 * Raw category data structure from backend
 */
export interface RawCategoryData {
  _total_categoria?: number | string;
  [assetTypeName: string]: RawAssetTypeData | number | string | undefined;
}

/**
 * Raw asset type data structure from backend
 */
export interface RawAssetTypeData {
  _total_tipo?: number | string;
  linhas?: Array<Record<string, unknown>>;
  [key: string]: unknown;
}

// =====================================================================
// Constants
// =====================================================================

/** Brazilian Real currency configuration */
const BRL_CONFIG = {
  currency: "BRL",
  locale: "pt-BR",
  symbol: "R$",
  decimalSeparator: ",",
  thousandsSeparator: ".",
  decimalPlaces: 2,
} as const;

/** Regular expressions for parsing different currency input formats */
const CURRENCY_PATTERNS = {
  // Matches: R$ 1.234.567,89 or R$ 1234567,89 or 1.234.567,89
  standard: /^R?\$?\s?([+-]?(?:\d{1,3}(?:\.\d{3})*|\d+))(?:,(\d{1,2}))?$/,
  // Matches: 1,234,567.89 (US format)
  us: /^R?\$?\s?([+-]?(?:\d{1,3}(?:,\d{3})*|\d+))(?:\.(\d{1,2}))?$/,
  // Matches: plain numbers
  numeric: /^([+-]?\d*\.?\d+)$/,
} as const;

// =====================================================================
// Core Formatting Functions
// =====================================================================

/**
 * Formats a numeric value as Brazilian Real currency
 *
 * @param value - The numeric value to format
 * @param options - Formatting options
 * @returns Formatted currency string
 *
 * @example
 * formatCurrency(1234567.89) // "R$ 1.234.567,89"
 * formatCurrency(1234567.89, { includeSymbol: false }) // "1.234.567,89"
 * formatCurrency(1234567.89, { compact: true }) // "R$ 1,23 mi"
 */
export function formatCurrency(
  value: number,
  options: CurrencyFormatOptions = {}
): string {
  const {
    includeSymbol = true,
    decimalPlaces = BRL_CONFIG.decimalPlaces,
    compact = false,
    negativePrefix = "-",
  } = options;

  // Handle special cases
  if (value === null || value === undefined || isNaN(value)) {
    return includeSymbol ? "R$ 0,00" : "0,00";
  }

  if (!isFinite(value)) {
    return includeSymbol ? "R$ ∞" : "∞";
  }

  // Handle compact notation for large numbers
  if (compact && Math.abs(value) >= 1000000) {
    const compactValue = value / 1000000;
    const formatted = new Intl.NumberFormat(BRL_CONFIG.locale, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(compactValue);

    return includeSymbol
      ? `${BRL_CONFIG.symbol} ${formatted} mi`
      : `${formatted} mi`;
  }

  // Standard formatting using Intl.NumberFormat
  const formatter = new Intl.NumberFormat(BRL_CONFIG.locale, {
    style: includeSymbol ? "currency" : "decimal",
    currency: BRL_CONFIG.currency,
    minimumFractionDigits: decimalPlaces,
    maximumFractionDigits: decimalPlaces,
  });

  let formatted = formatter.format(value);

  // Apply custom negative prefix if needed
  if (value < 0 && negativePrefix !== "-") {
    formatted = formatted.replace("-", negativePrefix);
  }

  return formatted;
}

/**
 * Creates a MonetaryValue object from a numeric value
 *
 * @param amount - The numeric amount
 * @param options - Formatting options for display
 * @returns MonetaryValue object
 */
export function createMonetaryValue(
  amount: number,
  options: CurrencyFormatOptions = {}
): MonetaryValue {
  return {
    amount,
    formatted: formatCurrency(amount, options),
    currency: "BRL",
  };
}

// =====================================================================
// Parsing Functions
// =====================================================================

/**
 * Parses a currency string or number into a numeric value
 *
 * @param input - Currency string or number to parse
 * @param options - Parsing options
 * @returns Parsed numeric value
 *
 * @example
 * parseCurrency("R$ 1.234.567,89") // 1234567.89
 * parseCurrency("1.234.567,89") // 1234567.89
 * parseCurrency("1,234,567.89") // 1234567.89 (US format)
 * parseCurrency("invalid", { strict: false, defaultValue: 0 }) // 0
 */
export function parseCurrency(
  input: string | number | null | undefined,
  options: CurrencyParseOptions = {}
): number {
  const { strict = false, defaultValue = 0 } = options;

  // Handle null/undefined
  if (input === null || input === undefined) {
    if (strict) {
      throw new Error("Currency input cannot be null or undefined");
    }
    return defaultValue;
  }

  // Handle numeric input
  if (typeof input === "number") {
    if (isNaN(input) || !isFinite(input)) {
      if (strict) {
        throw new Error(`Invalid numeric currency value: ${input}`);
      }
      return defaultValue;
    }
    return input;
  }

  // Handle string input
  const cleanInput = String(input).trim();

  if (cleanInput === "") {
    if (strict) {
      throw new Error("Currency input cannot be empty");
    }
    return defaultValue;
  }

  // Try different parsing patterns
  for (const [formatName, pattern] of objectEntries(CURRENCY_PATTERNS)) {
    const match = cleanInput.match(pattern);
    if (match) {
      const integerPart = match[1].replace(/[.,]/g, "");
      const decimalPart = match[2] || "00";

      // Handle US format (comma as thousands separator)
      if (formatName === "us") {
        const usPart = match[1].replace(/,/g, "");
        const result = parseFloat(`${usPart}.${decimalPart}`);
        return isNaN(result) ? defaultValue : result;
      }

      // Handle Brazilian format
      const result = parseFloat(`${integerPart}.${decimalPart}`);
      return isNaN(result) ? defaultValue : result;
    }
  }

  // No pattern matched
  if (strict) {
    throw new Error(`Unable to parse currency value: "${input}"`);
  }

  return defaultValue;
}

/**
 * Safely parses currency input and returns a MonetaryValue
 *
 * @param input - Currency input to parse
 * @param options - Parsing and formatting options
 * @returns MonetaryValue object
 */
export function parseToMonetaryValue(
  input: string | number | null | undefined,
  options: CurrencyParseOptions & CurrencyFormatOptions = {}
): MonetaryValue {
  const amount = parseCurrency(input, options);
  return createMonetaryValue(amount, options);
}

// =====================================================================
// Mathematical Operations
// =====================================================================

/**
 * Safely adds multiple currency values
 *
 * @param values - Array of currency values to add
 * @returns Calculation result
 */
export function addCurrency(
  ...values: (number | string)[]
): CurrencyCalculationResult {
  try {
    let total: number = 0;
    for (const value of values) {
      const parsed = parseCurrency(value, { strict: true });
      total += parsed;
    }

    return {
      value: createMonetaryValue(total),
      success: true,
    };
  } catch (error) {
    return {
      value: createMonetaryValue(0),
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Safely subtracts one currency value from another
 *
 * @param minuend - Value to subtract from
 * @param subtrahend - Value to subtract
 * @returns Calculation result
 */
export function subtractCurrency(
  minuend: number | string,
  subtrahend: number | string
): CurrencyCalculationResult {
  try {
    const a = parseCurrency(minuend, { strict: true });
    const b = parseCurrency(subtrahend, { strict: true });
    const result = a - b;

    return {
      value: createMonetaryValue(result),
      success: true,
    };
  } catch (error) {
    return {
      value: createMonetaryValue(0),
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Multiplies a currency value by a factor
 *
 * @param value - Currency value to multiply
 * @param factor - Multiplication factor
 * @returns Calculation result
 */
export function multiplyCurrency(
  value: number | string,
  factor: number
): CurrencyCalculationResult {
  try {
    const parsed = parseCurrency(value, { strict: true });

    if (isNaN(factor) || !isFinite(factor)) {
      throw new Error(`Invalid multiplication factor: ${factor}`);
    }

    const result = parsed * factor;

    return {
      value: createMonetaryValue(result),
      success: true,
    };
  } catch (error) {
    return {
      value: createMonetaryValue(0),
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Calculates percentage of a currency value
 *
 * @param value - Currency value
 * @param percentage - Percentage (e.g., 10 for 10%)
 * @returns Calculation result
 */
export function calculatePercentage(
  value: number | string,
  percentage: number
): CurrencyCalculationResult {
  return multiplyCurrency(value, percentage / 100);
}

// =====================================================================
// Portfolio-Specific Functions for Posição Consolidada
// =====================================================================

/**
 * Processes portfolio data structure from backend for display
 *
 * @param data - Raw portfolio data from backend
 * @returns Processed financial data with formatted values
 */
export function processPortfolioData(
  data: RawPortfolioData
): PortfolioFinancialData {
  const result: PortfolioFinancialData = {
    bankTotals: {},
    categoryTotals: {},
    assetTypeTotals: {},
    portfolioTotal: 0,
  };

  if (!data?.agrupados) {
    return result;
  }

  // Process each bank
  for (const [bankName, bankData] of objectEntries(data.agrupados)) {
    if (typeof bankData === "object" && bankData !== null) {
      const bankInfo = bankData as RawBankData;

      // Extract bank total
      if ("_total_banco" in bankInfo && bankInfo._total_banco !== undefined) {
        const total = parseCurrency(bankInfo._total_banco);
        result.bankTotals[bankName] = total;
        result.portfolioTotal += total;
      }

      // Process categories within this bank
      result.categoryTotals[bankName] = {};
      result.assetTypeTotals[bankName] = {};

      for (const [categoryName, categoryData] of objectEntries(bankInfo)) {
        if (
          categoryName === "_total_banco" ||
          typeof categoryData !== "object" ||
          categoryData === null
        ) {
          continue;
        }

        const categoryInfo = categoryData as RawCategoryData;

        // Extract category total
        if (
          "_total_categoria" in categoryInfo &&
          categoryInfo._total_categoria !== undefined
        ) {
          result.categoryTotals[bankName][categoryName] = parseCurrency(
            categoryInfo._total_categoria
          );
        }

        // Process asset types within this category
        result.assetTypeTotals[bankName][categoryName] = {};

        for (const [assetTypeName, assetTypeData] of objectEntries(
          categoryInfo
        )) {
          if (
            assetTypeName === "_total_categoria" ||
            typeof assetTypeData !== "object" ||
            assetTypeData === null
          ) {
            continue;
          }

          const assetTypeInfo = assetTypeData as RawAssetTypeData;

          if (
            "_total_tipo" in assetTypeInfo &&
            assetTypeInfo._total_tipo !== undefined
          ) {
            result.assetTypeTotals[bankName][categoryName][assetTypeName] =
              parseCurrency(assetTypeInfo._total_tipo);
          }
        }
      }
    }
  }

  return result;
}

/**
 * Formats portfolio totals for display in components
 *
 * @param portfolioData - Processed portfolio data
 * @param options - Formatting options
 * @returns Object with formatted values for UI display
 */
export function formatPortfolioTotals(
  portfolioData: PortfolioFinancialData,
  options: CurrencyFormatOptions = {}
) {
  return {
    portfolioTotal: formatCurrency(portfolioData.portfolioTotal, options),
    bankTotals: objectFromEntries(
      objectEntries(portfolioData.bankTotals).map(([bank, total]) => [
        bank,
        formatCurrency(total, options),
      ])
    ),
    categoryTotals: objectFromEntries(
      objectEntries(portfolioData.categoryTotals).map(([bank, categories]) => [
        bank,
        objectFromEntries(
          objectEntries(categories).map(([category, total]) => [
            category,
            formatCurrency(total, options),
          ])
        ),
      ])
    ),
    assetTypeTotals: objectFromEntries(
      objectEntries(portfolioData.assetTypeTotals).map(([bank, categories]) => [
        bank,
        objectFromEntries(
          objectEntries(categories).map(([category, assetTypes]) => [
            category,
            objectFromEntries(
              objectEntries(assetTypes).map(([assetType, total]) => [
                assetType,
                formatCurrency(total, options),
              ])
            ),
          ])
        ),
      ])
    ),
  };
}

// =====================================================================
// Validation Functions
// =====================================================================

/**
 * Validates if a value is a valid currency amount
 *
 * @param value - Value to validate
 * @param options - Validation options
 * @returns True if valid, false otherwise
 */
export function isValidCurrency(
  value: string | number | null | undefined,
  options: { allowNegative?: boolean; maxAmount?: number } = {}
): boolean {
  const { allowNegative = true, maxAmount = MAX_SAFE_INTEGER } = options;

  try {
    const parsed = parseCurrency(value, { strict: true });

    if (!allowNegative && parsed < 0) {
      return false;
    }

    if (Math.abs(parsed) > maxAmount) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

/**
 * Validates currency input and returns validation result
 *
 * @param value - Value to validate
 * @param fieldName - Name of the field being validated
 * @param options - Validation options
 * @returns Validation result with errors if any
 */
export function validateCurrencyInput(
  value: string | number | null | undefined,
  fieldName: string = "valor",
  options: {
    allowNegative?: boolean;
    maxAmount?: number;
    required?: boolean;
  } = {}
): { isValid: boolean; error?: string; parsed?: number } {
  const {
    allowNegative = true,
    maxAmount = MAX_SAFE_INTEGER,
    required = false,
  } = options;

  // Check if required
  if (required && (value === null || value === undefined || value === "")) {
    return {
      isValid: false,
      error: `${fieldName} é obrigatório`,
    };
  }

  // If not required and empty, return valid
  if (!required && (value === null || value === undefined || value === "")) {
    return {
      isValid: true,
      parsed: 0,
    };
  }

  try {
    const parsed = parseCurrency(value, { strict: true });

    if (!allowNegative && parsed < 0) {
      return {
        isValid: false,
        error: `${fieldName} não pode ser negativo`,
      };
    }

    if (Math.abs(parsed) > maxAmount) {
      return {
        isValid: false,
        error: `${fieldName} excede o valor máximo permitido`,
      };
    }

    return {
      isValid: true,
      parsed,
    };
  } catch {
    return {
      isValid: false,
      error: `${fieldName} deve ser um valor monetário válido`,
    };
  }
}

// =====================================================================
// Utility Functions
// =====================================================================

/**
 * Compares two currency values
 *
 * @param a - First value
 * @param b - Second value
 * @returns -1 if a < b, 0 if a === b, 1 if a > b
 */
export function compareCurrency(
  a: number | string,
  b: number | string
): number {
  const parsedA = parseCurrency(a);
  const parsedB = parseCurrency(b);

  if (parsedA < parsedB) return -1;
  if (parsedA > parsedB) return 1;
  return 0;
}

/**
 * Rounds currency value to specified decimal places
 *
 * @param value - Value to round
 * @param decimalPlaces - Number of decimal places (default: 2)
 * @returns Rounded value
 */
export function roundCurrency(
  value: number | string,
  decimalPlaces: number = 2
): number {
  const parsed = parseCurrency(value);
  const factor = Math.pow(10, decimalPlaces);
  return Math.round(parsed * factor) / factor;
}

/**
 * Checks if a currency value is zero (within a small tolerance)
 *
 * @param value - Value to check
 * @param tolerance - Tolerance for zero comparison (default: 0.01)
 * @returns True if value is effectively zero
 */
export function isCurrencyZero(
  value: number | string,
  tolerance: number = 0.01
): boolean {
  const parsed = parseCurrency(value);
  return Math.abs(parsed) < tolerance;
}

// =====================================================================
// Legacy Compatibility Functions
// =====================================================================

/**
 * Legacy compatibility function that matches the existing formatarMoeda function
 *
 * @deprecated Use formatCurrency instead
 */
export function formatarMoeda(valor: number, simbolo: boolean = true): string {
  return formatCurrency(valor, { includeSymbol: simbolo });
}

/**
 * Legacy compatibility function that matches the existing formatCurrencyValue function
 *
 * @deprecated Use formatCurrency instead
 */
export function formatCurrencyValue(value: number): string {
  return formatCurrency(value);
}

// =====================================================================
// Export Default Object for Named Imports
// =====================================================================

/**
 * Main currency module object with all functions
 *
 * @example
 * import { currency } from '$lib/utils/currency.js';
 * const formatted = currency.format(1234567.89);
 */
export const currency = {
  // Core functions
  format: formatCurrency,
  parse: parseCurrency,
  create: createMonetaryValue,
  parseToValue: parseToMonetaryValue,

  // Math operations
  add: addCurrency,
  subtract: subtractCurrency,
  multiply: multiplyCurrency,
  percentage: calculatePercentage,

  // Portfolio functions
  processPortfolio: processPortfolioData,
  formatPortfolio: formatPortfolioTotals,

  // Validation
  isValid: isValidCurrency,
  validate: validateCurrencyInput,

  // Utilities
  compare: compareCurrency,
  round: roundCurrency,
  isZero: isCurrencyZero,

  // Legacy
  formatarMoeda,
  formatCurrencyValue,
} as const;

export default currency;

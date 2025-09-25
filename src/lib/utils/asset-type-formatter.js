/**
 * Asset Type Formatter Utility
 * Normalizes the display of financial asset type abbreviations
 *
 * Rules:
 * 1. Keep lowercase for bank subcategories (e.g., "fundo de investimento", "renda")
 * 2. Convert to uppercase for main asset types (e.g., fundo → FUNDO, coe → COE)
 * 3. Add color indicators for asset categories
 */

/**
 * Main asset types that should be displayed in uppercase
 */
const MAIN_ASSET_TYPES = {
  fundo: "FUNDO",
  coe: "COE",
  cri: "CRI",
  debenture: "DEBENTURE",
  titulo: "TÍTULO",
  debênture: "DEBÊNTURE", // Alternative spelling
  título: "TÍTULO", // Already accented
};

/**
 * Bank subcategories that should remain in their original format
 * These are categories that appear directly under banks and should not be normalized
 */
const BANK_SUBCATEGORIES = [
  "fundo de investimento",
  "renda fixa",
  "renda variável",
  "conta corrente",
  "poupança",
  "investimento",
  "previdência",
  "capitalização",
  // Add more variations as needed
  "Fundo de Investimento",
  "Renda Fixa",
  "Renda Variável",
  "Previdência",
  "Investimento",
];

/**
 * Color mapping for different asset categories
 * Using HSL values compatible with dark theme
 */
export const ASSET_COLORS = {
  // Fundos - Blue tones
  FUNDO: {
    primary: "hsl(217, 91%, 60%)", // Blue
    secondary: "hsl(217, 91%, 85%)",
    background: "hsl(217, 91%, 15%)",
    border: "hsl(217, 91%, 30%)",
  },

  // COE - Green tones
  COE: {
    primary: "hsl(142, 76%, 36%)", // Green
    secondary: "hsl(142, 76%, 85%)",
    background: "hsl(142, 76%, 15%)",
    border: "hsl(142, 76%, 30%)",
  },

  // CRI - Orange tones
  CRI: {
    primary: "hsl(25, 95%, 53%)", // Orange
    secondary: "hsl(25, 95%, 85%)",
    background: "hsl(25, 95%, 15%)",
    border: "hsl(25, 95%, 30%)",
  },

  // Debenture - Purple tones
  DEBENTURE: {
    primary: "hsl(262, 83%, 58%)", // Purple
    secondary: "hsl(262, 83%, 85%)",
    background: "hsl(262, 83%, 15%)",
    border: "hsl(262, 83%, 30%)",
  },

  // Título - Amber tones
  TÍTULO: {
    primary: "hsl(43, 96%, 56%)", // Amber
    secondary: "hsl(43, 96%, 85%)",
    background: "hsl(43, 96%, 15%)",
    border: "hsl(43, 96%, 30%)",
  },

  // Default for unknown types - Gray tones
  DEFAULT: {
    primary: "hsl(var(--muted-foreground))",
    secondary: "hsl(var(--muted))",
    background: "hsl(var(--muted))",
    border: "hsl(var(--border))",
  },
};

/**
 * Normalizes asset type display according to the rules
 * @param {string} assetType - The asset type to normalize
 * @param {string} context - Context: 'main' for main types, 'category'/'subcategory' for bank categories, 'auto' for auto-detect
 * @returns {string} Normalized asset type
 */
export function normalizeAssetType(assetType, context = "auto") {
  if (!assetType || typeof assetType !== "string") {
    return assetType;
  }

  const cleanType = assetType.toLowerCase().trim();

  // Auto-detect context if not specified
  if (context === "auto") {
    // Check if it's a known bank category (should remain original)
    const isKnownCategory = BANK_SUBCATEGORIES.some(
      (cat) => cat.toLowerCase() === cleanType || cat === assetType
    );
    context = isKnownCategory ? "category" : "main";
  }

  // Keep original format for bank categories (Fundo de Investimento, Previdência, etc.)
  if (context === "category" || context === "subcategory") {
    return assetType; // Return original format, not lowercase
  }

  // Convert to uppercase for main asset types
  if (MAIN_ASSET_TYPES[cleanType]) {
    return MAIN_ASSET_TYPES[cleanType];
  }

  // For unknown main types, return as uppercase
  if (context === "main") {
    return assetType.toUpperCase();
  }

  return assetType;
}

/**
 * Gets color configuration for an asset type
 * @param {string} assetType - The asset type
 * @returns {object} Color configuration object
 */
export function getAssetTypeColors(assetType) {
  if (!assetType || typeof assetType !== "string") {
    return ASSET_COLORS.DEFAULT;
  }

  const normalizedType = normalizeAssetType(assetType, "main");
  return ASSET_COLORS[normalizedType] || ASSET_COLORS.DEFAULT;
}

/**
 * Creates CSS custom properties for an asset type
 * @param {string} assetType - The asset type
 * @returns {string} CSS custom properties string
 */
export function getAssetTypeCSSVars(assetType) {
  const colors = getAssetTypeColors(assetType);
  return `
    --asset-primary: ${colors.primary};
    --asset-secondary: ${colors.secondary};
    --asset-background: ${colors.background};
    --asset-border: ${colors.border};
  `;
}

/**
 * Determines if an asset type should have a color indicator
 * @param {string} assetType - The asset type
 * @returns {boolean} Whether to show color indicator
 */
export function shouldShowColorIndicator(assetType) {
  if (!assetType || typeof assetType !== "string") {
    return false;
  }

  const normalizedType = normalizeAssetType(assetType, "main");
  return (
    Object.keys(MAIN_ASSET_TYPES).includes(assetType.toLowerCase()) ||
    Object.keys(ASSET_COLORS).includes(normalizedType)
  );
}

/**
 * Formats asset type with optional color indicator
 * @param {string} assetType - The asset type
 * @param {object} options - Formatting options
 * @returns {object} Formatted asset type data
 */
export function formatAssetTypeWithIndicator(assetType, options = {}) {
  const {
    showColorIndicator = true,
    context = "auto",
    includeCSS = false,
  } = options;

  const normalizedType = normalizeAssetType(assetType, context);
  const colors = getAssetTypeColors(assetType);
  const showIndicator =
    showColorIndicator && shouldShowColorIndicator(assetType);

  return {
    original: assetType,
    normalized: normalizedType,
    colors,
    showIndicator,
    cssVars: includeCSS ? getAssetTypeCSSVars(assetType) : null,
  };
}

/**
 * Batch processes multiple asset types
 * @param {string[]} assetTypes - Array of asset types
 * @param {object} options - Formatting options
 * @returns {object[]} Array of formatted asset type data
 */
export function formatMultipleAssetTypes(assetTypes, options = {}) {
  if (!Array.isArray(assetTypes)) {
    return [];
  }

  return assetTypes.map((type) => formatAssetTypeWithIndicator(type, options));
}

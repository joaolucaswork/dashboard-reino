/**
 * Investment Category Colors Utility
 * Defines specific colors for investment categories with visual indicators
 *
 * Colors provided by user:
 * - Renda Fixa: #B19541
 * - Fundo de investimento: #FABE0D
 * - Renda Variável: #64542D
 * - COE: #E18600
 * - Previdência: #996600
 * - Outros: #565656
 */

/**
 * Investment category color mapping with hex colors
 */
export const INVESTMENT_CATEGORY_COLORS = {
  "Renda Fixa": {
    hex: "#B19541",
    primary: "#B19541", // Cor da bolinha
    dotColor: "#B19541", // Cor específica da bolinha
    text: "#FFFFFF", // Texto sempre branco
  },
  "Fundo de investimento": {
    hex: "#FABE0D",
    primary: "#FABE0D",
    dotColor: "#FABE0D",
    text: "#FFFFFF", // Texto sempre branco
  },
  "Fundos de Investimento": {
    // Alternative naming
    hex: "#FABE0D",
    primary: "#FABE0D",
    dotColor: "#FABE0D",
    text: "#FFFFFF", // Texto sempre branco
  },
  "Renda Variável": {
    hex: "#64542D",
    primary: "#64542D",
    dotColor: "#64542D",
    text: "#FFFFFF", // Texto sempre branco
  },
  COE: {
    hex: "#E18600",
    primary: "#E18600",
    dotColor: "#E18600",
    text: "#FFFFFF", // Texto sempre branco
  },
  Previdência: {
    hex: "#996600",
    primary: "#996600",
    dotColor: "#996600",
    text: "#FFFFFF", // Texto sempre branco
  },
  Outros: {
    hex: "#565656",
    primary: "#565656",
    dotColor: "#565656",
    text: "#FFFFFF", // Texto sempre branco
  },
  // Additional mappings for variations
  Caixa: {
    hex: "#565656",
    primary: "#565656",
    dotColor: "#565656",
    text: "#FFFFFF", // Texto sempre branco
  },
};

/**
 * Default colors for unknown categories
 */
export const DEFAULT_CATEGORY_COLORS = {
  hex: "#565656",
  primary: "#565656",
  dotColor: "#565656",
  text: "#FFFFFF", // Texto sempre branco
};

/**
 * Gets color configuration for an investment category
 * @param {string} category - The investment category name
 * @returns {object} Color configuration object
 */
export function getInvestmentCategoryColors(category) {
  if (!category || typeof category !== "string") {
    return DEFAULT_CATEGORY_COLORS;
  }

  // Normalize category name for lookup
  const normalizedCategory = category.trim();

  return (
    INVESTMENT_CATEGORY_COLORS[normalizedCategory] || DEFAULT_CATEGORY_COLORS
  );
}

/**
 * Creates CSS custom properties for an investment category
 * @param {string} category - The investment category name
 * @returns {string} CSS custom properties string
 */
export function getInvestmentCategoryCSSVars(category) {
  const colors = getInvestmentCategoryColors(category);
  return `
    --category-dot-color: ${colors.dotColor};
    --category-text: ${colors.text};
  `;
}

/**
 * Gets inline styles for an investment category
 * @param {string} category - The investment category name
 * @param {object} options - Style options
 * @returns {string} Inline CSS styles
 */
export function getInvestmentCategoryStyles(category, options = {}) {
  const { includeDotColor = true, includeText = true } = options;

  const colors = getInvestmentCategoryColors(category);
  let styles = [];

  if (includeDotColor) {
    styles.push(`--dot-color: ${colors.dotColor}`);
  }

  if (includeText) {
    styles.push(`color: ${colors.text}`); // Sempre branco
  }

  return styles.join("; ");
}

/**
 * Checks if a category should show a color indicator
 * @param {string} category - The investment category name
 * @returns {boolean} Whether to show color indicator
 */
export function shouldShowCategoryColorIndicator(category) {
  if (!category || typeof category !== "string") {
    return false;
  }

  // Show indicators for all known investment categories
  return Object.keys(INVESTMENT_CATEGORY_COLORS).includes(category.trim());
}

/**
 * Gets all available investment categories with their colors
 * @returns {Array} Array of category objects with colors
 */
export function getAllInvestmentCategories() {
  return Object.entries(INVESTMENT_CATEGORY_COLORS).map(([name, colors]) => ({
    name,
    colors,
  }));
}

/**
 * Formats category name with color indicator data
 * @param {string} category - The investment category name
 * @param {object} options - Formatting options
 * @returns {object} Formatted category data
 */
export function formatInvestmentCategoryWithIndicator(category, options = {}) {
  const { showColorIndicator = true, includeCSS = false } = options;

  const colors = getInvestmentCategoryColors(category);
  const showIndicator =
    showColorIndicator && shouldShowCategoryColorIndicator(category);

  return {
    original: category,
    normalized: category?.trim() || "",
    colors,
    showIndicator,
    cssVars: includeCSS ? getInvestmentCategoryCSSVars(category) : null,
  };
}

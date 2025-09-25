/**
 * Bank Logo Assets Index
 *
 * Centralized access to all bank SVG logos with proper typing and mapping.
 * All SVGs use currentColor for dynamic theming support.
 */

// Import all SVG logos
import itauLogo from "./banco-itau.svg?raw";
import bradescoLogo from "./banco-bradesco.svg?raw";
import btgLogo from "./btg-pactual.svg?raw";
import xpLogo from "./xp-investimentos.svg?raw";
import agoraLogo from "./agora-investimentos.svg?raw";
import caixaLogo from "./caixa-economica.svg?raw";
import bbLogo from "./banco-brasil.svg?raw";

// Bank logo mapping type
export interface BankLogoMap {
  [key: string]: string;
}

// Main bank logo mapping
export const bankLogos: BankLogoMap = {
  // Itaú variations
  Itau: itauLogo,
  Itaú: itauLogo,
  "Itaú Unibanco": itauLogo,
  ITAU: itauLogo,

  // Bradesco variations
  Bradesco: bradescoLogo,
  BRADESCO: bradescoLogo,

  // BTG variations
  BTG: btgLogo,
  "BTG Pactual": btgLogo,
  btg: btgLogo,

  // XP variations
  XP: xpLogo,
  "XP Investimentos": xpLogo,
  xp: xpLogo,

  // Ágora variations
  Agora: agoraLogo,
  Ágora: agoraLogo,
  AGORA: agoraLogo,
  "Ágora Investimentos": agoraLogo,

  // Caixa variations
  Caixa: caixaLogo,
  CAIXA: caixaLogo,
  "Caixa Econômica Federal": caixaLogo,
  CEF: caixaLogo,

  // Banco do Brasil variations
  BB: bbLogo,
  "Banco do Brasil": bbLogo,
  "BANCO DO BRASIL": bbLogo,
};

// Normalized bank names for consistent lookup
export const bankNameMapping: { [key: string]: string } = {
  Itau: "Itaú",
  ITAU: "Itaú",
  "Itaú Unibanco": "Itaú",

  BRADESCO: "Bradesco",

  btg: "BTG",
  "BTG Pactual": "BTG",

  xp: "XP",
  "XP Investimentos": "XP",

  Agora: "Ágora",
  AGORA: "Ágora",
  "Ágora Investimentos": "Ágora",

  CAIXA: "Caixa",
  "Caixa Econômica Federal": "Caixa",
  CEF: "Caixa",

  "Banco do Brasil": "BB",
  "BANCO DO BRASIL": "BB",
};

/**
 * Get bank logo SVG content by bank name
 * @param bankName - Name of the bank (case-insensitive)
 * @returns SVG content as string or null if not found
 */
export function getBankLogo(bankName: string): string | null {
  if (!bankName) return null;

  // Try exact match first
  if (bankLogos[bankName]) {
    return bankLogos[bankName];
  }

  // Try case-insensitive match
  const normalizedName = Object.keys(bankLogos).find(
    (key) => key.toLowerCase() === bankName.toLowerCase()
  );

  if (normalizedName) {
    return bankLogos[normalizedName];
  }

  return null;
}

/**
 * Get normalized bank name for consistent display
 * @param bankName - Original bank name
 * @returns Normalized bank name or original if not found
 */
export function getNormalizedBankName(bankName: string): string {
  return bankNameMapping[bankName] || bankName;
}

/**
 * Check if a bank logo exists
 * @param bankName - Name of the bank
 * @returns True if logo exists, false otherwise
 */
export function hasBankLogo(bankName: string): boolean {
  return getBankLogo(bankName) !== null;
}

/**
 * Get all available bank names
 * @returns Array of all bank names that have logos
 */
export function getAvailableBanks(): string[] {
  return Object.keys(bankLogos);
}

// Export individual logos for direct access if needed
export {
  itauLogo,
  bradescoLogo,
  btgLogo,
  xpLogo,
  agoraLogo,
  caixaLogo,
  bbLogo,
};

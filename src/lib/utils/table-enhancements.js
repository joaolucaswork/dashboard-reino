/**
 * Utility functions for enhanced data table features
 * Provides badge configuration, export functionality, and table utilities
 */

import { formatTableCellValue } from "./formatters.js";

/**
 * Badge configuration for different financial asset types
 */
export const financialBadgeConfigs = {
  consolidado: {
    column: "col5", // Saldo Bruto
    getBadge: (row) => {
      const assetName = (row.col2 || "").toLowerCase();
      const value = parseFloat(row.col5) || 0;

      // Asset type badges
      if (assetName.includes("cdb")) {
        return { text: "CDB", variant: "default" };
      } else if (assetName.includes("lci") || assetName.includes("lca")) {
        return { text: "LCI/LCA", variant: "secondary" };
      } else if (
        assetName.includes("debênture") ||
        assetName.includes("debenture")
      ) {
        return { text: "Debênture", variant: "outline" };
      } else if (assetName.includes("fundo")) {
        return { text: "Fundo", variant: "destructive" };
      } else if (assetName.includes("ação") || assetName.includes("acoes")) {
        return { text: "Ações", variant: "default" };
      } else if (assetName.includes("fii")) {
        return { text: "FII", variant: "secondary" };
      }

      // Value-based badges as fallback
      if (value > 1000000) {
        return { text: "Alto Valor", variant: "default" };
      } else if (value > 500000) {
        return { text: "Médio Alto", variant: "secondary" };
      } else if (value > 100000) {
        return { text: "Médio Valor", variant: "outline" };
      } else if (value > 0) {
        return { text: "Baixo Valor", variant: "outline" };
      }

      return null;
    },
  },

  relatorio: {
    column: "col5", // Valor Atual
    getBadge: (row) => {
      const institution = (row.col1 || "").toLowerCase();

      // Institution-based badges
      if (institution.includes("itaú") || institution.includes("itau")) {
        return { text: "Itaú", variant: "default" };
      } else if (institution.includes("btg")) {
        return { text: "BTG", variant: "secondary" };
      } else if (institution.includes("xp")) {
        return { text: "XP", variant: "outline" };
      } else if (institution.includes("nubank")) {
        return { text: "Nubank", variant: "destructive" };
      }

      return null;
    },
  },

  movimentacoes: {
    column: "col3", // Ativo
    getBadge: (row) => {
      const operation = (row.col6 || "").toLowerCase();

      // Operation-based badges
      if (operation.includes("compra")) {
        return { text: "Compra", variant: "default" };
      } else if (operation.includes("venda")) {
        return { text: "Venda", variant: "destructive" };
      } else if (operation.includes("resgate")) {
        return { text: "Resgate", variant: "secondary" };
      } else if (
        operation.includes("aplicação") ||
        operation.includes("aplicacao")
      ) {
        return { text: "Aplicação", variant: "outline" };
      }

      return null;
    },
  },
};

/**
 * Export data to CSV format
 */
export function exportToCSV(data, columns, filename = "dados-financeiros.csv") {
  if (!data || !columns || data.length === 0) {
    throw new Error("Dados ou colunas não fornecidos para exportação");
  }

  // Create CSV header
  const headers = columns.map((col) => col.header || col.accessorKey);

  // Create CSV rows
  const rows = data.map((row) =>
    columns.map((col) => {
      const value = formatTableCellValue(row[col.accessorKey], col.accessorKey);
      // Escape quotes and wrap in quotes if contains comma
      const escaped = String(value).replace(/"/g, '""');
      return escaped.includes(",") ? `"${escaped}"` : escaped;
    })
  );

  // Combine header and rows
  const csvContent = [
    headers.join(","),
    ...rows.map((row) => row.join(",")),
  ].join("\n");

  // Create and download file
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.style.display = "none";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Export data to Excel format (simplified CSV with .xlsx extension)
 */
export function exportToExcel(
  data,
  columns,
  filename = "dados-financeiros.xlsx"
) {
  // For now, we'll export as CSV with .xlsx extension
  // In a real implementation, you'd use a library like SheetJS
  exportToCSV(data, columns, filename);
}

/**
 * Calculate summary statistics for financial data
 */
export function calculateSummaryStats(data, valueColumn = "col5") {
  if (!data || data.length === 0) {
    return {
      total: 0,
      average: 0,
      min: 0,
      max: 0,
      count: 0,
    };
  }

  const values = data
    .map((row) => parseFloat(row[valueColumn]) || 0)
    .filter((val) => val > 0);

  if (values.length === 0) {
    return {
      total: 0,
      average: 0,
      min: 0,
      max: 0,
      count: 0,
    };
  }

  const total = values.reduce((sum, val) => sum + val, 0);
  const average = total / values.length;
  const min = Math.min(...values);
  const max = Math.max(...values);

  return {
    total,
    average,
    min,
    max,
    count: values.length,
  };
}

/**
 * Format currency value for display
 */
export function formatCurrencyValue(value) {
  if (typeof value !== "number" || isNaN(value)) {
    return "R$ 0,00";
  }

  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/**
 * Get search configuration for different table modes
 */
export function getSearchConfig(mode) {
  switch (mode) {
    case "relatorio":
      return {
        key: "col1",
        placeholder: "Filtrar por instituição financeira...",
      };
    case "consolidado":
      return {
        key: "col2",
        placeholder: "Filtrar por ativo...",
      };
    case "movimentacoes":
      return {
        key: "col3",
        placeholder: "Filtrar por ativo...",
      };
    default:
      return {
        key: "col2",
        placeholder: "Filtrar dados...",
      };
  }
}

/**
 * Generate table actions based on selected rows
 */
export function generateTableActions(selectedRows, mode) {
  const actions = [];

  if (selectedRows.length === 0) {
    return actions;
  }

  // Common actions
  actions.push({
    label: "Exportar Selecionados",
    icon: "Download",
    action: "export",
    variant: "outline",
  });

  // Mode-specific actions
  switch (mode) {
    case "consolidado":
      actions.push({
        label: "Calcular Total",
        icon: "Calculator",
        action: "calculate",
        variant: "secondary",
      });
      break;

    case "movimentacoes":
      actions.push({
        label: "Agrupar por Data",
        icon: "Calendar",
        action: "group-by-date",
        variant: "outline",
      });
      break;
  }

  return actions;
}

/**
 * Default column visibility settings for different modes
 */
export const defaultColumnVisibility = {
  consolidado: {
    col1: true, // Instituição Financeira
    col2: true, // Ativo
    col6: true, // Tipo de Ativo
    col3: true, // Descrição
    col4: true, // Quantidade
    col5: true, // Saldo Bruto
    col7: true, // Saldo Líquido
  },
  relatorio: {
    col1: true, // Instituição Financeira
    col2: true, // Ativo
    col6: true, // Tipo de Ativo
    col3: true, // Descrição
    col4: true, // Quantidade
    col5: true, // Saldo Bruto
    col7: true, // Saldo Líquido
  },
  movimentacoes: {
    col1: true, // Data
    col2: true, // Instituição
    col3: true, // Ativo
    col6: true, // Operação
    col7: true, // Preço
    col9: true, // Total
  },
};

/**
 * Validate table data structure
 */
export function validateTableData(data, mode) {
  if (!data) {
    return { valid: false, error: "Dados não fornecidos" };
  }

  if (!data.tables?.tab0?.lin0) {
    return { valid: false, error: "Estrutura de dados inválida" };
  }

  const headers = data.tables.tab0.lin0;
  const requiredColumns = Object.keys(defaultColumnVisibility[mode] || {});

  const missingColumns = requiredColumns.filter((col) => !(col in headers));

  if (missingColumns.length > 0) {
    return {
      valid: false,
      error: `Colunas obrigatórias ausentes: ${missingColumns.join(", ")}`,
    };
  }

  return { valid: true };
}

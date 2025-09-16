/**
 * Test file to validate table implementation matches HTML template
 * Run this file to verify column exclusions and formatting work correctly
 */

import {
  formatBrazilianNumber,
  formatTableCellValue,
} from "../../../utils/formatters.js";

// Mock data structure matching the HTML template format
const mockData = {
  tables: {
    tab0: {
      lin0: {
        col0: "",
        col1: "Instituição Financeira",
        col2: "Tipo de Ativo",
        col3: "Ativo",
        col4: "Quantidade",
        col5: "Valor Atual (R$)",
        col6: "% da Carteira",
        col7: "Operação",
        col8: "Preço (R$)",
        col9: "Valor Total (R$)",
        col12: "Campo Oculto",
        col14: "Outro Campo",
        col20: "Campo20",
      },
      lin1: {
        col0: "",
        col1: "BTG",
        col2: "Renda Fixa",
        col3: "CDB BTG",
        col4: 1000,
        col5: 105000.5,
        col6: 15.2,
        col7: "Compra",
        col8: 105.0,
        col9: 105000.0,
        col12: "Oculto",
        col14: "Outro",
        col20: "Valor20",
      },
      lin2: {
        col0: "",
        col1: "XP",
        col2: "Renda Variável",
        col3: "PETR4",
        col4: 500,
        col5: 15000.0,
        col6: 2.1,
        col7: "Venda",
        col8: 30.0,
        col9: 15000.0,
        col12: null,
        col14: "",
        col20: undefined,
      },
    },
  },
};

// Column exclusion functions (copied from TabelaFinanceira.svelte)
function getExcludedColumns(mode) {
  switch (mode) {
    case "relatorio":
      return ["col0"];
    case "consolidado":
      return ["col0", "col1", "col6"];
    case "movimentacoes":
      return [
        "col0",
        "col4",
        "col5",
        "col12",
        "col14",
        "col20",
        "col21",
        "col22",
        "col23",
        "col24",
        "col25",
        "col26",
        "col27",
        "col28",
        "col29",
        "col30",
        "col31",
        "col32",
        "col33",
        "col34",
        "col35",
      ];
    default:
      return ["col0"];
  }
}

function generateColumns(data, mode) {
  if (!data?.tables?.tab0?.lin0) return [];

  const headers = data.tables.tab0.lin0;
  const excludedColumns = getExcludedColumns(mode);

  return Object.entries(headers)
    .filter(([key, value]) => value !== "" && !excludedColumns.includes(key))
    .map(([key, value]) => ({
      accessorKey: key,
      header: value,
    }));
}

function transformDataForTable(data, mode) {
  if (!data?.tables?.tab0) return [];

  const { tab0 } = data.tables;
  const excludedColumns = getExcludedColumns(mode);
  const rows = [];

  Object.keys(tab0).forEach((key) => {
    if (key !== "lin0") {
      const row = tab0[key];
      const filteredRow = Object.fromEntries(
        Object.entries(row).filter(
          ([colKey]) => !excludedColumns.includes(colKey)
        )
      );
      rows.push(filteredRow);
    }
  });

  return rows;
}

// Test functions
function testColumnExclusions() {
  console.log("=== Testing Column Exclusions ===");

  const modes = ["relatorio", "consolidado", "movimentacoes"];

  modes.forEach((mode) => {
    console.log(`\n${mode.toUpperCase()} Mode:`);
    const columns = generateColumns(mockData, mode);
    const excludedColumns = getExcludedColumns(mode);

    console.log(`Excluded columns: [${excludedColumns.join(", ")}]`);
    console.log(
      `Visible columns: [${columns.map((c) => c.accessorKey).join(", ")}]`
    );
    console.log(`Column headers: [${columns.map((c) => c.header).join(", ")}]`);

    // Verify no excluded columns are present
    const hasExcludedColumns = columns.some((col) =>
      excludedColumns.includes(col.accessorKey)
    );
    console.log(`✓ No excluded columns present: ${!hasExcludedColumns}`);
  });
}

function testDataTransformation() {
  console.log("\n=== Testing Data Transformation ===");

  const modes = ["relatorio", "consolidado", "movimentacoes"];

  modes.forEach((mode) => {
    console.log(`\n${mode.toUpperCase()} Mode:`);
    const transformedData = transformDataForTable(mockData, mode);
    const excludedColumns = getExcludedColumns(mode);

    console.log(`Rows count: ${transformedData.length}`);

    if (transformedData.length > 0) {
      const firstRow = transformedData[0];
      const rowKeys = Object.keys(firstRow);
      console.log(`Row columns: [${rowKeys.join(", ")}]`);

      // Verify no excluded columns in data
      const hasExcludedColumns = rowKeys.some((key) =>
        excludedColumns.includes(key)
      );
      console.log(`✓ No excluded columns in data: ${!hasExcludedColumns}`);
    }
  });
}

function testNumberFormatting() {
  console.log("\n=== Testing Number Formatting ===");

  const testValues = [
    { input: 1234.56, expected: "1.234,56" },
    { input: 1000000.0, expected: "1.000.000,00" },
    { input: 0, expected: "0,00" },
    { input: null, expected: "--" },
    { input: undefined, expected: "--" },
    { input: "", expected: "--" },
    { input: "text", expected: "text" },
  ];

  testValues.forEach(({ input, expected }) => {
    const result = formatBrazilianNumber(input);
    const passed = result === expected;
    console.log(
      `Input: ${input} → Output: "${result}" (Expected: "${expected}") ${
        passed ? "✓" : "✗"
      }`
    );
  });
}

function testCellValueFormatting() {
  console.log("\n=== Testing Cell Value Formatting ===");

  const testCases = [
    { value: 1234.56, column: "col5", expected: "1.234,56" },
    { value: null, column: "col1", expected: "--" },
    { value: "BTG", column: "col1", expected: "BTG" },
    { value: "", column: "col2", expected: "--" },
    { value: 0, column: "col4", expected: "0,00" },
    { value: "diff_value", column: "col_diff_1", expected: "diff_value" },
  ];

  testCases.forEach(({ value, column, expected }) => {
    const result = formatTableCellValue(value, column);
    const passed = result === expected;
    console.log(
      `Value: ${value}, Column: ${column} → "${result}" (Expected: "${expected}") ${
        passed ? "✓" : "✗"
      }`
    );
  });
}

// Run all tests
function runAllTests() {
  console.log("🧪 Running Table Implementation Tests\n");

  testColumnExclusions();
  testDataTransformation();
  testNumberFormatting();
  testCellValueFormatting();

  console.log("\n✅ All tests completed!");
}

// Export for use in browser console or Node.js
if (typeof window !== "undefined") {
  // Browser environment
  window.runTableTests = runAllTests;
  console.log(
    "Table tests loaded! Run 'runTableTests()' in console to execute."
  );
} else {
  // Node.js environment
  runAllTests();
}

export {
  runAllTests,
  testColumnExclusions,
  testDataTransformation,
  testNumberFormatting,
  testCellValueFormatting,
};

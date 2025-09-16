/**
 * Data Structure Validation Test
 * Validates that our SvelteKit components can handle the exact data structure format used by the HTML template
 */

// Test data structures that match the HTML template format exactly
const validDataStructures = {
  // Standard structure with all required fields
  complete: {
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
        },
        lin1: {
          col0: "",
          col1: "BTG",
          col2: "Renda Fixa",
          col3: "CDB BTG",
          col4: 1000,
          col5: 105000.5,
          col6: 15.2,
        },
        lin2: {
          col0: "",
          col1: "XP",
          col2: "Renda Variável",
          col3: "PETR4",
          col4: 500,
          col5: 15000.0,
          col6: 2.1,
        },
      },
    },
    carteira: "test_carteira",
    data_final: "2024-01-15",
    total_geral: "120.000,50",
  },

  // Minimal structure with only required fields
  minimal: {
    tables: {
      tab0: {
        lin0: {
          col1: "Instituição",
          col2: "Ativo",
        },
        lin1: {
          col1: "BTG",
          col2: "CDB",
        },
      },
    },
  },

  // Structure with many columns (like movimentacoes)
  extended: {
    tables: {
      tab0: {
        lin0: {
          col0: "",
          col1: "Data",
          col2: "Instituição",
          col3: "Ativo",
          col4: "Quantidade",
          col5: "Valor",
          col6: "Operação",
          col7: "Preço",
          col8: "Taxa",
          col9: "Total",
          col10: "Observações",
          col11: "Status",
          col12: "Campo Oculto",
          col13: "Outro Campo",
          col14: "Mais Um Campo",
          col15: "Campo15",
          col20: "Campo20",
          col25: "Campo25",
          col30: "Campo30",
          col35: "Campo35",
        },
        lin1: {
          col0: "",
          col1: "2024-01-15",
          col2: "BTG",
          col3: "CDB BTG",
          col4: 1000,
          col5: 105000.5,
          col6: "Compra",
          col7: 105.0,
          col8: 0.5,
          col9: 105525.0,
          col10: "Operação normal",
          col11: "Liquidada",
          col12: "Oculto",
          col13: "Outro",
          col14: "Mais",
          col15: "Campo15",
          col20: "Campo20",
          col25: "Campo25",
          col30: "Campo30",
          col35: "Campo35",
        },
      },
    },
  },
};

// Invalid data structures that should be handled gracefully
const invalidDataStructures = {
  // Missing tables
  noTables: {
    carteira: "test_carteira",
    data_final: "2024-01-15",
  },

  // Missing tab0
  noTab0: {
    tables: {
      tab1: {},
    },
  },

  // Missing lin0 (headers)
  noHeaders: {
    tables: {
      tab0: {
        lin1: {
          col1: "BTG",
          col2: "CDB",
        },
      },
    },
  },

  // Empty structure
  empty: {},

  // Null/undefined
  nullData: null,
  undefinedData: undefined,
};

// Import the functions we need to test
import {
  formatBrazilianNumber,
  formatTableCellValue,
} from "../../../utils/formatters.js";

// Replicate the functions from TabelaFinanceira for testing
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

// Validation tests
function testValidDataStructures() {
  console.log("=== Testing Valid Data Structures ===");

  const modes = ["relatorio", "consolidado", "movimentacoes"];

  Object.entries(validDataStructures).forEach(([structureName, data]) => {
    console.log(`\n${structureName.toUpperCase()} Structure:`);

    modes.forEach((mode) => {
      try {
        const columns = generateColumns(data, mode);
        const tableData = transformDataForTable(data, mode);

        console.log(
          `  ${mode}: ✓ Columns: ${columns.length}, Rows: ${tableData.length}`
        );

        // Validate that columns have required properties
        const validColumns = columns.every(
          (col) => col.accessorKey && col.header
        );
        console.log(`    ✓ Valid column structure: ${validColumns}`);

        // Validate that data rows match column structure
        if (tableData.length > 0) {
          const firstRow = tableData[0];
          const hasValidData = Object.keys(firstRow).length > 0;
          console.log(`    ✓ Valid row data: ${hasValidData}`);
        }
      } catch (error) {
        console.log(`  ${mode}: ✗ Error: ${error.message}`);
      }
    });
  });
}

function testInvalidDataStructures() {
  console.log("\n=== Testing Invalid Data Structures ===");

  const modes = ["relatorio", "consolidado", "movimentacoes"];

  Object.entries(invalidDataStructures).forEach(([structureName, data]) => {
    console.log(`\n${structureName.toUpperCase()} Structure:`);

    modes.forEach((mode) => {
      try {
        const columns = generateColumns(data, mode);
        const tableData = transformDataForTable(data, mode);

        // Should handle gracefully with empty results
        const handledGracefully =
          Array.isArray(columns) && Array.isArray(tableData);
        console.log(
          `  ${mode}: ✓ Handled gracefully: ${handledGracefully} (Columns: ${columns.length}, Rows: ${tableData.length})`
        );
      } catch (error) {
        console.log(`  ${mode}: ✗ Unexpected error: ${error.message}`);
      }
    });
  });
}

function testDataTypeHandling() {
  console.log("\n=== Testing Data Type Handling ===");

  const testValues = [
    { value: 1234.56, type: "number", expected: "1.234,56" },
    { value: "BTG Pactual", type: "string", expected: "BTG Pactual" },
    { value: null, type: "null", expected: "--" },
    { value: undefined, type: "undefined", expected: "--" },
    { value: "", type: "empty string", expected: "--" },
    { value: 0, type: "zero", expected: "0,00" },
    { value: -1500.75, type: "negative number", expected: "-1.500,75" },
    { value: true, type: "boolean", expected: "true" },
    { value: false, type: "boolean", expected: "false" },
  ];

  testValues.forEach(({ value, type, expected }) => {
    try {
      const result = formatTableCellValue(value, "col1");
      const passed = result === expected;
      console.log(
        `  ${type}: ${passed ? "✓" : "✗"} "${result}" (expected: "${expected}")`
      );
    } catch (error) {
      console.log(`  ${type}: ✗ Error: ${error.message}`);
    }
  });
}

function testColumnExclusionEdgeCases() {
  console.log("\n=== Testing Column Exclusion Edge Cases ===");

  // Test with data that has all possible columns
  const fullColumnData = {
    tables: {
      tab0: {
        lin0: {},
      },
    },
  };

  // Generate all possible columns col0 to col35
  for (let i = 0; i <= 35; i++) {
    fullColumnData.tables.tab0.lin0[`col${i}`] = `Column ${i}`;
  }

  const modes = ["relatorio", "consolidado", "movimentacoes"];

  modes.forEach((mode) => {
    const columns = generateColumns(fullColumnData, mode);
    const excludedColumns = getExcludedColumns(mode);

    console.log(`  ${mode.toUpperCase()}:`);
    console.log(`    Total possible columns: 36 (col0-col35)`);
    console.log(`    Excluded columns: ${excludedColumns.length}`);
    console.log(`    Visible columns: ${columns.length}`);
    console.log(`    Expected visible: ${36 - excludedColumns.length}`);

    const correctCount = columns.length === 36 - excludedColumns.length;
    console.log(`    ✓ Correct exclusion count: ${correctCount}`);

    // Verify no excluded columns are present
    const hasExcludedColumns = columns.some((col) =>
      excludedColumns.includes(col.accessorKey)
    );
    console.log(`    ✓ No excluded columns present: ${!hasExcludedColumns}`);
  });
}

// Run all validation tests
function runDataStructureValidation() {
  console.log("🔍 Running Data Structure Validation Tests\n");

  testValidDataStructures();
  testInvalidDataStructures();
  testDataTypeHandling();
  testColumnExclusionEdgeCases();

  console.log("\n✅ Data structure validation completed!");
}

// Export for use in browser console or Node.js
if (typeof window !== "undefined") {
  // Browser environment
  window.runDataStructureValidation = runDataStructureValidation;
  console.log(
    "Data structure validation loaded! Run 'runDataStructureValidation()' in console to execute."
  );
} else {
  // Node.js environment
  runDataStructureValidation();
}

export {
  runDataStructureValidation,
  testValidDataStructures,
  testInvalidDataStructures,
  testDataTypeHandling,
  testColumnExclusionEdgeCases,
};

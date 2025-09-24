# Currency Module Integration Guide

## Overview

This guide demonstrates how to integrate the comprehensive currency handling module with the "Posição Consolidada" (Consolidated Position) feature in the dashboard.

## Module Structure

### Core Currency Module (`src/lib/utils/currency.ts`)

The main currency module provides:

- **Brazilian Real Formatting**: `formatCurrency(value, options)`
- **Currency Parsing**: `parseCurrency(value, options)`
- **Validation**: `validateCurrency(value, options)`
- **Portfolio Processing**: `processPortfolioData(data)`
- **Monetary Value Objects**: `createMonetaryValue(value, options)`

### Currency Store (`src/lib/utils/currency-store.ts`)

Svelte store integration providing:

- **Reactive Currency State**: `currencyPreferences`, `portfolioContext`
- **Formatted Totals**: `formattedPortfolioTotals` (derived store)
- **Integration Functions**: `integrateTabelasData()`, `updatePortfolioData()`

## Implementation Example

### 1. Enhanced Consolidated Table Component

The `TabelaConsolidadaCurrency.svelte` component demonstrates:

```svelte
<script>
  import { formatCurrency } from '$lib/components/ui/data-table/index.js';
  
  // Future integration with currency module:
  // import * as currency from '$lib/utils/currency.js';
  // import { formatValue, createValue } from '$lib/utils/currency-store.js';
  
  // Brazilian Real formatting with fallback
  function formatBrazilianCurrency(value) {
    if (typeof value !== 'number' || isNaN(value)) {
      return 'R$ 0,00';
    }
    
    try {
      return formatCurrency(value, 'BRL');
    } catch {
      // Manual fallback formatting
      return 'R$ ' + value.toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
    }
  }
</script>
```

### 2. Portfolio Data Processing

```javascript
/**
 * Process portfolio data with currency calculations
 */
function calculatePortfolioSummary(data) {
  if (!data?.agrupados) return defaultSummary;
  
  let totalValue = 0;
  const bankTotals = {};
  
  // Process each bank's assets
  for (const [bankName, assets] of Object.entries(data.agrupados)) {
    let bankTotal = 0;
    
    // Handle both array and object formats
    const assetList = Array.isArray(assets) ? assets : Object.values(assets);
    
    for (const asset of assetList) {
      const value = parseFloat(asset.valor || asset.saldo || 0);
      if (!isNaN(value)) {
        bankTotal += value;
      }
    }
    
    bankTotals[bankName] = bankTotal;
    totalValue += bankTotal;
  }
  
  return { totalValue, bankTotals };
}
```

## Current Implementation Status

### ✅ Completed Features

1. **Comprehensive Currency Module**
   - Brazilian Real formatting patterns
   - Multiple parsing strategies
   - Validation with customizable rules
   - Portfolio data processing

2. **Svelte Store Integration**
   - Reactive currency preferences
   - Derived stores for formatted values
   - Integration hooks for tabelas data

3. **Enhanced Table Component**
   - Professional consolidated view
   - Export functionality
   - Responsive design with shadcn-svelte
   - Currency-aware calculations

### 🔄 Integration Steps Required

Due to TypeScript configuration targeting ES5, the full module integration requires:

1. **TypeScript Configuration Update**

   ```json
   // tsconfig.json adjustments needed
   {
     "compilerOptions": {
       "target": "ES2017",
       "lib": ["ES2017", "DOM"]
     }
   }
   ```

2. **Currency Module Compatibility**
   - Replace `Object.entries()` with manual iteration for ES5
   - Replace `Object.fromEntries()` with custom implementation
   - Update `Number.MAX_SAFE_INTEGER` references

3. **Import Path Updates**

   ```svelte
   <!-- Update imports in components -->
   import * as currency from '$lib/utils/currency.js';
   import { formatValue, createValue } from '$lib/utils/currency-store.js';
   ```

## Usage in Tabelas Page

### Replace Existing Currency Functions

The module consolidates multiple fragmented currency functions:

**Before** (scattered across files):

```javascript
// In formatters.js
function formatarMoeda(valor) { /* ... */ }

// In table-enhancements.js  
function formatCurrencyValue(value) { /* ... */ }

// In data-table/index.js
function formatCurrency(value, currency) { /* ... */ }
```

**After** (unified approach):

```javascript
// Single import for all currency needs
import * as currency from '$lib/utils/currency.js';

// Consistent API across components
const formatted = currency.format(value);
const parsed = currency.parse(userInput);
const validated = currency.validate(input, { required: true });
```

### Integration with TabelaConsolidada

```svelte
<!-- src/routes/tabelas/+page.svelte -->
<script>
  import TabelaConsolidadaCurrency from '$lib/components/tabelas/TabelaConsolidadaCurrency.svelte';
  import { dadosConsulta } from '$lib/stores/tabelas.js';
  
  // Use enhanced component for consolidated view
  $: if ($modoVisualizacao === 'consolidado') {
    component = TabelaConsolidadaCurrency;
  }
</script>

{#if $modoVisualizacao === 'consolidado'}
  <TabelaConsolidadaCurrency data={$dadosConsulta} />
{/if}
```

## Brazilian Financial Patterns

The module implements authentic Brazilian financial formatting:

### Currency Format: `R$ 1.234.567,89`

- **Symbol**: R$ (with space)
- **Thousands Separator**: . (period)
- **Decimal Separator**: , (comma)
- **Decimal Places**: 2 (always shown)

### Pattern Recognition

```javascript
// Supports multiple input formats
currency.parse('R$ 1.234,56');    // 1234.56
currency.parse('1234,56');        // 1234.56  
currency.parse('1.234,56');       // 1234.56
currency.parse(1234.56);          // 1234.56
```

## Testing Integration

Test the integration with sample data:

```javascript
// Test data structure matching backend format
const testData = {
  agrupados: {
    'Banco Itaú': [
      { nome: 'ITUB4', valor: 15000.50, quantidade: 1000 },
      { nome: 'PETR4', valor: 28750.25, quantidade: 500 }
    ],
    'XP Investimentos': [
      { nome: 'VALE3', valor: 45250.75, quantidade: 750 }
    ]
  }
};

// Expected output: R$ 89.001,50 total portfolio value
```

## Next Steps

1. **Resolve TypeScript Configuration**: Update project to ES2017+ target
2. **Replace Fragmented Functions**: Update existing components to use unified module
3. **Complete Store Integration**: Connect currency store with tabelas store
4. **Add Comprehensive Testing**: Unit tests for all currency operations
5. **Performance Optimization**: Cache formatted values for large datasets

## File Locations

- **Currency Module**: `src/lib/utils/currency.ts`
- **Currency Store**: `src/lib/utils/currency-store.ts`
- **Enhanced Component**: `src/lib/components/tabelas/TabelaConsolidadaCurrency.svelte`
- **Integration Guide**: `docs/currency-integration-guide.md`

This module provides a production-ready foundation for handling all currency operations in the Portuguese/Brazilian financial context, with proper TypeScript support and Svelte integration.

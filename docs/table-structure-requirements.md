# Table Structure Requirements - HTML Template Analysis

## Overview

This document provides detailed analysis of the HTML template table structure to ensure our SvelteKit dashboard implementation matches exactly.

## Data Structure Format

### Header Structure

- **Headers**: `data.tables.tab0.lin0` - Contains column headers as key-value pairs
- **Data Rows**: `data.tables.tab0[key]` - Contains actual data rows (excluding 'lin0')
- **Column Keys**: `col0`, `col1`, `col2`, ..., `col35` (up to 36 columns total)

### Example Data Structure

```javascript
{
  tables: {
    tab0: {
      lin0: {
        col0: "",
        col1: "Instituição Financeira",
        col2: "Tipo de Ativo",
        col3: "Ativo",
        col4: "Quantidade",
        col5: "Valor Atual (R$)",
        col6: "% da Carteira"
      },
      lin1: {
        col0: "",
        col1: "BTG",
        col2: "Renda Fixa",
        col3: "CDB BTG",
        col4: 1000,
        col5: 105000.50,
        col6: 15.2
      }
    }
  }
}
```

## Column Exclusion Patterns by Mode

### Relatório Mode

- **Excludes**: `col0` only
- **Logic**: `col_key != 'col0' && col_val != ""`
- **Purpose**: Shows all relevant data columns for institutional reporting

### Consolidado Mode

- **Excludes**: `col0`, `col1`, `col6`
- **Logic**: `col_key not in ['col0', 'col1', 'col6'] && col_val != ""`
- **Purpose**: Focuses on asset details without institution grouping

### Movimentações Mode

- **Excludes**: `col4`, `col5`, `col12`, `col14`, `col20-col35`
- **Logic**: `col_key not in ['col4','col5','col12','col14','col20','col21','col22','col23','col24','col25','col26','col27','col28','col29','col30','col31','col32','col33','col34','col35']`
- **Purpose**: Shows only essential transaction columns

## Number Formatting Requirements

### Brazilian Number Format

```python
# HTML Template Pattern
{{ '{:,.2f}'.format(val).replace(',', '_').replace('.', ',').replace('_', '.') }}
```

### JavaScript Equivalent

```javascript
function formatBrazilianNumber(value) {
  if (typeof value !== 'number') return value || '--';

  return value.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}
```

### Examples

- Input: `1234.56` → Output: `"1.234,56"`
- Input: `1000000.00` → Output: `"1.000.000,00"`

## Empty Value Handling

### HTML Template Pattern

```html
{{ val | safe if 'col_diff' in col_key else (val or '--') }}
```

### Requirements

- Empty/null values display as `'--'`
- Zero values display as `'0,00'` (formatted)
- Special handling for `col_diff` columns (HTML safe)

## Column Header Generation

### Dynamic Headers

```javascript
// Generate columns from data structure
function generateColumns(data, mode) {
  if (!data?.tables?.tab0?.lin0) return [];

  const headers = data.tables.tab0.lin0;
  const excludedColumns = getExcludedColumns(mode);

  return Object.entries(headers)
    .filter(([key, value]) =>
      value !== "" &&
      !excludedColumns.includes(key)
    )
    .map(([key, value]) => ({
      accessorKey: key,
      header: value
    }));
}
```

## Data Row Processing

### Row Extraction

```javascript
function extractRows(data, mode) {
  if (!data?.tables?.tab0) return [];

  const { tab0 } = data.tables;
  const excludedColumns = getExcludedColumns(mode);
  const rows = [];

  Object.keys(tab0).forEach((key) => {
    if (key !== "lin0") {
      const row = tab0[key];
      const filteredRow = Object.fromEntries(
        Object.entries(row).filter(([colKey]) =>
          !excludedColumns.includes(colKey)
        )
      );
      rows.push(filteredRow);
    }
  });

  return rows;
}
```

## Implementation Checklist

- [ ] Dynamic column generation from `data.tables.tab0.lin0`
- [ ] Mode-specific column exclusion logic
- [ ] Brazilian number formatting for numeric values
- [ ] Empty value handling with '--' fallback
- [ ] Proper data row extraction and filtering
- [ ] HTML safe rendering for special columns
- [ ] Responsive table layout with overflow handling
- [ ] Consistent styling with shadcn/ui components

## Testing Requirements

### Test Cases by Mode

1. **Relatório**: Verify only `col0` is excluded
2. **Consolidado**: Verify `col0`, `col1`, `col6` are excluded
3. **Movimentações**: Verify extensive column exclusion list
4. **Number Formatting**: Test various numeric values
5. **Empty Values**: Test null, undefined, empty string handling
6. **Dynamic Headers**: Test with different data structures

### Edge Cases

- Empty data structure
- Missing `lin0` header
- All columns excluded
- Mixed data types in columns
- Very large numbers
- Negative numbers

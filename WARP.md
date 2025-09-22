# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

Dashboard Reino is a hybrid SvelteKit + Python application for financial portfolio management with bank integrations, data processing, and analytics dashboard functionality.

## Essential Development Commands

### Frontend Development
```bash
npm run dev                    # Start SvelteKit dev server (http://localhost:5173)
npm run build                  # Build for production
npm run preview                # Preview production build
npm run check:all              # Run all checks (TypeScript + ESLint + UI patterns)
npm run lint                   # ESLint check
npm run lint:fix              # Auto-fix ESLint issues
npm run lint:ui-patterns      # Check for nested interactive elements (CRITICAL)
```

### Type Checking & Code Quality
```bash
npm run check                  # SvelteKit sync + svelte-check with TypeScript
npm run check:watch            # Watch mode for type checking
```

### Financial Integration Tests
```bash
# Comdinheiro API Integration Tests
npm run test:comdinheiro:carteiras     # Test wallet listing
npm run test:comdinheiro:api          # Full API test suite
npm run test:comdinheiro:integracao   # End-to-end integration test
npm run test:comdinheiro:debug        # Debug credentials and connections

# Salesforce Integration
npm run test:sf:api                   # Test Salesforce API connectivity
```

## Architecture Overview

### Frontend Stack
- **Framework**: SvelteKit 2.x with TypeScript
- **UI Components**: shadcn-svelte with strict composition rules
- **Styling**: Tailwind CSS 4.x with custom design system
- **State Management**: Svelte stores (`$lib/stores/`)
- **Animations**: Custom actions in `$lib/actions/animate.ts`
- **Toast Notifications**: svelte-sonner with custom styling

### Backend Integration
- **Python Scripts**: Financial data processing in `scripts/` directory
- **API Routes**: SvelteKit API routes in `src/routes/api/` proxy to services
- **Bank Integrations**: jsforce for Salesforce, custom APIs for Brazilian banks
- **Data Tables**: @tanstack/table-core for complex table interactions

### Key Directories Structure
```
src/
├── lib/
│   ├── components/ui/          # shadcn-svelte components (DO NOT modify)
│   ├── stores/                 # Svelte stores for state management
│   ├── actions/                # Custom Svelte actions (animations)
│   └── utils/                  # Utility functions and formatters
├── routes/
│   ├── api/                    # SvelteKit API endpoints
│   ├── tabelas/               # Financial tables and analytics
│   ├── comdinheiro/           # Bank integration interface
│   └── analytics/             # Performance dashboard
scripts/
├── tests/                     # Integration test suite
└── *.py                       # Individual Python processing scripts
docs/                          # Comprehensive project documentation
```

## Critical Development Rules

### 🚨 Navigation - ALWAYS Use SPA Patterns
**NEVER use `window.location.href` for internal navigation** - this breaks SPA behavior and causes performance issues.

```svelte
// ✅ CORRECT: SPA navigation
import { goto } from '$app/navigation';
<button onclick={() => goto('/tabelas')}>Navigate</button>
<a href="/settings">Settings</a>

// ❌ WRONG: Causes full page reload
<button onclick={() => (window.location.href = '/tabelas')}>
```

**Reference**: `docs/navigation-guidelines.md` contains complete navigation rules with examples.

### 🚨 UI Components - Never Nest Interactive Elements
**Strict HTML semantics enforced** - custom ESLint rules prevent nested interactive elements:

```svelte
// ❌ WRONG: Button inside Button (breaks accessibility)
<Tooltip.Trigger>
  <Button>Click me</Button>
</Tooltip.Trigger>

// ✅ CORRECT: Use wrapper pattern
<Tooltip.Root>
  <Tooltip.Trigger class="btn-styles">Click me</Tooltip.Trigger>
  <Tooltip.Content>Tooltip text</Tooltip.Content>
</Tooltip.Root>
```

**Validation**: Run `npm run lint:ui-patterns` to check compliance.

## Component Architecture Patterns

### shadcn-svelte Component Composition
```svelte
<!-- Standard card composition pattern -->
<Card>
  <CardHeader>
    <CardTitle>Financial Overview</CardTitle>
  </CardHeader>
  <CardContent>
    <!-- Content here -->
  </CardContent>
</Card>
```

### State Management with Stores
```svelte
<script>
  // Import financial data stores
  import { modoVisualizacao, dadosConsulta } from "$lib/stores/tabelas.js";
  import { carteirasData } from "$lib/stores/carteirasComdinheiro.ts";
  
  // Reactive updates based on store changes
  {#if $modoVisualizacao === "consolidado"}
    <TabelaConsolidada data={$dadosConsulta} />
  {/if}
</script>
```

## Financial Data Integration

### Bank Data Flow Architecture
1. **Data Collection**: Python scripts (`busca_*.py`) scrape bank data using Selenium/APIs
2. **Data Processing**: Financial calculations and transformations in Python utilities
3. **API Integration**: SvelteKit API routes serve processed data to frontend
4. **Display Layer**: Specialized table components render financial data with formatting

### Key Financial Components
- **Tables System**: Multi-mode table views (consolidado, relatório, movimentações)
- **Currency Handling**: Brazilian Real (BRL) formatting with proper number display
- **Bank Integrations**: Support for Itaú, BTG, XP, Banco do Brasil
- **Portfolio Analytics**: Asset allocation and performance tracking

## Testing Strategy

### Integration Testing
- **Financial APIs**: Test bank connectivity and data retrieval
- **End-to-End Flows**: Complete user workflows from data fetch to display
- **Credential Validation**: Debug authentication and authorization

### Manual Testing Checklist
- Navigation maintains SPA behavior across all routes
- Toast notifications display correctly for user feedback
- Financial data formats properly with Brazilian currency standards
- Mobile responsiveness works across device sizes

## Performance Considerations

### SSR/Hydration Pattern
```svelte
<script>
  import { onMount } from 'svelte';
  
  // Client-side only operations
  onMount(() => {
    // Initialize animations or browser-specific features
    animate(element, { preset: 'slideInUp' });
  });
</script>
```

### Animation System
- Custom animation actions in `$lib/actions/animate.ts`
- Page transitions with `pageTransition` action
- Staggered animations for list items

## Documentation References

Critical documentation files to reference:
- `docs/navigation-guidelines.md` - Complete SPA navigation rules
- `docs/ui-components-best-practices.md` - Component composition patterns
- `docs/comdinheiro/` - Bank integration specifications
- `.github/instructions/copilot.instructions.md` - Development workflow rules

## Common Development Patterns

### File Naming Conventions
- **Routes**: `+page.svelte` for pages, `+server.ts` for API endpoints
- **Components**: PascalCase (e.g., `FormularioConsulta.svelte`)
- **Stores**: camelCase with descriptive names (`carteirasComdinheiro.ts`)
- **Types**: TypeScript definitions in `.d.ts` files or inline

### Error Handling Pattern
```svelte
<script>
  import { toast } from '$lib/utils/toast';
  
  async function handleApiCall() {
    try {
      const result = await apiCall();
      toast.success('Operação realizada com sucesso');
    } catch (error) {
      toast.error('Erro na operação: ' + error.message);
    }
  }
</script>
```

## Quality Assurance

- **TypeScript**: Strict configuration enforced
- **ESLint**: Custom rules for UI patterns and navigation
- **Accessibility**: Proper ARIA labels and semantic HTML
- **Performance**: Optimized builds with Vite and SvelteKit SSR
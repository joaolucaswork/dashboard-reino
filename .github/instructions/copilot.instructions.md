---
applyTo: "**"
---

# Copilot Instructions - Dashboard Reino

## Architecture Overview

This is a **hybrid SvelteKit + Flask application** for financial portfolio management:

- **Frontend**: SvelteKit with TypeScript, shadcn-svelte components, Tailwind CSS
- **Backend**: Python Flask app in `scripts/app_base/` with financial data processing
- **UI System**: shadcn-svelte with strict component composition rules
- **Navigation**: Enforced SPA patterns using SvelteKit's `goto()`

## Critical Development Rules

### 🚨 Navigation - ALWAYS Use SPA Patterns

**Never use `window.location.href` for internal navigation**. This breaks SPA behavior:

```svelte
// ✅ CORRECT: SPA navigation
import { goto } from '$app/navigation';
<button onclick={() => goto('/tabelas')}>Navigate</button>
<a href="/settings">Settings</a>

// ❌ WRONG: Causes full page reload
<button onclick={() => (window.location.href = '/tabelas')}>
```

**Reference**: `docs/navigation-guidelines.md` for complete rules and examples.

### 🚨 UI Components - Never Nest Interactive Elements

**Strict HTML semantics enforced** - the project has custom ESLint rules preventing nested interactive elements:

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

**Check**: Run `npm run lint:ui-patterns` to validate component usage.

## Key Directories & Patterns

### Frontend Structure (`src/`)

- `routes/` - SvelteKit pages with `+page.svelte` pattern
- `lib/components/ui/` - shadcn-svelte components (DO NOT modify core components)
- `lib/stores/` - Svelte stores for state management (e.g., `tabelas.js`)
- `lib/actions/` - Custom Svelte actions (animations, etc.)

### Python Backend (`scripts/app_base/`)

- `main.py` - Flask app with financial routes and OAuth integration
- `templates/` - Jinja2 templates (e.g., `visualizar_tabelas.html`)
- Individual scripts: `modifica_*.py`, `busca_*.py` for bank integrations
- `consulta_bd.py` - Database operations with PostgreSQL

### Component Composition Pattern

```svelte
<!-- Use this pattern for complex UI -->
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardContent>
    <!-- Content here -->
  </CardContent>
</Card>
```

## Development Workflow

### Essential Commands

```bash
# Frontend development
npm run dev                    # Start SvelteKit dev server
npm run check:all             # Run all checks (TypeScript + ESLint + UI patterns)
npm run lint:ui-patterns      # Check for nested interactive elements

# Backend (Python)
cd scripts/app_base
python main.py                # Start Flask server
```

### Python Dependencies

Flask app uses **Poetry** (`pyproject.toml`) with key dependencies:

- `flask` + `authlib` for web framework and OAuth
- `selenium` + `pandas` for bank data scraping
- `psycopg2-binary` + `sqlalchemy` for PostgreSQL
- `openai` for AI processing

## Integration Points

### SvelteKit ↔ Flask Communication

- SvelteKit API routes in `src/routes/api/` proxy to Flask backend
- Flask serves financial data via endpoints like `/visualizar_tabelas`
- Session management handled by Flask with OAuth integration

### Bank Data Flow

1. Python scripts (`busca_*.py`) scrape bank data using Selenium
2. Data stored in PostgreSQL via `consulta_bd.py`
3. Flask serves processed data to SvelteKit frontend
4. Frontend displays via specialized table components

### State Management Pattern

```svelte
// Use Svelte stores for cross-component state
import { modoVisualizacao, dadosConsulta } from "$lib/stores/tabelas.js";

// Reactive updates based on store changes
{#if $modoVisualizacao === "relatorio"}
  <TabelaRelatorio data={$dadosConsulta} />
{/if}
```

## File Naming & Organization

- **Routes**: `+page.svelte` for pages, `+server.ts` for API endpoints
- **Components**: PascalCase (e.g., `FormularioConsulta.svelte`)
- **Python**: snake_case following PEP 8
- **Types**: Define in `.d.ts` files or inline with TypeScript

## Performance & Quality

- **SSR/Hydration**: Use `onMount()` for client-side only operations
- **Animations**: Custom actions in `$lib/actions/animate.js`
- **Toast Notifications**: Use `svelte-sonner` for user feedback
- **Type Safety**: Strict TypeScript configuration enabled

## Documentation References

For specific guidance, always check:

- `docs/navigation-guidelines.md` - Complete navigation rules
- `docs/ui-components-best-practices.md` - UI component patterns
- `README.md` - Project overview and setup

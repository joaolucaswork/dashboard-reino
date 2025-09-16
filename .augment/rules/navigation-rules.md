---
type: "always_apply"
---

# Navigation System - AI Context

## PROJECT CONTEXT

This is a SvelteKit project that must maintain SPA (Single Page Application) navigation for optimized performance and experience.

## CRITICAL NAVIGATION RULES

### RULE #1: Internal Navigation

**ALWAYS** use for project's own routes:

- `<a href="/route">` for static links
- `goto('/route')` for programmatic navigation (with import: `import { goto } from '$app/navigation'`)

**NEVER** use for internal routes:

- `window.location.href = '/route'` (causes reload)
- `location.replace('/route')` (breaks history)
- `window.location.assign('/route')` (forces reload)

### RULE #2: External Navigation  

**Use** for external sites:

- `window.open('https://site.com', '_blank')` (new tab)
- `window.location.href = 'https://site.com'` (same tab)

### RULE #3: Mandatory Import

When using `goto()`, always include:

```javascript
import { goto } from '$app/navigation';
```

## IMPLEMENTATION PATTERNS

### Button with Navigation

```svelte
<script>
  import { goto } from '$app/navigation';
</script>
<button onclick={() => goto('/destination')}>Navigate</button>
```

### Simple Link

```svelte
<a href="/destination">Link</a>
```

### Conditional Navigation

```svelte
<script>
  import { goto } from '$app/navigation';
  
  function navigate(url, external = false) {
    if (external) {
      window.open(url, '_blank');
    } else {
      goto(url);
    }
  }
</script>
```

## CASE DETECTION

When user mentions:

- Navigation, redirect, go to page
- Sidebar, menu, buttons
- Links, hrefs, clicks
- Tables, reports, settings, analytics

**AUTOMATICALLY apply SPA navigation rules.**

## DEFAULT RESPONSE

When implementing navigation, always explain:
"Implementing with SvelteKit SPA navigation using `goto()` to maintain performance and avoid page reload."

## FINAL VERIFICATION

Before delivering code, verify:

- ✅ Internal routes use `goto()` or `<a href>`
- ✅ Import of `goto` present when needed  
- ✅ No `window.location.href` for internal routes
- ✅ External navigation uses `window.open()` appropriately

## CRITICAL COMPONENT

`DashboardLayout.svelte` - sidebar navigation must be especially careful to maintain consistency between collapsed/expanded states.

---
**REMINDER**: SPA navigation = better performance + UX = mandatory rule in the project.

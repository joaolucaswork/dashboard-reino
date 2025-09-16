# Chatbot Instructions - SvelteKit Navigation

## MANDATORY RULES - ALWAYS FOLLOW

### ✅ INTERNAL NAVIGATION (project routes)

**ALWAYS use one of these options:**

1. **Static links:**

```svelte
<a href="/tables">Tables</a>
<a href="/settings">Settings</a>
```

2. **Programmatic navigation:**

```svelte
<script>
  import { goto } from '$app/navigation';
</script>
<button onclick={() => goto('/tables')}>Go to Tables</button>
```

### ❌ INTERNAL NAVIGATION - NEVER DO

**NEVER use for internal routes:**

```svelte
<!-- INCORRECT - causes page reload -->
<button onclick={() => (window.location.href = '/tables')}>
<button onclick={() => window.location.assign('/settings')}>
<button onclick={() => location.replace('/home')}>
```

### ✅ EXTERNAL NAVIGATION (external sites)

**For external links, use:**

```svelte
<!-- To open in new tab -->
<button onclick={() => window.open('https://google.com', '_blank')}>

<!-- To redirect in same tab -->
<button onclick={() => (window.location.href = 'https://google.com')}>
```

## MANDATORY IMPORT

**Whenever using goto(), include:**

```svelte
<script>
  import { goto } from '$app/navigation';
</script>
```

## PRACTICAL EXAMPLES

### Sidebar Navigation

```svelte
<!-- Open state - use link -->
<a href="/tables?mode=report">Report</a>

<!-- Collapsed state - use goto -->
<button onclick={() => goto('/tables?mode=report')}>
  <Icon />
</button>
```

### Menu Items

```svelte
<script>
  import { goto } from '$app/navigation';
  
  const menuItems = [
    { href: '/tables', title: 'Tables' },
    { href: '/analytics', title: 'Analytics' }
  ];
</script>

{#each menuItems as item}
  <button onclick={() => goto(item.href)}>
    {item.title}
  </button>
{/each}
```

### Conditional Navigation

```svelte
<script>
  import { goto } from '$app/navigation';
  
  function handleClick(url, isExternal) {
    if (isExternal) {
      window.open(url, '_blank');
    } else {
      goto(url); // For internal routes
    }
  }
</script>
```

## QUICK CHECKLIST FOR CHATBOT

When generating navigation code, verify:

- [ ] For internal routes: use `<a href="...">` or `goto()`
- [ ] For external routes: use `window.open()` or `window.location.href`
- [ ] Import of `goto` present when needed
- [ ] NEVER use `window.location.href` for internal routes
- [ ] Consistency in pattern used

## CRITICAL COMPONENTS

**Special attention to these components:**

- `DashboardLayout.svelte` - sidebar navigation
- Any menu or navigation bar
- Buttons that redirect to other pages
- Cards with clickable links

## KEYWORDS FOR DETECTION

**If user mentions:**

- "navigate to", "go to", "redirect"
- "sidebar", "menu", "button that leads to"
- "link", "href", "onclick"

**ALWAYS apply these navigation rules.**

## DEFAULT RESPONSE FOR NAVIGATION

**When user requests navigation, always respond:**

"I'll implement using SvelteKit SPA navigation. For internal routes I use `goto()` or `<a href>`, never `window.location.href` which would cause page reload."

## COMMON ERROR TO AVOID

**NEVER generate code like:**

```svelte
<!-- ERROR - don't do this -->
<button onclick={() => (window.location.href = '/internal-page')}>
```

**ALWAYS correct to:**

```svelte
<!-- CORRECT -->
<script>
  import { goto } from '$app/navigation';
</script>
<button onclick={() => goto('/internal-page')}>
```

---

**SUMMARY**: Internal navigation = `goto()` or `<a href>` | External navigation = `window.location.href` or `window.open()`

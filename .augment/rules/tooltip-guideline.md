---
type: "always_apply"
---

# Documentation: Tooltip and Popover Error Fixes (SSR and Hydration)

## Problem Summary

During development, three types of errors related to UI components were encountered:

1. **SSR Error**: `node_invalid_placement_ssr` - nested buttons (`<button>` inside `<button>`)
2. **Svelte Error**: `invalid_default_snippet` - incorrect use of `asChild` with `let:` directives
3. **Hydration Error**: `hydration_mismatch` - mismatch between server-side and client-side rendering

## Problem Analysis

### Problem 1: Nested Buttons (SSR Warning)

**Cause**: The `Tooltip.Trigger` component from bits-ui renders as a `<button>` by default. When other interactive elements were placed inside it, it created invalid HTML.

**Original Error**:

```
node_invalid_placement_ssr: `<button>` cannot be a descendant of `<button>`
```

### Problem 2: Invalid Snippet

**Cause**: Use of the `asChild let:builder` pattern which is incompatible with the current version of bits-ui and Svelte 5.

**Original Error**:

```
invalid_default_snippet: Cannot use `{@render children(...)}` if the parent component uses `let:` directives
```

## Implemented Solutions

### Solution 1: Restructuring Tooltips with Interactive Elements

#### ❌ **BEFORE (Doesn't Work)**

```svelte
<!-- Tooltip wrapping a Label (creates nested button) -->
<Tooltip.Root>
  <Tooltip.Trigger>
    <Label for="radio-input" class="cursor-pointer">
      <Icon />
      <span>Label Text</span>
    </Label>
  </Tooltip.Trigger>
  <Tooltip.Content>Description</Tooltip.Content>
</Tooltip.Root>

<!-- Tooltip wrapping a link (creates button wrapping link) -->
<Tooltip.Root>
  <Tooltip.Trigger>
    <a href="/page" class="nav-link">
      <Icon />
    </a>
  </Tooltip.Trigger>
  <Tooltip.Content>Go to page</Tooltip.Content>
</Tooltip.Root>

<!-- Tooltip wrapping another button (double button) -->
<Tooltip.Root>
  <Tooltip.Trigger>
    <button onclick={handleClick}>
      <Icon />
    </button>
  </Tooltip.Trigger>
  <Tooltip.Content>Click here</Tooltip.Content>
</Tooltip.Root>
```

#### ✅ **AFTER (Works)**

**Option A: Separate Tooltip**

```svelte
<!-- Tooltip as separate element, not wrapping the main control -->
<div class="relative">
  <Label for="radio-input" class="cursor-pointer">
    <Icon />
    <span>Label Text</span>
    <!-- Tooltip in separate element -->
    <Tooltip.Root>
      <Tooltip.Trigger
        class="ml-2 p-1 rounded-full opacity-60 hover:opacity-100"
        aria-label="More information"
      >
        <div class="w-3 h-3 rounded-full border border-current">?</div>
      </Tooltip.Trigger>
      <Tooltip.Content>Detailed description</Tooltip.Content>
    </Tooltip.Root>
  </Label>
</div>
```

**Option B: Convert to Button with onclick**

```svelte
<!-- For links: use onclick instead of href -->
<Tooltip.Root>
  <Tooltip.Trigger
    class="nav-link"
    onclick={() => window.location.href = '/page'}
    aria-label="Go to page"
  >
    <Icon />
  </Tooltip.Trigger>
  <Tooltip.Content>Go to page</Tooltip.Content>
</Tooltip.Root>

<!-- For buttons: use Trigger directly -->
<Tooltip.Root>
  <Tooltip.Trigger
    class="button-styles"
    onclick={handleClick}
    aria-label="Click here"
  >
    <Icon />
  </Tooltip.Trigger>
  <Tooltip.Content>Click here</Tooltip.Content>
</Tooltip.Root>
```

### Solution 2: Removing asChild Pattern

#### ❌ **BEFORE (Doesn't Work)**

```svelte
<!-- asChild pattern with let:builder (incompatible) -->
<Tooltip.Root>
  <Tooltip.Trigger asChild let:builder>
    <a 
      href="/page"
      use:builder.action
      {...builder}
      class="nav-link"
    >
      <Icon />
    </a>
  </Tooltip.Trigger>
  <Tooltip.Content>Content</Tooltip.Content>
</Tooltip.Root>
```

#### ✅ **AFTER (Works)**

```svelte
<!-- Use Tooltip.Trigger directly -->
<Tooltip.Root>
  <Tooltip.Trigger
    class="nav-link"
    onclick={() => window.location.href = '/page'}
    aria-label="Navigate to page"
  >
    <Icon />
  </Tooltip.Trigger>
  <Tooltip.Content>Content</Tooltip.Content>
</Tooltip.Root>
```

## Practical Fix Examples

### Example 1: FormularioConsulta.svelte

**BEFORE**:

```svelte
<Tooltip.Root>
  <Tooltip.Trigger>
    <Label for={modo.value} class="...">
      <Icon />
      <span>{modo.label}</span>
    </Label>
  </Tooltip.Trigger>
  <Tooltip.Content>{modo.description}</Tooltip.Content>
</Tooltip.Root>
```

**AFTER**:

```svelte
<div class="relative">
  <Label for={modo.value} class="...">
    <Icon />
    <span>{modo.label}</span>
    <!-- Separate tooltip -->
    <Tooltip.Root>
      <Tooltip.Trigger
        class="ml-2 p-1 rounded-full opacity-60 hover:opacity-100"
        aria-label="More information about {modo.label}"
      >
        <div class="w-3 h-3 rounded-full border border-current">?</div>
      </Tooltip.Trigger>
      <Tooltip.Content>{modo.description}</Tooltip.Content>
    </Tooltip.Root>
  </Label>
</div>
```

### Example 2: DashboardLayout.svelte - Navigation Links

**BEFORE**:

```svelte
<Tooltip.Root>
  <Tooltip.Trigger class="inline-flex">
    <a href="/" class="nav-button">
      <House size={20} />
    </a>
  </Tooltip.Trigger>
  <Tooltip.Content>Home</Tooltip.Content>
</Tooltip.Root>
```

**AFTER**:

```svelte
<Tooltip.Root>
  <Tooltip.Trigger
    class="nav-button"
    onclick={() => window.location.href = '/'}
    aria-label="Home"
  >
    <House size={20} />
  </Tooltip.Trigger>
  <Tooltip.Content>Home</Tooltip.Content>
</Tooltip.Root>
```

### Example 3: DashboardLayout.svelte - asChild Pattern

**BEFORE**:

```svelte
<Tooltip.Root>
  <Tooltip.Trigger asChild let:builder>
    <a
      href={integration.href}
      use:builder.action
      {...builder}
      class="integration-link"
    >
      <div class="color-indicator {integration.color}"></div>
    </a>
  </Tooltip.Trigger>
  <Tooltip.Content>{integration.name}</Tooltip.Content>
</Tooltip.Root>
```

**AFTER**:

```svelte
<Tooltip.Root>
  <Tooltip.Trigger
    class="integration-link"
    onclick={() => window.location.href = integration.href}
    aria-label={integration.name}
  >
    <div class="color-indicator {integration.color}"></div>
  </Tooltip.Trigger>
  <Tooltip.Content>{integration.name}</Tooltip.Content>
</Tooltip.Root>
```

## General Rules for Tooltips

### ✅ **DO (Working Patterns)**

1. **Use Tooltip.Trigger directly as button**:

```svelte
<Tooltip.Root>
  <Tooltip.Trigger class="..." onclick={handler}>
    Button content
  </Tooltip.Trigger>
  <Tooltip.Content>Tooltip content</Tooltip.Content>
</Tooltip.Root>
```

2. **For navigation, use onclick with window.location**:

```svelte
<Tooltip.Trigger onclick={() => window.location.href = '/path'}>
```

3. **Separate informational tooltips from main controls**:

```svelte
<div class="form-control">
  <Label>Field</Label>
  <Input />
  <Tooltip.Root>
    <Tooltip.Trigger class="info-icon">?</Tooltip.Trigger>
    <Tooltip.Content>Additional information</Tooltip.Content>
  </Tooltip.Root>
</div>
```

### ❌ **DON'T (Breaking Patterns)**

1. **Don't nest interactive elements inside Tooltip.Trigger**:

```svelte
<!-- WRONG -->
<Tooltip.Trigger>
  <button>Button</button>
</Tooltip.Trigger>

<Tooltip.Trigger>
  <a href="/">Link</a>
</Tooltip.Trigger>

<Tooltip.Trigger>
  <Label for="input">Label</Label>
</Tooltip.Trigger>
```

2. **Don't use asChild pattern with let:builder**:

```svelte
<!-- WRONG -->
<Tooltip.Trigger asChild let:builder>
  <a use:builder.action {...builder}>Link</a>
</Tooltip.Trigger>
```

3. **Don't wrap forms or complex controls**:

```svelte
<!-- WRONG -->
<Tooltip.Trigger>
  <form>
    <input />
    <button>Submit</button>
  </form>
</Tooltip.Trigger>
```

## Benefits of the Fixes

1. **Valid HTML**: Eliminates nested buttons that cause SSR problems
2. **Compatibility**: Removes dependencies on obsolete bits-ui patterns
3. **Accessibility**: Maintains correct semantics with proper `aria-label`
4. **Performance**: Avoids hydration problems in SSR
5. **Maintainability**: Simpler and more direct code

## Modified Files

- `src/lib/components/tabelas/FormularioConsulta.svelte`
- `src/lib/components/DashboardLayout.svelte`

## Recommended Tests

1. Verify no SSR warnings in console
2. Test navigation with tooltips working
3. Check accessibility with screen readers
4. Confirm tooltips appear correctly on hover/focus
5. Test on different devices (desktop/mobile)

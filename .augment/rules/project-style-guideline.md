---
type: "always_apply"
---

# CSS and Styling Standards for SvelteKit + shadcn-svelte Financial Dashboard

## Overview

This document establishes comprehensive CSS and styling standards for the SvelteKit + shadcn-svelte financial dashboard project. These guidelines ensure consistency, maintainability, and adherence to modern web development best practices.

## 1. Tailwind CSS and shadcn/ui Standards

### 1.1 Tailwind CSS First Approach

- **Always prioritize Tailwind CSS utility classes** over custom CSS
- Use Tailwind's design system including:
  - Spacing: `p-4`, `m-8`, `gap-2` (following 8px grid system)
  - Typography: `text-sm`, `font-medium`, `leading-6`
  - Colors: `bg-background`, `text-foreground`, `border-border`
  - Layout: `flex`, `grid`, `w-full`, `h-screen`

### 1.2 Custom CSS Guidelines

- **Use `rem` units when custom CSS is required** (never `px`)
  - ✅ Correct: `width: 16rem;`, `margin: 2rem;`
  - ❌ Avoid: `width: 256px;`, `margin: 32px;`

### 1.3 shadcn/ui Component Patterns

- **Always use official shadcn/ui components** and their recommended patterns
- Use proper component imports: `import * as Sidebar from "$lib/components/ui/sidebar/index.js"`
- Follow component APIs: `<Sidebar.Root>`, `<Sidebar.Content>`, etc.
- Use CSS variables: `hsl(var(--background))`, `hsl(var(--foreground))`

### 1.4 Forbidden Practices

- ❌ Avoid: `!important` declarations, negative margins for layout fixes, hardcoded pixel values
- ❌ Avoid: Browser-specific hacks, magic numbers, or undocumented CSS tricks
- ❌ Avoid: Workarounds or non-standard implementations

### 1.5 When Custom CSS is Acceptable

Only write custom CSS for:

- Complex animations that can't be achieved with Tailwind
- Performance optimizations (e.g., `will-change`, `transform3d`)
- Integration with third-party libraries that require specific CSS

## 2. Typography Weight Standards

### 2.1 Paragraph and Description Standards

- **All paragraphs and descriptions MUST use font-weight 500 (medium)**
- Apply `font-medium` class or use predefined classes:
  - `text-body` → `text-base text-muted-foreground leading-relaxed font-medium`
  - `text-caption` → `text-sm text-muted-foreground font-medium`
  - `text-label` → `text-sm font-medium text-foreground`

### 2.2 Title and Heading Preservation

- **DO NOT modify the font-weight of titles and headings**
- Preserve original classes like:
  - `text-3xl font-bold text-white tracking-tight`
  - `text-xl font-semibold text-card-foreground`
  - `text-lg font-bold text-white`

### 2.3 Component-Level Standards

- CardDescription component includes `font-medium` by default
- All `<p>` tags have `font-medium` applied globally in base CSS

## 3. Component Implementation Standards

### 3.1 shadcn/ui Component Usage

- Use namespaced imports: `import * as ComponentName from "$lib/components/ui/component/index.js"`
- Follow official component APIs and patterns
- Use proper component composition with snippets when required
- Leverage component context APIs (e.g., `useSidebar` hook)

### 3.2 CSS Variables and Theming

- Always use CSS variables for colors: `hsl(var(--primary))`, `hsl(var(--background))`
- Avoid hardcoded color values like `#ffffff` or `rgb(255, 255, 255)`
- Use theme-aware classes: `bg-background`, `text-foreground`, `border-border`

### 3.3 Component Class Standards

- Use predefined component classes:
  - `card-premium` for enhanced card styling
  - `btn-premium`, `btn-primary`, `btn-secondary`, `btn-minimal` for buttons
  - `hover-lift`, `hover-glow` for premium animations
  - `glass-effect` for backdrop blur effects

## 4. Design System Consistency

### 4.1 Apple-Style Minimalism

- Maintain clean, uncluttered interfaces
- Use subtle animations with cubic-bezier easing
- Prefer white space and breathing room
- Implement premium, sophisticated interactions

### 4.2 Dark Mode Standards

- Dark mode is the default and only theme
- Use warm investment palette with premium colors
- Maintain proper contrast ratios for accessibility
- Use sidebar-specific color variables when applicable

### 4.3 Rule of 8 Spacing System

- All spacing must follow 8px grid system
- Use Tailwind's spacing scale: `4`, `8`, `12`, `16`, `20`, `24`, etc.
- Apply consistent spacing with: `p-4`, `m-8`, `gap-2`, `space-y-6`

### 4.4 Portuguese Financial Terminology

- Use consistent financial terminology throughout
- Apply terms like: "Portfolio", "Assets", "Transactions", "Reports", "Analytics"
- Maintain Portuguese language for all user-facing text
- Use financial context: "Integrações Bancárias", "Análises Financeiras"

## 5. Code Quality Standards

### 5.1 Import Management

- Remove unused imports from all components
- Use specific imports when possible
- Group imports logically (external, internal, types)

### 5.2 HTML Structure

- Use semantic HTML elements
- Maintain proper accessibility attributes
- Follow component hierarchy patterns

### 5.3 Tailwind Utilities

- Leverage Tailwind utilities over custom CSS
- Use responsive prefixes appropriately: `md:`, `lg:`, `xl:`
- Apply state variants: `hover:`, `focus:`, `active:`

### 5.4 Design Token Adherence

- Follow established color palette
- Use consistent border radius values
- Maintain typography hierarchy
- Apply proper shadow and elevation patterns

## 6. Implementation Checklist

Before submitting any styling changes, ensure:

- [ ] Tailwind CSS classes used first
- [ ] No hardcoded pixel values (use rem)
- [ ] shadcn/ui components properly implemented
- [ ] Paragraphs/descriptions use font-weight 500
- [ ] Title weights preserved
- [ ] CSS variables used for theming
- [ ] Rule of 8 spacing applied
- [ ] Unused imports removed
- [ ] Portuguese financial terminology maintained
- [ ] Apple-style minimalism preserved
- [ ] Dark mode compatibility ensured

## 7. Examples

### ✅ Correct Implementation

```svelte
<Card class="card-premium">
  <CardHeader class="p-6">
    <CardTitle class="text-xl font-bold text-white flex items-center gap-2">
      <Settings size={20} class="text-primary" />
      Configurações Bancárias
    </CardTitle>
    <CardDescription class="text-caption mt-2">
      Configure suas integrações financeiras
    </CardDescription>
  </CardHeader>
  <CardContent class="p-6 pt-0">
    <Button variant="outline" size="sm" class="btn-secondary">
      Configurar
    </Button>
  </CardContent>
</Card>
```

### ❌ Incorrect Implementation

```svelte
<div style="background: #1a1612; padding: 24px; border-radius: 12px;">
  <h3 style="color: white; font-weight: bold; font-size: 20px;">
    Configurações Bancárias
  </h3>
  <p style="color: rgba(255,255,255,0.6); font-size: 14px;">
    Configure suas integrações financeiras
  </p>
  <button style="padding: 8px 16px; background: transparent; border: 1px solid #3d342a;">
    Configurar
  </button>
</div>
```

---

**Note**: These standards must be applied to all future styling decisions and component implementations in this SvelteKit + shadcn-svelte financial dashboard project.

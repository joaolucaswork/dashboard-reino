<script>
  import { Badge } from "$lib/components/ui/badge";
  import {
    getInvestmentCategoryColors,
    shouldShowCategoryColorIndicator,
    formatInvestmentCategoryWithIndicator,
  } from "$lib/utils/investment-category-colors.js";

  /**
   * Investment Category Indicator Component
   * Displays investment categories with proper formatting and color indicators
   */

  // Props
  export let category = "";
  export let showColorIndicator = true;
  export let variant = "outline"; // Badge variant
  export let size = "sm"; // Badge size
  export let className = "";
  export let dotSize = "w-2 h-2"; // Size of the color indicator dot
  export let showBadge = true; // Whether to show the badge or just text

  // Reactive computations
  $: formattedCategory = formatInvestmentCategoryWithIndicator(category, {
    showColorIndicator,
    includeCSS: true,
  });

  $: colors = formattedCategory.colors;
  $: displayText = formattedCategory.normalized;
  $: showIndicator = formattedCategory.showIndicator;

  // Generate CSS variables for styling
  $: cssVars = showIndicator
    ? `
    --category-dot-color: ${colors.dotColor};
    --category-text: ${colors.text};
  `
    : "";
</script>

<!-- Investment Category Badge with Color Indicator -->
<div
  class="investment-category-indicator inline-flex items-center gap-1.5 {className}"
  style={cssVars}
>
  <!-- Color Indicator Dot -->
  {#if showIndicator}
    <div
      class="category-color-dot {dotSize} rounded-full flex-shrink-0"
      style="background-color: var(--category-dot-color);"
      aria-hidden="true"
      title="Categoria: {displayText}"
    ></div>
  {/if}

  <!-- Category Badge or Text -->
  {#if showBadge}
    <Badge {variant} {size} class="category-badge">
      {displayText}
    </Badge>
  {:else}
    <!-- Simple text display - always white -->
    <span class="category-text {className}">
      {displayText}
    </span>
  {/if}
</div>

<style>
  .investment-category-indicator {
    /* Ensure proper alignment */
    align-items: center;
  }

  .category-color-dot {
    /* Smooth transitions for color changes */
    transition: background-color 200ms ease-in-out;
    /* Ensure perfect circle */
    border-radius: 50%;
  }

  /* Enhanced styling for badges */
  :global(.category-badge) {
    transition: background-color 200ms ease-in-out;
    /* Text color is handled by the badge component itself */
  }

  /* Simple text styling - theme aware */
  .category-text {
    font-weight: inherit;
    font-size: inherit;
    color: hsl(var(--foreground)); /* Theme-aware text color */
  }

  /* Focus styles for accessibility */
  .investment-category-indicator:focus-within :global(.category-badge) {
    outline: 2px solid rgba(255, 255, 255, 0.5);
    outline-offset: 2px;
  }

  /* Responsive adjustments */
  @media (max-width: 768px) {
    .category-color-dot {
      /* Slightly larger on mobile for better visibility */
      min-width: 0.5rem;
      min-height: 0.5rem;
    }
  }

  /* Dark theme optimizations */
  @media (prefers-color-scheme: dark) {
    .category-color-dot {
      /* Ensure visibility in dark theme */
      box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.1);
    }
  }

  /* High contrast mode support */
  @media (prefers-contrast: high) {
    .category-color-dot {
      border: 1px solid currentColor;
    }

    :global(.category-badge.with-indicator) {
      border-width: 2px;
    }
  }
</style>

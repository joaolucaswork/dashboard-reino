<script>
  import { Badge } from "$lib/components/ui/badge";
  import {
    normalizeAssetType,
    getAssetTypeColors,
    shouldShowColorIndicator,
    formatAssetTypeWithIndicator,
  } from "$lib/utils/asset-type-formatter.js";

  /**
   * Asset Type Indicator Component
   * Displays asset types with proper formatting and color indicators
   */

  // Props
  export let assetType = "";
  export let context = "auto"; // 'main', 'subcategory', or 'auto'
  export let showColorIndicator = true;
  export let variant = "outline"; // Badge variant
  export let size = "sm"; // Badge size
  export let className = "";

  // Reactive computations
  $: formattedAsset = formatAssetTypeWithIndicator(assetType, {
    showColorIndicator,
    context,
    includeCSS: true,
  });

  $: colors = formattedAsset.colors;
  $: displayText = formattedAsset.normalized;
  $: showIndicator = formattedAsset.showIndicator;

  // Generate CSS variables for styling
  $: cssVars = showIndicator
    ? `
    --asset-primary: ${colors.primary};
    --asset-secondary: ${colors.secondary};
    --asset-background: ${colors.background};
    --asset-border: ${colors.border};
  `
    : "";
</script>

<!-- Asset Type Badge with Color Indicator -->
<div
  class="asset-type-indicator inline-flex items-center gap-1 {className}"
  style={cssVars}
>
  <!-- Color Indicator Dot -->
  {#if showIndicator}
    <div
      class="asset-color-dot w-2 h-2 rounded-full flex-shrink-0"
      style="background-color: var(--asset-primary);"
      aria-hidden="true"
    ></div>
  {/if}

  <!-- Asset Type Badge -->
  {#if showIndicator}
    <Badge
      {variant}
      {size}
      class="asset-type-badge with-indicator"
      style="border-color: var(--asset-border); color: var(--asset-primary);"
    >
      {displayText}
    </Badge>
  {:else}
    <!-- Simple text display for subcategories -->
    <span class="asset-type-text {className}">
      {displayText}
    </span>
  {/if}
</div>

<style>
  .asset-type-indicator {
    /* Ensure proper alignment */
    align-items: center;
  }

  .asset-color-dot {
    /* Smooth transitions for color changes */
    transition: background-color 200ms ease-in-out;
  }

  /* Enhanced styling for badges with indicators */
  :global(.asset-type-badge.with-indicator) {
    transition:
      border-color 200ms ease-in-out,
      color 200ms ease-in-out,
      background-color 200ms ease-in-out;
  }

  /* Hover effects for interactive badges */
  .asset-type-indicator:hover :global(.asset-type-badge.with-indicator) {
    background-color: var(--asset-background);
  }

  /* Simple text styling for subcategories */
  .asset-type-text {
    color: inherit;
    font-weight: inherit;
    font-size: inherit;
  }

  /* Focus styles for accessibility */
  .asset-type-indicator:focus-within :global(.asset-type-badge) {
    outline: 2px solid var(--asset-primary);
    outline-offset: 2px;
  }

  /* Responsive adjustments */
  @media (max-width: 768px) {
    .asset-color-dot {
      width: 1.5rem;
      height: 1.5rem;
    }
  }
</style>

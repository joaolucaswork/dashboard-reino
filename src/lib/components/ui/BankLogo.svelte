<script>
  import {
    getBankLogo,
    getNormalizedBankName,
  } from "$lib/assets/logos_bancos/index.ts";
  import { getBancoCores, isBancoConfigurado } from "$lib/data/bancos.js";
  import { bankDisplayMode } from "$lib/stores/bankDisplay";

  /**
   * Bank Logo Component with Dynamic State Management
   *
   * Features:
   * - Displays SVG bank logos with proper branding
   * - Supports active/inactive states with smooth transitions
   * - Uses currentColor for dynamic theming
   * - Fallback to text when logo is not available
   * - Accessibility compliant with proper ARIA labels
   */

  // Props
  export let bankName = "";
  export let isActive = true;
  export let size = "md"; // 'sm', 'md', 'lg', 'xl'
  export let showText = false;
  export let className = "";
  export let style = "";

  // Reactive computations
  $: normalizedName = getNormalizedBankName(bankName);
  $: logoSvg = getBankLogo(bankName);
  $: hasLogo = !!logoSvg;
  $: isConfigured = isBancoConfigurado(bankName);
  $: bankColors = getBancoCores(bankName);
  $: currentColor = isActive ? bankColors.ativa : bankColors.inativa;
  $: shouldShowLogo = $bankDisplayMode === "logo" && hasLogo;

  // Size configurations for container
  const sizeClasses = {
    sm: "w-6 h-6",
    md: "w-8 h-8",
    lg: "w-12 h-12",
    xl: "w-16 h-16",
  };

  // Size configurations for colored dots (smaller than container)
  const dotSizeClasses = {
    sm: "w-3 h-3",
    md: "w-4 h-4",
    lg: "w-6 h-6",
    xl: "w-8 h-8",
  };

  // Active dot sizes (slightly larger when active)
  const activeDotSizeClasses = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-7 h-7",
    xl: "w-10 h-10",
  };

  const textSizes = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
    xl: "text-lg",
  };

  // Generate dynamic styles
  $: dynamicStyle = `color: ${currentColor}; ${style}`;
  $: containerClasses = `
    inline-flex items-center justify-center
    transition-all duration-300 ease-in-out
    ${sizeClasses[size]}
    ${className}
  `.trim();
</script>

<!-- Bank Logo Container -->
<div
  class={containerClasses}
  style={dynamicStyle}
  role="img"
  aria-label="Logo do {normalizedName}"
  title={normalizedName}
>
  {#if shouldShowLogo}
    <!-- SVG Logo -->
    <div
      class="w-full h-full flex items-center justify-center"
      class:opacity-100={isActive}
      class:opacity-60={!isActive}
    >
      {@html logoSvg}
    </div>
  {:else}
    <!-- Colored Dot or Fallback -->
    {#if $bankDisplayMode === "colored-dot"}
      <!-- Animated Colored Dot -->
      <div
        class="
          rounded-full transition-all duration-300 ease-in-out transform
          {isActive ? activeDotSizeClasses[size] : dotSizeClasses[size]}
        "
        class:opacity-100={isActive}
        class:opacity-70={!isActive}
        class:scale-110={isActive}
        style="background-color: {currentColor}"
      ></div>
    {:else}
      <!-- Text Fallback -->
      <div
        class="
          w-full h-full rounded-full flex items-center justify-center font-bold
          border-2 border-current transition-all duration-300 ease-in-out
          {textSizes[size]}
        "
        class:opacity-100={isActive}
        class:opacity-60={!isActive}
      >
        <!-- Text fallback when logo mode is selected but no logo exists -->
        {normalizedName.substring(0, 2).toUpperCase()}
      </div>
    {/if}
  {/if}

  {#if showText}
    <!-- Optional text label -->
    <span
      class="ml-2 font-medium {textSizes[size]}"
      class:opacity-100={isActive}
      class:opacity-60={!isActive}
    >
      {normalizedName}
    </span>
  {/if}
</div>

<style>
  /* Ensure SVG inherits currentColor properly */
  :global(.bank-logo svg) {
    width: 100%;
    height: 100%;
    color: inherit;
  }

  /* Smooth transitions for all states */
  div {
    transition:
      opacity 0.3s ease-in-out,
      color 0.3s ease-in-out;
  }

  /* Hover effects for interactive elements */
  .interactive:hover {
    transform: scale(1.05);
    transition: transform 0.2s ease-in-out;
  }
</style>

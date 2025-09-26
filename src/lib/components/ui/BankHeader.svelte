<script>
  import BankLogo from "./BankLogo.svelte";
  import { getBancoInfo } from "$lib/data/bancos.js";
  import { formatarMoeda } from "$lib/utils/formatters.js";
  import { wrapNumbersWithFont } from "$lib/utils/number-font.js";
  import { Badge } from "$lib/components/ui/badge/index.js";

  /**
   * Bank Header Component for Consolidated Tables
   *
   * Displays bank information with logo, name, and optional summary data
   * Supports collapsible/expandable states with visual feedback
   */

  // Props
  export let bankName = "";
  export let isExpanded = false;
  export let totalValue = 0;
  export let assetCount = 0;
  export let showSummary = true;
  export let clickable = true;
  export let className = "";

  // Event dispatcher
  import { createEventDispatcher } from "svelte";
  const dispatch = createEventDispatcher();

  // Reactive computations
  $: bankInfo = getBancoInfo(bankName);
  $: formattedTotal = formatarMoeda(totalValue);

  // Handle click events
  function handleClick() {
    if (clickable) {
      dispatch("toggle", { bankName, isExpanded: !isExpanded });
    }
  }

  // Handle keyboard navigation
  function handleKeydown(event) {
    if (clickable && (event.key === "Enter" || event.key === " ")) {
      event.preventDefault();
      handleClick();
    }
  }
</script>

<!-- Bank Header Container -->
{#if clickable}
  <button
    class="
      bank-header flex items-center justify-between p-4 rounded-lg w-full text-left
      transition-all duration-300 ease-in-out
      cursor-pointer hover:bg-muted/50
      {isExpanded ? 'bg-muted/30' : 'bg-background'}
      {className}
    "
    class:shadow-sm={isExpanded}
    aria-expanded={isExpanded}
    aria-label="{bankName} - {isExpanded ? 'Expandido' : 'Recolhido'}"
    on:click={handleClick}
  >
    <!-- Left Section: Logo, Bank Name and Asset Count Badge -->
    <div class="flex items-center gap-3">
      <!-- Bank Logo -->
      <BankLogo
        {bankName}
        isActive={isExpanded}
        size="lg"
        className="flex-shrink-0"
      />

      <!-- Bank Name and Asset Count -->
      <div class="flex items-center gap-2">
        <!-- Bank Name -->
        <h3 class="text-lg font-bold text-foreground leading-tight">
          {bankName}
        </h3>

        <!-- Asset Count Badge (similar to category and type levels) -->
        {#if assetCount > 0}
          <Badge variant="outline" class="text-sm">
            {@html wrapNumbersWithFont(
              `${assetCount} ${assetCount === 1 ? "ativo" : "ativos"}`
            )}
          </Badge>
        {/if}
      </div>
    </div>

    <!-- Right Section: Total Value and Expand Indicator -->
    <div class="flex items-center gap-4">
      {#if showSummary}
        <!-- Total Value (consistent with category and type levels) -->
        <div class="text-right">
          <div class="text-lg font-medium text-foreground">
            {@html wrapNumbersWithFont(formattedTotal)}
          </div>
        </div>
      {/if}

      <!-- Expand/Collapse Indicator (consistent with other levels) -->
      <div class="text-muted-foreground">
        {#if isExpanded}
          <!-- Minus icon when expanded -->
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
        {:else}
          <!-- Plus icon when collapsed -->
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
        {/if}
      </div>
    </div>
  </button>
{:else}
  <div
    class="
      bank-header flex items-center justify-between p-4 rounded-lg
      transition-all duration-300 ease-in-out
      {isExpanded ? 'bg-muted/30' : 'bg-background'}
      {className}
    "
    class:shadow-sm={isExpanded}
    role="heading"
    aria-level="2"
    aria-label={bankName}
  >
    <!-- Left Section: Logo, Bank Name and Asset Count Badge -->
    <div class="flex items-center gap-3">
      <!-- Bank Logo -->
      <BankLogo
        {bankName}
        isActive={isExpanded}
        size="lg"
        className="flex-shrink-0"
      />

      <!-- Bank Name and Asset Count -->
      <div class="flex items-center gap-2">
        <!-- Bank Name -->
        <h3 class="text-lg font-bold text-foreground leading-tight">
          {bankName}
        </h3>

        <!-- Asset Count Badge (similar to category and type levels) -->
        {#if assetCount > 0}
          <Badge variant="outline" class="text-sm">
            {@html wrapNumbersWithFont(
              `${assetCount} ${assetCount === 1 ? "ativo" : "ativos"}`
            )}
          </Badge>
        {/if}
      </div>
    </div>

    <!-- Right Section: Total Value -->
    <div class="flex items-center gap-4">
      {#if showSummary}
        <!-- Total Value (consistent with category and type levels) -->
        <div class="text-right">
          <div class="text-lg font-medium text-foreground">
            {@html wrapNumbersWithFont(formattedTotal)}
          </div>
        </div>
      {/if}
    </div>
  </div>
{/if}

<style>
  .bank-header {
    /* Ensure proper focus styles for accessibility */
    outline: none;
    border: none; /* Remove default button border */
    background: transparent; /* Let classes handle background */
  }

  .bank-header:focus-visible {
    outline: 2px solid hsl(var(--ring));
    outline-offset: 2px;
  }

  /* Smooth hover transitions */
  .bank-header:hover {
    transform: translateY(-1px);
  }

  /* Active state feedback */
  .bank-header:active {
    transform: translateY(0);
  }

  /* Ensure button text alignment */
  button.bank-header {
    text-align: left;
  }
</style>

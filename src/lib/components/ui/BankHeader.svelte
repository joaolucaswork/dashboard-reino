<script>
  import BankLogo from './BankLogo.svelte';
  import { getBancoInfo } from '$lib/data/bancos.js';
  import { formatarMoeda } from '$lib/utils/formatters.js';
  
  /**
   * Bank Header Component for Consolidated Tables
   * 
   * Displays bank information with logo, name, and optional summary data
   * Supports collapsible/expandable states with visual feedback
   */

  // Props
  export let bankName = '';
  export let isExpanded = false;
  export let totalValue = 0;
  export let assetCount = 0;
  export let showSummary = true;
  export let clickable = true;
  export let className = '';

  // Event dispatcher
  import { createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher();

  // Reactive computations
  $: bankInfo = getBancoInfo(bankName);
  $: formattedTotal = formatarMoeda(totalValue);
  
  // Handle click events
  function handleClick() {
    if (clickable) {
      dispatch('toggle', { bankName, isExpanded: !isExpanded });
    }
  }
  
  // Handle keyboard navigation
  function handleKeydown(event) {
    if (clickable && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault();
      handleClick();
    }
  }
</script>

<!-- Bank Header Container -->
<div 
  class="
    bank-header flex items-center justify-between p-4 rounded-lg
    transition-all duration-300 ease-in-out
    {clickable ? 'cursor-pointer hover:bg-muted/50' : ''}
    {isExpanded ? 'bg-muted/30' : 'bg-background'}
    {className}
  "
  class:shadow-sm={isExpanded}
  role={clickable ? 'button' : 'heading'}
  tabindex={clickable ? 0 : -1}
  aria-expanded={clickable ? isExpanded : undefined}
  aria-label={clickable ? `${bankName} - ${isExpanded ? 'Expandido' : 'Recolhido'}` : bankName}
  on:click={handleClick}
  on:keydown={handleKeydown}
>
  <!-- Left Section: Logo and Bank Info -->
  <div class="flex items-center gap-3">
    <!-- Bank Logo -->
    <BankLogo 
      {bankName} 
      isActive={isExpanded} 
      size="lg"
      className="flex-shrink-0"
    />
    
    <!-- Bank Information -->
    <div class="flex flex-col">
      <!-- Bank Name -->
      <h3 class="text-lg font-bold text-foreground leading-tight">
        {bankName}
      </h3>
      
      <!-- Bank Category (if available) -->
      {#if bankInfo?.categoria}
        <span class="text-sm text-muted-foreground font-medium capitalize">
          {bankInfo.categoria.replace('_', ' ')}
        </span>
      {/if}
    </div>
  </div>

  <!-- Right Section: Summary and Expand Indicator -->
  <div class="flex items-center gap-4">
    {#if showSummary}
      <!-- Summary Information -->
      <div class="text-right">
        <!-- Total Value -->
        <div class="text-lg font-bold text-foreground">
          {formattedTotal}
        </div>
        
        <!-- Asset Count -->
        {#if assetCount > 0}
          <div class="text-sm text-muted-foreground font-medium">
            {assetCount} {assetCount === 1 ? 'ativo' : 'ativos'}
          </div>
        {/if}
      </div>
    {/if}
    
    {#if clickable}
      <!-- Expand/Collapse Indicator -->
      <div 
        class="
          w-6 h-6 flex items-center justify-center
          transition-transform duration-300 ease-in-out
          text-muted-foreground
        "
        class:rotate-180={isExpanded}
      >
        <!-- Chevron Down Icon -->
        <svg 
          width="16" 
          height="16" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          stroke-width="2" 
          stroke-linecap="round" 
          stroke-linejoin="round"
        >
          <polyline points="6,9 12,15 18,9"></polyline>
        </svg>
      </div>
    {/if}
  </div>
</div>

<style>
  .bank-header {
    /* Ensure proper focus styles for accessibility */
    outline: none;
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
</style>

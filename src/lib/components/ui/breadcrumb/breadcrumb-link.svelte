<!-- Dynamically render the element -->
{#if $$props.href}
  <a
    class="font-semibold transition-colors hover:text-foreground"
    {...$$restProps}
  >
    <slot />
  </a>
{:else}
  <button
    class="font-semibold transition-colors hover:text-foreground text-left"
    {...$$restProps}
  >
    <slot />
  </button>
{/if}

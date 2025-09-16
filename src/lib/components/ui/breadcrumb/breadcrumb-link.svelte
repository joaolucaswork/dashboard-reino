<!-- Dynamically render the element -->
{#if $$props.href}
  <a class="transition-colors hover:text-foreground" {...$$restProps}>
    <slot />
  </a>
{:else}
  <button
    class="transition-colors hover:text-foreground text-left"
    {...$$restProps}
  >
    <slot />
  </button>
{/if}

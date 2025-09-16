<script>
  import { ChevronRight } from "@lucide/svelte";
</script>

<li role="presentation" aria-hidden="true" {...$$restProps}>
  <slot>
    <ChevronRight class="h-4 w-4" />
  </slot>
</li>

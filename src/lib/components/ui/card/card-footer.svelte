<script lang="ts">
  import { cn, type WithElementRef } from "$lib/utils.js";
  import { Separator } from "$lib/components/ui/separator";
  import type { HTMLAttributes } from "svelte/elements";

  let {
    ref = $bindable(null),
    class: className,
    children,
    separator = true,
    ...restProps
  }: WithElementRef<
    HTMLAttributes<HTMLDivElement> & { separator?: boolean }
  > = $props();
</script>

{#if separator}
  <Separator />
{/if}

<div
  bind:this={ref}
  data-slot="card-footer"
  class={cn("flex items-center px-6", separator ? "pt-4" : "", className)}
  {...restProps}
>
  {@render children?.()}
</div>

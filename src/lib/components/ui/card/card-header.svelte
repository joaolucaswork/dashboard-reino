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

<div
  bind:this={ref}
  data-slot="card-header"
  class={cn(
    "@container/card-header has-data-[slot=card-action]:grid-cols-[1fr_auto] grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6",
    separator ? "pb-4" : "",
    className
  )}
  {...restProps}
>
  {@render children?.()}
</div>

{#if separator}
  <Separator />
{/if}

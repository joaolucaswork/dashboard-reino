<script lang="ts">
  // bits-ui types for Select.Value can be incompatible with svelte-check in some versions.
  // We relax typing here to avoid false-positive errors while keeping runtime behavior.
  import { Select as SelectPrimitiveOriginal } from "bits-ui";
  import { cn } from "$lib/utils.js";

  // Force any-typed alias to avoid ValueProps reference errors
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const SelectPrimitive: any = SelectPrimitiveOriginal;

  let {
    ref = $bindable(null),
    class: className,
    placeholder,
    ...restProps
  } = $props();
</script>

<SelectPrimitive.Value
  bind:ref
  data-slot="select-value"
  class={cn("line-clamp-1 flex items-center gap-2", className)}
  {placeholder}
  {...restProps}
/>

<script lang="ts">
  import { tick } from "svelte";
  import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
  } from "$lib/components/ui/command";
  import {
    Popover,
    PopoverContent,
    PopoverTrigger,
  } from "$lib/components/ui/popover";
  import { Check, ChevronsUpDown } from "@lucide/svelte";
  import { cn } from "$lib/utils.js";

  // Props
  let {
    value = $bindable(),
    options = [],
    placeholder = "Selecione uma opção...",
    searchPlaceholder = "Buscar...",
    emptyMessage = "Nenhuma opção encontrada.",
    disabled = false,
    class: className = "",
    ...restProps
  }: {
    value?: string;
    options?: Array<{ value: string; label: string; description?: string }>;
    placeholder?: string;
    searchPlaceholder?: string;
    emptyMessage?: string;
    disabled?: boolean;
    class?: string;
  } = $props();

  let open = $state(false);
  let triggerRef = $state<HTMLDivElement>();

  // Find selected option
  let selectedOption = $derived(
    options.find((option) => option.value === value)
  );

  // Close and refocus trigger
  function closeAndFocusTrigger() {
    open = false;
    tick().then(() => {
      triggerRef?.focus();
    });
  }

  // Handle selection
  function handleSelect(selectedValue: string) {
    value = selectedValue === value ? "" : selectedValue;
    closeAndFocusTrigger();
  }
</script>

<Popover bind:open>
  <PopoverTrigger class="w-full">
    <div
      bind:this={triggerRef}
      role="combobox"
      aria-expanded={open}
      class={cn(
        "flex h-12 w-full items-center justify-between rounded-md border border-input bg-card px-4 py-3 text-sm placeholder:text-muted-foreground focus:outline-none disabled:cursor-not-allowed disabled:opacity-50",
        !value && "text-muted-foreground font-normal",
        value && "font-medium",
        disabled && "cursor-not-allowed opacity-50",
        className
      )}
      tabindex={disabled ? -1 : 0}
      {...restProps}
    >
      {selectedOption ? selectedOption.label : placeholder}
      <ChevronsUpDown class="ml-3 h-4 w-4 shrink-0 opacity-50" />
    </div>
  </PopoverTrigger>
  <PopoverContent class="w-80 p-0" align="start">
    <Command>
      <CommandInput placeholder={searchPlaceholder} class="h-9" />
      <CommandList>
        <CommandEmpty>{emptyMessage}</CommandEmpty>
        <CommandGroup>
          {#each options as option}
            <CommandItem
              value={option.value}
              onSelect={() => handleSelect(option.value)}
              class="flex items-center justify-between"
            >
              <div class="flex flex-col">
                <span>{option.label}</span>
                {#if option.description}
                  <span class="text-xs text-muted-foreground"
                    >{option.description}</span
                  >
                {/if}
              </div>
              <Check
                class={cn(
                  "ml-auto h-4 w-4",
                  value === option.value ? "opacity-100" : "opacity-0"
                )}
              />
            </CommandItem>
          {/each}
        </CommandGroup>
      </CommandList>
    </Command>
  </PopoverContent>
</Popover>

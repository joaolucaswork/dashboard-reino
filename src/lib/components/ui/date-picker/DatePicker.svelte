<script lang="ts">
  import { parseDate, getLocalTimeZone } from "@internationalized/date";
  import { Calendar } from "$lib/components/ui/calendar";
  import {
    Popover,
    PopoverContent,
    PopoverTrigger,
  } from "$lib/components/ui/popover";
  import { ChevronDown } from "@lucide/svelte";
  import { cn } from "$lib/utils.js";

  // Props
  let {
    value = $bindable(),
    placeholder = "Selecione uma data",
    disabled = false,
    minValue = undefined,
    maxValue = undefined,
    class: className = "",
    error = false,
    ...restProps
  }: {
    value?: string;
    placeholder?: string;
    disabled?: boolean;
    minValue?: string;
    maxValue?: string;
    class?: string;
    error?: boolean;
  } = $props();

  let open = $state(false);
  let calendarValue = $state(value ? parseDate(value) : undefined);

  // Format date for display
  function formatDate(dateString: string): string {
    if (!dateString) return "";

    try {
      const date = parseDate(dateString);
      const jsDate = date.toDate(getLocalTimeZone());
      return jsDate.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    } catch {
      return dateString;
    }
  }

  // Watch for calendar value changes
  $effect(() => {
    if (calendarValue) {
      value = calendarValue.toString();
      open = false;
    }
  });

  // Update calendar value when external value changes
  $effect(() => {
    if (value) {
      try {
        calendarValue = parseDate(value);
      } catch {
        calendarValue = undefined;
      }
    } else {
      calendarValue = undefined;
    }
  });

  // Convert string dates to DateValue objects for Calendar component
  const calendarMinValue = $derived.by(() => {
    if (!minValue) return undefined;
    try {
      return parseDate(minValue);
    } catch {
      return undefined;
    }
  });

  const calendarMaxValue = $derived.by(() => {
    if (!maxValue) return undefined;
    try {
      return parseDate(maxValue);
    } catch {
      return undefined;
    }
  });
</script>

<Popover bind:open>
  <PopoverTrigger
    class={cn(
      "w-full justify-between font-medium inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium outline-none transition-all focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50 bg-background shadow-xs hover:bg-accent hover:text-accent-foreground border h-9 px-4 py-2",
      !value && "text-muted-foreground font-medium",
      value && "font-semibold",
      error && "border-destructive",
      disabled && "cursor-not-allowed opacity-50",
      className
    )}
    {disabled}
    {...restProps}
  >
    {value ? formatDate(value) : placeholder}
    <ChevronDown class="h-4 w-4" />
  </PopoverTrigger>
  <PopoverContent class="w-auto overflow-hidden p-0" align="start">
    <Calendar
      bind:value={calendarValue}
      locale="pt-BR"
      initialFocus
      type="single"
      captionLayout="dropdown"
      minValue={calendarMinValue}
      maxValue={calendarMaxValue}
    />
  </PopoverContent>
</Popover>

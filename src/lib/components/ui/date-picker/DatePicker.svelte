<script lang="ts">
  import { parseDate, getLocalTimeZone, today } from "@internationalized/date";
  import { Calendar } from "$lib/components/ui/calendar";
  import { Button } from "$lib/components/ui/button";
  import {
    Popover,
    PopoverContent,
    PopoverTrigger,
  } from "$lib/components/ui/popover";
  import { Calendar as CalendarIcon } from "@lucide/svelte";
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

  // Handle today button
  function selectToday() {
    const todayDate = today(getLocalTimeZone());
    value = todayDate.toString();
    calendarValue = todayDate;
    open = false;
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
</script>

<Popover bind:open>
  <PopoverTrigger>
    <div
      role="button"
      tabindex={disabled ? -1 : 0}
      class={cn(
        "flex h-12 w-full items-center justify-start rounded-md border border-input bg-card px-4 py-3 text-sm placeholder:text-muted-foreground focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 text-left",
        !value && "text-muted-foreground font-normal",
        value && "font-medium",
        error && "border-destructive",
        disabled && "cursor-not-allowed opacity-50",
        className
      )}
      {...restProps}
    >
      <CalendarIcon class="mr-3 h-4 w-4" />
      {value ? formatDate(value) : placeholder}
    </div>
  </PopoverTrigger>
  <PopoverContent class="w-auto p-0" align="start">
    <div class="p-3 border-b">
      <Button variant="outline" size="sm" class="w-full" onclick={selectToday}>
        Hoje
      </Button>
    </div>
    <Calendar
      bind:value={calendarValue}
      locale="pt-BR"
      initialFocus
      type="single"
    />
  </PopoverContent>
</Popover>

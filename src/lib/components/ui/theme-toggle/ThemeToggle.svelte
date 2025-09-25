<script lang="ts">
  import { Switch } from "$lib/components/ui/switch/index.js";
  import { Sun, Moon } from "@lucide/svelte";
  import {
    themeStore,
    isLightTheme,
    themeDisplayName,
  } from "$lib/stores/theme.js";
  import { cn } from "$lib/utils.js";

  let {
    class: className,
    showLabel = false,
    size = "default",
    ...restProps
  }: {
    class?: string;
    showLabel?: boolean;
    size?: "sm" | "default" | "lg";
  } = $props();

  // Size variants
  const sizeClasses = {
    sm: "h-4 w-7",
    default: "h-[1.15rem] w-8",
    lg: "h-6 w-10",
  };

  const iconSizes = {
    sm: 12,
    default: 14,
    lg: 16,
  };

  function handleToggle() {
    themeStore.toggleTheme();
  }
</script>

<div class={cn("flex items-center gap-2", className)} {...restProps}>
  {#if showLabel}
    <div class="flex items-center gap-2">
      <Sun size={iconSizes[size]} class="text-foreground/60" />
      <span class="text-sm font-medium text-foreground/60">Claro</span>
    </div>
  {/if}

  <Switch
    checked={$isLightTheme}
    onCheckedChange={handleToggle}
    class={cn(sizeClasses[size])}
    aria-label="Alternar tema: {$themeDisplayName}"
  />

  {#if showLabel}
    <div class="flex items-center gap-2">
      <span class="text-sm font-medium text-foreground/60">Escuro</span>
      <Moon size={iconSizes[size]} class="text-foreground/60" />
    </div>
  {/if}
</div>

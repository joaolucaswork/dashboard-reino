<script>
  import favicon from "$lib/assets/favicon.svg";
  import DashboardLayout from "$lib/components/DashboardLayout.svelte";
  import { Toaster } from "svelte-sonner";
  import { themeStore, isDarkTheme } from "$lib/stores/theme.js";
  import { onMount } from "svelte";
  import "../app.css";

  let { children } = $props();

  // Initialize theme on app load
  onMount(() => {
    themeStore.initializeTheme();
  });
</script>

<svelte:head>
  <link rel="icon" href={favicon} />
</svelte:head>

<DashboardLayout>
  {@render children?.()}
</DashboardLayout>

<Toaster
  theme={$isDarkTheme ? "dark" : "light"}
  position="bottom-right"
  richColors={false}
  expand
  duration={4000}
  visibleToasts={5}
  closeButton={false}
  toastOptions={{
    unstyled: true,
    classes: {
      toast:
        "bg-card text-card-foreground border border-border rounded-lg p-4 font-medium backdrop-blur-sm flex items-center gap-3 [&>*:first-child]:flex-shrink-0 [&>*:first-child]:self-center [&>*:first-child]:mt-0 [&>*:first-child]:align-middle",
      title: "font-medium text-card-foreground text-sm",
      description: "text-muted-foreground font-medium text-sm mt-1",
      actionButton:
        "bg-primary text-primary-foreground hover:bg-primary/90 px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
      cancelButton:
        "bg-secondary text-secondary-foreground hover:bg-secondary/80 px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
      closeButton:
        "text-muted-foreground hover:text-foreground transition-colors",
      success: "bg-card text-card-foreground border-border",
      error: "bg-card text-card-foreground border-border",
      warning: "bg-card text-card-foreground border-border",
      info: "bg-card text-card-foreground border-border",
      loading: "bg-card text-card-foreground border-border",
    },
  }}
/>

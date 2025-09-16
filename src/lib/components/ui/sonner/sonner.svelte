<script>
  import { Toaster } from "svelte-sonner";

  let {
    theme = "dark",
    position = "bottom-right",
    richColors = true,
    expand = true,
    duration = 4000,
    visibleToasts = 5,
    closeButton = false,
    toastOptions = {},
    ...restProps
  } = $props();

  // Custom toast styles that match our design system using unstyled approach
  const customToastOptions = {
    unstyled: true,
    classes: {
      toast:
        "bg-card text-card-foreground border border-border rounded-lg shadow-lg p-4 font-medium",
      title: "font-medium text-card-foreground",
      description: "text-muted-foreground font-medium text-sm",
      actionButton:
        "bg-primary text-primary-foreground hover:bg-primary/90 px-3 py-1.5 rounded-md text-sm font-medium",
      cancelButton:
        "bg-secondary text-secondary-foreground hover:bg-secondary/80 px-3 py-1.5 rounded-md text-sm font-medium",
      closeButton: "text-muted-foreground hover:text-foreground",
      success: "bg-card text-green-600 border-green-200",
      error: "bg-card text-destructive border-destructive/20",
      warning: "bg-card text-yellow-600 border-yellow-200",
      info: "bg-card text-blue-600 border-blue-200",
    },
    ...toastOptions,
  };
</script>

<Toaster
  {theme}
  {position}
  {richColors}
  {expand}
  {duration}
  {visibleToasts}
  {closeButton}
  toastOptions={customToastOptions}
  {...restProps}
/>

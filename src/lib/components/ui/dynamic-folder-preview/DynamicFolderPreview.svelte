<script lang="ts">
  interface FolderItem {
    id: string;
    color?: string;
    icon?: any;
    name: string;
  }

  interface FolderConfig {
    items: FolderItem[];
    type: "integrations" | "tables";
  }

  let { config }: { config: FolderConfig } = $props();

  // Fixed layout for collapsed state - always 2x2 grid with max 4 items
  function getFixedLayout() {
    return {
      iconSize: "w-4 h-4", // Fixed size icons to prevent auto-scaling
      gridCols: 2,
      gridRows: 2,
      gap: "gap-1.5",
      maxItems: 4,
    };
  }

  // Get visible items (limit based on layout capacity)
  function getVisibleItems(items: FolderItem[], maxItems: number) {
    return items.slice(0, maxItems);
  }

  // Generate grid layout classes
  function getGridClasses(layout: ReturnType<typeof getFixedLayout>) {
    // Use explicit grid classes to ensure they're included in build
    const gridColsMap = {
      1: "grid-cols-1",
      2: "grid-cols-2",
      3: "grid-cols-3",
    };
    const gridRowsMap = {
      1: "grid-rows-1",
      2: "grid-rows-2",
      3: "grid-rows-3",
    };

    const gridColsClass =
      gridColsMap[layout.gridCols as keyof typeof gridColsMap] || "grid-cols-2";
    const gridRowsClass =
      gridRowsMap[layout.gridRows as keyof typeof gridRowsMap] || "grid-rows-2";
    return `grid ${gridColsClass} ${gridRowsClass} ${layout.gap} w-full h-full`;
  }

  // Render integration item (colored circle)
  function renderIntegrationItem(item: FolderItem, iconSize: string) {
    return {
      class: `${iconSize} rounded-sm ${item.color} opacity-80 justify-self-center`,
      content: null,
    };
  }

  // Render table item (icon or dot)
  function renderTableItem(item: FolderItem, iconSize: string) {
    if (item.icon) {
      return {
        class: `${iconSize} flex items-center justify-center justify-self-center`,
        content: item.icon,
        iconProps: {
          size: 14, // Fixed size to prevent auto-scaling with container
          class: "text-white/60",
        },
      };
    }
    return {
      class: `${iconSize} bg-white/60 rounded-sm justify-self-center`,
      content: null,
    };
  }

  const layout = $derived(getFixedLayout());
  const visibleItems = $derived(getVisibleItems(config.items, layout.maxItems));
  const gridClasses = $derived(getGridClasses(layout));
</script>

<div class="absolute inset-0 p-2">
  <div class={gridClasses}>
    {#each visibleItems as item}
      {#if config.type === "integrations"}
        {@const rendered = renderIntegrationItem(item, layout.iconSize)}
        <div class={rendered.class}></div>
      {:else if config.type === "tables"}
        {@const rendered = renderTableItem(item, layout.iconSize)}
        <div class={rendered.class}>
          {#if rendered.content}
            {@const IconComponent = rendered.content}
            <IconComponent
              size={rendered.iconProps?.size}
              class={rendered.iconProps?.class}
            />
          {/if}
        </div>
      {/if}
    {/each}
  </div>
</div>

<style>
  /* Ensure smooth transitions for dynamic changes */
  div {
    transition: all 200ms cubic-bezier(0.4, 0, 0.2, 1);
  }
</style>

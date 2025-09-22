<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import { Badge } from "$lib/components/ui/badge";
  import {
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
  } from "@lucide/svelte";
  import { cn } from "$lib/utils.js";

  // Props
  interface Props {
    currentPage: number;
    totalItems: number;
    pageSize: number;
    onPageChange: (page: number) => void;
    onPageSizeChange?: (pageSize: number) => void;
    showPageSizeSelector?: boolean;
    pageSizeOptions?: number[];
    className?: string;
    showFirstLast?: boolean;
    maxVisiblePages?: number;
  }

  let {
    currentPage = 0,
    totalItems,
    pageSize = 3,
    onPageChange,
    onPageSizeChange,
    showPageSizeSelector = true,
    pageSizeOptions = [3, 5, 10, 20, 50],
    className,
    showFirstLast = true,
    maxVisiblePages = 5,
  }: Props = $props();

  // Computed values
  let totalPages = $derived(Math.ceil(totalItems / pageSize));
  let startItem = $derived(currentPage * pageSize + 1);
  let endItem = $derived(Math.min((currentPage + 1) * pageSize, totalItems));
  let canGoPrevious = $derived(currentPage > 0);
  let canGoNext = $derived(currentPage < totalPages - 1);

  // Generate visible page numbers
  let visiblePages = $derived.by(() => {
    if (totalPages <= maxVisiblePages) {
      return Array.from({ length: totalPages }, (_, i) => i);
    }

    const half = Math.floor(maxVisiblePages / 2);
    let start = Math.max(0, currentPage - half);
    let end = Math.min(totalPages - 1, start + maxVisiblePages - 1);

    if (end - start + 1 < maxVisiblePages) {
      start = Math.max(0, end - maxVisiblePages + 1);
    }

    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  });

  // Navigation functions
  function goToFirstPage() {
    if (canGoPrevious) onPageChange(0);
  }

  function goToPreviousPage() {
    if (canGoPrevious) onPageChange(currentPage - 1);
  }

  function goToNextPage() {
    if (canGoNext) onPageChange(currentPage + 1);
  }

  function goToLastPage() {
    if (canGoNext) onPageChange(totalPages - 1);
  }

  function goToPage(page: number) {
    if (page >= 0 && page < totalPages) {
      onPageChange(page);
    }
  }

  function handlePageSizeChange(newPageSize: string) {
    const size = parseInt(newPageSize);
    if (onPageSizeChange) {
      onPageSizeChange(size);
      // Adjust current page if necessary
      const newTotalPages = Math.ceil(totalItems / size);
      if (currentPage >= newTotalPages) {
        onPageChange(Math.max(0, newTotalPages - 1));
      }
    }
  }
</script>

{#if totalPages > 1}
  <div
    class={cn("flex items-center justify-between space-x-2 py-4", className)}
  >
    <!-- Items info and page size selector -->
    <div class="flex items-center space-x-4">
      <div class="text-muted-foreground text-sm font-medium">
        Mostrando {startItem} a {endItem} de {totalItems} resultado{totalItems !==
        1
          ? "s"
          : ""}
      </div>

      {#if showPageSizeSelector && onPageSizeChange}
        <div class="flex items-center space-x-2">
          <span class="text-sm font-medium">Itens por página:</span>
          <div class="flex items-center space-x-1">
            {#each pageSizeOptions as option}
              <Button
                variant={pageSize === option ? "default" : "outline"}
                size="sm"
                onclick={() => handlePageSizeChange(option.toString())}
                class="h-8 w-8 p-0"
              >
                {option}
              </Button>
            {/each}
          </div>
        </div>
      {/if}
    </div>

    <!-- Pagination controls -->
    <div class="flex items-center space-x-1">
      {#if showFirstLast}
        <Button
          variant="outline"
          size="sm"
          onclick={goToFirstPage}
          disabled={!canGoPrevious}
          class="h-8 w-8 p-0"
          aria-label="Primeira página"
        >
          <ChevronsLeft class="h-4 w-4" />
        </Button>
      {/if}

      <Button
        variant="outline"
        size="sm"
        onclick={goToPreviousPage}
        disabled={!canGoPrevious}
        class="h-8 w-8 p-0"
        aria-label="Página anterior"
      >
        <ChevronLeft class="h-4 w-4" />
      </Button>

      <!-- Page numbers -->
      {#each visiblePages as page}
        <Button
          variant={page === currentPage ? "default" : "outline"}
          size="sm"
          onclick={() => goToPage(page)}
          class="h-8 w-8 p-0"
          aria-label="Página {page + 1}"
          aria-current={page === currentPage ? "page" : undefined}
        >
          {page + 1}
        </Button>
      {/each}

      <Button
        variant="outline"
        size="sm"
        onclick={goToNextPage}
        disabled={!canGoNext}
        class="h-8 w-8 p-0"
        aria-label="Próxima página"
      >
        <ChevronRight class="h-4 w-4" />
      </Button>

      {#if showFirstLast}
        <Button
          variant="outline"
          size="sm"
          onclick={goToLastPage}
          disabled={!canGoNext}
          class="h-8 w-8 p-0"
          aria-label="Última página"
        >
          <ChevronsRight class="h-4 w-4" />
        </Button>
      {/if}
    </div>
  </div>
{/if}

<script>
  import * as Table from "$lib/components/ui/table/index.js";
  import { Button } from "$lib/components/ui/button/index.js";
  import { Input } from "$lib/components/ui/input/index.js";
  import { formatTableCellValue } from "$lib/utils/formatters.js";

  let {
    data = [],
    columns = [],
    searchKey = "",
    searchPlaceholder = "Filtrar dados...",
    showPagination = true,
  } = $props();

  // Simple state management
  let searchValue = $state("");
  let currentPage = $state(0);
  let pageSize = $state(10);
  let sortColumn = $state("");
  let sortDirection = $state("asc");

  // Filter data based on search
  let filteredData = $derived(
    searchValue && searchKey
      ? data.filter((row) => {
          const value = row[searchKey];
          return (
            value &&
            value.toString().toLowerCase().includes(searchValue.toLowerCase())
          );
        })
      : data
  );

  // Sort data
  let sortedData = $derived(
    sortColumn
      ? [...filteredData].sort((a, b) => {
          const aVal = a[sortColumn];
          const bVal = b[sortColumn];

          if (typeof aVal === "number" && typeof bVal === "number") {
            return sortDirection === "asc" ? aVal - bVal : bVal - aVal;
          }

          const aStr = String(aVal || "").toLowerCase();
          const bStr = String(bVal || "").toLowerCase();

          if (sortDirection === "asc") {
            return aStr.localeCompare(bStr);
          } else {
            return bStr.localeCompare(aStr);
          }
        })
      : filteredData
  );

  // Paginate data
  let totalPages = $derived(Math.ceil(sortedData.length / pageSize));
  let paginatedData = $derived(
    sortedData.slice(currentPage * pageSize, (currentPage + 1) * pageSize)
  );

  function handleSort(columnKey) {
    if (sortColumn === columnKey) {
      sortDirection = sortDirection === "asc" ? "desc" : "asc";
    } else {
      sortColumn = columnKey;
      sortDirection = "asc";
    }
  }

  function nextPage() {
    if (currentPage < totalPages - 1) {
      currentPage++;
    }
  }

  function previousPage() {
    if (currentPage > 0) {
      currentPage--;
    }
  }

  function renderCell(column, row) {
    if (column.cell && typeof column.cell === "function") {
      return column.cell({ row: { getValue: (key) => row[key] } });
    }

    // Obter valor da célula
    const value = row[column.accessorKey];

    // Aplicar formatação seguindo a lógica do template HTML
    return formatTableCellValue(value, column.accessorKey);
  }

  function renderHeader(column) {
    if (column.header && typeof column.header === "function") {
      return column.header({
        column: {
          getToggleSortingHandler: () => () => handleSort(column.accessorKey),
        },
      });
    }
    return column.header || column.accessorKey;
  }
</script>

<div class="space-y-4">
  <!-- Toolbar -->
  <div class="flex items-center justify-between">
    <!-- Search Input -->
    {#if searchKey}
      <div class="flex items-center space-x-2">
        <Input
          placeholder={searchPlaceholder}
          bind:value={searchValue}
          class="max-w-sm"
        />
      </div>
    {/if}
  </div>

  <!-- Table -->
  <div class="rounded-md border">
    <Table.Root>
      <Table.Header>
        <Table.Row>
          {#each columns as column}
            <Table.Head>
              {#if column.header}
                {@html renderHeader(column)}
              {:else}
                {column.accessorKey}
              {/if}
            </Table.Head>
          {/each}
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {#each paginatedData as row, index (index)}
          <Table.Row>
            {#each columns as column}
              <Table.Cell>
                {@html renderCell(column, row)}
              </Table.Cell>
            {/each}
          </Table.Row>
        {:else}
          <Table.Row>
            <Table.Cell colspan={columns.length} class="h-24 text-center">
              Nenhum resultado encontrado.
            </Table.Cell>
          </Table.Row>
        {/each}
      </Table.Body>
    </Table.Root>
  </div>

  <!-- Pagination -->
  {#if showPagination}
    <div class="flex items-center justify-between space-x-2 py-4">
      <div class="text-muted-foreground flex-1 text-sm">
        Mostrando {Math.min(currentPage * pageSize + 1, sortedData.length)} a {Math.min(
          (currentPage + 1) * pageSize,
          sortedData.length
        )} de {sortedData.length} resultado(s).
      </div>
      <div class="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          onclick={previousPage}
          disabled={currentPage === 0}
        >
          Anterior
        </Button>
        <Button
          variant="outline"
          size="sm"
          onclick={nextPage}
          disabled={currentPage >= totalPages - 1}
        >
          Próximo
        </Button>
      </div>
    </div>
  {/if}
</div>

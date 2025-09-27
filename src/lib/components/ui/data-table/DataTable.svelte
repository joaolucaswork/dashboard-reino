<script>
  import * as Table from "$lib/components/ui/table/index.js";
  import { Button } from "$lib/components/ui/button/index.js";
  import { Input } from "$lib/components/ui/input/index.js";
  import { formatTableCellValue } from "$lib/utils/formatters.js";
  import { wrapNumbersWithFont } from "$lib/utils/number-font.js";
  import InvestmentCategoryIndicator from "$lib/components/ui/InvestmentCategoryIndicator.svelte";

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
    const formattedValue = formatTableCellValue(value, column.accessorKey);

    // Aplicar fonte monospace apenas aos números
    return wrapNumbersWithFont(formattedValue);
  }

  // Função para detectar colunas monetárias
  function isMonetaryColumn(column) {
    const header = (column.header || "").toLowerCase();
    const key = (column.accessorKey || "").toLowerCase();
    return (
      header.includes("saldo") ||
      header.includes("valor") ||
      header.includes("quantidade") ||
      header.includes("quant") ||
      key === "col4" || // Quantidade
      key === "col5" || // Saldo Bruto
      key === "col7" || // Saldo Líquido
      header.includes("total") ||
      header.includes("preço") ||
      header.includes("preco")
    );
  }

  function isInvestmentCategoryColumn(column) {
    // Detectar colunas de categoria de investimento baseado no header ou accessorKey
    const header = (column.header || "").toLowerCase();
    const key = (column.accessorKey || "").toLowerCase();
    return (
      header.includes("tipo de ativo") ||
      header.includes("categoria") ||
      key === "col2" || // col2 é tipicamente a coluna de tipo de ativo
      header.includes("asset type") ||
      header.includes("investment type")
    );
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
  <div class="rounded-lg border border-border/50 overflow-hidden shadow-sm">
    <Table.Root class="w-full table-auto">
      <Table.Header>
        <Table.Row>
          {#each columns as column}
            {@const isMonetary = isMonetaryColumn(column)}
            <Table.Head class="px-4 py-3 {isMonetary ? 'text-left' : ''}">
              {#if column.header}
                <span class="font-medium">{@html renderHeader(column)}</span>
              {:else}
                <span class="font-medium">{column.accessorKey}</span>
              {/if}
            </Table.Head>
          {/each}
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {#each paginatedData as row, index (index)}
          {@const isEvenRow = index % 2 === 0}
          {@const rowClasses = [
            "transition-colors",
            isEvenRow ? "bg-background" : "bg-muted/50",
            "hover:bg-[#2b251e]",
          ].join(" ")}

          <Table.Row class={rowClasses}>
            {#each columns as column}
              {@const isMonetary = isMonetaryColumn(column)}
              {@const isCategory = isInvestmentCategoryColumn(column)}
              <Table.Cell
                class="px-4 py-3 {isMonetary ? 'text-right font-mono' : ''}"
              >
                {#if isCategory}
                  <InvestmentCategoryIndicator
                    category={row[column.accessorKey]}
                    showBadge={true}
                    variant="outline"
                    size="sm"
                    dotSize="w-1.5 h-1.5"
                  />
                {:else}
                  {@html renderCell(column, row)}
                {/if}
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

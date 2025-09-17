<script>
  import * as Table from "$lib/components/ui/table/index.js";
  import { Button } from "$lib/components/ui/button/index.js";
  import { Badge } from "$lib/components/ui/badge/index.ts";
  import { Checkbox } from "$lib/components/ui/checkbox/index.ts";
  import * as DropdownMenu from "$lib/components/ui/dropdown-menu/index.ts";
  import * as Popover from "$lib/components/ui/popover/index.ts";
  import { Separator } from "$lib/components/ui/separator/index.ts";
  import { formatTableCellValue } from "$lib/utils/formatters.js";
  import { wrapNumbersWithFont } from "$lib/utils/number-font.js";
  import {
    MoreHorizontal,
    Download,
    Settings,
    Columns3,
    Eye,
    SortAsc,
    SortDesc,
    FileText,
  } from "@lucide/svelte";

  let {
    data = [],
    columns = [],
    showPagination = true,
    enableRowSelection = true,
    enableColumnVisibility = true,
    enableBadges = true,
    onRowsSelected = null,
    badgeConfig = null,
    mode = "relatorio",
  } = $props();

  // Enhanced state management
  let currentPage = $state(0);
  let pageSize = $state(10);
  let sortColumn = $state("");
  let sortDirection = $state("asc");
  let selectedRows = $state(new Set());
  let columnVisibility = $state(new Map());
  let showColumnVisibility = $state(false);

  // Initialize column visibility
  $effect(() => {
    if (columns.length > 0 && columnVisibility.size === 0) {
      columns.forEach((col) => {
        columnVisibility.set(col.accessorKey, true);
      });
    }
  });

  // Get visible columns
  let visibleColumns = $derived(
    columns.filter((col) => columnVisibility.get(col.accessorKey) !== false)
  );

  // Sort data
  let sortedData = $derived(
    sortColumn
      ? [...data].sort((a, b) => {
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
      : data
  );

  // Paginate data
  let totalPages = $derived(Math.ceil(sortedData.length / pageSize));
  let paginatedData = $derived(
    sortedData.slice(currentPage * pageSize, (currentPage + 1) * pageSize)
  );

  // Selection state
  let isAllSelected = $derived(
    paginatedData.length > 0 &&
      paginatedData.every((_, index) =>
        selectedRows.has(currentPage * pageSize + index)
      )
  );

  let isIndeterminate = $derived(
    paginatedData.some((_, index) =>
      selectedRows.has(currentPage * pageSize + index)
    ) && !isAllSelected
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

  function toggleRowSelection(index) {
    const globalIndex = currentPage * pageSize + index;
    if (selectedRows.has(globalIndex)) {
      selectedRows.delete(globalIndex);
    } else {
      selectedRows.add(globalIndex);
    }
    selectedRows = new Set(selectedRows);

    if (onRowsSelected) {
      const selectedData = Array.from(selectedRows)
        .map((i) => sortedData[i])
        .filter(Boolean);
      onRowsSelected(selectedData);
    }
  }

  function toggleAllSelection() {
    if (isAllSelected) {
      // Deselect all on current page
      paginatedData.forEach((_, index) => {
        selectedRows.delete(currentPage * pageSize + index);
      });
    } else {
      // Select all on current page
      paginatedData.forEach((_, index) => {
        selectedRows.add(currentPage * pageSize + index);
      });
    }
    selectedRows = new Set(selectedRows);

    if (onRowsSelected) {
      const selectedData = Array.from(selectedRows)
        .map((i) => sortedData[i])
        .filter(Boolean);
      onRowsSelected(selectedData);
    }
  }

  function toggleColumnVisibility(columnKey) {
    columnVisibility.set(columnKey, !columnVisibility.get(columnKey));
    columnVisibility = new Map(columnVisibility);
  }

  function clearSelection() {
    selectedRows.clear();
    selectedRows = new Set(selectedRows);
    if (onRowsSelected) {
      onRowsSelected([]);
    }
  }

  function exportSelected() {
    const selectedData = Array.from(selectedRows)
      .map((i) => sortedData[i])
      .filter(Boolean);
    const csvContent = [
      visibleColumns.map((col) => col.header).join(","),
      ...selectedData.map((row) =>
        visibleColumns
          .map(
            (col) =>
              `"${formatTableCellValue(row[col.accessorKey], col.accessorKey)}"`
          )
          .join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "dados-selecionados.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  function getBadgeForRow(row) {
    if (!enableBadges || !badgeConfig) return null;

    // Default badge logic for financial data
    const value = row[badgeConfig.column || "col5"];
    if (typeof value === "number") {
      if (value > 500000) return { text: "Alto Valor", variant: "default" };
      if (value > 100000) return { text: "Médio Valor", variant: "secondary" };
      return { text: "Baixo Valor", variant: "outline" };
    }

    return badgeConfig.getBadge ? badgeConfig.getBadge(row) : null;
  }

  function renderCell(column, row) {
    if (column.cell && typeof column.cell === "function") {
      return column.cell({ row: { getValue: (key) => row[key] } });
    }

    const value = row[column.accessorKey];
    const formattedValue = formatTableCellValue(value, column.accessorKey);

    // Aplicar fonte monospace apenas aos números
    return wrapNumbersWithFont(formattedValue);
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

  // Row action functions
  function copyRowData(row) {
    const rowText = visibleColumns
      .map(
        (col) =>
          `${col.header}: ${formatTableCellValue(row[col.accessorKey], col.accessorKey)}`
      )
      .join("\n");

    navigator.clipboard.writeText(rowText).then(() => {
      // You can add a toast notification here
      console.log("Dados copiados para a área de transferência");
    });
  }

  function exportSingleRow(row) {
    const csvContent = [
      visibleColumns.map((col) => col.header).join(","),
      visibleColumns
        .map(
          (col) =>
            `"${formatTableCellValue(row[col.accessorKey], col.accessorKey)}"`
        )
        .join(","),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `linha-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function viewRowDetails(row) {
    // Create a detailed view of the row data
    const details = visibleColumns
      .map(
        (col) =>
          `${col.header}: ${formatTableCellValue(row[col.accessorKey], col.accessorKey)}`
      )
      .join("\n");

    alert(`Detalhes do Registro:\n\n${details}`);
  }

  function analyzeAsset(row) {
    // Placeholder for asset analysis functionality
    const assetName = row.col2 || "Ativo";
    alert(
      `Análise do ativo: ${assetName}\n\nFuncionalidade em desenvolvimento...`
    );
  }

  function editTransaction(row) {
    // Placeholder for transaction editing functionality
    const transactionId = row.col1 || "Transação";
    alert(
      `Editar transação: ${transactionId}\n\nFuncionalidade em desenvolvimento...`
    );
  }
</script>

<div class="space-y-4">
  <!-- Minimal Column Visibility Control -->
  {#if enableColumnVisibility}
    <div class="flex justify-end mb-4">
      <Popover.Root bind:open={showColumnVisibility}>
        <Popover.Trigger>
          <Button variant="outline" size="sm">
            <Columns3 class="h-4 w-4 mr-2" />
            Colunas
          </Button>
        </Popover.Trigger>
        <Popover.Content class="w-56">
          <div class="space-y-2">
            <h4 class="font-medium text-sm">Visibilidade das Colunas</h4>
            <Separator />
            {#each columns as column}
              <div class="flex items-center space-x-2">
                <Checkbox
                  id="column-{column.accessorKey}"
                  checked={columnVisibility.get(column.accessorKey)}
                  onCheckedChange={() =>
                    toggleColumnVisibility(column.accessorKey)}
                />
                <label
                  for="column-{column.accessorKey}"
                  class="text-sm font-medium cursor-pointer"
                >
                  {column.header || column.accessorKey}
                </label>
              </div>
            {/each}
          </div>
        </Popover.Content>
      </Popover.Root>
    </div>
  {/if}

  <!-- Enhanced Table -->
  <div class="rounded-md border">
    <Table.Root>
      <Table.Header>
        <Table.Row>
          <!-- Selection Header -->
          {#if enableRowSelection}
            <Table.Head class="w-12">
              <Checkbox
                checked={isAllSelected}
                indeterminate={isIndeterminate}
                onCheckedChange={toggleAllSelection}
                aria-label="Selecionar todas as linhas"
              />
            </Table.Head>
          {/if}

          <!-- Column Headers -->
          {#each visibleColumns as column}
            <Table.Head>
              <div class="flex items-center space-x-2">
                <button
                  class="flex items-center space-x-1 hover:text-foreground transition-colors font-medium"
                  onclick={() => handleSort(column.accessorKey)}
                >
                  <span>{@html renderHeader(column)}</span>
                  {#if sortColumn === column.accessorKey}
                    {#if sortDirection === "asc"}
                      <SortAsc class="h-4 w-4" />
                    {:else}
                      <SortDesc class="h-4 w-4" />
                    {/if}
                  {/if}
                </button>
              </div>
            </Table.Head>
          {/each}

          <!-- Actions Column Header -->
          <Table.Head class="w-12">
            <span class="sr-only">Ações</span>
          </Table.Head>
        </Table.Row>
      </Table.Header>

      <Table.Body>
        {#each paginatedData as row, index (index)}
          <Table.Row
            class="hover:bg-[#2b251e] transition-colors {selectedRows.has(
              currentPage * pageSize + index
            )
              ? 'bg-[#2b251e]'
              : ''}"
          >
            {#if enableRowSelection}
              <Table.Cell>
                <Checkbox
                  checked={selectedRows.has(currentPage * pageSize + index)}
                  onCheckedChange={() => toggleRowSelection(index)}
                  aria-label="Selecionar linha"
                />
              </Table.Cell>
            {/if}

            <!-- Data Cells -->
            {#each visibleColumns as column, colIndex}
              <Table.Cell>
                <div class="flex items-center space-x-2">
                  <span>{@html renderCell(column, row)}</span>

                  <!-- Badge for first column if enabled -->
                  {#if colIndex === 0 && enableBadges}
                    {@const badge = getBadgeForRow(row)}
                    {#if badge}
                      <Badge
                        variant={badge.variant || "secondary"}
                        class="text-xs"
                      >
                        {badge.text}
                      </Badge>
                    {/if}
                  {/if}
                </div>
              </Table.Cell>
            {/each}

            <!-- Row Actions Menu -->
            <Table.Cell>
              <DropdownMenu.Root>
                <DropdownMenu.Trigger>
                  <Button variant="ghost" size="sm" class="h-8 w-8 p-0">
                    <MoreHorizontal class="h-4 w-4" />
                    <span class="sr-only">Abrir menu de ações</span>
                  </Button>
                </DropdownMenu.Trigger>
                <DropdownMenu.Content align="end" class="w-48">
                  <DropdownMenu.Label>Ações do Registro</DropdownMenu.Label>
                  <DropdownMenu.Separator />

                  <DropdownMenu.Item onclick={() => copyRowData(row)}>
                    <FileText class="h-4 w-4 mr-2" />
                    Copiar Dados
                  </DropdownMenu.Item>

                  <DropdownMenu.Item onclick={() => exportSingleRow(row)}>
                    <Download class="h-4 w-4 mr-2" />
                    Exportar Linha
                  </DropdownMenu.Item>

                  <DropdownMenu.Separator />

                  <DropdownMenu.Item onclick={() => viewRowDetails(row)}>
                    <Eye class="h-4 w-4 mr-2" />
                    Ver Detalhes
                  </DropdownMenu.Item>

                  {#if mode === "consolidado"}
                    <DropdownMenu.Item onclick={() => analyzeAsset(row)}>
                      <Settings class="h-4 w-4 mr-2" />
                      Analisar Ativo
                    </DropdownMenu.Item>
                  {/if}

                  {#if mode === "movimentacoes"}
                    <DropdownMenu.Item onclick={() => editTransaction(row)}>
                      <Settings class="h-4 w-4 mr-2" />
                      Editar Transação
                    </DropdownMenu.Item>
                  {/if}
                </DropdownMenu.Content>
              </DropdownMenu.Root>
            </Table.Cell>
          </Table.Row>
        {:else}
          <Table.Row>
            <Table.Cell
              colspan={visibleColumns.length + (enableRowSelection ? 1 : 0) + 1}
              class="h-24 text-center"
            >
              <div
                class="flex flex-col items-center space-y-2 text-muted-foreground"
              >
                <FileText class="h-8 w-8" />
                <span>Nenhum resultado encontrado.</span>
              </div>
            </Table.Cell>
          </Table.Row>
        {/each}
      </Table.Body>
    </Table.Root>
  </div>

  <!-- Enhanced Pagination -->
  {#if showPagination && totalPages > 1}
    <div class="flex items-center justify-between space-x-2 py-4">
      <div class="flex items-center space-x-2">
        <div class="text-muted-foreground text-sm">
          Mostrando {Math.min(currentPage * pageSize + 1, sortedData.length)} a {Math.min(
            (currentPage + 1) * pageSize,
            sortedData.length
          )} de {sortedData.length} resultado(s).
        </div>

        {#if selectedRows.size > 0}
          <Badge variant="outline" class="ml-2">
            {selectedRows.size} selecionado(s)
          </Badge>
        {/if}
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

        <div class="flex items-center space-x-1">
          <span class="text-sm text-muted-foreground">
            Página {currentPage + 1} de {totalPages}
          </span>
        </div>

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

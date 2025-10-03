<script>
  import * as Table from "$lib/components/ui/table/index.js";
  import { Button } from "$lib/components/ui/button/index.js";
  import { Badge } from "$lib/components/ui/badge/index.ts";
  import { Checkbox } from "$lib/components/ui/checkbox/index.ts";
  import * as DropdownMenu from "$lib/components/ui/dropdown-menu/index.ts";
  import * as Popover from "$lib/components/ui/popover/index.ts";
  import { Separator } from "$lib/components/ui/separator/index.ts";
  import * as Tooltip from "$lib/components/ui/tooltip/index.js";
  import { formatTableCellValue } from "$lib/utils/formatters.js";
  import { wrapNumbersWithFont } from "$lib/utils/number-font.js";
  import InvestmentCategoryIndicator from "$lib/components/ui/InvestmentCategoryIndicator.svelte";
  import {
    MoreHorizontal,
    Download,
    Settings,
    Columns3,
    Eye,
    SortAsc,
    SortDesc,
    FileText,
    TrendingUp,
    Calculator,
    Hash,
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

  function isDescriptionColumn(column) {
    // Detectar colunas de descrição baseado no header ou accessorKey
    const header = (column.header || "").toLowerCase();
    const key = (column.accessorKey || "").toLowerCase();
    return (
      header.includes("descrição") ||
      header.includes("descricao") ||
      key === "col3" || // col3 é tipicamente a coluna de descrição
      header.includes("description")
    );
  }

  function isQuantityColumn(column) {
    // Detectar colunas de quantidade baseado no header ou accessorKey
    const header = (column.header || "").toLowerCase();
    const key = (column.accessorKey || "").toLowerCase();
    return (
      header.includes("quant") ||
      header.includes("quantidade") ||
      key === "col4" || // col4 é tipicamente a coluna de quantidade
      header.includes("quantity")
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

  // Função para detectar qualquer coluna monetária (quantidade, saldo, valor, etc.)
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
      header.includes("preco") ||
      isQuantityColumn(column) ||
      isBalanceColumn(column)
    );
  }

  function getColumnWidthClass(column) {
    if (isDescriptionColumn(column)) {
      return "min-w-48 max-w-64"; // Minimum width with controlled maximum for descriptions
    } else if (isQuantityColumn(column)) {
      return "min-w-20"; // Minimum width, allows expansion for longer quantities
    } else if (isBalanceColumn(column)) {
      return "min-w-28"; // Minimum width, allows expansion for larger amounts
    }
    return "min-w-24"; // Default minimum width for other columns
  }

  function truncateText(text, maxLength = 30) {
    if (!text || typeof text !== "string") return text;
    return text.length > maxLength
      ? text.substring(0, maxLength) + "..."
      : text;
  }

  function isBalanceColumn(column) {
    const header = (column.header || "").toLowerCase();
    const key = (column.accessorKey || "").toLowerCase();
    return header.includes("saldo") || key === "col5" || key === "col7";
  }

  function getBalanceColumnType(column) {
    const header = (column.header || "").toLowerCase();
    const key = (column.accessorKey || "").toLowerCase();

    if (header.includes("bruto") || key === "col5") {
      return "gross"; // Saldo Bruto
    } else if (
      header.includes("líquido") ||
      header.includes("liquido") ||
      key === "col7"
    ) {
      return "net"; // Saldo Líquido
    }
    return null;
  }

  function getBalanceColumnStyling(balanceType) {
    if (balanceType === "gross") {
      return {
        cellClass: "bg-orange-950/20 border-l-2 border-l-orange-600/50",
        icon: null,
        iconClass: "",
        headerClass: "bg-orange-950/30 text-orange-200",
      };
    } else if (balanceType === "net") {
      return {
        cellClass: "bg-lime-950/20 border-l-2 border-l-lime-600/50",
        icon: null,
        iconClass: "",
        headerClass: "bg-lime-950/30 text-lime-200",
      };
    }
    return {
      cellClass: "",
      icon: null,
      iconClass: "",
      headerClass: "",
    };
  }

  function getQuantityColumnStyling() {
    return {
      cellClass: "bg-yellow-900/20 border-l-2 border-l-yellow-700/50",
      icon: null,
      iconClass: "",
      headerClass: "bg-yellow-900/30 text-yellow-300",
    };
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
  <div class="rounded-lg border border-border/50 overflow-hidden shadow-sm">
    <Table.Root class="w-full table-auto">
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
            {@const balanceType = getBalanceColumnType(column)}
            {@const balanceStyling = getBalanceColumnStyling(balanceType)}
            {@const quantityStyling = isQuantityColumn(column)
              ? getQuantityColumnStyling()
              : { headerClass: "", icon: null, iconClass: "" }}
            {@const styling = isQuantityColumn(column)
              ? quantityStyling
              : balanceStyling}
            {@const isMonetary = isMonetaryColumn(column)}
            {@const headerClasses = [
              getColumnWidthClass(column),
              styling.headerClass,
              isMonetary ? "text-left" : "",
            ]
              .filter(Boolean)
              .join(" ")}
            <Table.Head class={`${headerClasses} px-4 py-3`}>
              <div
                class="flex items-center space-x-3 {isMonetary
                  ? 'justify-end'
                  : ''}"
              >
                <button
                  class="flex items-center space-x-1 hover:text-foreground transition-colors font-medium"
                  onclick={() => handleSort(column.accessorKey)}
                >
                  <span>{@html renderHeader(column)}</span>
                  {#if styling.icon}
                    {@const IconComponent = styling.icon}
                    <IconComponent class={styling.iconClass} />
                  {/if}
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
          {@const isSelected = selectedRows.has(currentPage * pageSize + index)}
          {@const isEvenRow = index % 2 === 0}
          {@const rowClasses = [
            "transition-colors text-black",
            isSelected
              ? "bg-[#2b251e]"
              : isEvenRow
                ? "bg-gray-50"
                : "bg-gray-100",
            "hover:bg-blue-100",
          ].join(" ")}

          <Table.Row class={rowClasses}>
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
              {@const balanceType = getBalanceColumnType(column)}
              {@const balanceStyling = getBalanceColumnStyling(balanceType)}
              {@const quantityStyling = isQuantityColumn(column)
                ? getQuantityColumnStyling()
                : { cellClass: "" }}
              {@const styling = isQuantityColumn(column)
                ? quantityStyling
                : balanceStyling}
              {@const cellClasses = [
                getColumnWidthClass(column),
                styling.cellClass,
              ]
                .filter(Boolean)
                .join(" ")}

              <Table.Cell class={`${cellClasses} px-4 py-3`}>
                <div class="flex items-center space-x-3">
                  {#if isDescriptionColumn(column)}
                    {@const fullText = row[column.accessorKey]}
                    {@const truncatedText = truncateText(fullText, 30)}
                    {#if fullText && fullText.length > 30}
                      <Tooltip.Root>
                        <Tooltip.Trigger class="text-left cursor-help w-full">
                          <div class="truncate text-left max-w-full pr-2 text-black">
                            {truncatedText}
                          </div>
                        </Tooltip.Trigger>
                        <Tooltip.Content
                          side="top"
                          class="max-w-sm bg-popover text-popover-foreground border border-border shadow-md z-50 p-3"
                        >
                          <div class="text-sm leading-relaxed">
                            {fullText}
                          </div>
                        </Tooltip.Content>
                      </Tooltip.Root>
                    {:else}
                      <div class="truncate text-left max-w-full pr-2 text-black">
                        {@html renderCell(column, row)}
                      </div>
                    {/if}
                  {:else if isInvestmentCategoryColumn(column)}
                    <!-- Investment Category Column with Color Indicator -->
                    <div class="text-left whitespace-nowrap text-black">
                      <InvestmentCategoryIndicator
                        category={row[column.accessorKey]}
                        showBadge={true}
                        variant="outline"
                        size="sm"
                        dotSize="w-1.5 h-1.5"
                      />
                    </div>
                  {:else}
                    {@const isNumericColumn = isMonetaryColumn(column)}
                    <div
                      class={`${isNumericColumn ? "text-right font-mono" : "text-left"} whitespace-nowrap text-black`}
                    >
                      {@html renderCell(column, row)}
                    </div>
                  {/if}

                  <!-- Badge for first column if enabled -->
                  <!-- COMMENTED OUT: Badge removed from Quantidade column as requested -->
                  <!-- {#if colIndex === 0 && enableBadges}
                    {@const badge = getBadgeForRow(row)}
                    {#if badge}
                      <Badge
                        variant={badge.variant || "secondary"}
                        class="text-xs"
                      >
                        {badge.text}
                      </Badge>
                    {/if}
                  {/if} -->
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

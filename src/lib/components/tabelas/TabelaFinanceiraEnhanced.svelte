<script>
  import EnhancedDataTable from "$lib/components/ui/data-table/EnhancedDataTable.svelte";
  import { Badge } from "$lib/components/ui/badge/index.ts";
  import { toast } from "svelte-sonner";
  import { authShowToast } from "$lib/utils/toast.js";
  import { financialBadgeConfigs } from "$lib/utils/table-enhancements.js";

  let { data, mode = "relatorio", title = "Dados Financeiros" } = $props();

  // Geração dinâmica de colunas baseada na estrutura de dados
  let columns = $derived(generateColumns(data, mode));

  /**
   * Retorna as colunas excluídas para cada modo, seguindo exatamente o padrão do template HTML
   */
  function getExcludedColumns(mode) {
    switch (mode) {
      case "relatorio":
        return ["col0"];
      case "consolidado":
        // Para consolidado, não exclui nenhuma coluna - pega todas que têm nome
        return ["col0"]; // Apenas col0 que sempre é vazio
      case "movimentacoes":
        return [
          "col0",
          "col4",
          "col5",
          "col12",
          "col14",
          "col20",
          "col21",
          "col22",
          "col23",
          "col24",
          "col25",
          "col26",
          "col27",
          "col28",
          "col29",
          "col30",
          "col31",
          "col32",
          "col33",
          "col34",
          "col35",
        ];
      default:
        return ["col0"];
    }
  }

  /**
   * Gera colunas dinamicamente baseado na estrutura data.tables.tab0.lin0
   * Implementa a mesma lógica do template HTML com ordem personalizada
   */
  function generateColumns(data, mode) {
    // Verificar se temos a estrutura de dados necessária
    if (!data?.tables?.tab0?.lin0) return [];

    const headers = data.tables.tab0.lin0;
    const excludedColumns = getExcludedColumns(mode);

    // Filtrar colunas válidas
    const validColumns = Object.entries(headers)
      .filter(([key, value]) => value !== "" && !excludedColumns.includes(key))
      .map(([key, value]) => ({
        accessorKey: key,
        header: value,
      }));

    // Definir ordem desejada: Instituição Financeira, Ativo, Tipo Ativo, Descrição, Quantidade, Saldo Bruto, Saldo Líquido
    const desiredOrder = [
      "col1",
      "col2",
      "col6",
      "col3",
      "col4",
      "col5",
      "col7",
    ]; // Instituição Financeira, Ativo, Tipo Ativo, Descrição, Quantidade, Saldo Bruto, Saldo Líquido

    // Separar colunas por prioridade
    const priorityColumns = [];
    const remainingColumns = [];

    // Adicionar colunas na ordem desejada
    desiredOrder.forEach((colKey) => {
      const column = validColumns.find((col) => col.accessorKey === colKey);
      if (column) {
        priorityColumns.push(column);
      }
    });

    // Adicionar colunas restantes
    validColumns.forEach((column) => {
      if (!desiredOrder.includes(column.accessorKey)) {
        remainingColumns.push(column);
      }
    });

    // Retornar colunas na ordem: prioridade + restantes
    return [...priorityColumns, ...remainingColumns];
  }

  // Transformar dados para formato compatível com DataTable
  let tableData = $derived(transformDataForTable(data, mode));

  /**
   * Transforma dados seguindo exatamente a lógica do template HTML
   * Filtra colunas excluídas baseado no modo
   */
  function transformDataForTable(data, mode) {
    if (!data?.tables?.tab0) return [];

    const { tab0 } = data.tables;
    const excludedColumns = getExcludedColumns(mode);
    const rows = [];

    Object.keys(tab0).forEach((key) => {
      if (key !== "lin0") {
        const row = tab0[key];
        const filteredRow = Object.fromEntries(
          Object.entries(row).filter(
            ([colKey]) => !excludedColumns.includes(colKey)
          )
        );
        rows.push(filteredRow);
      }
    });

    return rows;
  }

  // Badge configuration for financial data using utilities
  const badgeConfig = $derived(
    financialBadgeConfigs[mode] || financialBadgeConfigs.consolidado
  );

  // Handle row selection
  function handleRowsSelected(selectedRows) {
    if (selectedRows.length > 0) {
      const totalValue = selectedRows.reduce((sum, row) => {
        const value = parseFloat(row.col5) || 0;
        return sum + value;
      }, 0);

      authShowToast.info(
        `${selectedRows.length} linha(s) selecionada(s) - Valor total: R$ ${totalValue.toLocaleString(
          "pt-BR",
          {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }
        )}`
      );
    }
  }
</script>

<div class="space-y-4 tabela-financeira-enhanced">
  <!-- Cabeçalho da Tabela -->
  <div class="flex items-center justify-between">
    <div>
      <h3 class="text-lg font-semibold">{title}</h3>
      {#if data?.carteira && data?.data_final}
        <p class="text-caption">
          Carteira: {data.carteira.replace("_", " ")} | Data: {data.data_final}
          {#if data?.total_geral}
            | R$ {data.total_geral}
          {/if}
        </p>
      {/if}
    </div>
  </div>

  <!-- Enhanced Data Table -->
  <EnhancedDataTable
    data={tableData}
    {columns}
    showPagination={true}
    enableRowSelection={true}
    enableColumnVisibility={true}
    enableBadges={mode === "consolidado"}
    {badgeConfig}
    {mode}
    onRowsSelected={handleRowsSelected}
  />
</div>

<style>
  .tabela-financeira-enhanced {
    /* Enhanced styling for the financial table */
    --table-border-radius: 0.5rem;
    --table-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1),
      0 1px 2px -1px rgb(0 0 0 / 0.1);
  }

  .tabela-financeira-enhanced :global(.table-container) {
    border-radius: var(--table-border-radius);
    box-shadow: var(--table-shadow);
  }

  /* Apple-style minimalism enhancements */
  .tabela-financeira-enhanced :global(.table-row:hover) {
    background-color: hsl(var(--muted) / 0.3);
    transition: background-color 0.15s ease-in-out;
  }

  .tabela-financeira-enhanced :global(.table-header) {
    background-color: hsl(var(--muted) / 0.1);
    border-bottom: 1px solid hsl(var(--border));
  }

  .tabela-financeira-enhanced :global(.badge) {
    font-weight: 500;
    letter-spacing: 0.025em;
  }
</style>

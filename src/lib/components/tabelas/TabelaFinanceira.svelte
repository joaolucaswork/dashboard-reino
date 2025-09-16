<script>
  import DataTable from "$lib/components/ui/data-table/DataTable.svelte";

  let { data, mode = "relatorio", title = "Dados Financeiros" } = $props();

  // Definições de colunas simples baseadas no modo
  let columns = $derived(getColumnsForMode(mode));

  function getColumnsForMode(mode) {
    switch (mode) {
      case "relatorio":
        return [
          { accessorKey: "col1", header: "Instituição Financeira" },
          { accessorKey: "col2", header: "Tipo de Ativo" },
          { accessorKey: "col3", header: "Ativo" },
          { accessorKey: "col4", header: "Quantidade" },
          { accessorKey: "col5", header: "Valor Atual (R$)" },
          { accessorKey: "col6", header: "% da Carteira" },
        ];

      case "consolidado":
        return [
          { accessorKey: "col2", header: "Ativo" },
          { accessorKey: "col3", header: "Quantidade" },
          { accessorKey: "col4", header: "Valor Atual (R$)" },
          { accessorKey: "col5", header: "% da Carteira" },
        ];

      case "movimentacoes":
        return [
          { accessorKey: "col1", header: "Data" },
          { accessorKey: "col2", header: "Instituição" },
          { accessorKey: "col3", header: "Ativo" },
          { accessorKey: "col6", header: "Operação" },
          { accessorKey: "col7", header: "Quantidade" },
          { accessorKey: "col8", header: "Preço (R$)" },
          { accessorKey: "col9", header: "Valor Total (R$)" },
        ];

      default:
        return [];
    }
  }

  // Transformar dados para formato compatível com DataTable
  let tableData = $derived(transformDataForTable(data, mode));

  function transformDataForTable(data, mode) {
    if (!data?.tables?.tab0) return [];

    const { tab0 } = data.tables;
    const rows = [];

    // Extrair todas as linhas exceto lin0 (cabeçalho)
    Object.keys(tab0).forEach((key) => {
      if (key !== "lin0") {
        rows.push(tab0[key]);
      }
    });

    return rows;
  }
</script>

<div class="space-y-4">
  <!-- Cabeçalho da Tabela -->
  <div class="flex items-center justify-between">
    <div>
      <h3 class="text-lg font-semibold">{title}</h3>
      {#if data?.carteira && data?.data_final}
        <p class="text-caption">
          Carteira: {data.carteira.replace("_", " ")} | Data: {data.data_final}
          {#if data?.total_geral}
            | Total: R$ {data.total_geral}
          {/if}
        </p>
      {/if}
    </div>
  </div>

  <!-- Data Table -->
  <DataTable
    data={tableData}
    {columns}
    searchKey={mode === "relatorio"
      ? "col1"
      : mode === "movimentacoes"
        ? "col3"
        : "col2"}
    searchPlaceholder={mode === "relatorio"
      ? "Filtrar por instituição..."
      : mode === "movimentacoes"
        ? "Filtrar por ativo..."
        : "Filtrar dados..."}
    showPagination={true}
  />
</div>

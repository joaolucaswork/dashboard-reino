<script>
  import DataTable from "$lib/components/ui/data-table/DataTable.svelte";

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

    // Extrair todas as linhas exceto lin0 (cabeçalho)
    // Implementa a mesma lógica do template HTML:
    // {% for key, row in data.tables.tab0.items() if key != 'lin0' %}
    Object.keys(tab0).forEach((key) => {
      if (key !== "lin0") {
        const row = tab0[key];

        // Filtrar colunas excluídas seguindo a lógica do template:
        // {% if col_key not in excluded_columns %}
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
</script>

<div class="space-y-4 tabela-financeira">
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

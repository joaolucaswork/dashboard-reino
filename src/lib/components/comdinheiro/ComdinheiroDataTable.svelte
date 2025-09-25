<script lang="ts">
  import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
  } from "$lib/components/ui/card";
  import { Badge } from "$lib/components/ui/badge";
  import { Button } from "$lib/components/ui/button";
  import { Table, Download, FileText } from "@lucide/svelte";

  export let data: any = null;
  export let format: string = "JSON";
  export let title: string = "Dados Comdinheiro";

  let processedData: any[] = [];
  let columns: string[] = [];
  let totalRows = 0;

  // Processar dados quando mudarem
  $: if (data) {
    processData(data, format);
  }

  function processData(rawData: any, dataFormat: string) {
    try {
      if (dataFormat.includes("JSON")) {
        processJSONData(rawData);
      } else {
        // Para XML, mostrar como texto
        processedData = [
          {
            content:
              typeof rawData === "string" ? rawData : JSON.stringify(rawData),
          },
        ];
        columns = ["content"];
        totalRows = 1;
      }
    } catch (error) {
      console.error("Erro ao processar dados:", error);
      processedData = [];
      columns = [];
      totalRows = 0;
    }
  }

  function processJSONData(jsonData: any) {
    if (!jsonData) {
      processedData = [];
      columns = [];
      totalRows = 0;
      return;
    }

    // Verificar se é uma estrutura de tabela do Comdinheiro
    if (jsonData.tables && jsonData.tables.tab0) {
      processComdinheiroTable(jsonData.tables.tab0);
    } else if (Array.isArray(jsonData)) {
      processArrayData(jsonData);
    } else if (typeof jsonData === "object") {
      processObjectData(jsonData);
    } else {
      // Dados simples
      processedData = [{ value: jsonData }];
      columns = ["value"];
      totalRows = 1;
    }
  }

  function processComdinheiroTable(tableData: any) {
    const rows: any[] = [];
    let headers: string[] = [];

    // Extrair cabeçalho (lin0)
    if (tableData.lin0) {
      headers = Object.values(tableData.lin0) as string[];
      columns = headers;
    }

    // Extrair dados das linhas
    Object.keys(tableData).forEach((key) => {
      if (key !== "lin0") {
        const row = tableData[key];
        const processedRow: any = {};

        Object.keys(row).forEach((colKey, index) => {
          const columnName = headers[index] || colKey;
          processedRow[columnName] = row[colKey];
        });

        rows.push(processedRow);
      }
    });

    processedData = rows;
    totalRows = rows.length;
  }

  function processArrayData(arrayData: any[]) {
    if (arrayData.length === 0) {
      processedData = [];
      columns = [];
      totalRows = 0;
      return;
    }

    // Usar as chaves do primeiro objeto como colunas
    const firstItem = arrayData[0];
    if (typeof firstItem === "object" && firstItem !== null) {
      columns = Object.keys(firstItem);
      processedData = arrayData;
    } else {
      // Array de valores simples
      columns = ["value"];
      processedData = arrayData.map((item) => ({ value: item }));
    }

    totalRows = arrayData.length;
  }

  function processObjectData(objectData: any) {
    // Converter objeto em array de chave-valor
    const entries = Object.entries(objectData);
    columns = ["key", "value"];
    processedData = entries.map(([key, value]) => ({
      key,
      value: typeof value === "object" ? JSON.stringify(value) : value,
    }));
    totalRows = entries.length;
  }

  function exportToCSV() {
    if (processedData.length === 0) return;

    const csvContent = [
      columns.join(","),
      ...processedData.map((row) =>
        columns
          .map((col) => {
            const value = row[col] || "";
            // Escapar aspas e adicionar aspas se necessário
            const stringValue = String(value);
            if (
              stringValue.includes(",") ||
              stringValue.includes('"') ||
              stringValue.includes("\n")
            ) {
              return `"${stringValue.replace(/"/g, '""')}"`;
            }
            return stringValue;
          })
          .join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `comdinheiro_data_${Date.now()}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  function formatValue(value: any, columnName?: string): string {
    if (value === null || value === undefined) return "";

    // Detectar colunas de moeda baseado no nome da coluna
    const isCurrencyColumn =
      columnName &&
      (columnName.toLowerCase().includes("saldo") ||
        columnName.toLowerCase().includes("valor") ||
        columnName.toLowerCase().includes("bruto") ||
        columnName.toLowerCase().includes("líquido") ||
        columnName.toLowerCase().includes("liquido"));

    if (typeof value === "number") {
      if (isCurrencyColumn) {
        // Usar formatação de moeda brasileira com símbolo R$ (sem espaço)
        const formatted = new Intl.NumberFormat("pt-BR", {
          style: "currency",
          currency: "BRL",
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }).format(value);
        return formatted.replace("R$ ", "R$");
      } else if (value > 1000) {
        // Formatar números grandes com separadores brasileiros
        return value.toLocaleString("pt-BR", { minimumFractionDigits: 2 });
      }
    }

    // Para strings que representam números em colunas de moeda
    if (
      isCurrencyColumn &&
      typeof value === "string" &&
      value !== "" &&
      !isNaN(parseFloat(value))
    ) {
      const numericValue = parseFloat(value);
      const formatted = new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(numericValue);
      return formatted.replace("R$ ", "R$");
    }

    return String(value);
  }
</script>

{#if data}
  <Card>
    <CardHeader>
      <div class="flex items-center justify-between">
        <CardTitle class="flex items-center gap-2">
          <Table size={20} />
          {title}
        </CardTitle>
        <div class="flex items-center gap-2">
          <Badge variant="secondary">
            {totalRows}
            {totalRows === 1 ? "registro" : "registros"}
          </Badge>
          <Badge variant="outline">
            {format}
          </Badge>
          {#if processedData.length > 0}
            <Button variant="outline" size="sm" onclick={exportToCSV}>
              <Download size={14} class="mr-1" />
              CSV
            </Button>
          {/if}
        </div>
      </div>
    </CardHeader>
    <CardContent>
      {#if processedData.length > 0}
        <div class="overflow-x-auto">
          <table class="w-full table-auto border-collapse border border-border">
            <thead>
              <tr class="bg-muted">
                {#each columns as column}
                  <th class="border border-border p-2 text-left font-medium">
                    {column}
                  </th>
                {/each}
              </tr>
            </thead>
            <tbody>
              {#each processedData as row, index}
                {@const isEvenRow = index % 2 === 0}
                {@const rowClasses = [
                  "transition-colors",
                  isEvenRow ? "bg-background" : "bg-muted/50",
                  "hover:bg-[#2b251e]",
                ].join(" ")}

                <tr class={rowClasses}>
                  {#each columns as column}
                    <td class="border border-border p-2 text-sm">
                      {formatValue(row[column], column)}
                    </td>
                  {/each}
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      {:else}
        <div
          class="flex items-center justify-center py-8 text-muted-foreground"
        >
          <div class="text-center">
            <FileText size={48} class="mx-auto mb-2 opacity-50" />
            <p>Nenhum dado para exibir</p>
          </div>
        </div>
      {/if}
    </CardContent>
  </Card>
{:else}
  <Card>
    <CardContent class="py-8">
      <div class="flex items-center justify-center text-muted-foreground">
        <div class="text-center">
          <Table size={48} class="mx-auto mb-2 opacity-50" />
          <p>Execute uma consulta para visualizar os dados</p>
        </div>
      </div>
    </CardContent>
  </Card>
{/if}

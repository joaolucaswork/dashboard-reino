<!--
  TabelaConsolidadaCurrency.svelte
  
  Enhanced table component for "Posição Consolidada" with comprehensive currency handling.
  This demonstrates how to integrate the currency utilities with the consolidated view.
  
  Key Features:
  - Brazilian Real (R$) formatting
  - Comprehensive portfolio calculations
  - Currency validation and parsing
  - Integration with existing shadcn-svelte components
-->
<script>
  import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
  } from "$lib/components/ui/card";
  import { Badge } from "$lib/components/ui/badge";
  import { Button } from "$lib/components/ui/button";
  import { formatCurrency } from "$lib/components/ui/data-table/index.js";

  // Import our new currency utilities
  // Note: These imports may need adjustment based on the final TypeScript configuration
  // import * as currency from '$lib/utils/currency.js';
  // import { formatValue, createValue } from '$lib/utils/currency-store.js';

  /**
   * @typedef {Object} PortfolioData
   * @property {Object} agrupados - Grouped portfolio data by bank
   * @property {Object} totais - Total values
   */

  /** @type {PortfolioData} */
  export let data = null;

  // Reactive calculations for portfolio summary
  $: portfolioSummary = calculatePortfolioSummary(data);
  $: formattedTotals = formatPortfolioTotals(portfolioSummary);

  /**
   * Calculate portfolio summary from grouped data
   * @param {PortfolioData} data - Portfolio data
   * @returns {Object} Portfolio summary with totals
   */
  function calculatePortfolioSummary(data) {
    if (!data?.agrupados) {
      return {
        totalValue: 0,
        bankCount: 0,
        assetCount: 0,
        bankTotals: {},
        topAssets: [],
      };
    }

    let totalValue = 0;
    let assetCount = 0;
    const bankTotals = {};
    const allAssets = [];

    // Process each bank's data
    for (const [bankName, assets] of Object.entries(data.agrupados)) {
      let bankTotal = 0;

      if (Array.isArray(assets)) {
        // Handle array format
        for (const asset of assets) {
          const value = parseFloat(asset.valor || asset.saldo || 0);
          if (!isNaN(value)) {
            bankTotal += value;
            assetCount++;
            allAssets.push({
              bank: bankName,
              name: asset.nome || asset.ativo || "Sem nome",
              value: value,
            });
          }
        }
      } else if (typeof assets === "object") {
        // Handle object format
        for (const assetId of Object.keys(assets)) {
          const asset = assets[assetId];
          const value = parseFloat(asset.valor || asset.saldo || 0);
          if (!isNaN(value)) {
            bankTotal += value;
            assetCount++;
            allAssets.push({
              bank: bankName,
              name: asset.nome || asset.ativo || "Sem nome",
              value: value,
            });
          }
        }
      }

      bankTotals[bankName] = bankTotal;
      totalValue += bankTotal;
    }

    // Get top 5 assets by value
    const topAssets = allAssets.sort((a, b) => b.value - a.value).slice(0, 5);

    return {
      totalValue,
      bankCount: Object.keys(data.agrupados).length,
      assetCount,
      bankTotals,
      topAssets,
    };
  }

  /**
   * Format portfolio totals using Brazilian currency format
   * @param {Object} summary - Portfolio summary
   * @returns {Object} Formatted totals
   */
  function formatPortfolioTotals(summary) {
    return {
      totalValue: formatBrazilianCurrency(summary.totalValue),
      bankTotals: Object.fromEntries(
        Object.entries(summary.bankTotals).map(([bank, total]) => [
          bank,
          formatBrazilianCurrency(total),
        ])
      ),
      topAssets: summary.topAssets.map((asset) => ({
        ...asset,
        formattedValue: formatBrazilianCurrency(asset.value),
      })),
    };
  }

  /**
   * Format currency value in Brazilian Real format
   * @param {number} value - Numeric value
   * @returns {string} Formatted currency string (R$ 1.234.567,89)
   */
  function formatBrazilianCurrency(value) {
    if (typeof value !== "number" || isNaN(value)) {
      return "R$ 0,00";
    }

    // Use the existing formatCurrency function as fallback
    // In production, we would use our currency module:
    // return currency.format(value, { includeSymbol: true, decimalPlaces: 2 });

    try {
      return formatCurrency(value, "BRL");
    } catch {
      // Fallback to manual formatting
      return (
        "R$ " +
        value.toLocaleString("pt-BR", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })
      );
    }
  }

  /**
   * Get badge variant based on bank performance
   * @param {string} bankName - Bank name
   * @param {number} bankTotal - Bank total value
   * @returns {"default" | "destructive" | "outline" | "secondary"} Badge variant
   */
  function getBankBadgeVariant(bankName, bankTotal) {
    if (bankTotal > 100000) return "default";
    if (bankTotal > 50000) return "secondary";
    return "outline";
  }

  /**
   * Export portfolio data to CSV
   */
  function exportToCSV() {
    if (!data?.agrupados) return;

    const rows = [];
    rows.push(["Banco", "Ativo", "Valor", "Valor Formatado"]);

    for (const [bankName, assets] of Object.entries(data.agrupados)) {
      if (Array.isArray(assets)) {
        for (const asset of assets) {
          const value = parseFloat(asset.valor || asset.saldo || 0);
          rows.push([
            bankName,
            asset.nome || asset.ativo || "Sem nome",
            value,
            formatBrazilianCurrency(value),
          ]);
        }
      }
    }

    const csvContent = rows.map((row) => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "posicao-consolidada.csv";
    link.click();
  }
</script>

<div class="space-y-6">
  <!-- Portfolio Summary Card -->
  <Card>
    <CardHeader>
      <CardTitle class="flex items-center justify-between">
        <span>Posição Consolidada</span>
        <Button variant="outline" size="sm" on:click={exportToCSV}>
          Exportar CSV
        </Button>
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="text-center">
          <p class="text-2xl font-bold text-green-600">
            {formattedTotals.totalValue}
          </p>
          <p class="text-sm text-muted-foreground">Valor Total</p>
        </div>
        <div class="text-center">
          <p class="text-2xl font-bold">
            {portfolioSummary.bankCount}
          </p>
          <p class="text-sm text-muted-foreground">Instituições</p>
        </div>
        <div class="text-center">
          <p class="text-2xl font-bold">
            {portfolioSummary.assetCount}
          </p>
          <p class="text-sm text-muted-foreground">Ativos</p>
        </div>
      </div>
    </CardContent>
  </Card>

  <!-- Bank Totals -->
  <Card>
    <CardHeader>
      <CardTitle>Totais por Instituição</CardTitle>
    </CardHeader>
    <CardContent>
      <div class="space-y-3">
        {#each Object.entries(formattedTotals.bankTotals) as [bankName, total]}
          <div class="flex items-center justify-between p-3 border rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
            <div class="flex items-center space-x-3">
              <Badge
                variant={getBankBadgeVariant(
                  bankName,
                  portfolioSummary.bankTotals[bankName]
                )}
              >
                {bankName}
              </Badge>
            </div>
            <div class="font-semibold">
              {total}
            </div>
          </div>
        {/each}
      </div>
    </CardContent>
  </Card>

  <!-- Top Assets -->
  {#if formattedTotals.topAssets.length > 0}
    <Card>
      <CardHeader>
        <CardTitle>Maiores Posições</CardTitle>
      </CardHeader>
      <CardContent>
        <div class="space-y-3">
          {#each formattedTotals.topAssets as asset, index}
            <div
              class="flex items-center justify-between p-3 border rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <div class="flex items-center space-x-3">
                <Badge variant="outline" class="text-xs">
                  #{index + 1}
                </Badge>
                <div>
                  <p class="font-medium">{asset.name}</p>
                  <p class="text-sm text-muted-foreground">{asset.bank}</p>
                </div>
              </div>
              <div class="font-semibold">
                {asset.formattedValue}
              </div>
            </div>
          {/each}
        </div>
      </CardContent>
    </Card>
  {/if}

  <!-- Detailed Holdings Table -->
  {#if data?.agrupados}
    <Card>
      <CardHeader>
        <CardTitle>Detalhamento por Ativo</CardTitle>
      </CardHeader>
      <CardContent>
        <div class="space-y-4">
          {#each Object.entries(data.agrupados) as [bankName, assets]}
            <div>
              <h4 class="font-semibold mb-2 flex items-center space-x-2">
                <span>{bankName}</span>
                <Badge variant="secondary">
                  {formattedTotals.bankTotals[bankName]}
                </Badge>
              </h4>

              <div class="border rounded-lg overflow-hidden">
                <div
                  class="bg-muted/50 px-4 py-2 grid grid-cols-3 font-medium text-sm"
                >
                  <div>Ativo</div>
                  <div>Quantidade</div>
                  <div class="text-right">Valor</div>
                </div>

                {#if Array.isArray(assets)}
                  {#each assets as asset}
                    <div class="px-4 py-3 border-t grid grid-cols-3 text-sm bg-blue-50 hover:bg-blue-100 transition-colors">
                      <div class="font-medium">
                        {asset.nome || asset.ativo || "Sem nome"}
                      </div>
                      <div class="text-muted-foreground">
                        {asset.quantidade || "-"}
                      </div>
                      <div class="text-right font-semibold">
                        {formatBrazilianCurrency(
                          parseFloat(asset.valor || asset.saldo || 0)
                        )}
                      </div>
                    </div>
                  {/each}
                {:else if typeof assets === "object"}
                  {#each Object.values(assets) as asset}
                    <div class="px-4 py-3 border-t grid grid-cols-3 text-sm bg-blue-50 hover:bg-blue-100 transition-colors">
                      <div class="font-medium">
                        {asset.nome || asset.ativo || "Sem nome"}
                      </div>
                      <div class="text-muted-foreground">
                        {asset.quantidade || "-"}
                      </div>
                      <div class="text-right font-semibold">
                        {formatBrazilianCurrency(
                          parseFloat(asset.valor || asset.saldo || 0)
                        )}
                      </div>
                    </div>
                  {/each}
                {/if}
              </div>
            </div>
          {/each}
        </div>
      </CardContent>
    </Card>
  {/if}
</div>

<!-- No additional styles needed - using Tailwind CSS classes -->

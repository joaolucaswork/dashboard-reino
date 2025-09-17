<script>
  import { modoVisualizacao, dadosConsulta } from "$lib/stores/tabelas.js";

  import FormularioConsulta from "$lib/components/tabelas/FormularioConsulta.svelte";
  import TabelaRelatorio from "$lib/components/tabelas/TabelaRelatorio.svelte";
  import TabelaConsolidada from "$lib/components/tabelas/TabelaConsolidada.svelte";
  import TabelaMovimentacoes from "$lib/components/tabelas/TabelaMovimentacoes.svelte";

  import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
  } from "$lib/components/ui/card";
  import { FileText } from "@lucide/svelte";
</script>

<svelte:head>
  <title>Tabelas e Relatórios - Reino Capital</title>
  <meta
    name="description"
    content="Sistema de consulta de tabelas e relatórios financeiros"
  />
</svelte:head>

<div class="space-y-8">
  <!-- Status messages are now handled by toast notifications -->

  <!-- Formulário de Consulta -->
  <Card class="mb-8">
    <CardContent class="pt-1 px-0">
      <FormularioConsulta />
    </CardContent>
  </Card>

  <!-- Área de Resultados -->
  {#if $dadosConsulta}
    <!-- Renderizar componente baseado no modo de visualização -->
    {#if $modoVisualizacao === "relatorio"}
      <TabelaRelatorio data={$dadosConsulta} />
    {:else if $modoVisualizacao === "consolidado"}
      <TabelaConsolidada data={$dadosConsulta} />
    {:else if $modoVisualizacao === "movimentacoes"}
      <TabelaMovimentacoes data={$dadosConsulta} />
    {:else if $modoVisualizacao === "analise"}
      <!-- Placeholder para análises - será implementado posteriormente -->
      <Card>
        <CardHeader>
          <CardTitle class="text-lg font-semibold">
            Análises Financeiras
          </CardTitle>
        </CardHeader>
        <CardContent class="px-0">
          <div class="text-center py-12 px-6">
            <FileText size={48} class="mx-auto text-muted-foreground mb-4" />
            <h3 class="text-lg font-semibold mb-2">Em Desenvolvimento</h3>
            <p class="text-body max-w-md mx-auto">
              Os gráficos e análises serão implementados em breve.
            </p>
          </div>
        </CardContent>
      </Card>
    {:else if $modoVisualizacao === "asset_allocation"}
      <!-- Placeholder para asset allocation - será implementado posteriormente -->
      <Card>
        <CardHeader>
          <CardTitle class="text-lg font-semibold">Asset Allocation</CardTitle>
        </CardHeader>
        <CardContent class="px-0">
          <div class="text-center py-12 px-6">
            <FileText size={48} class="mx-auto text-muted-foreground mb-4" />
            <h3 class="text-lg font-semibold mb-2">Em Desenvolvimento</h3>
            <p class="text-body max-w-md mx-auto">
              A análise de alocação de ativos será implementada em breve.
            </p>
          </div>
        </CardContent>
      </Card>
    {/if}
  {:else}
    <!-- Estado inicial - removido o placeholder conforme solicitado -->
  {/if}
</div>

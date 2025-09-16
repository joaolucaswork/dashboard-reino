<script>
  import {
    modoVisualizacao,
    camposVisiveis,
    formularioValido,
    consultarDados,
    loadingState,
  } from "$lib/stores/tabelas.js";

  import SeletorCarteira from "./SeletorCarteira.svelte";
  import SeletorData from "./SeletorData.svelte";
  import SeletorOpcoes from "./SeletorOpcoes.svelte";

  import { Button } from "$lib/components/ui/button";
  import { Label } from "$lib/components/ui/label";
  import { RadioGroup, RadioGroupItem } from "$lib/components/ui/radio-group";
  import * as Tooltip from "$lib/components/ui/tooltip";
  import {
    FileText,
    ChartBar,
    ArrowRightLeft,
    TrendingUp,
    Target,
  } from "@lucide/svelte";

  // Opções de modo de visualização
  const modos = [
    {
      value: "relatorio",
      label: "Relatório",
      description: "Dados agrupados por instituição financeira",
      icon: FileText,
    },
    {
      value: "consolidado",
      label: "Posição Consolidada",
      description: "Visão hierárquica por banco, categoria e tipo",
      icon: ChartBar,
    },
    {
      value: "movimentacoes",
      label: "Movimentações",
      description: "Histórico de transações e operações",
      icon: ArrowRightLeft,
    },
    {
      value: "analise",
      label: "Análises",
      description: "Gráficos de performance e comparativos",
      icon: TrendingUp,
    },
    {
      value: "asset_allocation",
      label: "Asset Allocation",
      description: "Distribuição e rebalanceamento de ativos",
      icon: Target,
    },
  ];

  // Função para submeter o formulário
  async function handleSubmit() {
    if (!$formularioValido) return;

    try {
      await consultarDados();
    } catch (error) {
      console.error("Erro ao consultar dados:", error);
    }
  }
</script>

<form on:submit|preventDefault={handleSubmit} class="space-y-8">
  <!-- Seleção do Modo de Visualização -->
  <div class="space-y-4">
    <RadioGroup bind:value={$modoVisualizacao} class="flex flex-wrap gap-4">
      {#each modos as modo}
        {@const Icon = modo.icon}
        <div class="relative">
          <RadioGroupItem
            value={modo.value}
            id={modo.value}
            class="peer sr-only"
          />
          <div class="relative">
            <Label
              for={modo.value}
              class="flex items-center justify-start p-4 h-12 w-fit rounded-lg border-transparent cursor-pointer hover:bg-accent transition-all duration-200 {$modoVisualizacao ===
              modo.value
                ? 'bg-accent/80 border-border'
                : $modoVisualizacao && $modoVisualizacao !== modo.value
                  ? 'opacity-40'
                  : ''}"
            >
              <Icon
                size={18}
                class="mr-3 flex-shrink-0 transition-colors duration-200 {$modoVisualizacao ===
                modo.value
                  ? 'text-primary'
                  : $modoVisualizacao && $modoVisualizacao !== modo.value
                    ? 'text-white/60'
                    : 'text-primary'}"
              />
              <span
                class="font-medium text-sm text-left leading-tight whitespace-nowrap transition-colors duration-200 {$modoVisualizacao &&
                $modoVisualizacao !== modo.value
                  ? 'text-white/60'
                  : 'text-foreground'}"
              >
                {modo.label}
              </span>
              <!-- Tooltip trigger as separate element -->
              <Tooltip.Root>
                <Tooltip.Trigger
                  class="ml-2 p-1 rounded-full opacity-60 hover:opacity-100 transition-opacity"
                  aria-label="More information about {modo.label}"
                >
                  <div
                    class="w-3 h-3 rounded-full border border-current flex items-center justify-center text-xs"
                  >
                    ?
                  </div>
                </Tooltip.Trigger>
                <Tooltip.Content
                  side="top"
                  align="center"
                  sideOffset={8}
                  class="bg-accent text-accent-foreground font-medium text-sm max-w-xs text-center"
                >
                  {modo.description}
                </Tooltip.Content>
              </Tooltip.Root>
            </Label>
          </div>
        </div>
      {/each}
    </RadioGroup>
  </div>

  <!-- Seletor de Carteira -->
  <div class="space-y-4">
    <SeletorCarteira />
  </div>

  <!-- Campos de Data -->
  <div class="space-y-4">
    <SeletorData />
  </div>

  <!-- Opções Condicionais -->
  {#if $camposVisiveis.banco || $camposVisiveis.operacao || $camposVisiveis.perfil}
    <div class="space-y-4">
      <Label class="text-label">Opções Adicionais</Label>
      <SeletorOpcoes />
    </div>
  {/if}

  <!-- Botão de Consulta -->
  <div class="flex justify-center pt-6">
    <Button
      type="submit"
      disabled={!$formularioValido || $loadingState}
      class="px-8 py-2 min-w-[200px]"
    >
      {#if $loadingState}
        <div class="flex items-center gap-2">
          <div
            class="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent"
          ></div>
          Consultando...
        </div>
      {:else}
        Consultar Dados
      {/if}
    </Button>
  </div>
</form>

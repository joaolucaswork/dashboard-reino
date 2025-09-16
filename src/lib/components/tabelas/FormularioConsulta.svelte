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
  import { Card, CardContent } from "$lib/components/ui/card";
  import {
    FileText,
    BarChart3,
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
      icon: BarChart3,
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
    <Label class="text-label">Tipo de Visualização</Label>

    <RadioGroup
      bind:value={$modoVisualizacao}
      class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
    >
      {#each modos as modo}
        {@const Icon = modo.icon}
        <div class="relative">
          <RadioGroupItem
            value={modo.value}
            id={modo.value}
            class="peer sr-only"
          />
          <Label
            for={modo.value}
            class="flex flex-col p-6 rounded-lg border cursor-pointer hover:bg-accent peer-checked:border-primary peer-checked:bg-accent"
          >
            <div class="flex items-center gap-3 mb-3">
              <Icon size={18} class="text-primary" />
              <span class="font-medium">
                {modo.label}
              </span>
            </div>
            <span class="text-caption text-left">
              {modo.description}
            </span>
          </Label>
        </div>
      {/each}
    </RadioGroup>
  </div>

  <!-- Seletor de Carteira -->
  <div class="space-y-4">
    <Label class="text-label">Carteira</Label>
    <SeletorCarteira />
  </div>

  <!-- Campos de Data -->
  <div class="space-y-4">
    <Label class="text-label">Período de Consulta</Label>
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

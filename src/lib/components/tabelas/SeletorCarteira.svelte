<script lang="ts">
  import { onMount } from "svelte";
  import { carteiraAtual } from "$lib/stores/tabelas.js";
  import {
    carteirasDetalhadas,
    buscarCarteirasConfig,
    carregandoCarteiras,
    erroCarteiras,
    atualizarCarteiras,
  } from "$lib/stores/carteiras.js";
  import { appConfig } from "$lib/stores/config.js";

  import { Combobox } from "$lib/components/ui/combobox";
  import { Button } from "$lib/components/ui/button";
  import { RefreshCw } from "@lucide/svelte";
  import { toast } from "svelte-sonner";
  import { derived } from "svelte/store";

  // Props para carteiras externas (ex: Salesforce)
  export let carteirasExternas: any[] = [];
  export let usarCarteirasExternas = false;

  // Transformar carteiras detalhadas em opções simples
  const carteiraOptions = derived(carteirasDetalhadas, ($carteiras) => {
    // Se deve usar carteiras externas, usar elas em vez das do store
    const carteirasParaUsar = usarCarteirasExternas
      ? carteirasExternas
      : $carteiras;
    const result = carteirasParaUsar.map((carteira) => {
      return {
        value: carteira.nome,
        label: carteira.nome,
        description: `${formatarMoeda(carteira.patrimonio)}`,
      };
    });

    return result;
  });

  // Função para formatar valores monetários
  function formatarMoeda(valor: number): string {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(valor);
  }

  // Carregar carteiras ao montar o componente
  onMount(async () => {
    const result = await buscarCarteirasConfig();
    if (!result.success) {
      toast.error("Erro ao carregar carteiras", {
        description: result.error,
      });
    } else if ($carteirasDetalhadas.length > 0) {
      toast.success(
        `${$carteirasDetalhadas.length} carteiras carregadas do Salesforce`
      );
    }
  });

  // Função para atualizar carteiras
  async function handleAtualizarCarteiras() {
    const result = await atualizarCarteiras($appConfig.fonteCarteiras);
    if (result.success) {
      toast.success("Carteiras atualizadas com sucesso");
    } else {
      toast.error("Erro ao atualizar carteiras", {
        description: result.error,
      });
    }
  }
</script>

<!-- Seletor de carteira simplificado -->
<div class="space-y-3">
  <div class="flex items-center justify-between">
    <div class="text-label">Selecionar Carteira</div>

    <!-- Botão de atualizar -->
    <Button
      variant="outline"
      size="sm"
      onclick={handleAtualizarCarteiras}
      disabled={$carregandoCarteiras}
      class="h-6 w-6 p-0"
    >
      <RefreshCw class="h-3 w-3 {$carregandoCarteiras ? 'animate-spin' : ''}" />
    </Button>
  </div>

  <Combobox
    bind:value={$carteiraAtual}
    options={$carteiraOptions}
    placeholder={$carregandoCarteiras
      ? "Carregando carteiras..."
      : "Selecione uma carteira"}
    searchPlaceholder="Buscar carteira..."
    emptyMessage={$erroCarteiras
      ? $erroCarteiras
      : "Nenhuma carteira encontrada."}
    disabled={$carregandoCarteiras}
  />

  <!-- Mensagem de erro -->
  {#if $erroCarteiras}
    <div class="text-sm text-destructive">
      {$erroCarteiras}
    </div>
  {/if}

  <!-- Status de carregamento -->
  {#if $carregandoCarteiras}
    <div class="text-sm text-muted-foreground">Carregando carteiras...</div>
  {/if}
</div>

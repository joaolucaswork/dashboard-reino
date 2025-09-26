<script lang="ts">
  import { onMount } from "svelte";
  import {
    carteiraAtual,
    carteiraComdinheiroAtual,
  } from "$lib/stores/tabelas.js";
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
  import * as Tooltip from "$lib/components/ui/tooltip";

  // Props para carteiras externas (ex: Salesforce)
  export let carteirasExternas: any[] = [];
  export let usarCarteirasExternas = false;
  export let disabled = false;

  // Conteúdo do tooltip baseado no estado atual
  let tooltipContent: string = "";

  $: {
    const fonte = usarCarteirasExternas
      ? "Salesforce CRM"
      : "Banco de dados local";
    const totalCarteiras = usarCarteirasExternas
      ? carteirasExternas.length
      : $carteirasDetalhadas.length;
    const carteirasAgrupadas = carteiraOptions.length;

    tooltipContent = `Fonte: ${fonte} • ${totalCarteiras} → ${carteirasAgrupadas} agrupadas`;
  }

  // Transformar carteiras detalhadas em opções agrupadas por usuário - usando reactive statement para reagir às props
  let carteiraOptions: Array<{
    value: string;
    label: string;
    description: string;
    nomeComdinheiro: string | null;
  }> = [];

  // Função para agrupar carteiras por usuário
  function agruparCarteirasPorUsuario(carteiras: any[]) {
    const gruposDeUsuario = new Map<
      string,
      {
        nome: string;
        bancos: string[];
        patrimonioTotal: number;
        nomeComdinheiro: string | null;
      }
    >();

    // Agrupar carteiras por nome de usuário
    carteiras.forEach((carteira) => {
      const nomeUsuario = carteira.nome;
      const banco = carteira.banco?.trim() || "Banco não informado";
      const patrimonio = Number(carteira.patrimonio) || 0;

      if (gruposDeUsuario.has(nomeUsuario)) {
        const grupo = gruposDeUsuario.get(nomeUsuario)!;
        // Adicionar banco se não estiver já na lista
        if (!grupo.bancos.includes(banco)) {
          grupo.bancos.push(banco);
        }
        // Somar patrimônio
        grupo.patrimonioTotal += patrimonio;
      } else {
        gruposDeUsuario.set(nomeUsuario, {
          nome: nomeUsuario,
          bancos: [banco],
          patrimonioTotal: patrimonio,
          nomeComdinheiro: carteira.nome_comdinheiro,
        });
      }
    });

    // Converter para array de opções e ordenar por patrimônio total (maior primeiro)
    return Array.from(gruposDeUsuario.values())
      .sort((a, b) => b.patrimonioTotal - a.patrimonioTotal)
      .map((grupo) => {
        const descricaoBancos =
          grupo.bancos.length === 1
            ? grupo.bancos[0]
            : `${grupo.bancos.length} bancos: ${grupo.bancos.join(", ")}`;

        return {
          value: grupo.nome, // Nome do usuário para seleção
          label: grupo.nome, // Nome do usuário mostrado
          description: `${formatarMoeda(grupo.patrimonioTotal)} • ${descricaoBancos}`,
          nomeComdinheiro: grupo.nomeComdinheiro,
        };
      });
  }

  // Reactive statement que atualiza as opções quando qualquer dependência muda
  $: {
    // Se deve usar carteiras externas, usar elas em vez das do store
    const carteirasParaUsar = usarCarteirasExternas
      ? carteirasExternas
      : $carteirasDetalhadas;

    carteiraOptions = agruparCarteirasPorUsuario(carteirasParaUsar);

    console.log("🔄 carteiraOptions atualizadas:", {
      usarCarteirasExternas,
      carteirasExternas: carteirasExternas.length,
      carteirasDetalhadas: $carteirasDetalhadas.length,
      opcoes: carteiraOptions.length,
    });
  }

  // Reactive statement para atualizar o nome técnico quando a carteira muda
  $: if ($carteiraAtual) {
    // Encontrar a carteira selecionada para obter o nome técnico
    const carteiraSelecionada = carteiraOptions.find(
      (option: { value: string; nomeComdinheiro: string | null }) =>
        option.value === $carteiraAtual
    );

    // Atualizar a store do nome técnico
    const nomeComdinheiro =
      carteiraSelecionada?.nomeComdinheiro || $carteiraAtual;
    carteiraComdinheiroAtual.set(nomeComdinheiro);

    console.log("🎯 Carteira selecionada:", {
      nomeExibicao: $carteiraAtual,
      nomeComdinheiro,
    });
  }

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
    console.log("🚀 Iniciando carregamento automático de carteiras...");

    // Verificar se já existem carteiras carregadas
    if ($carteirasDetalhadas.length > 0) {
      console.log("✅ Carteiras já carregadas:", $carteirasDetalhadas.length);
      return;
    }

    try {
      const result = await buscarCarteirasConfig();
      console.log("📊 Resultado do carregamento:", result);

      if (!result.success) {
        console.error("❌ Erro ao carregar carteiras:", result.error);
        toast.error("Erro ao carregar carteiras", {
          description: result.error,
        });
      } else {
        console.log("✅ Carteiras carregadas com sucesso:", {
          total: result.carteiras?.length || 0,
          detalhadas: $carteirasDetalhadas.length,
          source: result.source,
        });
      }
    } catch (error) {
      console.error("❌ Erro inesperado ao carregar carteiras:", error);
      toast.error("Erro inesperado ao carregar carteiras");
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
    <div class="flex items-center gap-2">
      <div class="text-label">Selecionar Carteira</div>

      <!-- Tooltip com informações sobre fonte e classificação -->
      <Tooltip.Root>
        <Tooltip.Trigger
          class="p-1 rounded-full opacity-60 hover:opacity-100 transition-opacity"
          aria-label="Informações sobre fonte de dados e classificação das carteiras"
        >
          <div
            class="w-4 h-4 rounded-full border border-current flex items-center justify-center text-xs text-muted-foreground"
          >
            ?
          </div>
        </Tooltip.Trigger>
        <Tooltip.Content
          side="top"
          align="start"
          sideOffset={8}
          class="bg-accent text-accent-foreground font-medium text-sm w-fit"
        >
          <div class="space-y-2">
            <div class="whitespace-nowrap">
              {tooltipContent}
            </div>
            <div class="max-w-xs">
              <strong>Agrupamento:</strong> Por usuário, com valor total consolidado
              e bancos associados
            </div>
          </div>
        </Tooltip.Content>
      </Tooltip.Root>
    </div>

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
    options={carteiraOptions}
    placeholder={$carregandoCarteiras
      ? "Carregando carteiras..."
      : disabled
        ? "Login necessário"
        : `${carteiraOptions.length} carteiras disponíveis`}
    searchPlaceholder="Buscar carteira..."
    emptyMessage={$erroCarteiras
      ? $erroCarteiras
      : "Nenhuma carteira encontrada."}
    disabled={$carregandoCarteiras || disabled}
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

<script>
  import { onMount } from "svelte";
  import { page } from "$app/stores";
  import { modoVisualizacao } from "$lib/stores/tabelas.js";
  import { carregarConfiguracoes } from "$lib/stores/config.js";
  import { buscarCarteirasConfig } from "$lib/stores/carteiras.js";

  let { children } = $props();

  // Carregar configurações ao montar
  onMount(async () => {
    carregarConfiguracoes();
    // Carregar carteiras usando a configuração
    await buscarCarteirasConfig();
  });

  // Mapeamento dos parâmetros de URL para os modos de visualização
  // TEMPORARILY DISABLED: relatorio, movimentacoes, analise - only consolidado and asset_allocation are active
  const modoMapping = {
    relatorio: "relatorio", // DISABLED
    consolidado: "consolidado", // ACTIVE
    movimentacoes: "movimentacoes", // DISABLED
    analise: "analise", // DISABLED
    asset_allocation: "asset_allocation", // ACTIVE
  };

  // Função para atualizar o modo baseado nos parâmetros de URL
  function updateModeFromURL(searchParams) {
    const modoParam = searchParams.get("modo");
    if (modoParam && modoParam in modoMapping) {
      const newMode = modoMapping[modoParam];
      modoVisualizacao.set(newMode);
    }
  }

  // Detectar mudanças na URL e atualizar o modo automaticamente usando $effect
  $effect(() => {
    if ($page?.url?.searchParams) {
      updateModeFromURL($page.url.searchParams);
    }
  });
</script>

{@render children?.()}

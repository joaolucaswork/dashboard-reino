<script>
  import { page } from "$app/stores";
  import { modoVisualizacao } from "$lib/stores/tabelas.js";

  let { children } = $props();

  // Mapeamento dos parâmetros de URL para os modos de visualização
  const modoMapping = {
    relatorio: "relatorio",
    consolidado: "consolidado",
    movimentacoes: "movimentacoes",
    analise: "analise",
    asset_allocation: "asset_allocation",
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

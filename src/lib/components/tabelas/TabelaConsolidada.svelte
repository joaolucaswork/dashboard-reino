<script>
  import { Card, CardContent } from "$lib/components/ui/card";
  import { Button } from "$lib/components/ui/button";

  import TabelaFinanceiraEnhanced from "./TabelaFinanceiraEnhanced.svelte";
  import { formatCurrency } from "$lib/components/ui/data-table/index.js";
  import { Plus, Minus } from "@lucide/svelte";
  import { getBancoCorHex } from "$lib/data/bancos.js";
  import { Badge } from "$lib/components/ui/badge/index.ts";

  let { data } = $props();

  // Estados de expansão para o accordion
  let expandedBancos = $state(new Set());
  let expandedCategorias = $state(new Set());
  let expandedTipos = $state(new Set());

  function toggleBanco(/** @type {string} */ banco) {
    if (expandedBancos.has(banco)) {
      expandedBancos.delete(banco);
    } else {
      expandedBancos.add(banco);
    }
    expandedBancos = new Set(expandedBancos);
  }

  function toggleCategoria(/** @type {string} */ categoriaKey) {
    if (expandedCategorias.has(categoriaKey)) {
      expandedCategorias.delete(categoriaKey);
    } else {
      expandedCategorias.add(categoriaKey);
    }
    expandedCategorias = new Set(expandedCategorias);
  }

  function toggleTipo(/** @type {string} */ tipoKey) {
    if (expandedTipos.has(tipoKey)) {
      expandedTipos.delete(tipoKey);
    } else {
      expandedTipos.add(tipoKey);
    }
    expandedTipos = new Set(expandedTipos);
  }

  // Função para criar dados de tabela a partir das linhas
  function createTableData(/** @type {any[]} */ linhas) {
    if (!linhas || !Array.isArray(linhas)) return [];
    return linhas;
  }

  // Função para contar total de ativos por banco
  function countAssetsInBank(/** @type {any} */ categorias) {
    let totalAssets = 0;

    Object.entries(categorias).forEach(([categoria, conteudo]) => {
      if (
        categoria !== "_total_banco" &&
        conteudo &&
        typeof conteudo === "object"
      ) {
        Object.entries(conteudo).forEach(([tipo, grupo]) => {
          if (
            tipo !== "_total_categoria" &&
            grupo &&
            grupo.linhas &&
            Array.isArray(grupo.linhas)
          ) {
            totalAssets += grupo.linhas.length;
          }
        });
      }
    });

    return totalAssets;
  }

  // Função para contar total de ativos por categoria
  function countAssetsInCategory(/** @type {any} */ conteudo) {
    let totalAssets = 0;

    if (conteudo && typeof conteudo === "object") {
      Object.entries(conteudo).forEach(([tipo, grupo]) => {
        if (
          tipo !== "_total_categoria" &&
          grupo &&
          grupo.linhas &&
          Array.isArray(grupo.linhas)
        ) {
          totalAssets += grupo.linhas.length;
        }
      });
    }

    return totalAssets;
  }

  // Função para contar total de ativos por tipo
  function countAssetsInType(/** @type {any} */ grupo) {
    if (grupo && grupo.linhas && Array.isArray(grupo.linhas)) {
      return grupo.linhas.length;
    }
    return 0;
  }

  // Funções para controlar hierarquia visual com opacidade
  function getBancoOpacity(/** @type {string} */ banco) {
    const hasAnyExpanded = expandedBancos.size > 0;
    if (!hasAnyExpanded) return "opacity-100";
    return expandedBancos.has(banco) ? "opacity-100" : "opacity-50";
  }

  function getCategoriaOpacity(
    /** @type {string} */ banco,
    /** @type {string} */ categoria
  ) {
    const categoriaKey = `${banco}-${categoria}`;
    const expandedInThisBank = Array.from(expandedCategorias).filter((key) =>
      key.startsWith(`${banco}-`)
    );
    const hasAnyExpanded = expandedInThisBank.length > 0;

    if (!hasAnyExpanded) return "opacity-100";
    return expandedCategorias.has(categoriaKey) ? "opacity-100" : "opacity-50";
  }

  function getTipoOpacity(
    /** @type {string} */ banco,
    /** @type {string} */ categoria,
    /** @type {string} */ tipo
  ) {
    const tipoKey = `${banco}-${categoria}-${tipo}`;
    const expandedInThisCategory = Array.from(expandedTipos).filter((key) =>
      key.startsWith(`${banco}-${categoria}-`)
    );
    const hasAnyExpanded = expandedInThisCategory.length > 0;

    if (!hasAnyExpanded) return "opacity-100";
    return expandedTipos.has(tipoKey) ? "opacity-100" : "opacity-50";
  }

  // Funções para navegação por breadcrumb
  /** @typedef {Object} BreadcrumbItem
   * @property {string} label
   * @property {string} level
   * @property {string} [key]
   */

  /** @returns {BreadcrumbItem[]} */
  function getBreadcrumbPath() {
    /** @type {BreadcrumbItem[]} */
    const path = [{ label: "Posição Consolidada", level: "root" }];

    // Adicionar banco expandido
    const expandedBanco = Array.from(expandedBancos)[0];
    if (expandedBanco) {
      path.push({ label: expandedBanco, level: "banco", key: expandedBanco });

      // Adicionar categoria expandida dentro do banco
      const expandedCategoria = Array.from(expandedCategorias).find((key) =>
        key.startsWith(`${expandedBanco}-`)
      );
      if (expandedCategoria) {
        const categoria = expandedCategoria.split("-").slice(1).join("-");
        path.push({
          label: categoria,
          level: "categoria",
          key: expandedCategoria,
        });

        // Adicionar tipo expandido dentro da categoria
        const expandedTipo = Array.from(expandedTipos).find((key) =>
          key.startsWith(`${expandedCategoria}-`)
        );
        if (expandedTipo) {
          const tipo = expandedTipo.split("-").slice(2).join("-");
          path.push({ label: tipo, level: "tipo", key: expandedTipo });
        }
      }
    }

    return path;
  }

  function navigateToBreadcrumb(/** @type {BreadcrumbItem} */ breadcrumbItem) {
    if (breadcrumbItem.level === "root") {
      // Colapsar tudo
      expandedBancos.clear();
      expandedCategorias.clear();
      expandedTipos.clear();
      expandedBancos = new Set(expandedBancos);
      expandedCategorias = new Set(expandedCategorias);
      expandedTipos = new Set(expandedTipos);
    } else if (breadcrumbItem.level === "banco") {
      // Manter apenas o banco, colapsar categorias e tipos
      expandedCategorias.clear();
      expandedTipos.clear();
      expandedCategorias = new Set(expandedCategorias);
      expandedTipos = new Set(expandedTipos);
    } else if (breadcrumbItem.level === "categoria") {
      // Manter banco e categoria, colapsar tipos
      expandedTipos.clear();
      expandedTipos = new Set(expandedTipos);
    }
  }

  // Funções para extrair opções disponíveis para comboboxes
  function getBancoOptions() {
    if (!data?.agrupados) return [];
    return Object.keys(data.agrupados).map((banco) => ({
      value: banco,
      label: banco,
    }));
  }

  function getCategoriaOptions(/** @type {string} */ banco) {
    if (!data?.agrupados?.[banco]) return [];
    return Object.keys(data.agrupados[banco])
      .filter((key) => key !== "_total_banco")
      .map((categoria) => ({
        value: categoria,
        label: categoria,
      }));
  }

  function getTipoOptions(
    /** @type {string} */ banco,
    /** @type {string} */ categoria
  ) {
    if (!data?.agrupados?.[banco]?.[categoria]) return [];
    return Object.keys(data.agrupados[banco][categoria])
      .filter((key) => key !== "_total_categoria")
      .map((tipo) => ({
        value: tipo,
        label: tipo,
      }));
  }

  // Funções auxiliares para verificar existência de caminhos
  function pathExists(
    /** @type {string} */ banco,
    /** @type {string} */ categoria = "",
    /** @type {string} */ tipo = ""
  ) {
    if (!data?.agrupados?.[banco]) return false;

    if (categoria && !data.agrupados[banco][categoria]) return false;
    if (categoria && tipo && !data.agrupados[banco][categoria]?.[tipo])
      return false;

    return true;
  }

  // Função para verificar se um caminho específico tem dados válidos
  function hasValidData(
    /** @type {string} */ banco,
    /** @type {string} */ categoria = "",
    /** @type {string} */ tipo = ""
  ) {
    if (!pathExists(banco, categoria, tipo)) return false;

    // Verificar se há dados além dos totais
    if (tipo) {
      const tipoData = data.agrupados[banco][categoria][tipo];
      return (
        tipoData &&
        typeof tipoData === "object" &&
        Object.keys(tipoData).length > 0
      );
    }

    if (categoria) {
      const categoriaData = data.agrupados[banco][categoria];
      return (
        categoriaData &&
        typeof categoriaData === "object" &&
        Object.keys(categoriaData).filter((key) => key !== "_total_categoria")
          .length > 0
      );
    }

    const bancoData = data.agrupados[banco];
    return (
      bancoData &&
      typeof bancoData === "object" &&
      Object.keys(bancoData).filter((key) => key !== "_total_banco").length > 0
    );
  }

  function findDeepestValidPath(
    /** @type {string} */ novoBanco,
    /** @type {string} */ categoriaAtual = "",
    /** @type {string} */ tipoAtual = ""
  ) {
    // Verificar se o caminho completo existe e tem dados válidos
    if (
      categoriaAtual &&
      tipoAtual &&
      hasValidData(novoBanco, categoriaAtual, tipoAtual)
    ) {
      return { categoria: categoriaAtual, tipo: tipoAtual };
    }

    // Verificar se pelo menos a categoria existe e tem dados válidos
    if (categoriaAtual && hasValidData(novoBanco, categoriaAtual)) {
      return { categoria: categoriaAtual, tipo: "" };
    }

    // Apenas o banco existe
    return { categoria: "", tipo: "" };
  }

  // Funções de navegação inteligente para comboboxes
  function navigateToBanco(/** @type {string} */ novoBanco) {
    // Obter contexto atual
    const categoriaAtualKey = Array.from(expandedCategorias)[0];
    const tipoAtualKey = Array.from(expandedTipos)[0];

    let categoriaAtual = "";
    let tipoAtual = "";

    if (categoriaAtualKey) {
      categoriaAtual = categoriaAtualKey.split("-").slice(1).join("-");
    }

    if (tipoAtualKey) {
      tipoAtual = tipoAtualKey.split("-").slice(2).join("-");
    }

    // Encontrar o caminho mais profundo válido no novo banco
    const validPath = findDeepestValidPath(
      novoBanco,
      categoriaAtual,
      tipoAtual
    );

    // Limpar estados atuais
    expandedBancos.clear();
    expandedCategorias.clear();
    expandedTipos.clear();

    // Expandir novo banco
    expandedBancos.add(novoBanco);

    // Expandir categoria se existir
    if (validPath.categoria) {
      const categoriaKey = `${novoBanco}-${validPath.categoria}`;
      expandedCategorias.add(categoriaKey);
    }

    // Expandir tipo se existir
    if (validPath.tipo) {
      const tipoKey = `${novoBanco}-${validPath.categoria}-${validPath.tipo}`;
      expandedTipos.add(tipoKey);
    }

    // Atualizar estados
    expandedBancos = new Set(expandedBancos);
    expandedCategorias = new Set(expandedCategorias);
    expandedTipos = new Set(expandedTipos);
  }

  function navigateToCategoria(/** @type {string} */ novaCategoria) {
    const bancoAtual = Array.from(expandedBancos)[0];
    if (!bancoAtual) return;

    // Obter tipo atual se existir
    const tipoAtualKey = Array.from(expandedTipos)[0];
    let tipoAtual = "";

    if (tipoAtualKey) {
      tipoAtual = tipoAtualKey.split("-").slice(2).join("-");
    }

    // Limpar categorias e tipos
    expandedCategorias.clear();
    expandedTipos.clear();

    // Expandir nova categoria
    const categoriaKey = `${bancoAtual}-${novaCategoria}`;
    expandedCategorias.add(categoriaKey);

    // Tentar preservar o tipo se existir na nova categoria
    if (tipoAtual && pathExists(bancoAtual, novaCategoria, tipoAtual)) {
      const tipoKey = `${bancoAtual}-${novaCategoria}-${tipoAtual}`;
      expandedTipos.add(tipoKey);
    }

    // Atualizar estados
    expandedCategorias = new Set(expandedCategorias);
    expandedTipos = new Set(expandedTipos);
  }

  function navigateToTipo(/** @type {string} */ novoTipo) {
    const bancoAtual = Array.from(expandedBancos)[0];
    const categoriaAtual = Array.from(expandedCategorias)[0];
    if (!bancoAtual || !categoriaAtual) return;

    // Extrair nome da categoria
    const categoria = categoriaAtual.split("-").slice(1).join("-");

    // Verificar se o novo tipo existe na categoria atual
    if (!pathExists(bancoAtual, categoria, novoTipo)) return;

    // Limpar tipos
    expandedTipos.clear();

    // Expandir novo tipo
    const tipoKey = `${bancoAtual}-${categoria}-${novoTipo}`;
    expandedTipos.add(tipoKey);

    // Atualizar estado
    expandedTipos = new Set(expandedTipos);
  }

  // Estados para controlar popovers
  let openBancoPopover = $state(false);
  let openCategoriaPopover = $state(false);
  let openTipoPopover = $state(false);

  // Função para obter contexto atual da navegação
  function getCurrentNavigationContext() {
    const bancoAtual = Array.from(expandedBancos)[0] || "";
    const categoriaAtualKey = Array.from(expandedCategorias)[0];
    const tipoAtualKey = Array.from(expandedTipos)[0];

    let categoriaAtual = "";
    let tipoAtual = "";

    if (categoriaAtualKey) {
      categoriaAtual = categoriaAtualKey.split("-").slice(1).join("-");
    }

    if (tipoAtualKey) {
      tipoAtual = tipoAtualKey.split("-").slice(2).join("-");
    }

    return {
      banco: bancoAtual,
      categoria: categoriaAtual,
      tipo: tipoAtual,
    };
  }

  // Função para debug - mostra o caminho que será preservado
  function previewNavigationPath(/** @type {string} */ novoBanco) {
    const context = getCurrentNavigationContext();
    const validPath = findDeepestValidPath(
      novoBanco,
      context.categoria,
      context.tipo
    );

    let previewPath = novoBanco;
    if (validPath.categoria) previewPath += ` / ${validPath.categoria}`;
    if (validPath.tipo) previewPath += ` / ${validPath.tipo}`;

    return previewPath;
  }

  // Função desativada - sticky positioning removido dos accordions
  function getStickyClasses(
    /** @type {string} */ level,
    /** @type {string} */ key
  ) {
    // Sticky positioning desativado para evitar problemas de sobreposição
    // Apenas o breadcrumb permanecerá sticky
    return "";
  }
</script>

<Card>
  <CardContent class="space-y-4 px-0">
    {#if data?.agrupados}
      <!-- Accordion por Bancos -->
      {#each Object.entries(data.agrupados) as [banco, categorias]}
        <div
          data-banco={banco}
          class="border rounded-lg overflow-hidden transition-opacity duration-300 {getBancoOpacity(
            banco
          )} {getStickyClasses('banco', banco)}"
        >
          <!-- Cabeçalho do Banco -->
          <Button
            variant="ghost"
            class="w-full justify-between p-4 h-auto text-left hover:bg-[#2b251e] {expandedBancos.has(
              banco
            )
              ? 'bg-[#2b251e]'
              : 'bg-background'}"
            onclick={() => toggleBanco(banco)}
          >
            <div class="flex items-center gap-3">
              <!-- Indicador de cor do banco -->
              <div
                class="w-4 h-4 rounded-full {getBancoCorHex(banco)}"
                title="Banco: {banco}"
              ></div>
              <div class="flex-1">
                <div class="flex items-center gap-2">
                  <span class="font-semibold">{banco}</span>
                  <Badge variant="outline" class="text-xs">
                    {countAssetsInBank(categorias)} produto(s)
                  </Badge>
                </div>
                <div class="text-caption">
                  Total: {formatCurrency(categorias._total_banco || 0)}
                </div>
              </div>
            </div>
            {#if expandedBancos.has(banco)}
              <Minus size={16} />
            {:else}
              <Plus size={16} />
            {/if}
          </Button>

          <!-- Conteúdo do Banco -->
          {#if expandedBancos.has(banco)}
            <div class="border-t bg-muted/20 p-4 space-y-3">
              {#each Object.entries(categorias) as [categoria, conteudo]}
                {#if categoria !== "_total_banco"}
                  <div
                    data-categoria="{banco}-{categoria}"
                    class="border rounded-md overflow-hidden bg-background transition-opacity duration-300 {getCategoriaOpacity(
                      banco,
                      categoria
                    )} {getStickyClasses('categoria', `${banco}-${categoria}`)}"
                  >
                    <!-- Cabeçalho da Categoria -->
                    <Button
                      variant="ghost"
                      class="w-full justify-between p-3 h-auto text-left hover:bg-[#2b251e] {expandedCategorias.has(
                        `${banco}-${categoria}`
                      )
                        ? 'bg-[#2b251e]'
                        : 'bg-background'}"
                      onclick={() => toggleCategoria(`${banco}-${categoria}`)}
                    >
                      <div class="flex items-center gap-2">
                        <div class="flex-1">
                          <div class="flex items-center gap-2">
                            <span class="font-medium">{categoria}</span>
                            <Badge variant="outline" class="text-xs">
                              {countAssetsInCategory(conteudo)} tipo(s)
                            </Badge>
                          </div>
                          <div class="text-caption">
                            Total: {formatCurrency(
                              conteudo._total_categoria || 0
                            )}
                          </div>
                        </div>
                      </div>
                      {#if expandedCategorias.has(`${banco}-${categoria}`)}
                        <Minus size={14} />
                      {:else}
                        <Plus size={14} />
                      {/if}
                    </Button>

                    <!-- Conteúdo da Categoria -->
                    {#if expandedCategorias.has(`${banco}-${categoria}`)}
                      <div class="border-t bg-muted/10 p-3 space-y-2">
                        {#each Object.entries(conteudo) as [tipo, grupo]}
                          {#if tipo !== "_total_categoria"}
                            <div
                              data-tipo="{banco}-{categoria}-{tipo}"
                              class="border rounded-sm overflow-hidden bg-background transition-opacity duration-300 {getTipoOpacity(
                                banco,
                                categoria,
                                tipo
                              )} {getStickyClasses(
                                'tipo',
                                `${banco}-${categoria}-${tipo}`
                              )}"
                            >
                              <!-- Cabeçalho do Tipo -->
                              <Button
                                variant="ghost"
                                class="w-full justify-between p-2 h-auto text-left hover:bg-[#2b251e] {expandedTipos.has(
                                  `${banco}-${categoria}-${tipo}`
                                )
                                  ? 'bg-[#2b251e]'
                                  : 'bg-background'}"
                                onclick={() =>
                                  toggleTipo(`${banco}-${categoria}-${tipo}`)}
                              >
                                <div class="flex items-center gap-2">
                                  <div class="flex-1">
                                    <div class="flex items-center gap-2">
                                      <span class="text-sm font-medium"
                                        >{tipo}</span
                                      >
                                      <Badge variant="outline" class="text-xs">
                                        {countAssetsInType(grupo)} item(s)
                                      </Badge>
                                    </div>
                                    <div class="text-xs text-muted-foreground">
                                      Total: {formatCurrency(
                                        grupo._total_tipo || 0
                                      )}
                                    </div>
                                  </div>
                                </div>
                                {#if expandedTipos.has(`${banco}-${categoria}-${tipo}`)}
                                  <Minus size={12} />
                                {:else}
                                  <Plus size={12} />
                                {/if}
                              </Button>

                              <!-- Tabela de Ativos -->
                              {#if expandedTipos.has(`${banco}-${categoria}-${tipo}`) && grupo.linhas}
                                <div class="border-t p-2">
                                  <TabelaFinanceiraEnhanced
                                    data={{
                                      tables: {
                                        tab0: {
                                          lin0: data.cabecalho || {},
                                          ...grupo.linhas.reduce(
                                            (
                                              /** @type {any} */ acc,
                                              /** @type {any} */ linha,
                                              /** @type {number} */ index
                                            ) => {
                                              acc[`lin${index + 1}`] = linha;
                                              return acc;
                                            },
                                            {}
                                          ),
                                        },
                                      },
                                    }}
                                    mode="consolidado"
                                    title=""
                                  />
                                </div>
                              {/if}
                            </div>
                          {/if}
                        {/each}
                      </div>
                    {/if}
                  </div>
                {/if}
              {/each}
            </div>
          {/if}
        </div>
      {/each}
    {:else}
      <!-- Fallback para dados em formato de tabela simples -->
      <TabelaFinanceiraEnhanced
        {data}
        mode="consolidado"
        title="Dados Consolidados"
      />
    {/if}
  </CardContent>
</Card>

<style>
  /* Estilos simplificados - apenas para breadcrumb sticky */

  /* Estilos para breadcrumb sticky aprimorado */
  :global(.breadcrumb-container) {
    transition: all 0.2s ease-in-out;
    border-bottom: 1px solid hsl(var(--border));
  }

  /* Quando sticky, expandir para largura total e quebrar container */
  :global(.breadcrumb-container.is-sticky) {
    position: fixed !important;
    top: 0 !important;
    left: 0 !important;
    right: 0 !important;
    width: 100vw !important;
    height: auto !important;
    margin: 0 !important;
    padding: 0 !important;
    background: hsl(var(--background) / 0.95) !important;
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    z-index: 50 !important;
    transform: translateX(0) !important;
  }

  /* Ajustar conteúdo interno para alinhar com header principal */
  :global(.breadcrumb-container.is-sticky .breadcrumb-content) {
    width: 100% !important;
    max-width: none !important;
    margin: 0 !important;
    padding: 1rem 2rem !important;
    display: flex !important;
    align-items: center !important;
  }

  /* Garantir que o CardHeader ocupe toda a largura */
  :global(.breadcrumb-container.is-sticky .breadcrumb-content > *) {
    width: 100% !important;
    margin: 0 !important;
    padding: 0 !important;
  }

  /* Adicionar espaço no topo do conteúdo quando breadcrumb está sticky */
  :global(.breadcrumb-container.is-sticky ~ *) {
    margin-top: 60px !important;
  }

  /* Garantir que não há overflow horizontal */
  :global(body) {
    overflow-x: hidden;
  }

  /* Garantir overflow correto para tabelas */
  :global(.tabela-financeira [data-slot="table-container"]) {
    overflow-x: auto;
    overflow-y: visible;
  }

  /* Transições suaves para accordions */
  :global([data-banco], [data-categoria], [data-tipo]) {
    transition: opacity 200ms ease-in-out;
  }
</style>

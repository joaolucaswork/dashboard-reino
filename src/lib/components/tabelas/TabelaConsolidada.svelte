<script>
  import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
  } from "$lib/components/ui/card";
  import { Button } from "$lib/components/ui/button";
  import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
  } from "$lib/components/ui/breadcrumb";
  import TabelaFinanceira from "./TabelaFinanceira.svelte";
  import { formatCurrency } from "$lib/components/ui/data-table/index.js";
  import { Plus, Minus } from "@lucide/svelte";
  import { getBancoCorHex } from "$lib/data/bancos.js";

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

  // Funções para sticky positioning
  function getStickyClasses(
    /** @type {string} */ level,
    /** @type {string} */ key
  ) {
    if (level === "banco" && expandedBancos.has(key)) {
      return "sticky top-0 z-30";
    } else if (
      level === "categoria" &&
      expandedCategorias.has(key.split("-").slice(0, 2).join("-"))
    ) {
      const banco = key.split("-")[0];
      if (expandedBancos.has(banco)) {
        return "sticky top-[72px] z-20"; // Altura do cabeçalho do banco
      }
    } else if (level === "tipo" && expandedTipos.has(key)) {
      const [banco, categoria] = key.split("-");
      const categoriaKey = `${banco}-${categoria}`;
      if (expandedBancos.has(banco) && expandedCategorias.has(categoriaKey)) {
        return "sticky top-[144px] z-10"; // Altura do banco + categoria
      }
    }
    return "";
  }
</script>

<Card>
  <CardHeader>
    <!-- Breadcrumb de Navegação -->
    <Breadcrumb>
      <BreadcrumbList>
        {#each getBreadcrumbPath() as breadcrumbItem, index}
          {#if index > 0}
            <BreadcrumbSeparator />
          {/if}
          <BreadcrumbItem>
            {#if index === getBreadcrumbPath().length - 1}
              <BreadcrumbPage>{breadcrumbItem.label}</BreadcrumbPage>
            {:else}
              <BreadcrumbLink
                onclick={() => navigateToBreadcrumb(breadcrumbItem)}
              >
                {breadcrumbItem.label}
              </BreadcrumbLink>
            {/if}
          </BreadcrumbItem>
        {/each}
      </BreadcrumbList>
    </Breadcrumb>
  </CardHeader>
  <CardContent class="space-y-4">
    {#if data?.agrupados}
      <!-- Accordion por Bancos -->
      {#each Object.entries(data.agrupados) as [banco, categorias]}
        <div
          class="border rounded-lg overflow-hidden transition-opacity duration-300 {getBancoOpacity(
            banco
          )} {getStickyClasses('banco', banco)}"
        >
          <!-- Cabeçalho do Banco -->
          <Button
            variant="ghost"
            class="w-full justify-between p-4 h-auto text-left hover:bg-muted/50 bg-background"
            onclick={() => toggleBanco(banco)}
          >
            <div class="flex items-center gap-3">
              <!-- Indicador de cor do banco -->
              <div
                class="w-4 h-4 rounded-full {getBancoCorHex(banco)}"
                title="Banco: {banco}"
              ></div>
              <div>
                <div class="font-semibold">{banco}</div>
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
                    class="border rounded-md overflow-hidden bg-background transition-opacity duration-300 {getCategoriaOpacity(
                      banco,
                      categoria
                    )} {getStickyClasses('categoria', `${banco}-${categoria}`)}"
                  >
                    <!-- Cabeçalho da Categoria -->
                    <Button
                      variant="ghost"
                      class="w-full justify-between p-3 h-auto text-left hover:bg-muted/30 bg-background"
                      onclick={() => toggleCategoria(`${banco}-${categoria}`)}
                    >
                      <div class="flex items-center gap-2">
                        <div>
                          <div class="font-medium">{categoria}</div>
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
                                class="w-full justify-between p-2 h-auto text-left hover:bg-muted/20 bg-background"
                                onclick={() =>
                                  toggleTipo(`${banco}-${categoria}-${tipo}`)}
                              >
                                <div class="flex items-center gap-2">
                                  <div>
                                    <div class="text-sm font-medium">
                                      {tipo}
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
                                  <TabelaFinanceira
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
      <TabelaFinanceira {data} mode="consolidado" title="Dados Consolidados" />
    {/if}
  </CardContent>
</Card>

<style>
  /* Melhorias para sticky positioning */
  :global(.sticky) {
    backdrop-filter: blur(8px);
    border-bottom: 1px solid hsl(var(--border));
  }

  /* Garantir que elementos sticky tenham um fundo sólido */
  :global(.sticky .bg-background) {
    background: hsl(var(--background)) !important;
  }

  /* Melhorar a transição dos elementos sticky */
  :global([class*="sticky"]) {
    transition: all 200ms ease-in-out;
  }

  /* Adicionar sombra sutil aos elementos sticky para melhor separação visual */
  :global(.sticky) {
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
</style>

<script>
  import { Card, CardContent, CardHeader } from "$lib/components/ui/card";
  import { Button } from "$lib/components/ui/button";
  import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
  } from "$lib/components/ui/breadcrumb";
  import * as Popover from "$lib/components/ui/popover";
  import * as Command from "$lib/components/ui/command";
  import { ChevronDown, Check } from "@lucide/svelte";
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

  // Funções de navegação para comboboxes
  function navigateToBanco(/** @type {string} */ novoBanco) {
    // Limpar estados atuais
    expandedBancos.clear();
    expandedCategorias.clear();
    expandedTipos.clear();

    // Expandir novo banco
    expandedBancos.add(novoBanco);

    // Atualizar estados
    expandedBancos = new Set(expandedBancos);
    expandedCategorias = new Set(expandedCategorias);
    expandedTipos = new Set(expandedTipos);
  }

  function navigateToCategoria(/** @type {string} */ novaCategoria) {
    const bancoAtual = Array.from(expandedBancos)[0];
    if (!bancoAtual) return;

    // Limpar categorias e tipos
    expandedCategorias.clear();
    expandedTipos.clear();

    // Expandir nova categoria
    const categoriaKey = `${bancoAtual}-${novaCategoria}`;
    expandedCategorias.add(categoriaKey);

    // Atualizar estados
    expandedCategorias = new Set(expandedCategorias);
    expandedTipos = new Set(expandedTipos);
  }

  function navigateToTipo(/** @type {string} */ novoTipo) {
    const bancoAtual = Array.from(expandedBancos)[0];
    const categoriaAtual = Array.from(expandedCategorias)[0];
    if (!bancoAtual || !categoriaAtual) return;

    // Limpar tipos
    expandedTipos.clear();

    // Expandir novo tipo
    const categoria = categoriaAtual.split("-").slice(1).join("-");
    const tipoKey = `${bancoAtual}-${categoria}-${novoTipo}`;
    expandedTipos.add(tipoKey);

    // Atualizar estado
    expandedTipos = new Set(expandedTipos);
  }

  // Estados para controlar popovers
  let openBancoPopover = $state(false);
  let openCategoriaPopover = $state(false);
  let openTipoPopover = $state(false);

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
  <CardHeader
    class="sticky top-0 z-40 bg-background border-b flex items-center justify-start py-4"
  >
    <!-- Breadcrumb de Navegação Interativo -->
    <Breadcrumb>
      <BreadcrumbList>
        {#each getBreadcrumbPath() as breadcrumbItem, index}
          {#if index > 0}
            <BreadcrumbSeparator />
          {/if}
          <BreadcrumbItem>
            <!-- Item clicável para abrir combobox -->
            {#if breadcrumbItem.level === "root"}
              <!-- Apenas o root mantém navegação regressiva -->
              <BreadcrumbLink
                onclick={() => navigateToBreadcrumb(breadcrumbItem)}
              >
                {breadcrumbItem.label}
              </BreadcrumbLink>
            {:else if breadcrumbItem.level === "banco" && getBancoOptions().length > 1}
              <Popover.Root bind:open={openBancoPopover}>
                <Popover.Trigger
                  class="flex items-center gap-1 font-semibold text-foreground hover:bg-muted/50 rounded-sm px-1 py-0.5 transition-colors"
                >
                  <span>{breadcrumbItem.label}</span>
                  <ChevronDown class="h-3 w-3 text-muted-foreground" />
                </Popover.Trigger>
                <Popover.Content class="w-64 p-0" align="start">
                  <Command.Root>
                    <Command.Input placeholder="Buscar banco..." class="h-9" />
                    <Command.List>
                      <Command.Empty>Nenhum banco encontrado.</Command.Empty>
                      <Command.Group>
                        {#each getBancoOptions() as option}
                          <Command.Item
                            value={option.value}
                            onSelect={() => {
                              navigateToBanco(option.value);
                              openBancoPopover = false;
                            }}
                            class="flex items-center justify-between"
                          >
                            <span>{option.label}</span>
                            {#if breadcrumbItem.key === option.value}
                              <Check class="h-4 w-4" />
                            {/if}
                          </Command.Item>
                        {/each}
                      </Command.Group>
                    </Command.List>
                  </Command.Root>
                </Popover.Content>
              </Popover.Root>
            {:else if breadcrumbItem.level === "banco"}
              <!-- Banco sem dropdown (apenas uma opção) -->
              <BreadcrumbPage>{breadcrumbItem.label}</BreadcrumbPage>
            {:else if breadcrumbItem.level === "categoria"}
              {@const bancoAtual = Array.from(expandedBancos)[0]}
              {#if bancoAtual && getCategoriaOptions(bancoAtual).length > 1}
                <Popover.Root bind:open={openCategoriaPopover}>
                  <Popover.Trigger
                    class="flex items-center gap-1 font-semibold text-foreground hover:bg-muted/50 rounded-sm px-1 py-0.5 transition-colors"
                  >
                    <span>{breadcrumbItem.label}</span>
                    <ChevronDown class="h-3 w-3 text-muted-foreground" />
                  </Popover.Trigger>
                  <Popover.Content class="w-64 p-0" align="start">
                    <Command.Root>
                      <Command.Input
                        placeholder="Buscar categoria..."
                        class="h-9"
                      />
                      <Command.List>
                        <Command.Empty
                          >Nenhuma categoria encontrada.</Command.Empty
                        >
                        <Command.Group>
                          {#each getCategoriaOptions(bancoAtual) as option}
                            <Command.Item
                              value={option.value}
                              onSelect={() => {
                                navigateToCategoria(option.value);
                                openCategoriaPopover = false;
                              }}
                              class="flex items-center justify-between"
                            >
                              <span>{option.label}</span>
                              {#if breadcrumbItem.label === option.value}
                                <Check class="h-4 w-4" />
                              {/if}
                            </Command.Item>
                          {/each}
                        </Command.Group>
                      </Command.List>
                    </Command.Root>
                  </Popover.Content>
                </Popover.Root>
              {:else}
                <!-- Categoria sem dropdown (apenas uma opção) -->
                <BreadcrumbPage>{breadcrumbItem.label}</BreadcrumbPage>
              {/if}
            {:else if breadcrumbItem.level === "tipo"}
              {@const bancoAtual = Array.from(expandedBancos)[0]}
              {@const categoriaAtual = Array.from(expandedCategorias)[0]}
              {#if bancoAtual && categoriaAtual}
                {@const categoria = categoriaAtual
                  .split("-")
                  .slice(1)
                  .join("-")}
                {#if getTipoOptions(bancoAtual, categoria).length > 1}
                  <Popover.Root bind:open={openTipoPopover}>
                    <Popover.Trigger
                      class="flex items-center gap-1 font-semibold text-foreground hover:bg-muted/50 rounded-sm px-1 py-0.5 transition-colors"
                    >
                      <span>{breadcrumbItem.label}</span>
                      <ChevronDown class="h-3 w-3 text-muted-foreground" />
                    </Popover.Trigger>
                    <Popover.Content class="w-64 p-0" align="start">
                      <Command.Root>
                        <Command.Input
                          placeholder="Buscar tipo..."
                          class="h-9"
                        />
                        <Command.List>
                          <Command.Empty>Nenhum tipo encontrado.</Command.Empty>
                          <Command.Group>
                            {#each getTipoOptions(bancoAtual, categoria) as option}
                              <Command.Item
                                value={option.value}
                                onSelect={() => {
                                  navigateToTipo(option.value);
                                  openTipoPopover = false;
                                }}
                                class="flex items-center justify-between"
                              >
                                <span>{option.label}</span>
                                {#if breadcrumbItem.label === option.value}
                                  <Check class="h-4 w-4" />
                                {/if}
                              </Command.Item>
                            {/each}
                          </Command.Group>
                        </Command.List>
                      </Command.Root>
                    </Popover.Content>
                  </Popover.Root>
                {:else}
                  <!-- Tipo sem dropdown (apenas uma opção) -->
                  <BreadcrumbPage>{breadcrumbItem.label}</BreadcrumbPage>
                {/if}
              {:else}
                <!-- Tipo sem dropdown (sem dados) -->
                <BreadcrumbPage>{breadcrumbItem.label}</BreadcrumbPage>
              {/if}
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
          data-banco={banco}
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
                    data-categoria="{banco}-{categoria}"
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
  /* Estilos simplificados - apenas para breadcrumb sticky */

  /* Estilo para breadcrumb sticky */
  :global(.sticky) {
    background: hsl(var(--background)) !important;
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
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

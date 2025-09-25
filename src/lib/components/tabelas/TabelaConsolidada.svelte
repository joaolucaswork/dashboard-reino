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
  import { ChevronDown, Check, RefreshCw } from "@lucide/svelte";

  import TabelaFinanceiraEnhanced from "./TabelaFinanceiraEnhanced.svelte";
  import { formatCurrency } from "$lib/components/ui/data-table/index.js";
  import { Plus, Minus } from "@lucide/svelte";
  import { getBancoCorHex } from "$lib/data/bancos.js";
  import { Badge } from "$lib/components/ui/badge/index.js";
  import BankHeader from "$lib/components/ui/BankHeader.svelte";
  import { DatePicker } from "$lib/components/ui/date-picker";
  import {
    formatarNomeCarteira,
    obterIniciais,
  } from "$lib/utils/formatters.js";
  import { wrapNumbersWithFont } from "$lib/utils/number-font.js";
  import {
    dataFinal,
    carteiraAtual,
    consultarDados,
    loadingState,
  } from "$lib/stores/tabelas.js";
  import { carteiraOptions } from "$lib/stores/carteiras.js";
  import AssetTypeIndicator from "$lib/components/ui/AssetTypeIndicator.svelte";

  let { data } = $props();

  // Estados de expansão para o accordion
  let expandedBancos = $state(new Set());
  let expandedCategorias = $state(new Set());
  let expandedTipos = $state(new Set());

  // Estados para controle dos popovers
  let openUsuarioPopover = $state(false);
  let openBancoPopover = $state(false);
  let openCategoriaPopover = $state(false);
  let openTipoPopover = $state(false);

  function toggleBanco(/** @type {string} */ banco) {
    if (expandedBancos.has(banco)) {
      // Fechando banco: fechar todos os dropdowns filhos (cascata)
      expandedBancos.delete(banco);

      // Fechar todas as categorias deste banco
      const categoriasToRemove = Array.from(expandedCategorias).filter((key) =>
        key.startsWith(`${banco}-`)
      );
      categoriasToRemove.forEach((key) => expandedCategorias.delete(key));

      // Fechar todos os tipos deste banco
      const tiposToRemove = Array.from(expandedTipos).filter((key) =>
        key.startsWith(`${banco}-`)
      );
      tiposToRemove.forEach((key) => expandedTipos.delete(key));
    } else {
      // Abrindo banco: comportamento mutuamente exclusivo
      expandedBancos.clear(); // Fechar todos os outros bancos
      expandedBancos.add(banco);

      // Fechar todas as categorias e tipos de outros bancos
      expandedCategorias.clear();
      expandedTipos.clear();
    }

    // Atualizar estados
    expandedBancos = new Set(expandedBancos);
    expandedCategorias = new Set(expandedCategorias);
    expandedTipos = new Set(expandedTipos);
  }

  function toggleCategoria(/** @type {string} */ categoriaKey) {
    const [banco] = categoriaKey.split("-");

    if (expandedCategorias.has(categoriaKey)) {
      // Fechando categoria: fechar todos os tipos filhos
      expandedCategorias.delete(categoriaKey);

      // Fechar todos os tipos desta categoria
      const tiposToRemove = Array.from(expandedTipos).filter((key) =>
        key.startsWith(`${categoriaKey}-`)
      );
      tiposToRemove.forEach((key) => expandedTipos.delete(key));
    } else {
      // Abrindo categoria: comportamento mutuamente exclusivo dentro do banco
      // Fechar outras categorias do mesmo banco
      const categoriasToRemove = Array.from(expandedCategorias).filter(
        (key) => key.startsWith(`${banco}-`) && key !== categoriaKey
      );
      categoriasToRemove.forEach((key) => {
        expandedCategorias.delete(key);
        // Fechar tipos das categorias que estão sendo fechadas
        const tiposToRemove = Array.from(expandedTipos).filter((tipoKey) =>
          tipoKey.startsWith(`${key}-`)
        );
        tiposToRemove.forEach((tipoKey) => expandedTipos.delete(tipoKey));
      });

      expandedCategorias.add(categoriaKey);
    }

    // Atualizar estados
    expandedCategorias = new Set(expandedCategorias);
    expandedTipos = new Set(expandedTipos);
  }

  function toggleTipo(/** @type {string} */ tipoKey) {
    const keyParts = tipoKey.split("-");
    const banco = keyParts[0];
    const categoria = keyParts[1];
    const categoriaKey = `${banco}-${categoria}`;

    if (expandedTipos.has(tipoKey)) {
      expandedTipos.delete(tipoKey);
    } else {
      // Comportamento mutuamente exclusivo dentro da categoria
      // Fechar outros tipos da mesma categoria
      const tiposToRemove = Array.from(expandedTipos).filter(
        (key) => key.startsWith(`${categoriaKey}-`) && key !== tipoKey
      );
      tiposToRemove.forEach((key) => expandedTipos.delete(key));

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

  // Função para obter opções de carteiras
  function getCarteiraOptions() {
    return $carteiraOptions;
  }

  // Função para obter data atual no formato YYYY-MM-DD
  function getDataAtual() {
    return new Date().toISOString().split("T")[0];
  }

  // Função para navegar para outra carteira
  function navigateToCarteira(/** @type {string} */ novaCarteira) {
    carteiraAtual.set(novaCarteira);
    // Aqui poderia disparar uma nova consulta se necessário
  }

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

<Card class="border-0">
  <CardHeader
    separator={false}
    class="sticky top-0 z-40 bg-background flex items-center justify-between py-4 border-0"
  >
    <!-- Container para usuário e breadcrumb lado a lado -->
    <div class="flex items-center justify-between w-full">
      <div class="flex items-center">
        <!-- Informações do Usuário com Combobox -->
        {#if $carteiraAtual}
          <div
            class="flex items-center mr-4 bg-muted/60 rounded-lg px-3 py-2 border border-muted/40"
          >
            <Popover.Root bind:open={openUsuarioPopover}>
              <Popover.Trigger
                class="flex items-center gap-2 hover:bg-muted/50 rounded-sm px-1 py-0.5 transition-colors"
              >
                <!-- Avatar do usuário -->
                <div
                  class="w-8 h-8 bg-primary/10 border border-primary/20 rounded-full flex items-center justify-center"
                >
                  <span class="text-sm font-medium text-primary">
                    {obterIniciais(formatarNomeCarteira($carteiraAtual))}
                  </span>
                </div>

                <!-- Nome do usuário -->
                <span class="text-base font-medium text-foreground">
                  {formatarNomeCarteira($carteiraAtual)}
                </span>

                <ChevronDown class="h-3 w-3 text-muted-foreground" />
              </Popover.Trigger>
              <Popover.Content class="w-64 p-0" align="start">
                <Command.Root>
                  <Command.Input placeholder="Buscar carteira..." class="h-9" />
                  <Command.List>
                    <Command.Empty>Nenhuma carteira encontrada.</Command.Empty>
                    <Command.Group>
                      {#each getCarteiraOptions() as option}
                        <Command.Item
                          value={option.value}
                          onSelect={() => {
                            navigateToCarteira(option.value);
                            openUsuarioPopover = false;
                          }}
                          class="flex items-center justify-between"
                        >
                          <div class="flex items-center gap-2">
                            <!-- Avatar da opção -->
                            <div
                              class="w-6 h-6 bg-primary/10 border border-primary/20 rounded-full flex items-center justify-center"
                            >
                              <span class="text-sm font-medium text-primary">
                                {obterIniciais(option.label)}
                              </span>
                            </div>
                            <span class="font-medium">{option.label}</span>
                          </div>
                          {#if $carteiraAtual === option.value}
                            <Check class="h-4 w-4" />
                          {/if}
                        </Command.Item>
                      {/each}
                    </Command.Group>
                  </Command.List>
                </Command.Root>
              </Popover.Content>
            </Popover.Root>
          </div>
        {/if}

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
                    class="text-base font-medium"
                  >
                    {breadcrumbItem.label}
                  </BreadcrumbLink>
                {:else if breadcrumbItem.level === "banco" && getBancoOptions().length > 1}
                  <Popover.Root bind:open={openBancoPopover}>
                    <Popover.Trigger
                      class="flex items-center gap-1 font-semibold text-base text-foreground hover:bg-muted/50 rounded-sm px-1 py-0.5 transition-colors"
                    >
                      <span class="font-medium">{breadcrumbItem.label}</span>
                      <ChevronDown class="h-3 w-3 text-muted-foreground" />
                    </Popover.Trigger>
                    <Popover.Content class="w-64 p-0" align="start">
                      <Command.Root>
                        <Command.Input
                          placeholder="Buscar banco..."
                          class="h-9"
                        />
                        <Command.List>
                          <Command.Empty>Nenhum banco encontrado.</Command.Empty
                          >
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
                                <span class="font-medium">{option.label}</span>
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
                  <BreadcrumbPage class="text-base"
                    >{breadcrumbItem.label}</BreadcrumbPage
                  >
                {:else if breadcrumbItem.level === "categoria"}
                  {@const bancoAtual = Array.from(expandedBancos)[0]}
                  {#if bancoAtual && getCategoriaOptions(bancoAtual).length > 1}
                    <Popover.Root bind:open={openCategoriaPopover}>
                      <Popover.Trigger
                        class="flex items-center gap-1 font-semibold text-base text-foreground hover:bg-muted/50 rounded-sm px-1 py-0.5 transition-colors"
                      >
                        <span class="font-medium">{breadcrumbItem.label}</span>
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
                                  <span class="font-medium">{option.label}</span
                                  >
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
                    <BreadcrumbPage class="text-base"
                      >{breadcrumbItem.label}</BreadcrumbPage
                    >
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
                          class="flex items-center gap-1 font-semibold text-base text-foreground hover:bg-muted/50 rounded-sm px-1 py-0.5 transition-colors"
                        >
                          <span class="font-medium">{breadcrumbItem.label}</span
                          >
                          <ChevronDown class="h-3 w-3 text-muted-foreground" />
                        </Popover.Trigger>
                        <Popover.Content class="w-64 p-0" align="start">
                          <Command.Root>
                            <Command.Input
                              placeholder="Buscar tipo..."
                              class="h-9"
                            />
                            <Command.List>
                              <Command.Empty
                                >Nenhum tipo encontrado.</Command.Empty
                              >
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
                                    <span class="font-medium"
                                      >{option.label}</span
                                    >
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
                      <BreadcrumbPage class="text-base"
                        >{breadcrumbItem.label}</BreadcrumbPage
                      >
                    {/if}
                  {:else}
                    <!-- Tipo sem dropdown (sem dados) -->
                    <BreadcrumbPage class="text-base"
                      >{breadcrumbItem.label}</BreadcrumbPage
                    >
                  {/if}
                {/if}
              </BreadcrumbItem>
            {/each}
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <!-- Data de Referência com Botão de Refresh -->
      {#if $dataFinal}
        <div class="flex items-center gap-3">
          <div class="bg-muted/60 rounded-lg px-3 py-2 border border-muted/40">
            <DatePicker
              bind:value={$dataFinal}
              maxValue={getDataAtual()}
              placeholder="Selecione a data"
              class="border-0 bg-transparent p-0 h-auto"
            />
          </div>
          <Button
            variant="ghost"
            size="sm"
            onclick={consultarDados}
            disabled={$loadingState}
            class="h-8 w-8 p-0"
          >
            <RefreshCw class="h-4 w-4 {$loadingState ? 'animate-spin' : ''}" />
          </Button>
        </div>
      {/if}
    </div>
  </CardHeader>
  <CardContent class="space-y-4 px-0">
    {#if data?.mensagem}
      <!-- Mensagem quando não há dados -->
      <div class="text-center py-8">
        <p class="text-body">{data.mensagem}</p>
        <p class="text-caption mt-2">
          Tente selecionar uma carteira diferente ou uma data mais recente.
        </p>
      </div>
    {:else if data?.agrupados && Object.keys(data.agrupados).length > 0}
      <!-- Accordion por Bancos -->
      {#each Object.entries(data.agrupados) as [banco, categorias]}
        <div
          data-banco={banco}
          class="border rounded-lg overflow-hidden transition-opacity duration-300 {getBancoOpacity(
            banco
          )} {getStickyClasses('banco', banco)}"
        >
          <!-- Cabeçalho do Banco -->
          <BankHeader
            bankName={banco}
            isExpanded={expandedBancos.has(banco)}
            totalValue={categorias._total_banco || 0}
            assetCount={countAssetsInBank(categorias)}
            on:toggle={() => toggleBanco(banco)}
            className="hover:bg-hover-active {expandedBancos.has(banco)
              ? 'bg-hover-active'
              : 'bg-background'}"
          />

          <!-- Conteúdo do Banco -->
          {#if expandedBancos.has(banco)}
            <div
              class="border-t bg-muted/20 p-4 space-y-3 transition-all duration-300 ease-in-out"
              role="region"
              aria-label="Conteúdo do banco {banco}"
            >
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
                      class="w-full justify-between p-3 h-auto text-left hover:bg-hover-active transition-all duration-200 ease-in-out {expandedCategorias.has(
                        `${banco}-${categoria}`
                      )
                        ? 'bg-hover-active'
                        : 'bg-background'}"
                      onclick={() => toggleCategoria(`${banco}-${categoria}`)}
                      aria-expanded={expandedCategorias.has(
                        `${banco}-${categoria}`
                      )}
                      aria-controls="categoria-content-{banco}-{categoria}"
                      aria-label="Categoria {categoria} - {expandedCategorias.has(
                        `${banco}-${categoria}`
                      )
                        ? 'Expandida'
                        : 'Recolhida'}"
                    >
                      <div class="flex items-center gap-2">
                        <div class="flex-1">
                          <div class="flex items-center gap-2">
                            <span class="font-medium text-base"
                              >{categoria}</span
                            >
                            <Badge variant="outline" class="text-sm">
                              {@html wrapNumbersWithFont(
                                `${countAssetsInCategory(conteudo)} tipo(s)`
                              )}
                            </Badge>
                          </div>
                          <div class="text-caption">
                            {@html wrapNumbersWithFont(
                              `Total: ${formatCurrency(conteudo._total_categoria || 0)}`
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
                      <div
                        id="categoria-content-{banco}-{categoria}"
                        class="border-t bg-muted/10 p-3 space-y-2 transition-all duration-300 ease-in-out"
                        role="region"
                        aria-label="Tipos da categoria {categoria}"
                      >
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
                                class="w-full justify-between p-2 h-auto text-left hover:bg-hover-active transition-all duration-200 ease-in-out {expandedTipos.has(
                                  `${banco}-${categoria}-${tipo}`
                                )
                                  ? 'bg-hover-active'
                                  : 'bg-background'}"
                                onclick={() =>
                                  toggleTipo(`${banco}-${categoria}-${tipo}`)}
                                aria-expanded={expandedTipos.has(
                                  `${banco}-${categoria}-${tipo}`
                                )}
                                aria-controls="tipo-content-{banco}-{categoria}-{tipo}"
                                aria-label="Tipo {tipo} - {expandedTipos.has(
                                  `${banco}-${categoria}-${tipo}`
                                )
                                  ? 'Expandido'
                                  : 'Recolhido'}"
                              >
                                <div class="flex items-center gap-2">
                                  <div class="flex-1">
                                    <div class="flex items-center gap-2">
                                      <AssetTypeIndicator
                                        assetType={tipo}
                                        context="main"
                                        showColorIndicator={true}
                                        className="text-base font-medium"
                                      />
                                      <Badge variant="outline" class="text-sm">
                                        {@html wrapNumbersWithFont(
                                          `${countAssetsInType(grupo)} item(s)`
                                        )}
                                      </Badge>
                                    </div>
                                    <div class="text-sm text-muted-foreground">
                                      {@html wrapNumbersWithFont(
                                        `Total: ${formatCurrency(grupo._total_tipo || 0)}`
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
                                <div
                                  id="tipo-content-{banco}-{categoria}-{tipo}"
                                  class="border-t p-2 transition-all duration-300 ease-in-out"
                                  role="region"
                                  aria-label="Ativos do tipo {tipo}"
                                >
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
    {:else if data && !data.mensagem}
      <!-- Fallback para dados em formato de tabela simples -->
      <TabelaFinanceiraEnhanced
        {data}
        mode="consolidado"
        title="Dados Consolidados"
      />
    {:else}
      <!-- Estado vazio quando não há dados -->
      <div class="text-center py-12">
        <p class="text-body mb-2">Nenhum dado disponível</p>
        <p class="text-caption">
          Selecione uma carteira e data para visualizar os dados consolidados.
        </p>
      </div>
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

  /* Transições suaves para accordions - Apple-style */
  :global([data-banco], [data-categoria], [data-tipo]) {
    transition:
      opacity 300ms cubic-bezier(0.4, 0, 0.2, 1),
      transform 300ms cubic-bezier(0.4, 0, 0.2, 1),
      background-color 200ms ease-in-out;
  }

  /* Transições suaves para botões de accordion */
  :global([data-banco] button, [data-categoria] button, [data-tipo] button) {
    transition:
      background-color 200ms cubic-bezier(0.4, 0, 0.2, 1),
      transform 150ms cubic-bezier(0.4, 0, 0.2, 1),
      box-shadow 200ms cubic-bezier(0.4, 0, 0.2, 1);
  }

  /* Hover effects com estilo Apple */
  :global(
      [data-banco] button:hover,
      [data-categoria] button:hover,
      [data-tipo] button:hover
    ) {
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  /* Active state feedback */
  :global(
      [data-banco] button:active,
      [data-categoria] button:active,
      [data-tipo] button:active
    ) {
    transform: translateY(0);
    transition-duration: 100ms;
  }

  /* Transições para conteúdo expandido */
  :global([role="region"]) {
    animation: slideDown 300ms cubic-bezier(0.4, 0, 0.2, 1);
  }

  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateY(-8px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  /* Focus styles para acessibilidade */
  :global(
      [data-banco] button:focus-visible,
      [data-categoria] button:focus-visible,
      [data-tipo] button:focus-visible
    ) {
    outline: 2px solid hsl(var(--ring));
    outline-offset: 2px;
    box-shadow:
      0 0 0 2px hsl(var(--background)),
      0 0 0 4px hsl(var(--ring));
  }
</style>

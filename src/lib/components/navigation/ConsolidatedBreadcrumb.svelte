<script>
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
  import { goto } from "$app/navigation";
  import { dadosConsulta } from "$lib/stores/tabelas.js";

  let { breadcrumbPath = [], onNavigate = null } = $props();

  // Estados para controle dos popovers
  let openBancoPopover = $state(false);
  let openCategoriaPopover = $state(false);
  let openTipoPopover = $state(false);

  // Função para navegar via breadcrumb - usando SPA navigation
  function handleNavigate(action, ...params) {
    console.log("Breadcrumb navigation:", action, params);

    if (onNavigate) {
      onNavigate(action, ...params);
    } else {
      // Navegação padrão usando SPA routing
      let targetUrl = "/tabelas?modo=consolidado";

      if (action === "root") {
        // Volta para a view consolidada sem filtros específicos
        goto(targetUrl);
      } else if (action === "banco") {
        // Navegar para um banco específico - pode ser implementado com query params
        const banco = params[0];
        targetUrl += `&banco=${encodeURIComponent(banco)}`;
        goto(targetUrl);
      } else if (action === "categoria") {
        // Navegar para banco + categoria
        const [banco, categoria] = params;
        targetUrl += `&banco=${encodeURIComponent(banco)}&categoria=${encodeURIComponent(categoria)}`;
        goto(targetUrl);
      } else if (action === "tipo") {
        // Navegar para banco + categoria + tipo
        const [banco, categoria, tipo] = params;
        targetUrl += `&banco=${encodeURIComponent(banco)}&categoria=${encodeURIComponent(categoria)}&tipo=${encodeURIComponent(tipo)}`;
        goto(targetUrl);
      }
    }
  }

  // Funções para obter opções dos dropdowns baseadas nos dados atuais
  function getBancoOptions() {
    if (!$dadosConsulta?.agrupados) return [];

    return Object.keys($dadosConsulta.agrupados).map((banco) => ({
      value: banco,
      label: banco,
    }));
  }

  function getCategoriaOptions(banco) {
    if (!$dadosConsulta?.agrupados?.[banco]) return [];

    return Object.keys($dadosConsulta.agrupados[banco])
      .filter((key) => key !== "_total_banco")
      .map((categoria) => ({
        value: categoria,
        label: categoria,
      }));
  }

  function getTipoOptions(banco, categoria) {
    if (!$dadosConsulta?.agrupados?.[banco]?.[categoria]) return [];

    return Object.keys($dadosConsulta.agrupados[banco][categoria])
      .filter((key) => key !== "_total_categoria")
      .map((tipo) => ({
        value: tipo,
        label: tipo,
      }));
  }

  // Funções de navegação para comboboxes
  function navigateToBanco(novoBanco) {
    handleNavigate("banco", novoBanco);
  }

  function navigateToCategoria(novaCategoria) {
    // Precisa do banco atual do breadcrumb
    const bancoAtual =
      breadcrumbPath.find((item) => item.level === "banco")?.key ||
      breadcrumbPath.find((item) => item.level === "banco")?.label;
    if (bancoAtual) {
      handleNavigate("categoria", bancoAtual, novaCategoria);
    }
  }

  function navigateToTipo(novoTipo) {
    // Precisa do banco e categoria atuais do breadcrumb
    const bancoAtual =
      breadcrumbPath.find((item) => item.level === "banco")?.key ||
      breadcrumbPath.find((item) => item.level === "banco")?.label;
    const categoriaAtual =
      breadcrumbPath.find((item) => item.level === "categoria")?.key ||
      breadcrumbPath.find((item) => item.level === "categoria")?.label;

    if (bancoAtual && categoriaAtual) {
      handleNavigate("tipo", bancoAtual, categoriaAtual, novoTipo);
    }
  }
</script>

<!-- Breadcrumb Sticky para Posição Consolidada -->
<div
  class="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b transition-all duration-200"
>
  <div class="flex h-16 items-center px-6">
    <Breadcrumb>
      <BreadcrumbList>
        {#each breadcrumbPath as breadcrumbItem, index}
          {#if index > 0}
            <BreadcrumbSeparator />
          {/if}
          <BreadcrumbItem>
            {#if breadcrumbItem.level === "root"}
              <!-- Root - navegação regressiva -->
              <BreadcrumbLink onclick={() => handleNavigate("root")}>
                {breadcrumbItem.label}
              </BreadcrumbLink>
            {:else if breadcrumbItem.level === "banco" && getBancoOptions().length > 1}
              <!-- Banco com dropdown -->
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
                            {#if breadcrumbItem.key === option.value || breadcrumbItem.label === option.value}
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
              <!-- Banco sem dropdown -->
              <BreadcrumbPage>{breadcrumbItem.label}</BreadcrumbPage>
            {:else if breadcrumbItem.level === "categoria"}
              <!-- Categoria com/sem dropdown -->
              {@const bancoAtual =
                breadcrumbPath.find((item) => item.level === "banco")?.key ||
                breadcrumbPath.find((item) => item.level === "banco")?.label}
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
                              {#if breadcrumbItem.label === option.value || breadcrumbItem.key === option.value}
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
                <BreadcrumbPage>{breadcrumbItem.label}</BreadcrumbPage>
              {/if}
            {:else if breadcrumbItem.level === "tipo"}
              <!-- Tipo com/sem dropdown -->
              {@const bancoAtual =
                breadcrumbPath.find((item) => item.level === "banco")?.key ||
                breadcrumbPath.find((item) => item.level === "banco")?.label}
              {@const categoriaAtual =
                breadcrumbPath.find((item) => item.level === "categoria")
                  ?.key ||
                breadcrumbPath.find((item) => item.level === "categoria")
                  ?.label}
              {#if bancoAtual && categoriaAtual && getTipoOptions(bancoAtual, categoriaAtual).length > 1}
                <Popover.Root bind:open={openTipoPopover}>
                  <Popover.Trigger
                    class="flex items-center gap-1 font-semibold text-foreground hover:bg-muted/50 rounded-sm px-1 py-0.5 transition-colors"
                  >
                    <span>{breadcrumbItem.label}</span>
                    <ChevronDown class="h-3 w-3 text-muted-foreground" />
                  </Popover.Trigger>
                  <Popover.Content class="w-64 p-0" align="start">
                    <Command.Root>
                      <Command.Input placeholder="Buscar tipo..." class="h-9" />
                      <Command.List>
                        <Command.Empty>Nenhum tipo encontrado.</Command.Empty>
                        <Command.Group>
                          {#each getTipoOptions(bancoAtual, categoriaAtual) as option}
                            <Command.Item
                              value={option.value}
                              onSelect={() => {
                                navigateToTipo(option.value);
                                openTipoPopover = false;
                              }}
                              class="flex items-center justify-between"
                            >
                              <span>{option.label}</span>
                              {#if breadcrumbItem.label === option.value || breadcrumbItem.key === option.value}
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
                <BreadcrumbPage>{breadcrumbItem.label}</BreadcrumbPage>
              {/if}
            {/if}
          </BreadcrumbItem>
        {/each}
      </BreadcrumbList>
    </Breadcrumb>
  </div>
</div>

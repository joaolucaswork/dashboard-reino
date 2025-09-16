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

  let { breadcrumbPath = [], onNavigate = null } = $props();

  // Breadcrumb padrão para teste
  $effect(() => {
    if (breadcrumbPath.length === 0) {
      breadcrumbPath = [
        { label: "Posição Consolidada", level: "root" },
        { label: "Itaú Unibanco", level: "banco", key: "Itaú Unibanco" },
        { label: "Renda Fixa", level: "categoria", banco: "Itaú Unibanco" },
        {
          label: "CDB",
          level: "tipo",
          banco: "Itaú Unibanco",
          categoria: "Renda Fixa",
        },
      ];
    }
  });

  // Estados para controle dos popovers
  let openBancoPopover = $state(false);
  let openCategoriaPopover = $state(false);
  let openTipoPopover = $state(false);

  // Função para navegar via breadcrumb
  function handleNavigate(action, ...params) {
    if (onNavigate) {
      onNavigate(action, ...params);
    }
  }

  // Funções para obter opções dos dropdowns
  function getBancoOptions() {
    // Esta função será implementada baseada nos dados disponíveis
    return [];
  }

  function getCategoriaOptions(banco) {
    // Esta função será implementada baseada nos dados disponíveis
    return [];
  }

  function getTipoOptions(banco, categoria) {
    // Esta função será implementada baseada nos dados disponíveis
    return [];
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
                              handleNavigate("banco", option.value);
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
              <!-- Banco sem dropdown -->
              <BreadcrumbPage>{breadcrumbItem.label}</BreadcrumbPage>
            {:else if breadcrumbItem.level === "categoria"}
              <!-- Categoria com/sem dropdown -->
              {#if getCategoriaOptions(breadcrumbItem.banco).length > 1}
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
                          {#each getCategoriaOptions(breadcrumbItem.banco) as option}
                            <Command.Item
                              value={option.value}
                              onSelect={() => {
                                handleNavigate(
                                  "categoria",
                                  breadcrumbItem.banco,
                                  option.value
                                );
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
                <BreadcrumbPage>{breadcrumbItem.label}</BreadcrumbPage>
              {/if}
            {:else if breadcrumbItem.level === "tipo"}
              <!-- Tipo com/sem dropdown -->
              {#if getTipoOptions(breadcrumbItem.banco, breadcrumbItem.categoria).length > 1}
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
                          {#each getTipoOptions(breadcrumbItem.banco, breadcrumbItem.categoria) as option}
                            <Command.Item
                              value={option.value}
                              onSelect={() => {
                                handleNavigate(
                                  "tipo",
                                  breadcrumbItem.banco,
                                  breadcrumbItem.categoria,
                                  option.value
                                );
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
                <BreadcrumbPage>{breadcrumbItem.label}</BreadcrumbPage>
              {/if}
            {/if}
          </BreadcrumbItem>
        {/each}
      </BreadcrumbList>
    </Breadcrumb>
  </div>
</div>

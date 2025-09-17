<script lang="ts">
  import { tick } from "svelte";
  import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
  } from "$lib/components/ui/command";
  import {
    Popover,
    PopoverContent,
    PopoverTrigger,
  } from "$lib/components/ui/popover";
  import { Check, ChevronsUpDown } from "@lucide/svelte";
  import { cn } from "$lib/utils.js";

  // Tipos para opções agrupadas
  interface GroupedOption {
    value: string;
    label: string;
    description?: string;
    group?: string;
    pessoa?: string;
    banco?: string;
    numeroConta?: string;
  }

  interface PersonGroup {
    pessoa: string;
    contas: GroupedOption[];
  }

  // Props
  let {
    value = $bindable(),
    options = [],
    placeholder = "Selecione uma pessoa/banco...",
    searchPlaceholder = "Buscar pessoa ou banco...",
    emptyMessage = "Nenhuma pessoa encontrada.",
    disabled = false,
    grouped = false,
    class: className = "",
    ...restProps
  }: {
    value?: string;
    options?: GroupedOption[];
    placeholder?: string;
    searchPlaceholder?: string;
    emptyMessage?: string;
    disabled?: boolean;
    grouped?: boolean;
    class?: string;
  } = $props();

  let open = $state(false);
  let triggerRef = $state<HTMLDivElement>();

  // Agrupar opções por pessoa quando grouped = true
  let groupedOptions = $derived.by(() => {
    if (!grouped || options.length === 0) {
      return [];
    }

    console.log("Opções recebidas:", options.length);
    console.log("Primeiras 5 opções:", options.slice(0, 5));

    // Agrupar por pessoa primeiro (pode haver múltiplas contas por pessoa)
    const peopleMap = new Map<string, GroupedOption[]>();

    options.forEach((option) => {
      const pessoa =
        option.pessoa || option.label.split(" - ")[0] || "Sem identificação";

      if (!peopleMap.has(pessoa)) {
        peopleMap.set(pessoa, []);
      }

      // Verificar se já existe uma conta com o mesmo value para evitar duplicatas
      const existingOption = peopleMap
        .get(pessoa)!
        .find((existing) => existing.value === option.value);
      if (!existingOption) {
        peopleMap.get(pessoa)!.push(option);
      }
    });

    const result = Array.from(peopleMap.entries())
      .map(
        ([pessoa, contas]): PersonGroup => ({
          pessoa,
          contas: contas.sort((a, b) =>
            (a.banco || "").localeCompare(b.banco || "", "pt-BR")
          ),
        })
      )
      .sort((a, b) => a.pessoa.localeCompare(b.pessoa, "pt-BR"));

    console.log(
      "Pessoas agrupadas:",
      result.map((r) => `${r.pessoa} (${r.contas.length} contas)`)
    );
    return result;
  });

  // Calcular patrimônio total por pessoa
  function calculatePersonTotal(contas: GroupedOption[]): number {
    return contas.reduce((total, conta) => {
      const match = conta.description?.match(/R\$\s*([\d.,]+)/);
      if (match) {
        const valor = parseFloat(match[1].replace(/\./g, "").replace(",", "."));
        return total + (isNaN(valor) ? 0 : valor);
      }
      return total;
    }, 0);
  }

  // Formatar valor monetário para exibição
  function formatarMoeda(valor: number): string {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(valor);
  }

  // Encontrar opção selecionada
  let selectedOption = $derived(
    options.find((option) => option.value === value)
  );

  // Fechar e focar no trigger
  function closeAndFocusTrigger() {
    open = false;
    tick().then(() => {
      triggerRef?.focus();
    });
  }

  // Lidar com seleção
  function handleSelect(selectedValue: string) {
    value = selectedValue === value ? "" : selectedValue;
    closeAndFocusTrigger();
  }

  // Formatar label do trigger selecionado
  function formatSelectedLabel(option: GroupedOption | undefined): string {
    if (!option) return placeholder;

    if (grouped && option.pessoa && option.banco) {
      return `${option.pessoa} • ${option.banco}`;
    }

    return option.label;
  }
</script>

<Popover bind:open>
  <PopoverTrigger class="w-full">
    <div
      bind:this={triggerRef}
      role="combobox"
      aria-expanded={open}
      class={cn(
        "flex h-12 w-full items-center justify-between rounded-md border border-input bg-card px-4 py-3 text-sm placeholder:text-muted-foreground focus:outline-none disabled:cursor-not-allowed disabled:opacity-50",
        !value && "text-muted-foreground font-normal",
        value && "font-medium",
        disabled && "cursor-not-allowed opacity-50",
        className
      )}
      tabindex={disabled ? -1 : 0}
      {...restProps}
    >
      {formatSelectedLabel(selectedOption)}
      <ChevronsUpDown class="ml-3 h-4 w-4 shrink-0 opacity-50" />
    </div>
  </PopoverTrigger>
  <PopoverContent class="w-96 p-0" align="start">
    <Command>
      <CommandInput placeholder={searchPlaceholder} class="h-9" />
      <CommandList>
        <CommandEmpty>{emptyMessage}</CommandEmpty>

        {#if grouped && groupedOptions.length > 0}
          <!-- Exibição agrupada por pessoa -->
          {#each groupedOptions as personGroup, groupIndex (groupIndex)}
            {#if groupIndex > 0}
              <CommandSeparator />
            {/if}

            <CommandGroup>
              <!-- Cabeçalho da pessoa com patrimônio total -->
              <div
                class="px-2 py-2 text-sm font-semibold text-foreground border-b border-border/40"
              >
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-2">
                    <span class="font-medium">{personGroup.pessoa}</span>
                  </div>
                  <div
                    class="flex items-center gap-2 text-xs text-muted-foreground"
                  >
                    <span
                      >{formatarMoeda(
                        calculatePersonTotal(personGroup.contas)
                      )}</span
                    >
                    <span>•</span>
                    <span
                      >{personGroup.contas.length} conta{personGroup.contas
                        .length !== 1
                        ? "s"
                        : ""}</span
                    >
                  </div>
                </div>
              </div>

              <!-- Contas da pessoa como sub-itens -->
              {#each personGroup.contas as option (option.value)}
                <CommandItem
                  value={option.value}
                  onSelect={() => handleSelect(option.value)}
                  class="flex items-center justify-between pl-6 py-2.5 ml-2 mr-2 rounded-md hover:bg-accent/50 transition-colors"
                >
                  <div class="flex items-center gap-3 flex-1 min-w-0">
                    <!-- Indicador visual de hierarquia -->
                    <div
                      class="w-0.5 h-4 bg-border rounded-full flex-shrink-0"
                    ></div>

                    <!-- Informações da conta -->
                    <div class="flex flex-col flex-1 min-w-0">
                      <div class="flex items-center gap-2">
                        <span class="font-medium text-sm truncate">
                          {option.banco || "Banco não informado"}
                        </span>
                        {#if option.numeroConta}
                          <span
                            class="text-xs text-muted-foreground font-medium"
                          >
                            • {option.numeroConta}
                          </span>
                        {/if}
                      </div>
                      {#if option.description}
                        <span
                          class="text-xs text-muted-foreground truncate font-medium"
                        >
                          {option.description}
                        </span>
                      {/if}
                    </div>
                  </div>

                  <!-- Indicador de seleção -->
                  <Check
                    class={cn(
                      "ml-2 h-4 w-4 flex-shrink-0 text-primary",
                      value === option.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                </CommandItem>
              {/each}
            </CommandGroup>
          {/each}
        {:else}
          <!-- Exibição simples sem agrupamento -->
          <CommandGroup>
            {#each options as option}
              <CommandItem
                value={option.value}
                onSelect={() => handleSelect(option.value)}
                class="flex items-center justify-between"
              >
                <div class="flex flex-col">
                  <span>{option.label}</span>
                  {#if option.description}
                    <span class="text-xs text-muted-foreground"
                      >{option.description}</span
                    >
                  {/if}
                </div>
                <Check
                  class={cn(
                    "ml-auto h-4 w-4",
                    value === option.value ? "opacity-100" : "opacity-0"
                  )}
                />
              </CommandItem>
            {/each}
          </CommandGroup>
        {/if}
      </CommandList>
    </Command>
  </PopoverContent>
</Popover>

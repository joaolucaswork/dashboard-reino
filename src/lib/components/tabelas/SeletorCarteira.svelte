<script lang="ts">
  import { carteiraAtual } from "$lib/stores/tabelas.js";
  import { mockCarteiras } from "$lib/mocks/tabelas.js";

  import { Combobox } from "$lib/components/ui/combobox";
  import { Badge } from "$lib/components/ui/badge";
  import { User } from "@lucide/svelte";

  // Transformar carteiras em opções para o Combobox
  const carteiraOptions = mockCarteiras.map((carteira) => ({
    value: carteira,
    label: carteira.replace(/_/g, " "),
  }));

  // Formatar nome da carteira para exibição
  function formatarNomeCarteira(nome: string): string {
    return nome.replace(/_/g, " ");
  }

  // Obter iniciais da carteira para o avatar
  function obterIniciais(nome: string): string {
    return nome
      .replace(/_/g, " ")
      .split(" ")
      .map((palavra) => palavra[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }
</script>

<div class="space-y-6">
  <div class="flex items-center gap-3">
    <div class="flex items-center gap-3 flex-1">
      <User size={16} class="text-primary" />
      <span class="text-label">Carteira Atual:</span>
    </div>
  </div>

  <div class="flex items-center gap-4">
    <!-- Exibição da carteira atual -->
    <div
      class="flex items-center gap-4 flex-1 p-4 bg-muted/30 border border-border/50 rounded-lg"
    >
      {#if $carteiraAtual}
        <div class="flex items-center gap-3">
          <div
            class="w-8 h-8 bg-primary/10 border border-primary/20 rounded-full flex items-center justify-center"
          >
            <span class="text-xs font-medium text-primary">
              {obterIniciais($carteiraAtual)}
            </span>
          </div>
          <div class="flex flex-col">
            <span class="text-label">
              {formatarNomeCarteira($carteiraAtual)}
            </span>
            <span class="text-caption"> Carteira selecionada </span>
          </div>
        </div>
        <Badge variant="secondary" class="text-xs">Ativa</Badge>
      {:else}
        <div class="flex items-center gap-3">
          <div
            class="w-8 h-8 bg-muted border border-border rounded-full flex items-center justify-center"
          >
            <User size={14} class="text-muted-foreground" />
          </div>
          <span class="text-caption"> Nenhuma carteira selecionada </span>
        </div>
      {/if}
    </div>
  </div>

  <!-- Seletor de carteira usando Combobox -->
  <div class="space-y-3">
    <div class="text-label">Selecionar Carteira</div>
    <Combobox
      bind:value={$carteiraAtual}
      options={carteiraOptions}
      placeholder="Selecione uma carteira"
      searchPlaceholder="Buscar carteira..."
      emptyMessage="Nenhuma carteira encontrada."
    />
  </div>

  <!-- Informações adicionais -->
  {#if $carteiraAtual}
    <div class="p-4 bg-primary/5 border border-primary/20 rounded-lg">
      <div class="flex items-start gap-3">
        <User size={14} class="text-primary mt-0.5" />
        <div class="flex-1">
          <div class="text-label">
            {formatarNomeCarteira($carteiraAtual)}
          </div>
          <div class="text-caption mt-1">
            Carteira selecionada para análise das tabelas financeiras
          </div>
        </div>
      </div>
    </div>
  {/if}
</div>

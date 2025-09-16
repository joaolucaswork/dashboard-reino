<script lang="ts">
  import { carteiraAtual } from "$lib/stores/tabelas.js";
  import { mockCarteiras } from "$lib/mocks/tabelas.js";

  import { Combobox } from "$lib/components/ui/combobox";
  import { Badge } from "$lib/components/ui/badge";

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

<div class="space-y-4">
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

  <!-- Exibição da carteira selecionada (apenas quando há seleção) -->
  {#if $carteiraAtual}
    <div
      class="flex items-center gap-3 p-3 bg-primary/5 border border-primary/20 rounded-lg"
    >
      <div
        class="w-8 h-8 bg-primary/10 border border-primary/20 rounded-full flex items-center justify-center"
      >
        <span class="text-xs font-medium text-primary">
          {obterIniciais($carteiraAtual)}
        </span>
      </div>
      <div class="flex-1">
        <span class="text-label">
          {formatarNomeCarteira($carteiraAtual)}
        </span>
      </div>
      <Badge variant="secondary" class="text-xs">Ativa</Badge>
    </div>
  {/if}
</div>

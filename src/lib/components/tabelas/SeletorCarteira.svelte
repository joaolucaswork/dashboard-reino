<script lang="ts">
  import { carteiraAtual } from "$lib/stores/tabelas.js";
  import { mockCarteiras } from "$lib/mocks/tabelas.js";

  import { Combobox } from "$lib/components/ui/combobox";
  import { Badge } from "$lib/components/ui/badge";

  // Transformar carteiras em opções para o Combobox
  const carteiraOptions = mockCarteiras
    .map((carteira) => ({
      value: carteira,
      label: carteira.replace(/_/g, " "),
    }))
    .sort((a, b) => a.label.localeCompare(b.label, "pt-BR"));

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
</div>

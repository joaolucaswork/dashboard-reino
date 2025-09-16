<script>
  import {
    dataInicial,
    dataFinal,
    camposVisiveis,
  } from "$lib/stores/tabelas.js";

  import { Label } from "$lib/components/ui/label";
  import { Button } from "$lib/components/ui/button";
  import { DatePicker } from "$lib/components/ui/date-picker";
  import { Calendar } from "@lucide/svelte";

  // Função para obter data atual no formato YYYY-MM-DD
  function getDataAtual() {
    return new Date().toISOString().split("T")[0];
  }

  // Função para obter data de 30 dias atrás
  function getData30DiasAtras() {
    const data = new Date();
    data.setDate(data.getDate() - 30);
    return data.toISOString().split("T")[0];
  }

  // Função para obter data de início do ano
  function getDataInicioAno() {
    const data = new Date();
    data.setMonth(0, 1); // Janeiro, dia 1
    return data.toISOString().split("T")[0];
  }

  // Inicializar data final com data atual se estiver vazia
  $: if (!$dataFinal) {
    dataFinal.set(getDataAtual());
  }

  // Função para definir período pré-definido
  /** @param {string} tipo */
  function definirPeriodo(tipo) {
    switch (tipo) {
      case "hoje":
        dataInicial.set(getDataAtual());
        dataFinal.set(getDataAtual());
        break;
      case "ultimos30":
        dataInicial.set(getData30DiasAtras());
        dataFinal.set(getDataAtual());
        break;
      case "anoAtual":
        dataInicial.set(getDataInicioAno());
        dataFinal.set(getDataAtual());
        break;
    }
  }

  // Validação de datas
  $: dataInicialValida =
    !$dataInicial ||
    !$dataFinal ||
    new Date($dataInicial) <= new Date($dataFinal);
  $: dataFinalValida = !$dataFinal || new Date($dataFinal) <= new Date();
</script>

<div class="space-y-6">
  <!-- Data Final -->
  <div class="space-y-3">
    <!-- Label -->
    <Label for="data-final" class="text-label flex items-center gap-2">
      <Calendar size={14} class="text-primary" />
      Data Final (Data de Referência)
      <span class="text-destructive">*</span>
    </Label>

    <!-- Date Picker -->
    <div class="w-full max-w-sm">
      <DatePicker
        bind:value={$dataFinal}
        minValue={$dataInicial}
        maxValue={getDataAtual()}
        error={!dataFinalValida}
        placeholder="Selecione a data final"
      />
      {#if !dataFinalValida}
        <p class="text-caption text-destructive mt-1">
          A data final não pode ser futura
        </p>
      {/if}
    </div>
  </div>

  <!-- Data Inicial (condicional) -->
  {#if $camposVisiveis.dataInicial}
    <div class="flex flex-col sm:flex-row sm:items-center gap-4">
      <Label
        for="data-inicial"
        class="text-label flex items-center gap-2 whitespace-nowrap"
      >
        <Calendar size={14} class="text-primary" />
        Data Inicial
      </Label>
      <div class="flex-1 max-w-xs">
        <DatePicker
          bind:value={$dataInicial}
          maxValue={$dataFinal || getDataAtual()}
          error={!dataInicialValida}
          placeholder="Selecione a data inicial"
        />
        {#if !dataInicialValida}
          <p class="text-caption text-destructive mt-1">
            A data inicial deve ser anterior ou igual à data final
          </p>
        {/if}
      </div>
    </div>
  {/if}
</div>

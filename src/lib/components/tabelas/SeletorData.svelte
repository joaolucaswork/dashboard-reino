<script>
  import {
    dataInicial,
    dataFinal,
    camposVisiveis,
  } from "$lib/stores/tabelas.js";

  import { Label } from "$lib/components/ui/label";
  import { Button } from "$lib/components/ui/button";
  import { DatePicker } from "$lib/components/ui/date-picker";
  import { Calendar, Clock } from "@lucide/svelte";

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
  <!-- Botões de período rápido -->
  <div class="flex flex-wrap gap-3">
    <Button
      variant="outline"
      size="sm"
      onclick={() => definirPeriodo("hoje")}
      class="text-xs"
    >
      <Clock size={12} class="mr-1" />
      Hoje
    </Button>
    <Button
      variant="outline"
      size="sm"
      onclick={() => definirPeriodo("ultimos30")}
      class="text-xs"
    >
      <Calendar size={12} class="mr-1" />
      Últimos 30 dias
    </Button>
    <Button
      variant="outline"
      size="sm"
      onclick={() => definirPeriodo("anoAtual")}
      class="text-xs"
    >
      <Calendar size={12} class="mr-1" />
      Ano atual
    </Button>
  </div>

  <!-- Campos de data -->
  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
    <!-- Data Inicial (condicional) -->
    {#if $camposVisiveis.dataInicial}
      <div class="space-y-3">
        <Label for="data-inicial" class="text-label flex items-center gap-2">
          <Calendar size={14} class="text-primary" />
          Data Inicial
        </Label>
        <DatePicker
          bind:value={$dataInicial}
          maxValue={$dataFinal || getDataAtual()}
          error={!dataInicialValida}
          placeholder="Selecione a data inicial"
        />
        {#if !dataInicialValida}
          <p class="text-caption text-destructive">
            A data inicial deve ser anterior ou igual à data final
          </p>
        {/if}
      </div>
    {/if}

    <!-- Data Final (sempre visível) -->
    <div class="space-y-3">
      <Label for="data-final" class="text-label flex items-center gap-2">
        <Calendar size={14} class="text-primary" />
        Data Final (Data de Referência)
        <span class="text-destructive">*</span>
      </Label>
      <DatePicker
        bind:value={$dataFinal}
        minValue={$dataInicial}
        maxValue={getDataAtual()}
        error={!dataFinalValida}
        placeholder="Selecione a data final"
      />
      {#if !dataFinalValida}
        <p class="text-caption text-destructive">
          A data final não pode ser futura
        </p>
      {/if}
    </div>
  </div>

  <!-- Resumo do período selecionado -->
  {#if $dataInicial && $dataFinal && dataInicialValida && dataFinalValida}
    {@const inicio = new Date($dataInicial)}
    {@const fim = new Date($dataFinal)}
    {@const diffTime = Math.abs(fim.getTime() - inicio.getTime())}
    {@const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1}

    <div class="p-4 bg-primary/5 border border-primary/20 rounded-lg">
      <div class="flex items-center gap-3">
        <Calendar size={14} class="text-primary" />
        <span class="text-label"> Período selecionado: </span>
        <span class="text-body">
          {diffDays} dia{diffDays !== 1 ? "s" : ""}
          ({inicio.toLocaleDateString("pt-BR")} até {fim.toLocaleDateString(
            "pt-BR"
          )})
        </span>
      </div>
    </div>
  {:else if $dataFinal && dataFinalValida}
    <div class="p-4 bg-primary/5 border border-primary/20 rounded-lg">
      <div class="flex items-center gap-3">
        <Calendar size={14} class="text-primary" />
        <span class="text-label"> Data de referência: </span>
        <span class="text-body">
          {new Date($dataFinal).toLocaleDateString("pt-BR")}
        </span>
      </div>
    </div>
  {/if}
</div>

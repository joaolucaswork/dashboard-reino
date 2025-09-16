<script lang="ts">
  import {
    bancoSelecionado,
    operacaoSelecionada,
    perfilReferencia,
    camposVisiveis,
  } from "$lib/stores/tabelas.js";
  import { mockBancos, mockOperacoes, mockPerfis } from "$lib/mocks/tabelas.js";

  import { Label } from "$lib/components/ui/label";
  import { Combobox } from "$lib/components/ui/combobox";
  import { Badge } from "$lib/components/ui/badge";
  import { Building2, ArrowRightLeft, Target, Info } from "@lucide/svelte";

  // Descrições dos perfis
  const descricoesPerfis: Record<string, string> = {
    conservador: "Foco em renda fixa e baixo risco (RF: 90%, RV: 10%)",
    moderado: "Equilibrio entre renda fixa e variável (RF: 75%, RV: 25%)",
    sofisticado: "Maior exposição à renda variável (RF: 50%, RV: 50%)",
  };
</script>

<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
  <!-- Seletor de Banco -->
  {#if $camposVisiveis.banco}
    <div class="space-y-4">
      <Label class="text-label flex items-center gap-2">
        <Building2 size={14} class="text-primary" />
        Instituição Financeira
        <span class="text-destructive">*</span>
      </Label>

      <Combobox
        bind:value={$bancoSelecionado}
        options={mockBancos.filter((banco) => banco.value !== "")}
        placeholder="Selecione o banco"
        searchPlaceholder="Buscar banco..."
        emptyMessage="Nenhum banco encontrado."
      />

      {#if $bancoSelecionado && $bancoSelecionado !== ""}
        <div class="flex items-center gap-3">
          <Badge variant="secondary" class="text-xs">
            {mockBancos.find((b) => b.value === $bancoSelecionado)?.label}
          </Badge>
          {#if $bancoSelecionado === "todos"}
            <span class="text-caption">
              Incluirá dados de todas as instituições
            </span>
          {/if}
        </div>
      {/if}
    </div>
  {/if}

  <!-- Seletor de Operação -->
  {#if $camposVisiveis.operacao}
    <div class="space-y-4">
      <Label class="text-label flex items-center gap-2">
        <ArrowRightLeft size={14} class="text-primary" />
        Tipo de Operação
      </Label>

      <Combobox
        bind:value={$operacaoSelecionada}
        options={mockOperacoes}
        placeholder="Selecione a operação"
        searchPlaceholder="Buscar operação..."
        emptyMessage="Nenhuma operação encontrada."
      />

      {#if $operacaoSelecionada}
        <div class="flex items-center gap-3">
          <Badge variant="outline" class="text-xs">
            {mockOperacoes.find((o) => o.value === $operacaoSelecionada)?.label}
          </Badge>
        </div>
      {/if}
    </div>
  {/if}

  <!-- Seletor de Perfil de Referência -->
  {#if $camposVisiveis.perfil}
    <div class="space-y-4">
      <Label class="text-label flex items-center gap-2">
        <Target size={14} class="text-primary" />
        Perfil de Referência
        <span class="text-destructive">*</span>
      </Label>

      <Combobox
        bind:value={$perfilReferencia}
        options={mockPerfis
          .filter((perfil) => perfil.value !== "")
          .map((perfil) => ({
            value: perfil.value,
            label: perfil.label,
            description: descricoesPerfis[perfil.value] || "",
          }))}
        placeholder="Selecione o perfil"
        searchPlaceholder="Buscar perfil..."
        emptyMessage="Nenhum perfil encontrado."
      />

      {#if $perfilReferencia}
        <div class="p-4 bg-primary/5 border border-primary/20 rounded-lg">
          <div class="flex items-start gap-3">
            <Info size={14} class="text-primary mt-0.5 flex-shrink-0" />
            <div class="space-y-1">
              <div class="text-label">
                Perfil {mockPerfis.find((p) => p.value === $perfilReferencia)
                  ?.label}
              </div>
              <div class="text-caption">
                {descricoesPerfis[$perfilReferencia]}
              </div>
            </div>
          </div>
        </div>
      {/if}
    </div>
  {/if}
</div>

<!-- Resumo das opções selecionadas -->
{#if ($camposVisiveis.banco && $bancoSelecionado) || ($camposVisiveis.operacao && $operacaoSelecionada) || ($camposVisiveis.perfil && $perfilReferencia)}
  <div class="mt-8 p-6 bg-muted/30 border border-border/50 rounded-lg">
    <h4 class="text-label mb-4 flex items-center gap-3">
      <Info size={14} class="text-primary" />
      Configurações Selecionadas
    </h4>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      {#if $camposVisiveis.banco && $bancoSelecionado}
        <div>
          <span class="text-caption">Banco:</span>
          <div class="text-label">
            {mockBancos.find((b) => b.value === $bancoSelecionado)?.label}
          </div>
        </div>
      {/if}

      {#if $camposVisiveis.operacao && $operacaoSelecionada}
        <div>
          <span class="text-caption">Operação:</span>
          <div class="text-label">
            {mockOperacoes.find((o) => o.value === $operacaoSelecionada)?.label}
          </div>
        </div>
      {/if}

      {#if $camposVisiveis.perfil && $perfilReferencia}
        <div>
          <span class="text-caption">Perfil:</span>
          <div class="text-label">
            {mockPerfis.find((p) => p.value === $perfilReferencia)?.label}
          </div>
        </div>
      {/if}
    </div>
  </div>
{/if}

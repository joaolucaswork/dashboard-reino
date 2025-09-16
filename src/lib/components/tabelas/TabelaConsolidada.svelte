<script>
  import { Card, CardContent, CardHeader, CardTitle } from "$lib/components/ui/card";
  import { Button } from "$lib/components/ui/button";
  import TabelaFinanceira from "./TabelaFinanceira.svelte";
  import { formatCurrency } from "$lib/components/ui/data-table/index.js";
  import { ChartBar, ChevronDown, ChevronRight, Building2, FolderOpen, Target } from "@lucide/svelte";

  let { data } = $props();

  // Estados de expansão para o accordion
  let expandedBancos = $state(new Set());
  let expandedCategorias = $state(new Set());
  let expandedTipos = $state(new Set());

  function toggleBanco(banco) {
    if (expandedBancos.has(banco)) {
      expandedBancos.delete(banco);
    } else {
      expandedBancos.add(banco);
    }
    expandedBancos = new Set(expandedBancos);
  }

  function toggleCategoria(categoriaKey) {
    if (expandedCategorias.has(categoriaKey)) {
      expandedCategorias.delete(categoriaKey);
    } else {
      expandedCategorias.add(categoriaKey);
    }
    expandedCategorias = new Set(expandedCategorias);
  }

  function toggleTipo(tipoKey) {
    if (expandedTipos.has(tipoKey)) {
      expandedTipos.delete(tipoKey);
    } else {
      expandedTipos.add(tipoKey);
    }
    expandedTipos = new Set(expandedTipos);
  }

  // Função para criar dados de tabela a partir das linhas
  function createTableData(linhas) {
    if (!linhas || !Array.isArray(linhas)) return [];
    return linhas;
  }
</script>

<Card>
  <CardHeader>
    <CardTitle class="text-lg font-semibold flex items-center gap-2">
      <ChartBar size={20} class="text-primary" />
      Posição Consolidada
    </CardTitle>
    {#if data?.carteira && data?.data_final && data?.total_geral}
      <div class="bg-muted/30 rounded-lg p-4 mt-4">
        <div class="flex items-center justify-between text-sm">
          <span>Carteira: <strong>{data.carteira.replace('_', ' ')}</strong></span>
          <span>Data: <strong>{data.data_final}</strong></span>
          <span>Total Geral: <strong>{formatCurrency(parseFloat(data.total_geral.replace(/[^\d,-]/g, '').replace(',', '.')))}</strong></span>
        </div>
      </div>
    {/if}
  </CardHeader>
  <CardContent class="space-y-4">
    {#if data?.agrupados}
      <!-- Accordion por Bancos -->
      {#each Object.entries(data.agrupados) as [banco, categorias]}
        <div class="border rounded-lg overflow-hidden">
          <!-- Cabeçalho do Banco -->
          <Button
            variant="ghost"
            class="w-full justify-between p-4 h-auto text-left hover:bg-muted/50"
            onclick={() => toggleBanco(banco)}
          >
            <div class="flex items-center gap-3">
              <Building2 size={18} class="text-primary" />
              <div>
                <div class="font-semibold">{banco}</div>
                <div class="text-caption">
                  Total: {formatCurrency(categorias._total_banco || 0)}
                </div>
              </div>
            </div>
            {#if expandedBancos.has(banco)}
              <ChevronDown size={16} />
            {:else}
              <ChevronRight size={16} />
            {/if}
          </Button>

          <!-- Conteúdo do Banco -->
          {#if expandedBancos.has(banco)}
            <div class="border-t bg-muted/20 p-4 space-y-3">
              {#each Object.entries(categorias) as [categoria, conteudo]}
                {#if categoria !== '_total_banco'}
                  <div class="border rounded-md overflow-hidden bg-background">
                    <!-- Cabeçalho da Categoria -->
                    <Button
                      variant="ghost"
                      class="w-full justify-between p-3 h-auto text-left hover:bg-muted/30"
                      onclick={() => toggleCategoria(`${banco}-${categoria}`)}
                    >
                      <div class="flex items-center gap-2">
                        <FolderOpen size={16} class="text-muted-foreground" />
                        <div>
                          <div class="font-medium">{categoria}</div>
                          <div class="text-caption">
                            Total: {formatCurrency(conteudo._total_categoria || 0)}
                          </div>
                        </div>
                      </div>
                      {#if expandedCategorias.has(`${banco}-${categoria}`)}
                        <ChevronDown size={14} />
                      {:else}
                        <ChevronRight size={14} />
                      {/if}
                    </Button>

                    <!-- Conteúdo da Categoria -->
                    {#if expandedCategorias.has(`${banco}-${categoria}`)}
                      <div class="border-t bg-muted/10 p-3 space-y-2">
                        {#each Object.entries(conteudo) as [tipo, grupo]}
                          {#if tipo !== '_total_categoria'}
                            <div class="border rounded-sm overflow-hidden bg-background">
                              <!-- Cabeçalho do Tipo -->
                              <Button
                                variant="ghost"
                                class="w-full justify-between p-2 h-auto text-left hover:bg-muted/20"
                                onclick={() => toggleTipo(`${banco}-${categoria}-${tipo}`)}
                              >
                                <div class="flex items-center gap-2">
                                  <Target size={14} class="text-muted-foreground" />
                                  <div>
                                    <div class="text-sm font-medium">{tipo}</div>
                                    <div class="text-xs text-muted-foreground">
                                      Total: {formatCurrency(grupo._total_tipo || 0)}
                                    </div>
                                  </div>
                                </div>
                                {#if expandedTipos.has(`${banco}-${categoria}-${tipo}`)}
                                  <ChevronDown size={12} />
                                {:else}
                                  <ChevronRight size={12} />
                                {/if}
                              </Button>

                              <!-- Tabela de Ativos -->
                              {#if expandedTipos.has(`${banco}-${categoria}-${tipo}`) && grupo.linhas}
                                <div class="border-t p-2">
                                  <TabelaFinanceira 
                                    data={{
                                      tables: {
                                        tab0: {
                                          lin0: data.cabecalho || {},
                                          ...grupo.linhas.reduce((acc, linha, index) => {
                                            acc[`lin${index + 1}`] = linha;
                                            return acc;
                                          }, {})
                                        }
                                      }
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
    {:else}
      <!-- Fallback para dados em formato de tabela simples -->
      <TabelaFinanceira 
        {data} 
        mode="consolidado" 
        title="Dados Consolidados"
      />
    {/if}
  </CardContent>
</Card>

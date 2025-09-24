<script lang="ts">
  import {
    carteirasDetalhadas,
    estatisticasCarteiras,
  } from "$lib/stores/carteiras.js";
  import { appConfig } from "$lib/stores/config.js";
  import { formatarMoeda } from "$lib/utils/currency.js";

  import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
  } from "$lib/components/ui/card";
  import { Badge } from "$lib/components/ui/badge";
  import { Button } from "$lib/components/ui/button";
  import {
    TrendingUp,
    Users,
    DollarSign,
    ChevronDown,
    ChevronUp,
  } from "@lucide/svelte";

  // Estado para controlar se o accordion está aberto ou fechado
  let isOpen = $state(false);

  function toggleAccordion() {
    isOpen = !isOpen;
  }
</script>

<!-- Estatísticas das Carteiras do Salesforce -->
{#if $carteirasDetalhadas.length > 0 && $appConfig.fonteCarteiras === "salesforce"}
  <Card class="bg-gradient-to-br from-card to-muted/10 border-primary/20">
    <CardHeader class="pb-4">
      <CardTitle class="text-base font-semibold">
        <Button
          variant="ghost"
          class="w-full justify-between p-0 h-auto hover:bg-transparent"
          onclick={toggleAccordion}
        >
          <div class="flex items-center gap-2">
            <div class="p-1.5 rounded-md bg-primary/10">
              <TrendingUp class="h-4 w-4 text-primary" />
            </div>
            <span>Estatísticas do Salesforce</span>
          </div>
          <div class="flex items-center gap-2">
            <Badge
              variant="outline"
              class="text-xs font-medium border-primary/30 text-primary"
            >
              Live
            </Badge>
            {#if isOpen}
              <ChevronUp class="h-4 w-4 text-muted-foreground" />
            {:else}
              <ChevronDown class="h-4 w-4 text-muted-foreground" />
            {/if}
          </div>
        </Button>
      </CardTitle>
    </CardHeader>

    {#if isOpen}
      <CardContent class="pt-0 space-y-4">
        <!-- Row 1: Totais principais -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div
            class="p-4 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100/50 border border-blue-200/50 dark:from-blue-950/30 dark:to-blue-900/20 dark:border-blue-800/30"
          >
            <div class="flex items-center justify-between mb-2">
              <div class="flex items-center gap-2">
                <div class="p-1 rounded bg-blue-500/10">
                  <Users class="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                </div>
                <span
                  class="text-sm font-medium text-blue-700 dark:text-blue-300"
                  >Total de Carteiras</span
                >
              </div>
            </div>
            <div class="text-2xl font-bold text-blue-800 dark:text-blue-200">
              {$estatisticasCarteiras.total}
            </div>
            <p class="text-xs text-blue-600/80 dark:text-blue-400/80 mt-1">
              Carteiras ativas
            </p>
          </div>

          <div
            class="p-4 rounded-lg bg-gradient-to-br from-emerald-50 to-emerald-100/50 border border-emerald-200/50 dark:from-emerald-950/30 dark:to-emerald-900/20 dark:border-emerald-800/30"
          >
            <div class="flex items-center justify-between mb-2">
              <div class="flex items-center gap-2">
                <div class="p-1 rounded bg-emerald-500/10">
                  <DollarSign
                    class="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400"
                  />
                </div>
                <span
                  class="text-sm font-medium text-emerald-700 dark:text-emerald-300"
                  >Patrimônio Total</span
                >
              </div>
            </div>
            <div
              class="text-2xl font-bold text-emerald-800 dark:text-emerald-200"
            >
              {formatarMoeda($estatisticasCarteiras.patrimonioTotal)}
            </div>
            <p
              class="text-xs text-emerald-600/80 dark:text-emerald-400/80 mt-1"
            >
              Sob gestão
            </p>
          </div>

          <div
            class="p-4 rounded-lg bg-gradient-to-br from-amber-50 to-amber-100/50 border border-amber-200/50 dark:from-amber-950/30 dark:to-amber-900/20 dark:border-amber-800/30"
          >
            <div class="flex items-center justify-between mb-2">
              <div class="flex items-center gap-2">
                <div class="p-1 rounded bg-amber-500/10">
                  <DollarSign
                    class="h-3.5 w-3.5 text-amber-600 dark:text-amber-400"
                  />
                </div>
                <span
                  class="text-sm font-medium text-amber-700 dark:text-amber-300"
                  >Mensalidade Total</span
                >
              </div>
            </div>
            <div class="text-2xl font-bold text-amber-800 dark:text-amber-200">
              {formatarMoeda($estatisticasCarteiras.mensalidadeTotal)}
            </div>
            <p class="text-xs text-amber-600/80 dark:text-amber-400/80 mt-1">
              Receita mensal
            </p>
          </div>

          <div
            class="p-4 rounded-lg bg-gradient-to-br from-purple-50 to-purple-100/50 border border-purple-200/50 dark:from-purple-950/30 dark:to-purple-900/20 dark:border-purple-800/30"
          >
            <div class="flex items-center justify-between mb-2">
              <div class="flex items-center gap-2">
                <div class="p-1 rounded bg-purple-500/10">
                  <TrendingUp
                    class="h-3.5 w-3.5 text-purple-600 dark:text-purple-400"
                  />
                </div>
                <span
                  class="text-sm font-medium text-purple-700 dark:text-purple-300"
                  >Patrimônio Médio</span
                >
              </div>
            </div>
            <div
              class="text-2xl font-bold text-purple-800 dark:text-purple-200"
            >
              {formatarMoeda(
                $estatisticasCarteiras.patrimonioTotal /
                  $estatisticasCarteiras.total
              )}
            </div>
            <p class="text-xs text-purple-600/80 dark:text-purple-400/80 mt-1">
              Por carteira
            </p>
          </div>
        </div>

        <!-- Separador e fonte -->
        <div
          class="flex items-center justify-center pt-2 border-t border-border/50"
        >
          <div class="flex items-center gap-2 text-xs text-muted-foreground">
            <div class="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            Dados em tempo real via Salesforce API
          </div>
        </div>
      </CardContent>
    {/if}
  </Card>
{/if}

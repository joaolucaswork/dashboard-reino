<script>
  import InvestmentCategoryIndicator from "./InvestmentCategoryIndicator.svelte";
  import { Card, CardContent, CardHeader, CardTitle } from "$lib/components/ui/card";
  import { getAllInvestmentCategories } from "$lib/utils/investment-category-colors.js";

  // Get all available categories for demonstration
  const categories = getAllInvestmentCategories();
</script>

<!-- Investment Category Colors Demo -->
<Card>
  <CardHeader>
    <CardTitle>Cores das Categorias de Investimento</CardTitle>
  </CardHeader>
  <CardContent>
    <div class="space-y-4">
      <p class="text-body">
        Demonstração das cores específicas para cada categoria de investimento.
        Apenas as bolinhas (indicadores) têm cores específicas, todos os textos permanecem brancos.
      </p>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        {#each categories as { name, colors }}
          <div class="flex items-center justify-between p-3 border rounded-lg bg-muted/20">
            <div class="flex items-center gap-3">
              <!-- Indicator with Badge -->
              <InvestmentCategoryIndicator 
                category={name}
                showBadge={true}
                variant="outline"
                size="sm"
              />
            </div>
            <div class="text-right text-sm text-muted-foreground">
              {colors.hex}
            </div>
          </div>
        {/each}
      </div>

      <div class="mt-6 p-4 border rounded-lg bg-muted/10">
        <h4 class="font-medium mb-3">Exemplo em Texto Simples (sem badge):</h4>
        <div class="flex flex-wrap gap-4">
          {#each categories as { name }}
            <InvestmentCategoryIndicator 
              category={name}
              showBadge={false}
              dotSize="w-2 h-2"
            />
          {/each}
        </div>
      </div>

      <div class="mt-6 p-4 border rounded-lg bg-muted/10">
        <h4 class="font-medium mb-3">Exemplo com Bolinhas Menores:</h4>
        <div class="flex flex-wrap gap-4">
          {#each categories as { name }}
            <InvestmentCategoryIndicator 
              category={name}
              showBadge={true}
              variant="secondary"
              size="sm"
              dotSize="w-1.5 h-1.5"
            />
          {/each}
        </div>
      </div>
    </div>
  </CardContent>
</Card>

<style>
  /* Ensure all text remains white in this demo */
  :global(.investment-category-demo .category-text) {
    color: white !important;
  }
</style>

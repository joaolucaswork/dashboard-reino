<script>
  import TabelaFinanceira from "./TabelaFinanceira.svelte";
  import { Card, CardContent, CardHeader, CardTitle } from "$lib/components/ui/card";
  import { ArrowRightLeft } from "@lucide/svelte";

  let { data } = $props();
</script>

<Card>
  <CardHeader>
    <CardTitle class="text-lg font-semibold flex items-center gap-2">
      <ArrowRightLeft size={20} class="text-primary" />
      Movimentações Financeiras
    </CardTitle>
  </CardHeader>
  <CardContent>
    <TabelaFinanceira 
      {data} 
      mode="movimentacoes" 
      title="Histórico de Transações"
    />
  </CardContent>
</Card>

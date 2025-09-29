<script>
  import TabelaFinanceira from "./TabelaFinanceira.svelte";
  import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
  } from "$lib/components/ui/card";
  import { FileText } from "@lucide/svelte";

  let { data } = $props();
</script>

<Card class="content-white-theme">
  <CardHeader>
    <CardTitle class="text-lg font-semibold flex items-center gap-2">
      <FileText size={20} class="text-primary" />
      Relatório por Instituição Financeira
    </CardTitle>
  </CardHeader>
  <CardContent>
    <TabelaFinanceira
      {data}
      mode="relatorio"
      title="Dados Agrupados por Instituição"
    />
  </CardContent>
</Card>

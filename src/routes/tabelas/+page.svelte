<script>
  import { modoVisualizacao, dadosConsulta } from "$lib/stores/tabelas.js";

  import FormularioConsulta from "$lib/components/tabelas/FormularioConsulta.svelte";

  import { Button } from "$lib/components/ui/button";
  import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
  } from "$lib/components/ui/card";
  import { FileText } from "@lucide/svelte";
  import { toast, showToast } from "$lib/utils/toast.js";

  // Test functions for toast notifications (development only)
  function testSuccessToast() {
    showToast.dataLoaded();
  }

  function testErrorToast() {
    showToast.dataLoadFailed("Erro de teste para verificar funcionamento");
  }

  function testLoadingToast() {
    const loadingId = showToast.consultingData();
    setTimeout(() => {
      toast.dismiss(loadingId);
      toast.success("Carregamento concluído!");
    }, 3000);
  }

  function testCustomToast() {
    toast.info("Esta é uma notificação personalizada de teste");
  }
</script>

<svelte:head>
  <title>Tabelas e Relatórios - Reino Capital</title>
  <meta
    name="description"
    content="Sistema de consulta de tabelas e relatórios financeiros"
  />
</svelte:head>

<div class="container mx-auto p-6 max-w-6xl">
  <!-- Status messages are now handled by toast notifications -->

  <!-- Formulário de Consulta -->
  <Card class="mb-8">
    <CardContent class="pt-6">
      <FormularioConsulta />
    </CardContent>
  </Card>

  <!-- Área de Resultados -->
  {#if $dadosConsulta}
    <Card>
      <CardHeader>
        <CardTitle class="text-lg font-semibold">
          Resultados da Consulta
        </CardTitle>
        <p class="text-caption">
          Modo: {$modoVisualizacao} | Carteira: {$dadosConsulta.carteira} | Data:
          {$dadosConsulta.data_final}
        </p>
      </CardHeader>
      <CardContent>
        <!-- Placeholder para componentes de visualização -->
        <div class="text-center py-12">
          <FileText size={48} class="mx-auto text-muted-foreground mb-4" />
          <h3 class="text-lg font-semibold mb-2">Dados Carregados</h3>
          <p class="text-body max-w-md mx-auto">
            Os componentes de visualização serão implementados nas próximas
            etapas. Dados disponíveis para o modo: <strong
              >{$modoVisualizacao}</strong
            >
          </p>

          <!-- Debug info em desenvolvimento -->
          {#if import.meta.env.DEV}
            <details class="mt-6 text-left">
              <summary
                class="cursor-pointer text-caption hover:text-foreground"
              >
                Ver dados (desenvolvimento)
              </summary>
              <pre
                class="mt-2 p-4 bg-muted rounded-lg text-xs overflow-auto max-h-64">
{JSON.stringify($dadosConsulta, null, 2)}
              </pre>
            </details>

            <!-- Toast Testing Buttons (Development Only) -->
            <div class="mt-6 p-4 bg-muted rounded-lg">
              <h4 class="text-sm font-medium mb-3">
                Teste de Notificações Toast
              </h4>
              <div class="flex flex-wrap gap-2">
                <Button size="sm" variant="outline" onclick={testSuccessToast}>
                  Sucesso
                </Button>
                <Button size="sm" variant="outline" onclick={testErrorToast}>
                  Erro
                </Button>
                <Button size="sm" variant="outline" onclick={testLoadingToast}>
                  Loading
                </Button>
                <Button size="sm" variant="outline" onclick={testCustomToast}>
                  Info
                </Button>
              </div>
            </div>
          {/if}
        </div>
      </CardContent>
    </Card>
  {:else}
    <!-- Estado inicial -->
    <Card>
      <CardContent class="text-center py-12">
        <FileText size={64} class="mx-auto text-muted-foreground mb-6" />
        <h3 class="text-xl font-semibold mb-3">Pronto para Consultar</h3>
        <p class="text-body max-w-lg mx-auto">
          Configure os parâmetros acima e clique em "Consultar" para visualizar
          seus dados financeiros nos formatos disponíveis.
        </p>
      </CardContent>
    </Card>
  {/if}
</div>

<script lang="ts">
  import { onMount } from "svelte";
  import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
  } from "$lib/components/ui/card";
  import { Button } from "$lib/components/ui/button";
  import { Switch } from "$lib/components/ui/switch";
  import { Label } from "$lib/components/ui/label";
  import { Database, Cloud, RefreshCw, Settings } from "@lucide/svelte";
  import { toast } from "svelte-sonner";

  import {
    appConfig,
    atualizarConfiguracao,
    carregarConfiguracoes,
  } from "$lib/stores/config.js";
  import {
    atualizarCarteiras,
    carregandoCarteiras,
  } from "$lib/stores/carteiras.js";

  // Carregar configurações ao montar
  onMount(() => {
    carregarConfiguracoes();
  });

  // Função para alternar fonte de dados
  async function alternarFonteCarteiras() {
    const novaFonte =
      $appConfig.fonteCarteiras === "database" ? "salesforce" : "database";

    try {
      atualizarConfiguracao("fonteCarteiras", novaFonte);

      // Atualizar carteiras com a nova fonte
      const result = await atualizarCarteiras(novaFonte);

      if (result.success) {
        toast.success(
          `Fonte alterada para ${novaFonte === "database" ? "banco local" : "Salesforce"}`,
          {
            description: `${result.carteiras.length} carteiras carregadas`,
          }
        );
      } else {
        toast.error("Erro ao carregar carteiras da nova fonte", {
          description: result.error,
        });
        // Reverter alteração em caso de erro
        atualizarConfiguracao(
          "fonteCarteiras",
          $appConfig.fonteCarteiras === "database" ? "salesforce" : "database"
        );
      }
    } catch (error) {
      toast.error("Erro ao alterar fonte de dados");
      console.error("Erro ao alterar fonte:", error);
    }
  }

  // Função para testar conexão
  async function testarConexao() {
    try {
      const result = await atualizarCarteiras($appConfig.fonteCarteiras);

      if (result.success) {
        toast.success("Conexão testada com sucesso", {
          description: `${result.carteiras.length} carteiras encontradas`,
        });
      } else {
        toast.error("Erro na conexão", {
          description: result.error,
        });
      }
    } catch (error) {
      toast.error("Erro ao testar conexão");
      console.error("Erro ao testar conexão:", error);
    }
  }
</script>

<Card class="card-premium">
  <CardHeader class="p-6">
    <CardTitle class="text-subheading flex items-center gap-2">
      <Settings size={20} class="text-primary" />
      Fonte de Dados das Carteiras
    </CardTitle>
    <CardDescription class="text-caption mt-2">
      Configure de onde as carteiras serão carregadas
    </CardDescription>
  </CardHeader>
  <CardContent class="p-6 pt-0 space-y-6">
    <!-- Seleção da fonte -->
    <div class="space-y-4">
      <div
        class="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-border"
      >
        <div class="space-y-1">
          <div class="flex items-center gap-2">
            {#if $appConfig.fonteCarteiras === "database"}
              <Database class="h-4 w-4 text-primary" />
              <p class="text-label">Banco de Dados Local</p>
            {:else}
              <Cloud class="h-4 w-4 text-primary" />
              <p class="text-label">Salesforce</p>
            {/if}
          </div>
          <p class="text-caption">
            {#if $appConfig.fonteCarteiras === "database"}
              Carteiras armazenadas no banco PostgreSQL local
            {:else}
              Carteiras obtidas diretamente do Salesforce via API
            {/if}
          </p>
        </div>

        <div class="flex items-center gap-3">
          <!-- Switch para alternar -->
          <div class="flex items-center space-x-2">
            <Label for="fonte-switch" class="text-xs text-muted-foreground">
              {$appConfig.fonteCarteiras === "database"
                ? "Local"
                : "Salesforce"}
            </Label>
            <Switch
              id="fonte-switch"
              checked={$appConfig.fonteCarteiras === "salesforce"}
              onCheckedChange={alternarFonteCarteiras}
              disabled={$carregandoCarteiras}
            />
          </div>

          <!-- Botão testar conexão -->
          <Button
            variant="outline"
            size="sm"
            onclick={testarConexao}
            disabled={$carregandoCarteiras}
            class="btn-secondary flex items-center gap-2"
          >
            <RefreshCw
              size={14}
              class={$carregandoCarteiras ? "animate-spin" : ""}
            />
            Testar
          </Button>
        </div>
      </div>
    </div>

    <!-- Descrição das fontes -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div class="p-4 bg-muted/20 rounded-lg border border-border/50">
        <div class="flex items-center gap-2 mb-2">
          <Database class="h-4 w-4 text-muted-foreground" />
          <p class="text-sm font-medium">Banco Local</p>
        </div>
        <ul class="text-xs text-muted-foreground space-y-1">
          <li>• Acesso mais rápido</li>
          <li>• Dados sincronizados</li>
          <li>• Funciona offline</li>
        </ul>
      </div>

      <div class="p-4 bg-muted/20 rounded-lg border border-border/50">
        <div class="flex items-center gap-2 mb-2">
          <Cloud class="h-4 w-4 text-muted-foreground" />
          <p class="text-sm font-medium">Salesforce</p>
        </div>
        <ul class="text-xs text-muted-foreground space-y-1">
          <li>• Dados sempre atualizados</li>
          <li>• Acesso direto à fonte</li>
          <li>• Requer conexão</li>
        </ul>
      </div>
    </div>
  </CardContent>
</Card>

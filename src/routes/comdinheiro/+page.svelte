<script>
  import ComdinheiroSimple from "$lib/components/comdinheiro/ComdinheiroSimple.svelte";
  import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
  } from "$lib/components/ui/card";
  import { Badge } from "$lib/components/ui/badge";
  import { ExternalLink, Database, Code, Zap } from "@lucide/svelte";
</script>

<svelte:head>
  <title>Integração Comdinheiro - Reino Dashboard</title>
  <meta
    name="description"
    content="Interface para integração com a API do Comdinheiro"
  />
</svelte:head>

<div class="container mx-auto p-6 space-y-6">
  <!-- Cabeçalho -->
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold text-white tracking-tight">
          Integração Comdinheiro
        </h1>
        <p class="text-caption mt-2">
          Interface completa para consultas e integração com a API do
          Comdinheiro
        </p>
      </div>

      <div class="flex items-center gap-2">
        <Badge variant="default" class="bg-green-100 text-green-800">
          <Database size={14} class="mr-1" />
          API Nativa
        </Badge>
        <Badge variant="secondary">
          <Code size={14} class="mr-1" />
          TypeScript
        </Badge>
        <Badge variant="outline">
          <Zap size={14} class="mr-1" />
          Otimizada
        </Badge>
      </div>
    </div>

    <!-- Cards de Informação -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card class="card-premium">
        <CardHeader class="pb-3">
          <CardTitle class="text-sm font-medium flex items-center gap-2">
            <Database size={16} class="text-primary" />
            API Nativa
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p class="text-caption">
            Implementação SvelteKit pura com TypeScript, sem dependências
            externas
          </p>
        </CardContent>
      </Card>

      <Card class="card-premium">
        <CardHeader class="pb-3">
          <CardTitle class="text-sm font-medium flex items-center gap-2">
            <Code size={16} class="text-primary" />
            Geração de Código
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p class="text-caption">
            Gera código em JavaScript, Python e PHP para suas consultas
          </p>
        </CardContent>
      </Card>

      <Card class="card-premium">
        <CardHeader class="pb-3">
          <CardTitle class="text-sm font-medium flex items-center gap-2">
            <Zap size={16} class="text-primary" />
            Consultas Rápidas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p class="text-caption">
            Interface intuitiva para executar consultas e visualizar resultados
          </p>
        </CardContent>
      </Card>
    </div>
  </div>

  <!-- Interface Principal -->
  <ComdinheiroSimple />

  <!-- Documentação Rápida -->
  <Card class="card-premium">
    <CardHeader>
      <CardTitle class="flex items-center gap-2">
        <ExternalLink size={20} />
        Documentação e Links Úteis
      </CardTitle>
    </CardHeader>
    <CardContent class="space-y-4">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="space-y-2">
          <h4 class="font-medium">Ferramentas Principais</h4>
          <ul class="text-caption space-y-1">
            <li>
              • <strong>HistoricoCotacao002</strong> - Dados históricos de cotações
            </li>
            <li>
              • <strong>RelatorioGerencialCarteiras001</strong> - Relatórios de carteiras
            </li>
            <li>
              • <strong>ExtratoCarteira015/022</strong> - Extratos detalhados
            </li>
            <li>
              • <strong>FundScreener001</strong> - Busca e filtragem de fundos
            </li>
          </ul>
        </div>

        <div class="space-y-2">
          <h4 class="font-medium">Formatos Suportados</h4>
          <ul class="text-caption space-y-1">
            <li>
              • <strong>JSON3</strong> - Formato mais recente (recomendado)
            </li>
            <li>• <strong>JSON/JSON2</strong> - Versões anteriores</li>
            <li>• <strong>XML2</strong> - Formato XML mais recente</li>
            <li>• <strong>XML</strong> - Versão anterior do XML</li>
          </ul>
        </div>
      </div>

      <div class="pt-4 border-t border-border">
        <p class="text-caption">
          <strong>Nota:</strong> Esta é uma implementação SvelteKit nativa que se
          conecta diretamente à API do Comdinheiro, oferecendo máxima performance
          e confiabilidade sem dependências externas.
        </p>
      </div>
    </CardContent>
  </Card>
</div>

<style>
  :global(.card-premium) {
    background: linear-gradient(
      135deg,
      hsl(var(--card)) 0%,
      hsl(var(--card) / 0.8) 100%
    );
    border: 1px solid hsl(var(--border) / 0.5);
    backdrop-filter: blur(10px);
  }
</style>

<script lang="ts">
  import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
  } from "$lib/components/ui/card";
  import { Button } from "$lib/components/ui/button";
  import {
    Settings,
    Palette,
    FolderOpen,
    Info,
    RefreshCw,
    Moon,
    Timer,
    Search,
    Database,
  } from "@lucide/svelte";
  import FonteDadosConfig from "$lib/components/settings/FonteDadosConfig.svelte";
  import SeletorCarteiraComdinheiro from "$lib/components/tabelas/SeletorCarteiraComdinheiro.svelte";
</script>

<div class="space-y-8">
  <!-- Header Section -->
  <div class="space-y-3">
    <h2 class="text-3xl font-bold text-white tracking-tight">Configurações</h2>
    <p class="text-body">
      Configure suas preferências do dashboard e integrações bancárias.
    </p>
  </div>

  <!-- Settings Grid -->
  <div class="grid gap-8">
    <!-- Configuração de Fonte de Dados -->
    <FonteDadosConfig />

    <!-- Configurações do Comdinheiro -->
    <Card class="card-premium">
      <CardHeader class="p-6">
        <CardTitle class="text-subheading flex items-center gap-2">
          <Database size={20} class="text-primary" />
          Configurações do Comdinheiro
        </CardTitle>
        <CardDescription class="text-caption mt-2">
          Configure suas credenciais e gerencie carteiras do Comdinheiro
        </CardDescription>
      </CardHeader>
      <CardContent class="p-6 pt-0">
        <SeletorCarteiraComdinheiro />
      </CardContent>
    </Card>

    <Card class="card-premium">
      <CardHeader class="p-6">
        <CardTitle class="text-subheading flex items-center gap-2">
          <Settings size={20} class="text-primary" />
          Integrações Bancárias
        </CardTitle>
        <CardDescription class="text-caption mt-2">
          Configure suas conexões com bancos e corretoras
        </CardDescription>
      </CardHeader>
      <CardContent class="p-6 pt-0 space-y-6">
        <div
          class="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-border"
        >
          <div class="space-y-1">
            <p class="text-label">APIs Bancárias</p>
            <p class="text-caption">
              Configurar chaves de acesso às APIs dos bancos
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            class="btn-secondary flex items-center gap-2"
          >
            <Settings size={14} />
            Configurar
          </Button>
        </div>
        <div
          class="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-border"
        >
          <div class="space-y-1">
            <p class="text-label">Sincronização de Dados</p>
            <p class="text-caption">
              Gerenciar frequência de atualização dos dados financeiros
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            class="btn-secondary flex items-center gap-2"
          >
            <FolderOpen size={14} />
            Gerenciar
          </Button>
        </div>
      </CardContent>
    </Card>

    <Card class="card-premium">
      <CardHeader class="p-6">
        <CardTitle class="text-subheading flex items-center gap-2">
          <Palette size={20} class="text-primary" />
          Preferências do Dashboard
        </CardTitle>
        <CardDescription class="text-caption mt-2">
          Personalize a aparência e comportamento do seu dashboard financeiro
        </CardDescription>
      </CardHeader>
      <CardContent class="p-6 pt-0 space-y-6">
        <div
          class="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-border"
        >
          <div class="space-y-1">
            <p class="text-label">Tema</p>
            <p class="text-caption">Escolha seu esquema de cores preferido</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            class="btn-secondary flex items-center gap-2"
          >
            <Moon size={14} />
            Escuro
          </Button>
        </div>
        <div
          class="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-border"
        >
          <div class="space-y-1">
            <p class="text-label">Atualização Automática</p>
            <p class="text-caption">
              Atualizar automaticamente dados financeiros
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            class="btn-secondary flex items-center gap-2"
          >
            <RefreshCw size={14} />
            Ativado
          </Button>
        </div>
      </CardContent>
    </Card>

    <Card class="card-premium">
      <CardHeader class="p-6">
        <CardTitle class="text-subheading flex items-center gap-2">
          <FolderOpen size={20} class="text-primary" />
          Gestão de Relatórios
        </CardTitle>
        <CardDescription class="text-caption mt-2">
          Configure como os relatórios financeiros são gerados e gerenciados
        </CardDescription>
      </CardHeader>
      <CardContent class="p-6 pt-0 space-y-6">
        <div
          class="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-border"
        >
          <div class="space-y-1">
            <p class="text-label">Diretório de Relatórios</p>
            <p class="text-caption">
              Local padrão para salvar relatórios financeiros
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            class="btn-secondary flex items-center gap-2"
          >
            <Search size={14} />
            Procurar
          </Button>
        </div>
        <div
          class="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-border"
        >
          <div class="space-y-1">
            <p class="text-label">Timeout de Processamento</p>
            <p class="text-caption">
              Tempo máximo para processamento de dados financeiros
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            class="btn-secondary flex items-center gap-2"
          >
            <Timer size={14} />
            30s
          </Button>
        </div>
      </CardContent>
    </Card>

    <Card class="card-premium">
      <CardHeader class="p-6">
        <CardTitle class="text-subheading flex items-center gap-2">
          <Info size={20} class="text-primary" />
          Sobre o Sistema
        </CardTitle>
        <CardDescription class="text-caption mt-2">
          Informações do dashboard financeiro e detalhes da versão
        </CardDescription>
      </CardHeader>
      <CardContent class="p-6 pt-0">
        <div class="space-y-4">
          <div
            class="flex justify-between items-center p-3 bg-muted/30 rounded-lg"
          >
            <span class="text-caption">Versão:</span>
            <span class="text-label">1.0.0</span>
          </div>
          <div
            class="flex justify-between items-center p-3 bg-muted/30 rounded-lg"
          >
            <span class="text-caption">Framework:</span>
            <span class="text-label">SvelteKit + shadcn-svelte</span>
          </div>
          <div
            class="flex justify-between items-center p-3 bg-muted/30 rounded-lg"
          >
            <span class="text-caption">Integrações Bancárias:</span>
            <span class="text-label text-primary">Pronto</span>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
</div>

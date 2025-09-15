<script lang="ts">
  import DashboardLayout from "$lib/components/DashboardLayout.svelte";
  import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
  } from "$lib/components/ui/card";
  import { Button } from "$lib/components/ui/button";
  import { Separator } from "$lib/components/ui/separator";
  import {
    Settings,
    Palette,
    FolderOpen,
    Info,
    RefreshCw,
    Moon,
    Timer,
    Search,
  } from "@lucide/svelte";
</script>

<DashboardLayout>
  <div class="space-y-8">
    <!-- Header Section -->
    <div class="space-y-3">
      <h2 class="text-3xl font-bold text-white tracking-tight">
        Configurações
      </h2>
      <p class="text-lg font-medium text-white/70">
        Configure suas preferências do dashboard e integrações bancárias.
      </p>
    </div>

    <!-- Settings Grid -->
    <div class="grid gap-8">
      <Card class="bg-card border-border">
        <CardHeader class="p-6">
          <CardTitle
            class="text-xl font-bold text-white flex items-center gap-2"
          >
            <Settings size={20} class="text-primary" />
            Integrações Bancárias
          </CardTitle>
          <CardDescription class="text-white/60 mt-2 font-medium">
            Configure suas conexões com bancos e corretoras
          </CardDescription>
        </CardHeader>
        <CardContent class="p-6 pt-0 space-y-6">
          <div
            class="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-border"
          >
            <div class="space-y-1">
              <p class="text-sm font-semibold text-white">APIs Bancárias</p>
              <p class="text-xs font-medium text-white/50">
                Configurar chaves de acesso às APIs dos bancos
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              class="px-4 py-2 bg-background border-border hover:bg-accent transition-colors duration-200 flex items-center gap-2"
            >
              <Settings size={14} />
              Configurar
            </Button>
          </div>
          <div
            class="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-border"
          >
            <div class="space-y-1">
              <p class="text-sm font-semibold text-white">
                Sincronização de Dados
              </p>
              <p class="text-xs font-medium text-white/50">
                Gerenciar frequência de atualização dos dados financeiros
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              class="px-4 py-2 bg-background border-border hover:bg-accent transition-colors duration-200 flex items-center gap-2"
            >
              <FolderOpen size={14} />
              Gerenciar
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card class="bg-card border-border">
        <CardHeader class="p-6">
          <CardTitle
            class="text-xl font-bold text-white flex items-center gap-2"
          >
            <Palette size={20} class="text-primary" />
            Preferências do Dashboard
          </CardTitle>
          <CardDescription class="text-white/60 mt-2 font-medium">
            Personalize a aparência e comportamento do seu dashboard financeiro
          </CardDescription>
        </CardHeader>
        <CardContent class="p-6 pt-0 space-y-6">
          <div
            class="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-border"
          >
            <div class="space-y-1">
              <p class="text-sm font-semibold text-white">Tema</p>
              <p class="text-xs font-medium text-white/50">
                Escolha seu esquema de cores preferido
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              class="px-4 py-2 bg-background border-border hover:bg-accent transition-colors duration-200 flex items-center gap-2"
            >
              <Moon size={14} />
              Escuro
            </Button>
          </div>
          <div
            class="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-border"
          >
            <div class="space-y-1">
              <p class="text-sm font-semibold text-white">
                Atualização Automática
              </p>
              <p class="text-xs font-medium text-white/50">
                Atualizar automaticamente dados financeiros
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              class="px-4 py-2 bg-background border-border hover:bg-accent transition-colors duration-200 flex items-center gap-2"
            >
              <RefreshCw size={14} />
              Ativado
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card class="bg-card border-border">
        <CardHeader class="p-6">
          <CardTitle
            class="text-xl font-semibold text-card-foreground flex items-center gap-2"
          >
            <FolderOpen size={20} class="text-primary" />
            Gestão de Relatórios
          </CardTitle>
          <CardDescription class="text-white/60 mt-2 font-medium">
            Configure como os relatórios financeiros são gerados e gerenciados
          </CardDescription>
        </CardHeader>
        <CardContent class="p-6 pt-0 space-y-6">
          <div
            class="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-border"
          >
            <div class="space-y-1">
              <p class="text-sm font-semibold text-white">
                Diretório de Relatórios
              </p>
              <p class="text-xs font-medium text-white/50">
                Local padrão para salvar relatórios financeiros
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              class="px-4 py-2 bg-background border-border hover:bg-accent transition-colors duration-200 flex items-center gap-2"
            >
              <Search size={14} />
              Procurar
            </Button>
          </div>
          <div
            class="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-border"
          >
            <div class="space-y-1">
              <p class="text-sm font-semibold text-white">
                Timeout de Processamento
              </p>
              <p class="text-xs font-medium text-white/50">
                Tempo máximo para processamento de dados financeiros
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              class="px-4 py-2 bg-background border-border hover:bg-accent transition-colors duration-200 flex items-center gap-2"
            >
              <Timer size={14} />
              30s
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card class="bg-card border-border">
        <CardHeader class="p-6">
          <CardTitle
            class="text-xl font-semibold text-card-foreground flex items-center gap-2"
          >
            <Info size={20} class="text-primary" />
            Sobre o Sistema
          </CardTitle>
          <CardDescription class="text-white/60 mt-2 font-medium">
            Informações do dashboard financeiro e detalhes da versão
          </CardDescription>
        </CardHeader>
        <CardContent class="p-6 pt-0">
          <div class="space-y-4">
            <div
              class="flex justify-between items-center p-3 bg-muted/30 rounded-lg"
            >
              <span class="text-sm font-medium text-white/60">Versão:</span>
              <span class="text-sm font-semibold text-white">1.0.0</span>
            </div>
            <div
              class="flex justify-between items-center p-3 bg-muted/30 rounded-lg"
            >
              <span class="text-sm font-medium text-white/60">Framework:</span>
              <span class="text-sm font-semibold text-white"
                >SvelteKit + shadcn-svelte</span
              >
            </div>
            <div
              class="flex justify-between items-center p-3 bg-muted/30 rounded-lg"
            >
              <span class="text-sm font-medium text-white/60"
                >Integrações Bancárias:</span
              >
              <span class="text-sm font-semibold text-primary">Pronto</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
</DashboardLayout>

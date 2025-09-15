<script lang="ts">
  import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
  } from "$lib/components/ui/card";
  import { animate, stagger } from "$lib/actions/animate";
  import {
    TrendingUp,
    FileCode,
    Settings,
    Activity,
    Play,
    ChartLine,
    Cog,
  } from "@lucide/svelte";
</script>

<div class="space-y-8">
  <!-- Header Section -->
  <div class="space-y-3" use:animate={{ preset: "slideInUp", delay: 0.2 }}>
    <h2 class="text-3xl font-bold text-white tracking-tight">
      Dashboard de Gestão Financeira
    </h2>
    <p class="text-body max-w-2xl">
      Gerencie seus investimentos e análises financeiras com design sofisticado
      e minimalista.
    </p>
  </div>

  <!-- Recent Activity Section -->
  <div class="mb-8" use:animate={{ preset: "slideInUp", delay: 0.4 }}>
    <Card class="card-premium">
      <CardHeader class="p-4">
        <CardTitle class="text-lg font-bold text-white flex items-center gap-2">
          <Activity size={18} class="text-primary" />
          Atividade Recente
        </CardTitle>
      </CardHeader>
      <CardContent class="p-4 pt-0">
        <div class="flex items-center justify-center h-32 text-white/60">
          <div
            class="text-center space-y-3"
            use:animate={{ preset: "scaleIn", delay: 0.6 }}
          >
            <div
              class="w-12 h-12 bg-muted rounded-full mx-auto flex items-center justify-center"
            >
              <div class="w-6 h-6 bg-muted-foreground/20 rounded-full"></div>
            </div>
            <div>
              <p class="text-label">Nenhuma atividade para exibir</p>
              <p class="text-caption mt-1">
                Conecte suas contas bancárias para ver dados de investimentos
                aqui
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>

  <!-- Cards Grid -->
  <div
    class="grid gap-8 md:grid-cols-2 lg:grid-cols-3"
    use:stagger={{ preset: "scaleIn", staggerType: "standard", delay: 0.8 }}
  >
    <div>
      <Card class="card-premium h-full">
        <CardContent class="p-4">
          <CardTitle
            class="text-lg font-bold text-white mb-2 flex items-center gap-2"
          >
            <TrendingUp size={18} class="text-primary" />
            Análises
          </CardTitle>
          <p class="text-caption">
            Nenhum dado disponível ainda. Conecte suas contas para ver análises
            de investimentos.
          </p>
        </CardContent>
      </Card>
    </div>

    <div>
      <Card class="card-premium h-full">
        <CardContent class="p-4">
          <CardTitle
            class="text-lg font-bold text-white mb-2 flex items-center gap-2"
          >
            <FileCode size={18} class="text-primary" />
            Relatórios
          </CardTitle>
          <p class="text-caption">
            Gere relatórios detalhados de seus investimentos e performance.
          </p>
        </CardContent>
      </Card>
    </div>

    <div>
      <Card class="card-premium h-full">
        <CardContent class="p-4">
          <CardTitle
            class="text-lg font-bold text-white mb-2 flex items-center gap-2"
          >
            <Settings size={18} class="text-primary" />
            Configurações
          </CardTitle>
          <p class="text-caption">
            Personalize sua experiência no dashboard e configure suas
            integrações bancárias.
          </p>
        </CardContent>
      </Card>
    </div>
  </div>

  <!-- Quick Actions Section -->
  <div class="mt-8" use:animate={{ preset: "slideInUp", delay: 0.8 }}>
    <Card class="card-premium">
      <CardContent class="p-6">
        <div class="space-y-4">
          <div>
            <h3 class="text-lg font-bold text-white mb-2">Ações Rápidas</h3>
            <p class="text-caption">Comece com essas tarefas comuns</p>
          </div>
          <div
            class="flex flex-wrap gap-3"
            use:stagger={{
              preset: "scaleIn",
              staggerType: "fast",
              delay: 0.9,
            }}
          >
            <a
              href="/relatorio"
              class="btn-premium btn-primary flex items-center gap-2"
            >
              <Play size={14} />
              Gerar Relatório
            </a>
            <a href="/analises" class="btn-minimal flex items-center gap-2">
              <ChartLine size={14} />
              Ver Análises
            </a>
            <a href="/settings" class="btn-minimal flex items-center gap-2">
              <Cog size={14} />
              Configurar Integrações
            </a>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
</div>

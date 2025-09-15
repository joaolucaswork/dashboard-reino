<script lang="ts">
  import DashboardLayout from "$lib/components/DashboardLayout.svelte";
  import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
  } from "$lib/components/ui/card";
  import { animate, stagger, hover, buttonPress } from "$lib/actions/animate";
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

<DashboardLayout>
  <div class="space-y-8">
    <!-- Header Section -->
    <div class="space-y-3" use:animate={{ preset: "slideInUp", delay: 0.2 }}>
      <h2 class="text-3xl font-bold text-white tracking-tight">
        Ferramentas do BackOffice
      </h2>
      <p class="text-lg font-medium text-white/70 max-w-2xl">
        Gerencie seus investimentos e análises financeiras com design
        sofisticado e minimalista.
      </p>
    </div>

    <!-- Recent Activity Section -->
    <div class="mb-8" use:animate={{ preset: "slideInUp", delay: 0.4 }}>
      <Card class="bg-card border-0">
        <CardHeader class="p-4">
          <CardTitle
            class="text-lg font-bold text-white flex items-center gap-2"
          >
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
                <p class="text-sm font-semibold text-white/80">
                  Nenhuma atividade para exibir
                </p>
                <p class="text-xs font-medium text-white/50 mt-1">
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
      <div use:hover={{ scale: 1.01 }}>
        <Card
          class="bg-card border-0 hover:bg-card/80 transition-all duration-200 h-full"
        >
          <CardContent class="p-4">
            <CardTitle
              class="text-lg font-bold text-white mb-2 flex items-center gap-2"
            >
              <TrendingUp size={18} class="text-primary" />
              Análises
            </CardTitle>
            <p class="text-sm font-medium text-white/60">
              Nenhum dado disponível ainda. Conecte suas contas para ver
              análises de investimentos.
            </p>
          </CardContent>
        </Card>
      </div>

      <div use:hover={{ scale: 1.01 }}>
        <Card
          class="bg-card border-0 hover:bg-card/80 transition-all duration-200 h-full"
        >
          <CardContent class="p-4">
            <CardTitle
              class="text-lg font-bold text-white mb-2 flex items-center gap-2"
            >
              <FileCode size={18} class="text-primary" />
              Relatórios
            </CardTitle>
            <p class="text-sm font-medium text-white/60">
              Gere relatórios detalhados de seus investimentos e performance.
            </p>
          </CardContent>
        </Card>
      </div>

      <div use:hover={{ scale: 1.01 }}>
        <Card
          class="bg-card border-0 hover:bg-card/80 transition-all duration-200 h-full"
        >
          <CardContent class="p-4">
            <CardTitle
              class="text-lg font-bold text-white mb-2 flex items-center gap-2"
            >
              <Settings size={18} class="text-primary" />
              Configurações
            </CardTitle>
            <p class="text-sm font-medium text-white/60">
              Personalize sua experiência no dashboard e configure suas
              integrações bancárias.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>

    <!-- Quick Actions Section -->
    <div class="mt-8" use:animate={{ preset: "slideInUp", delay: 0.8 }}>
      <Card class="bg-card border-0">
        <CardContent class="p-6">
          <div class="space-y-4">
            <div>
              <h3 class="text-lg font-bold text-white mb-2">Ações Rápidas</h3>
              <p class="text-sm font-medium text-white/60">
                Comece com essas tarefas comuns
              </p>
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
                class="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors duration-200 flex items-center gap-2"
                use:hover={{ scale: 1.02 }}
                use:buttonPress
              >
                <Play size={14} />
                Gerar Relatório
              </a>
              <a
                href="/analises"
                class="px-4 py-2 text-white/60 hover:text-white font-medium transition-colors duration-200 flex items-center gap-2"
                use:hover={{ scale: 1.02 }}
                use:buttonPress
              >
                <ChartLine size={14} />
                Ver Análises
              </a>
              <a
                href="/settings"
                class="px-4 py-2 text-white/60 hover:text-white font-medium transition-colors duration-200 flex items-center gap-2"
                use:hover={{ scale: 1.02 }}
                use:buttonPress
              >
                <Cog size={14} />
                Configurar Integrações
              </a>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
</DashboardLayout>

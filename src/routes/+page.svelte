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
        Welcome to Reino
      </h2>
      <p class="text-lg font-medium text-white/70 max-w-2xl">
        A minimal dashboard for managing your Python scripts and analytics with
        sophisticated design.
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
            Recent Activity
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
                  No activity to display
                </p>
                <p class="text-xs font-medium text-white/50 mt-1">
                  Execute some Python scripts to see analytics data here
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
              Analytics
            </CardTitle>
            <p class="text-sm font-medium text-white/60">
              No data available yet. Start by running some scripts to see
              analytics.
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
              Python Scripts
            </CardTitle>
            <p class="text-sm font-medium text-white/60">
              Ready to run Python scripts directly from the dashboard interface.
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
              Settings
            </CardTitle>
            <p class="text-sm font-medium text-white/60">
              Customize your dashboard experience and Python environment
              settings.
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
              <h3 class="text-lg font-bold text-white mb-2">Quick Actions</h3>
              <p class="text-sm font-medium text-white/60">
                Get started with these common tasks
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
                href="/scripts"
                class="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors duration-200 flex items-center gap-2"
                use:hover={{ scale: 1.02 }}
                use:buttonPress
              >
                <Play size={14} />
                Run Scripts
              </a>
              <a
                href="/analytics"
                class="px-4 py-2 text-white/60 hover:text-white font-medium transition-colors duration-200 flex items-center gap-2"
                use:hover={{ scale: 1.02 }}
                use:buttonPress
              >
                <ChartLine size={14} />
                View Analytics
              </a>
              <a
                href="/settings"
                class="px-4 py-2 text-white/60 hover:text-white font-medium transition-colors duration-200 flex items-center gap-2"
                use:hover={{ scale: 1.02 }}
                use:buttonPress
              >
                <Cog size={14} />
                Configure Settings
              </a>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
</DashboardLayout>

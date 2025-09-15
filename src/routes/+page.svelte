<script lang="ts">
  import DashboardLayout from "$lib/components/DashboardLayout.svelte";
  import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
  } from "$lib/components/ui/card";
  import { animate, stagger, hover, buttonPress } from "$lib/actions/animate";
</script>

<DashboardLayout>
  <div class="space-y-8">
    <!-- Header Section -->
    <div class="space-y-3" use:animate={{ preset: "slideInUp", delay: 0.2 }}>
      <h2 class="text-3xl font-semibold text-foreground tracking-tight">
        Welcome to Reino
      </h2>
      <p class="text-lg text-muted-foreground max-w-2xl">
        A minimal dashboard for managing your Python scripts and analytics with
        sophisticated design.
      </p>
    </div>

    <!-- Recent Activity Section -->
    <div class="mb-8" use:animate={{ preset: "slideInUp", delay: 0.4 }}>
      <Card class="bg-card border-0">
        <CardHeader class="p-4">
          <CardTitle class="text-lg font-semibold text-card-foreground">
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent class="p-4 pt-0">
          <div
            class="flex items-center justify-center h-32 text-muted-foreground"
          >
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
                <p class="text-sm font-medium">No activity to display</p>
                <p class="text-xs text-muted-foreground/60 mt-1">
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
            <CardTitle class="text-lg font-semibold text-card-foreground mb-2">
              Analytics
            </CardTitle>
            <p class="text-sm text-muted-foreground">
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
            <CardTitle class="text-lg font-semibold text-card-foreground mb-2">
              Python Scripts
            </CardTitle>
            <p class="text-sm text-muted-foreground">
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
            <CardTitle class="text-lg font-semibold text-card-foreground mb-2">
              Settings
            </CardTitle>
            <p class="text-sm text-muted-foreground">
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
              <h3 class="text-lg font-semibold text-card-foreground mb-2">
                Quick Actions
              </h3>
              <p class="text-sm text-muted-foreground">
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
                class="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors duration-200"
                use:hover={{ scale: 1.02 }}
                use:buttonPress
              >
                Run Scripts
              </a>
              <a
                href="/analytics"
                class="px-4 py-2 text-muted-foreground hover:text-foreground transition-colors duration-200"
                use:hover={{ scale: 1.02 }}
                use:buttonPress
              >
                View Analytics
              </a>
              <a
                href="/settings"
                class="px-4 py-2 text-muted-foreground hover:text-foreground transition-colors duration-200"
                use:hover={{ scale: 1.02 }}
                use:buttonPress
              >
                Configure Settings
              </a>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
</DashboardLayout>

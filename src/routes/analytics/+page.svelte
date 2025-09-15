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
  import { animate, stagger, hover, buttonPress } from "$lib/actions/animate";
</script>

<DashboardLayout>
  <div class="space-y-8">
    <!-- Header Section -->
    <div class="space-y-3" use:animate={{ preset: "slideInUp", delay: 0.1 }}>
      <h2 class="text-3xl font-semibold text-foreground tracking-tight">
        Analytics
      </h2>
      <p class="text-lg text-muted-foreground">
        Monitor your script performance and execution metrics.
      </p>
    </div>

    <!-- Metrics Grid -->
    <div
      class="grid gap-6 md:grid-cols-2 lg:grid-cols-4"
      use:stagger={{ preset: "scaleIn", staggerType: "fast", delay: 0.3 }}
    >
      <div use:hover={{ scale: 1.01 }}>
        <Card
          class="bg-card border-0 hover:bg-card/80 transition-all duration-200"
        >
          <CardHeader class="p-6 pb-3">
            <CardTitle
              class="text-sm font-medium text-muted-foreground uppercase tracking-wider"
            >
              Total Scripts
            </CardTitle>
          </CardHeader>
          <CardContent class="p-6 pt-0">
            <div class="text-3xl font-semibold text-foreground">0</div>
            <p class="text-sm text-muted-foreground mt-2">
              No scripts executed yet
            </p>
          </CardContent>
        </Card>
      </div>

      <div use:hover={{ scale: 1.01 }}>
        <Card
          class="bg-card border-0 hover:bg-card/80 transition-all duration-200"
        >
          <CardHeader class="p-6 pb-3">
            <CardTitle
              class="text-sm font-medium text-muted-foreground uppercase tracking-wider"
            >
              Success Rate
            </CardTitle>
          </CardHeader>
          <CardContent class="p-6 pt-0">
            <div class="text-3xl font-semibold text-foreground">0%</div>
            <p class="text-sm text-muted-foreground mt-2">No data available</p>
          </CardContent>
        </Card>
      </div>

      <div use:hover={{ scale: 1.01 }}>
        <Card
          class="bg-card border-0 hover:bg-card/80 transition-all duration-200"
        >
          <CardHeader class="p-6 pb-3">
            <CardTitle
              class="text-sm font-medium text-muted-foreground uppercase tracking-wider"
            >
              Avg. Runtime
            </CardTitle>
          </CardHeader>
          <CardContent class="p-6 pt-0">
            <div class="text-3xl font-semibold text-foreground">0s</div>
            <p class="text-sm text-muted-foreground mt-2">
              No executions recorded
            </p>
          </CardContent>
        </Card>
      </div>

      <div use:hover={{ scale: 1.01 }}>
        <Card
          class="bg-card border-0 hover:bg-card/80 transition-all duration-200"
        >
          <CardHeader class="p-6 pb-3">
            <CardTitle
              class="text-sm font-medium text-muted-foreground uppercase tracking-wider"
            >
              Last Run
            </CardTitle>
          </CardHeader>
          <CardContent class="p-6 pt-0">
            <div class="text-3xl font-semibold text-foreground">Never</div>
            <p class="text-sm text-muted-foreground mt-2">
              No scripts executed
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  </div>
</DashboardLayout>

<script lang="ts">
  import DashboardLayout from "$lib/components/DashboardLayout.svelte";
  import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
  } from "$lib/components/ui/card";
  import { animate, stagger } from "$lib/actions/animate";
  import { FileCode, CheckCircle, Clock, Calendar } from "@lucide/svelte";
</script>

<DashboardLayout>
  <div class="space-y-8">
    <!-- Header Section -->
    <div class="space-y-3" use:animate={{ preset: "slideInUp", delay: 0.1 }}>
      <h2 class="text-3xl font-bold text-white tracking-tight">Analytics</h2>
      <p class="text-body">
        Monitor your script performance and execution metrics.
      </p>
    </div>

    <!-- Metrics Grid -->
    <div
      class="grid gap-6 md:grid-cols-2 lg:grid-cols-4"
      use:stagger={{ preset: "scaleIn", staggerType: "fast", delay: 0.3 }}
    >
      <div>
        <Card class="card-premium">
          <CardHeader class="p-6 pb-3">
            <CardTitle
              class="text-sm font-semibold text-white/60 uppercase tracking-wider flex items-center gap-2"
            >
              <FileCode size={16} class="text-primary" />
              Total Scripts
            </CardTitle>
          </CardHeader>
          <CardContent class="p-6 pt-0">
            <div class="text-3xl font-bold text-white">0</div>
            <p class="text-caption mt-2">No scripts executed yet</p>
          </CardContent>
        </Card>
      </div>

      <div>
        <Card class="card-premium">
          <CardHeader class="p-6 pb-3">
            <CardTitle
              class="text-sm font-semibold text-white/60 uppercase tracking-wider flex items-center gap-2"
            >
              <CheckCircle size={16} class="text-primary" />
              Success Rate
            </CardTitle>
          </CardHeader>
          <CardContent class="p-6 pt-0">
            <div class="text-3xl font-bold text-white">0%</div>
            <p class="text-caption mt-2">No data available</p>
          </CardContent>
        </Card>
      </div>

      <div>
        <Card class="card-premium">
          <CardHeader class="p-6 pb-3">
            <CardTitle
              class="text-sm font-semibold text-white/60 uppercase tracking-wider flex items-center gap-2"
            >
              <Clock size={16} class="text-primary" />
              Avg. Runtime
            </CardTitle>
          </CardHeader>
          <CardContent class="p-6 pt-0">
            <div class="text-3xl font-bold text-white">0s</div>
            <p class="text-caption mt-2">No executions recorded</p>
          </CardContent>
        </Card>
      </div>

      <div>
        <Card class="card-premium">
          <CardHeader class="p-6 pb-3">
            <CardTitle
              class="text-sm font-semibold text-white/60 uppercase tracking-wider flex items-center gap-2"
            >
              <Calendar size={16} class="text-primary" />
              Last Run
            </CardTitle>
          </CardHeader>
          <CardContent class="p-6 pt-0">
            <div class="text-3xl font-bold text-white">Never</div>
            <p class="text-caption mt-2">No scripts executed</p>
          </CardContent>
        </Card>
      </div>
    </div>
  </div>
</DashboardLayout>

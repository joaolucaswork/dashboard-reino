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
      <h2 class="text-3xl font-bold text-white tracking-tight">Settings</h2>
      <p class="text-lg font-medium text-white/70">
        Configure your dashboard preferences and Python environment.
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
            Python Environment
          </CardTitle>
          <CardDescription class="text-white/60 mt-2 font-medium">
            Configure your Python interpreter and environment settings
          </CardDescription>
        </CardHeader>
        <CardContent class="p-6 pt-0 space-y-6">
          <div
            class="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-border"
          >
            <div class="space-y-1">
              <p class="text-sm font-semibold text-white">Python Path</p>
              <p class="text-xs font-medium text-white/50">
                Current Python interpreter location
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              class="px-4 py-2 bg-background border-border hover:bg-accent transition-colors duration-200 flex items-center gap-2"
            >
              <Settings size={14} />
              Configure
            </Button>
          </div>
          <div
            class="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-border"
          >
            <div class="space-y-1">
              <p class="text-sm font-semibold text-white">
                Virtual Environment
              </p>
              <p class="text-xs font-medium text-white/50">
                Manage Python virtual environments
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              class="px-4 py-2 bg-background border-border hover:bg-accent transition-colors duration-200 flex items-center gap-2"
            >
              <FolderOpen size={14} />
              Manage
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
            Dashboard Preferences
          </CardTitle>
          <CardDescription class="text-white/60 mt-2 font-medium">
            Customize your dashboard appearance and behavior
          </CardDescription>
        </CardHeader>
        <CardContent class="p-6 pt-0 space-y-6">
          <div
            class="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-border"
          >
            <div class="space-y-1">
              <p class="text-sm font-semibold text-white">Theme</p>
              <p class="text-xs font-medium text-white/50">
                Choose your preferred color scheme
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              class="px-4 py-2 bg-background border-border hover:bg-accent transition-colors duration-200 flex items-center gap-2"
            >
              <Moon size={14} />
              Dark
            </Button>
          </div>
          <div
            class="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-border"
          >
            <div class="space-y-1">
              <p class="text-sm font-semibold text-white">Auto-refresh</p>
              <p class="text-xs font-medium text-white/50">
                Automatically refresh dashboard data
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              class="px-4 py-2 bg-background border-border hover:bg-accent transition-colors duration-200 flex items-center gap-2"
            >
              <RefreshCw size={14} />
              Enabled
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
            Script Management
          </CardTitle>
          <CardDescription class="text-white/60 mt-2 font-medium">
            Configure how scripts are executed and managed
          </CardDescription>
        </CardHeader>
        <CardContent class="p-6 pt-0 space-y-6">
          <div
            class="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-border"
          >
            <div class="space-y-1">
              <p class="text-sm font-semibold text-white">Script Directory</p>
              <p class="text-xs font-medium text-white/50">
                Default location for Python scripts
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              class="px-4 py-2 bg-background border-border hover:bg-accent transition-colors duration-200 flex items-center gap-2"
            >
              <Search size={14} />
              Browse
            </Button>
          </div>
          <div
            class="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-border"
          >
            <div class="space-y-1">
              <p class="text-sm font-semibold text-white">Execution Timeout</p>
              <p class="text-xs font-medium text-white/50">
                Maximum time for script execution
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
            About
          </CardTitle>
          <CardDescription class="text-white/60 mt-2 font-medium">
            Dashboard information and version details
          </CardDescription>
        </CardHeader>
        <CardContent class="p-6 pt-0">
          <div class="space-y-4">
            <div
              class="flex justify-between items-center p-3 bg-muted/30 rounded-lg"
            >
              <span class="text-sm font-medium text-white/60">Version:</span>
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
                >Python Support:</span
              >
              <span class="text-sm font-semibold text-primary">Ready</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
</DashboardLayout>

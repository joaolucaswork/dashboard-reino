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
  import {
    animate,
    stagger,
    hover,
    buttonPress,
    loading,
    feedback,
  } from "$lib/actions/animate";
  import { onMount } from "svelte";
  import {
    Play,
    Plus,
    FileCode,
    Terminal,
    Clock,
    CheckCircle,
    AlertCircle,
  } from "@lucide/svelte";

  let scripts: any[] = $state([]);
  let executionLog: string = $state("");
  let isRunning: boolean = $state(false);
  let feedbackType = $state<"success" | "error" | null>(null);

  onMount(async () => {
    await loadScripts();
  });

  async function loadScripts() {
    try {
      const response = await fetch("/api/scripts");
      scripts = await response.json();
    } catch (error) {
      console.error("Failed to load scripts:", error);
    }
  }

  async function runScript(scriptId: number) {
    isRunning = true;
    executionLog = "Starting script execution...\n";

    try {
      const response = await fetch("/api/scripts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ scriptId, action: "run" }),
      });

      const result = await response.json();

      if (result.success) {
        executionLog += `✅ Script executed successfully!\n\n`;
        executionLog += `Output:\n${result.output}\n`;
        if (result.error) {
          executionLog += `\nErrors/Warnings:\n${result.error}\n`;
        }

        // Update the script in our local state
        const scriptIndex = scripts.findIndex((s) => s.id === scriptId);
        if (scriptIndex !== -1) {
          scripts[scriptIndex] = result.script;
        }

        // Show success feedback
        feedbackType = "success";
        setTimeout(() => (feedbackType = null), 2000);
      } else {
        executionLog += `❌ Script execution failed!\n\n`;
        executionLog += `Error: ${result.error}\n`;

        // Show error feedback
        feedbackType = "error";
        setTimeout(() => (feedbackType = null), 2000);
      }
    } catch (error) {
      executionLog += `❌ Failed to execute script: ${error}\n`;

      // Show error feedback
      feedbackType = "error";
      setTimeout(() => (feedbackType = null), 2000);
    } finally {
      isRunning = false;
    }
  }
</script>

<DashboardLayout>
  <div class="space-y-8">
    <!-- Header Section -->
    <div
      class="flex items-center justify-between"
      use:animate={{ preset: "slideInUp", delay: 0.1 }}
    >
      <div class="space-y-3">
        <h2 class="text-3xl font-bold text-white tracking-tight">
          Python Scripts
        </h2>
        <p class="text-lg font-medium text-white/70">
          Manage and execute your Python scripts from the dashboard.
        </p>
      </div>
      <div use:hover={{ scale: 1.05, y: -2 }} use:buttonPress>
        <Button
          class="px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 transition-colors duration-200 flex items-center gap-2 font-semibold"
        >
          <Plus size={16} />
          Add Script
        </Button>
      </div>
    </div>

    <!-- Scripts Grid -->
    <div
      class="grid gap-6"
      use:stagger={{ preset: "scaleIn", staggerType: "standard", delay: 0.3 }}
    >
      {#each scripts as script}
        <div use:hover={{ scale: 1.005 }}>
          <Card
            class="bg-card border-0 hover:bg-card/80 transition-all duration-200"
          >
            <CardHeader class="p-6">
              <div class="flex items-start justify-between">
                <div class="space-y-2">
                  <CardTitle class="text-lg font-bold text-white">
                    {script.name}
                  </CardTitle>
                  <CardDescription class="text-white/60 font-medium">
                    {script.description}
                  </CardDescription>
                </div>
                <div class="flex items-center gap-3">
                  <span class="status-indicator">
                    {script.status}
                  </span>
                  <div
                    use:hover={{ scale: 1.05, y: -1 }}
                    use:buttonPress
                    use:loading={isRunning}
                    use:feedback={feedbackType}
                  >
                    <Button
                      size="sm"
                      onclick={() => runScript(script.id)}
                      disabled={isRunning}
                      class="px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-all duration-200 flex items-center gap-2 font-semibold"
                    >
                      <Play size={14} />
                      {isRunning ? "Running..." : "Run"}
                    </Button>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent class="p-6 pt-0">
              <div class="flex items-center justify-between text-sm">
                <span class="text-white/60 flex items-center gap-1 font-medium">
                  <Clock size={12} />
                  Last run:
                  <span class="text-white font-semibold"
                    >{script.lastRun || "Never"}</span
                  >
                </span>
                <span class="text-white/60 flex items-center gap-1 font-medium">
                  <CheckCircle size={12} class="text-primary" />
                  Status:
                  <span class="text-primary font-semibold"
                    >Ready to execute</span
                  >
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      {/each}
    </div>

    <!-- Execution Log -->
    <Card class="bg-card border-border">
      <CardHeader class="p-6">
        <CardTitle class="text-xl font-bold text-white flex items-center gap-2">
          <Terminal size={20} class="text-primary" />
          Script Execution Log
        </CardTitle>
        <CardDescription class="text-white/60 mt-2 font-medium">
          View the output and results of your script executions
        </CardDescription>
      </CardHeader>
      <CardContent class="p-6 pt-0">
        {#if executionLog}
          <pre
            class="text-sm bg-muted/50 text-white font-medium p-4 rounded-lg overflow-auto max-h-80 whitespace-pre-wrap border border-border font-mono">{executionLog}</pre>
        {:else}
          <div class="flex items-center justify-center h-40 text-white/60">
            <div class="text-center space-y-3">
              <div
                class="w-16 h-16 bg-muted rounded-full mx-auto flex items-center justify-center"
              >
                <div class="w-8 h-8 bg-muted-foreground/20 rounded-full"></div>
              </div>
              <div>
                <p class="text-sm font-semibold text-white/80">
                  No execution logs yet
                </p>
                <p class="text-xs font-medium text-white/50 mt-1">
                  Run a script to see output here
                </p>
              </div>
            </div>
          </div>
        {/if}
      </CardContent>
    </Card>
  </div>
</DashboardLayout>

<script lang="ts">
  import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuItem,
    SidebarProvider,
    SidebarTrigger,
  } from "$lib/components/ui/sidebar";
  import { Button } from "$lib/components/ui/button";
  import {
    animate,
    stagger,
    hover,
    buttonPress,
    pageTransition,
  } from "$lib/actions/animate";
  import { onMount } from "svelte";
  import {
    LayoutDashboard,
    TrendingUp,
    FileCode,
    Settings,
    Menu,
    User,
  } from "@lucide/svelte";

  let { children } = $props();

  const menuItems = [
    { title: "Dashboard", href: "/", icon: LayoutDashboard },
    { title: "Analytics", href: "/analytics", icon: TrendingUp },
    { title: "Scripts", href: "/scripts", icon: FileCode },
    { title: "Settings", href: "/settings", icon: Settings },
  ];

  let mainContentElement: HTMLElement;

  onMount(() => {
    // Animate main content on mount
    if (mainContentElement) {
      animate(mainContentElement, { preset: "slideInUp", delay: 0.1 });
    }
  });
</script>

<SidebarProvider>
  <div class="flex h-screen w-full bg-background">
    <!-- Sidebar -->
    <Sidebar class="border-r border-sidebar-border bg-sidebar">
      <SidebarContent class="p-0">
        <!-- Logo/Brand Area -->
        <div
          class="p-6 border-b border-sidebar-border"
          use:animate={{ preset: "slideInLeft", delay: 0.1 }}
        >
          <h2 class="text-xl font-bold text-white tracking-tight">Reino</h2>
          <p class="text-sm font-medium text-white/60 mt-1">Dashboard</p>
        </div>

        <!-- Navigation -->
        <div class="p-4">
          <SidebarGroup>
            <div use:animate={{ preset: "fadeIn", delay: 0.2 }}>
              <SidebarGroupLabel
                class="text-xs font-semibold text-white/50 uppercase tracking-wider mb-3"
              >
                Navigation
              </SidebarGroupLabel>
            </div>
            <SidebarGroupContent>
              <div
                class="space-y-1"
                use:stagger={{
                  preset: "slideInLeft",
                  staggerType: "fast",
                  delay: 0.3,
                }}
              >
                <SidebarMenu class="space-y-1">
                  {#each menuItems as item}
                    {@const Icon = item.icon}
                    <SidebarMenuItem>
                      <div use:hover={{ scale: 1.02, y: -1 }} use:buttonPress>
                        <a
                          href={item.href}
                          class="w-full justify-start px-3 py-3 text-sm font-semibold text-white/70 hover:text-white hover:bg-sidebar-accent rounded-lg transition-all duration-200 flex items-center gap-3"
                        >
                          <Icon size={16} class="text-white/50" />
                          {item.title}
                        </a>
                      </div>
                    </SidebarMenuItem>
                  {/each}
                </SidebarMenu>
              </div>
            </SidebarGroupContent>
          </SidebarGroup>
        </div>
      </SidebarContent>
    </Sidebar>

    <!-- Main Content -->
    <div class="flex flex-1 flex-col min-w-0">
      <!-- Header -->
      <header
        class="border-b border-border bg-background/80 backdrop-blur-xl"
        use:animate={{ preset: "slideInDown", delay: 0.1 }}
      >
        <div class="flex h-16 items-center px-6">
          <div use:hover={{ scale: 1.1 }} use:buttonPress>
            <SidebarTrigger
              class="mr-4 p-2 hover:bg-accent rounded-lg transition-colors duration-200"
            >
              <Menu size={16} />
            </SidebarTrigger>
          </div>
          <div class="flex flex-1 items-center justify-between">
            <div use:animate={{ preset: "fadeIn", delay: 0.3 }}>
              <h1 class="text-lg font-bold text-white">Dashboard</h1>
            </div>
            <div
              class="flex items-center space-x-3"
              use:animate={{ preset: "slideInRight", delay: 0.4 }}
            >
              <div use:hover={{ scale: 1.05, y: -1 }} use:buttonPress>
                <Button
                  variant="outline"
                  size="sm"
                  class="px-4 py-2 text-sm font-semibold bg-card border-border hover:bg-accent transition-all duration-200 flex items-center gap-2"
                >
                  <User size={14} />
                  Profile
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <!-- Main Content Area -->
      <main class="flex-1 overflow-auto bg-background">
        <div class="p-8" bind:this={mainContentElement} use:pageTransition>
          {@render children?.()}
        </div>
      </main>
    </div>
  </div>
</SidebarProvider>

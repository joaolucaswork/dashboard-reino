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

  import {
    animate,
    stagger,
    hover,
    buttonPress,
    pageTransition,
  } from "$lib/actions/animate";
  import { onMount } from "svelte";
  import {
    TrendingUp,
    Settings,
    Menu,
    User,
    Home,
    Bell,
    FileText,
    ChartBar,
    RefreshCw,
    Target,
    ChevronDown,
  } from "@lucide/svelte";

  let { children } = $props();

  // Integrations with their respective colors
  const integrations = [
    { name: "Itaú", color: "bg-orange-500" },
    { name: "BTG", color: "bg-blue-500" },
    { name: "XP", color: "bg-gray-900" },
    { name: "Banco do Brasil", color: "bg-yellow-500" },
  ];

  // Tables menu items from the design
  const tableMenuItems = [
    { title: "Relatório", href: "/relatorio", icon: FileText },
    {
      title: "Posição Consolidada",
      href: "/posicao-consolidada",
      icon: ChartBar,
    },
    { title: "Movimentações", href: "/movimentacoes", icon: RefreshCw },
    { title: "Análises", href: "/analises", icon: TrendingUp },
    { title: "Asset Allocation", href: "/asset-allocation", icon: Target },
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
        <!-- User Profile Section -->
        <div
          class="p-6 border-b border-sidebar-border"
          use:animate={{ preset: "slideInLeft", delay: 0.1 }}
        >
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div
                class="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center"
              >
                <User size={16} class="text-white/70" />
              </div>
              <span
                class="text-sm font-medium text-white/90"
                style="font-weight: 500;">Usuário</span
              >
            </div>
            <div class="flex items-center gap-2">
              <a
                href="/"
                class="p-1.5 hover:bg-white/10 rounded-md transition-colors"
              >
                <Home size={16} class="text-white/60" />
              </a>
              <button
                class="p-1.5 hover:bg-white/10 rounded-md transition-colors"
              >
                <Bell size={16} class="text-white/60" />
              </button>
              <a
                href="/settings"
                class="p-1.5 hover:bg-white/10 rounded-md transition-colors"
              >
                <Settings size={16} class="text-white/60" />
              </a>
            </div>
          </div>
        </div>

        <!-- Integrações Section -->
        <div class="p-4">
          <SidebarGroup>
            <div use:animate={{ preset: "fadeIn", delay: 0.2 }}>
              <SidebarGroupLabel
                class="text-xs font-medium text-white/50 mb-3 flex items-center justify-between"
              >
                Integrações
                <ChevronDown size={12} class="text-white/30" />
              </SidebarGroupLabel>
            </div>
            <SidebarGroupContent>
              <div
                class="space-y-2"
                use:stagger={{
                  preset: "slideInLeft",
                  staggerType: "fast",
                  delay: 0.3,
                }}
              >
                <SidebarMenu class="space-y-2">
                  {#each integrations as integration}
                    <SidebarMenuItem>
                      <div use:hover={{ scale: 1.02, y: -1 }} use:buttonPress>
                        <div
                          class="w-full justify-start px-3 py-2.5 text-sm font-medium text-white/70 hover:text-white hover:bg-sidebar-accent rounded-lg transition-all duration-200 flex items-center gap-3 cursor-pointer"
                        >
                          <div
                            class="w-3 h-3 rounded-sm {integration.color}"
                          ></div>
                          {integration.name}
                        </div>
                      </div>
                    </SidebarMenuItem>
                  {/each}
                </SidebarMenu>
              </div>
            </SidebarGroupContent>
          </SidebarGroup>
        </div>

        <!-- Tabelas Section -->
        <div class="p-4">
          <SidebarGroup>
            <div use:animate={{ preset: "fadeIn", delay: 0.4 }}>
              <SidebarGroupLabel
                class="text-xs font-medium text-white/50 mb-3 flex items-center justify-between"
              >
                Tabelas
                <ChevronDown size={12} class="text-white/30" />
              </SidebarGroupLabel>
            </div>
            <SidebarGroupContent>
              <div
                class="space-y-1"
                use:stagger={{
                  preset: "slideInLeft",
                  staggerType: "fast",
                  delay: 0.5,
                }}
              >
                <SidebarMenu class="space-y-1">
                  {#each tableMenuItems as item}
                    {@const Icon = item.icon}
                    <SidebarMenuItem>
                      <div use:hover={{ scale: 1.02, y: -1 }} use:buttonPress>
                        <a
                          href={item.href}
                          class="w-full justify-start px-3 py-2.5 text-sm font-medium text-white/70 hover:text-white hover:bg-sidebar-accent rounded-lg transition-all duration-200 flex items-center gap-3"
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
              <h1 class="text-lg font-bold text-white">
                Ferramentas do BackOffice
              </h1>
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

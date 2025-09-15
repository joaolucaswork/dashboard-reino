<script lang="ts">
  import * as Sidebar from "$lib/components/ui/sidebar/index.js";

  import { animate, stagger, pageTransition } from "$lib/actions/animate";
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
    { name: "XP", color: "bg-yellow-500" },
    { name: "Banco do Brasil", color: "bg-sky-400" },
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

<Sidebar.Provider>
  <div class="flex h-screen w-full bg-background">
    <!-- Sidebar -->
    <Sidebar.Root
      collapsible="icon"
      class="border-r border-sidebar-border bg-sidebar"
    >
      <Sidebar.Content class="p-0 flex flex-col h-full">
        <!-- Main Navigation Content -->
        <div class="flex-1 overflow-y-auto">
          <!-- Integrações Section -->
          <div class="p-4 pt-6">
            <Sidebar.Group>
              <div use:animate={{ preset: "fadeIn", delay: 0.2 }}>
                <Sidebar.GroupLabel
                  class="text-xs font-medium text-white/50 mb-3 flex items-center justify-between group-data-[collapsible=icon]:hidden sidebar-text-fade group-data-[collapsible=icon]:mb-0 group-data-[collapsible=icon]:h-0 group-data-[collapsible=icon]:overflow-hidden"
                >
                  Integrações
                  <ChevronDown size={14} class="text-white/30" />
                </Sidebar.GroupLabel>
              </div>
              <Sidebar.GroupContent>
                <div
                  class="space-y-2"
                  use:stagger={{
                    preset: "slideInLeft",
                    staggerType: "fast",
                    delay: 0.3,
                  }}
                >
                  <Sidebar.Menu class="space-y-2">
                    {#each integrations as integration}
                      <Sidebar.MenuItem>
                        <div>
                          <Sidebar.MenuButton>
                            {#snippet child({ props })}
                              <div
                                {...props}
                                class="sidebar-menu-button w-full justify-start px-3 py-2.5 text-sm font-medium text-white/70 hover:text-white hover:bg-sidebar-accent rounded-lg flex items-center gap-3 cursor-pointer group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-3"
                              >
                                <div
                                  class="w-4 h-4 rounded-sm {integration.color} flex-shrink-0"
                                ></div>
                                <span
                                  class="sidebar-menu-item-text sidebar-text-no-wrap group-data-[collapsible=icon]:hidden"
                                >
                                  {integration.name}
                                </span>
                              </div>
                            {/snippet}
                          </Sidebar.MenuButton>
                        </div>
                      </Sidebar.MenuItem>
                    {/each}
                  </Sidebar.Menu>
                </div>
              </Sidebar.GroupContent>
            </Sidebar.Group>
          </div>

          <!-- Tabelas Section -->
          <div class="p-4">
            <Sidebar.Group>
              <div use:animate={{ preset: "fadeIn", delay: 0.4 }}>
                <Sidebar.GroupLabel
                  class="text-xs font-medium text-white/50 mb-3 flex items-center justify-between group-data-[collapsible=icon]:hidden sidebar-text-fade group-data-[collapsible=icon]:mb-0 group-data-[collapsible=icon]:h-0 group-data-[collapsible=icon]:overflow-hidden"
                >
                  Tabelas
                  <ChevronDown size={14} class="text-white/30" />
                </Sidebar.GroupLabel>
              </div>
              <Sidebar.GroupContent>
                <div
                  class="space-y-1"
                  use:stagger={{
                    preset: "slideInLeft",
                    staggerType: "fast",
                    delay: 0.5,
                  }}
                >
                  <Sidebar.Menu class="space-y-1">
                    {#each tableMenuItems as item}
                      {@const Icon = item.icon}
                      <Sidebar.MenuItem>
                        <div>
                          <Sidebar.MenuButton>
                            {#snippet child({ props })}
                              <a
                                href={item.href}
                                {...props}
                                class="sidebar-menu-button w-full justify-start px-3 py-2.5 text-sm font-medium text-white/70 hover:text-white hover:bg-sidebar-accent rounded-lg flex items-center gap-3 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-3"
                              >
                                <Icon
                                  size={20}
                                  class="text-white/50 flex-shrink-0"
                                />
                                <span
                                  class="sidebar-menu-item-text sidebar-text-no-wrap group-data-[collapsible=icon]:hidden"
                                >
                                  {item.title}
                                </span>
                              </a>
                            {/snippet}
                          </Sidebar.MenuButton>
                        </div>
                      </Sidebar.MenuItem>
                    {/each}
                  </Sidebar.Menu>
                </div>
              </Sidebar.GroupContent>
            </Sidebar.Group>
          </div>
        </div>

        <!-- User Profile Section - Bottom -->
        <div
          class="mt-auto border-t border-sidebar-border bg-sidebar-accent/30 backdrop-blur-sm"
          use:animate={{ preset: "slideInLeft", delay: 0.1 }}
        >
          <div
            class="p-6 group-data-[collapsible=icon]:p-6 group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:flex-col group-data-[collapsible=icon]:items-center"
          >
            <div
              class="flex items-center justify-between group-data-[collapsible=icon]:flex-col group-data-[collapsible=icon]:gap-4"
            >
              <div
                class="flex items-center gap-3 group-data-[collapsible=icon]:flex-col group-data-[collapsible=icon]:gap-2"
              >
                <div
                  class="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center"
                >
                  <User size={20} class="text-white/70" />
                </div>
                <span
                  class="text-sm font-medium text-white/90 group-data-[collapsible=icon]:hidden sidebar-text-fade"
                  style="font-weight: 500;">João Lucas</span
                >
              </div>
              <div
                class="flex items-center gap-1 group-data-[collapsible=icon]:flex-col group-data-[collapsible=icon]:gap-1"
              >
                <a
                  href="/"
                  class="p-1.5 hover:bg-white/10 rounded-md transition-colors"
                  title="Home"
                >
                  <Home size={16} class="text-white/60 hover:text-white/80" />
                </a>
                <button
                  class="p-1.5 hover:bg-white/10 rounded-md transition-colors"
                  title="Notificações"
                >
                  <Bell size={16} class="text-white/60 hover:text-white/80" />
                </button>
                <a
                  href="/settings"
                  class="p-1.5 hover:bg-white/10 rounded-md transition-colors"
                  title="Configurações"
                >
                  <Settings
                    size={16}
                    class="text-white/60 hover:text-white/80"
                  />
                </a>
              </div>
            </div>
          </div>
        </div>
      </Sidebar.Content>
    </Sidebar.Root>

    <!-- Main Content -->
    <div class="flex flex-1 flex-col min-w-0 main-content-transition">
      <!-- Header -->
      <header
        class="border-b border-border bg-background/80 backdrop-blur-xl"
        use:animate={{ preset: "slideInDown", delay: 0.1 }}
      >
        <div class="flex h-16 items-center px-6">
          <div>
            <Sidebar.Trigger class="mr-4 p-2 hover:bg-accent rounded-lg">
              <Menu size={20} />
            </Sidebar.Trigger>
          </div>
          <div class="flex flex-1 items-center justify-between">
            <div use:animate={{ preset: "fadeIn", delay: 0.3 }}>
              <h1 class="text-lg font-bold text-white">Reino Capital</h1>
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
</Sidebar.Provider>

<style>
  /* Premium sidebar animations with cubic-bezier easing */
  :global([data-slot="sidebar-container"]) {
    will-change: transform, width;
    transition:
      left 300ms cubic-bezier(0.4, 0, 0.2, 1),
      right 300ms cubic-bezier(0.4, 0, 0.2, 1),
      width 300ms cubic-bezier(0.4, 0, 0.2, 1),
      transform 300ms cubic-bezier(0.4, 0, 0.2, 1);
  }

  :global([data-slot="sidebar-gap"]) {
    will-change: width;
    transition: width 300ms cubic-bezier(0.4, 0, 0.2, 1);
  }

  /* Prevent layout shift during sidebar transitions */
  :global([data-slot="sidebar-wrapper"]) {
    will-change: auto;
  }

  /* Prevent text wrapping during transitions */
  :global(.sidebar-text-no-wrap) {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  /* Enhanced hover effects for icons - removed for instant feedback */

  /* Smooth main content transitions */
  :global(.main-content-transition) {
    will-change: margin-left, width;
    transition: margin-left 300ms cubic-bezier(0.4, 0, 0.2, 1);
  }

  /* Subtle opacity animation for text when sidebar closes - slowed down to match sidebar animation */
  :global(.sidebar-menu-item-text) {
    will-change: opacity;
    transition: opacity 280ms cubic-bezier(0.4, 0, 0.2, 1);
  }

  :global(.group-data-[collapsible="icon"] .sidebar-menu-item-text) {
    opacity: 0;
    transition-delay: 0ms;
  }

  :global(.group-data-[state="expanded"] .sidebar-menu-item-text) {
    opacity: 1;
    transition-delay: 20ms;
  }

  /* Optimize sidebar container for smooth animations */
  :global([data-sidebar="sidebar"]) {
    contain: layout style;
    will-change: width;
  }

  /* Prevent text selection during animations */
  :global(.sidebar-animating) {
    user-select: none;
    pointer-events: none;
  }

  /* Sidebar menu buttons - instant feedback */
  :global(.sidebar-menu-button) {
    will-change: background-color;
  }

  /* Optimize for hardware acceleration */
  :global([data-slot="sidebar-inner"]) {
    transform: translateZ(0);
    backface-visibility: hidden;
  }

  /* Subtle opacity animation for user name and section titles - slowed down to match sidebar animation */
  :global(.sidebar-text-fade) {
    transition: opacity 280ms cubic-bezier(0.4, 0, 0.2, 1);
    will-change: opacity;
  }

  :global(.group-data-[collapsible="icon"] .sidebar-text-fade) {
    opacity: 0;
    transition-delay: 0ms;
  }

  :global(.group-data-[state="expanded"] .sidebar-text-fade) {
    opacity: 1;
    transition-delay: 20ms;
  }

  /* Enhanced transitions for group labels to prevent layout shifts */
  :global([data-sidebar="group-label"]) {
    transition:
      height 300ms cubic-bezier(0.4, 0, 0.2, 1),
      margin 300ms cubic-bezier(0.4, 0, 0.2, 1),
      opacity 280ms cubic-bezier(0.4, 0, 0.2, 1);
    will-change: height, margin, opacity;
  }
</style>

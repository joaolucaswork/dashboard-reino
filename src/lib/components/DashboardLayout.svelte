<script lang="ts">
  import * as Sidebar from "$lib/components/ui/sidebar/index.js";
  import { SIDEBAR_COOKIE_NAME } from "$lib/components/ui/sidebar/constants.js";

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
    Folder,
  } from "@lucide/svelte";
  import {
    DynamicFolderPreview,
    type FolderConfig,
  } from "$lib/components/ui/dynamic-folder-preview/index.js";
  import { ReinoLogo } from "$lib/components/ui/reino-logo/index.js";

  let { children } = $props();

  // Initialize sidebar state from cookie
  let sidebarOpen = $state(true); // Default to true, will be updated from cookie

  // Interactive thumbnail state management
  let expandedSections = $state(new Set<"integrations" | "tables">());

  // Integrations with their respective colors
  const integrations = [
    {
      name: "Itaú",
      color: "bg-orange-500",
      shortName: "ITU",
      href: "/integracoes/itau",
    },
    {
      name: "BTG",
      color: "bg-blue-500",
      shortName: "BTG",
      href: "/integracoes/btg",
    },
    {
      name: "XP",
      color: "bg-yellow-500",
      shortName: "XP",
      href: "/integracoes/xp",
    },
    {
      name: "Banco do Brasil",
      color: "bg-sky-400",
      shortName: "BB",
      href: "/integracoes/bb",
    },
  ];

  // Tables menu items from the design
  const tableMenuItems = [
    {
      title: "Relatório",
      href: "/relatorio",
      icon: FileText,
      shortTitle: "REL",
    },
    {
      title: "Posição Consolidada",
      href: "/posicao-consolidada",
      icon: ChartBar,
      shortTitle: "POS",
    },
    {
      title: "Movimentações",
      href: "/movimentacoes",
      icon: RefreshCw,
      shortTitle: "MOV",
    },
    {
      title: "Análises",
      href: "/analises",
      icon: TrendingUp,
      shortTitle: "ANA",
    },
    {
      title: "Asset Allocation",
      href: "/asset-allocation",
      icon: Target,
      shortTitle: "AST",
    },
  ];

  // Dynamic folder configurations
  const integrationsConfig: FolderConfig = {
    type: "integrations",
    items: integrations.map((integration) => ({
      id: integration.shortName,
      name: integration.name,
      color: integration.color,
    })),
  };

  const tablesConfig: FolderConfig = {
    type: "tables",
    items: tableMenuItems.map((item) => ({
      id: item.shortTitle,
      name: item.title,
      icon: item.icon,
    })),
  };

  let mainContentElement: HTMLElement;

  // Function to read cookie value
  function getCookieValue(name: string): string | null {
    if (typeof document === "undefined") return null;
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(";").shift() || null;
    return null;
  }

  // Thumbnail interaction handlers
  function toggleSection(section: "integrations" | "tables") {
    if (expandedSections.has(section)) {
      expandedSections.delete(section);
    } else {
      expandedSections.add(section);
    }
    // Trigger reactivity
    expandedSections = new Set(expandedSections);
  }

  // Calculate dynamic height for thumbnail previews
  function getExpandedHeight(section: "integrations" | "tables"): string {
    const topPadding = 16; // Extra padding at top for better spacing
    const folderIconHeight = 44; // Icon + margin (20px icon + 16px margin + 8px gap)
    const itemHeight = 40; // h-8 + gap-2 (32px + 8px)
    const bottomPadding = 8; // Bottom padding

    let itemCount = 0;
    if (section === "integrations") {
      itemCount = integrations.length;
    } else if (section === "tables") {
      itemCount = tableMenuItems.length;
    }

    const totalHeight =
      topPadding + folderIconHeight + itemCount * itemHeight + bottomPadding;
    return `${totalHeight}px`;
  }

  onMount(() => {
    // Read sidebar state from cookie
    const savedState = getCookieValue(SIDEBAR_COOKIE_NAME);
    if (savedState !== null) {
      sidebarOpen = savedState === "true";
    }

    // Animate main content on mount
    if (mainContentElement) {
      animate(mainContentElement, { preset: "slideInUp", delay: 0.1 });
    }
  });
</script>

<Sidebar.Provider bind:open={sidebarOpen}>
  <div class="flex h-screen w-full bg-background">
    <!-- Sidebar -->
    <Sidebar.Root
      collapsible="icon"
      class="border-r border-sidebar-border bg-sidebar"
    >
      <Sidebar.Content class="p-0 flex flex-col h-full">
        <!-- Sidebar Header with Toggle Button -->
        <div class="p-4 border-b border-sidebar-border/50">
          <div
            class="flex items-center justify-between group-data-[collapsible=icon]:justify-center"
          >
            <div class="group-data-[collapsible=icon]:hidden">
              <a
                href="/"
                class="inline-block hover:opacity-80 transition-opacity duration-200 cursor-pointer"
                title="Voltar para Home"
                aria-label="Voltar para página inicial"
              >
                <ReinoLogo size={28} class="text-white/90" />
              </a>
            </div>
            <!-- Logo for collapsed state -->
            <div class="hidden group-data-[collapsible=icon]:block">
              <a
                href="/"
                class="inline-block hover:opacity-80 transition-opacity duration-200 cursor-pointer p-1"
                title="Voltar para Home"
                aria-label="Voltar para página inicial"
              >
                <ReinoLogo size={20} class="text-white/90" />
              </a>
            </div>
            <Sidebar.Trigger
              class="p-2 hover:bg-sidebar-accent rounded-lg transition-colors"
            >
              <Menu size={24} class="text-white/70 hover:text-white" />
            </Sidebar.Trigger>
          </div>
        </div>

        <!-- Main Navigation Content -->
        <div class="flex-1 overflow-y-auto">
          <!-- Integrações Section -->
          <div class="p-1 pt-1">
            <Sidebar.Group>
              <!-- Full Content View -->
              <div
                class="group-data-[collapsible=icon]:hidden transition-all duration-300 cubic-bezier(0.4, 0, 0.2, 1)"
                use:animate={{ preset: "fadeIn", delay: 0.2 }}
              >
                <Sidebar.GroupLabel
                  class="text-xs font-medium text-white/50 mb-3 flex items-center justify-between sidebar-text-fade"
                >
                  Integrações
                  <Folder size={14} class="text-white/30" />
                </Sidebar.GroupLabel>
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
                                  class="sidebar-menu-button w-full justify-start px-3 py-2.5 text-sm font-medium text-white/70 hover:text-white hover:bg-sidebar-accent rounded-lg flex items-center gap-3 cursor-pointer"
                                >
                                  <div
                                    class="w-4 h-4 rounded-sm {integration.color} flex-shrink-0"
                                  ></div>
                                  <span
                                    class="sidebar-menu-item-text sidebar-text-no-wrap"
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
              </div>

              <!-- Thumbnail Preview for Collapsed State -->
              <div
                class="hidden group-data-[collapsible=icon]:flex flex-col items-center justify-center px-1 py-2 transition-all duration-300 cubic-bezier(0.4, 0, 0.2, 1)"
              >
                <!-- Integrations Thumbnail -->
                <div
                  class="thumbnail-preview w-14 bg-gradient-to-br from-sidebar-accent/80 to-sidebar-accent/40 rounded-xl border border-sidebar-border/50 backdrop-blur-sm relative overflow-hidden transition-all duration-300 cubic-bezier(0.4, 0, 0.2, 1) h-14 mb-4"
                  style={expandedSections.has("integrations")
                    ? `height: ${getExpandedHeight("integrations")}`
                    : ""}
                >
                  <!-- Clickable folder icon area - only when collapsed -->
                  {#if !expandedSections.has("integrations")}
                    <button
                      class="absolute inset-0 w-full h-16 cursor-pointer z-10"
                      title="Integrações Bancárias"
                      onclick={() => toggleSection("integrations")}
                      onkeydown={(e) =>
                        e.key === "Enter" && toggleSection("integrations")}
                      aria-label="Toggle integrations menu"
                    ></button>
                  {/if}
                  <!-- Collapsed state: Dynamic representation of integrations -->
                  <div
                    class="transition-opacity duration-300 cubic-bezier(0.4, 0, 0.2, 1) {expandedSections.has(
                      'integrations'
                    )
                      ? 'opacity-0'
                      : 'opacity-100'}"
                  >
                    <DynamicFolderPreview config={integrationsConfig} />
                  </div>

                  <!-- Expanded state: Full menu items -->
                  <div
                    class="absolute inset-x-2 top-4 bottom-2 flex flex-col gap-2 transition-all duration-300 cubic-bezier(0.4, 0, 0.2, 1) {expandedSections.has(
                      'integrations'
                    )
                      ? 'opacity-100 translate-y-0'
                      : 'opacity-0 translate-y-2'}"
                  >
                    <!-- Folder icon indicator - clickable to close -->
                    <div class="flex justify-center mb-4">
                      <button
                        class="p-2 hover:bg-sidebar-accent rounded-md transition-colors duration-200"
                        onclick={() => toggleSection("integrations")}
                        title="Fechar menu"
                        aria-label="Close integrations menu"
                      >
                        <Folder
                          size={20}
                          class="text-white/60 hover:text-white/80"
                        />
                      </button>
                    </div>
                    {#each integrations as integration}
                      <a
                        href={integration.href}
                        class="w-full h-8 rounded-md bg-sidebar-accent/50 hover:bg-sidebar-accent flex items-center justify-center cursor-pointer transition-colors duration-200 z-30 relative"
                        title={integration.name}
                        aria-label={integration.name}
                      >
                        <div
                          class="w-5 h-5 rounded-sm {integration.color}"
                        ></div>
                      </a>
                    {/each}
                  </div>
                </div>

                <!-- Tables Thumbnail -->
                <div
                  class="thumbnail-preview w-14 bg-gradient-to-br from-sidebar-accent/80 to-sidebar-accent/40 rounded-xl border border-sidebar-border/50 backdrop-blur-sm relative overflow-hidden transition-all duration-300 cubic-bezier(0.4, 0, 0.2, 1) h-14"
                  style={expandedSections.has("tables")
                    ? `height: ${getExpandedHeight("tables")}`
                    : ""}
                >
                  <!-- Clickable folder icon area - only when collapsed -->
                  {#if !expandedSections.has("tables")}
                    <button
                      class="absolute inset-0 w-full h-16 cursor-pointer z-10"
                      title="Tabelas e Relatórios"
                      onclick={() => toggleSection("tables")}
                      onkeydown={(e) =>
                        e.key === "Enter" && toggleSection("tables")}
                      aria-label="Toggle tables menu"
                    ></button>
                  {/if}
                  <!-- Collapsed state: Dynamic representation of tables -->
                  <div
                    class="transition-opacity duration-300 cubic-bezier(0.4, 0, 0.2, 1) {expandedSections.has(
                      'tables'
                    )
                      ? 'opacity-0'
                      : 'opacity-100'}"
                  >
                    <DynamicFolderPreview config={tablesConfig} />
                  </div>

                  <!-- Expanded state: Full menu items -->
                  <div
                    class="absolute inset-x-2 top-4 bottom-2 flex flex-col gap-2 transition-all duration-300 cubic-bezier(0.4, 0, 0.2, 1) {expandedSections.has(
                      'tables'
                    )
                      ? 'opacity-100 translate-y-0'
                      : 'opacity-0 translate-y-2'}"
                  >
                    <!-- Folder icon indicator - clickable to close -->
                    <div class="flex justify-center mb-4">
                      <button
                        class="p-2 hover:bg-sidebar-accent rounded-md transition-colors duration-200"
                        onclick={() => toggleSection("tables")}
                        title="Fechar menu"
                        aria-label="Close tables menu"
                      >
                        <Folder
                          size={20}
                          class="text-white/60 hover:text-white/80"
                        />
                      </button>
                    </div>
                    {#each tableMenuItems as item}
                      {@const Icon = item.icon}
                      <a
                        href={item.href}
                        class="w-full h-8 rounded-md bg-sidebar-accent/50 hover:bg-sidebar-accent flex items-center justify-center cursor-pointer transition-colors duration-200 z-30 relative"
                        title={item.title}
                      >
                        <Icon size={20} class="text-white/70" />
                      </a>
                    {/each}
                  </div>
                </div>
              </div>
            </Sidebar.Group>
          </div>

          <!-- Tabelas Section -->
          <div class="p-1">
            <Sidebar.Group>
              <!-- Full Content View -->
              <div
                class="group-data-[collapsible=icon]:hidden transition-all duration-300 cubic-bezier(0.4, 0, 0.2, 1)"
                use:animate={{ preset: "fadeIn", delay: 0.4 }}
              >
                <Sidebar.GroupLabel
                  class="text-xs font-medium text-white/50 mb-3 flex items-center justify-between sidebar-text-fade"
                >
                  Tabelas
                  <Folder size={14} class="text-white/30" />
                </Sidebar.GroupLabel>
                <Sidebar.GroupContent>
                  <div
                    class="space-y-1"
                    use:stagger={{
                      preset: "slideInLeft",
                      staggerType: "fast",
                      delay: 0.5,
                    }}
                  >
                    <Sidebar.Menu class="space-y-2">
                      {#each tableMenuItems as item}
                        {@const Icon = item.icon}
                        <Sidebar.MenuItem>
                          <div>
                            <Sidebar.MenuButton>
                              {#snippet child({ props })}
                                <a
                                  href={item.href}
                                  {...props}
                                  class="sidebar-menu-button w-full justify-start px-3 py-2.5 text-sm font-medium text-white/70 hover:text-white hover:bg-sidebar-accent rounded-lg flex items-center gap-3"
                                >
                                  <Icon
                                    size={20}
                                    class="text-white/50 flex-shrink-0"
                                  />
                                  <span
                                    class="sidebar-menu-item-text sidebar-text-no-wrap"
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
              </div>
            </Sidebar.Group>
          </div>
        </div>

        <!-- User Profile Section - Bottom -->
        <div
          class="mt-auto border-t border-sidebar-border bg-sidebar-accent/60 backdrop-blur-sm"
          use:animate={{ preset: "slideInLeft", delay: 0.1 }}
        >
          <div
            class="p-6 group-data-[collapsible=icon]:p-6 group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:flex-col group-data-[collapsible=icon]:items-center"
          >
            <div
              class="flex items-center justify-between group-data-[collapsible=icon]:flex-col group-data-[collapsible=icon]:gap-4 w-full"
            >
              <div
                class="flex items-center gap-3 group-data-[collapsible=icon]:flex-col group-data-[collapsible=icon]:gap-2 min-w-0 flex-1"
              >
                <div
                  class="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center"
                >
                  <User size={20} class="text-white/70" />
                </div>
                <span
                  class="text-sm font-medium text-white/90 group-data-[collapsible=icon]:hidden sidebar-text-fade sidebar-text-no-wrap"
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
                  <Home size={20} class="text-white/60 hover:text-white/80" />
                </a>
                <button
                  class="p-1.5 hover:bg-white/10 rounded-md transition-colors"
                  title="Notificações"
                >
                  <Bell size={20} class="text-white/60 hover:text-white/80" />
                </button>
                <a
                  href="/settings"
                  class="p-1.5 hover:bg-white/10 rounded-md transition-colors"
                  title="Configurações"
                >
                  <Settings
                    size={20}
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

  /* Thumbnail Preview System Styles */
  :global(.thumbnail-preview) {
    will-change: transform, opacity;
    backdrop-filter: blur(8px);
    box-shadow:
      0 4px 12px rgba(0, 0, 0, 0.15),
      0 2px 4px rgba(0, 0, 0, 0.1),
      inset 0 1px 0 rgba(255, 255, 255, 0.1);
    transition: all 300ms cubic-bezier(0.4, 0, 0.2, 1);
  }

  :global(.thumbnail-preview:hover) {
    box-shadow:
      0 8px 24px rgba(0, 0, 0, 0.2),
      0 4px 8px rgba(0, 0, 0, 0.15),
      inset 0 1px 0 rgba(255, 255, 255, 0.15);
  }

  /* Smooth thumbnail container transitions */
  :global(.group-data-[collapsible="icon"] .thumbnail-preview) {
    animation: thumbnailFadeIn 400ms cubic-bezier(0.4, 0, 0.2, 1) forwards;
  }

  @keyframes thumbnailFadeIn {
    from {
      opacity: 0;
      transform: scale(0.8) translateY(8px);
    }
    to {
      opacity: 1;
      transform: scale(1) translateY(0);
    }
  }

  /* Enhanced background styling for collapsed sidebar */
  :global(.group-data-[collapsible="icon"] [data-sidebar="sidebar"]) {
    background: linear-gradient(
      180deg,
      hsl(var(--sidebar)) 0%,
      hsl(var(--sidebar-accent)) 100%
    );
  }

  /* Optimize thumbnail rendering */
  :global(.thumbnail-preview) {
    transform: translateZ(0);
    backface-visibility: hidden;
    contain: layout style paint;
  }

  /* Enhanced height transition for thumbnail expansion */
  :global(.thumbnail-preview) {
    transition:
      height 300ms cubic-bezier(0.4, 0, 0.2, 1),
      transform 300ms cubic-bezier(0.4, 0, 0.2, 1),
      background 300ms cubic-bezier(0.4, 0, 0.2, 1),
      border-color 300ms cubic-bezier(0.4, 0, 0.2, 1),
      box-shadow 300ms cubic-bezier(0.4, 0, 0.2, 1);
  }

  /* Smooth content reveal animations */
  :global(.thumbnail-preview .absolute) {
    transition:
      opacity 300ms cubic-bezier(0.4, 0, 0.2, 1),
      transform 300ms cubic-bezier(0.4, 0, 0.2, 1);
  }

  /* Enhanced hover effects for expanded menu items - no scale transforms */
  :global(.thumbnail-preview a:hover, .thumbnail-preview button:hover) {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  /* Smooth transitions for thumbnail container */
  :global(.group-data-[collapsible="icon"] .thumbnail-preview) {
    transition: all 300ms cubic-bezier(0.4, 0, 0.2, 1);
  }

  /* Enhanced focus states for accessibility */
  :global(.thumbnail-preview:focus-visible) {
    outline: 2px solid hsl(var(--primary));
    outline-offset: 2px;
  }

  :global(
      .thumbnail-preview a:focus-visible,
      .thumbnail-preview button:focus-visible
    ) {
    outline: 2px solid hsl(var(--primary));
    outline-offset: 1px;
  }

  /* Prevent content overflow during height animation */
  :global(.thumbnail-preview) {
    overflow: hidden;
  }

  /* Enhanced staggered animation for menu items */
  :global(.thumbnail-preview a, .thumbnail-preview button) {
    transition:
      all 200ms cubic-bezier(0.4, 0, 0.2, 1),
      transform 200ms cubic-bezier(0.4, 0, 0.2, 1);
  }
</style>

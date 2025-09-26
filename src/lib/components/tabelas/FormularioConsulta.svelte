<script lang="ts">
  import {
    modoVisualizacao,
    camposVisiveis,
    formularioValido,
    consultarDados,
    loadingState,
    dadosConsulta,
  } from "$lib/stores/tabelas.js";

  import { usuarioLogadoComdinheiro } from "$lib/stores/carteirasComdinheiro.js";

  import SeletorCarteira from "./SeletorCarteira.svelte";
  import SeletorData from "./SeletorData.svelte";
  import SeletorOpcoes from "./SeletorOpcoes.svelte";

  import { Button } from "$lib/components/ui/button";
  import { Label } from "$lib/components/ui/label";
  import { RadioGroup, RadioGroupItem } from "$lib/components/ui/radio-group";
  import * as Tooltip from "$lib/components/ui/tooltip";
  import * as Dialog from "$lib/components/ui/dialog";
  import { Input } from "$lib/components/ui/input";
  import {
    ChartBar,
    Target,
    Search,
    LogIn,
    Database,
    CheckCircle,
    Loader2,
    AlertCircle,
    ChevronDown,
    ChevronRight,
  } from "@lucide/svelte";
  import { onMount } from "svelte";
  import { toast } from "svelte-sonner";
  import SalesforceIcon from "$lib/components/icons/SalesforceIcon.svelte";

  // Interface para carteiras do Salesforce
  interface CarteiraSalesforce {
    id: string;
    nome: string;
    nome_comdinheiro: string | null;
    numero_conta: string | null;
    banco: string | null;
    patrimonio: number;
    porcentagem: number;
    mensalidade: number;
    data_modificacao: string;
    fonte: string;
  }

  // Estado para carteiras do Salesforce
  let carteirasSalesforce: CarteiraSalesforce[] = [];
  let loadingCarteiras = false;

  // Modal de login do Comdinheiro
  let modalLoginAberto = false;
  let credenciaisLogin = { username: "", password: "" };
  let loadingLogin = false;

  // Estados do progresso de login
  interface EtapaLogin {
    id: string;
    titulo: string;
    descricao: string;
    status: "pending" | "loading" | "success" | "error";
    erro?: string;
  }

  let etapasLogin: EtapaLogin[] = [
    {
      id: "validacao",
      titulo: "Validando credenciais",
      descricao: "Verificando usuário e senha fornecidos",
      status: "pending",
    },
    {
      id: "conexao",
      titulo: "Conectando ao Comdinheiro",
      descricao: "Estabelecendo conexão segura com o servidor",
      status: "pending",
    },
    {
      id: "autenticacao",
      titulo: "Autenticando usuário",
      descricao: "Verificando credenciais no sistema Comdinheiro",
      status: "pending",
    },
    {
      id: "carteiras",
      titulo: "Carregando carteiras",
      descricao: "Buscando lista de carteiras disponíveis",
      status: "pending",
    },
    {
      id: "finalizacao",
      titulo: "Finalizando login",
      descricao: "Salvando credenciais e configurando sessão",
      status: "pending",
    },
  ];

  let etapaAtual = -1;
  let mostrarProgresso = true;

  function abrirModalLogin() {
    modalLoginAberto = true;
    // Reset do progresso
    etapasLogin = etapasLogin.map((etapa) => ({
      ...etapa,
      status: "pending",
      erro: undefined,
    }));
    etapaAtual = -1;
  }

  function atualizarEtapa(
    id: string,
    status: EtapaLogin["status"],
    erro?: string
  ) {
    etapasLogin = etapasLogin.map((etapa) =>
      etapa.id === id ? { ...etapa, status, erro } : etapa
    );
    if (status === "loading") {
      etapaAtual = etapasLogin.findIndex((e) => e.id === id);
    }
  }

  async function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async function fazerLoginComdinheiro(event?: Event) {
    if (event) {
      event.preventDefault();
    }

    console.log("🚀 Iniciando processo de login...");

    if (!credenciaisLogin.username || !credenciaisLogin.password) {
      toast.error("Preencha usuário e senha");
      return;
    }

    loadingLogin = true;

    try {
      // Etapa 1: Validação
      atualizarEtapa("validacao", "loading");
      await sleep(500);

      // Validação básica - apenas verificar se não está vazio
      if (
        !credenciaisLogin.username.trim() ||
        !credenciaisLogin.password.trim()
      ) {
        atualizarEtapa(
          "validacao",
          "error",
          "Usuário e senha são obrigatórios"
        );
        toast.error("Usuário e senha são obrigatórios");
        loadingLogin = false;
        return;
      }
      atualizarEtapa("validacao", "success");
      console.log("✅ Validação concluída");

      // Etapa 2: Conexão
      atualizarEtapa("conexao", "loading");
      await sleep(800);

      const { buscarCarteirasComdinheiro } = await import(
        "$lib/stores/carteirasComdinheiro.js"
      );
      atualizarEtapa("conexao", "success");
      console.log("✅ Conexão estabelecida");

      // Etapa 3: Autenticação
      atualizarEtapa("autenticacao", "loading");
      await sleep(1000);

      console.log("🔐 Tentando autenticar com Comdinheiro...");
      const resultado = await buscarCarteirasComdinheiro(
        credenciaisLogin,
        true
      );

      console.log("📊 Resultado da autenticação:", resultado);

      if (!resultado.success) {
        atualizarEtapa(
          "autenticacao",
          "error",
          resultado.error || "Falha na autenticação"
        );
        toast.error(resultado.error || "Falha na autenticação");
        loadingLogin = false;
        return;
      }
      atualizarEtapa("autenticacao", "success");

      // Etapa 4: Carregando carteiras
      atualizarEtapa("carteiras", "loading");
      await sleep(600);

      if (!resultado.carteiras || resultado.carteiras.length === 0) {
        atualizarEtapa("carteiras", "error", "Nenhuma carteira encontrada");
        toast.error("Nenhuma carteira encontrada");
        loadingLogin = false;
        return;
      }
      atualizarEtapa("carteiras", "success");
      console.log(`✅ ${resultado.carteiras.length} carteiras carregadas`);

      // Etapa 5: Finalização
      atualizarEtapa("finalizacao", "loading");
      await sleep(400);
      atualizarEtapa("finalizacao", "success");

      // Sucesso
      await sleep(500);
      console.log("🎉 Login concluído com sucesso!");
      toast.success(
        `Login realizado com sucesso! ${resultado.carteiras?.length || 0} carteiras encontradas`
      );
      modalLoginAberto = false;
      credenciaisLogin = { username: "", password: "" };
    } catch (error) {
      console.error("❌ Erro no login:", error);

      // Marcar etapa atual como erro
      const etapaAtualObj = etapasLogin[etapaAtual];
      if (etapaAtualObj) {
        atualizarEtapa(
          etapaAtualObj.id,
          "error",
          "Erro inesperado durante o processo"
        );
      }

      toast.error(
        "Erro ao conectar com o Comdinheiro: " +
          (error instanceof Error ? error.message : "Erro desconhecido")
      );
    } finally {
      console.log("🔄 Finalizando processo de login...");
      loadingLogin = false;
    }
  }

  // Função para agrupar carteiras por usuário (para calcular o agrupamento na notificação)
  function agruparCarteirasPorUsuario(carteiras: CarteiraSalesforce[]) {
    const gruposDeUsuario = new Map<
      string,
      {
        nome: string;
        bancos: string[];
        patrimonioTotal: number;
        nomeComdinheiro: string | null;
      }
    >();

    // Agrupar carteiras por nome de usuário
    carteiras.forEach((carteira) => {
      const nomeUsuario = carteira.nome;
      const banco = carteira.banco?.trim() || "Banco não informado";
      const patrimonio = Number(carteira.patrimonio) || 0;

      if (gruposDeUsuario.has(nomeUsuario)) {
        const grupo = gruposDeUsuario.get(nomeUsuario)!;
        // Adicionar banco se não estiver já na lista
        if (!grupo.bancos.includes(banco)) {
          grupo.bancos.push(banco);
        }
        // Somar patrimônio
        grupo.patrimonioTotal += patrimonio;
      } else {
        gruposDeUsuario.set(nomeUsuario, {
          nome: nomeUsuario,
          bancos: [banco],
          patrimonioTotal: patrimonio,
          nomeComdinheiro: carteira.nome_comdinheiro,
        });
      }
    });

    // Converter para array de opções e ordenar por patrimônio total (maior primeiro)
    return Array.from(gruposDeUsuario.values()).sort(
      (a, b) => b.patrimonioTotal - a.patrimonioTotal
    );
  }

  // Função para buscar carteiras do Salesforce
  async function buscarCarteirasSalesforce() {
    if (carteirasSalesforce.length > 0) return; // Já carregadas

    // Só buscar carteiras se o usuário estiver logado no Comdinheiro
    let logado = false;
    usuarioLogadoComdinheiro.subscribe((value) => (logado = value))();
    if (!logado) return;

    loadingCarteiras = true;
    try {
      const response = await fetch("/api/carteiras?source=salesforce");
      const data = await response.json();

      if (data.success && data.carteiras_detalhadas) {
        carteirasSalesforce = data.carteiras_detalhadas;

        // Calcular agrupamento para a notificação
        const carteirasOriginais = carteirasSalesforce.length;
        const carteirasAgrupadas =
          agruparCarteirasPorUsuario(carteirasSalesforce).length;

        console.log(
          `✅ ${carteirasOriginais} carteiras carregadas e agrupadas em ${carteirasAgrupadas} usuários`
        );

        // Notificação com informação do agrupamento
        const mensagem =
          carteirasOriginais === carteirasAgrupadas
            ? `${carteirasAgrupadas} carteiras carregadas`
            : `${carteirasAgrupadas} usuários (${carteirasOriginais} carteiras agrupadas)`;

        // Só mostrar toast se o usuário estiver logado
        let logado = false;
        usuarioLogadoComdinheiro.subscribe((value) => (logado = value))();
        if (logado) {
          toast.success(mensagem, {
            duration: 4000,
            icon: SalesforceIcon,
          });
        }
      } else {
        throw new Error(data.error || "Erro ao buscar carteiras");
      }
    } catch (error) {
      console.error("❌ Erro ao buscar carteiras do Salesforce:", error);

      // Só mostrar toast de erro se o usuário estiver logado
      let logado = false;
      usuarioLogadoComdinheiro.subscribe((value) => (logado = value))();
      if (logado) {
        toast.error("Erro ao carregar carteiras do Salesforce");
      }
    } finally {
      loadingCarteiras = false;
    }
  }

  // Carregar carteiras quando componente for montado e usuário estiver logado
  onMount(() => {
    // Verificar se o usuário está logado antes de buscar carteiras
    const unsubscribe = usuarioLogadoComdinheiro.subscribe((logado) => {
      if (logado) {
        buscarCarteirasSalesforce();
      }
    });

    return unsubscribe;
  });

  // Opções de modo de visualização
  const modos = [
    // TEMPORARILY DISABLED - Uncomment to restore
    // {
    //   value: "relatorio",
    //   label: "Relatório",
    //   description: "Dados agrupados por instituição financeira",
    //   icon: FileText,
    // },
    {
      value: "consolidado",
      label: "Posição Consolidada",
      description: "Visão hierárquica por banco, categoria e tipo",
      icon: ChartBar,
    },
    // TEMPORARILY DISABLED - Uncomment to restore
    // {
    //   value: "movimentacoes",
    //   label: "Movimentações",
    //   description: "Histórico de transações e operações",
    //   icon: ArrowRightLeft,
    // },
    // TEMPORARILY DISABLED - Uncomment to restore
    // {
    //   value: "analise",
    //   label: "Análises",
    //   description: "Gráficos de performance e comparativos",
    //   icon: TrendingUp,
    // },
    {
      value: "asset_allocation",
      label: "Asset Allocation",
      description: "Distribuição e rebalanceamento de ativos",
      icon: Target,
    },
  ];

  // Função para submeter o formulário
  async function handleSubmit(event: Event) {
    event.preventDefault();
    if (!$formularioValido) return;

    // Verificar se o usuário está logado no Comdinheiro
    let logado = false;
    usuarioLogadoComdinheiro.subscribe((value) => (logado = value))();
    if (!logado) {
      toast.error(
        "É necessário fazer login no Comdinheiro para consultar dados"
      );
      abrirModalLogin();
      return;
    }

    try {
      await consultarDados();
    } catch (error) {
      console.error("Erro ao consultar dados:", error);
    }
  }
</script>

<form onsubmit={handleSubmit} class="space-y-8">
  <!-- Seleção do Modo de Visualização -->
  <div class="space-y-4">
    <RadioGroup bind:value={$modoVisualizacao} class="flex flex-wrap gap-4">
      {#each modos as modo}
        {@const Icon = modo.icon}
        <div class="relative">
          <RadioGroupItem
            value={modo.value}
            id={modo.value}
            class="peer sr-only"
          />
          <div class="relative">
            <Label
              for={modo.value}
              class="flex items-center justify-start p-4 h-12 w-fit rounded-lg border-transparent cursor-pointer hover:bg-accent transition-all duration-200 {$modoVisualizacao ===
              modo.value
                ? 'bg-accent/80 border-border'
                : $modoVisualizacao && $modoVisualizacao !== modo.value
                  ? 'opacity-40'
                  : ''}"
            >
              <Icon
                size={18}
                class="mr-3 flex-shrink-0 transition-colors duration-200 {$modoVisualizacao ===
                modo.value
                  ? 'text-primary'
                  : $modoVisualizacao && $modoVisualizacao !== modo.value
                    ? 'text-white/60'
                    : 'text-primary'}"
              />
              <span
                class="font-medium text-base text-left leading-tight whitespace-nowrap transition-colors duration-200 {$modoVisualizacao &&
                $modoVisualizacao !== modo.value
                  ? 'text-white/60'
                  : 'text-foreground'}"
              >
                {modo.label}
              </span>
              <!-- Tooltip trigger as separate element -->
              <Tooltip.Root>
                <Tooltip.Trigger
                  class="ml-2 p-1 rounded-full opacity-60 hover:opacity-100 transition-opacity"
                  aria-label="More information about {modo.label}"
                >
                  <div
                    class="w-4 h-4 rounded-full border border-current flex items-center justify-center text-sm"
                  >
                    ?
                  </div>
                </Tooltip.Trigger>
                <Tooltip.Content
                  side="top"
                  align="center"
                  sideOffset={8}
                  class="bg-accent text-accent-foreground font-medium text-sm w-fit"
                >
                  <div class="whitespace-nowrap">
                    {modo.description}
                  </div>
                </Tooltip.Content>
              </Tooltip.Root>
            </Label>
          </div>
        </div>
      {/each}
    </RadioGroup>
  </div>

  <!-- Linha com Seletor de Carteira e Data Final -->
  <div class="flex flex-col md:flex-row gap-6">
    <!-- Seletor de Carteira -->
    <div class="w-80 min-w-0">
      <SeletorCarteira
        carteirasExternas={carteirasSalesforce}
        usarCarteirasExternas={$modoVisualizacao === "consolidado"}
        disabled={!$usuarioLogadoComdinheiro}
      />
      {#if loadingCarteiras && $modoVisualizacao === "consolidado" && $usuarioLogadoComdinheiro}
        <p class="text-sm text-muted-foreground mt-2">
          Carregando carteiras do Salesforce...
        </p>
      {/if}
    </div>

    <!-- Data Final -->
    <div class="w-fit min-w-0">
      <SeletorData disabled={!$usuarioLogadoComdinheiro} />
    </div>
  </div>

  <!-- Botão de Consulta -->
  <div class="flex justify-start">
    <Button
      type="submit"
      disabled={!$formularioValido ||
        $loadingState ||
        !$usuarioLogadoComdinheiro}
      class="px-8 py-2 min-w-[200px] relative"
      variant={$dadosConsulta ? "secondary" : "default"}
    >
      {#if $loadingState}
        <div class="flex items-center gap-2">
          <div
            class="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent"
          ></div>
          Consultando...
        </div>
      {:else if $dadosConsulta}
        Atualizar Dados
      {:else}
        <div class="flex items-center gap-2">
          <Search class="h-4 w-4" />
          Consultar Dados
        </div>
      {/if}
    </Button>
  </div>

  <!-- Opções Condicionais -->
  {#if $camposVisiveis.banco || $camposVisiveis.operacao || $camposVisiveis.perfil}
    <div class="space-y-4">
      <Label class="text-label">Opções Adicionais</Label>
      <SeletorOpcoes />
    </div>
  {/if}
</form>

<!-- Overlay Global quando usuário não está logado -->
{#if !$usuarioLogadoComdinheiro}
  <div
    class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center"
  >
    <div
      class="bg-background p-8 rounded-lg shadow-xl border border-border max-w-md w-full mx-4"
    >
      <div class="text-center mb-6">
        <LogIn class="h-12 w-12 mx-auto text-primary mb-4" />
        <h3 class="text-lg font-semibold text-foreground mb-2">
          Login Necessário
        </h3>
        <p class="text-sm text-muted-foreground">
          Para acessar as funcionalidades de consulta, você precisa fazer login
          com suas credenciais do Comdinheiro.
        </p>
      </div>
      <div class="space-y-3">
        <Button onclick={abrirModalLogin} class="w-full">
          <LogIn class="h-4 w-4 mr-2" />
          Fazer Login no Comdinheiro
        </Button>
        <p class="text-xs text-center text-muted-foreground">
          Suas credenciais são salvas localmente de forma segura
        </p>
      </div>
    </div>
  </div>
{/if}

<!-- Modal de Login do Comdinheiro -->
<Dialog.Root bind:open={modalLoginAberto}>
  <Dialog.Content class="sm:max-w-lg">
    <Dialog.Header>
      <Dialog.Title class="flex items-center gap-2">
        <Database class="h-5 w-5 text-primary" />
        Login Comdinheiro
      </Dialog.Title>
      <Dialog.Description>
        Faça login com suas credenciais do Comdinheiro para acessar suas
        carteiras
      </Dialog.Description>
    </Dialog.Header>

    <div class="space-y-4">
      <!-- Formulário de credenciais -->
      {#if !loadingLogin}
        <form onsubmit={fazerLoginComdinheiro} class="space-y-4">
          <div class="grid grid-cols-1 gap-4">
            <div class="space-y-2">
              <Label for="modal-username">Usuário</Label>
              <Input
                id="modal-username"
                type="text"
                bind:value={credenciaisLogin.username}
                placeholder="Seu usuário do Comdinheiro"
                disabled={loadingLogin}
                autocomplete="username"
              />
            </div>
            <div class="space-y-2">
              <Label for="modal-password">Senha</Label>
              <Input
                id="modal-password"
                type="password"
                bind:value={credenciaisLogin.password}
                placeholder="Sua senha"
                disabled={loadingLogin}
                autocomplete="current-password"
              />
            </div>
          </div>
          <!-- Botão submit invisível para permitir Enter -->
          <button type="submit" class="sr-only" tabindex="-1" aria-hidden="true"
            >Submit</button
          >
        </form>
      {/if}

      <!-- Progresso do login -->
      {#if loadingLogin}
        <div class="space-y-3">
          <div class="flex items-center gap-2 mb-3">
            <Loader2 class="h-4 w-4 animate-spin text-primary" />
            <span class="text-sm font-medium">Processando login...</span>
          </div>

          <div class="w-full border border-border rounded-md">
            <button
              class="flex items-center justify-between w-full p-3 text-left hover:bg-muted/50 transition-colors"
              onclick={() => (mostrarProgresso = !mostrarProgresso)}
            >
              <span class="text-sm font-medium">Ver detalhes do progresso</span>
              {#if mostrarProgresso}
                <ChevronDown class="w-4 h-4" />
              {:else}
                <ChevronRight class="w-4 h-4" />
              {/if}
            </button>

            {#if mostrarProgresso}
              <div class="border-t border-border p-3">
                <div class="space-y-2">
                  {#each etapasLogin as etapa, index}
                    <div
                      class="flex items-center gap-3 p-2 rounded-md {etapa.status ===
                      'loading'
                        ? 'bg-primary/5 border border-primary/20'
                        : ''}"
                    >
                      <!-- Ícone de status -->
                      {#if etapa.status === "pending"}
                        <div
                          class="w-5 h-5 rounded-full border-2 border-muted-foreground/30"
                        ></div>
                      {:else if etapa.status === "loading"}
                        <Loader2 class="w-5 h-5 animate-spin text-primary" />
                      {:else if etapa.status === "success"}
                        <CheckCircle class="w-5 h-5 text-green-500" />
                      {:else if etapa.status === "error"}
                        <AlertCircle class="w-5 h-5 text-destructive" />
                      {/if}

                      <!-- Conteúdo -->
                      <div class="flex-1 min-w-0">
                        <div class="flex items-center gap-2">
                          <span
                            class="text-sm font-medium {etapa.status ===
                            'loading'
                              ? 'text-primary'
                              : etapa.status === 'error'
                                ? 'text-destructive'
                                : ''}"
                          >
                            {etapa.titulo}
                          </span>
                          {#if index <= etapaAtual}
                            <span
                              class="text-xs px-2 py-1 rounded-full {etapa.status ===
                              'success'
                                ? 'bg-green-100 text-green-700'
                                : etapa.status === 'error'
                                  ? 'bg-red-100 text-red-700'
                                  : etapa.status === 'loading'
                                    ? 'bg-primary/10 text-primary'
                                    : 'bg-muted text-muted-foreground'}"
                            >
                              {etapa.status === "success"
                                ? "Concluído"
                                : etapa.status === "error"
                                  ? "Erro"
                                  : etapa.status === "loading"
                                    ? "Processando..."
                                    : "Aguardando"}
                            </span>
                          {/if}
                        </div>
                        <p class="text-xs text-muted-foreground mt-1">
                          {etapa.descricao}
                        </p>
                        {#if etapa.erro}
                          <p class="text-xs text-destructive mt-1">
                            {etapa.erro}
                          </p>
                        {/if}
                      </div>
                    </div>
                  {/each}
                </div>
              </div>
            {/if}
          </div>
        </div>
      {/if}
    </div>
    <Dialog.Footer>
      {#if !loadingLogin}
        <Button variant="outline" onclick={() => (modalLoginAberto = false)}>
          Cancelar
        </Button>
        <Button
          onclick={fazerLoginComdinheiro}
          disabled={!credenciaisLogin.username || !credenciaisLogin.password}
        >
          <LogIn class="h-4 w-4 mr-2" />
          Fazer Login
        </Button>
      {:else}
        <Button
          variant="outline"
          onclick={() => {
            loadingLogin = false;
            modalLoginAberto = false;
            etapasLogin = etapasLogin.map((etapa) => ({
              ...etapa,
              status: "pending",
              erro: undefined,
            }));
            etapaAtual = -1;
          }}
          class="w-full"
        >
          Cancelar Login
        </Button>
      {/if}
    </Dialog.Footer>
  </Dialog.Content>
</Dialog.Root>

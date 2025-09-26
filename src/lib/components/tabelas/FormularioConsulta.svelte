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
    RefreshCw,
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

  function abrirModalLogin() {
    modalLoginAberto = true;
  }

  async function fazerLoginComdinheiro() {
    if (!credenciaisLogin.username || !credenciaisLogin.password) {
      toast.error("Preencha usuário e senha");
      return;
    }

    loadingLogin = true;
    try {
      const { buscarCarteirasComdinheiro } = await import(
        "$lib/stores/carteirasComdinheiro.js"
      );
      const resultado = await buscarCarteirasComdinheiro(
        credenciaisLogin,
        true
      );

      if (resultado.success) {
        toast.success(
          `Login realizado com sucesso! ${resultado.carteiras?.length || 0} carteiras encontradas`
        );
        modalLoginAberto = false;
        credenciaisLogin = { username: "", password: "" };
      } else {
        toast.error(resultado.error || "Erro ao fazer login");
      }
    } catch (error) {
      console.error("Erro no login:", error);
      toast.error("Erro ao conectar com o Comdinheiro");
    } finally {
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

        toast.success(mensagem, {
          duration: 4000,
          icon: SalesforceIcon,
        });
      } else {
        throw new Error(data.error || "Erro ao buscar carteiras");
      }
    } catch (error) {
      console.error("❌ Erro ao buscar carteiras do Salesforce:", error);
      toast.error("Erro ao carregar carteiras do Salesforce");
    } finally {
      loadingCarteiras = false;
    }
  }

  // Carregar carteiras quando componente for montado
  onMount(() => {
    buscarCarteirasSalesforce();
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
      {#if loadingCarteiras && $modoVisualizacao === "consolidado"}
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
      disabled={!$formularioValido || $loadingState}
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
  <Dialog.Content class="sm:max-w-md">
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
      <div class="grid grid-cols-1 gap-4">
        <div class="space-y-2">
          <Label for="modal-username">Usuário</Label>
          <Input
            id="modal-username"
            type="text"
            bind:value={credenciaisLogin.username}
            placeholder="seu.usuario@email.com"
            disabled={loadingLogin}
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
          />
        </div>
      </div>
    </div>
    <Dialog.Footer>
      <Button
        variant="outline"
        onclick={() => (modalLoginAberto = false)}
        disabled={loadingLogin}
      >
        Cancelar
      </Button>
      <Button
        onclick={fazerLoginComdinheiro}
        disabled={loadingLogin ||
          !credenciaisLogin.username ||
          !credenciaisLogin.password}
      >
        {#if loadingLogin}
          <RefreshCw class="h-4 w-4 animate-spin mr-2" />
        {/if}
        Fazer Login
      </Button>
    </Dialog.Footer>
  </Dialog.Content>
</Dialog.Root>

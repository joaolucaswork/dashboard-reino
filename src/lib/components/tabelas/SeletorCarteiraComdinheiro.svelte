<script lang="ts">
  import { onMount } from "svelte";
  import { carteiraAtual } from "$lib/stores/tabelas.js";
  import {
    buscarCarteirasComdinheiro,
    formatarNomeCarteira,
    type ComdinheiroCredentials,
  } from "$lib/stores/carteirasComdinheiro.js";
  import { toast } from "svelte-sonner";
  import { Button } from "$lib/components/ui/button";
  import { Input } from "$lib/components/ui/input";
  import { Label } from "$lib/components/ui/label";
  import { Badge } from "$lib/components/ui/badge";
  import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
  } from "$lib/components/ui/card";
  import { Database, RefreshCw, Search, User, Key } from "@lucide/svelte";

  // Estado do componente
  let loading = false;
  let carteiras: string[] = [];
  let carteirasFiltradas: string[] = [];
  let termoBusca = "";
  let showCredentials = false;

  // Credenciais do Comdinheiro
  let credentials: ComdinheiroCredentials = {
    username: "",
    password: "",
  };

  // Carregar credenciais do localStorage
  onMount(() => {
    const savedCredentials = localStorage.getItem("comdinheiro_credentials");
    if (savedCredentials) {
      try {
        credentials = JSON.parse(savedCredentials);
        if (credentials.username && credentials.password) {
          buscarCarteiras();
        }
      } catch (e) {
        console.error("Erro ao carregar credenciais:", e);
      }
    }
  });

  // Filtrar carteiras baseado no termo de busca
  $: {
    if (!termoBusca.trim()) {
      carteirasFiltradas = carteiras;
    } else {
      const termo = termoBusca.toLowerCase();
      carteirasFiltradas = carteiras.filter((carteira) =>
        carteira.toLowerCase().includes(termo)
      );
    }
  }

  // Salvar credenciais no localStorage
  function salvarCredenciais() {
    localStorage.setItem(
      "comdinheiro_credentials",
      JSON.stringify(credentials)
    );
  }

  // Buscar carteiras do Comdinheiro
  async function buscarCarteiras() {
    if (!credentials.username || !credentials.password) {
      toast.error("Configure suas credenciais do Comdinheiro primeiro");
      showCredentials = true;
      return;
    }

    try {
      loading = true;

      const params = new URLSearchParams({
        action: "carteiras",
        username: credentials.username,
        password: credentials.password,
      });

      const response = await fetch(`/api/comdinheiro?${params}`);
      const data = await response.json();

      if (data.success) {
        carteiras = data.carteiras || [];
        carteirasFiltradas = carteiras;

        // Salvar credenciais se a busca foi bem-sucedida
        salvarCredenciais();

        toast.success(
          `${carteiras.length} carteiras encontradas no Comdinheiro`
        );
        showCredentials = false;
      } else {
        throw new Error(data.error || "Erro ao buscar carteiras");
      }
    } catch (error) {
      console.error("Erro ao buscar carteiras:", error);
      toast.error(
        "Erro ao buscar carteiras: " +
          (error instanceof Error ? error.message : "Erro desconhecido")
      );
      showCredentials = true;
    } finally {
      loading = false;
    }
  }

  // Selecionar carteira
  function selecionarCarteira(carteira: string) {
    carteiraAtual.set(carteira);
    toast.success(`Carteira "${carteira}" selecionada`);
  }

  // Configurar credenciais
  async function configurarCredenciais() {
    if (!credentials.username || !credentials.password) {
      toast.error("Preencha usuário e senha");
      return;
    }

    await buscarCarteiras();
  }
</script>

<div class="space-y-4">
  <!-- Cabeçalho -->
  <div class="flex items-center justify-between">
    <div class="flex items-center gap-2">
      <Database size={16} class="text-primary" />
      <Label class="text-sm font-medium">Carteiras Comdinheiro</Label>
      {#if carteiras.length > 0}
        <Badge variant="secondary" class="text-xs">
          {carteiras.length} disponíveis
        </Badge>
      {/if}
    </div>

    <div class="flex items-center gap-2">
      <!-- Botão de configurar credenciais -->
      <Button
        variant="outline"
        size="sm"
        onclick={() => (showCredentials = !showCredentials)}
        class="h-8 px-2"
      >
        <Key size={14} class="mr-1" />
        Config
      </Button>

      <!-- Botão de atualizar -->
      <Button
        variant="outline"
        size="sm"
        onclick={buscarCarteiras}
        disabled={loading}
        class="h-8 w-8 p-0"
      >
        <RefreshCw class="h-4 w-4 {loading ? 'animate-spin' : ''}" />
      </Button>
    </div>
  </div>

  <!-- Configuração de Credenciais -->
  {#if showCredentials}
    <Card class="border-dashed">
      <CardHeader class="pb-3">
        <CardTitle class="text-sm flex items-center gap-2">
          <User size={16} />
          Credenciais Comdinheiro
        </CardTitle>
      </CardHeader>
      <CardContent class="space-y-3">
        <div class="grid grid-cols-2 gap-3">
          <div class="space-y-1">
            <Label for="username" class="text-xs">Usuário</Label>
            <Input
              id="username"
              type="text"
              bind:value={credentials.username}
              placeholder="seu.usuario@email.com"
              class="h-8 text-sm"
            />
          </div>
          <div class="space-y-1">
            <Label for="password" class="text-xs">Senha</Label>
            <Input
              id="password"
              type="password"
              bind:value={credentials.password}
              placeholder="Sua senha"
              class="h-8 text-sm"
            />
          </div>
        </div>

        <div class="flex gap-2">
          <Button
            size="sm"
            onclick={configurarCredenciais}
            disabled={loading}
            class="h-8"
          >
            {#if loading}
              <RefreshCw class="h-3 w-3 animate-spin mr-1" />
            {/if}
            Buscar Carteiras
          </Button>
          <Button
            variant="outline"
            size="sm"
            onclick={() => (showCredentials = false)}
            class="h-8"
          >
            Cancelar
          </Button>
        </div>
      </CardContent>
    </Card>
  {/if}

  <!-- Busca de Carteiras -->
  {#if carteiras.length > 0}
    <div class="space-y-2">
      <div class="relative">
        <Search class="absolute left-2 top-2 h-4 w-4 text-muted-foreground" />
        <Input
          bind:value={termoBusca}
          placeholder="Buscar carteira..."
          class="pl-8 h-8 text-sm"
        />
      </div>

      <!-- Lista de Carteiras -->
      <div class="max-h-48 overflow-y-auto border rounded-md">
        {#if carteirasFiltradas.length > 0}
          {#each carteirasFiltradas as carteira}
            <button
              class="w-full text-left px-3 py-2 text-sm hover:bg-muted border-b border-border last:border-b-0 transition-colors
                     {$carteiraAtual === carteira
                ? 'bg-primary/10 text-primary font-medium'
                : 'text-foreground'}"
              onclick={() => selecionarCarteira(carteira)}
            >
              <div class="flex items-center justify-between">
                <span>{formatarNomeCarteira(carteira)}</span>
                {#if $carteiraAtual === carteira}
                  <Badge variant="default" class="text-xs">Selecionada</Badge>
                {/if}
              </div>
              <div class="text-xs text-muted-foreground mt-1">
                {carteira}
              </div>
            </button>
          {/each}
        {:else}
          <div class="p-4 text-center text-sm text-muted-foreground">
            Nenhuma carteira encontrada para "{termoBusca}"
          </div>
        {/if}
      </div>

      <!-- Carteira Selecionada -->
      {#if $carteiraAtual}
        <div class="p-3 bg-muted/50 rounded-md border">
          <div class="text-xs text-muted-foreground mb-1">
            Carteira Selecionada:
          </div>
          <div class="text-sm font-medium">
            {formatarNomeCarteira($carteiraAtual)}
          </div>
          <div class="text-xs text-muted-foreground">{$carteiraAtual}</div>
        </div>
      {/if}
    </div>
  {:else if !loading && !showCredentials}
    <div class="text-center py-6 text-sm text-muted-foreground">
      <Database size={32} class="mx-auto mb-2 opacity-50" />
      <p>Configure suas credenciais para buscar carteiras</p>
      <Button
        variant="outline"
        size="sm"
        onclick={() => (showCredentials = true)}
        class="mt-2"
      >
        <Key size={14} class="mr-1" />
        Configurar Credenciais
      </Button>
    </div>
  {/if}

  <!-- Loading State -->
  {#if loading}
    <div class="text-center py-4 text-sm text-muted-foreground">
      <RefreshCw class="h-6 w-6 animate-spin mx-auto mb-2" />
      Buscando carteiras no Comdinheiro...
    </div>
  {/if}
</div>

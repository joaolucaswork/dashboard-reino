<script lang="ts">
  import { onMount } from "svelte";
  import { toast } from "svelte-sonner";
  import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
  } from "$lib/components/ui/card";
  import { Button } from "$lib/components/ui/button";
  import { Input } from "$lib/components/ui/input";
  import { Label } from "$lib/components/ui/label";
  import { Badge } from "$lib/components/ui/badge";
  import { Database, Code, CheckCircle } from "@lucide/svelte";
  import ComdinheiroDataTable from "./ComdinheiroDataTable.svelte";

  // Estado da aplicação
  let loading = false;
  let ferramentas: string[] = [];

  // Formulário de credenciais
  let credentials = {
    username: "",
    password: "",
  };

  // Formulário de consulta
  let consulta = {
    ferramenta: "",
    url: "",
    formato: "JSON3" as "JSON" | "JSON2" | "JSON3" | "XML" | "XML2",
    linguagem: "JavaScript" as "JavaScript" | "Python" | "PHP",
  };

  // Resultados
  let ultimoResultado: any = null;
  let codigoGerado = "";

  // Formatos e linguagens disponíveis
  const formatosDisponiveis = ["JSON", "JSON2", "JSON3", "XML", "XML2"];
  const linguagensDisponiveis = ["JavaScript", "Python", "PHP"];

  // Carregar ferramentas ao inicializar
  onMount(async () => {
    await carregarFerramentas();
  });

  async function carregarFerramentas() {
    try {
      const response = await fetch("/api/comdinheiro?action=ferramentas");
      const data = await response.json();
      if (data.success) {
        ferramentas = data.ferramentas;
      }
    } catch (error) {
      console.error("Erro ao carregar ferramentas:", error);
      toast.error("Erro ao carregar ferramentas disponíveis");
    }
  }

  async function executarConsulta() {
    if (!credentials.username || !credentials.password || !consulta.url) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    try {
      loading = true;
      const response = await fetch("/api/comdinheiro", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: credentials.username,
          password: credentials.password,
          url: consulta.url,
          format: consulta.formato,
        }),
      });

      const data = await response.json();

      if (data.success) {
        ultimoResultado = data.data;
        toast.success("Consulta executada com sucesso!");
      } else {
        throw new Error(data.error || "Erro na consulta");
      }
    } catch (error) {
      console.error("Erro na consulta:", error);
      toast.error(
        "Erro na consulta: " +
          (error instanceof Error ? error.message : "Erro desconhecido")
      );
    } finally {
      loading = false;
    }
  }

  function gerarCodigo() {
    if (!credentials.username || !consulta.url) {
      toast.error("Preencha usuário e URL para gerar código");
      return;
    }

    const endpoint =
      "https://www.comdinheiro.com.br/Clientes/API/EndPoint001.php?code=import_data";

    switch (consulta.linguagem) {
      case "JavaScript":
        codigoGerado = `// Código gerado para consulta Comdinheiro
const response = await fetch('${endpoint}', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded'
  },
  body: new URLSearchParams({
    username: '${credentials.username}',
    password: '${credentials.password}',
    URL: '${consulta.url}',
    format: '${consulta.formato}'
  })
});

const data = await response.text();
console.log(data);`;
        break;

      case "Python":
        codigoGerado = `# Código gerado para consulta Comdinheiro
import requests

url = '${endpoint}'
data = {
    'username': '${credentials.username}',
    'password': '${credentials.password}',
    'URL': '${consulta.url}',
    'format': '${consulta.formato}'
}

response = requests.post(url, data=data)
print(response.text)`;
        break;

      case "PHP":
        codigoGerado = `<?php
// Código gerado para consulta Comdinheiro
$url = '${endpoint}';
$data = array(
    'username' => '${credentials.username}',
    'password' => '${credentials.password}',
    'URL' => '${consulta.url}',
    'format' => '${consulta.formato}'
);

$options = array(
    'http' => array(
        'header'  => "Content-type: application/x-www-form-urlencoded\\r\\n",
        'method'  => 'POST',
        'content' => http_build_query($data)
    )
);

$context  = stream_context_create($options);
$result = file_get_contents($url, false, $context);
echo $result;
?>`;
        break;
    }

    toast.success("Código gerado com sucesso!");
  }

  function copiarCodigo() {
    navigator.clipboard.writeText(codigoGerado);
    toast.success("Código copiado para a área de transferência!");
  }

  function selecionarFerramenta(ferramenta: string) {
    consulta.ferramenta = ferramenta;

    // Exemplos de URL baseados na ferramenta
    const exemplos: Record<string, string> = {
      HistoricoCotacao002:
        "HistoricoCotacao002.php?x=NTNB_15082004_15052024+CDI&data_ini=13032024&data_fim=14032024",
      RelatorioGerencialCarteiras001:
        "RelatorioGerencialCarteiras001.php?data_analise=14032024&nome_portfolio=CARTEIRA_TESTE",
      FundScreener001: "FundScreener001.php?categoria=RF&rentabilidade_min=5",
    };

    if (exemplos[ferramenta]) {
      consulta.url = exemplos[ferramenta];
    }
  }
</script>

<div class="space-y-6">
  <!-- Status -->
  <Card>
    <CardHeader>
      <CardTitle class="flex items-center gap-2">
        <CheckCircle size={20} class="text-green-500" />
        API Comdinheiro - SvelteKit Nativa
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div class="flex items-center gap-2">
        <Badge variant="default" class="bg-green-100 text-green-800">
          <Database size={14} class="mr-1" />
          Implementação Nativa
        </Badge>
        <Badge variant="secondary">
          {ferramentas.length} Ferramentas
        </Badge>
      </div>
    </CardContent>
  </Card>

  <!-- Configuração -->
  <Card>
    <CardHeader>
      <CardTitle class="flex items-center gap-2">
        <Database size={20} />
        Configuração da Consulta
      </CardTitle>
    </CardHeader>
    <CardContent class="space-y-4">
      <!-- Credenciais -->
      <div class="grid grid-cols-2 gap-4">
        <div class="space-y-2">
          <Label for="username">Usuário Comdinheiro</Label>
          <Input
            id="username"
            type="text"
            bind:value={credentials.username}
            placeholder="seu.usuario@email.com"
          />
        </div>
        <div class="space-y-2">
          <Label for="password">Senha</Label>
          <Input
            id="password"
            type="password"
            bind:value={credentials.password}
            placeholder="Sua senha"
          />
        </div>
      </div>

      <!-- Ferramentas Disponíveis -->
      <div class="space-y-2">
        <Label>Ferramentas Disponíveis ({ferramentas.length})</Label>
        <div class="flex flex-wrap gap-2">
          {#each ferramentas as ferramenta}
            <Button
              variant={consulta.ferramenta === ferramenta
                ? "default"
                : "outline"}
              size="sm"
              onclick={() => selecionarFerramenta(ferramenta)}
            >
              {ferramenta}
            </Button>
          {/each}
        </div>
      </div>

      <!-- URL da Consulta -->
      <div class="space-y-2">
        <Label for="url">URL da Consulta</Label>
        <textarea
          id="url"
          bind:value={consulta.url}
          placeholder="HistoricoCotacao002.php?x=NTNB_15082004_15052024+CDI&data_ini=13032024&data_fim=14032024"
          rows="3"
          class="w-full p-2 border border-border rounded-md bg-background text-foreground"
        ></textarea>
      </div>

      <!-- Formato -->
      <div class="space-y-2">
        <Label>Formato de Retorno</Label>
        <select
          bind:value={consulta.formato}
          class="w-full p-2 border border-border rounded-md bg-background text-foreground"
        >
          {#each formatosDisponiveis as formato}
            <option value={formato}>{formato}</option>
          {/each}
        </select>
      </div>

      <!-- Executar Consulta -->
      <Button onclick={executarConsulta} disabled={loading} class="w-full">
        {#if loading}
          <div
            class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"
          ></div>
        {/if}
        Executar Consulta
      </Button>
    </CardContent>
  </Card>

  <!-- Gerador de Código -->
  <Card>
    <CardHeader>
      <CardTitle class="flex items-center gap-2">
        <Code size={20} />
        Gerador de Código
      </CardTitle>
    </CardHeader>
    <CardContent class="space-y-4">
      <div class="space-y-2">
        <Label>Linguagem</Label>
        <select
          bind:value={consulta.linguagem}
          class="w-full p-2 border border-border rounded-md bg-background text-foreground"
        >
          {#each linguagensDisponiveis as linguagem}
            <option value={linguagem}>{linguagem}</option>
          {/each}
        </select>
      </div>

      <div class="flex gap-2">
        <Button onclick={gerarCodigo}>Gerar Código</Button>
        {#if codigoGerado}
          <Button variant="outline" onclick={copiarCodigo}>Copiar</Button>
        {/if}
      </div>

      {#if codigoGerado}
        <div class="space-y-2">
          <Label>Código Gerado</Label>
          <textarea
            value={codigoGerado}
            readonly
            rows="15"
            class="w-full p-2 border border-border rounded-md bg-background text-foreground font-mono text-sm"
          ></textarea>
        </div>
      {/if}
    </CardContent>
  </Card>

  <!-- Visualização de Dados -->
  <ComdinheiroDataTable
    data={ultimoResultado}
    format={consulta.formato}
    title="Dados da Consulta Comdinheiro"
  />
</div>

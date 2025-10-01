<script lang="ts">
  import { Card, CardContent, CardHeader, CardTitle } from "$lib/components/ui/card";
  import { Button } from "$lib/components/ui/button";
  import { Label } from "$lib/components/ui/label";
  import { Input } from "$lib/components/ui/input";
  import { Search, Calendar } from "lucide-svelte";
  
  // Estado dos filtros
  let dataInicio = '2025-09-01';
  let dataFim = '2025-10-01';
  let agente = '';
  let telefone = '';
  let carregando = false;
  let erro = '';
  
  // Estado dos dados
  let dadosConsulta: any = null;
  
  // Métricas calculadas reativas
  $: metricas = calcularMetricas(dadosConsulta?.calls || []);
  $: resumoPorAgente = calcularResumoPorAgente(dadosConsulta?.calls || []);

  // Função para buscar ligações na API Callix
  async function buscarLigacoes() {
    console.log('🔍 Iniciando busca de ligações...');
    
    // Validação básica
    if (!dataInicio || !dataFim) {
      erro = 'Por favor, selecione as datas de início e fim';
      return;
    }

    if (new Date(dataInicio) > new Date(dataFim)) {
      erro = 'Data de início deve ser anterior à data de fim';
      return;
    }

    carregando = true;
    erro = '';
    
    try {
      // Construir parâmetros da URL
      const params = new URLSearchParams({
        dataInicio: dataInicio,
        dataFim: dataFim
      });

      // Adicionar filtros opcionais
      if (agente.trim()) {
        params.append('agente', agente.trim());
      }
      if (telefone.trim()) {
        params.append('telefone', telefone.trim());
      }

      const url = `/api/callix/ligacoes?${params}`;
      console.log('📡 Consultando:', url);

      // Fazer requisição à API
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      console.log('📊 Status da resposta:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Erro na resposta da API' }));
        throw new Error(errorData.error || `Erro HTTP ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Dados recebidos:', data);

      // Armazenar dados para exibição das métricas
      if (data && data.calls) {
        dadosConsulta = data;
        console.log(`📊 ${data.calls.length} ligações processadas`);
      } else {
        dadosConsulta = { calls: [], total: 0 };
        console.log('⚠️ Nenhuma ligação encontrada');
      }

    } catch (err: any) {
      console.error('❌ Erro na busca:', err);
      erro = err.message || 'Erro inesperado ao buscar ligações';
    } finally {
      carregando = false;
    }
  }

  // Função para limpar filtros
  function limparFiltros() {
    dataInicio = '2025-09-01';
    dataFim = '2025-10-01';
    agente = '';
    telefone = '';
    erro = '';
    dadosConsulta = null;
    console.log('🧹 Filtros limpos');
  }
  
  // Calcular métricas principais
  function calcularMetricas(calls: any[]) {
    if (!calls || calls.length === 0) {
      return {
        total_ligacoes: 0,
        ligacoes_atendidas: 0,
        taxa_atendimento: 0,
        duracao_media: 0,
        duracao_total: 0
      };
    }

    const total = calls.length;
    // Considerar atendida se a qualificação NÃO for "Não atendeu"
    const atendidas = calls.filter(call => {
      const qualificacao = call.qualification_name || '';
      return qualificacao.toLowerCase() !== 'não atendeu';
    }).length;
    
    const taxa = total > 0 ? ((atendidas / total) * 100) : 0;
    const duracaoTotal = calls.reduce((sum, call) => sum + (call.duration || 0), 0);
    const duracaoMedia = atendidas > 0 ? Math.round(duracaoTotal / atendidas) : 0;

    return {
      total_ligacoes: total,
      ligacoes_atendidas: atendidas,
      taxa_atendimento: parseFloat(taxa.toFixed(1)),
      duracao_media: duracaoMedia,
      duracao_total: duracaoTotal
    };
  }

  // Calcular resumo por agente
  function calcularResumoPorAgente(calls: any[]) {
    if (!calls || calls.length === 0) return [];

    const agenteMap = new Map();

    calls.forEach(call => {
      const agenteName = call.agent_name || 'Agente Desconhecido';
      
      if (!agenteMap.has(agenteName)) {
        agenteMap.set(agenteName, {
          nome: agenteName,
          total: 0,
          atendidas: 0,
          tempo_total: 0
        });
      }

      const agente = agenteMap.get(agenteName);
      agente.total++;
      
      // Considerar atendida se a qualificação NÃO for "Não atendeu"
      const qualificacao = call.qualification_name || '';
      const foiAtendida = qualificacao.toLowerCase() !== 'não atendeu';
      
      if (foiAtendida) {
        agente.atendidas++;
        agente.tempo_total += call.duration || 0;
      }
    });

    return Array.from(agenteMap.values()).map(agente => ({
      ...agente,
      taxa: agente.total > 0 ? parseFloat(((agente.atendidas / agente.total) * 100).toFixed(1)) : 0
    })).sort((a, b) => b.total - a.total);
  }

  // Formatar tempo em minutos:segundos
  function formatarTempo(segundos: number): string {
    const mins = Math.floor(segundos / 60);
    const secs = segundos % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }
</script>

<svelte:head>
  <title>Relatório de Ligações - API Callix</title>
  <meta name="description" content="Relatório de ligações integrado com API Callix" />
</svelte:head>

<div class="container mx-auto p-6 max-w-7xl">
  <!-- Cabeçalho -->
  <div class="mb-8 bg-white p-6 rounded-lg shadow-sm border">
    <h1 class="text-3xl font-bold text-gray-900 mb-2">📞 Relatório de Ligações</h1>
    <p class="text-gray-600">Consulta de ligações através da API Callix</p>
  </div>

  <!-- Formulário de Filtros -->
  <Card class="mb-6">
    <CardHeader>
      <CardTitle class="flex items-center gap-2">
        <Search class="h-5 w-5" />
        Filtros de Consulta
      </CardTitle>
    </CardHeader>
    <CardContent>
      <form on:submit|preventDefault={buscarLigacoes}>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <!-- Data Início -->
          <div class="space-y-2">
            <Label for="data-inicio" class="flex items-center gap-1">
              <Calendar class="h-4 w-4" />
              Data Início *
            </Label>
            <Input 
              id="data-inicio"
              type="date" 
              bind:value={dataInicio}
              required
              class="w-full"
            />
          </div>
          
          <!-- Data Fim -->
          <div class="space-y-2">
            <Label for="data-fim" class="flex items-center gap-1">
              <Calendar class="h-4 w-4" />
              Data Fim *
            </Label>
            <Input 
              id="data-fim"
              type="date" 
              bind:value={dataFim}
              required
              class="w-full"
            />
          </div>
          
          <!-- Agente -->
          <div class="space-y-2">
            <Label for="agente">Agente (opcional)</Label>
            <Input 
              id="agente"
              type="text" 
              bind:value={agente}
              placeholder="Nome do agente"
              class="w-full"
            />
          </div>
          
          <!-- Telefone -->
          <div class="space-y-2">
            <Label for="telefone">Telefone (opcional)</Label>
            <Input 
              id="telefone"
              type="text" 
              bind:value={telefone}
              placeholder="Número do telefone"
              class="w-full"
            />
          </div>
        </div>
        
        <!-- Botões de Ação -->
        <div class="flex gap-3 justify-start">
          <Button 
            type="submit"
            disabled={carregando}
            class="flex items-center gap-2"
          >
            {#if carregando}
              <div class="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
              Buscando...
            {:else}
              <Search class="h-4 w-4" />
              Buscar Ligações
            {/if}
          </Button>
          
          <Button 
            type="button"
            variant="outline"
            on:click={limparFiltros}
            disabled={carregando}
            class="flex items-center gap-2"
          >
            <span class="h-4 w-4">🗑️</span>
            Limpar Filtros
          </Button>
        </div>
      </form>
    </CardContent>
  </Card>

  <!-- Mensagem de Erro -->
  {#if erro}
    <Card class="mb-6 border-red-200 bg-red-50">
      <CardContent class="p-4">
        <div class="flex items-center gap-3">
          <span class="text-red-500">❌</span>
          <div>
            <h3 class="font-semibold text-red-800">Erro na Consulta</h3>
            <p class="text-red-600 text-sm">{erro}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  {/if}

  <!-- Estado Inicial - Aguardando Consulta -->
  {#if !carregando && !erro && !dadosConsulta}
    <Card>
      <CardContent class="py-16 text-center">
        <div class="max-w-md mx-auto">
          <div class="w-20 h-20 mx-auto mb-6 bg-blue-100 rounded-full flex items-center justify-center">
            <Search class="h-10 w-10 text-blue-600" />
          </div>
          <h3 class="text-xl font-semibold text-gray-900 mb-3">Pronto para consultar</h3>
          <p class="text-gray-600 text-sm mb-6">
            Configure os filtros acima e clique em "Buscar Ligações" para consultar a API Callix
          </p>
          <div class="text-xs text-gray-500">
            💡 Selecione qualquer período desejado para consulta
          </div>
        </div>
      </CardContent>
    </Card>
  {/if}

  <!-- Métricas Principais -->
  {#if dadosConsulta}
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
      <Card>
        <CardContent class="p-4">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-muted-foreground">Total de Ligações</p>
              <p class="text-2xl font-bold text-blue-600">{metricas.total_ligacoes}</p>
            </div>
            <span class="text-xl">📞</span>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent class="p-4">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-muted-foreground">Ligações Atendidas</p>
              <p class="text-2xl font-bold text-green-600">{metricas.ligacoes_atendidas}</p>
            </div>
            <span class="text-xl">✅</span>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent class="p-4">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-muted-foreground">Taxa de Atendimento</p>
              <p class="text-2xl font-bold text-purple-600">{metricas.taxa_atendimento}%</p>
            </div>
            <span class="text-xl">📊</span>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent class="p-4">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-muted-foreground">Duração Média</p>
              <p class="text-2xl font-bold text-orange-600">{formatarTempo(metricas.duracao_media)}</p>
            </div>
            <span class="text-xl">⏱️</span>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent class="p-4">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-muted-foreground">Duração Total</p>
              <p class="text-2xl font-bold text-indigo-600">{formatarTempo(metricas.duracao_total)}</p>
            </div>
            <span class="text-xl">⏰</span>
          </div>
        </CardContent>
      </Card>
    </div>
  {/if}

  <!-- Resumo por Agente -->
  {#if dadosConsulta?.calls?.length > 0}
    <Card>
      <CardHeader>
        <CardTitle class="flex items-center gap-2">
          <span class="text-lg">👥</span>
          Resumo por Agente ({resumoPorAgente.length} agentes)
        </CardTitle>
        <p class="text-sm text-muted-foreground">
          📅 Período: {dataInicio} até {dataFim}
        </p>
      </CardHeader>
      <CardContent>
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="border-b">
                <th class="text-left py-3 px-4 font-semibold">Agente</th>
                <th class="text-center py-3 px-4 font-semibold">Total</th>
                <th class="text-center py-3 px-4 font-semibold">Atendidas</th>
                <th class="text-center py-3 px-4 font-semibold">Taxa</th>
                <th class="text-center py-3 px-4 font-semibold">Duração</th>
              </tr>
            </thead>
            <tbody>
              {#each resumoPorAgente as agente, index}
                <tr class="border-b hover:bg-gray-50 transition-colors">
                  <td class="py-3 px-4 font-medium">{agente.nome}</td>
                  <td class="py-3 px-4 text-center">{agente.total}</td>
                  <td class="py-3 px-4 text-center text-green-600 font-medium">{agente.atendidas}</td>
                  <td class="py-3 px-4 text-center">
                    <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium
                      {agente.taxa >= 80 ? 'bg-green-100 text-green-800' : 
                       agente.taxa >= 60 ? 'bg-yellow-100 text-yellow-800' : 
                       'bg-red-100 text-red-800'}">
                      {agente.taxa}%
                    </span>
                  </td>
                  <td class="py-3 px-4 text-center font-mono text-sm">{formatarTempo(agente.tempo_total)}</td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  {:else if dadosConsulta && dadosConsulta.calls?.length === 0}
    <!-- Estado Vazio -->
    <Card>
      <CardContent class="py-12 text-center">
        <div class="max-w-md mx-auto">
          <div class="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <span class="text-2xl">📝</span>
          </div>
          <h3 class="text-lg font-semibold text-gray-900 mb-2">Nenhuma ligação encontrada</h3>
          <p class="text-gray-600 text-sm mb-4">
            Não foram encontradas ligações para o período e filtros selecionados.
          </p>
          <p class="text-xs text-gray-500">
            💡 Dica: Tente ajustar as datas ou remover filtros opcionais
          </p>
        </div>
      </CardContent>
    </Card>
  {/if}
</div>
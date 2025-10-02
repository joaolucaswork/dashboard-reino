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
  $: resumoTipos = calcularResumoTipos(dadosConsulta?.calls || []);

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
        console.error('❌ Detalhes do erro:', errorData);
        
        let errorMsg = errorData.error || `Erro HTTP ${response.status}`;
        
        // Se há detalhes adicionais, incluir na mensagem
        if (errorData.details) {
          errorMsg += `\n\nDetalhes: ${errorData.details}`;
        }
        
        // Se há sugestão, incluir
        if (errorData.suggestion) {
          errorMsg += `\n\nSugestão: ${errorData.suggestion}`;
        }
        
        throw new Error(errorMsg);
      }

      const data = await response.json();
      console.log('✅ Dados recebidos:', data);

      // Armazenar dados para exibição das métricas
      if (data && data.calls) {
        dadosConsulta = data;
        console.log(`📊 ${data.calls.length} ligações processadas`);
        console.log(`📈 Resumo: ${data.meta?.outgoing || 0} outgoing + ${data.meta?.campaign || 0} campanhas`);
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
        reunioes_marcadas: 0,
        taxa_reunioes: 0,
        duracao_media: 0,
        duracao_total: 0
      };
    }

    const total = calls.length;
    // Nova lógica: apenas qualificação "Interessado" (ID 7) conta como reunião marcada
    const reunioesMarcadas = calls.filter(call => call.qualification_id === '7').length;
    
    const taxa = total > 0 ? ((reunioesMarcadas / total) * 100) : 0;
    
    // Somar service_duration (em segundos) de todas as ligações atendidas (não "Não Atendeu")
    const ligacoesAtendidas = calls.filter(call => {
      const qualificacao = call.qualification_name || '';
      return qualificacao.toLowerCase() !== 'não atendeu';
    });
    
    const duracaoTotalSegundos = ligacoesAtendidas
      .reduce((sum, call) => sum + (call.service_duration || 0), 0);
    
    // Calcular média em segundos das ligações atendidas
    const duracaoMediaSegundos = ligacoesAtendidas.length > 0 ? Math.round(duracaoTotalSegundos / ligacoesAtendidas.length) : 0;

    // Calcular métricas específicas das qualificações 8, 9 e 10
    const naoEscutou25s = calls.filter(call => call.qualification_id === '8').length;
    const parouEscutar1min = calls.filter(call => call.qualification_id === '9').length;
    const naoEvoluiu1minMais = calls.filter(call => call.qualification_id === '10').length;

    return {
      total_ligacoes: total,
      reunioes_marcadas: reunioesMarcadas,
      taxa_reunioes: parseFloat(taxa.toFixed(1)),
      duracao_media: duracaoMediaSegundos,
      duracao_total: duracaoTotalSegundos,
      nao_escutou_25s: naoEscutou25s,
      parou_escutar_1min: parouEscutar1min,
      nao_evoluiu_1min_mais: naoEvoluiu1minMais
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
          reunioes_marcadas: 0,
          atendidas: 0,
          tempo_total: 0,
          outgoing: 0,
          campaign: 0,
          nao_escutou_25s: 0,
          parou_escutar_1min: 0,
          nao_evoluiu_1min_mais: 0
        });
      }

      const agente = agenteMap.get(agenteName);
      agente.total++;
      
      // Contar por tipo de ligação
      if (call.call_type === 'outgoing') {
        agente.outgoing++;
      } else if (call.call_type === 'campaign') {
        agente.campaign++;
      }
      
      // Contar qualificações específicas
      if (call.qualification_id === '8') {
        agente.nao_escutou_25s++;
      } else if (call.qualification_id === '9') {
        agente.parou_escutar_1min++;
      } else if (call.qualification_id === '10') {
        agente.nao_evoluiu_1min_mais++;
      }
      
      // Contar reuniões marcadas (qualificação ID 7)
      if (call.qualification_id === '7') {
        agente.reunioes_marcadas++;
      }
      
      // Contar ligações atendidas (não "Não Atendeu") para duração média
      const qualificacao = call.qualification_name || '';
      if (qualificacao.toLowerCase() !== 'não atendeu') {
        agente.atendidas++;
        agente.tempo_total += call.service_duration || 0; // Somar em segundos
      }
    });

    return Array.from(agenteMap.values()).map(agente => ({
      ...agente,
      taxa: agente.total > 0 ? parseFloat(((agente.reunioes_marcadas / agente.total) * 100).toFixed(1)) : 0,
      duracao_media: agente.atendidas > 0 ? Math.round(agente.tempo_total / agente.atendidas) : 0
    })).sort((a, b) => b.total - a.total);
  }

  // Calcular resumo por tipo de ligação
  function calcularResumoTipos(calls: any[]) {
    if (!calls || calls.length === 0) return { outgoing: 0, campaign: 0 };
    
    const outgoing = calls.filter(call => call.call_type === 'outgoing').length;
    const campaign = calls.filter(call => call.call_type === 'campaign').length;
    
    return { outgoing, campaign };
  }

  // Formatar tempo em minutos:segundos (recebe segundos)
  function formatarTempo(segundos: number): string {
    if (segundos === 0) return '0:00';
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
        <div class="flex items-start gap-3">
          <span class="text-red-500 text-xl mt-1">❌</span>
          <div class="flex-1">
            <h3 class="font-semibold text-red-800 mb-2">Erro na Consulta</h3>
            <div class="text-red-600 text-sm whitespace-pre-line leading-relaxed">{erro}</div>
            
            <!-- Informações adicionais se for erro de ID não encontrado -->
            {#if erro.includes('Cannot read properties of undefined') || erro.includes('IDs não mapeados')}
              <div class="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded">
                <p class="text-yellow-800 text-sm font-medium">💡 Possível causa:</p>
                <p class="text-yellow-700 text-xs mt-1">
                  Novos agentes ou qualificações foram adicionados na API Callix que ainda não estão mapeados no sistema.
                  Os IDs que causaram erro devem aparecer no console do navegador (F12).
                </p>
              </div>
            {/if}
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
              <p class="text-sm text-muted-foreground">Reuniões Marcadas</p>
              <p class="text-2xl font-bold text-green-600">{metricas.reunioes_marcadas}</p>
            </div>
            <span class="text-xl">✅</span>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent class="p-4">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-muted-foreground">Taxa de Reuniões</p>
              <p class="text-2xl font-bold text-purple-600">{metricas.taxa_reunioes}%</p>
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

    <!-- Métricas de Origem -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
      <Card>
        <CardContent class="p-4">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-muted-foreground">Outgoing</p>
              <p class="text-2xl font-bold text-cyan-600">{resumoTipos.outgoing}</p>
            </div>
            <span class="text-xl">📲</span>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent class="p-4">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-muted-foreground">Campanhas</p>
              <p class="text-2xl font-bold text-pink-600">{resumoTipos.campaign}</p>
            </div>
            <span class="text-xl">📢</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent class="p-4">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-muted-foreground">Não Escutou(25s)</p>
              <p class="text-2xl font-bold text-yellow-600">{metricas.nao_escutou_25s}</p>
            </div>
            <span class="text-xl">👂</span>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent class="p-4">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-muted-foreground">Parou Escutar(&lt;1min)</p>
              <p class="text-2xl font-bold text-blue-500">{metricas.parou_escutar_1min}</p>
            </div>
            <span class="text-xl">⏱️</span>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent class="p-4">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-muted-foreground">Não Evoluiu(1min+)</p>
              <p class="text-2xl font-bold text-amber-600">{metricas.nao_evoluiu_1min_mais}</p>
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
                <th class="text-center py-3 px-4 font-semibold">Reuniões</th>
                <th class="text-center py-3 px-4 font-semibold">Taxa</th>
                <th class="text-center py-3 px-4 font-semibold">Duração Média</th>
                <th class="text-center py-3 px-4 font-semibold">Outgoing</th>
                <th class="text-center py-3 px-4 font-semibold">Campanhas</th>
                <th class="text-center py-3 px-4 font-semibold">Não Escutou</th>
                <th class="text-center py-3 px-4 font-semibold">Parou Escutar</th>
                <th class="text-center py-3 px-4 font-semibold">Não Evoluiu</th>
              </tr>
            </thead>
            <tbody>
              {#each resumoPorAgente as agente, index}
                <tr class="border-b hover:bg-gray-50 transition-colors">
                  <td class="py-3 px-4 font-medium">{agente.nome}</td>
                  <td class="py-3 px-4 text-center">{agente.total}</td>
                  <td class="py-3 px-4 text-center text-green-600 font-medium">{agente.reunioes_marcadas}</td>
                  <td class="py-3 px-4 text-center">
                    <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium
                      {agente.taxa >= 80 ? 'bg-green-100 text-green-800' : 
                       agente.taxa >= 60 ? 'bg-yellow-100 text-yellow-800' : 
                       'bg-red-100 text-red-800'}">
                      {agente.taxa}%
                    </span>
                  </td>
                  <td class="py-3 px-4 text-center font-mono text-sm">{formatarTempo(agente.duracao_media)}</td>
                  <td class="py-3 px-4 text-center">
                    <span class="inline-flex items-center px-2 py-1 bg-cyan-100 text-cyan-800 rounded text-xs font-medium">
                      {agente.outgoing}
                    </span>
                  </td>
                  <td class="py-3 px-4 text-center">
                    <span class="inline-flex items-center px-2 py-1 bg-pink-100 text-pink-800 rounded text-xs font-medium">
                      {agente.campaign}
                    </span>
                  </td>
                  <td class="py-3 px-4 text-center">
                    <span class="inline-flex items-center px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs font-medium">
                      {agente.nao_escutou_25s}
                    </span>
                  </td>
                  <td class="py-3 px-4 text-center">
                    <span class="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                      {agente.parou_escutar_1min}
                    </span>
                  </td>
                  <td class="py-3 px-4 text-center">
                    <span class="inline-flex items-center px-2 py-1 bg-amber-100 text-amber-800 rounded text-xs font-medium">
                      {agente.nao_evoluiu_1min_mais}
                    </span>
                  </td>
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
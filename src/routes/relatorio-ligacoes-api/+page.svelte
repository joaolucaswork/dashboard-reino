<script lang="ts">
  import { onMount } from "svelte";
  import { Card, CardContent, CardHeader, CardTitle } from "$lib/components/ui/card";
  import { Button } from "$lib/components/ui/button";
  import { Badge } from "$lib/components/ui/badge";
  import { Label } from "$lib/components/ui/label";
  import { Input } from "$lib/components/ui/input";
  import { Calendar, Search, Download, RefreshCw } from "lucide-svelte";
  
  // Estados da aplicação
  let carregando = false;
  let erro = '';
  let dadosConsulta: any = null;
  
  // Filtros da consulta
  let dataInicio = '2025-09-30'; // Data padrão com dados disponíveis
  let dataFim = '2025-09-30';
  let agente = '';
  let qualificacao = '';
  let telefone = '';
  
  // Métricas calculadas
  $: metricas = calcularMetricas(dadosConsulta?.calls || []);
  
  function calcularMetricas(calls: any[]) {
    if (!calls.length) return {
      total_ligacoes: 0,
      tempo_total: 0,
      tempo_medio: 0,
      taxa_atendimento: 0,
      ligacoes_atendidas: 0
    };
    
    const total_ligacoes = calls.length;
    const ligacoes_atendidas = calls.filter(call => call.hangup_cause === 2).length;
    const tempo_total = calls.reduce((acc, call) => acc + (call.duration || 0), 0);
    const tempo_medio = total_ligacoes > 0 ? Math.round(tempo_total / total_ligacoes) : 0;
    const taxa_atendimento = total_ligacoes > 0 ? Math.round((ligacoes_atendidas / total_ligacoes) * 100) : 0;
    
    return {
      total_ligacoes,
      tempo_total: Math.round(tempo_total / 60), // em minutos
      tempo_medio,
      taxa_atendimento,
      ligacoes_atendidas
    };
  }
  
  async function buscarLigacoes() {
    console.log('🔍 Botão Buscar Ligações clicado!');
    console.log('🔍 Iniciando busca de ligações...');
    carregando = true;
    erro = '';
    
    try {
      const params = new URLSearchParams({
        data_inicio: dataInicio,
        data_fim: dataFim,
      });
      
      if (agente) params.append('agente', agente);
      if (qualificacao) params.append('qualificacao', qualificacao);
      if (telefone) params.append('telefone', telefone);
      
      console.log('📡 Fazendo requisição para:', `/api/callix/ligacoes?${params.toString()}`);
      
      const response = await fetch(`/api/callix/ligacoes?${params.toString()}`);
      const data = await response.json();
      
      console.log('📊 Resposta recebida:', data);
      
      if (!response.ok) {
        throw new Error(data.message || data.error || 'Erro na requisição');
      }
      
      dadosConsulta = data;
      console.log(`✅ ${data.calls?.length || 0} ligações carregadas`);
      
    } catch (err) {
      console.error('❌ Erro ao buscar ligações:', err);
      erro = err instanceof Error ? err.message : 'Erro desconhecido';
    } finally {
      carregando = false;
    }
  }
  
  function limparFiltros() {
    console.log('🧹 Limpando filtros...');
    dataInicio = '2025-09-30';
    dataFim = '2025-09-30';
    agente = '';
    qualificacao = '';
    telefone = '';
    dadosConsulta = null;
    erro = '';
    console.log('✅ Filtros limpos');
  }
  
  function exportarCSV() {
    console.log('📥 Exportando CSV...');
    if (!dadosConsulta?.calls?.length) {
      alert('Nenhum dado para exportar');
      return;
    }
    
    const headers = ['Data/Hora', 'Telefone', 'Agente', 'Duração (s)', 'Status', 'Protocolo', 'Observação'];
    const rows = dadosConsulta.calls.map((call: any) => [
      new Date(call.started_at).toLocaleString('pt-BR'),
      call.destination_phone,
      call.agent?.name || 'N/A',
      call.duration || 0,
      call.hangup_cause === 2 ? 'Atendida' : 'Não atendida',
      call.protocol || 'N/A',
      call.note || ''
    ]);
    
    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `relatorio-ligacoes-${dataInicio}-${dataFim}.csv`;
    link.click();
  }
  
  function formatarTelefone(telefone: string) {
    return telefone.replace(/(\+55)(\d{2})(\d{5})(\d{4})/, '$1 ($2) $3-$4');
  }
  
  function formatarDuracao(segundos: number) {
    const mins = Math.floor(segundos / 60);
    const secs = segundos % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }
  
  // Carregar dados automaticamente ao montar
  onMount(async () => {
    console.log('🚀 Componente montado - NÃO carregando dados automaticamente');
    // await buscarLigacoes(); // Removido temporariamente para teste
  });
</script>

<svelte:head>
  <title>Relatório de Ligações - API Callix</title>
  <meta name="description" content="Dashboard de relatórios de ligações com integração da API Callix" />
</svelte:head>

<div class="container mx-auto p-6 max-w-7xl">
  <!-- Cabeçalho Clean -->
  <div class="mb-8 bg-white p-4 rounded-lg shadow-sm">
    <h1 class="text-3xl font-bold text-black mb-2">📞 Relatório de Ligações (API)</h1>
  </div>

  <!-- Formulário de Filtros Clean -->
  <Card class="mb-6">
    <CardHeader>
      <CardTitle class="flex items-center gap-2">
        <Search class="h-5 w-5" />
        Filtros de Consulta
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-4">
        <!-- Data Início -->
        <div class="space-y-2">
          <Label for="data-inicio" class="flex items-center gap-1">
            <Calendar class="h-4 w-4" />
            Data Início
          </Label>
          <Input 
            id="data-inicio"
            type="date" 
            bind:value={dataInicio}
          />
        </div>
        
        <!-- Data Fim -->
        <div class="space-y-2">
          <Label for="data-fim" class="flex items-center gap-1">
            <Calendar class="h-4 w-4" />
            Data Fim
          </Label>
          <Input 
            id="data-fim"
            type="date" 
            bind:value={dataFim}
          />
        </div>
        
        <!-- Agente -->
        <div class="space-y-2">
          <Label for="agente">Agente</Label>
          <Input 
            id="agente"
            type="text" 
            bind:value={agente}
            placeholder="ID do agente"
          />
        </div>
        
        <!-- Qualificação -->
        <div class="space-y-2">
          <Label for="qualificacao">Qualificação</Label>
          <Input 
            id="qualificacao"
            type="text" 
            bind:value={qualificacao}
            placeholder="ID da qualificação"
          />
        </div>
        
        <!-- Telefone -->
        <div class="space-y-2">
          <Label for="telefone">Telefone</Label>
          <Input 
            id="telefone"
            type="text" 
            bind:value={telefone}
            placeholder="+5581999999999"
          />
        </div>
      </div>
      
      <!-- Botões de Ação Clean -->
      <div class="flex flex-wrap gap-3">
        <button 
          on:click={buscarLigacoes}
          disabled={carregando}
          class="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {#if carregando}
            <RefreshCw class="h-4 w-4 animate-spin" />
            Carregando...
          {:else}
            <Search class="h-4 w-4" />
            Buscar Ligações
          {/if}
        </button>
        
        <button 
          on:click={limparFiltros}
          disabled={carregando}
          class="flex items-center gap-2 border border-gray-300 bg-white text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Limpar Filtros
        </button>
        
        {#if dadosConsulta?.calls?.length > 0}
          <button 
            on:click={exportarCSV}
            class="flex items-center gap-2 border border-gray-300 bg-white text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50"
          >
            <Download class="h-4 w-4" />
            Exportar CSV
          </button>
        {/if}
      </div>
    </CardContent>
  </Card>

  <!-- Mensagem de Erro -->
  {#if erro}
    <Card class="mb-6 border-red-200 bg-red-50">
      <CardContent class="p-4">
        <div class="flex items-start gap-3">
          <span class="text-red-500">❌</span>
          <div>
            <h3 class="font-semibold text-red-800">Erro na Consulta</h3>
            <p class="text-red-600 text-sm">{erro}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  {/if}

  <!-- Métricas Clean -->
  {#if dadosConsulta}
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
      <Card>
        <CardContent class="p-4">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-muted-foreground">Total de Ligações</p>
              <p class="text-2xl font-bold">{metricas.total_ligacoes}</p>
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
              <p class="text-2xl font-bold">{metricas.ligacoes_atendidas}</p>
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
              <p class="text-2xl font-bold">{metricas.taxa_atendimento}%</p>
            </div>
            <span class="text-xl">📊</span>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent class="p-4">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-muted-foreground">Tempo Total</p>
              <p class="text-2xl font-bold">{metricas.tempo_total}min</p>
            </div>
            <span class="text-xl">⏱️</span>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent class="p-4">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-muted-foreground">Tempo Médio</p>
              <p class="text-2xl font-bold">{metricas.tempo_medio}s</p>
            </div>
            <span class="text-xl">📈</span>
          </div>
        </CardContent>
      </Card>
    </div>
  {/if}

  <!-- Tabela de Ligações Clean -->
  {#if dadosConsulta?.calls?.length > 0}
    <Card>
      <CardHeader>
        <CardTitle class="flex items-center gap-2">
          <span class="text-lg">📋</span>
          Ligações Encontradas ({dadosConsulta.calls.length})
        </CardTitle>
        <p class="text-sm text-muted-foreground">
          📅 Período: {new Date(dadosConsulta.periodo.inicio).toLocaleDateString('pt-BR')} até {new Date(dadosConsulta.periodo.fim).toLocaleDateString('pt-BR')}
        </p>
      </CardHeader>
      <CardContent>
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="border-b">
                <th class="text-left p-3 font-medium">Data/Hora</th>
                <th class="text-left p-3 font-medium">Telefone</th>
                <th class="text-left p-3 font-medium">Agente</th>
                <th class="text-left p-3 font-medium">Duração</th>
                <th class="text-left p-3 font-medium">Status</th>
                <th class="text-left p-3 font-medium">Protocolo</th>
                <th class="text-left p-3 font-medium">Observações</th>
              </tr>
            </thead>
            <tbody>
              {#each dadosConsulta.calls as call}
                <tr class="border-b hover:bg-gray-50">
                  <td class="p-3">
                    <div class="text-sm font-medium">
                      {new Date(call.started_at).toLocaleDateString('pt-BR')}
                    </div>
                    <div class="text-xs text-muted-foreground">
                      {new Date(call.started_at).toLocaleTimeString('pt-BR')}
                    </div>
                  </td>
                  <td class="p-3">
                    <div class="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                      {formatarTelefone(call.destination_phone)}
                    </div>
                  </td>
                  <td class="p-3 text-sm font-medium">
                    {call.agent?.name || 'N/A'}
                  </td>
                  <td class="p-3">
                    <div class="text-sm font-bold">
                      {formatarDuracao(call.duration || 0)}
                    </div>
                  </td>
                  <td class="p-3">
                    {#if call.hangup_cause === 2}
                      <Badge class="bg-green-100 text-green-800">Atendida</Badge>
                    {:else}
                      <Badge class="bg-red-100 text-red-800">Não atendida</Badge>
                    {/if}
                  </td>
                  <td class="p-3 text-sm">
                    {call.protocol || 'N/A'}
                  </td>
                  <td class="p-3 text-sm max-w-xs">
                    <div class="truncate" title={call.note || ''}>
                      {call.note || 'Sem observações'}
                    </div>
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
            💡 Dica: Verifique se as datas estão dentro do período disponível (até 02/08/2025)
          </p>
        </div>
      </CardContent>
    </Card>
  {/if}
</div>
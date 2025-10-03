<script lang="ts">
  import { onMount } from "svelte";
  import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
  } from "$lib/components/ui/card";
  import { Button } from "$lib/components/ui/button";
  import { Badge } from "$lib/components/ui/badge";
  import * as Dialog from "$lib/components/ui/dialog";
  import { Input } from "$lib/components/ui/input";
  import { Label } from "$lib/components/ui/label";
  import { Separator } from "$lib/components/ui/separator";
  import {
    Upload,
    FileText,
    Phone,
    PhoneCall,
    PhoneOff,
    Users,
    Clock,
    TrendingUp,
    BarChart3,
    Download,
    AlertCircle,
  } from "@lucide/svelte";
  import { toast } from "svelte-sonner";

  // Verificar se os componentes estão funcionando
  onMount(() => {
    console.log('Componente montado, verificando elementos...');
    setTimeout(() => {
      console.log('FileInput após mount:', fileInput);
    }, 100);
  });

  // Interface para dados das ligações
  interface CallData {
    data: string;
    tipo: string;
    protocolo: string;
    cliente: string;
    telefone: string;
    agente: string;
    ramal: string;
    qualificacao: string;
    quemDesligou: string;
    observacao: string;
    duracao: string; // Duração Total
    duracaoAudio: string; // Duração do Atendimento
    audio: string; // Arquivo de áudio
    nome: string;
    endereco: string;
    email: string;
    estadoDaRede: string; // Estado da pesquisa
    tags: string;
  }

  interface CallMetrics {
    totalLigacoes: number;
    naoAtendeu: number;
    atendidas: number;
    percentualAtendimento: number;
    duracaoMedia: number;
    agentesUnicos: number;
    clientesUnicos: number;
    ligacoesPorTipo: Record<string, number>;
    ligacoesPorAgente: Record<string, number>;
    ligacoesPorQualificacao: Record<string, number>;
    // Novos indicadores por agente
    agenteStats: Record<string, {
      totalLigacoes: number;
      naoAtendeu: number;
      atendidas: number;
      percentualAtendimento: number;
      duracaoMedia: number;
      duracaoTotal: number;
      clientesUnicos: number;
      qualificacoes: Record<string, number>;
      melhorHorario: string;
      piorHorario: string;
    }>;
  }

  // Estados do componente
  let fileInput: HTMLInputElement;
  let isProcessing = false;
  let isDragOver = false;
  let uploadedData: CallData[] = [];
  let metrics: CallMetrics | null = null;
  let showUploadDialog = false;

  // Função para abrir modal de upload
  function openUploadModal() {
    console.log('Abrindo modal de upload');
    showUploadDialog = true;
  }

  // Função para abrir seletor de arquivo
  function openFileSelector() {
    console.log('Abrindo seletor de arquivo, fileInput:', fileInput);
    if (fileInput) {
      fileInput.value = ''; // Limpar valor anterior
      fileInput.click();
      console.log('Click no fileInput executado');
    } else {
      console.error('fileInput não está definido');
      // Fallback: criar um input temporário
      const tempInput = document.createElement('input');
      tempInput.type = 'file';
      tempInput.accept = '.csv';
      tempInput.onchange = (e) => {
        console.log('Arquivo selecionado via input temporário');
        handleFileSelect(e);
      };
      tempInput.click();
    }
  }

  // Função para processar arquivo CSV
  function parseCSV(text: string): CallData[] {
    // Limpar texto e dividir em linhas
    const lines = text.trim().split('\n').filter(line => line.trim());
    if (lines.length < 2) {
      throw new Error('Arquivo CSV deve ter pelo menos um cabeçalho e uma linha de dados');
    }

    // Detectar separador (; ou ,)
    const firstLine = lines[0];
    const separator = firstLine.includes(';') ? ';' : ',';
    console.log('Separador detectado:', separator);

    // Função para dividir linha CSV respeitando aspas
    function parseCsvLine(line: string): string[] {
      const result = [];
      let current = '';
      let inQuotes = false;
      
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === separator && !inQuotes) {
          result.push(current.trim().replace(/^"(.*)"$/, '$1'));
          current = '';
        } else {
          current += char;
        }
      }
      
      result.push(current.trim().replace(/^"(.*)"$/, '$1'));
      return result;
    }

    const headers = parseCsvLine(lines[0]).map(h => h.trim());
    const data: CallData[] = [];

    console.log('Headers encontrados:', headers);

    for (let i = 1; i < lines.length; i++) {
      const values = parseCsvLine(lines[i]);
      
      if (values.length >= 3) { // Pelo menos algumas colunas básicas
        const row: any = {};
        
        headers.forEach((header, index) => {
          const value = values[index] || '';
          // Mapear colunas do CSV para nossa interface (baseado no arquivo real)
          const normalizedHeader = header.toLowerCase()
            .replace(/\s+/g, '')
            .replace(/ç/g, 'c')
            .replace(/ã/g, 'a')
            .replace(/á/g, 'a')
            .replace(/â/g, 'a')
            .replace(/é/g, 'e')
            .replace(/ê/g, 'e')
            .replace(/í/g, 'i')
            .replace(/ó/g, 'o')
            .replace(/ô/g, 'o')
            .replace(/ú/g, 'u')
            .replace(/ü/g, 'u');

          switch (normalizedHeader) {
            case 'data':
              row.data = value;
              break;
            case 'tipo':
              row.tipo = value;
              break;
            case 'protocolo':
              row.protocolo = value;
              break;
            case 'cliente':
              row.cliente = value;
              break;
            case 'telefone':
              row.telefone = value;
              break;
            case 'agente':
              row.agente = value;
              break;
            case 'ramal':
              row.ramal = value;
              break;
            case 'qualificacao':
            case 'qualificação':
              row.qualificacao = value;
              break;
            case 'quemdesligou':
            case 'quemdesl':
              row.quemDesligou = value;
              break;
            case 'observacoes':
            case 'observações':
              row.observacao = value;
              break;
            case 'duracaototal':
            case 'duração total':
              row.duracao = value;
              break;
            case 'duracaodoatendimento':
            case 'duração do atendimento':
              row.duracaoAudio = value;
              break;
            case 'audio':
            case 'áudio':
              row.audio = value;
              break;
            case 'nome':
              row.nome = value;
              break;
            case 'endereco':
            case 'endereço':
              row.endereco = value;
              break;
            case 'email':
              row.email = value;
              break;
            case 'estadodapesquisa':
            case 'estado da pesquisa':
              row.estadoDaRede = value;
              break;
            case 'tags':
              row.tags = value;
              break;
            default:
              // Para headers não mapeados, usar o nome original limpo
              row[normalizedHeader] = value;
          }
        });

        data.push(row as CallData);
      }
    }

    console.log('Dados processados:', data.slice(0, 3)); // Log das primeiras 3 linhas
    console.log('Total de registros processados:', data.length);
    return data;
  }

  // Função para calcular métricas
  function calculateMetrics(data: CallData[]): CallMetrics {
    console.log('Calculando métricas para', data.length, 'registros');
    
    const totalLigacoes = data.length;
    
    // Buscar "Não Atendeu" de forma mais abrangente
    const naoAtendeu = data.filter(call => {
      const qual = (call.qualificacao || '').toLowerCase();
      return qual.includes('não atendeu') || 
             qual.includes('nao atendeu') ||
             qual.includes('não atende') ||
             qual.includes('nao atende');
    }).length;
    
    console.log('Não atendeu encontrado:', naoAtendeu);
    console.log('Qualificações únicas:', [...new Set(data.map(call => call.qualificacao || 'vazio'))]);
    
    const atendidas = totalLigacoes - naoAtendeu;
    const percentualAtendimento = totalLigacoes > 0 ? (atendidas / totalLigacoes) * 100 : 0;

    // Calcular duração média baseada na "Duração do Atendimento" (duracaoAudio)
    const duracoes = data
      .map(call => call.duracaoAudio)
      .filter(duracao => duracao && duracao.includes(':'))
      .map(duracao => {
        const parts = duracao.split(':');
        if (parts.length === 3) {
          return parseInt(parts[0]) * 3600 + parseInt(parts[1]) * 60 + parseInt(parts[2]);
        } else if (parts.length === 2) {
          return parseInt(parts[0]) * 60 + parseInt(parts[1]);
        }
        return 0;
      });
    
    const duracaoMedia = duracoes.length > 0 
      ? duracoes.reduce((sum, dur) => sum + dur, 0) / duracoes.length 
      : 0;

    // Agentes únicos (filtrar vazios)
    const agentesUnicos = new Set(data.map(call => call.agente).filter(agente => agente && agente.trim())).size;
    
    // Clientes únicos (filtrar vazios)
    const clientesUnicos = new Set(data.map(call => call.cliente).filter(cliente => cliente && cliente.trim())).size;

    // Ligações por tipo
    const ligacoesPorTipo: Record<string, number> = {};
    data.forEach(call => {
      if (call.tipo && call.tipo.trim()) {
        ligacoesPorTipo[call.tipo] = (ligacoesPorTipo[call.tipo] || 0) + 1;
      }
    });

    // Ligações por agente
    const ligacoesPorAgente: Record<string, number> = {};
    data.forEach(call => {
      if (call.agente && call.agente.trim()) {
        ligacoesPorAgente[call.agente] = (ligacoesPorAgente[call.agente] || 0) + 1;
      }
    });

    // Ligações por qualificação
    const ligacoesPorQualificacao: Record<string, number> = {};
    data.forEach(call => {
      if (call.qualificacao && call.qualificacao.trim()) {
        ligacoesPorQualificacao[call.qualificacao] = (ligacoesPorQualificacao[call.qualificacao] || 0) + 1;
      }
    });

    // Calcular estatísticas detalhadas por agente
    const agenteStats: Record<string, any> = {};
    
    data.forEach(call => {
      if (!call.agente || !call.agente.trim()) return;
      
      const agente = call.agente;
      if (!agenteStats[agente]) {
        agenteStats[agente] = {
          totalLigacoes: 0,
          naoAtendeu: 0,
          atendidas: 0,
          percentualAtendimento: 0,
          duracaoMedia: 0,
          duracaoTotal: 0,
          clientesUnicos: new Set(),
          qualificacoes: {},
          duracoes: [],
          horarios: [],
        };
      }

      const stats = agenteStats[agente];
      stats.totalLigacoes++;

      // Verificar se não atendeu
      const qual = (call.qualificacao || '').toLowerCase();
      const isNaoAtendeu = qual.includes('não atendeu') || 
                          qual.includes('nao atendeu') ||
                          qual.includes('não atende') ||
                          qual.includes('nao atende');
      
      if (isNaoAtendeu) {
        stats.naoAtendeu++;
      } else {
        stats.atendidas++;
      }

      // Adicionar cliente único
      if (call.cliente && call.cliente.trim()) {
        stats.clientesUnicos.add(call.cliente);
      }

      // Contar qualificações
      if (call.qualificacao && call.qualificacao.trim()) {
        stats.qualificacoes[call.qualificacao] = (stats.qualificacoes[call.qualificacao] || 0) + 1;
      }

      // Processar duração do atendimento (não duração total)
      if (call.duracaoAudio && call.duracaoAudio.includes(':')) {
        const parts = call.duracaoAudio.split(':');
        let duracao = 0;
        if (parts.length === 3) {
          duracao = parseInt(parts[0]) * 3600 + parseInt(parts[1]) * 60 + parseInt(parts[2]);
        } else if (parts.length === 2) {
          duracao = parseInt(parts[0]) * 60 + parseInt(parts[1]);
        }
        if (duracao > 0) {
          stats.duracoes.push(duracao);
        }
      }

      // Processar duração total para estatística separada
      if (call.duracao && call.duracao.includes(':')) {
        const parts = call.duracao.split(':');
        let duracaoTotal = 0;
        if (parts.length === 3) {
          duracaoTotal = parseInt(parts[0]) * 3600 + parseInt(parts[1]) * 60 + parseInt(parts[2]);
        } else if (parts.length === 2) {
          duracaoTotal = parseInt(parts[0]) * 60 + parseInt(parts[1]);
        }
        if (duracaoTotal > 0) {
          stats.duracaoTotal += duracaoTotal;
        }
      }

      // Processar horário para análise
      if (call.data) {
        const dataHora = call.data.split(' ');
        if (dataHora.length > 1) {
          const hora = dataHora[1].split(':')[0];
          stats.horarios.push(parseInt(hora));
        }
      }
    });

    // Finalizar cálculos por agente
    Object.keys(agenteStats).forEach(agente => {
      const stats = agenteStats[agente];
      
      // Percentual de atendimento
      stats.percentualAtendimento = stats.totalLigacoes > 0 
        ? (stats.atendidas / stats.totalLigacoes) * 100 
        : 0;

      // Duração média
      stats.duracaoMedia = stats.duracoes.length > 0 
        ? stats.duracoes.reduce((sum, dur) => sum + dur, 0) / stats.duracoes.length 
        : 0;

      // Contagem de clientes únicos
      stats.clientesUnicos = stats.clientesUnicos.size;

      // Análise de melhor/pior horário
      if (stats.horarios.length > 0) {
        const horarioStats = {};
        stats.horarios.forEach(hora => {
          horarioStats[hora] = (horarioStats[hora] || 0) + 1;
        });
        
        const sortedHorarios = Object.entries(horarioStats)
          .sort(([,a], [,b]) => b - a);
        
        stats.melhorHorario = `${sortedHorarios[0][0]}h (${sortedHorarios[0][1]} ligações)`;
        stats.piorHorario = sortedHorarios.length > 1 
          ? `${sortedHorarios[sortedHorarios.length - 1][0]}h (${sortedHorarios[sortedHorarios.length - 1][1]} ligações)`
          : stats.melhorHorario;
      } else {
        stats.melhorHorario = 'N/A';
        stats.piorHorario = 'N/A';
      }

      // Remover arrays temporários
      delete stats.duracoes;
      delete stats.horarios;
    });

    return {
      totalLigacoes,
      naoAtendeu,
      atendidas,
      percentualAtendimento,
      duracaoMedia,
      agentesUnicos,
      clientesUnicos,
      ligacoesPorTipo,
      ligacoesPorAgente,
      ligacoesPorQualificacao,
      agenteStats,
    };
  }

  // Função para processar arquivo
  async function processFile(file: File) {
    if (!file.name.toLowerCase().endsWith('.csv')) {
      toast.error('Por favor, selecione um arquivo CSV válido');
      return;
    }

    isProcessing = true;
    
    try {
      console.log('Processando arquivo:', file.name, 'Tamanho:', file.size);
      
      const text = await file.text();
      console.log('Texto lido, primeiros 500 caracteres:', text.substring(0, 500));
      
      const data = parseCSV(text);
      
      if (data.length === 0) {
        throw new Error('Nenhum dado encontrado no arquivo CSV');
      }

      uploadedData = data;
      metrics = calculateMetrics(data);
      
      console.log('Métricas calculadas:', metrics);
      toast.success(`Arquivo processado com sucesso! ${data.length} ligações analisadas.`);
      showUploadDialog = false;
    } catch (error) {
      console.error('Erro ao processar arquivo:', error);
      toast.error(`Erro ao processar arquivo: ${error.message}`);
    } finally {
      isProcessing = false;
    }
  }

  // Handlers para drag and drop
  function handleDragOver(event: DragEvent) {
    event.preventDefault();
    isDragOver = true;
  }

  function handleDragLeave(event: DragEvent) {
    event.preventDefault();
    isDragOver = false;
  }

  function handleDrop(event: DragEvent) {
    event.preventDefault();
    isDragOver = false;
    
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  }

  function handleFileSelect(event: Event) {
    console.log('handleFileSelect chamado');
    const input = event.target as HTMLInputElement;
    const files = input.files;
    console.log('Arquivos selecionados:', files);
    
    if (files && files.length > 0) {
      console.log('Processando arquivo:', files[0].name);
      processFile(files[0]);
    } else {
      console.log('Nenhum arquivo selecionado');
    }
  }

  // Função para formatar duração
  function formatDuration(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  }

  // Função para exportar relatório
  function exportReport() {
    if (!metrics || !uploadedData.length) return;

    const reportData = [
      ['RELATÓRIO DE LIGAÇÕES - CALLIX'],
      [''],
      ['MÉTRICAS GERAIS'],
      ['Total de Ligações', metrics.totalLigacoes],
      ['Não Atendeu', metrics.naoAtendeu],
      ['Atendidas', metrics.atendidas],
      ['Percentual de Atendimento', `${metrics.percentualAtendimento.toFixed(2)}%`],
      ['Duração Média', formatDuration(metrics.duracaoMedia)],
      ['Agentes Únicos', metrics.agentesUnicos],
      ['Clientes Únicos', metrics.clientesUnicos],
      [''],
      ['INDICADORES POR AGENTE'],
      ['Agente', 'Total Ligações', 'Atendidas', 'Não Atendeu', '% Atendimento', 'Duração Média', 'Duração Total', 'Clientes Únicos', 'Melhor Horário'],
      ...Object.entries(metrics.agenteStats).map(([agente, stats]) => [
        agente,
        stats.totalLigacoes,
        stats.atendidas,
        stats.naoAtendeu,
        `${stats.percentualAtendimento.toFixed(2)}%`,
        formatDuration(stats.duracaoMedia),
        formatDuration(stats.duracaoTotal),
        stats.clientesUnicos,
        stats.melhorHorario
      ]),
      [''],
      ['LIGAÇÕES POR QUALIFICAÇÃO'],
      ...Object.entries(metrics.ligacoesPorQualificacao).map(([qual, count]) => [qual, count]),
      [''],
      ['LIGAÇÕES POR AGENTE'],
      ...Object.entries(metrics.ligacoesPorAgente).map(([agente, count]) => [agente, count]),
      [''],
      ['QUALIFICAÇÕES POR AGENTE'],
      ...Object.entries(metrics.agenteStats).flatMap(([agente, stats]) => [
        [`${agente}:`],
        ...Object.entries(stats.qualificacoes).map(([qual, count]) => [`  ${qual}`, count])
      ]),
    ];

    const csvContent = reportData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `relatorio-ligacoes-detalhado-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  }
</script>

<svelte:head>
  <title>Relatório de Ligações - Reino Capital</title>
  <meta name="description" content="Análise de métricas de ligações da Callix" />
</svelte:head>

<div class="space-y-8">
  <!-- Cabeçalho -->
  <div class="flex items-center justify-between">
    <div>
      <h1 class="text-3xl font-bold text-foreground">Relatório de Ligações</h1>
      <p class="text-muted-foreground mt-2">
        Análise de métricas de ligações da Callix
      </p>
    </div>
    
    <div class="flex gap-3">
      {#if metrics}
        <Button variant="outline" on:click={exportReport}>
          <Download class="h-4 w-4 mr-2" />
          Exportar Relatório
        </Button>
      {/if}
      
      <!-- Upload direto sem modal -->
      <div class="relative">
        <Button on:click={openUploadModal} class="cursor-pointer">
          <Upload class="h-4 w-4 mr-2" />
          Carregar CSV
        </Button>
        
        <!-- Input invisível sobreposto -->
        <input
          type="file"
          accept=".csv"
          on:change={handleFileSelect}
          class="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          title="Selecionar arquivo CSV"
        />
      </div>
    </div>
  </div>

  {#if !metrics}
    <!-- Estado inicial - Upload -->
    <Card class="border-2 border-dashed border-border">
      <CardContent class="pt-6">
        <div class="text-center py-12">
          <FileText class="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h3 class="text-lg font-semibold mb-2">Carregue um arquivo CSV da Callix</h3>
          <p class="text-muted-foreground mb-6 max-w-md mx-auto">
            Faça upload de um arquivo CSV exportado da Callix para gerar o relatório de métricas de ligações.
          </p>
          <div class="relative inline-block">
            <Button on:click={openUploadModal} size="lg" class="cursor-pointer">
              <Upload class="h-5 w-5 mr-2" />
              Selecionar Arquivo CSV
            </Button>
            
            <!-- Input invisível sobreposto para upload direto -->
            <input
              type="file"
              accept=".csv"
              on:change={handleFileSelect}
              class="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              title="Selecionar arquivo CSV"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  {:else}
    <!-- Métricas Principais -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <!-- Total de Ligações -->
      <Card>
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle class="text-sm font-medium">Total de Ligações</CardTitle>
          <Phone class="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold">{metrics.totalLigacoes.toLocaleString()}</div>
        </CardContent>
      </Card>

      <!-- Não Atendeu -->
      <Card>
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle class="text-sm font-medium">Não Atendeu</CardTitle>
          <PhoneOff class="h-4 w-4 text-red-500" />
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold text-red-600">{metrics.naoAtendeu.toLocaleString()}</div>
          <p class="text-xs text-muted-foreground">
            {((metrics.naoAtendeu / metrics.totalLigacoes) * 100).toFixed(1)}% do total
          </p>
        </CardContent>
      </Card>

      <!-- Atendidas -->
      <Card>
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle class="text-sm font-medium">Atendidas</CardTitle>
          <PhoneCall class="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold text-green-600">{metrics.atendidas.toLocaleString()}</div>
          <p class="text-xs text-muted-foreground">
            {metrics.percentualAtendimento.toFixed(1)}% de atendimento
          </p>
        </CardContent>
      </Card>

      <!-- Duração Média -->
      <Card>
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle class="text-sm font-medium">Duração Média</CardTitle>
          <Clock class="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold">{formatDuration(metrics.duracaoMedia)}</div>
        </CardContent>
      </Card>
    </div>

    <!-- Indicadores Detalhados por Agente -->
    <Card>
      <CardHeader>
        <CardTitle class="flex items-center">
          <Users class="h-5 w-5 mr-2" />
          Indicadores Detalhados por Agente
        </CardTitle>
      </CardHeader>
      <CardContent>
        <!-- Cabeçalho da Tabela -->
        <div class="rounded-lg border">
          <div class="bg-muted/50 border-b">
            <div class="grid grid-cols-8 gap-4 p-4 text-sm font-medium text-muted-foreground">
              <div>Agente</div>
              <div class="text-center">Total</div>
              <div class="text-center">Atendidas</div>
              <div class="text-center">% Atendimento</div>
              <div class="text-center">Dur. Média</div>
              <div class="text-center">Dur. Total</div>
              <div class="text-center">Clientes</div>
              <div class="text-center">Melhor Horário</div>
            </div>
          </div>
          
          <!-- Linhas da Tabela -->
          <div class="divide-y">
            {#each Object.entries(metrics.agenteStats)
              .sort(([,a], [,b]) => b.totalLigacoes - a.totalLigacoes) as [agente, stats]}
              <div class="grid grid-cols-8 gap-4 p-4 text-sm items-center hover:bg-muted/30 transition-colors">
                <!-- Agente -->
                <div class="flex items-center space-x-2">
                  <div class="w-8 h-8 bg-primary/10 border border-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <span class="text-xs font-bold text-primary">
                      {agente.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </span>
                  </div>
                  <span class="font-medium truncate">{agente}</span>
                </div>
                
                <!-- Total Ligações -->
                <div class="text-center font-medium">{stats.totalLigacoes}</div>
                
                <!-- Atendidas -->
                <div class="text-center">
                  <span class="text-green-600 font-medium">{stats.atendidas}</span>
                </div>
                
                <!-- % Atendimento -->
                <div class="text-center">
                  <Badge variant={stats.percentualAtendimento >= 50 ? 'default' : 'destructive'} class="text-xs">
                    {stats.percentualAtendimento.toFixed(1)}%
                  </Badge>
                </div>
                
                <!-- Duração Média -->
                <div class="text-center text-xs">{formatDuration(stats.duracaoMedia)}</div>
                
                <!-- Duração Total -->
                <div class="text-center text-xs">{formatDuration(stats.duracaoTotal)}</div>
                
                <!-- Clientes Únicos -->
                <div class="text-center">
                  <Badge variant="outline" class="text-xs">{stats.clientesUnicos}</Badge>
                </div>
                
                <!-- Melhor Horário -->
                <div class="text-center text-xs text-muted-foreground">{stats.melhorHorario}</div>
              </div>
            {/each}
          </div>
        </div>
        
        <!-- Resumo Rápido -->
        <div class="mt-6 p-4 bg-muted/20 rounded-lg">
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div class="text-lg font-bold">{metrics.agentesUnicos}</div>
              <div class="text-xs text-muted-foreground">Agentes Únicos</div>
            </div>
            <div>
              <div class="text-lg font-bold">{metrics.clientesUnicos}</div>
              <div class="text-xs text-muted-foreground">Clientes Únicos</div>
            </div>
            <div>
              <div class="text-lg font-bold">
                {Object.values(metrics.agenteStats).reduce((sum, stats) => sum + stats.atendidas, 0)}
              </div>
              <div class="text-xs text-muted-foreground">Total Atendidas</div>
            </div>
            <div>
              <div class="text-lg font-bold">
                {Object.values(metrics.agenteStats).reduce((sum, stats) => sum + stats.naoAtendeu, 0)}
              </div>
              <div class="text-xs text-muted-foreground">Total Não Atendeu</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>


    <!-- Top Agentes -->
    <Card>
      <CardHeader>
        <CardTitle>Top Agentes por Volume de Ligações</CardTitle>
      </CardHeader>
      <CardContent>
        <div class="space-y-3">
          {#each Object.entries(metrics.ligacoesPorAgente)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 10) as [agente, count], index}
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-3">
                <Badge variant="outline" class="w-8 h-8 rounded-full flex items-center justify-center">
                  {index + 1}
                </Badge>
                <span class="font-medium">{agente || 'Não informado'}</span>
              </div>
              <div class="flex items-center space-x-2">
                <span class="text-sm text-muted-foreground">{count} ligações</span>
                <div class="w-24 bg-muted rounded-full h-2">
                  <div 
                    class="bg-primary h-2 rounded-full" 
                    style="width: {(count / Math.max(...Object.values(metrics.ligacoesPorAgente))) * 100}%"
                  ></div>
                </div>
              </div>
            </div>
          {/each}
        </div>
      </CardContent>
    </Card>

    <!-- Análise de Qualificações -->
    <Card>
      <CardHeader>
        <CardTitle>Análise de Qualificações</CardTitle>
      </CardHeader>
      <CardContent>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {#each Object.entries(metrics.ligacoesPorQualificacao)
            .sort(([,a], [,b]) => b - a) as [qualificacao, count]}
            <div class="flex items-center justify-between p-3 border rounded-lg">
              <div class="flex items-center space-x-2">
                {#if qualificacao.toLowerCase().includes('não atendeu') || qualificacao.toLowerCase().includes('nao atendeu')}
                  <AlertCircle class="h-4 w-4 text-red-500" />
                {:else}
                  <TrendingUp class="h-4 w-4 text-green-500" />
                {/if}
                <span class="text-sm font-medium">{qualificacao || 'Não informado'}</span>
              </div>
              <Badge variant={qualificacao.toLowerCase().includes('não atendeu') ? 'destructive' : 'secondary'}>
                {count}
              </Badge>
            </div>
          {/each}
        </div>
      </CardContent>
    </Card>

    <!-- Ranking de Agentes -->
    <Card>
      <CardHeader>
        <CardTitle>Ranking de Performance dos Agentes</CardTitle>
      </CardHeader>
      <CardContent>
        <div class="space-y-4">
          <!-- Cabeçalhos -->
          <div class="grid grid-cols-7 gap-4 text-sm font-medium text-muted-foreground border-b pb-2">
            <div>Agente</div>
            <div class="text-center">Total</div>
            <div class="text-center">Atendidas</div>
            <div class="text-center">% Atendimento</div>
            <div class="text-center">Duração Média Atend.</div>
            <div class="text-center">Clientes</div>
            <div class="text-center">Rank</div>
          </div>

          <!-- Dados -->
          {#each Object.entries(metrics.agenteStats)
            .sort(([,a], [,b]) => b.percentualAtendimento - a.percentualAtendimento) as [agente, stats], index}
            <div class="grid grid-cols-7 gap-4 text-sm items-center py-2 border-b border-border/50">
              <div class="font-medium">{agente}</div>
              <div class="text-center">{stats.totalLigacoes}</div>
              <div class="text-center text-green-600">{stats.atendidas}</div>
              <div class="text-center">
                <Badge variant={stats.percentualAtendimento >= 50 ? 'default' : 'destructive'}>
                  {stats.percentualAtendimento.toFixed(1)}%
                </Badge>
              </div>
              <div class="text-center">{formatDuration(stats.duracaoMedia)}</div>
              <div class="text-center">{stats.clientesUnicos}</div>
              <div class="text-center">
                <Badge variant="outline" class="w-8 h-8 rounded-full flex items-center justify-center">
                  #{index + 1}
                </Badge>
              </div>
            </div>
          {/each}
        </div>
      </CardContent>
    </Card>
  {/if}
</div>

<!-- Dialog de Upload -->
<Dialog.Root bind:open={showUploadDialog}>
  <Dialog.Content class="sm:max-w-md">
    <Dialog.Header>
      <Dialog.Title>Carregar Arquivo CSV</Dialog.Title>
      <Dialog.Description>
        Selecione um arquivo CSV exportado da Callix para análise.
      </Dialog.Description>
    </Dialog.Header>
    
    <div class="space-y-4">
      <!-- Drag and Drop Area -->
      <div
        class="border-2 border-dashed rounded-lg p-8 text-center transition-colors {isDragOver 
          ? 'border-primary bg-primary/5' 
          : 'border-border'}"
        on:dragover={handleDragOver}
        on:dragleave={handleDragLeave}
        on:drop={handleDrop}
        role="button"
        tabindex="0"
      >
        <Upload class="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <p class="text-sm font-medium mb-2">
          Arraste e solte seu arquivo CSV aqui
        </p>
        <p class="text-xs text-muted-foreground mb-4">
          ou clique no botão abaixo para selecionar
        </p>
        
        <Button 
          variant="outline" 
          disabled={isProcessing}
          on:click={openFileSelector}
          class="cursor-pointer"
        >
          {#if isProcessing}
            Processando...
          {:else}
            Selecionar Arquivo
          {/if}
        </Button>
      </div>

      <!-- File Input (hidden) -->
      <input
        bind:this={fileInput}
        type="file"
        accept=".csv"
        on:change={handleFileSelect}
        style="position: absolute; left: -9999px; opacity: 0;"
      />
      
      <!-- Input visível para fallback -->
      <div class="mt-4 pt-4 border-t border-border/50">
        <p class="text-sm text-muted-foreground mb-2">
          Se o botão acima não funcionar, use esta opção:
        </p>
        <input
          type="file"
          accept=".csv"
          on:change={handleFileSelect}
          class="block w-full text-sm text-foreground file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 file:cursor-pointer border border-border rounded-md cursor-pointer"
        />
      </div>
    </div>

    <Dialog.Footer>
      <Button variant="outline" on:click={() => showUploadDialog = false}>
        Cancelar
      </Button>
    </Dialog.Footer>
  </Dialog.Content>
</Dialog.Root>
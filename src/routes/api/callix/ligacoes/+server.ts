import type { RequestHandler } from './$types';
import { json } from '@sveltejs/kit';
import { CALLIX_API_TOKEN } from '$lib/config';

// Configurações da API Callix
const CALLIX_API_URL = 'https://reinocapital.callix.com.br/api/v1';

interface CallixResponse {
  data: CallixCall[];
  meta: {
    pagination: {
      total: number;
      count: number;
      per_page: number;
      current_page: number;
      total_pages: number;
    };
  };
}

interface CallixCall {
  id: string;
  started_at: string;
  ended_at: string;
  destination_phone: string;
  call_type: number;
  extension: number;
  agent: {
    id: number;
    name: string;
  };
  qualification?: {
    id: number;
    name: string;
  };
  protocol?: string;
  note?: string;
  hangup_cause: number;
  duration: number;
  talk_time: number;
  client?: {
    name: string;
    email: string;
  };
}

export const GET: RequestHandler = async ({ url, fetch }) => {
  console.log('🚀 API Endpoint chamada com URL:', url.toString());
  
  try {
    // Verificar se o token da API está configurado
    if (!CALLIX_API_TOKEN) {
      console.log('❌ Token não configurado');
      return json(
        { error: 'Token da API Callix não configurado', message: 'CALLIX_API_TOKEN não encontrado nas variáveis de ambiente' },
        { status: 500 }
      );
    }

    // Extrair parâmetros da query string
    const dataInicio = url.searchParams.get('data_inicio');
    const dataFim = url.searchParams.get('data_fim');
    const agente = url.searchParams.get('agente');
    const qualificacao = url.searchParams.get('qualificacao');
    const telefone = url.searchParams.get('telefone');

    // Validar parâmetros obrigatórios
    if (!dataInicio || !dataFim) {
      return json(
        { error: 'Parâmetros obrigatórios', message: 'data_inicio e data_fim são obrigatórios' },
        { status: 400 }
      );
    }

    // Validar formato das datas
    const startDate = new Date(dataInicio);
    const endDate = new Date(dataFim);
    
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return json(
        { error: 'Formato de data inválido', message: 'Use o formato YYYY-MM-DD' },
        { status: 400 }
      );
    }

    // Validar intervalo máximo de 31 dias
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays > 31) {
      return json(
        { error: 'Intervalo muito grande', message: 'O intervalo máximo é de 31 dias' },
        { status: 400 }
      );
    }

    // Construir filtros para a API Callix
    const filters = new URLSearchParams();
    
    // Filtro de data obrigatório (formato ISO com timezone)
    const startISO = `${dataInicio}T00:00:00.000Z`;
    const endISO = `${dataFim}T23:59:59.999Z`;
    filters.append('filter[started_at]', `${startISO},${endISO}`);

    // Filtros opcionais
    if (agente) {
      filters.append('filter[agent]', agente);
    }
    
    if (qualificacao) {
      filters.append('filter[qualification]', qualificacao);
    }
    
    if (telefone) {
      filters.append('filter[destination_phone]', telefone);
    }

    console.log('Consultando API Callix com filtros:', filters.toString());

    // Fazer requisição para a API Callix
    const callixUrl = `${CALLIX_API_URL}/outgoing_completed_calls?${filters.toString()}`;
    
    const response = await fetch(callixUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${CALLIX_API_TOKEN}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Erro na API Callix:', response.status, errorText);
      
      // Tratar diferentes tipos de erro
      if (response.status === 401) {
        return json(
          { error: 'Erro de autenticação', message: 'Token da API Callix inválido ou expirado' },
          { status: 401 }
        );
      } else if (response.status === 403) {
        return json(
          { error: 'Acesso negado', message: 'Sem permissão para acessar esta API' },
          { status: 403 }
        );
      } else if (response.status === 429) {
        return json(
          { error: 'Limite de requisições', message: 'Muitas requisições. Tente novamente em alguns minutos.' },
          { status: 429 }
        );
      } else {
        return json(
          { error: 'Erro na API Callix', message: `Status ${response.status}: ${errorText}` },
          { status: response.status }
        );
      }
    }

    const data: CallixResponse = await response.json();
    
    console.log(`API Callix retornou ${data.data?.length || 0} ligações`);

    // Processar e retornar os dados
    const processedCalls = data.data?.map(call => ({
      id: call.id,
      started_at: call.started_at,
      ended_at: call.ended_at,
      destination_phone: call.destination_phone,
      call_type: call.call_type,
      extension: call.extension,
      agent: call.agent,
      qualification: call.qualification,
      protocol: call.protocol,
      note: call.note,
      hangup_cause: call.hangup_cause,
      duration: call.duration,
      talk_time: call.talk_time,
      client: call.client,
    })) || [];

    return json({
      calls: processedCalls,
      total: data.meta?.pagination?.total || processedCalls.length,
      periodo: {
        inicio: dataInicio,
        fim: dataFim,
      },
      filtros_aplicados: {
        agente: agente || null,
        qualificacao: qualificacao || null,
        telefone: telefone || null,
      },
    });

  } catch (error) {
    console.error('Erro interno ao consultar API Callix:', error);
    
    return json(
      { 
        error: 'Erro interno do servidor', 
        message: 'Erro ao conectar com a API da Callix. Tente novamente em alguns minutos.',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    );
  }
};
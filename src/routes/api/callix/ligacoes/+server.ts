import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { CALLIX_API_TOKEN } from '$lib/config';
import { getQualificationById, getAgentById } from '$lib/utils/callix-mappings';

const CALLIX_BASE_URL = 'https://reinocapital.callix.com.br/api/v1';

interface CallixCall {
  id: string;
  attributes: {
    started_at: string;
    ended_at: string;
    duration: number;
    destination_phone: string;
    protocol: number;
    note: string | null;
    hangup_cause: number;
    service_duration: number;
    has_audio: boolean;
  };
  relationships: {
    agent: {
      data: { type: string; id: string; };
    };
    qualification: {
      data: { type: string; id: string; };
    };
    customer: {
      data: { type: string; id: string; };
    };
  };
}

interface ProcessedCall {
  id: string;
  created_at: string;
  ended_at: string;
  duration: number;
  destination_phone: string;
  protocol: number;
  note: string | null;
  hangup_cause: number;
  service_duration: number;
  has_audio: boolean;
  agent_id: string;
  agent_name: string;
  agent_initials: string;
  agent_color: string;
  qualification_id: string;
  qualification_name: string;
  qualification_icon: string;
  qualification_category: string;
  customer_id: string;
  customer_name: string;
}

// Cache simples apenas para clientes (únicos que precisam de consulta à API)
const customerCache = new Map<string, string>();

async function fetchFromCallix(endpoint: string): Promise<any> {
  const url = `${CALLIX_BASE_URL}${endpoint}`;
  console.log(`🌐 Requisição para: ${url}`);

  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${CALLIX_API_TOKEN}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`❌ Erro na API Callix (${response.status}):`, errorText);
    throw new Error(`Erro da API Callix: ${response.status} - ${errorText}`);
  }

  return await response.json();
}

async function getCustomerName(customerId: string): Promise<string> {
  if (customerCache.has(customerId)) {
    return customerCache.get(customerId)!;
  }

  try {
    const data = await fetchFromCallix(`/customers/${customerId}`);
    const name = data.data?.attributes?.name || `Cliente ${customerId}`;
    customerCache.set(customerId, name);
    return name;
  } catch {
    const fallbackName = `Cliente ${customerId}`;
    customerCache.set(customerId, fallbackName);
    return fallbackName;
  }
}

async function processCallsOptimized(calls: CallixCall[]): Promise<ProcessedCall[]> {
  console.log(`🔄 Processando ${calls.length} ligações com mapeamento otimizado...`);

  if (calls.length === 0) {
    return [];
  }

  // Buscar apenas clientes únicos (agentes e qualificações são mapeados diretamente)
  const customerIds = [...new Set(calls.map(call => call.relationships.customer.data.id))];

  console.log(`📊 Processando:`, {
    ligacoes: calls.length,
    clientesUnicos: customerIds.length,
    agentes: 'mapeamento direto',
    qualificacoes: 'mapeamento direto'
  });

  // Buscar nomes de clientes
  const customerNames = await Promise.all(customerIds.map(id => getCustomerName(id)));
  const customerMap = new Map(customerIds.map((id, index) => [id, customerNames[index]]));

  // Processar ligações com mapeamentos diretos
  const processedCalls: ProcessedCall[] = calls.map(call => {
    const qualification = getQualificationById(call.relationships.qualification.data.id);
    const agent = getAgentById(call.relationships.agent.data.id);
    
    return {
      id: call.id,
      created_at: call.attributes.started_at,
      ended_at: call.attributes.ended_at,
      duration: call.attributes.duration,
      destination_phone: call.attributes.destination_phone,
      protocol: call.attributes.protocol,
      note: call.attributes.note,
      hangup_cause: call.attributes.hangup_cause,
      service_duration: call.attributes.service_duration,
      has_audio: call.attributes.has_audio,
      agent_id: call.relationships.agent.data.id,
      agent_name: agent.name,
      agent_initials: agent.initials,
      agent_color: agent.color,
      qualification_id: call.relationships.qualification.data.id,
      qualification_name: qualification.name,
      qualification_icon: qualification.icon,
      qualification_category: qualification.category,
      customer_id: call.relationships.customer.data.id,
      customer_name: customerMap.get(call.relationships.customer.data.id) || `Cliente ${call.relationships.customer.data.id}`
    };
  });

  console.log(`✅ ${processedCalls.length} ligações processadas com mapeamento otimizado`);
  
  // Logs para debug
  const agentsSummary = processedCalls.reduce((acc, call) => {
    acc[call.agent_name] = (acc[call.agent_name] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const qualificationsSummary = processedCalls.reduce((acc, call) => {
    acc[call.qualification_name] = (acc[call.qualification_name] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  console.log(`👥 Agentes encontrados:`, agentsSummary);
  console.log(`🏷️ Qualificações encontradas:`, qualificationsSummary);

  return processedCalls;
}
export const GET: RequestHandler = async ({ url }) => {
  console.log('🚀 Iniciando consulta otimizada à API Callix...');

  try {
    if (!CALLIX_API_TOKEN) {
      throw new Error('CALLIX_API_TOKEN não encontrado nas variáveis de ambiente');
    }

    const dataInicio = url.searchParams.get('dataInicio');
    const dataFim = url.searchParams.get('dataFim');
    const agente = url.searchParams.get('agente');
    const qualificacao = url.searchParams.get('qualificacao');
    const telefone = url.searchParams.get('telefone');

    if (!dataInicio || !dataFim) {
      return json({ error: 'dataInicio e dataFim são obrigatórios' }, { status: 400 });
    }

    // Construir parâmetros da consulta
    const params = new URLSearchParams();
    
    const startDate = `${dataInicio}T00:00:00.000Z`;
    const endDate = `${dataFim}T23:59:59.999Z`;
    params.append('filter[started_at]', `${startDate},${endDate}`);

    if (agente) params.append('filter[agent]', agente);
    if (qualificacao) params.append('filter[qualification]', qualificacao);
    if (telefone) params.append('filter[destination_phone]', telefone);

    params.append('page[limit]', '500');

    // Buscar ligações
    const endpoint = `/outgoing_completed_calls?${params.toString()}`;
    const data = await fetchFromCallix(endpoint);

    console.log(`📞 ${data.meta?.count || 0} ligações encontradas na API`);

    if (!data.data || data.data.length === 0) {
      return json({
        calls: [],
        meta: data.meta || { count: 0 },
        message: 'Nenhuma ligação encontrada para o período especificado'
      });
    }

    // Processar com mapeamento otimizado
    const processedCalls = await processCallsOptimized(data.data);

    return json({
      calls: processedCalls,
      meta: data.meta,
      message: `${processedCalls.length} ligações processadas com mapeamento otimizado`
    });

  } catch (error) {
    console.error('❌ Erro na consulta:', error);
    return json(
      { 
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        details: 'Verifique se o token da API está correto e se a API está acessível'
      }, 
      { status: 500 }
    );
  }
};
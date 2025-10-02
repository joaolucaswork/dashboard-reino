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
    answered_at?: string; // Para campaigns
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
    campaign?: { // Para campaigns
      data: { type: string; id: string; };
    };
    campaign_list?: { // Para campaigns
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
  customer_id: string; // Pode ser ID real ou fallback
  customer_name: string;
  call_type: 'outgoing' | 'campaign'; // Novo campo para distinguir origem
  campaign_id?: string; // Para campanhas
  answered_at?: string; // Para campanhas
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

async function processCallsOptimized(calls: CallixCall[], callType: 'outgoing' | 'campaign'): Promise<ProcessedCall[]> {
  console.log(`🔄 Processando ${calls.length} ligações ${callType} com mapeamento otimizado...`);

  if (calls.length === 0) {
    return [];
  }

  // Buscar apenas clientes únicos (agentes e qualificações são mapeados diretamente)
  const customerIds = [...new Set(calls.map(call => call.relationships.customer?.data?.id).filter(Boolean))];

  // Verificar IDs de agentes e qualificações não encontrados
  const unknownAgentIds = new Set<string>();
  const unknownQualificationIds = new Set<string>();

  calls.forEach(call => {
    const agentId = call.relationships.agent?.data?.id;
    const qualificationId = call.relationships.qualification?.data?.id;

    if (agentId) {
      const agent = getAgentById(agentId);
      if (agent.name.startsWith('Agente ')) {
        unknownAgentIds.add(agentId);
      }
    }

    if (qualificationId) {
      const qualification = getQualificationById(qualificationId);
      if (qualification.name.startsWith('Qualificação ')) {
        unknownQualificationIds.add(qualificationId);
      }
    }
  });

  // Log de IDs não encontrados
  if (unknownAgentIds.size > 0) {
    console.warn(`⚠️ IDs de agentes não encontrados no mapeamento:`, Array.from(unknownAgentIds));
  }
  if (unknownQualificationIds.size > 0) {
    console.warn(`⚠️ IDs de qualificações não encontrados no mapeamento:`, Array.from(unknownQualificationIds));
  }

  // Buscar apenas clientes únicos que existem (agentes e qualificações são mapeados diretamente)
  console.log(`📊 Processando:`, {
    ligacoes: calls.length,
    tipo: callType,
    clientesComId: customerIds.length,
    clientesSemId: calls.length - customerIds.length,
    agentesDesconhecidos: unknownAgentIds.size,
    qualificacoesDesconhecidas: unknownQualificationIds.size
  });

  // Buscar nomes de clientes apenas para os que têm ID
  const customerNames = customerIds.length > 0 ? 
    await Promise.all(customerIds.map(id => getCustomerName(id))) : [];
  const customerMap = new Map(customerIds.map((id, index) => [id, customerNames[index]]));

  // Processar ligações com mapeamentos diretos
  const processedCalls: ProcessedCall[] = calls.map(call => {
    try {
      const agentId = call.relationships.agent?.data?.id;
      const qualificationId = call.relationships.qualification?.data?.id;
      const customerId = call.relationships.customer?.data?.id; // Opcional para campanhas

      if (!agentId) {
        throw new Error(`Agente não encontrado para ligação ${call.id}`);
      }
      if (!qualificationId) {
        throw new Error(`Qualificação não encontrada para ligação ${call.id}`);
      }
      // Cliente é opcional - campanhas podem não ter customer

      const qualification = getQualificationById(qualificationId);
      const agent = getAgentById(agentId);
      
      return {
        id: call.id,
        created_at: call.attributes.started_at,
        ended_at: call.attributes.ended_at,
        duration: call.attributes.service_duration, // Usar service_duration em vez de duration
        destination_phone: call.attributes.destination_phone,
        protocol: call.attributes.protocol,
        note: call.attributes.note,
        hangup_cause: call.attributes.hangup_cause,
        service_duration: call.attributes.service_duration,
        has_audio: call.attributes.has_audio,
        agent_id: agentId,
        agent_name: agent.name,
        agent_initials: agent.initials,
        agent_color: agent.color,
        qualification_id: qualificationId,
        qualification_name: qualification.name,
        qualification_icon: qualification.icon,
        qualification_category: qualification.category,
        customer_id: customerId || `${callType}-${call.id}`,
        customer_name: customerId ? 
          (customerMap.get(customerId) || `Cliente ${customerId}`) : 
          `Contato ${callType}`,
        call_type: callType,
        campaign_id: call.relationships.campaign?.data?.id,
        answered_at: call.attributes.answered_at
      };
    } catch (error) {
      console.error(`❌ Erro processando ligação ${call.id}:`, error);
      throw error;
    }
  });

  console.log(`✅ ${processedCalls.length} ligações ${callType} processadas com mapeamento otimizado`);
  
  return processedCalls;
}
export const GET: RequestHandler = async ({ url }) => {
  console.log('🚀 Iniciando consulta combinada às APIs Callix (outgoing + campaigns)...');

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

    // Buscar ligações de outgoing e campaigns em paralelo
    const [outgoingData, campaignData] = await Promise.allSettled([
      fetchFromCallix(`/outgoing_completed_calls?${params.toString()}`),
      fetchFromCallix(`/campaign_completed_calls?${params.toString()}`)
    ]);

    let allProcessedCalls: ProcessedCall[] = [];

    // Processar ligações outgoing
    if (outgoingData.status === 'fulfilled') {
      console.log(`📞 ${outgoingData.value.meta?.count || 0} ligações outgoing encontradas`);
      if (outgoingData.value.data && outgoingData.value.data.length > 0) {
        try {
          const outgoingCalls = await processCallsOptimized(outgoingData.value.data, 'outgoing');
          allProcessedCalls.push(...outgoingCalls);
        } catch (error) {
          console.error('❌ Erro processando ligações outgoing:', error);
          throw new Error(`Erro processando ligações outgoing: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
        }
      }
    } else {
      console.warn('⚠️ Erro ao buscar ligações outgoing:', outgoingData.reason);
    }

    // Processar ligações de campanhas
    if (campaignData.status === 'fulfilled') {
      console.log(`📢 ${campaignData.value.meta?.count || 0} ligações de campanha encontradas`);
      if (campaignData.value.data && campaignData.value.data.length > 0) {
        try {
          const campaignCalls = await processCallsOptimized(campaignData.value.data, 'campaign');
          allProcessedCalls.push(...campaignCalls);
        } catch (error) {
          console.error('❌ Erro processando ligações de campanha:', error);
          throw new Error(`Erro processando ligações de campanha: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
        }
      }
    } else {
      console.warn('⚠️ Erro ao buscar ligações de campanha:', campaignData.reason);
    }

    // Ordenar por data
    allProcessedCalls.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    // Logs de resumo
    const totalOutgoing = allProcessedCalls.filter(call => call.call_type === 'outgoing').length;
    const totalCampaign = allProcessedCalls.filter(call => call.call_type === 'campaign').length;

    console.log(`📊 Resumo das ligações processadas:`, {
      outgoing: totalOutgoing,
      campaign: totalCampaign,
      total: allProcessedCalls.length
    });

    const agentsSummary = allProcessedCalls.reduce((acc, call) => {
      acc[call.agent_name] = (acc[call.agent_name] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const qualificationsSummary = allProcessedCalls.reduce((acc, call) => {
      acc[call.qualification_name] = (acc[call.qualification_name] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    console.log(`👥 Agentes encontrados:`, agentsSummary);
    console.log(`🏷️ Qualificações encontradas:`, qualificationsSummary);

    if (allProcessedCalls.length === 0) {
      return json({
        calls: [],
        meta: { count: 0, outgoing: 0, campaign: 0 },
        message: 'Nenhuma ligação encontrada para o período especificado'
      });
    }

    return json({
      calls: allProcessedCalls,
      meta: { 
        count: allProcessedCalls.length,
        outgoing: totalOutgoing,
        campaign: totalCampaign
      },
      message: `${allProcessedCalls.length} ligações processadas (${totalOutgoing} outgoing + ${totalCampaign} campanhas)`
    });

  } catch (error) {
    console.error('❌ Erro na consulta:', error);
    
    // Extrair informações específicas do erro
    let errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    let errorDetails = 'Verifique se o token da API está correto e se a API está acessível';
    
    // Se o erro menciona IDs não encontrados, incluir essa informação
    if (errorMessage.includes('Cannot read properties of undefined')) {
      errorDetails = `${errorDetails}. IMPORTANTE: Verifique se existem novos IDs de agentes ou qualificações que não estão mapeados no sistema.`;
    }
    
    return json(
      { 
        error: errorMessage,
        details: errorDetails,
        timestamp: new Date().toISOString(),
        suggestion: 'Se você encontrou IDs não mapeados, eles devem ser adicionados aos mapeamentos em callix-mappings.ts'
      }, 
      { status: 500 }
    );
  }
};
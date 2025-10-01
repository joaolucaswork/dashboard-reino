/**
 * Mapeamentos diretos da API Callix por ID
 * Dashboard Reino - Sistema de Relatórios
 */

// Mapeamento de qualificações da Callix
export const QUALIFICATIONS_MAP: Record<string, { name: string; icon: string; category: 'success' | 'warning' | 'danger' | 'info' }> = {
  '1': { name: 'Sem Contato', icon: '📞', category: 'warning' },
  '2': { name: 'Não Atendeu', icon: '❌', category: 'danger' },
  '3': { name: 'Reunião Marcada', icon: '📅', category: 'success' },
  '4': { name: 'Retornar Depois', icon: '🔄', category: 'warning' },
  '5': { name: 'Lead Inválido', icon: '🚫', category: 'danger' },
  '6': { name: 'Sem Perfil', icon: '👤', category: 'warning' },
  '7': { name: 'Interessado', icon: '✅', category: 'success' },
  '30000': { name: 'Muda/Caixa postal', icon: '📮', category: 'warning' },
  '30001': { name: 'Engano', icon: '❓', category: 'warning' },
  '30002': { name: 'Chamada Caiu', icon: '📱', category: 'danger' },
  '30003': { name: 'Chamada sem qualificação', icon: '❔', category: 'warning' },
  '30004': { name: 'Transferência', icon: '🔄', category: 'info' },
  '30005': { name: 'Tempo excedido', icon: '⏰', category: 'warning' },
  '30006': { name: 'Chat sem qualificação', icon: '💬', category: 'warning' },
  '30007': { name: 'Chat finalizado por nova mensagem ativa', icon: '💬', category: 'info' },
  '30008': { name: 'Tem Interesse', icon: '💡', category: 'success' },
  '30009': { name: 'Sem Interesse', icon: '🚫', category: 'danger' },
  '30010': { name: 'Retornar Contato', icon: '📞', category: 'warning' }
};

// Mapeamento de agentes da Callix
export const AGENTS_MAP: Record<string, { name: string; initials: string; color: string }> = {
  '1': { name: 'Carlos Tintori', initials: 'CT', color: 'bg-blue-500' },
  '2': { name: 'Placido Nilo', initials: 'PN', color: 'bg-green-500' },
  '3': { name: 'Gustavo Lima', initials: 'GL', color: 'bg-purple-500' },
  '4': { name: 'Eudes Souza', initials: 'ES', color: 'bg-orange-500' },
  '5': { name: 'Paulo Marques', initials: 'PM', color: 'bg-red-500' },
  '8': { name: 'Caio Milfont', initials: 'CM', color: 'bg-indigo-500' },
  '9': { name: 'Joao Lucas', initials: 'JL', color: 'bg-teal-500' },
  '10': { name: 'Gabriel Tintori', initials: 'GT', color: 'bg-yellow-500' }
};

/**
 * Obter qualificação pelo ID
 */
export function getQualificationById(id: string): { name: string; icon: string; category: string } {
  const qualification = QUALIFICATIONS_MAP[id];
  return qualification || { 
    name: `Qualificação ${id}`, 
    icon: '📋', 
    category: 'info' 
  };
}

/**
 * Obter agente pelo ID
 */
export function getAgentById(id: string): { name: string; initials: string; color: string } {
  const agent = AGENTS_MAP[id];
  return agent || { 
    name: `Agente ${id}`, 
    initials: 'AG', 
    color: 'bg-gray-500' 
  };
}

/**
 * Obter cor da categoria para UI
 */
export function getCategoryColor(category: string): string {
  switch (category) {
    case 'success': return 'text-green-600 bg-green-100';
    case 'warning': return 'text-yellow-600 bg-yellow-100';
    case 'danger': return 'text-red-600 bg-red-100';
    case 'info': return 'text-blue-600 bg-blue-100';
    default: return 'text-gray-600 bg-gray-100';
  }
}

/**
 * Obter lista de todos os agentes para dropdowns/filtros
 */
export function getAllAgents(): Array<{ id: string; name: string; initials: string }> {
  return Object.entries(AGENTS_MAP).map(([id, agent]) => ({
    id,
    name: agent.name,
    initials: agent.initials
  }));
}

/**
 * Obter lista de todas as qualificações para dropdowns/filtros
 */
export function getAllQualifications(): Array<{ id: string; name: string; category: string }> {
  return Object.entries(QUALIFICATIONS_MAP).map(([id, qual]) => ({
    id,
    name: qual.name,
    category: qual.category
  }));
}
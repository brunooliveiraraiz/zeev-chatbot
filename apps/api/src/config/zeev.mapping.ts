import type { CollectedData, User, Priority, Category } from '../models/types.js';

/**
 * Mapeia os dados coletados no chat para o formato esperado pela API do Zeev.
 * 
 * ⚠️ IMPORTANTE: Adapte esta função conforme a documentação real da API do Zeev.
 * 
 * Este arquivo contém TODOs claros onde você precisa ajustar:
 * - Estrutura do payload
 * - Nomes dos campos
 * - Formato de dados
 * - Headers/autenticação (já tratado em zeev.service.ts)
 * 
 * Referência esperada (exemplo genérico):
 * POST {ZEEV_BASE_URL}/processes/{processId}/instances
 * Body: { ... conforme estrutura abaixo ... }
 */
export function mapToZeevCreateInstance(
  payload: {
    requester: User;
    category: Category;
    priority: Priority;
    urgency?: string;
    description: string;
    channel: string;
    metadata?: Record<string, unknown>;
  }
): Record<string, unknown> {
  // TODO: Adaptar estrutura conforme documentação real do Zeev
  // TODO: Validar campos obrigatórios da API do Zeev
  // TODO: Mapear categorias/prioridades para valores esperados pelo Zeev (se diferente)
  
  return {
    // Estrutura base (ajuste conforme necessário)
    processId: payload.category, // TODO: Mapear category para processId real do Zeev
    
    // Dados do solicitante
    requester: {
      userId: payload.requester.userId,
      name: payload.requester.name || payload.requester.userId,
      email: payload.requester.email,
      // TODO: Verificar se Zeev aceita unit/coligada neste formato
      unit: payload.requester.unit,
      coligada: payload.requester.coligada,
    },
    
    // Dados do ticket
    title: generateTitle(payload.category, payload.description),
    description: payload.description,
    priority: mapPriorityToZeev(payload.priority), // TODO: Verificar valores aceitos
    urgency: payload.urgency,
    category: payload.category, // TODO: Verificar se category é campo separado
    
    // Metadados
    channel: payload.channel,
    metadata: {
      ...payload.metadata,
      source: 'zeev-chatbot',
      createdAt: new Date().toISOString(),
    },
    
    // TODO: Adicionar outros campos obrigatórios/opcionais conforme API do Zeev
    // Exemplos: status, assignedTo, tags, attachments, etc.
  };
}

/**
 * Gera título do ticket baseado na categoria e descrição.
 * TODO: Ajustar lógica conforme regras de negócio do Zeev.
 */
function generateTitle(category: Category, description: string): string {
  const categoryMap: Record<Category, string> = {
    TI: 'Suporte TI',
    Compras: 'Solicitação de Compra',
    Financeiro: 'Demanda Financeira',
    RH: 'Demanda RH',
    Outros: 'Solicitação',
  };
  
  const prefix = categoryMap[category] || 'Solicitação';
  const preview = description.substring(0, 50);
  
  return `${prefix}: ${preview}${description.length > 50 ? '...' : ''}`;
}

/**
 * Mapeia prioridade interna para formato esperado pelo Zeev.
 * TODO: Verificar valores exatos aceitos pela API do Zeev.
 */
function mapPriorityToZeev(priority: Priority): string {
  const mapping: Record<Priority, string> = {
    BAIXA: 'low', // TODO: Ajustar para valores reais
    MÉDIA: 'medium',
    ALTA: 'high',
  };
  
  return mapping[priority] || 'medium';
}

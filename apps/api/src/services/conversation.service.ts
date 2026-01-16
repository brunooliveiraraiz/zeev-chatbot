import type {
  ConversationState,
  CollectedData,
  User,
  ClassificationResult,
  Ticket,
} from '../models/types.js';
import { ClassifierService } from './classifier.service.js';
import { ZeevService } from './zeev.service.js';
import { logger } from '../utils/logger.js';

export class ConversationService {
  private classifier: ClassifierService;
  private zeevService: ZeevService;

  constructor() {
    this.classifier = new ClassifierService();
    this.zeevService = new ZeevService();
  }

  async processMessage(
    userMessage: string,
    currentState: ConversationState,
    collectedData: CollectedData | null,
    user: User
  ): Promise<{
    reply: string;
    newState: ConversationState;
    collectedData: CollectedData;
    ticket?: Ticket | null;
  }> {
    // Handle commands
    const command = this.detectCommand(userMessage);
    if (command) {
      return this.handleCommand(command, currentState, collectedData, user);
    }

    // Normal state machine flow
    switch (currentState) {
      case 'START':
        return this.handleStart(user);
      
      case 'ASK_PROBLEM':
        return this.handleAskProblem(userMessage, collectedData, user);
      
      case 'ASK_URGENCY':
        return this.handleAskUrgency(userMessage, collectedData, user);
      
      case 'ASK_DETAILS':
        return this.handleAskDetails(userMessage, collectedData, user);
      
      case 'CONFIRM':
        return this.handleConfirm(userMessage, collectedData, user);
      
      case 'CREATE_TICKET':
        return this.handleCreateTicket(collectedData, user);
      
      case 'DONE':
        return this.handleDone(collectedData);
      
      case 'CANCELLED':
        return this.handleCancelled();
      
      default:
        return this.handleStart(user);
    }
  }

  private detectCommand(message: string): string | null {
    const lower = message.toLowerCase().trim();
    
    if (lower.includes('cancelar') || lower.includes('cancel')) {
      return 'cancel';
    }
    if (lower.includes('reiniciar') || lower.includes('restart') || lower.includes('começar')) {
      return 'restart';
    }
    if (lower.includes('editar urgência') || lower.includes('edit urgency')) {
      return 'edit_urgency';
    }
    if (lower.includes('editar descrição') || lower.includes('edit description')) {
      return 'edit_description';
    }
    
    return null;
  }

  private async handleCommand(
    command: string,
    currentState: ConversationState,
    collectedData: CollectedData | null,
    user: User
  ): Promise<{
    reply: string;
    newState: ConversationState;
    collectedData: CollectedData;
    ticket?: Ticket | null;
  }> {
    switch (command) {
      case 'cancel':
        return {
          reply: 'Conversa cancelada. Se precisar de ajuda novamente, é só chamar!',
          newState: 'CANCELLED',
          collectedData: collectedData || this.initCollectedData(user),
          ticket: null,
        };
      
      case 'restart':
        return {
          reply: 'Vamos começar do zero! Como posso ajudar você hoje?',
          newState: 'ASK_PROBLEM',
          collectedData: this.initCollectedData(user),
          ticket: null,
        };
      
      case 'edit_urgency':
        return {
          reply: 'Qual é a urgência do problema?\n1 - Baixa\n2 - Média\n3 - Alta',
          newState: 'ASK_URGENCY',
          collectedData: collectedData || this.initCollectedData(user),
          ticket: null,
        };
      
      case 'edit_description':
        return {
          reply: 'Por favor, descreva o problema com mais detalhes:',
          newState: 'ASK_DETAILS',
          collectedData: collectedData || this.initCollectedData(user),
          ticket: null,
        };
      
      default:
        return this.handleStart(user);
    }
  }

  private async handleStart(user: User): Promise<{
    reply: string;
    newState: ConversationState;
    collectedData: CollectedData;
    ticket?: Ticket | null;
  }> {
    return {
      reply: `Olá${user.name ? `, ${user.name}` : ''}! Como posso ajudar você hoje? Descreva brevemente o problema ou solicitação.`,
      newState: 'ASK_PROBLEM',
      collectedData: this.initCollectedData(user),
      ticket: null,
    };
  }

  private async handleAskProblem(
    message: string,
    collectedData: CollectedData | null,
    user: User
  ): Promise<{
    reply: string;
    newState: ConversationState;
    collectedData: CollectedData;
    ticket?: Ticket | null;
  }> {
    const data = collectedData || this.initCollectedData(user);
    
    // Classify the problem
    const classification = await this.classifier.classify(message);
    
    data.category = classification.category;
    data.priority = classification.priority;
    data.description = message; // Initial description
    
    return {
      reply: 'Qual é a urgência do problema?\n1 - Baixa (pode esperar alguns dias)\n2 - Média (precisa de atenção em breve)\n3 - Alta (urgente, precisa de atenção imediata)',
      newState: 'ASK_URGENCY',
      collectedData: data,
      ticket: null,
    };
  }

  private async handleAskUrgency(
    message: string,
    collectedData: CollectedData | null,
    user: User
  ): Promise<{
    reply: string;
    newState: ConversationState;
    collectedData: CollectedData;
    ticket?: Ticket | null;
  }> {
    const data = collectedData || this.initCollectedData(user);
    
    // Parse urgency
    const urgencyMap: Record<string, string> = {
      '1': 'Baixa',
      '2': 'Média',
      '3': 'Alta',
      'baixa': 'Baixa',
      'média': 'Média',
      'media': 'Média',
      'alta': 'Alta',
    };
    
    const lower = message.trim().toLowerCase();
    data.urgency = urgencyMap[lower] || urgencyMap[message.trim()] || 'Média';
    
    // Update priority based on urgency if needed
    if (data.urgency === 'Alta') {
      data.priority = 'ALTA';
    } else if (data.urgency === 'Baixa') {
      data.priority = 'BAIXA';
    }
    
    return {
      reply: 'Por favor, descreva o problema com mais detalhes para que possamos ajudar melhor:',
      newState: 'ASK_DETAILS',
      collectedData: data,
      ticket: null,
    };
  }

  private async handleAskDetails(
    message: string,
    collectedData: CollectedData | null,
    user: User
  ): Promise<{
    reply: string;
    newState: ConversationState;
    collectedData: CollectedData;
    ticket?: Ticket | null;
  }> {
    const data = collectedData || this.initCollectedData(user);
    data.description = message;
    
    // Build confirmation summary
    const summary = this.buildSummary(data);
    
    return {
      reply: `Por favor, confirme as informações:\n\n${summary}\n\nDigite "confirmar" para criar o ticket ou "editar" para modificar algo.`,
      newState: 'CONFIRM',
      collectedData: data,
      ticket: null,
    };
  }

  private async handleConfirm(
    message: string,
    collectedData: CollectedData | null,
    user: User
  ): Promise<{
    reply: string;
    newState: ConversationState;
    collectedData: CollectedData;
    ticket?: Ticket | null;
  }> {
    const data = collectedData || this.initCollectedData(user);
    const lower = message.toLowerCase().trim();
    
    if (lower.includes('confirmar') || lower.includes('confirm') || lower === 'sim' || lower === 's') {
      return {
        reply: 'Criando o ticket...',
        newState: 'CREATE_TICKET',
        collectedData: data,
        ticket: null,
      };
    }
    
    if (lower.includes('editar') || lower.includes('edit')) {
      return {
        reply: 'O que você gostaria de editar?\n- "editar urgência"\n- "editar descrição"\n- "reiniciar"',
        newState: 'CONFIRM',
        collectedData: data,
        ticket: null,
      };
    }
    
    // Default: treat as confirmation
    return {
      reply: 'Criando o ticket...',
      newState: 'CREATE_TICKET',
      collectedData: data,
      ticket: null,
    };
  }

  private async handleCreateTicket(
    collectedData: CollectedData | null,
    user: User
  ): Promise<{
    reply: string;
    newState: ConversationState;
    collectedData: CollectedData;
    ticket?: Ticket | null;
  }> {
    const data = collectedData || this.initCollectedData(user);
    
    if (!data.category || !data.priority || !data.description) {
      return {
        reply: 'Erro: dados incompletos. Vamos reiniciar?',
        newState: 'START',
        collectedData: this.initCollectedData(user),
        ticket: null,
      };
    }
    
    try {
      const ticket = await this.zeevService.createTicket({
        requester: user,
        category: data.category as any,
        priority: data.priority,
        urgency: data.urgency,
        description: data.description,
        channel: 'zeev-portal',
        metadata: {},
      });
      
      const protocol = ticket.protocol || ticket.id || 'N/A';
      
      return {
        reply: `✅ Ticket criado com sucesso!\n\n📋 Protocolo: ${protocol}\n\nO ticket foi registrado e será atendido pela equipe responsável.`,
        newState: 'DONE',
        collectedData: data,
        ticket,
      };
    } catch (error) {
      logger.error('Error creating ticket', error);
      return {
        reply: '❌ Erro ao criar o ticket. Por favor, tente novamente ou entre em contato com o suporte.',
        newState: 'CONFIRM',
        collectedData: data,
        ticket: null,
      };
    }
  }

  private handleDone(collectedData: CollectedData | null): {
    reply: string;
    newState: ConversationState;
    collectedData: CollectedData;
    ticket?: Ticket | null;
  } {
    return {
      reply: 'Ticket já foi criado. Se precisar de mais ajuda, digite "reiniciar" para começar uma nova solicitação.',
      newState: 'DONE',
      collectedData: collectedData || this.initCollectedData({ userId: 'unknown' }),
      ticket: null,
    };
  }

  private handleCancelled(): {
    reply: string;
    newState: ConversationState;
    collectedData: CollectedData;
    ticket?: Ticket | null;
  } {
    return {
      reply: 'Conversa cancelada.',
      newState: 'CANCELLED',
      collectedData: this.initCollectedData({ userId: 'unknown' }),
      ticket: null,
    };
  }

  private buildSummary(data: CollectedData): string {
    const parts: string[] = [];
    
    parts.push(`📌 Categoria: ${data.category || 'Não especificada'}`);
    parts.push(`⚡ Prioridade: ${data.priority || 'Não especificada'}`);
    parts.push(`🚨 Urgência: ${data.urgency || 'Não especificada'}`);
    parts.push(`📝 Descrição: ${data.description || 'Não especificada'}`);
    
    return parts.join('\n');
  }

  private initCollectedData(user: User): CollectedData {
    return {
      name: user.name,
      email: user.email,
      unit: user.unit,
      coligada: user.coligada,
    };
  }
}

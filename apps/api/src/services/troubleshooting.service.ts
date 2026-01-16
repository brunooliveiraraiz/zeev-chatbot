import { KNOWLEDGE_BASE, type KnowledgeItem } from '../catalog/knowledge-base.js';
import { logger } from '../utils/logger.js';

export type TroubleshootingMessage = {
  role: 'user' | 'bot';
  text: string;
  timestamp: Date;
};

export type TroubleshootingSession = {
  sessionId: string;
  category?: 'ti_infraestrutura' | 'ti_sistemas' | 'ti_bi' | 'ti_ticket_raiz';
  knowledgeItemId?: string;
  currentStep: number;
  attemptCount: number;
  messages: TroubleshootingMessage[];
  solved: boolean;
  createdAt: Date;
  lastActivity: Date;
};

// Armazenamento em memória das sessões (em produção, usar Redis ou BD)
const sessions = new Map<string, TroubleshootingSession>();

// Limpar sessões antigas (mais de 1 hora inativas)
setInterval(() => {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  for (const [sessionId, session] of sessions.entries()) {
    if (session.lastActivity < oneHourAgo) {
      sessions.delete(sessionId);
      logger.info(`Troubleshooting session expired: ${sessionId}`);
    }
  }
}, 10 * 60 * 1000); // Roda a cada 10 minutos

export class TroubleshootingService {
  private readonly MAX_ATTEMPTS = 10;

  getOrCreateSession(sessionId: string): TroubleshootingSession {
    let session = sessions.get(sessionId);

    if (!session) {
      session = {
        sessionId,
        currentStep: 0,
        attemptCount: 0,
        messages: [],
        solved: false,
        createdAt: new Date(),
        lastActivity: new Date(),
      };
      sessions.set(sessionId, session);
      logger.info(`New troubleshooting session created: ${sessionId}`);
    } else {
      session.lastActivity = new Date();
    }

    return session;
  }

  addMessage(sessionId: string, role: 'user' | 'bot', text: string): void {
    const session = this.getOrCreateSession(sessionId);
    session.messages.push({
      role,
      text,
      timestamp: new Date(),
    });
    session.lastActivity = new Date();
  }

  findRelevantKnowledge(userMessage: string, category?: string): KnowledgeItem | null {
    const result = this.findRelevantKnowledgeWithScore(userMessage, category);
    return result ? result.knowledge : null;
  }

  findRelevantKnowledgeWithScore(userMessage: string, category?: string): { knowledge: KnowledgeItem; score: number } | null {
    const normalizedMessage = userMessage.toLowerCase();
    const tokens = normalizedMessage.split(/\s+/);

    let candidates = KNOWLEDGE_BASE;

    // Filtrar por categoria se especificada
    if (category) {
      candidates = candidates.filter((item) => item.category === category);
    }

    // Calcular score baseado em keywords
    const scored = candidates.map((item) => {
      let score = 0;
      for (const keyword of item.keywords) {
        const keywordTokens = keyword.toLowerCase().split(/\s+/);
        const allMatch = keywordTokens.every((kt) => tokens.includes(kt));
        if (allMatch) {
          score += keywordTokens.length * 2; // Match exato vale mais
        } else {
          for (const kt of keywordTokens) {
            if (tokens.includes(kt)) {
              score += 1;
            }
          }
        }
      }
      return { knowledge: item, score };
    });

    // Ordenar por score
    scored.sort((a, b) => b.score - a.score);

    // Retornar o melhor match se tiver score > 0
    if (scored.length > 0 && scored[0].score > 0) {
      return scored[0];
    }

    return null;
  }

  processMessage(sessionId: string, userMessage: string, category?: string): {
    response: string;
    shouldEscalate: boolean;
    solved: boolean;
  } {
    const session = this.getOrCreateSession(sessionId);

    // Adicionar mensagem do usuário
    this.addMessage(sessionId, 'user', userMessage);

    // Incrementar contador de tentativas
    session.attemptCount++;

    // Se já atingiu o máximo de tentativas, escalar
    if (session.attemptCount >= this.MAX_ATTEMPTS) {
      const response = 'Entendo que já tentamos várias coisas. Para resolver isso de forma mais eficaz, vou te direcionar para nossa equipe especializada fazer um atendimento mais detalhado.';
      this.addMessage(sessionId, 'bot', response);
      return {
        response,
        shouldEscalate: true,
        solved: false,
      };
    }

    // Se ainda não tem knowledge item, buscar um relevante
    if (!session.knowledgeItemId) {
      const result = this.findRelevantKnowledgeWithScore(userMessage, category);

      // Só inicia troubleshooting se tiver um match MUITO BOM (score >= 3)
      // Isso evita falsos positivos e troubleshooting inadequado
      if (result && result.score >= 3) {
        session.knowledgeItemId = result.knowledge.id;
        session.category = result.knowledge.category;
        session.currentStep = 0;

        // Fazer a primeira pergunta do troubleshooting
        const firstQuestion = result.knowledge.troubleshooting[0].question;
        this.addMessage(sessionId, 'bot', firstQuestion);

        logger.info(`Troubleshooting started: ${result.knowledge.id} (score: ${result.score})`);

        return {
          response: firstQuestion,
          shouldEscalate: false,
          solved: false,
        };
      } else {
        // Não encontrou troubleshooting específico, escalar direto para formulário
        logger.info(`No specific troubleshooting found, escalating directly (score: ${result?.score || 0})`);

        return {
          response: '', // Vazio para não mostrar mensagem extra
          shouldEscalate: true,
          solved: false,
        };
      }
    }

    // Continuar com o troubleshooting existente
    const knowledge = KNOWLEDGE_BASE.find((k) => k.id === session.knowledgeItemId);

    if (!knowledge) {
      return {
        response: 'Ops, perdi o contexto. Vou te direcionar para nossa equipe.',
        shouldEscalate: true,
        solved: false,
      };
    }

    const currentTroubleshootingStep = knowledge.troubleshooting[session.currentStep];

    if (!currentTroubleshootingStep) {
      // Acabaram as perguntas, escalar
      const response = 'Já tentamos as principais soluções. Vou te direcionar para nossa equipe fazer uma análise mais profunda.';
      this.addMessage(sessionId, 'bot', response);
      return {
        response,
        shouldEscalate: true,
        solved: false,
      };
    }

    // Processar resposta do usuário
    const userResponseNormalized = userMessage.toLowerCase().trim();

    // Buscar nextStep apropriado - priorizar match mais específico
    let selectedNextStep = currentTroubleshootingStep.nextSteps[0]; // default

    // Normalizar resposta removendo acentos e negações
    const normalizeAnswer = (text: string) => {
      return text
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .trim();
    };

    const userNormalized = normalizeAnswer(userResponseNormalized);

    // Detectar negação
    const hasNegation = /\b(nao|não|n|nunca|jamais)\b/.test(userNormalized);

    for (const nextStep of currentTroubleshootingStep.nextSteps) {
      if (nextStep.answer) {
        const answerNormalized = normalizeAnswer(nextStep.answer);

        // Se a resposta esperada é "sim" mas usuário negou, pular
        if (answerNormalized === 'sim' && hasNegation) {
          continue;
        }

        // Se a resposta esperada é "não" e usuário confirmou negação
        if (answerNormalized === 'nao' || answerNormalized === 'não') {
          if (hasNegation) {
            selectedNextStep = nextStep;
            break;
          }
        } else if (userNormalized.includes(answerNormalized)) {
          selectedNextStep = nextStep;
          break;
        }
      }
    }

    // Se marcou como resolvido, finalizar
    if (selectedNextStep.solved) {
      session.solved = true;
      this.addMessage(sessionId, 'bot', selectedNextStep.response);
      return {
        response: selectedNextStep.response,
        shouldEscalate: false,
        solved: true,
      };
    }

    // Avançar para próximo step
    session.currentStep++;

    // Enviar resposta
    this.addMessage(sessionId, 'bot', selectedNextStep.response);

    // Verificar se tem próxima pergunta
    const nextTroubleshootingStep = knowledge.troubleshooting[session.currentStep];

    if (nextTroubleshootingStep) {
      // Ainda tem mais perguntas
      return {
        response: selectedNextStep.response,
        shouldEscalate: false,
        solved: false,
      };
    } else {
      // Acabaram as perguntas, mas não resolveu
      const escalateMsg = '\n\nVou te direcionar para nossa equipe que pode te ajudar melhor com isso.';
      this.addMessage(sessionId, 'bot', escalateMsg);
      return {
        response: selectedNextStep.response + escalateMsg,
        shouldEscalate: true,
        solved: false,
      };
    }
  }

  resetSession(sessionId: string): void {
    sessions.delete(sessionId);
    logger.info(`Troubleshooting session reset: ${sessionId}`);
  }

  getSession(sessionId: string): TroubleshootingSession | undefined {
    return sessions.get(sessionId);
  }
}

import Anthropic from '@anthropic-ai/sdk';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';
import type { KnowledgeItem } from '../catalog/knowledge-base.js';

type ConversationMessage = {
  role: 'user' | 'assistant';
  content: string;
};

export class AITroubleshootingService {
  private client: Anthropic | null = null;
  private conversationHistories = new Map<string, ConversationMessage[]>();

  constructor() {
    if (env.AI_TROUBLESHOOTING_ENABLED && env.ANTHROPIC_API_KEY) {
      this.client = new Anthropic({
        apiKey: env.ANTHROPIC_API_KEY,
      });
      logger.info('AI Troubleshooting Service initialized with Claude API');
    } else {
      logger.info('AI Troubleshooting Service disabled (no API key or disabled in config)');
    }
  }

  isEnabled(): boolean {
    return this.client !== null && env.AI_TROUBLESHOOTING_ENABLED;
  }

  /**
   * Gera resposta de troubleshooting usando IA
   */
  async generateTroubleshootingResponse(
    sessionId: string,
    userMessage: string,
    knowledge: KnowledgeItem,
    attemptCount: number
  ): Promise<{
    response: string;
    shouldEscalate: boolean;
    solved: boolean;
  }> {
    if (!this.client) {
      throw new Error('AI Troubleshooting not enabled');
    }

    try {
      // Obter ou criar histórico de conversa
      let history = this.conversationHistories.get(sessionId);
      if (!history) {
        history = [];
        this.conversationHistories.set(sessionId, history);
      }

      // Adicionar mensagem do usuário ao histórico
      history.push({
        role: 'user',
        content: userMessage,
      });

      // Construir prompt do sistema
      const systemPrompt = this.buildSystemPrompt(knowledge, attemptCount);

      // Converter histórico para formato da API
      const messages: Anthropic.MessageParam[] = history.map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

      // Chamar API do Claude
      const response = await this.client.messages.create({
        model: 'claude-3-haiku-20240307',
        max_tokens: 1024,
        system: systemPrompt,
        messages,
      });

      // Extrair resposta
      const assistantMessage = response.content[0];
      if (assistantMessage.type !== 'text') {
        throw new Error('Unexpected response type from Claude API');
      }

      const aiResponse = assistantMessage.text;

      // Adicionar resposta ao histórico
      history.push({
        role: 'assistant',
        content: aiResponse,
      });

      // Analisar se deve escalar ou se foi resolvido
      const analysis = this.analyzeResponse(aiResponse, attemptCount);

      logger.info(`AI troubleshooting response generated for session ${sessionId} (attempt ${attemptCount})`);

      return {
        response: aiResponse,
        shouldEscalate: analysis.shouldEscalate,
        solved: analysis.solved,
      };
    } catch (error) {
      logger.error('Error generating AI troubleshooting response:', error);
      throw error;
    }
  }

  /**
   * Constrói o prompt do sistema para guiar a IA
   */
  private buildSystemPrompt(knowledge: KnowledgeItem, attemptCount: number): string {
    const maxAttempts = 10;
    const remainingAttempts = maxAttempts - attemptCount;

    return `Você é um assistente de suporte técnico especializado em ajudar usuários com problemas relacionados a: ${knowledge.id}.

**Seu objetivo:** Ajudar o usuário a resolver o problema através de perguntas diagnósticas e soluções passo a passo.

**Contexto do problema:**
- Categoria: ${knowledge.category}
- Keywords relacionadas: ${knowledge.keywords.join(', ')}

**Diretrizes importantes:**

1. **Tom e Linguagem:**
   - Seja amigável, empático e profissional
   - Use linguagem clara e acessível (português brasileiro)
   - Evite jargões técnicos desnecessários
   - Seja direto mas cordial

2. **Processo de Troubleshooting:**
   - Faça UMA pergunta ou forneça UMA solução por vez
   - Seja específico e actionable (perguntas que levam a ações concretas)
   - Baseie suas próximas perguntas nas respostas anteriores
   - Priorize soluções mais simples antes das complexas

3. **Quando considerar RESOLVIDO:**
   - Se o usuário confirmar explicitamente que o problema foi resolvido
   - Se o usuário indicar que está funcionando agora
   - Responda com uma mensagem de confirmação positiva
   - **IMPORTANTE:** Inclua a frase exata "PROBLEMA_RESOLVIDO" no final da sua resposta (após a mensagem ao usuário)

4. **Quando ESCALAR para atendimento especializado:**
   - Se já tentou ${maxAttempts} soluções sem sucesso
   - Se o problema requer acesso administrativo ou ferramentas especializadas
   - Se o usuário pede explicitamente para falar com um atendente
   - **IMPORTANTE:** Inclua a frase exata "ESCALAR_ATENDIMENTO" no final da sua resposta (após a mensagem ao usuário)

5. **Situação atual:**
   - Tentativa: ${attemptCount} de ${maxAttempts}
   - Tentativas restantes: ${remainingAttempts}
   ${attemptCount >= 7 ? '- **ATENÇÃO:** Poucas tentativas restantes. Se não resolver em breve, prepare para escalar.' : ''}

**Formato de resposta:**
- Forneça sua resposta normalmente ao usuário
- No final, adicione PROBLEMA_RESOLVIDO (se resolvido) OU ESCALAR_ATENDIMENTO (se deve escalar)
- Não inclua essas frases no meio da conversa, apenas no final como marcador

**Exemplo de respostas:**

Usuário: "Meu computador não liga"
Você: "Entendo, vamos resolver isso juntos. Primeiro, me diz: quando você aperta o botão de ligar, acontece alguma coisa? Tipo, acende alguma luzinha, faz algum barulho, ou nada acontece?"

Usuário: "Nada acontece"
Você: "Ok, vamos verificar a energia. O cabo de energia está bem conectado tanto no computador quanto na tomada? Você pode verificar se está firme nas duas pontas?"

Usuário: "Sim, está conectado"
Você: "Perfeito. Agora tenta o seguinte: desconecta o cabo da tomada, espera uns 10 segundos, e conecta de novo. Depois tenta ligar. Funciona agora?"

Usuário: "Funcionou! Obrigado!"
Você: "Que ótimo! Fico feliz que resolveu. Se precisar de mais alguma coisa, é só chamar! PROBLEMA_RESOLVIDO"`;
  }

  /**
   * Analisa a resposta da IA para determinar se deve escalar ou se foi resolvido
   */
  private analyzeResponse(
    aiResponse: string,
    attemptCount: number
  ): {
    shouldEscalate: boolean;
    solved: boolean;
  } {
    const maxAttempts = 10;

    // Verificar marcadores na resposta
    const hasSolvedMarker = aiResponse.includes('PROBLEMA_RESOLVIDO');
    const hasEscalateMarker = aiResponse.includes('ESCALAR_ATENDIMENTO');

    // Se atingiu máximo de tentativas, sempre escalar
    if (attemptCount >= maxAttempts) {
      return { shouldEscalate: true, solved: false };
    }

    // Se tem marcador de resolvido
    if (hasSolvedMarker) {
      return { shouldEscalate: false, solved: true };
    }

    // Se tem marcador de escalar
    if (hasEscalateMarker) {
      return { shouldEscalate: true, solved: false };
    }

    // Continuar troubleshooting
    return { shouldEscalate: false, solved: false };
  }

  /**
   * Remove o marcador da resposta antes de enviar ao usuário
   */
  cleanResponse(response: string): string {
    return response
      .replace(/PROBLEMA_RESOLVIDO/g, '')
      .replace(/ESCALAR_ATENDIMENTO/g, '')
      .trim();
  }

  /**
   * Limpa o histórico de uma sessão
   */
  clearHistory(sessionId: string): void {
    this.conversationHistories.delete(sessionId);
    logger.info(`AI conversation history cleared for session ${sessionId}`);
  }

  /**
   * Limpa históricos antigos (mais de 1 hora)
   */
  cleanupOldHistories(): void {
    // Por enquanto, limpar tudo que não está sendo usado
    // Em produção, adicionar timestamps para limpeza seletiva
    const currentSize = this.conversationHistories.size;
    if (currentSize > 100) {
      // Se tiver muitas sessões, limpar as mais antigas
      const entries = Array.from(this.conversationHistories.entries());
      const toKeep = entries.slice(-50); // Manter últimas 50
      this.conversationHistories.clear();
      toKeep.forEach(([id, history]) => {
        this.conversationHistories.set(id, history);
      });
      logger.info(`Cleaned up old AI conversation histories: ${currentSize} -> ${this.conversationHistories.size}`);
    }
  }
}

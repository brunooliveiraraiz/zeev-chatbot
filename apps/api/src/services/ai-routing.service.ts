import Anthropic from '@anthropic-ai/sdk';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';
import { REQUESTS_CATALOG, type ZeevRequestCatalogItem } from '../catalog/requests.js';
import { AnalyticsService } from './analytics.service.js';
import { AI_MODELS } from '../config/ai-models.js';
import * as fs from 'fs';
import * as path from 'path';

type ConversationMessage = {
  role: 'user' | 'assistant';
  content: string;
};

type RoutingSession = {
  attemptCount: number;
  history: ConversationMessage[];
  lastActivity: Date;
};

export class AIRoutingService {
  private client: Anthropic | null = null;
  private sessions = new Map<string, RoutingSession>();
  private manualContent: string = '';
  private catalogContext: string = '';
  private analyticsService: AnalyticsService;

  constructor() {
    this.analyticsService = new AnalyticsService();

    if (env.AI_TROUBLESHOOTING_ENABLED && env.ANTHROPIC_API_KEY) {
      this.client = new Anthropic({
        apiKey: env.ANTHROPIC_API_KEY,
      });
      this.loadManual();
      this.buildCatalogContext();
      logger.info('AI Routing Service initialized with Claude API and knowledge base');

      // Limpar sessões antigas a cada 10 minutos
      setInterval(() => {
        this.cleanupOldHistories();
      }, 10 * 60 * 1000);
    } else {
      logger.info('AI Routing Service disabled (no API key or disabled in config)');
    }
  }

  isEnabled(): boolean {
    return this.client !== null && env.AI_TROUBLESHOOTING_ENABLED;
  }

  /**
   * Carrega o manual de 19 mil chamados
   */
  private loadManual(): void {
    try {
      const manualParts: string[] = [];
      const manualDir = path.join(process.cwd(), '..', '..', 'docs', 'knowledge-base');

      // Carregar todas as partes do manual
      for (let i = 1; i <= 7; i++) {
        const filePath = path.join(manualDir, `manual-ia-parte${i}.txt`);
        if (fs.existsSync(filePath)) {
          const content = fs.readFileSync(filePath, 'utf-8');
          manualParts.push(content);
          logger.info(`Loaded manual part ${i}`);
        }
      }

      this.manualContent = manualParts.join('\n\n');
      logger.info(`Manual loaded successfully: ${this.manualContent.length} characters`);
    } catch (error) {
      logger.error('Error loading manual:', error);
      this.manualContent = '';
    }
  }

  /**
   * Constrói contexto do catálogo de solicitações
   */
  private buildCatalogContext(): void {
    const catalogInfo = REQUESTS_CATALOG.map((item, index) => {
      return `
${index + 1}. ID: ${item.id}
   Nome: ${item.name}
   Área: ${item.area}
   Descrição: ${item.description}
   Tags: ${item.tags.slice(0, 10).join(', ')}
   Exemplos: ${item.examples.slice(0, 3).join(' | ')}
`;
    }).join('\n');

    this.catalogContext = `
# CATÁLOGO COMPLETO DE SOLICITAÇÕES ZEEV (${REQUESTS_CATALOG.length} tipos)

${catalogInfo}
`;
    logger.info('Catalog context built successfully');
  }

  /**
   * Processa mensagem do usuário e identifica a solicitação correta
   */
  async processMessage(
    sessionId: string,
    userMessage: string
  ): Promise<{
    response: string;
    shouldEscalate: boolean;
    solved: boolean;
    identifiedRequestId?: string;
  }> {
    if (!this.client) {
      throw new Error('AI Routing not enabled');
    }

    try {
      // Obter ou criar sessão
      let session = this.sessions.get(sessionId);
      if (!session) {
        session = {
          attemptCount: 0,
          history: [],
          lastActivity: new Date(),
        };
        this.sessions.set(sessionId, session);
      }

      // Incrementar tentativas
      session.attemptCount++;
      session.lastActivity = new Date();

      // Adicionar mensagem do usuário ao histórico
      session.history.push({
        role: 'user',
        content: userMessage,
      });

      // Construir prompt do sistema
      const systemPrompt = this.buildSystemPrompt(session.attemptCount);

      // Converter histórico para formato da API
      const messages: Anthropic.MessageParam[] = session.history.map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

      logger.info(`AI routing request for session ${sessionId} (attempt ${session.attemptCount}/10)`);

      // Chamar API do Claude
      const response = await this.client.messages.create({
        model: AI_MODELS.ROUTING,
        max_tokens: 2048,
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
      session.history.push({
        role: 'assistant',
        content: aiResponse,
      });

      // Analisar a resposta da IA
      const analysis = this.analyzeResponse(aiResponse);

      logger.info(`AI routing response generated for session ${sessionId}: shouldEscalate=${analysis.shouldEscalate}, solved=${analysis.solved}, requestId=${analysis.identifiedRequestId}`);

      // Registrar resolução no analytics se problema foi resolvido
      if (analysis.solved) {
        await this.analyticsService.recordResolution({
          sessionId,
          resolved: true,
          resolvedBy: 'ai_routing',
          requestId: analysis.identifiedRequestId,
        });
      }

      return {
        response: this.cleanResponse(aiResponse),
        shouldEscalate: analysis.shouldEscalate,
        solved: analysis.solved,
        identifiedRequestId: analysis.identifiedRequestId,
      };
    } catch (error) {
      logger.error('Error in AI routing:', error);
      throw error;
    }
  }

  /**
   * Processa um cumprimento do usuário e responde de forma natural
   */
  async processGreeting(userMessage: string): Promise<string> {
    if (!this.client) {
      throw new Error('AI Routing not enabled');
    }

    try {
      const systemPrompt = `Você é o assistente virtual da Raiz, um chatbot amigável e profissional chamado Zeev Chat.

**CONTEXTO:**
Você é o primeiro contato do usuário e ele acabou de te cumprimentar. Seu papel é:
1. Responder ao cumprimento de forma cordial e natural
2. Se apresentar brevemente como assistente de solicitações da Raiz
3. Perguntar como pode ajudar de forma amigável

**INSTRUÇÕES:**
- Responda ao cumprimento do usuário de forma correspondente (se ele disse "bom dia", responda "Bom dia!")
- Seja breve e direto (máximo 2-3 frases)
- Tom profissional mas amigável
- NÃO use emojis
- NÃO seja robótico ou formal demais
- Encoraje o usuário a descrever sua necessidade

**EXEMPLOS:**

Usuário: "olá"
Assistente: "Olá! Sou o assistente de solicitações da Raiz. Como posso te ajudar hoje?"

Usuário: "bom dia zeev"
Assistente: "Bom dia! Estou aqui para te ajudar com suas solicitações. O que você precisa?"

Usuário: "oi, tudo bem?"
Assistente: "Oi! Tudo bem sim, obrigado! Sou o Zeev Chat, assistente da Raiz. No que posso te ajudar?"`;

      // Chamar API do Claude
      const response = await this.client.messages.create({
        model: AI_MODELS.ROUTING,
        max_tokens: 256,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: userMessage,
          },
        ],
      });

      // Extrair resposta
      const assistantMessage = response.content[0];
      if (assistantMessage.type !== 'text') {
        throw new Error('Unexpected response type from Claude API');
      }

      logger.info(`AI greeting response generated successfully`);

      return assistantMessage.text.trim();
    } catch (error) {
      logger.error('Error in AI greeting response:', error);
      throw error;
    }
  }

  /**
   * MÉTODO PRINCIPAL - Processa qualquer mensagem do usuário (IA-First)
   *
   * Este é o ponto central de roteamento que usa IA para tomar TODAS as decisões:
   * - Detectar cumprimentos e responder cordialmente
   * - Iniciar troubleshooting quando apropriado
   * - Direcionar para formulários quando necessário
   * - Manter contexto da conversa
   */
  async routeMessage(
    sessionId: string,
    userMessage: string,
    stage: 'hml' | 'prod' = 'prod'
  ): Promise<{
    type: 'greeting' | 'troubleshooting' | 'direct_link' | 'clarify' | 'solved';
    text: string;
    link?: { label: string; url: string };
    requestId?: string;
  }> {
    if (!this.client) {
      throw new Error('AI Routing not enabled');
    }

    try {
      // Obter ou criar sessão
      let session = this.sessions.get(sessionId);
      if (!session) {
        session = {
          attemptCount: 0,
          history: [],
          lastActivity: new Date(),
        };
        this.sessions.set(sessionId, session);
        logger.info(`New AI routing session created: ${sessionId}`);
      }

      // Incrementar tentativas
      session.attemptCount++;
      session.lastActivity = new Date();

      // Adicionar mensagem do usuário ao histórico
      session.history.push({
        role: 'user',
        content: userMessage,
      });

      // Construir prompt do sistema para roteamento inteligente
      const systemPrompt = this.buildUnifiedSystemPrompt(session.attemptCount, stage);

      // Converter histórico para formato da API
      const messages: Anthropic.MessageParam[] = session.history.map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

      logger.info(`AI routing request for session ${sessionId} (attempt ${session.attemptCount})`);

      // Chamar API do Claude
      const response = await this.client.messages.create({
        model: AI_MODELS.ROUTING,
        max_tokens: 2048,
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
      session.history.push({
        role: 'assistant',
        content: aiResponse,
      });

      // Analisar a resposta da IA para extrair ação
      const analysis = this.analyzeUnifiedResponse(aiResponse, stage);

      logger.info(`AI routing response for session ${sessionId}: type=${analysis.type}, requestId=${analysis.requestId || 'none'}`);

      // Registrar analytics se problema foi resolvido
      if (analysis.type === 'solved') {
        await this.analyticsService.recordResolution({
          sessionId,
          resolved: true,
          resolvedBy: 'ai_routing',
          requestId: analysis.requestId,
        });
      }

      return analysis;
    } catch (error) {
      logger.error('Error in AI unified routing:', error);
      throw error;
    }
  }

  /**
   * Constrói o prompt unificado do sistema (IA-First)
   */
  private buildUnifiedSystemPrompt(attemptCount: number, stage: 'hml' | 'prod'): string {
    return `Você é o assistente virtual Zeev da Raiz, responsável por TODO o atendimento ao usuário.

**SUA MISSÃO:**
Ajudar o usuário da forma mais eficiente possível, seja:
1. Respondendo cumprimentos cordialmente
2. Resolvendo problemas técnicos através de troubleshooting
3. Direcionando para o formulário correto quando necessário

${this.catalogContext}

**BASE DE CONHECIMENTO:**
Você tem acesso a um manual com 19.907 chamados reais resolvidos. Use esse conhecimento para troubleshooting.

═══════════════════════════════════════════════════════════════

**PROCESSO DE ATENDIMENTO:**

**1. CUMPRIMENTOS (Primeira mensagem)**
Se o usuário está apenas cumprimentando (oi, olá, bom dia, etc.):
- Responda cordialmente e se apresente
- Pergunte como pode ajudar
- NÃO adicione marcadores
- Exemplo: "Olá! Sou o assistente Zeev da Raiz. Como posso te ajudar?"

**2. SOLICITAÇÕES CLARAS (Usuário sabe o que quer)**
Quando o usuário descreve UMA necessidade clara:
- "preciso criar um plano de pagamento"
- "quero cadastrar um fornecedor"
- "abrir solicitação de TI"
- "meu computador não funciona"

→ DIRECIONE IMEDIATAMENTE para o formulário mais adequado
→ Use: \`DIRECIONAR:request_id\`
→ Explique brevemente o que será feito no formulário

**3. TROUBLESHOOTING (Problemas técnicos com possível solução rápida)**
Se é um problema técnico E você pode ajudar a resolver:
- Faça perguntas específicas (UMA por vez)
- Dê instruções claras passo a passo
- Se o problema for resolvido, confirme com: \`PROBLEMA_RESOLVIDO\`
- Se não conseguir resolver após algumas tentativas, DIRECIONE

**4. CLARIFICAÇÃO (Não está claro o que o usuário quer)**
Se a mensagem é vaga ou ambígua:
- Faça perguntas para entender melhor
- Dê exemplos de solicitações comuns
- NÃO adicione marcadores

═══════════════════════════════════════════════════════════════

**DIRETRIZES IMPORTANTES:**

✅ **Seja direto e eficiente**
- Se o usuário sabe o que quer, direcione imediatamente
- Não prolongue troubleshooting desnecessariamente

✅ **Mantenha contexto**
- Lembre-se das mensagens anteriores
- Se usuário diz "esqueci a senha" durante troubleshooting de email, entenda o contexto

✅ **Troubleshooting inteligente**
- UMA pergunta/orientação por vez
- Se perceber que precisa de acesso administrativo → DIRECIONE
- Máximo 3-4 tentativas de troubleshooting

✅ **Direcionamento correto**
- Use o ID EXATO do catálogo acima
- Explique brevemente o que acontecerá
- Exemplo: "Vou te direcionar para o formulário de TI onde você pode descrever o problema detalhadamente. DIRECIONAR:transformacao_infraestrutura"

❌ **Evite**
- Prolongar troubleshooting quando não há solução óbvia
- Fazer múltiplas perguntas de uma vez
- Inventar IDs de formulário
- Dizer "não posso ajudar" - sempre direcione para algo

═══════════════════════════════════════════════════════════════

**MARCADORES DE AÇÃO:**

\`DIRECIONAR:request_id\` - Direciona para formulário (você DEVE incluir o ID correto)
\`PROBLEMA_RESOLVIDO\` - Confirma que o problema foi resolvido
(Sem marcador) - Continua a conversa normalmente

═══════════════════════════════════════════════════════════════

**SITUAÇÃO ATUAL:**
- Tentativa: ${attemptCount}
- Ambiente: ${stage}
${attemptCount === 1 ? '\n🟢 PRIMEIRA MENSAGEM - Se é uma solicitação clara, direcione já!' : ''}
${attemptCount >= 4 ? '\n⚠️ Muitas tentativas - Se não resolveu, DIRECIONE AGORA' : ''}

**EXEMPLOS PRÁTICOS:**

📝 Usuário: "olá"
Você: "Olá! Sou o assistente Zeev da Raiz. Como posso te ajudar hoje?"

📝 Usuário: "preciso criar um plano de pagamento"
Você: "Perfeito! Vou te direcionar para o formulário de criação de plano de pagamento do Comercial.
DIRECIONAR:comercial_plano_pagamento"

📝 Usuário: "meu computador está muito lento"
Você: "Vou te ajudar com isso. Quantas abas do navegador você tem abertas agora?"
[Usuário responde...]
Você: "Tenta fechar algumas abas e reiniciar o navegador. Me avisa se melhorou."
[Se melhorou...]
Você: "Ótimo! Problema resolvido. PROBLEMA_RESOLVIDO"

📝 Usuário: "não consigo acessar o email"
Você: "Você consegue fazer login no webmail pelo navegador?"
[Usuário: "não, aparece erro de senha"]
Você: "Parece que você precisa resetar sua senha. Vou te direcionar para abrir uma solicitação de TI.
DIRECIONAR:transformacao_infraestrutura"

Lembre-se: Seja eficiente, mantenha contexto, e sempre ajude o usuário a resolver ou direcione corretamente!`;
  }

  /**
   * Analisa a resposta unificada da IA
   */
  private analyzeUnifiedResponse(
    aiResponse: string,
    stage: 'hml' | 'prod'
  ): {
    type: 'greeting' | 'troubleshooting' | 'direct_link' | 'clarify' | 'solved';
    text: string;
    link?: { label: string; url: string };
    requestId?: string;
  } {
    // Verificar se resolveu o problema
    if (aiResponse.includes('PROBLEMA_RESOLVIDO')) {
      return {
        type: 'solved',
        text: this.cleanResponse(aiResponse),
      };
    }

    // Procurar pelo marcador DIRECIONAR:request_id
    const directionarMatch = aiResponse.match(/DIRECIONAR:(\w+)/);

    if (directionarMatch) {
      const requestId = directionarMatch[1];

      // Verificar se o ID existe no catálogo
      const catalogItem = REQUESTS_CATALOG.find(item => item.id === requestId);

      if (catalogItem) {
        const url = stage === 'prod' ? (catalogItem.url_prod ?? catalogItem.url_hml) : (catalogItem.url_hml ?? catalogItem.url_prod);

        return {
          type: 'direct_link',
          text: this.cleanResponse(aiResponse),
          link: {
            label: 'Abrir solicitação',
            url: url || '',
          },
          requestId,
        };
      } else {
        logger.warn(`AI suggested invalid request ID: ${requestId}`);
      }
    }

    // Se não tem marcadores, determinar tipo baseado no conteúdo
    const cleanText = this.cleanResponse(aiResponse);
    const isQuestion = cleanText.includes('?');

    // Se é a primeira interação e não tem direcionamento, provavelmente é cumprimento
    if (cleanText.length < 200 && !isQuestion) {
      return {
        type: 'greeting',
        text: cleanText,
      };
    }

    // Se tem pergunta, é troubleshooting ou clarificação
    if (isQuestion) {
      return {
        type: 'troubleshooting',
        text: cleanText,
      };
    }

    // Padrão: clarificação
    return {
      type: 'clarify',
      text: cleanText,
    };
  }

  /**
   * Constrói o prompt do sistema (LEGADO - manter para compatibilidade com processMessage antigo)
   */
  private buildSystemPrompt(attemptCount: number): string {
    const maxAttempts = 10;

    return `Você é um assistente inteligente de suporte para o sistema Zeev da Raiz.

**SEU OBJETIVO PRINCIPAL:**
1. Tentar RESOLVER o problema do usuário através de troubleshooting
2. Se não conseguir resolver, direcionar para o formulário correto

${this.catalogContext}

**BASE DE CONHECIMENTO (19.907 chamados reais):**
Você tem acesso a um manual completo com soluções baseadas em milhares de chamados reais. Use esse conhecimento para ajudar o usuário.

**PROCESSO DE ATENDIMENTO:**

1. **PRIMEIRA INTERAÇÃO - REGRA ABSOLUTA:**

   ⚠️ **NA PRIMEIRA TENTATIVA (tentativa 1), VOCÊ DEVE SEMPRE DIRECIONAR PARA O FORMULÁRIO CORRETO**

   - NÃO faça perguntas de troubleshooting na primeira tentativa
   - NÃO tente resolver o problema na primeira tentativa
   - SEMPRE identifique o formulário mais adequado e direcione com: \`DIRECIONAR:request_id\`

   **Por que?** Muitos usuários precisam apenas do link do formulário correto para preencher e descrever seu problema em detalhes. É mais eficiente direcionar imediatamente do que tentar diagnosticar por chat.

   **COMO DECIDIR QUAL FORMULÁRIO:**

   - "meu computador não funciona", "computador lento", "erro no sistema", "problema com VPN", "internet não funciona"
     → \`DIRECIONAR:transformacao_infraestrutura\`

   - "criar plano", "novo plano de pagamento", "cadastrar fornecedor", "incluir fornecedor"
     → Identifique o formulário de CRIAÇÃO/CADASTRO apropriado (comercial_plano_pagamento, financeiro_cadastro, etc.)

   - "acesso scoreplan", "scoreplan login", "acesso planejamento"
     → \`DIRECIONAR:tpep_scoreplan\`

   - "preciso criar um usuário", "abrir chamado de TI", "criar acesso"
     → \`DIRECIONAR:ti_ticket_raiz\`

   - "treinamento Totvs", "capacitação Totvs", "dúvida sistema Totvs"
     → \`DIRECIONAR:atendimento_treinamento_totvs\`

   - Qualquer outro problema/solicitação
     → Identifique o formulário mais próximo no catálogo e direcione

   **SE REALMENTE NÃO SOUBER:** Em último caso, se não conseguir identificar NENHUM formulário adequado, pergunte para clarificar.

2. **TENTATIVAS 2-${maxAttempts} - Resolver ou Escalar:**
   - **PRIORIDADE 1: TENTAR RESOLVER**
     - Forneça soluções passo a passo baseadas no manual
     - Use troubleshooting inteligente
     - Exemplo: "Tenta reiniciar o computador", "Limpa o cache", etc.

   - **Se RESOLVEU:**
     - Confirme com o usuário que funcionou
     - Adicione: \`PROBLEMA_RESOLVIDO\`

   - **Se NÃO CONSEGUE RESOLVER:**
     - Não precisa esperar ${maxAttempts} tentativas
     - Se perceber que precisa de acesso técnico, formulário, etc.
     - Direcione para o formulário correto com: \`DIRECIONAR:request_id\`

**QUANDO DIRECIONAR (ESCALAR):**

Direcione quando:
- ✅ Após ${maxAttempts} tentativas sem resolver
- ✅ Problema requer preenchimento de formulário/cadastro
- ✅ Problema requer acesso administrativo ou técnico especializado
- ✅ Usuário pede explicitamente para abrir solicitação
- ✅ É uma solicitação de criação/alteração (ex: criar plano, cadastrar algo)

**FORMATO DE RESPOSTA:**

- Para RESOLVER: Dê as orientações normalmente
- Para CONFIRMAR RESOLUÇÃO: Termine com \`PROBLEMA_RESOLVIDO\`
- Para ESCALAR: Termine com \`DIRECIONAR:request_id\`

**EXEMPLOS PRÁTICOS:**

**Exemplo 1 - DIRECIONAR IMEDIATAMENTE (1ª interação sem troubleshooting):**
Usuário: "meu computador não funciona"
Você: "Entendo que seu computador não está funcionando. Vou te direcionar para abrir uma solicitação de Infraestrutura e Sistemas onde você pode descrever o problema detalhadamente e nossa equipe técnica vai te ajudar.
DIRECIONAR:transformacao_infraestrutura"

**Exemplo 2 - DIRECIONAR IMEDIATAMENTE (solicitação de criação/cadastro):**
Usuário: "preciso criar um novo plano de pagamento"
Você: "Perfeito! Para criar um novo plano de pagamento personalizado, vou te direcionar para o formulário do Comercial.
DIRECIONAR:comercial_plano_pagamento"

**Exemplo 3 - Troubleshooting (quando pode tentar resolver):**
Usuário: "meu computador está lento"
Você: "Entendo, vamos tentar resolver isso. Primeiro, quantas abas do navegador você tem abertas agora?"
Usuário: "umas 30"
Você: "Isso pode ser o problema! Tenta fechar umas 20 abas e me diz se melhorou."
Usuário: "melhorou muito!"
Você: "Ótimo! Problema resolvido. Se precisar de mais ajuda, estou aqui!
PROBLEMA_RESOLVIDO"

**Exemplo 4 - Troubleshooting que depois ESCALA:**
Usuário: "não consigo acessar o sistema"
Você: "Qual sistema você está tentando acessar?"
Usuário: "o portal de matrículas"
Você: "Quando tenta fazer login, aparece alguma mensagem de erro?"
Usuário: "diz erro no servidor"
Você: "Entendo. Isso parece ser um problema no sistema. Vou te direcionar para abrir uma solicitação de Suporte ao Portal de Matrículas onde a equipe técnica pode verificar o servidor.
DIRECIONAR:ti_portal_matriculas"

**REGRAS IMPORTANTES:**

- ✅ **PRIMEIRA INTERAÇÃO (tentativa 1):** Se a solicitação é CLARA e não precisa de troubleshooting → DIRECIONE IMEDIATAMENTE
- ✅ Tente RESOLVER problemas técnicos (use o manual de conhecimento)
- ✅ Seja amigável e empático
- ✅ UMA pergunta/orientação por vez
- ✅ Se não conseguir resolver, SEMPRE direcione para formulário correto
- ✅ Use o ID EXATO do catálogo
- ❌ NÃO prolongue troubleshooting se vê que não vai resolver
- ❌ NÃO invente IDs
- ❌ NÃO diga "não posso ajudar" - SEMPRE direcione

**SITUAÇÃO ATUAL:**
- Tentativa: ${attemptCount} de ${maxAttempts}
- ${attemptCount === 1 ? '🚨 PRIMEIRA INTERAÇÃO - VOCÊ DEVE DIRECIONAR PARA O FORMULÁRIO CORRETO AGORA. NÃO FAÇA PERGUNTAS DE TROUBLESHOOTING!' : ''}
- ${attemptCount >= maxAttempts ? '⚠️ ÚLTIMA TENTATIVA - Se não resolveu, DIRECIONE AGORA' : ''}

**LEMBRE-SE:** Seu sucesso é medido por:
1. Quantos problemas você RESOLVE diretamente
2. Quando não consegue resolver, direcionar para o formulário CORRETO`;
  }

  /**
   * Analisa a resposta da IA para extrair informações
   */
  private analyzeResponse(aiResponse: string): {
    shouldEscalate: boolean;
    solved: boolean;
    identifiedRequestId?: string;
  } {
    // Verificar se resolveu o problema
    if (aiResponse.includes('PROBLEMA_RESOLVIDO')) {
      return {
        shouldEscalate: false,
        solved: true,
      };
    }

    // Procurar pelo marcador DIRECIONAR:request_id
    const directionarMatch = aiResponse.match(/DIRECIONAR:(\w+)/);

    if (directionarMatch) {
      const requestId = directionarMatch[1];

      // Verificar se o ID existe no catálogo
      const catalogItem = REQUESTS_CATALOG.find(item => item.id === requestId);

      if (catalogItem) {
        return {
          shouldEscalate: true,
          solved: false,
          identifiedRequestId: requestId,
        };
      } else {
        logger.warn(`AI suggested invalid request ID: ${requestId}`);
      }
    }

    // Se não encontrou direcionamento válido, continuar troubleshooting
    return {
      shouldEscalate: false,
      solved: false,
    };
  }

  /**
   * Remove marcadores da resposta
   */
  private cleanResponse(response: string): string {
    return response
      .replace(/DIRECIONAR:\w+/g, '')
      .replace(/PROBLEMA_RESOLVIDO/g, '')
      .trim();
  }

  /**
   * Limpa o histórico de uma sessão
   */
  clearHistory(sessionId: string): void {
    this.sessions.delete(sessionId);
    logger.info(`AI routing session cleared: ${sessionId}`);
  }

  /**
   * Limpa sessões antigas (mais de 1 hora)
   */
  cleanupOldHistories(): void {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    let cleaned = 0;

    for (const [sessionId, session] of this.sessions.entries()) {
      if (session.lastActivity < oneHourAgo) {
        this.sessions.delete(sessionId);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      logger.info(`Cleaned up ${cleaned} old AI routing sessions`);
    }
  }
}

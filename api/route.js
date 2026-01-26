import Anthropic from '@anthropic-ai/sdk';

// Catálogo simplificado das principais solicitações
const REQUESTS_CATALOG = [
  {
    id: 'transformacao_infraestrutura',
    name: '[TI] Solicitações Infraestrutura',
    area: 'Transformação',
    description: 'Demandas de TI - Infraestrutura (rede, equipamentos, acessos, VPN, computadores)',
    tags: ['ti', 'infraestrutura', 'rede', 'computador', 'vpn', 'equipamento', 'hardware', 'internet', 'notebook'],
    examples: ['meu computador não funciona', 'problema com VPN', 'internet não funciona'],
    url_hml: 'https://raizeducacao.zeev.it/2.0/request?c=mBHfrUjtxaDAWwepPD90opqNK0%2FqxK6IWOSSX9Wn5K4nWa5o%2BwK0%2FEMVMLG6P9vL%2B0YsyMW0lodEqJavstj8Vw%3D%3D',
    url_prod: 'https://raizeducacao.zeev.it/2.0/request?c=mBHfrUjtxaDAWwepPD90opqNK0%2FqxK6IWOSSX9Wn5K4nWa5o%2BwK0%2FEMVMLG6P9vL%2B0YsyMW0lodEqJavstj8Vw%3D%3D'
  },
  {
    id: 'transformacao_sistemas',
    name: '[TI] Solicitações Sistemas',
    area: 'Transformação',
    description: 'Demandas de TI - Sistemas (software, erros, melhorias, integrações)',
    tags: ['ti', 'sistemas', 'software', 'erro', 'bug', 'sistema', 'totvs', 'rm'],
    examples: ['erro no sistema', 'sistema travou', 'problema no TOTVS RM'],
    url_hml: 'https://raizeducacao.zeev.it/2.0/request?c=YH7zrg0NXeqXw9guwTVWRTvb6ZKHFQdApBJxojRbJSE8dX9JRj7QFJ9b4X%2F1h0ZhEqHYUW%2FYCVDmIoQWswivFA%3D%3D',
    url_prod: 'https://raizeducacao.zeev.it/2.0/request?c=YH7zrg0NXeqXw9guwTVWRTvb6ZKHFQdApBJxojRbJSE8dX9JRj7QFJ9b4X%2F1h0ZhEqHYUW%2FYCVDmIoQWswivFA%3D%3D'
  },
  {
    id: 'transformacao_ticket_raiz',
    name: '[Processos] Solicitações Ticket Raiz',
    area: 'Transformação',
    description: 'Solicitações gerais - criar usuário, relatórios, dúvidas, cancelamentos',
    tags: ['processos', 'ticket', 'usuário', 'relatório', 'dúvida', 'suporte'],
    examples: ['criar usuário', 'abrir chamado', 'dúvida sobre sistema'],
    url_hml: 'https://raizeducacao.zeev.it/2.0/request?c=nIGZbj%2BSflQVvsUdA5hVOmC4ZZr8GXW%2FThxNe7g52WrGa4yThcuEkqRqO5VT82klt906ee7Z6xOdQXtaVd20Pg%3D%3D',
    url_prod: 'https://raizeducacao.zeev.it/2.0/request?c=nIGZbj%2BSflQVvsUdA5hVOmC4ZZr8GXW%2FThxNe7g52WrGa4yThcuEkqRqO5VT82klt906ee7Z6xOdQXtaVd20Pg%3D%3D'
  },
  {
    id: 'transformacao_bi',
    name: '[BI] Solicitações Business Intelligence',
    area: 'Transformação',
    description: 'Análises, relatórios, dashboards, extrações de dados',
    tags: ['bi', 'business intelligence', 'relatório', 'dashboard', 'análise', 'dados'],
    examples: ['preciso de um relatório', 'criar dashboard', 'análise de dados'],
    url_hml: 'https://raizeducacao.zeev.it/2.0/request?c=ZRd9q4OeRHKvrMxWwOCZqQ7C%2FV%2Bc968%2BjWwvq2ebEXlkxSYrx0Z3vs%2FdlYXEzkBsmoGiBGzA5WHxXn2Ma7U2Ew%3D%3D',
    url_prod: 'https://raizeducacao.zeev.it/2.0/request?c=ZRd9q4OeRHKvrMxWwOCZqQ7C%2FV%2Bc968%2BjWwvq2ebEXlkxSYrx0Z3vs%2FdlYXEzkBsmoGiBGzA5WHxXn2Ma7U2Ew%3D%3D'
  }
];

// Armazenamento de sessões em memória (em produção, usar Redis ou similar)
const sessions = new Map();

function buildCatalogContext() {
  return `# CATÁLOGO DE SOLICITAÇÕES ZEEV

${REQUESTS_CATALOG.map((item, idx) => `${idx + 1}. ID: ${item.id}
   Nome: ${item.name}
   Área: ${item.area}
   Descrição: ${item.description}
   Tags: ${item.tags.join(', ')}
   Exemplos: ${item.examples.join(' | ')}`).join('\n\n')}`;
}

function buildSystemPrompt(attemptCount, stage) {
  const catalogContext = buildCatalogContext();

  return `Você é o assistente virtual Zeev da Raiz Educação.

**SUA MISSÃO:**
Ajudar o usuário de forma eficiente:
1. Respondendo cumprimentos cordialmente
2. Resolvendo problemas técnicos através de troubleshooting quando possível
3. Direcionando para o formulário correto quando necessário

${catalogContext}

**PROCESSO DE ATENDIMENTO:**

**1. CUMPRIMENTOS (Primeira mensagem)**
Se o usuário está cumprimentando (oi, olá, bom dia):
- Responda cordialmente
- Pergunte como pode ajudar
- Exemplo: "Olá! Sou o assistente Zeev da Raiz. Descreva rapidamente o que você precisa para eu te levar ao formulário correto."

**2. PROBLEMAS TÉCNICOS SIMPLES (Troubleshooting)**
Para problemas que podem ter solução rápida:
- Faça perguntas específicas (UMA por vez)
- Dê instruções passo a passo
- Se resolver, use: \`PROBLEMA_RESOLVIDO\`
- Se não conseguir resolver após 2-3 tentativas, DIRECIONE

Exemplos de problemas que você PODE tentar resolver:
- "esqueci minha senha" → orientar a usar "esqueci senha" no sistema
- "como faço para acessar X" → dar orientações de acesso
- "onde encontro relatório" → orientar onde achar

Exemplos que você NÃO pode resolver (precisa direcionar):
- "meu computador travou" → precisa de TI
- "sistema dá erro" → precisa de suporte técnico
- "criar/cadastrar algo" → precisa preencher formulário

**3. SOLICITAÇÕES CLARAS (Direcionar)**
Quando o usuário descreve uma necessidade clara:
- "problema no computador"
- "erro no sistema TOTVS RM"
- "preciso de relatório"
- "abrir solicitação"

→ DIRECIONE IMEDIATAMENTE para o formulário
→ Use: \`DIRECIONAR:request_id\`
→ Explique brevemente

**4. MENSAGENS VAGAS**
Se não está claro:
- Faça perguntas para entender melhor
- Dê exemplos

**FORMATO DE RESPOSTA:**

- Para DIRECIONAR: \`DIRECIONAR:request_id\`
- Para CONFIRMAR RESOLUÇÃO: \`PROBLEMA_RESOLVIDO\`
- Para continuar conversa: responda normalmente

**DIRETRIZES:**
✅ Seja direto e eficiente
✅ UMA pergunta por vez no troubleshooting
✅ Use o ID EXATO do catálogo
✅ Máximo 2-3 tentativas de troubleshooting
✅ Sempre direcione se não puder resolver
❌ NÃO prolongue troubleshooting sem necessidade
❌ NÃO invente IDs
❌ NÃO diga "não posso ajudar" - sempre direcione

**SITUAÇÃO ATUAL:**
- Tentativa: ${attemptCount}
- Ambiente: ${stage}
${attemptCount >= 3 ? '\n⚠️ Muitas tentativas - se não resolveu, DIRECIONE AGORA' : ''}

**EXEMPLOS:**

Usuário: "Minha senha do totvs rm não ta funcionando"
Você: "Você já tentou usar a opção 'Esqueci minha senha' na tela de login do TOTVS RM?"
[Se usuário diz que não funciona...]
Você: "Entendo. Vou te direcionar para abrir uma solicitação de TI - Sistemas onde a equipe pode resetar sua senha.
DIRECIONAR:transformacao_sistemas"

Usuário: "Gostaria de abrir uma solicitação"
Você: "Claro! Sobre qual assunto você precisa abrir a solicitação? Por exemplo: problema técnico, dúvida sobre sistema, relatório, etc."`;
}

function cleanResponse(response) {
  return response
    .replace(/DIRECIONAR:\w+/g, '')
    .replace(/PROBLEMA_RESOLVIDO/g, '')
    .trim();
}

function analyzeResponse(aiResponse, stage) {
  // Verificar se resolveu
  if (aiResponse.includes('PROBLEMA_RESOLVIDO')) {
    return {
      type: 'troubleshooting',
      text: cleanResponse(aiResponse)
    };
  }

  // Procurar direcionamento
  const match = aiResponse.match(/DIRECIONAR:(\w+)/);
  if (match) {
    const requestId = match[1];
    const catalogItem = REQUESTS_CATALOG.find(item => item.id === requestId);

    if (catalogItem) {
      const url = stage === 'prod' ? catalogItem.url_prod : (catalogItem.url_hml || catalogItem.url_prod);

      return {
        type: 'direct_link',
        text: cleanResponse(aiResponse),
        link: {
          label: 'Abrir solicitação',
          url: url
        }
      };
    }
  }

  // Padrão: continuar troubleshooting ou clarificação
  const cleanText = cleanResponse(aiResponse);
  const isQuestion = cleanText.includes('?');

  return {
    type: isQuestion ? 'troubleshooting' : 'clarify',
    text: cleanText
  };
}

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { message, sessionId, stage = 'hml' } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message required' });
    }

    // Inicializar cliente Anthropic
    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    // Obter ou criar sessão
    let session = sessions.get(sessionId);
    if (!session) {
      session = {
        attemptCount: 0,
        history: []
      };
      sessions.set(sessionId, session);
    }

    // Incrementar tentativas
    session.attemptCount++;

    // Adicionar mensagem do usuário
    session.history.push({
      role: 'user',
      content: message
    });

    // Construir prompt
    const systemPrompt = buildSystemPrompt(session.attemptCount, stage);

    // Chamar Claude
    const response = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 2048,
      system: systemPrompt,
      messages: session.history
    });

    // Extrair resposta
    const assistantMessage = response.content[0];
    if (assistantMessage.type !== 'text') {
      throw new Error('Unexpected response type');
    }

    const aiResponse = assistantMessage.text;

    // Adicionar ao histórico
    session.history.push({
      role: 'assistant',
      content: aiResponse
    });

    // Analisar resposta
    const result = analyzeResponse(aiResponse, stage);

    // Se resolveu ou direcionou, limpar sessão
    if (result.type === 'direct_link' || aiResponse.includes('PROBLEMA_RESOLVIDO')) {
      sessions.delete(sessionId);
    }

    // Limpar sessões antigas (mais de 1 hora)
    const oneHourAgo = Date.now() - 60 * 60 * 1000;
    for (const [sid, sess] of sessions.entries()) {
      if (!sess.lastActivity || sess.lastActivity < oneHourAgo) {
        sessions.delete(sid);
      }
    }
    session.lastActivity = Date.now();

    res.status(200).json(result);

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({
      error: 'Internal server error',
      type: 'clarify',
      text: 'Desculpe, ocorreu um erro. Tente novamente em instantes.'
    });
  }
}

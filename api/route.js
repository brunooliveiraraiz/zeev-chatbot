import Anthropic from '@anthropic-ai/sdk';
import { PrismaClient } from '@prisma/client';
import { REQUESTS_CATALOG } from './catalog.js';

const prisma = new PrismaClient();

// Armazenamento de sessões em memória (em produção, usar Redis ou similar)
const sessions = new Map();

function buildCatalogContext() {
  // Mostrar apenas os primeiros 20 formulários mais relevantes para não estourar o contexto
  const topForms = REQUESTS_CATALOG.slice(0, 20);

  return `# CATÁLOGO PRINCIPAIS SOLICITAÇÕES ZEEV (mostrando 20 de ${REQUESTS_CATALOG.length})

${topForms.map((item, idx) => `${idx + 1}. ID: ${item.id}
   Nome: ${item.name}
   Área: ${item.area}
   Descrição: ${item.description}
   Exemplos: ${item.examples.slice(0, 2).join(' | ')}`).join('\n\n')}

... e mais ${REQUESTS_CATALOG.length - 20} formulários disponíveis nas áreas: Atendimento, Comercial, CMEF, DP, Financeiro, Fiscal, Jurídico, Operações, Performance, P&C.`;
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

**2. TROUBLESHOOTING (Quando possível)**

**SEMPRE tente troubleshooting PRIMEIRO para:**
- Problemas de senha/login → orientar "esqueci senha", redefinir
- Dúvidas sobre como acessar/usar algo → dar orientações
- Problemas técnicos com equipamentos → investigar antes de direcionar
- Problemas que PODEM ter solução simples

**PROCESSO de troubleshooting:**
1. Faça UMA pergunta específica para entender melhor o problema
2. Aguarde resposta do usuário
3. Se não resolver em 2-3 tentativas → DIRECIONE
4. Se o usuário explicitamente pedir "quero solicitar novo" ou "preciso de um novo" → DIRECIONE para operacoes_compras
5. Se resolver → use \`PROBLEMA_RESOLVIDO\`

**⚠️ IMPORTANTE - NÃO marque DIRECIONAR na primeira resposta!**
- NUNCA use DIRECIONAR na primeira mensagem de troubleshooting
- Faça pelo menos 1-2 perguntas para investigar
- Só use DIRECIONAR quando:
  a) Tentou troubleshooting e não resolveu (2-3 mensagens)
  b) Usuário EXPLICITAMENTE pede para solicitar algo novo
  c) Problema claramente NÃO tem solução via troubleshooting (ex: tela quebrada, equipamento perdido)

**3. ESCOLHA DO FORMULÁRIO CORRETO - GUIA COMPLETO**

**TI / TRANSFORMAÇÃO:**
- **transformacao_infraestrutura**: HARDWARE - notebook não liga, computador travou, internet não funciona, VPN, rede
- **transformacao_sistemas**: SOFTWARE - erro TOTVS RM, sistema travou, bug, senha sistema
- **transformacao_portal_matriculas**: Portal de matrículas - erro portal, não consigo matricular
- **transformacao_scoreplan**: Scoreplan - acesso scoreplan, usuário scoreplan
- **transformacao_bi**: Relatórios, dashboards, análise de dados
- **transformacao_ticket_raiz**: Criar usuário, dúvidas gerais

**ATENDIMENTO:**
- **atendimento_alteracao_vencimento**: Alterar data vencimento parcela
- **atendimento_cancelamento_matricula**: Cancelar matrícula, transferência aluno
- **atendimento_cancelamento_parcela**: Cancelar parcela, mensalidade, taxa
- **atendimento_correcao_lancamento**: Corrigir plano pagamento, ajustar desconto, trocar responsável
- **atendimento_devolucao_estorno**: Estorno, reembolso, paguei duplicado
- **atendimento_treinamento_totvs**: Treinamento Totvs, dúvida sistema Totvs
- **atendimento_negociacao_acordos**: Negociar débito, acordo, parcelamento
- **atendimento_baixa_pagamento**: Pagamento não registrado, boleto não baixado

**COMERCIAL:**
- **comercial_plano_pagamento**: CRIAR novo plano pagamento
- **comercial_desconto**: Solicitar desconto, bolsa
- **comercial_promocoes**: Aplicar promoção, campanha
- **comercial_mais_raiz**: Atividades extras, extracurricular
- **comercial_marketplace**: Comprar produto, marketplace

**DP:**
- **dp_solicitacoes**: Folha pagamento, férias, holerite
- **dp_beneficios**: Vale transporte, plano saúde, benefícios

**FINANCEIRO:**
- **financeiro_cadastro**: Cadastrar fornecedor
- **financeiro_solicitacoes**: Solicitar pagamento, reembolso, abrir solicitação financeira
- **fiscal_nota_fiscal**: Emitir nota fiscal

**OPERAÇÕES:**
- **operacoes_compras**: Comprar material, equipamento para escola
- **operacoes_facilities**: Manutenção predial, problema elétrico, vazamento
- **operacoes_frota**: Solicitar veículo
- **operacoes_frete**: Motoboy, frete, envio documento
- **operacoes_almoxarifado**: Material almoxarifado

**P&C:**
- **pc_admissao_recrutamento**: Abrir vaga, contratar colaborador
- **pc_educacao_corporativa**: Treinamento corporativo
- **pc_movimentacao**: Promover, transferir funcionário
- **pc_desligamento**: Demissão, desligamento

**OUTROS:**
- **juridico_solicitacoes**: Análise contrato, orientação jurídica
- **cmef_midia_eventos**: Material gráfico, evento, campanha marketing
- **performance_crm**: Suporte CRM, HubSpot

→ Use: \`DIRECIONAR:request_id\`
→ Explique brevemente E mencione o nome correto do formulário

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

Usuário: "meu notebook não liga"
Você: "Vou te direcionar para TI - Infraestrutura.
DIRECIONAR:transformacao_infraestrutura"

Usuário: "erro no TOTVS RM"
Você: "Vou te direcionar para TI - Sistemas.
DIRECIONAR:transformacao_sistemas"

Usuário: "preciso cancelar matrícula"
Você: "Vou te direcionar para Atendimento - Cancelamento de Matrícula.
DIRECIONAR:atendimento_cancelamento_matricula"

Usuário: "criar plano de pagamento"
Você: "Vou te direcionar para Comercial - Criação de Plano de Pagamento.
DIRECIONAR:comercial_plano_pagamento"

Usuário: "solicitar pagamento"
Você: "Vou te direcionar para Financeiro - Solicitações Financeiras.
DIRECIONAR:financeiro_solicitacoes"`;
}

function cleanResponse(response) {
  return response
    .replace(/DIRECIONAR:\w+/g, '')
    .replace(/PROBLEMA_RESOLVIDO/g, '')
    .trim();
}

/**
 * Salva a resolução da conversa no banco de dados
 */
async function saveConversationResolution(sessionId, aiResponse) {
  try {
    // Verificar se resolveu via troubleshooting
    if (aiResponse.includes('PROBLEMA_RESOLVIDO')) {
      await prisma.conversationResolution.upsert({
        where: { sessionId },
        update: {
          resolved: true,
          resolvedBy: 'troubleshooting',
          resolvedAt: new Date(),
          updatedAt: new Date()
        },
        create: {
          sessionId,
          resolved: true,
          resolvedBy: 'troubleshooting',
          category: 'troubleshooting',
          resolvedAt: new Date()
        }
      });
      console.log(`✅ Resolução salva: ${sessionId} - troubleshooting`);
      return;
    }

    // Verificar se foi escalado para formulário
    const match = aiResponse.match(/DIRECIONAR:(\w+)/);
    if (match) {
      const requestId = match[1];
      const catalogItem = REQUESTS_CATALOG.find(item => item.id === requestId);

      await prisma.conversationResolution.upsert({
        where: { sessionId },
        update: {
          resolved: false,
          resolvedBy: 'escalated',
          requestId: requestId,
          category: catalogItem ? catalogItem.area : 'unknown',
          resolvedAt: new Date(),
          updatedAt: new Date()
        },
        create: {
          sessionId,
          resolved: false,
          resolvedBy: 'escalated',
          requestId: requestId,
          category: catalogItem ? catalogItem.area : 'unknown',
          resolvedAt: new Date()
        }
      });
      console.log(`✅ Escalação salva: ${sessionId} - ${requestId} (${catalogItem?.area})`);
      return;
    }
  } catch (error) {
    console.error('❌ Erro ao salvar resolução:', error);
    // Não bloqueia o fluxo se der erro ao salvar
  }
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
        history: [],
        hasSentLink: false,
        messagesSinceLinkSent: 0
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

    // Gerenciar sessão baseado na resposta
    if (result.type === 'direct_link') {
      // Marcou que direcionou, mas mantém sessão por mais algumas mensagens
      if (!session.hasSentLink) {
        // Primeira vez enviando link - salvar no banco
        await saveConversationResolution(sessionId, aiResponse);
        session.hasSentLink = true;
        session.messagesSinceLinkSent = 0;
      } else {
        // Já enviou link antes, incrementar contador
        session.messagesSinceLinkSent++;

        // Se já enviou link 2 vezes ou mais, deletar sessão
        if (session.messagesSinceLinkSent >= 2) {
          sessions.delete(sessionId);
        }
      }
    } else if (aiResponse.includes('PROBLEMA_RESOLVIDO')) {
      // Problema resolvido - salvar e deletar sessão
      await saveConversationResolution(sessionId, aiResponse);
      sessions.delete(sessionId);
    } else if (session.hasSentLink) {
      // Já enviou link mas usuário continua conversando
      session.messagesSinceLinkSent++;

      // Após 3 mensagens depois do link, deletar sessão
      if (session.messagesSinceLinkSent >= 3) {
        sessions.delete(sessionId);
      }
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
  } finally {
    await prisma.$disconnect();
  }
}

import { REQUESTS_CATALOG, type ZeevRequestCatalogItem } from '../catalog/requests.js';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';
import { TroubleshootingService } from './troubleshooting.service.js';
import { AIRoutingService } from './ai-routing.service.js';
import { AnalyticsService } from './analytics.service.js';

export type RouteRequest = {
  sessionId?: string;
  message: string;
  stage?: 'hml' | 'prod';
};

export type RouteResponse =
  | {
      type: 'troubleshooting';
      text: string;
    }
  | {
      type: 'direct_link';
      text: string;
      link: { label: string; url: string };
    }
  | {
      type: 'choose_option';
      text: string;
      options: Array<{ id: string; label: string; description?: string }>;
    }
  | {
      type: 'clarify';
      text: string;
    };

type MatchResult = {
  item: ZeevRequestCatalogItem;
  score: number;
};

/**
 * Mapeamento entre categorias do troubleshooting (knowledge-base)
 * e IDs do catálogo de requests (formulários Zeev)
 *
 * IMPORTANTE: Manter sincronizado com knowledge-base.ts e requests.ts
 */
const TROUBLESHOOTING_CATEGORY_TO_REQUEST_ID: Record<string, string> = {
  // Categorias Transformação (antigo TI)
  'ti_infraestrutura': 'transformacao_infraestrutura',
  'ti_sistemas': 'transformacao_sistemas',
  'ti_bi': 'transformacao_bi',
  'ti_ticket_raiz': 'transformacao_ticket_raiz',
};

export class RoutingService {
  private troubleshootingService: TroubleshootingService;
  private aiRoutingService: AIRoutingService;
  private analyticsService: AnalyticsService;

  constructor() {
    this.troubleshootingService = new TroubleshootingService();
    this.aiRoutingService = new AIRoutingService();
    this.analyticsService = new AnalyticsService();
  }

  async route(request: RouteRequest): Promise<{ response: RouteResponse; topMatches: MatchResult[]; normalized: string; stage: 'hml' | 'prod' }> {
    const normalized = normalizeText(request.message);
    const resolvedStage = request.stage ?? env.STAGE_DEFAULT;

    // ═══════════════════════════════════════════════════════════════
    // ARQUITETURA IA-FIRST
    // ═══════════════════════════════════════════════════════════════
    //
    // Se IA está habilitada E temos sessionId, usar IA para TODO o roteamento
    // A IA decide tudo: cumprimentos, troubleshooting, direcionamento, etc.
    //
    if (this.aiRoutingService.isEnabled() && request.sessionId) {
      try {
        const aiResult = await this.aiRoutingService.routeMessage(
          request.sessionId,
          request.message,
          resolvedStage
        );

        // Converter resultado da IA para formato RouteResponse
        let response: RouteResponse;

        switch (aiResult.type) {
          case 'greeting':
          case 'clarify':
          case 'troubleshooting':
            response = {
              type: aiResult.type === 'greeting' ? 'clarify' : aiResult.type,
              text: aiResult.text,
            };
            break;

          case 'direct_link':
            response = {
              type: 'direct_link',
              text: aiResult.text,
              link: aiResult.link!,
            };
            break;

          case 'solved':
            response = {
              type: 'troubleshooting',
              text: aiResult.text,
            };
            break;

          default:
            response = {
              type: 'clarify',
              text: aiResult.text,
            };
        }

        logger.info(`AI-First routing completed for session ${request.sessionId}: ${aiResult.type}`);

        return {
          response,
          topMatches: aiResult.requestId ? [{ item: REQUESTS_CATALOG.find(i => i.id === aiResult.requestId)!, score: 1.0 }] : [],
          normalized,
          stage: resolvedStage,
        };
      } catch (error) {
        logger.error('AI-First routing failed, falling back to legacy:', error);
        // Em caso de erro da IA, continuar para lógica de fallback abaixo
      }
    }

    // ═══════════════════════════════════════════════════════════════
    // FALLBACK: Lógica legada (apenas se IA não estiver disponível ou falhar)
    // ═══════════════════════════════════════════════════════════════

    // Armazena mensagem de mudança de contexto para incluir depois
    let contextChangeMessage: string | undefined;

    // Primeiro, tentar troubleshooting se tiver sessionId
    if (request.sessionId) {
      const troubleshootingResult = await this.troubleshootingService.processMessage(
        request.sessionId,
        request.message
      );

      // Se é mensagem irrelevante, retornar aviso e continuar troubleshooting
      if (troubleshootingResult.isIrrelevant) {
        const response: RouteResponse = {
          type: 'troubleshooting',
          text: troubleshootingResult.response,
        };
        return { response, topMatches: [], normalized, stage: resolvedStage };
      }

      // Se houve mudança de contexto, armazenar mensagem e fazer routing normal
      if (troubleshootingResult.contextChanged) {
        // Armazena mensagem para incluir no response final
        contextChangeMessage = troubleshootingResult.response;
        // Sessão já foi resetada no troubleshooting service
        // Faz routing normal abaixo (pula o bloco de shouldEscalate)
      } else if (troubleshootingResult.solved) {
        // Se resolveu o problema, retornar sucesso e resetar sessão
        this.troubleshootingService.resetSession(request.sessionId);
        const response: RouteResponse = {
          type: 'troubleshooting',
          text: troubleshootingResult.response,
        };
        return { response, topMatches: [], normalized, stage: resolvedStage };
      } else if (troubleshootingResult.shouldEscalate) {
        // Se deve escalar (mas NÃO é mudança de contexto)
        const session = this.troubleshootingService.getSession(request.sessionId);

        // Se tem categoria identificada no troubleshooting, usar ela
        if (session && session.category) {
          // Mapear categoria do troubleshooting para ID do request catalog
          const requestId = TROUBLESHOOTING_CATEGORY_TO_REQUEST_ID[session.category] || session.category;
          const catalogItem = REQUESTS_CATALOG.find((item) => item.id === requestId);

          if (catalogItem) {
            const link = this.buildLink(catalogItem, resolvedStage);

            // Se tem mensagem de troubleshooting, incluir
            let finalText = '';
            if (troubleshootingResult.response) {
              finalText = troubleshootingResult.response + '\n\nClique no botão abaixo para abrir a solicitação:';
            } else {
              // Sem troubleshooting, usar mensagem padrão
              finalText = `Vou te direcionar para: ${catalogItem.name}`;
            }

            // Resetar sessão após escalar
            this.troubleshootingService.resetSession(request.sessionId);

            const response: RouteResponse = {
              type: 'direct_link',
              text: finalText,
              link,
            };
            return { response, topMatches: [{ item: catalogItem, score: 1.0 }], normalized, stage: resolvedStage };
          }
        }

        // Se não encontrou categoria na sessão (não houve troubleshooting específico)
        // Resetar sessão e seguir para routing normal
        this.troubleshootingService.resetSession(request.sessionId);
        // Continua no código abaixo para fazer routing normal
      } else {
        // Ainda em troubleshooting, retornar a pergunta
        const response: RouteResponse = {
          type: 'troubleshooting',
          text: troubleshootingResult.response,
        };
        return { response, topMatches: [], normalized, stage: resolvedStage };
      }
    }

    // Detectar cumprimentos quando NÃO está em troubleshooting - responder cordialmente
    if (this.troubleshootingService.isGreeting(request.message)) {
      // Se a IA está habilitada, usar IA para resposta mais natural
      if (this.aiRoutingService.isEnabled()) {
        try {
          const greetingResponse = await this.aiRoutingService.processGreeting(request.message);

          const response: RouteResponse = {
            type: 'clarify',
            text: greetingResponse,
          };

          return { response, topMatches: [], normalized, stage: resolvedStage };
        } catch (error) {
          logger.error('AI greeting response failed, using fallback:', error);
          // Continua para usar respostas pré-definidas em caso de erro
        }
      }

      // Fallback: respostas pré-definidas se IA não estiver disponível ou falhar
      const greetingResponses = [
        'Olá! Como posso te ajudar com suas solicitações hoje?',
        'Oi! Estou aqui para te ajudar. Qual solicitação você precisa fazer?',
        'Olá! Sou o assistente de solicitações Zeev. No que posso te ajudar?',
      ];

      const response: RouteResponse = {
        type: 'clarify',
        text: greetingResponses[Math.floor(Math.random() * greetingResponses.length)],
      };
      return { response, topMatches: [], normalized, stage: resolvedStage };
    }

    // Short-circuit: exact id selection
    const directById = REQUESTS_CATALOG.find((item) => item.id.toLowerCase() === request.message.trim().toLowerCase());
    if (directById) {
      const link = this.buildLink(directById, resolvedStage);
      const response: RouteResponse = {
        type: 'direct_link',
        text: `Ok, abrindo ${directById.name}.`,
        link,
      };
      this.logResult(request.sessionId, resolvedStage, normalized, [{ item: directById, score: 1 }]);
      return { response, topMatches: [{ item: directById, score: 1 }], normalized, stage: resolvedStage };
    }

    const allMatches = this.scoreMatches(normalized);
    let matches = allMatches.slice(0, 5);
    let top1 = matches[0];
    let top2 = matches[1];

    // Detectar e resolver empates ANTES de decidir
    if (top1 && top2) {
      const scoreGap = top1.score - top2.score;

      // Se há empate (gap muito pequeno) com scores altos, usar desempate
      if (top1.score >= 0.35 && scoreGap < 0.05) {
        const tiedMatches = allMatches.filter(m => m.score >= 0.35 && (top1!.score - m.score) < 0.05);

        if (tiedMatches.length >= 2) {
          const tieWinner = this.breakTie(normalized, tiedMatches);

          if (tieWinner) {
            // Reorganizar matches para colocar o vencedor do desempate no topo
            matches = [
              tieWinner,
              ...allMatches.filter(m => m.item.id !== tieWinner.item.id).slice(0, 4)
            ];
            top1 = matches[0];
            top2 = matches[1];

            logger.info(`Tie detected and broken - winner: ${tieWinner.item.id} (${tieWinner.item.name})`);
          }
        }
      }
    }

    const decision = this.decide(top1, top2, normalized, allMatches);

    // Se a decisão foi 'clarify' (score muito baixo) E a IA está habilitada, usar roteamento inteligente com IA
    if (decision === 'clarify' && this.aiRoutingService.isEnabled() && request.sessionId) {
      try {
        const aiResult = await this.aiRoutingService.processMessage(
          request.sessionId,
          request.message
        );

        // Se a IA RESOLVEU o problema, retornar sucesso e limpar sessão
        if (aiResult.solved) {
          this.aiRoutingService.clearHistory(request.sessionId);

          const response: RouteResponse = {
            type: 'troubleshooting',
            text: aiResult.response,
          };

          return { response, topMatches: matches, normalized, stage: resolvedStage };
        }

        // Se a IA identificou a solicitação correta, escalar direto
        if (aiResult.shouldEscalate && aiResult.identifiedRequestId) {
          const catalogItem = REQUESTS_CATALOG.find(item => item.id === aiResult.identifiedRequestId);

          if (catalogItem) {
            const link = this.buildLink(catalogItem, resolvedStage);

            const response: RouteResponse = {
              type: 'direct_link',
              text: aiResult.response + '\n\nClique no botão abaixo para abrir a solicitação:',
              link,
            };

            // Limpar histórico após direcionar
            this.aiRoutingService.clearHistory(request.sessionId);

            this.logResult(request.sessionId, resolvedStage, normalized, [{ item: catalogItem, score: 0.8 }]);
            return { response, topMatches: [{ item: catalogItem, score: 0.8 }], normalized, stage: resolvedStage };
          }
        }

        // Se ainda está em troubleshooting com IA, retornar a resposta
        if (!aiResult.shouldEscalate && !aiResult.solved) {
          const response: RouteResponse = {
            type: 'troubleshooting',
            text: aiResult.response,
          };

          return { response, topMatches: matches, normalized, stage: resolvedStage };
        }
      } catch (error) {
        logger.error('AI routing failed, falling back to regular clarify:', error);
        // Em caso de erro, continuar com o fluxo normal de clarify
      }
    }

    const response = this.buildResponse(decision, matches, resolvedStage);

    // Se houve mudança de contexto, incluir mensagem no início
    if (contextChangeMessage && response.type === 'direct_link') {
      response.text = contextChangeMessage + '\n\n' + response.text;
    }

    this.logResult(request.sessionId, resolvedStage, normalized, matches);

    return { response, topMatches: matches, normalized, stage: resolvedStage };
  }

  private buildResponse(
    decision: 'direct_link' | 'choose_option' | 'clarify',
    matches: MatchResult[],
    stage: 'hml' | 'prod'
  ): RouteResponse {
    if (decision === 'direct_link' && matches[0]) {
      const link = this.buildLink(matches[0].item, stage);
      return {
        type: 'direct_link',
        text: `Encontrei a melhor opção para você: ${matches[0].item.name}`,
        link,
      };
    }

    if (decision === 'choose_option') {
      const options = matches.slice(0, 3).map((match) => ({
        id: match.item.id,
        label: match.item.name,
        description: match.item.description,
      }));

      return {
        type: 'choose_option',
        text: 'Achei algumas opções. Pode escolher a que faz sentido?',
        options,
      };
    }

    const suggestions = REQUESTS_CATALOG.flatMap((item) => item.examples.slice(0, 1)).slice(0, 3);
    const suggestionText = suggestions.length ? ` Exemplos: ${suggestions.join(' | ')}` : '';

    return {
      type: 'clarify',
      text: `Não consegui identificar bem sua solicitação. Pode descrever com mais detalhes?${suggestionText}`,
    };
  }

  private decide(top1?: MatchResult, top2?: MatchResult, normalized?: string, allMatches?: MatchResult[]): 'direct_link' | 'choose_option' | 'clarify' {
    if (!top1) return 'clarify';

    const scoreGap = top1.score - (top2?.score ?? 0);

    // Estratégia ultra direta: praticamente sempre vai direto ao formulário

    // Estratégia 1: Qualquer score razoável (>= 0.35), independente do gap
    // (empates já foram resolvidos antes de chamar decide)
    if (top1.score >= 0.35) {
      return 'direct_link';
    }

    // Estratégia 2: Score baixo mas com gap um pouco maior
    if (top1.score >= 0.25 && scoreGap >= 0.15) {
      return 'direct_link';
    }

    // Muito raramente oferece opções (apenas em casos extremamente ambíguos)
    if (top1.score >= 0.20) {
      return 'choose_option';
    }

    return 'clarify';
  }

  /**
   * Desempata quando múltiplas categorias têm scores similares (empate)
   * Usa palavras-chave específicas e contexto para escolher a mais apropriada
   */
  private breakTie(normalizedMessage: string, tiedMatches: MatchResult[]): MatchResult | null {
    if (tiedMatches.length < 2) return null;

    const tokens = tokenize(normalizedMessage);
    const message = normalizedMessage.toLowerCase();

    // Mapeia cada categoria para pontos de desempate baseado em contexto
    const tieScores = new Map<string, number>();

    for (const match of tiedMatches) {
      let tiePoints = 0;
      const itemId = match.item.id;

      // Regras específicas de desempate baseadas em contexto

      // Transformação Infraestrutura vs Operações: "equipamento" no contexto de TI/infraestrutura
      if (itemId === 'transformacao_infraestrutura') {
        if (message.includes('computador') || message.includes('notebook') ||
            message.includes('rede') || message.includes('vpn') ||
            message.includes('acesso') || message.includes('internet') ||
            (message.includes('equipamento') && (message.includes('ti') || message.includes('novo equipamento')))) {
          tiePoints += 10;
        }
      }

      // Transformação Sistemas vs outros
      if (itemId === 'transformacao_sistemas') {
        if (message.includes('sistema') || message.includes('software') ||
            message.includes('erro') || message.includes('bug') ||
            message.includes('melhoria') || message.includes('integracao') ||
            message.includes('integração')) {
          tiePoints += 10;
        }
      }

      if (itemId === 'operacoes_compras') {
        if (message.includes('escola') || message.includes('material escolar') ||
            message.includes('operacao') || message.includes('operacional') ||
            (message.includes('equipamento') && message.includes('escola'))) {
          tiePoints += 10;
        }
        // Reduzir prioridade se mencionar coisas específicas de TI
        if (message.includes('computador') || message.includes('sistema') || message.includes('software')) {
          tiePoints -= 5;
        }
      }

      // Atendimento (matrícula) vs P&C (funcionário): "transferência" no contexto certo
      if (itemId === 'atendimento_cancelamento_matricula') {
        if (message.includes('aluno') || message.includes('estudante') ||
            message.includes('matricula') || message.includes('unidade escolar') ||
            message.includes('escola') || message.includes('cancelar')) {
          tiePoints += 10;
        }
      }

      if (itemId === 'pc_movimentacao') {
        if (message.includes('funcionario') || message.includes('colaborador') ||
            message.includes('cargo') || message.includes('departamento') ||
            message.includes('equipe')) {
          tiePoints += 10;
        }
        // Reduzir prioridade se mencionar aluno/escola
        if (message.includes('aluno') || message.includes('escolar') || message.includes('estudante')) {
          tiePoints -= 5;
        }
      }

      // Comercial Marketplace vs Operações Compras: "comprar" no contexto certo
      if (itemId === 'comercial_marketplace') {
        if (message.includes('vender') || message.includes('venda') ||
            message.includes('cliente') || message.includes('marketplace') ||
            message.includes('produto') && !message.includes('operacao') && !message.includes('escola')) {
          tiePoints += 10;
        }
      }

      // Se não há palavras de contexto específicas, priorizar categorias mais específicas
      // Transformação Infraestrutura é mais específico que Operações
      if ((itemId === 'transformacao_infraestrutura' || itemId === 'transformacao_sistemas') && tiePoints === 0) {
        tiePoints += 2;
      }

      // Atendimento é mais específico que P&C para "transferência"
      if (itemId === 'atendimento_cancelamento_matricula' && tiePoints === 0 && message.includes('transferencia')) {
        tiePoints += 2;
      }

      // Marketplace é mais específico que Operações para "comprar produto"
      if (itemId === 'comercial_marketplace' && tiePoints === 0 &&
          message.includes('comprar') && message.includes('produto')) {
        tiePoints += 2;
      }

      tieScores.set(itemId, tiePoints);
    }

    // Encontrar o item com maior pontuação de desempate
    let bestMatch: MatchResult | null = null;
    let bestTieScore = -1;

    for (const match of tiedMatches) {
      const tieScore = tieScores.get(match.item.id) ?? 0;
      if (tieScore > bestTieScore) {
        bestTieScore = tieScore;
        bestMatch = match;
      }
    }

    if (bestMatch && bestTieScore > 0) {
      logger.info(`Tie broken: ${bestMatch.item.id} won with tie score ${bestTieScore}`);
      return bestMatch;
    }

    // Se não conseguiu desempatar, retornar o primeiro
    return tiedMatches[0];
  }

  private scoreMatches(normalizedMessage: string): MatchResult[] {
    const tokens = tokenize(normalizedMessage);

    const matches: MatchResult[] = REQUESTS_CATALOG.map((item) => {
      const tagScore = this.scoreTags(tokens, item);
      const textScore = this.scoreText(tokens, item);
      const exampleScore = this.scoreExamples(tokens, item);

      const raw = tagScore + textScore + exampleScore;
      const score = Math.min(1, raw / 10);

      return { item, score: Number(score.toFixed(4)) };
    });

    return matches.sort((a, b) => b.score - a.score);
  }

  private scoreTags(messageTokens: string[], item: ZeevRequestCatalogItem): number {
    let total = 0;
    for (const tag of item.tags) {
      const normalizedTag = normalizeText(tag);
      const tagTokens = tokenize(normalizedTag);
      const match = tagTokens.every((token) => messageTokens.includes(token));
      if (match) {
        total += 3; // high weight for exact tag presence
      }
    }
    return total;
  }

  private scoreText(messageTokens: string[], item: ZeevRequestCatalogItem): number {
    const nameTokens = tokenize(normalizeText(item.name));
    const descriptionTokens = tokenize(normalizeText(item.description));
    const allTextTokens = new Set([...nameTokens, ...descriptionTokens]);

    let matches = 0;
    for (const token of messageTokens) {
      if (allTextTokens.has(token)) {
        matches += 1.5; // medium weight for name/description overlaps
      }
    }
    return matches;
  }

  private scoreExamples(messageTokens: string[], item: ZeevRequestCatalogItem): number {
    let bestOverlap = 0;

    for (const example of item.examples) {
      const exampleTokens = tokenize(normalizeText(example));
      const overlap = exampleTokens.filter((token) => messageTokens.includes(token)).length;
      if (exampleTokens.length === 0) continue;
      const overlapRatio = overlap / exampleTokens.length;
      if (overlapRatio > bestOverlap) {
        bestOverlap = overlapRatio;
      }
    }

    return bestOverlap * 3; // medium-high weight for example similarity
  }

  private buildLink(item: ZeevRequestCatalogItem, stage: 'hml' | 'prod'): { label: string; url: string } {
    const url = stage === 'prod' ? (item.url_prod ?? item.url_hml) : (item.url_hml ?? item.url_prod);
    return {
      label: 'Abrir solicitação',
      url: url || '', // fallback para evitar undefined
    };
  }

  private logResult(sessionId: string | undefined, stage: 'hml' | 'prod', normalized: string, matches: MatchResult[]): void {
    const topMatches = matches.slice(0, 5).map((match) => ({
      id: match.item.id,
      score: match.score,
    }));

    logger.info(
      JSON.stringify({
        event: 'route_decision',
        sessionId,
        stage,
        message_normalized: normalized,
        topMatches,
      })
    );
  }
}

function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[.,;:/\\|!?()[\]{}'"`~^%$#@*&+-=_<>]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function tokenize(text: string): string[] {
  if (!text) return [];
  return text.split(' ').filter(Boolean);
}

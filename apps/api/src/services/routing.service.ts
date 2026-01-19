import { REQUESTS_CATALOG, type ZeevRequestCatalogItem } from '../catalog/requests.js';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';
import { TroubleshootingService } from './troubleshooting.service.js';

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

export class RoutingService {
  private troubleshootingService: TroubleshootingService;

  constructor() {
    this.troubleshootingService = new TroubleshootingService();
  }

  async route(request: RouteRequest): Promise<{ response: RouteResponse; topMatches: MatchResult[]; normalized: string; stage: 'hml' | 'prod' }> {
    const normalized = normalizeText(request.message);
    const resolvedStage = request.stage ?? env.STAGE_DEFAULT;

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
          const catalogItem = REQUESTS_CATALOG.find((item) => item.id === session.category);

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

    const matches = this.scoreMatches(normalized).slice(0, 5);
    const top1 = matches[0];
    const top2 = matches[1];

    const decision = this.decide(top1, top2);
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

  private decide(top1?: MatchResult, top2?: MatchResult): 'direct_link' | 'choose_option' | 'clarify' {
    if (!top1) return 'clarify';

    const scoreGap = top1.score - (top2?.score ?? 0);

    // Estratégia ultra direta: praticamente sempre vai direto ao formulário

    // Estratégia 1: Qualquer score razoável (>= 0.35), mesmo com gap mínimo
    if (top1.score >= 0.35 && scoreGap >= 0.05) {
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

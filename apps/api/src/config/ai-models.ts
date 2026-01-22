/**
 * Configuração centralizada dos modelos de IA Claude
 *
 * IMPORTANTE: Manter os modelos atualizados conforme disponibilidade da API Anthropic
 */

export const AI_MODELS = {
  /**
   * Modelo principal para roteamento inteligente e troubleshooting
   * Usando Haiku temporariamente (Sonnet não disponível na API key atual)
   * TODO: Atualizar para Sonnet quando disponível
   */
  ROUTING: 'claude-3-haiku-20240307',

  /**
   * Modelo para troubleshooting técnico (quando precisa de conhecimento específico)
   * Usa Haiku para respostas rápidas em troubleshooting
   */
  TROUBLESHOOTING: 'claude-3-haiku-20240307',
} as const;

export type AIModel = typeof AI_MODELS[keyof typeof AI_MODELS];

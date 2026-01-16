import type { ClassificationResult, Category, Priority } from '../models/types.js';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';

export class ClassifierService {
  async classify(text: string): Promise<ClassificationResult> {
    if (env.USE_LLM) {
      return this.classifyWithLLM(text);
    }
    return this.classifyWithHeuristics(text);
  }

  private classifyWithHeuristics(text: string): ClassificationResult {
    const lowerText = text.toLowerCase();
    
    // Priority detection
    const priority = this.detectPriority(lowerText);
    
    // Category detection
    const category = this.detectCategory(lowerText);
    
    return {
      category,
      priority,
      tags: this.extractTags(lowerText),
    };
  }

  private detectPriority(text: string): Priority {
    const highPriorityKeywords = [
      'fora do ar',
      'erro 500',
      'não acessa',
      'urgente',
      'parou',
      'sem internet',
      'sistema down',
      'crash',
      'travado',
      'bloqueado',
    ];
    
    const mediumPriorityKeywords = [
      'erro',
      'instável',
      'lento',
      'problema',
      'bug',
      'não funciona',
      'falha',
    ];
    
    const lowPriorityKeywords = [
      'dúvida',
      'como faço',
      'solicito acesso',
      'pergunta',
      'orientação',
      'ajuda',
      'tutorial',
    ];
    
    for (const keyword of highPriorityKeywords) {
      if (text.includes(keyword)) {
        return 'ALTA';
      }
    }
    
    for (const keyword of mediumPriorityKeywords) {
      if (text.includes(keyword)) {
        return 'MÉDIA';
      }
    }
    
    for (const keyword of lowPriorityKeywords) {
      if (text.includes(keyword)) {
        return 'BAIXA';
      }
    }
    
    // Default to medium if no keywords matched
    return 'MÉDIA';
  }

  private detectCategory(text: string): Category {
    const tiKeywords = [
      'sistema',
      'login',
      'senha',
      'erro',
      'vpn',
      'internet',
      'rede',
      'computador',
      'email',
      'acesso',
      'permissão',
      'software',
      'hardware',
    ];
    
    const comprasKeywords = [
      'pedido',
      'cotação',
      'fornecedor',
      'compra',
      'aquisição',
      'material',
      'produto',
    ];
    
    const financeiroKeywords = [
      'pagamento',
      'nota',
      'reembolso',
      'financeiro',
      'fiscal',
      'imposto',
      'boleto',
      'fatura',
    ];
    
    const rhKeywords = [
      'admissão',
      'férias',
      'holerite',
      'ponto',
      'benefício',
      'folha',
      'rh',
      'recursos humanos',
    ];
    
    for (const keyword of tiKeywords) {
      if (text.includes(keyword)) {
        return 'TI';
      }
    }
    
    for (const keyword of comprasKeywords) {
      if (text.includes(keyword)) {
        return 'Compras';
      }
    }
    
    for (const keyword of financeiroKeywords) {
      if (text.includes(keyword)) {
        return 'Financeiro';
      }
    }
    
    for (const keyword of rhKeywords) {
      if (text.includes(keyword)) {
        return 'RH';
      }
    }
    
    return 'Outros';
  }

  private extractTags(text: string): string[] {
    const tags: string[] = [];
    // Simple tag extraction - can be enhanced
    return tags;
  }

  private async classifyWithLLM(text: string): Promise<ClassificationResult> {
    // TODO: Implement LLM integration if USE_LLM=true
    // This would call an LLM API and parse the response
    logger.warn('LLM classification not implemented, falling back to heuristics');
    return this.classifyWithHeuristics(text);
  }
}

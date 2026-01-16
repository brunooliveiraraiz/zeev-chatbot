import { describe, it, expect } from 'vitest';
import { ClassifierService } from '../src/services/classifier.service';

describe('ClassifierService', () => {
  const service = new ClassifierService();

  it('should classify high priority issues', async () => {
    const result = await service.classify('Sistema fora do ar');
    
    expect(result.priority).toBe('ALTA');
    expect(result.category).toBe('TI');
  });

  it('should classify medium priority issues', async () => {
    const result = await service.classify('Erro ao acessar sistema');
    
    expect(result.priority).toBe('MÉDIA');
  });

  it('should classify low priority issues', async () => {
    const result = await service.classify('Dúvida sobre como usar');
    
    expect(result.priority).toBe('BAIXA');
  });

  it('should detect TI category', async () => {
    const result = await service.classify('Problema de login');
    
    expect(result.category).toBe('TI');
  });

  it('should detect Financeiro category', async () => {
    const result = await service.classify('Problema com pagamento');
    
    expect(result.category).toBe('Financeiro');
  });
});

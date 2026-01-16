import { describe, it, expect } from 'vitest';
import { RoutingService } from '../src/services/routing.service.js';

describe('RoutingService matcher', () => {
  const service = new RoutingService();

  it('should route infraestrutura request', () => {
    const result = service.route({ message: 'meu computador não liga' });
    expect(result.response.type).toBe('direct_link');
    expect('link' in result.response && result.response.link.url).toContain('infraestrutura');
  });

  it('should route ticket raiz request', () => {
    const result = service.route({ message: 'quero abrir chamado' });
    expect(result.response.type).toBe('direct_link');
    expect('link' in result.response && result.response.link.url).toContain('ticket-raiz');
  });

  it('should route sistemas request', () => {
    const result = service.route({ message: 'erro no sistema RM' });
    expect(result.response.type).toBe('direct_link');
    expect('link' in result.response && result.response.link.url).toContain('sistemas');
  });

  it('should route BI request', () => {
    const result = service.route({ message: 'preciso de dashboard' });
    expect(result.response.type).toBe('direct_link');
    expect('link' in result.response && result.response.link.url).toContain('business-intelligence');
  });

  it('should ask to clarify unknown request', () => {
    const result = service.route({ message: 'preciso falar com alguém sobre assunto desconhecido' });
    expect(result.response.type).toBe('clarify');
  });
});

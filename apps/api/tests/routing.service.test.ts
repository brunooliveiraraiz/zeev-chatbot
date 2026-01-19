import { describe, it, expect } from 'vitest';
import { RoutingService } from '../src/services/routing.service.js';

describe('RoutingService matcher', () => {
  const service = new RoutingService();

  it('should route infraestrutura request', async () => {
    const result = await service.route({ message: 'meu computador não liga' });
    expect(result.response.type).toBe('direct_link');
    expect('link' in result.response && result.response.link.url).toContain('infraestrutura');
  });

  it('should route ticket raiz request', async () => {
    const result = await service.route({ message: 'quero abrir chamado' });
    expect(result.response.type).toBe('direct_link');
    expect('link' in result.response && result.response.link.url).toContain('ticket-raiz');
  });

  it('should route sistemas request', async () => {
    const result = await service.route({ message: 'erro no sistema RM' });
    expect(result.response.type).toBe('direct_link');
    expect('link' in result.response && result.response.link.url).toContain('sistemas');
  });

  it('should route BI request', async () => {
    const result = await service.route({ message: 'preciso de dashboard' });
    expect(result.response.type).toBe('direct_link');
    expect('link' in result.response && result.response.link.url).toContain('business-intelligence');
  });

  it('should ask to clarify unknown request', async () => {
    const result = await service.route({ message: 'preciso falar com alguém sobre assunto desconhecido' });
    expect(result.response.type).toBe('clarify');
  });
});

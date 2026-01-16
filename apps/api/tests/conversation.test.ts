import { describe, it, expect } from 'vitest';
import { ConversationService } from '../src/services/conversation.service';
import type { User } from '../src/models/types';

describe('ConversationService', () => {
  const service = new ConversationService();
  const mockUser: User = {
    userId: 'test-user',
    name: 'Test User',
    email: 'test@example.com',
  };

  it('should start conversation', async () => {
    const result = await service.processMessage('', 'START', null, mockUser);
    
    expect(result.newState).toBe('ASK_PROBLEM');
    expect(result.reply).toContain('Olá');
  });

  it('should classify problem and ask urgency', async () => {
    const result = await service.processMessage(
      'Sistema fora do ar',
      'ASK_PROBLEM',
      null,
      mockUser
    );
    
    expect(result.newState).toBe('ASK_URGENCY');
    expect(result.collectedData.category).toBeDefined();
    expect(result.collectedData.priority).toBeDefined();
  });

  it('should handle cancel command', async () => {
    const result = await service.processMessage('cancelar', 'ASK_PROBLEM', null, mockUser);
    
    expect(result.newState).toBe('CANCELLED');
    expect(result.reply).toContain('cancelada');
  });
});

import { MemorySessionRepository } from './session.memory.js';
import type { SessionRepository } from './session.repository.js';

// Singleton instance for in-memory repository
// In production, this would be replaced with SQLite repository based on env
let repositoryInstance: SessionRepository | null = null;

export function getSessionRepository(): SessionRepository {
  if (!repositoryInstance) {
    repositoryInstance = new MemorySessionRepository();
  }
  return repositoryInstance;
}

import type { ChatSession, Message, User, ConversationState, CollectedData } from '../models/types.js';

export interface SessionRepository {
  createSession(userId: string, userData: User, chatSessionToken: string): Promise<ChatSession>;
  getSessionByToken(chatSessionToken: string): Promise<ChatSession | null>;
  getSessionByUserId(userId: string): Promise<ChatSession | null>;
  updateSessionState(sessionId: string, state: ConversationState, collectedData?: CollectedData): Promise<void>;
  addMessage(sessionId: string, role: 'user' | 'bot', content: string, metadata?: Record<string, unknown>): Promise<Message>;
  getMessages(sessionId: string): Promise<Message[]>;
  deleteSession(sessionId: string): Promise<void>;
}

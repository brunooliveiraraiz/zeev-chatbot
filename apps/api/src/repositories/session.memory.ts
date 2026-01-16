import type {
  ChatSession,
  Message,
  User,
  ConversationState,
  CollectedData,
} from '../models/types.js';
import type { SessionRepository } from './session.repository.js';

export class MemorySessionRepository implements SessionRepository {
  private sessions = new Map<string, ChatSession>();
  private messagesBySession = new Map<string, Message[]>();

  async createSession(userId: string, userData: User, chatSessionToken: string): Promise<ChatSession> {
    const session: ChatSession = {
      id: `session-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      userId,
      chatSessionToken,
      userData,
      state: 'START',
      collectedData: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    this.sessions.set(session.id, session);
    this.messagesBySession.set(session.id, []);
    
    return session;
  }

  async getSessionByToken(chatSessionToken: string): Promise<ChatSession | null> {
    for (const session of this.sessions.values()) {
      if (session.chatSessionToken === chatSessionToken) {
        return session;
      }
    }
    return null;
  }

  async getSessionByUserId(userId: string): Promise<ChatSession | null> {
    for (const session of this.sessions.values()) {
      if (session.userId === userId) {
        return session;
      }
    }
    return null;
  }

  async updateSessionState(
    sessionId: string,
    state: ConversationState,
    collectedData?: CollectedData
  ): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }
    
    session.state = state;
    if (collectedData !== undefined) {
      session.collectedData = collectedData;
    }
    session.updatedAt = new Date();
    
    this.sessions.set(sessionId, session);
  }

  async addMessage(
    sessionId: string,
    role: 'user' | 'bot',
    content: string,
    metadata?: Record<string, unknown>
  ): Promise<Message> {
    const message: Message = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      sessionId,
      role,
      content,
      metadata,
      createdAt: new Date(),
    };
    
    const messages = this.messagesBySession.get(sessionId) || [];
    messages.push(message);
    this.messagesBySession.set(sessionId, messages);
    
    return message;
  }

  async getMessages(sessionId: string): Promise<Message[]> {
    return this.messagesBySession.get(sessionId) || [];
  }

  async deleteSession(sessionId: string): Promise<void> {
    this.sessions.delete(sessionId);
    this.messagesBySession.delete(sessionId);
  }
}

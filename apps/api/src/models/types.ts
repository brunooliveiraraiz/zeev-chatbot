export type AuthMode = 'DEV' | 'SIGNED_CONTEXT' | 'JWT_SSO';

export interface User {
  userId: string;
  name?: string;
  email?: string;
  unit?: string;
  coligada?: string;
}

export interface ChatSession {
  id: string;
  userId: string;
  chatSessionToken: string;
  userData: User;
  state: ConversationState;
  collectedData: CollectedData | null;
  createdAt: Date;
  updatedAt: Date;
}

export type ConversationState =
  | 'START'
  | 'ASK_PROBLEM'
  | 'ASK_URGENCY'
  | 'ASK_DETAILS'
  | 'CONFIRM'
  | 'CREATE_TICKET'
  | 'DONE'
  | 'CANCELLED';

export interface CollectedData {
  name?: string;
  email?: string;
  unit?: string;
  coligada?: string;
  category?: string;
  priority?: 'BAIXA' | 'MÉDIA' | 'ALTA';
  urgency?: string;
  description?: string;
}

export interface Message {
  id: string;
  sessionId: string;
  role: 'user' | 'bot';
  content: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
}

export interface ChatMessageRequest {
  message: string;
  channel: string;
  metadata?: Record<string, unknown>;
}

export interface ChatMessageResponse {
  reply: string;
  state: ConversationState;
  ticket?: Ticket | null;
  collected?: CollectedData;
}

export interface Ticket {
  protocol?: string;
  id?: string;
  rawResponse?: unknown;
}

export interface AuthExchangeRequest {
  token?: string;
  context?: string;
}

export interface AuthExchangeResponse {
  chatSessionToken: string;
  user: User;
}

export interface SignedContext {
  userId: string;
  name?: string;
  email?: string;
  unit?: string;
  coligada?: string;
  timestamp: number;
  nonce: string;
}

export interface JWTClaims {
  sub: string;
  name?: string;
  email?: string;
  unit?: string;
  coligada?: string;
  iss?: string;
  aud?: string;
  exp?: number;
}

export type Priority = 'BAIXA' | 'MÉDIA' | 'ALTA';

export type Category = 'TI' | 'Compras' | 'Financeiro' | 'RH' | 'Outros';

export interface ClassificationResult {
  category: Category;
  priority: Priority;
  summary?: string;
  tags?: string[];
}

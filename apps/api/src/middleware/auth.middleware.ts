import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { AuthenticationError } from '../utils/errors.js';
import type { SessionRepository } from '../repositories/session.repository.js';

export interface AuthRequest extends Request {
  userId?: string;
  chatSessionToken?: string;
}

export function authMiddleware(sessionRepository: SessionRepository) {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const authHeader = req.headers.authorization;
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new AuthenticationError('Missing or invalid Authorization header');
      }
      
      const token = authHeader.substring(7);
      
      // Verify token
      try {
        const decoded = jwt.verify(token, env.CHAT_SESSION_SECRET) as { sessionId: string; userId: string };
        
        // Verify session exists
        const session = await sessionRepository.getSessionByToken(token);
        if (!session) {
          throw new AuthenticationError('Session not found');
        }
        
        req.userId = decoded.userId;
        req.chatSessionToken = token;
        
        next();
      } catch (error) {
        if (error instanceof jwt.JsonWebTokenError) {
          throw new AuthenticationError('Invalid token');
        }
        throw error;
      }
    } catch (error) {
      next(error);
    }
  };
}

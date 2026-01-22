import { Router, Request, Response } from 'express';
import jwt, { type SignOptions } from 'jsonwebtoken';
import { env } from '../config/env.js';
import { SSOService } from '../services/sso.service.js';
import { getSessionRepository } from '../repositories/session.repository.factory.js';
import { errorHandler } from '../utils/errors.js';
import { logger } from '../utils/logger.js';
import type { AuthExchangeRequest } from '../models/types.js';

const router = Router();
const ssoService = new SSOService();
const sessionRepository = getSessionRepository();

router.post('/exchange', async (req: Request, res: Response) => {
  try {
    const body: AuthExchangeRequest = req.body;
    const { token, context } = body;
    
    // Extract user from SSO
    const user = await ssoService.validateAndExtractUser(token, context);
    
    // Generate chat session token
    const sessionId = `session-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    const chatSessionToken = jwt.sign(
      { sessionId, userId: user.userId },
      env.CHAT_SESSION_SECRET,
      { expiresIn: env.CHAT_SESSION_EXPIRES_IN } as any
    );
    
    // Create new session (reuse existing logic if needed, but for MVP we create new)
    const session = await sessionRepository.createSession(user.userId, user, chatSessionToken);
    
    logger.info('Auth exchange successful', { userId: user.userId });
    
    res.json({
      chatSessionToken,
      user: {
        userId: user.userId,
        name: user.name,
        email: user.email,
        unit: user.unit,
        coligada: user.coligada,
      },
    });
  } catch (error) {
    logger.error('Auth exchange error', error);
    const handled = errorHandler(error);
    res.status(handled.statusCode).json({
      error: handled.message,
      code: handled.code,
    });
  }
});

router.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    authMode: env.AUTH_MODE,
    timestamp: new Date().toISOString(),
  });
});

export default router;

import { Router, Response } from 'express';
import { ConversationService } from '../services/conversation.service.js';
import { getSessionRepository } from '../repositories/session.repository.factory.js';
import { authMiddleware, type AuthRequest } from '../middleware/auth.middleware.js';
import { errorHandler } from '../utils/errors.js';
import { logger } from '../utils/logger.js';
import type { ChatMessageRequest } from '../models/types.js';

const router = Router();
const conversationService = new ConversationService();
const sessionRepository = getSessionRepository();

// Apply auth middleware to all routes
router.use(authMiddleware(sessionRepository));

router.post('/message', async (req: AuthRequest, res: Response) => {
  try {
    const body: ChatMessageRequest = req.body;
    const { message, channel, metadata } = body;
    
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required' });
    }
    
    if (!req.chatSessionToken) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    // Get session
    const session = await sessionRepository.getSessionByToken(req.chatSessionToken);
    if (!session) {
      return res.status(401).json({ error: 'Session not found' });
    }
    
    // Add user message
    await sessionRepository.addMessage(session.id, 'user', message, metadata);
    
    // Process message
    const result = await conversationService.processMessage(
      message,
      session.state,
      session.collectedData,
      session.userData
    );
    
    // Update session state
    await sessionRepository.updateSessionState(
      session.id,
      result.newState,
      result.collectedData
    );
    
    // Add bot response
    await sessionRepository.addMessage(session.id, 'bot', result.reply);
    
    logger.info('Message processed', {
      sessionId: session.id,
      state: result.newState,
      hasTicket: !!result.ticket,
    });
    
    res.json({
      reply: result.reply,
      state: result.newState,
      ticket: result.ticket || null,
      collected: result.collectedData,
    });
  } catch (error) {
    logger.error('Chat message error', error);
    const handled = errorHandler(error);
    res.status(handled.statusCode).json({
      error: handled.message,
      code: handled.code,
    });
  }
});

router.get('/history', async (req: AuthRequest, res: Response) => {
  try {
    if (!req.chatSessionToken) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const session = await sessionRepository.getSessionByToken(req.chatSessionToken);
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }
    
    const messages = await sessionRepository.getMessages(session.id);
    
    res.json({
      messages: messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
        timestamp: msg.createdAt.toISOString(),
        metadata: msg.metadata,
      })),
    });
  } catch (error) {
    logger.error('Chat history error', error);
    const handled = errorHandler(error);
    res.status(handled.statusCode).json({
      error: handled.message,
      code: handled.code,
    });
  }
});

export default router;

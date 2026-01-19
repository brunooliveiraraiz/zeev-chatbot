import { Router, Request, Response } from 'express';
import { RoutingService } from '../services/routing.service.js';

const router = Router();
const routingService = new RoutingService();

router.post('/route', async (req: Request, res: Response) => {
  const { sessionId, message, stage } = req.body ?? {};

  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'message is required' });
  }

  const { response } = await routingService.route({
    sessionId: typeof sessionId === 'string' ? sessionId : undefined,
    message,
    stage: stage === 'prod' ? 'prod' : stage === 'hml' ? 'hml' : undefined,
  });

  res.json(response);
});

export default router;

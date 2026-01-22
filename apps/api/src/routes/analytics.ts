import { Router } from 'express';
import { AnalyticsService } from '../services/analytics.service.js';
import { logger } from '../utils/logger.js';
import { z } from 'zod';

const router = Router();
const analyticsService = new AnalyticsService();

// Schema de validação para avaliação
const RatingSchema = z.object({
  sessionId: z.string(),
  rating: z.number().int().min(1).max(5).optional(),
  helpful: z.boolean().optional(),
  feedback: z.string().max(1000).optional(),
}).refine((data) => data.rating !== undefined || data.helpful !== undefined, {
  message: "Either 'rating' or 'helpful' must be provided",
});

/**
 * POST /analytics/rating
 * Registra avaliação do usuário
 */
router.post('/rating', async (req, res) => {
  try {
    const validated = RatingSchema.parse(req.body);

    await analyticsService.recordRating(validated);

    res.json({ success: true, message: 'Rating recorded successfully' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Invalid request data', details: error.errors });
    } else {
      logger.error('Error recording rating:', error);
      res.status(500).json({ error: 'Failed to record rating' });
    }
  }
});

/**
 * GET /analytics/stats
 * Obtém estatísticas gerais
 * Query params: startDate, endDate (YYYY-MM-DD)
 */
router.get('/stats', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    let start: Date | undefined;
    let end: Date | undefined;

    if (startDate && typeof startDate === 'string') {
      start = new Date(startDate);
    }

    if (endDate && typeof endDate === 'string') {
      end = new Date(endDate);
      end.setHours(23, 59, 59, 999); // Fim do dia
    }

    const stats = await analyticsService.getStats(start, end);

    res.json(stats);
  } catch (error) {
    logger.error('Error getting stats:', error);
    res.status(500).json({ error: 'Failed to get stats' });
  }
});

/**
 * GET /analytics/daily
 * Obtém estatísticas por dia
 * Query params: startDate, endDate (YYYY-MM-DD)
 */
router.get('/daily', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate || typeof startDate !== 'string' || typeof endDate !== 'string') {
      return res.status(400).json({ error: 'startDate and endDate are required (YYYY-MM-DD)' });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    const stats = await analyticsService.getDailyStats(start, end);

    res.json(stats);
  } catch (error) {
    logger.error('Error getting daily stats:', error);
    res.status(500).json({ error: 'Failed to get daily stats' });
  }
});

/**
 * GET /analytics/monthly/:year
 * Obtém estatísticas por mês de um ano
 */
router.get('/monthly/:year', async (req, res) => {
  try {
    const year = parseInt(req.params.year);

    if (isNaN(year) || year < 2020 || year > 2100) {
      return res.status(400).json({ error: 'Invalid year' });
    }

    const stats = await analyticsService.getMonthlyStats(year);

    res.json(stats);
  } catch (error) {
    logger.error('Error getting monthly stats:', error);
    res.status(500).json({ error: 'Failed to get monthly stats' });
  }
});

/**
 * GET /analytics/feedback
 * Obtém avaliações com feedback
 * Query params: limit (default 50)
 */
router.get('/feedback', async (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;

    const feedback = await analyticsService.getRatingsWithFeedback(limit);

    res.json(feedback);
  } catch (error) {
    logger.error('Error getting feedback:', error);
    res.status(500).json({ error: 'Failed to get feedback' });
  }
});

/**
 * GET /analytics/top-categories
 * Obtém categorias mais resolvidas
 * Query params: limit (default 10)
 */
router.get('/top-categories', async (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;

    const categories = await analyticsService.getTopResolvedCategories(limit);

    res.json(categories);
  } catch (error) {
    logger.error('Error getting top categories:', error);
    res.status(500).json({ error: 'Failed to get top categories' });
  }
});

export default router;

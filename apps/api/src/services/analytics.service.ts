import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger.js';

const prisma = new PrismaClient();

export type ResolutionType = 'troubleshooting' | 'ai_routing' | 'escalated';

export type ResolutionData = {
  sessionId: string;
  resolved: boolean;
  resolvedBy?: ResolutionType;
  category?: string;
  requestId?: string;
};

export type RatingData = {
  sessionId: string;
  rating?: number; // 1-5
  helpful?: boolean; // true/false (alternativa simples)
  feedback?: string;
};

export type AnalyticsStats = {
  total: number;
  resolved: number;
  escalated: number;
  resolutionRate: number;
  avgRating: number | null;
  ratingCount: number;
};

export type DailyStats = {
  date: string; // YYYY-MM-DD
  resolved: number;
  escalated: number;
  total: number;
};

export type MonthlyStats = {
  month: string; // YYYY-MM
  resolved: number;
  escalated: number;
  total: number;
};

export class AnalyticsService {
  /**
   * Registra uma resolução de problema
   */
  async recordResolution(data: ResolutionData): Promise<void> {
    try {
      await prisma.conversationResolution.upsert({
        where: { sessionId: data.sessionId },
        update: {
          resolved: data.resolved,
          resolvedBy: data.resolvedBy,
          category: data.category,
          requestId: data.requestId,
          resolvedAt: data.resolved ? new Date() : null,
        },
        create: {
          sessionId: data.sessionId,
          resolved: data.resolved,
          resolvedBy: data.resolvedBy,
          category: data.category,
          requestId: data.requestId,
          resolvedAt: data.resolved ? new Date() : null,
        },
      });

      logger.info('Resolution recorded', {
        event: 'resolution_recorded',
        sessionId: data.sessionId,
        resolved: data.resolved,
        resolvedBy: data.resolvedBy,
      });
    } catch (error) {
      logger.error('Failed to record resolution:', error);
      throw error;
    }
  }

  /**
   * Registra uma avaliação do usuário
   */
  async recordRating(data: RatingData): Promise<void> {
    try {
      // Validar rating se fornecido
      if (data.rating !== undefined && (data.rating < 1 || data.rating > 5)) {
        throw new Error('Rating must be between 1 and 5');
      }

      await prisma.conversationRating.upsert({
        where: { sessionId: data.sessionId },
        update: {
          rating: data.rating,
          helpful: data.helpful,
          feedback: data.feedback,
        },
        create: {
          sessionId: data.sessionId,
          rating: data.rating || 0, // Default 0 se não fornecido
          helpful: data.helpful,
          feedback: data.feedback,
        },
      });

      logger.info('Rating recorded', {
        event: 'rating_recorded',
        sessionId: data.sessionId,
        rating: data.rating,
        helpful: data.helpful,
      });
    } catch (error) {
      logger.error('Failed to record rating:', error);
      throw error;
    }
  }

  /**
   * Obtém estatísticas gerais
   */
  async getStats(startDate?: Date, endDate?: Date): Promise<AnalyticsStats> {
    try {
      const where = startDate && endDate
        ? {
            createdAt: {
              gte: startDate,
              lte: endDate,
            },
          }
        : {};

      const [resolutions, ratings] = await Promise.all([
        prisma.conversationResolution.findMany({ where }),
        prisma.conversationRating.findMany({ where }),
      ]);

      const total = resolutions.length;
      const resolved = resolutions.filter(r => r.resolved && r.resolvedBy !== 'escalated').length;
      const escalated = resolutions.filter(r => r.resolvedBy === 'escalated').length;

      const ratingsWithValue = ratings.filter(r => r.rating > 0);
      const avgRating = ratingsWithValue.length > 0
        ? ratingsWithValue.reduce((sum, r) => sum + r.rating, 0) / ratingsWithValue.length
        : null;

      return {
        total,
        resolved,
        escalated,
        resolutionRate: total > 0 ? (resolved / total) * 100 : 0,
        avgRating: avgRating ? Number(avgRating.toFixed(2)) : null,
        ratingCount: ratingsWithValue.length,
      };
    } catch (error) {
      logger.error('Failed to get stats:', error);
      throw error;
    }
  }

  /**
   * Obtém estatísticas por dia
   */
  async getDailyStats(startDate: Date, endDate: Date): Promise<DailyStats[]> {
    try {
      const resolutions = await prisma.conversationResolution.findMany({
        where: {
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        },
        orderBy: { createdAt: 'asc' },
      });

      // Agrupar por data
      const dailyMap = new Map<string, DailyStats>();

      resolutions.forEach(resolution => {
        const date = resolution.createdAt.toISOString().split('T')[0];

        if (!dailyMap.has(date)) {
          dailyMap.set(date, {
            date,
            resolved: 0,
            escalated: 0,
            total: 0,
          });
        }

        const stats = dailyMap.get(date)!;
        stats.total++;

        if (resolution.resolved && resolution.resolvedBy !== 'escalated') {
          stats.resolved++;
        } else if (resolution.resolvedBy === 'escalated') {
          stats.escalated++;
        }
      });

      return Array.from(dailyMap.values()).sort((a, b) => a.date.localeCompare(b.date));
    } catch (error) {
      logger.error('Failed to get daily stats:', error);
      throw error;
    }
  }

  /**
   * Obtém estatísticas por mês
   */
  async getMonthlyStats(year: number): Promise<MonthlyStats[]> {
    try {
      const startDate = new Date(year, 0, 1); // 1 de janeiro
      const endDate = new Date(year, 11, 31, 23, 59, 59); // 31 de dezembro

      const resolutions = await prisma.conversationResolution.findMany({
        where: {
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        },
        orderBy: { createdAt: 'asc' },
      });

      // Agrupar por mês
      const monthlyMap = new Map<string, MonthlyStats>();

      resolutions.forEach(resolution => {
        const date = new Date(resolution.createdAt);
        const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

        if (!monthlyMap.has(month)) {
          monthlyMap.set(month, {
            month,
            resolved: 0,
            escalated: 0,
            total: 0,
          });
        }

        const stats = monthlyMap.get(month)!;
        stats.total++;

        if (resolution.resolved && resolution.resolvedBy !== 'escalated') {
          stats.resolved++;
        } else if (resolution.resolvedBy === 'escalated') {
          stats.escalated++;
        }
      });

      // Garantir que todos os 12 meses estejam presentes
      for (let i = 0; i < 12; i++) {
        const month = `${year}-${String(i + 1).padStart(2, '0')}`;
        if (!monthlyMap.has(month)) {
          monthlyMap.set(month, {
            month,
            resolved: 0,
            escalated: 0,
            total: 0,
          });
        }
      }

      return Array.from(monthlyMap.values()).sort((a, b) => a.month.localeCompare(b.month));
    } catch (error) {
      logger.error('Failed to get monthly stats:', error);
      throw error;
    }
  }

  /**
   * Obtém todas as avaliações com feedback
   */
  async getRatingsWithFeedback(limit = 50): Promise<Array<{ sessionId: string; rating: number; feedback: string | null; createdAt: Date }>> {
    try {
      const ratings = await prisma.conversationRating.findMany({
        where: {
          feedback: {
            not: null,
          },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        select: {
          sessionId: true,
          rating: true,
          feedback: true,
          createdAt: true,
        },
      });

      return ratings;
    } catch (error) {
      logger.error('Failed to get ratings with feedback:', error);
      throw error;
    }
  }

  /**
   * Obtém categorias mais resolvidas
   */
  async getTopResolvedCategories(limit = 10): Promise<Array<{ category: string; count: number }>> {
    try {
      const resolutions = await prisma.conversationResolution.findMany({
        where: {
          resolved: true,
          resolvedBy: {
            not: 'escalated',
          },
          category: {
            not: null,
          },
        },
        select: {
          category: true,
        },
      });

      // Contar por categoria
      const categoryCount = new Map<string, number>();
      resolutions.forEach(r => {
        if (r.category) {
          categoryCount.set(r.category, (categoryCount.get(r.category) || 0) + 1);
        }
      });

      // Ordenar e limitar
      return Array.from(categoryCount.entries())
        .map(([category, count]) => ({ category, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, limit);
    } catch (error) {
      logger.error('Failed to get top resolved categories:', error);
      throw error;
    }
  }
}

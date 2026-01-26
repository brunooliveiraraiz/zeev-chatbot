import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Buscar últimas 20 avaliações
    const ratings = await prisma.conversationRating.findMany({
      orderBy: {
        createdAt: 'desc'
      },
      take: 20
    });

    // Estatísticas
    const totalRatings = await prisma.conversationRating.count();
    const avgRating = await prisma.conversationRating.aggregate({
      _avg: {
        rating: true
      }
    });
    const helpfulCount = await prisma.conversationRating.count({
      where: {
        helpful: true
      }
    });
    const notHelpfulCount = await prisma.conversationRating.count({
      where: {
        helpful: false
      }
    });

    return res.status(200).json({
      success: true,
      stats: {
        total: totalRatings,
        avgRating: avgRating._avg.rating ? avgRating._avg.rating.toFixed(2) : null,
        helpful: helpfulCount,
        notHelpful: notHelpfulCount,
        withFeedback: ratings.filter(r => r.feedback).length
      },
      ratings: ratings.map(r => ({
        id: r.id,
        sessionId: r.sessionId,
        rating: r.rating,
        helpful: r.helpful,
        feedback: r.feedback,
        createdAt: r.createdAt
      }))
    });
  } catch (error) {
    console.error('Error listing ratings:', error);

    return res.status(500).json({
      error: 'Internal server error',
      message: 'Erro ao buscar avaliações'
    });
  } finally {
    await prisma.$disconnect();
  }
}

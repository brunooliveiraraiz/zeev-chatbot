import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Endpoint de teste para visualizar estatísticas do relatório
 * (sem enviar email)
 */
export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed. Use GET.' });
  }

  try {
    // Buscar dados
    const [resolutions, allRatings] = await Promise.all([
      prisma.conversationResolution.findMany(),
      prisma.conversationRating.findMany(),
    ]);

    const total = resolutions.length;
    const resolved = resolutions.filter(r => r.resolved && r.resolvedBy !== 'escalated').length;
    const escalated = resolutions.filter(r => r.resolvedBy === 'escalated').length;
    const resolutionRate = total > 0 ? (resolved / total) * 100 : 0;

    // Separar avaliações por tipo
    const starRatings = allRatings.filter(r => r.rating !== null && r.rating > 0);
    const helpfulRatings = allRatings.filter(r => r.helpful !== null);

    // Média de estrelas
    const avgRating = starRatings.length > 0
      ? starRatings.reduce((sum, r) => sum + r.rating, 0) / starRatings.length
      : 0;

    // Contadores útil/não útil
    const helpful = helpfulRatings.filter(r => r.helpful === true).length;
    const notHelpful = helpfulRatings.filter(r => r.helpful === false).length;
    const helpfulRate = helpfulRatings.length > 0
      ? (helpful / helpfulRatings.length) * 100
      : 0;

    const stats = {
      conversacoes: {
        total,
        resolved,
        escalated,
        resolutionRate: resolutionRate.toFixed(1) + '%',
      },
      avaliacoes: {
        estrelas: {
          media: avgRating.toFixed(1),
          quantidade: starRatings.length,
          detalhes: '⭐ Avaliações de 1-5 estrelas'
        },
        utilidade: {
          util: helpful,
          naoUtil: notHelpful,
          total: helpful + notHelpful,
          taxaSatisfacao: helpfulRate.toFixed(1) + '%',
          detalhes: '👍 Útil / 👎 Não útil'
        },
        totalGeralAvaliacoes: allRatings.length
      }
    };

    return res.status(200).json({
      success: true,
      message: 'Estatísticas do relatório (preview)',
      stats: stats,
      explicacao: {
        'Como funciona': 'As avaliações podem ser feitas por estrelas (1-5) OU por útil/não útil',
        'Taxa de Satisfação': 'Percentual de usuários que marcaram como "Útil" entre todas as avaliações de utilidade',
        'Avaliação Média': 'Média das avaliações por estrelas (1-5)',
        'Total Geral': 'Soma de todas as avaliações (estrelas + útil/não útil)'
      }
    });

  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  } finally {
    await prisma.$disconnect();
  }
}

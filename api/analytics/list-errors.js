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
    const { status, errorType, limit = 50 } = req.query;

    // Construir filtros
    const where = {};
    if (status) {
      where.correctionStatus = status;
    }
    if (errorType) {
      where.errorType = errorType;
    }

    // Buscar erros
    const errors = await prisma.conversationError.findMany({
      where,
      orderBy: {
        createdAt: 'desc'
      },
      take: parseInt(limit)
    });

    // Estatísticas
    const stats = {
      total: await prisma.conversationError.count(),
      byStatus: {
        pending: await prisma.conversationError.count({ where: { correctionStatus: 'pending' } }),
        reviewed: await prisma.conversationError.count({ where: { correctionStatus: 'reviewed' } }),
        corrected: await prisma.conversationError.count({ where: { correctionStatus: 'corrected' } }),
        ignored: await prisma.conversationError.count({ where: { correctionStatus: 'ignored' } })
      },
      byType: {
        wrong_form: await prisma.conversationError.count({ where: { errorType: 'wrong_form' } }),
        wrong_response: await prisma.conversationError.count({ where: { errorType: 'wrong_response' } }),
        user_complaint: await prisma.conversationError.count({ where: { errorType: 'user_complaint' } }),
        lost_context: await prisma.conversationError.count({ where: { errorType: 'lost_context' } }),
        timeout: await prisma.conversationError.count({ where: { errorType: 'timeout' } })
      }
    };

    // Formatar erros para resposta
    const formattedErrors = errors.map(error => {
      let conversationHistory = [];
      try {
        conversationHistory = JSON.parse(error.conversationHistory);
      } catch (e) {
        conversationHistory = [];
      }

      return {
        id: error.id,
        sessionId: error.sessionId,
        errorType: error.errorType,
        userMessage: error.userMessage,
        botResponse: error.botResponse,
        conversationHistory: conversationHistory,
        suggestedFormId: error.suggestedFormId,
        actualFormNeeded: error.actualFormNeeded,
        correctionStatus: error.correctionStatus,
        correctedBy: error.correctedBy,
        notes: error.notes,
        createdAt: error.createdAt,
        updatedAt: error.updatedAt
      };
    });

    return res.status(200).json({
      success: true,
      stats: stats,
      errors: formattedErrors,
      count: formattedErrors.length
    });

  } catch (error) {
    console.error('❌ Erro ao listar erros:', error);

    return res.status(500).json({
      error: 'Internal server error',
      message: 'Erro ao buscar lista de erros'
    });
  } finally {
    await prisma.$disconnect();
  }
}

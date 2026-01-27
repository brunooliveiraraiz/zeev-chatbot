import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { sessionId, rating, helpful, feedback } = req.body;

    // Validar sessionId
    if (!sessionId) {
      return res.status(400).json({ error: 'sessionId é obrigatório' });
    }

    // Validar que pelo menos rating ou helpful foi fornecido
    if ((rating === undefined || rating === null) && (helpful === undefined || helpful === null)) {
      return res.status(400).json({ error: 'rating ou helpful é obrigatório' });
    }

    // Validar rating se fornecido
    if (rating !== undefined && rating !== null) {
      if (typeof rating !== 'number' || rating < 1 || rating > 5) {
        return res.status(400).json({ error: 'rating deve ser um número entre 1 e 5' });
      }
    }

    // Validar helpful se fornecido
    if (helpful !== undefined && helpful !== null) {
      if (typeof helpful !== 'boolean') {
        return res.status(400).json({ error: 'helpful deve ser true ou false' });
      }
    }

    // Preparar dados para salvar (apenas incluir campos que foram fornecidos)
    const data = { sessionId };

    if (rating !== undefined && rating !== null) {
      data.rating = rating;
    }

    if (helpful !== undefined && helpful !== null) {
      data.helpful = helpful;
    }

    if (feedback) {
      data.feedback = feedback;
    }

    // Tentar criar ou atualizar rating
    const savedRating = await prisma.conversationRating.upsert({
      where: { sessionId },
      update: data,
      create: data,
    });

    console.log('Rating saved:', savedRating);

    return res.status(200).json({
      success: true,
      message: 'Avaliação salva com sucesso',
      rating: savedRating,
    });
  } catch (error) {
    console.error('Error saving rating:', error);

    // Verificar se é erro de conexão com banco
    if (error.code === 'P1001' || error.code === 'P1002') {
      return res.status(503).json({
        error: 'Erro de conexão com banco de dados',
        message: 'Não foi possível conectar ao banco. Tente novamente em instantes.',
      });
    }

    return res.status(500).json({
      error: 'Internal server error',
      message: 'Erro ao salvar avaliação. Tente novamente.',
    });
  }
}

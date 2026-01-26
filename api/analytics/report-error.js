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
    const {
      sessionId,
      errorType,
      userMessage,
      botResponse,
      conversationHistory,
      suggestedFormId,
      actualFormNeeded,
      notes
    } = req.body;

    // Validar sessionId
    if (!sessionId) {
      return res.status(400).json({ error: 'sessionId é obrigatório' });
    }

    // Validar errorType
    const validErrorTypes = ['wrong_form', 'wrong_response', 'user_complaint', 'timeout', 'lost_context'];
    if (!errorType || !validErrorTypes.includes(errorType)) {
      return res.status(400).json({
        error: 'errorType deve ser um dos seguintes: ' + validErrorTypes.join(', ')
      });
    }

    // Criar registro de erro
    const errorRecord = await prisma.conversationError.create({
      data: {
        sessionId,
        errorType,
        userMessage: userMessage || '',
        botResponse: botResponse || '',
        conversationHistory: JSON.stringify(conversationHistory || []),
        suggestedFormId: suggestedFormId || null,
        actualFormNeeded: actualFormNeeded || null,
        notes: notes || null,
        correctionStatus: 'pending'
      }
    });

    console.log(`⚠️ Erro reportado: ${errorType} - Session: ${sessionId}`);

    return res.status(200).json({
      success: true,
      message: 'Erro registrado com sucesso',
      errorId: errorRecord.id
    });

  } catch (error) {
    console.error('❌ Erro ao registrar erro:', error);

    return res.status(500).json({
      error: 'Internal server error',
      message: 'Erro ao registrar o problema'
    });
  } finally {
    await prisma.$disconnect();
  }
}

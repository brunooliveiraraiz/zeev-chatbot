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
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  try {
    // SQL para criar tabela ConversationError
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "ConversationError" (
          "id" TEXT NOT NULL PRIMARY KEY,
          "sessionId" TEXT NOT NULL,
          "errorType" TEXT NOT NULL,
          "userMessage" TEXT NOT NULL,
          "botResponse" TEXT NOT NULL,
          "conversationHistory" TEXT NOT NULL,
          "suggestedFormId" TEXT,
          "actualFormNeeded" TEXT,
          "correctionStatus" TEXT NOT NULL DEFAULT 'pending',
          "correctedBy" TEXT,
          "notes" TEXT,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Criar índices
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "ConversationError_sessionId_idx" ON "ConversationError"("sessionId");`);
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "ConversationError_errorType_idx" ON "ConversationError"("errorType");`);
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "ConversationError_correctionStatus_idx" ON "ConversationError"("correctionStatus");`);
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "ConversationError_createdAt_idx" ON "ConversationError"("createdAt");`);

    return res.status(200).json({
      success: true,
      message: 'Tabela ConversationError criada com sucesso!',
      table: 'ConversationError'
    });

  } catch (error) {
    console.error('Setup error table error:', error);

    return res.status(500).json({
      error: 'Failed to setup error table',
      message: error.message,
      code: error.code
    });
  } finally {
    await prisma.$disconnect();
  }
}

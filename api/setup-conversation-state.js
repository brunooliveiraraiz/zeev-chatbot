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
    // SQL para criar tabela ConversationState
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "ConversationState" (
          "id" TEXT NOT NULL PRIMARY KEY,
          "sessionId" TEXT NOT NULL UNIQUE,
          "attemptCount" INTEGER NOT NULL DEFAULT 0,
          "history" TEXT NOT NULL,
          "hasSentLink" BOOLEAN NOT NULL DEFAULT false,
          "messagesSinceLinkSent" INTEGER NOT NULL DEFAULT 0,
          "lastActivity" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Criar índices
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "ConversationState_sessionId_idx" ON "ConversationState"("sessionId");`);
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "ConversationState_lastActivity_idx" ON "ConversationState"("lastActivity");`);

    return res.status(200).json({
      success: true,
      message: 'Tabela ConversationState criada com sucesso!',
      table: 'ConversationState'
    });

  } catch (error) {
    console.error('Setup conversation state error:', error);

    return res.status(500).json({
      error: 'Failed to setup conversation state table',
      message: error.message,
      code: error.code
    });
  } finally {
    await prisma.$disconnect();
  }
}

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  try {
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "ConversationState" (
          "id" TEXT NOT NULL,
          "sessionId" TEXT NOT NULL UNIQUE,
          "attemptCount" INTEGER NOT NULL DEFAULT 0,
          "history" TEXT NOT NULL,
          "hasSentLink" BOOLEAN NOT NULL DEFAULT false,
          "messagesSinceLinkSent" INTEGER NOT NULL DEFAULT 0,
          "lastActivity" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          PRIMARY KEY ("id")
      );
    `);

    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "ConversationState_sessionId_idx" ON "ConversationState"("sessionId");`);
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "ConversationState_lastActivity_idx" ON "ConversationState"("lastActivity");`);

    return res.status(200).json({ success: true, message: 'ConversationState table created!' });
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: error.message });
  } finally {
    await prisma.$disconnect();
  }
}

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
    // SQL compatível com PostgreSQL
    await prisma.$executeRawUnsafe(`
      -- CreateTable Session
      CREATE TABLE IF NOT EXISTS "Session" (
          "id" TEXT NOT NULL PRIMARY KEY,
          "userId" TEXT NOT NULL,
          "chatSessionToken" TEXT NOT NULL UNIQUE,
          "userData" TEXT NOT NULL,
          "state" TEXT NOT NULL DEFAULT 'START',
          "collectedData" TEXT,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL
      );
    `);

    await prisma.$executeRawUnsafe(`
      -- CreateTable Message
      CREATE TABLE IF NOT EXISTS "Message" (
          "id" TEXT NOT NULL PRIMARY KEY,
          "sessionId" TEXT NOT NULL,
          "role" TEXT NOT NULL,
          "content" TEXT NOT NULL,
          "metadata" TEXT,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "Message_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session" ("id") ON DELETE CASCADE ON UPDATE CASCADE
      );
    `);

    await prisma.$executeRawUnsafe(`
      -- CreateTable ConversationResolution
      CREATE TABLE IF NOT EXISTS "ConversationResolution" (
          "id" TEXT NOT NULL PRIMARY KEY,
          "sessionId" TEXT NOT NULL UNIQUE,
          "resolved" BOOLEAN NOT NULL DEFAULT false,
          "resolvedBy" TEXT,
          "category" TEXT,
          "requestId" TEXT,
          "resolvedAt" TIMESTAMP(3),
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL
      );
    `);

    await prisma.$executeRawUnsafe(`
      -- CreateTable ConversationRating
      CREATE TABLE IF NOT EXISTS "ConversationRating" (
          "id" TEXT NOT NULL PRIMARY KEY,
          "sessionId" TEXT NOT NULL UNIQUE,
          "rating" INTEGER NOT NULL,
          "feedback" TEXT,
          "helpful" BOOLEAN,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await prisma.$executeRawUnsafe(`
      -- CreateTable ConversationState
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
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "Session_userId_idx" ON "Session"("userId");`);
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "Session_chatSessionToken_idx" ON "Session"("chatSessionToken");`);
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "Message_sessionId_idx" ON "Message"("sessionId");`);
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "ConversationResolution_resolved_idx" ON "ConversationResolution"("resolved");`);
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "ConversationResolution_resolvedAt_idx" ON "ConversationResolution"("resolvedAt");`);
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "ConversationResolution_category_idx" ON "ConversationResolution"("category");`);
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "ConversationRating_rating_idx" ON "ConversationRating"("rating");`);
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "ConversationRating_createdAt_idx" ON "ConversationRating"("createdAt");`);
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "ConversationState_sessionId_idx" ON "ConversationState"("sessionId");`);
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "ConversationState_lastActivity_idx" ON "ConversationState"("lastActivity");`);

    // Alterar coluna rating para ser nullable (suporta útil/não útil sem rating)
    try {
      await prisma.$executeRawUnsafe(`ALTER TABLE "ConversationRating" ALTER COLUMN "rating" DROP NOT NULL;`);
    } catch (error) {
      // Ignora se coluna já é nullable
      console.log('Rating column already nullable or error:', error.message);
    }

    return res.status(200).json({
      success: true,
      message: 'Tabelas criadas/atualizadas com sucesso!',
      tables_created: ['Session', 'Message', 'ConversationResolution', 'ConversationRating', 'ConversationState']
    });

  } catch (error) {
    console.error('Setup database error:', error);

    return res.status(500).json({
      error: 'Failed to setup database',
      message: error.message,
      code: error.code
    });
  } finally {
    await prisma.$disconnect();
  }
}

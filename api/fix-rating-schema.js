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
    // SQL para alterar coluna rating para ser nullable
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "ConversationRating"
      ALTER COLUMN "rating" DROP NOT NULL;
    `);

    return res.status(200).json({
      success: true,
      message: 'Schema de rating atualizado com sucesso! Campo rating agora é opcional.',
    });

  } catch (error) {
    console.error('Fix rating schema error:', error);

    return res.status(500).json({
      error: 'Failed to fix rating schema',
      message: error.message,
      code: error.code
    });
  } finally {
    await prisma.$disconnect();
  }
}

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

  try {
    // Testar conexão com banco
    await prisma.$connect();

    // Verificar se consegue fazer query
    const count = await prisma.conversationRating.count();

    return res.status(200).json({
      success: true,
      message: 'Conexão com banco funcionando!',
      database_url_exists: !!process.env.DATABASE_URL,
      database_url_prefix: process.env.DATABASE_URL ? process.env.DATABASE_URL.substring(0, 20) + '...' : 'não configurada',
      ratings_count: count
    });
  } catch (error) {
    console.error('Database test error:', error);

    return res.status(500).json({
      error: 'Database connection failed',
      message: error.message,
      code: error.code,
      database_url_exists: !!process.env.DATABASE_URL
    });
  } finally {
    await prisma.$disconnect();
  }
}

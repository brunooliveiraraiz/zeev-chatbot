const { PrismaClient } = require('@prisma/client');
const path = require('path');

const dbPath = path.join(__dirname, '../apps/api/prisma/chatbot.db');
console.log(`🔍 Buscando banco de dados em: ${dbPath}\n`);

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: `file:${dbPath}`
    }
  }
});

async function checkRatings() {
  try {
    // Contar total de avaliações
    const totalRatings = await prisma.conversationRating.count();
    console.log(`\n📊 Total de avaliações: ${totalRatings}\n`);

    if (totalRatings > 0) {
      // Buscar últimas 10 avaliações
      const recentRatings = await prisma.conversationRating.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' }
      });

      console.log('📝 Últimas 10 avaliações:\n');
      recentRatings.forEach((rating, index) => {
        console.log(`${index + 1}. Session: ${rating.sessionId}`);
        console.log(`   Rating: ${rating.rating ? `⭐ ${rating.rating} estrelas` : 'N/A'}`);
        console.log(`   Helpful: ${rating.helpful !== null ? (rating.helpful ? '👍 Útil' : '👎 Não útil') : 'N/A'}`);
        console.log(`   Data: ${rating.createdAt.toLocaleString('pt-BR')}`);
        if (rating.feedback) {
          console.log(`   Feedback: ${rating.feedback}`);
        }
        console.log('');
      });

      // Estatísticas
      const stats = await prisma.conversationRating.groupBy({
        by: ['rating'],
        _count: { rating: true }
      });

      console.log('\n📈 Distribuição por estrelas:');
      stats.forEach(stat => {
        if (stat.rating) {
          console.log(`   ${stat.rating} estrelas: ${stat._count.rating} avaliações`);
        }
      });

      // Contagem de útil/não útil
      const helpfulCount = await prisma.conversationRating.count({
        where: { helpful: true }
      });
      const notHelpfulCount = await prisma.conversationRating.count({
        where: { helpful: false }
      });

      console.log('\n👍👎 Avaliações simples:');
      console.log(`   Útil: ${helpfulCount}`);
      console.log(`   Não útil: ${notHelpfulCount}`);
    } else {
      console.log('⚠️  Nenhuma avaliação registrada ainda.\n');
    }

    // Verificar resoluções
    const totalResolutions = await prisma.conversationResolution.count();
    console.log(`\n🎯 Total de conversas resolvidas: ${totalResolutions}\n`);

  } catch (error) {
    console.error('❌ Erro ao consultar banco de dados:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkRatings();

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkRatings() {
  try {
    console.log('\n🔍 Verificando avaliações no banco de dados...\n');

    // Contar total de avaliações
    const totalRatings = await prisma.conversationRating.count();
    console.log(`📊 Total de avaliações: ${totalRatings}`);

    if (totalRatings > 0) {
      // Buscar últimas 10 avaliações
      const recentRatings = await prisma.conversationRating.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' }
      });

      console.log('\n📝 Últimas 10 avaliações:\n');
      recentRatings.forEach((rating, index) => {
        console.log(`${index + 1}. Session: ${rating.sessionId.substring(0, 8)}...`);
        console.log(`   Rating: ${rating.rating ? `⭐ ${rating.rating} estrelas` : 'N/A'}`);
        console.log(`   Helpful: ${rating.helpful !== null ? (rating.helpful ? '👍 Útil' : '👎 Não útil') : 'N/A'}`);
        console.log(`   Data: ${rating.createdAt.toLocaleString('pt-BR')}`);
        if (rating.feedback) {
          console.log(`   Feedback: ${rating.feedback}`);
        }
        console.log('');
      });

      // Estatísticas por estrelas
      const ratingCounts = await prisma.$queryRaw<Array<{ rating: number; count: bigint }>>`
        SELECT rating, COUNT(*) as count
        FROM ConversationRating
        WHERE rating IS NOT NULL
        GROUP BY rating
        ORDER BY rating DESC
      `;

      if (ratingCounts.length > 0) {
        console.log('\n📈 Distribuição por estrelas:');
        ratingCounts.forEach(stat => {
          console.log(`   ${stat.rating} estrelas: ${stat.count} avaliações`);
        });
      }

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
      console.log('⚠️  Nenhuma avaliação registrada ainda.');
      console.log('\n💡 Para testar, acesse o widget e envie uma avaliação após uma conversa.');
    }

    // Verificar resoluções
    const totalResolutions = await prisma.conversationResolution.count();
    const resolvedCount = await prisma.conversationResolution.count({
      where: { resolved: true }
    });

    console.log(`\n🎯 Conversas rastreadas: ${totalResolutions}`);
    console.log(`   Resolvidas: ${resolvedCount}`);
    console.log(`   Não resolvidas: ${totalResolutions - resolvedCount}\n`);

  } catch (error) {
    console.error('❌ Erro ao consultar banco de dados:', error);
    console.error('\n💡 Certifique-se de que:');
    console.error('   1. O banco de dados existe em apps/api/prisma/data/chatbot.db');
    console.error('   2. As migrações foram executadas: npx prisma migrate dev');
    console.error('   3. O Prisma Client está atualizado: npx prisma generate\n');
  } finally {
    await prisma.$disconnect();
  }
}

checkRatings();

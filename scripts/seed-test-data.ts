import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedTestData() {
  console.log('📊 Criando dados de teste...');

  // Criar resoluções dos últimos 30 dias
  const today = new Date();
  const resolutions = [];

  for (let i = 0; i < 30; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);

    // 3-10 resoluções por dia
    const count = Math.floor(Math.random() * 8) + 3;

    for (let j = 0; j < count; j++) {
      const resolved = Math.random() > 0.3; // 70% resolvido
      const resolvedBy = resolved
        ? Math.random() > 0.5 ? 'troubleshooting' : 'ai_routing'
        : 'escalated';

      resolutions.push({
        sessionId: `test-${i}-${j}-${Date.now()}`,
        resolved,
        resolvedBy,
        category: resolved ? 'ti_infraestrutura' : undefined,
        resolvedAt: resolved ? date : null,
        createdAt: date,
      });
    }
  }

  // Inserir no banco
  for (const resolution of resolutions) {
    await prisma.conversationResolution.create({
      data: resolution,
    });
  }

  console.log(`✅ ${resolutions.length} resoluções criadas`);

  // Criar algumas avaliações adicionais
  const ratings = [
    { sessionId: 'rate-1', rating: 5, feedback: 'Perfeito!' },
    { sessionId: 'rate-2', rating: 4, feedback: 'Muito bom' },
    { sessionId: 'rate-3', rating: 5, helpful: true },
    { sessionId: 'rate-4', rating: 3, helpful: false, feedback: 'Razoável' },
    { sessionId: 'rate-5', rating: 5 },
    { sessionId: 'rate-6', rating: 4 },
  ];

  for (const rating of ratings) {
    await prisma.conversationRating.create({
      data: rating,
    });
  }

  console.log(`✅ ${ratings.length} avaliações criadas`);

  await prisma.$disconnect();
  console.log('✅ Dados de teste criados com sucesso!');
}

seedTestData().catch((error) => {
  console.error('❌ Erro:', error);
  process.exit(1);
});

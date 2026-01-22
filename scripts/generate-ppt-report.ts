import pptxgen from 'pptxgenjs';
import { PrismaClient } from '@prisma/client';
import * as path from 'path';
import * as fs from 'fs';

const prisma = new PrismaClient();

type DailyData = {
  date: string;
  resolved: number;
  escalated: number;
  total: number;
};

type MonthlyData = {
  month: string;
  resolved: number;
  escalated: number;
  total: number;
};

/**
 * Obtém dados diários dos últimos 30 dias
 */
async function getDailyData(): Promise<DailyData[]> {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 30);

  const resolutions = await prisma.conversationResolution.findMany({
    where: {
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    },
    orderBy: { createdAt: 'asc' },
  });

  // Agrupar por data
  const dailyMap = new Map<string, DailyData>();

  resolutions.forEach((resolution) => {
    const date = resolution.createdAt.toISOString().split('T')[0];

    if (!dailyMap.has(date)) {
      dailyMap.set(date, {
        date,
        resolved: 0,
        escalated: 0,
        total: 0,
      });
    }

    const stats = dailyMap.get(date)!;
    stats.total++;

    if (resolution.resolved && resolution.resolvedBy !== 'escalated') {
      stats.resolved++;
    } else if (resolution.resolvedBy === 'escalated') {
      stats.escalated++;
    }
  });

  // Preencher dias sem dados
  const allDays: DailyData[] = [];
  const currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    const dateStr = currentDate.toISOString().split('T')[0];
    allDays.push(dailyMap.get(dateStr) || {
      date: dateStr,
      resolved: 0,
      escalated: 0,
      total: 0,
    });
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return allDays.sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * Obtém dados mensais do ano atual
 */
async function getMonthlyData(): Promise<MonthlyData[]> {
  const currentYear = new Date().getFullYear();
  const startDate = new Date(currentYear, 0, 1);
  const endDate = new Date(currentYear, 11, 31, 23, 59, 59);

  const resolutions = await prisma.conversationResolution.findMany({
    where: {
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    },
    orderBy: { createdAt: 'asc' },
  });

  // Agrupar por mês
  const monthlyMap = new Map<string, MonthlyData>();

  resolutions.forEach((resolution) => {
    const date = new Date(resolution.createdAt);
    const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

    if (!monthlyMap.has(month)) {
      monthlyMap.set(month, {
        month,
        resolved: 0,
        escalated: 0,
        total: 0,
      });
    }

    const stats = monthlyMap.get(month)!;
    stats.total++;

    if (resolution.resolved && resolution.resolvedBy !== 'escalated') {
      stats.resolved++;
    } else if (resolution.resolvedBy === 'escalated') {
      stats.escalated++;
    }
  });

  // Garantir todos os 12 meses
  const allMonths: MonthlyData[] = [];
  for (let i = 0; i < 12; i++) {
    const month = `${currentYear}-${String(i + 1).padStart(2, '0')}`;
    allMonths.push(monthlyMap.get(month) || {
      month,
      resolved: 0,
      escalated: 0,
      total: 0,
    });
  }

  return allMonths.sort((a, b) => a.month.localeCompare(b.month));
}

/**
 * Obtém estatísticas gerais
 */
async function getGeneralStats() {
  const [resolutions, ratings] = await Promise.all([
    prisma.conversationResolution.findMany(),
    prisma.conversationRating.findMany({ where: { rating: { gt: 0 } } }),
  ]);

  const total = resolutions.length;
  const resolved = resolutions.filter(r => r.resolved && r.resolvedBy !== 'escalated').length;
  const escalated = resolutions.filter(r => r.resolvedBy === 'escalated').length;
  const resolutionRate = total > 0 ? (resolved / total) * 100 : 0;

  const avgRating = ratings.length > 0
    ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
    : 0;

  return {
    total,
    resolved,
    escalated,
    resolutionRate: resolutionRate.toFixed(1),
    avgRating: avgRating.toFixed(1),
    ratingCount: ratings.length,
  };
}

/**
 * Formata data para exibição
 */
function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.split('-');
  return `${day}/${month}`;
}

/**
 * Formata mês para exibição
 */
function formatMonth(monthStr: string): string {
  const [year, month] = monthStr.split('-');
  const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  return monthNames[parseInt(month) - 1];
}

/**
 * Gera o PPT com os gráficos
 */
async function generatePPT() {
  console.log('📊 Gerando relatório PPT...');

  const pptx = new pptxgen();

  // Obter dados
  const [dailyData, monthlyData, stats] = await Promise.all([
    getDailyData(),
    getMonthlyData(),
    getGeneralStats(),
  ]);

  console.log(`📈 Dados coletados: ${dailyData.length} dias, ${monthlyData.length} meses`);

  // ==================== SLIDE 1: TÍTULO ====================
  const slide1 = pptx.addSlide();
  slide1.background = { color: '1E40AF' }; // Azul escuro

  slide1.addText('Relatório de Analytics', {
    x: 1,
    y: 2,
    w: 8,
    h: 1,
    fontSize: 44,
    bold: true,
    color: 'FFFFFF',
    align: 'center',
  });

  slide1.addText('Chatbot Zeev - Raiz Educação', {
    x: 1,
    y: 3,
    w: 8,
    h: 0.5,
    fontSize: 24,
    color: 'FFFFFF',
    align: 'center',
  });

  slide1.addText(new Date().toLocaleDateString('pt-BR'), {
    x: 1,
    y: 4,
    w: 8,
    h: 0.5,
    fontSize: 18,
    color: 'FFFFFF',
    align: 'center',
  });

  // ==================== SLIDE 2: ESTATÍSTICAS GERAIS ====================
  const slide2 = pptx.addSlide();
  slide2.addText('Estatísticas Gerais', {
    x: 0.5,
    y: 0.5,
    w: 9,
    h: 0.7,
    fontSize: 32,
    bold: true,
    color: '1E40AF',
  });

  const statsData = [
    ['Métrica', 'Valor'],
    ['Total de Conversas', stats.total.toString()],
    ['Problemas Resolvidos', stats.resolved.toString()],
    ['Escalados para Formulário', stats.escalated.toString()],
    ['Taxa de Resolução', `${stats.resolutionRate}%`],
    ['Avaliação Média', `${stats.avgRating} ⭐ (${stats.ratingCount} avaliações)`],
  ];

  slide2.addTable(statsData, {
    x: 1.5,
    y: 1.5,
    w: 7,
    colW: [4, 3],
    rowH: 0.5,
    fontSize: 16,
    border: { pt: 1, color: 'CCCCCC' },
    fill: { color: 'F3F4F6' },
    color: '1F2937',
    align: 'center',
    valign: 'middle',
  });

  // ==================== SLIDE 3: GRÁFICO DIÁRIO ====================
  const slide3 = pptx.addSlide();
  slide3.addText('Resoluções por Dia (Últimos 30 Dias)', {
    x: 0.5,
    y: 0.5,
    w: 9,
    h: 0.7,
    fontSize: 28,
    bold: true,
    color: '1E40AF',
  });

  // Preparar dados para o gráfico
  const chartLabels = dailyData.map(d => formatDate(d.date));
  const chartDataResolved = dailyData.map(d => d.resolved);
  const chartDataEscalated = dailyData.map(d => d.escalated);

  slide3.addChart(pptx.ChartType.line, [
    {
      name: 'Resolvidos',
      labels: chartLabels,
      values: chartDataResolved,
    },
    {
      name: 'Escalados',
      labels: chartLabels,
      values: chartDataEscalated,
    },
  ], {
    x: 0.5,
    y: 1.5,
    w: 9,
    h: 4.5,
    showLabel: true,
    showValue: false,
    showLegend: true,
    legendPos: 'b',
    chartColors: ['10B981', 'EF4444'], // Verde e Vermelho
    valAxisMaxVal: Math.max(...chartDataResolved, ...chartDataEscalated) + 5,
  });

  // ==================== SLIDE 4: GRÁFICO MENSAL ====================
  const slide4 = pptx.addSlide();
  slide4.addText(`Resoluções por Mês (${new Date().getFullYear()})`, {
    x: 0.5,
    y: 0.5,
    w: 9,
    h: 0.7,
    fontSize: 28,
    bold: true,
    color: '1E40AF',
  });

  const monthlyLabels = monthlyData.map(d => formatMonth(d.month));
  const monthlyResolved = monthlyData.map(d => d.resolved);
  const monthlyEscalated = monthlyData.map(d => d.escalated);

  slide4.addChart(pptx.ChartType.bar, [
    {
      name: 'Resolvidos',
      labels: monthlyLabels,
      values: monthlyResolved,
    },
    {
      name: 'Escalados',
      labels: monthlyLabels,
      values: monthlyEscalated,
    },
  ], {
    x: 0.5,
    y: 1.5,
    w: 9,
    h: 4.5,
    barDir: 'col',
    showLabel: true,
    showValue: true,
    showLegend: true,
    legendPos: 'b',
    chartColors: ['10B981', 'EF4444'],
    valAxisMaxVal: Math.max(...monthlyResolved, ...monthlyEscalated) + 10,
  });

  // ==================== SALVAR PPT ====================
  const reportsDir = path.join(process.cwd(), 'scripts', 'reports');

  // Criar diretório se não existe
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/:/g, '-').split('.')[0];
  const filename = `analytics-report-${timestamp}.pptx`;
  const filepath = path.join(reportsDir, filename);

  await pptx.writeFile({ fileName: filepath });

  console.log(`✅ Relatório gerado com sucesso: ${filepath}`);
  console.log(`📊 Total: ${stats.total} conversas | Resolvidos: ${stats.resolved} | Taxa: ${stats.resolutionRate}%`);

  await prisma.$disconnect();
}

// Executar
generatePPT().catch((error) => {
  console.error('❌ Erro ao gerar relatório:', error);
  process.exit(1);
});

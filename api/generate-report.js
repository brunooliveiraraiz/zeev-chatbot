import pptxgen from 'pptxgenjs';
import { PrismaClient } from '@prisma/client';
import nodemailer from 'nodemailer';

const prisma = new PrismaClient();

/**
 * Obtém dados diários dos últimos 30 dias
 */
async function getDailyData() {
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
  const dailyMap = new Map();

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

    const stats = dailyMap.get(date);
    stats.total++;

    if (resolution.resolved && resolution.resolvedBy !== 'escalated') {
      stats.resolved++;
    } else if (resolution.resolvedBy === 'escalated') {
      stats.escalated++;
    }
  });

  // Preencher dias sem dados
  const allDays = [];
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
async function getMonthlyData() {
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
  const monthlyMap = new Map();

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

    const stats = monthlyMap.get(month);
    stats.total++;

    if (resolution.resolved && resolution.resolvedBy !== 'escalated') {
      stats.resolved++;
    } else if (resolution.resolvedBy === 'escalated') {
      stats.escalated++;
    }
  });

  // Garantir todos os 12 meses
  const allMonths = [];
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
function formatDate(dateStr) {
  const [year, month, day] = dateStr.split('-');
  return `${day}/${month}`;
}

/**
 * Formata mês para exibição
 */
function formatMonth(monthStr) {
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
    chartColors: ['10B981', 'EF4444'],
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

  // Retornar PPT como base64
  const pptxBuffer = await pptx.write({ outputType: 'nodebuffer' });

  return {
    buffer: pptxBuffer,
    stats,
    filename: `analytics-report-${new Date().toISOString().split('T')[0]}.pptx`
  };
}

/**
 * Envia o relatório por email
 */
async function sendEmailReport(pptBuffer, filename, stats) {
  console.log('📧 Enviando email...');

  // Configurar transporte SMTP
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  // Configurar email
  const mailOptions = {
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to: process.env.REPORT_EMAIL_TO,
    subject: `📊 Relatório Semanal - Chatbot Zeev (${new Date().toLocaleDateString('pt-BR')})`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1E40AF;">Relatório Semanal - Chatbot Zeev</h2>
        <p>Olá!</p>
        <p>Segue em anexo o relatório semanal de analytics do Chatbot Zeev da Raiz Educação.</p>

        <div style="background-color: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #1E40AF; margin-top: 0;">📈 Resumo Executivo</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #E5E7EB;"><strong>Total de Conversas:</strong></td>
              <td style="padding: 8px; border-bottom: 1px solid #E5E7EB; text-align: right;">${stats.total}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #E5E7EB;"><strong>Problemas Resolvidos:</strong></td>
              <td style="padding: 8px; border-bottom: 1px solid #E5E7EB; text-align: right;">${stats.resolved}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #E5E7EB;"><strong>Escalados:</strong></td>
              <td style="padding: 8px; border-bottom: 1px solid #E5E7EB; text-align: right;">${stats.escalated}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #E5E7EB;"><strong>Taxa de Resolução:</strong></td>
              <td style="padding: 8px; border-bottom: 1px solid #E5E7EB; text-align: right;">${stats.resolutionRate}%</td>
            </tr>
            <tr>
              <td style="padding: 8px;"><strong>Avaliação Média:</strong></td>
              <td style="padding: 8px; text-align: right;">${stats.avgRating} ⭐ (${stats.ratingCount} avaliações)</td>
            </tr>
          </table>
        </div>

        <p>O relatório completo com gráficos detalhados está disponível no arquivo em anexo.</p>

        <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 30px 0;">

        <p style="color: #6B7280; font-size: 12px;">
          Este é um email automático gerado pelo sistema de analytics do Chatbot Zeev.<br>
          Período: ${new Date().toLocaleDateString('pt-BR')}
        </p>
      </div>
    `,
    attachments: [
      {
        filename: filename,
        content: pptBuffer,
        contentType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      },
    ],
  };

  // Enviar email
  const info = await transporter.sendMail(mailOptions);
  console.log('✅ Email enviado:', info.messageId);

  return info;
}

/**
 * Handler principal
 */
export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Verificar autenticação (segurança para não permitir execução não autorizada)
  const authHeader = req.headers.authorization;
  const expectedToken = process.env.CRON_SECRET || 'default-secret-change-this';

  if (authHeader !== `Bearer ${expectedToken}`) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Token de autenticação inválido'
    });
  }

  try {
    console.log('🚀 Iniciando geração de relatório...');

    // Verificar variáveis de ambiente
    const requiredEnvVars = ['SMTP_HOST', 'SMTP_USER', 'SMTP_PASS', 'REPORT_EMAIL_TO'];
    const missingVars = requiredEnvVars.filter(v => !process.env[v]);

    if (missingVars.length > 0) {
      return res.status(500).json({
        error: 'Configuration error',
        message: `Variáveis de ambiente faltando: ${missingVars.join(', ')}`
      });
    }

    // Gerar PPT
    const { buffer, stats, filename } = await generatePPT();
    console.log(`✅ PPT gerado: ${filename}`);

    // Enviar por email
    const emailInfo = await sendEmailReport(buffer, filename, stats);
    console.log('✅ Email enviado com sucesso');

    return res.status(200).json({
      success: true,
      message: 'Relatório gerado e enviado com sucesso',
      stats: stats,
      filename: filename,
      emailId: emailInfo.messageId,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Erro ao gerar relatório:', error);

    return res.status(500).json({
      error: 'Internal server error',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  } finally {
    await prisma.$disconnect();
  }
}

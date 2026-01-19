#!/usr/bin/env node

/**
 * Script de Análise de Logs do Chatbot
 *
 * Analisa os logs da API para identificar:
 * - Erros de matching (score baixo)
 * - Solicitações mais usadas
 * - Solicitações que nunca são usadas
 * - Padrões de mensagens que não fazem match
 *
 * Uso: node scripts/analyze-logs.js [caminho-do-log]
 */

const fs = require('fs');
const path = require('path');

// Cores para console
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m'
};

const MIN_ACCEPTABLE_SCORE = 0.5;
const LOW_SCORE_THRESHOLD = 0.3;

async function analyzeLogs() {
  console.log(`${colors.bold}${colors.cyan}╔════════════════════════════════════════════╗${colors.reset}`);
  console.log(`${colors.bold}${colors.cyan}║    ANÁLISE DE LOGS DO CHATBOT ZEEV         ║${colors.reset}`);
  console.log(`${colors.bold}${colors.cyan}╚════════════════════════════════════════════╝${colors.reset}\n`);

  const timestamp = new Date().toLocaleString('pt-BR');
  console.log(`📅 Data/Hora: ${timestamp}\n`);

  // Determina o arquivo de log
  const logFile = process.argv[2] || findLatestLogFile();

  if (!logFile || !fs.existsSync(logFile)) {
    console.error(`${colors.red}❌ Arquivo de log não encontrado${colors.reset}`);
    console.log(`\nUso: node scripts/analyze-logs.js [caminho-do-log]`);
    process.exit(1);
  }

  console.log(`📄 Analisando: ${logFile}\n`);

  // Lê o arquivo de log
  const logContent = fs.readFileSync(logFile, 'utf-8');
  const logLines = logContent.split('\n').filter(Boolean);

  const stats = {
    totalRequests: 0,
    lowScoreRequests: [],
    requestsByCategory: {},
    messagePatterns: {},
    unusedCategories: new Set(),
    clarifyRequests: []
  };

  // Processa cada linha de log
  for (const line of logLines) {
    try {
      // Busca por logs de route_decision
      if (line.includes('route_decision')) {
        const jsonMatch = line.match(/\{.*route_decision.*\}/);
        if (jsonMatch) {
          const data = JSON.parse(jsonMatch[0]);
          processRouteDecision(data, stats);
        }
      }
    } catch (error) {
      // Ignora linhas que não conseguem ser parseadas
    }
  }

  // Gera relatório
  printReport(stats);

  // Salva relatório em arquivo
  await saveReport(stats);
}

function findLatestLogFile() {
  // Tenta encontrar o arquivo de log mais recente
  const possiblePaths = [
    '../apps/api/logs/app.log',
    './apps/api/logs/app.log',
    '../apps/api/app.log'
  ];

  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      return p;
    }
  }

  return null;
}

function processRouteDecision(data, stats) {
  stats.totalRequests++;

  const { message_normalized, topMatches } = data;

  if (!topMatches || topMatches.length === 0) {
    stats.clarifyRequests.push(message_normalized);
    return;
  }

  const topMatch = topMatches[0];

  // Registra uso da categoria
  if (!stats.requestsByCategory[topMatch.id]) {
    stats.requestsByCategory[topMatch.id] = {
      count: 0,
      avgScore: 0,
      messages: [],
      scores: []
    };
  }

  stats.requestsByCategory[topMatch.id].count++;
  stats.requestsByCategory[topMatch.id].messages.push(message_normalized);
  stats.requestsByCategory[topMatch.id].scores.push(topMatch.score);

  // Detecta scores baixos
  if (topMatch.score < MIN_ACCEPTABLE_SCORE) {
    stats.lowScoreRequests.push({
      message: message_normalized,
      category: topMatch.id,
      score: topMatch.score
    });
  }

  // Agrupa padrões de mensagens
  const firstWord = message_normalized.split(' ')[0];
  stats.messagePatterns[firstWord] = (stats.messagePatterns[firstWord] || 0) + 1;
}

function printReport(stats) {
  console.log(`${colors.bold}${colors.cyan}╔════════════════════════════════════════════╗${colors.reset}`);
  console.log(`${colors.bold}${colors.cyan}║           RELATÓRIO DE ANÁLISE             ║${colors.reset}`);
  console.log(`${colors.bold}${colors.cyan}╚════════════════════════════════════════════╝${colors.reset}\n`);

  // Estatísticas gerais
  console.log(`${colors.bold}📊 ESTATÍSTICAS GERAIS${colors.reset}`);
  console.log(`   Total de requisições: ${stats.totalRequests}`);
  console.log(`   Requisições com score baixo: ${stats.lowScoreRequests.length}`);
  console.log(`   Requisições que pediram clarificação: ${stats.clarifyRequests.length}\n`);

  // Categorias mais usadas
  console.log(`${colors.bold}🔝 TOP 10 SOLICITAÇÕES MAIS USADAS${colors.reset}`);
  const sortedCategories = Object.entries(stats.requestsByCategory)
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 10);

  sortedCategories.forEach(([id, data], index) => {
    const avgScore = (data.scores.reduce((a, b) => a + b, 0) / data.scores.length).toFixed(2);
    console.log(`   ${index + 1}. ${id}`);
    console.log(`      Uso: ${data.count}x | Score médio: ${avgScore}`);
  });
  console.log('');

  // Scores baixos
  if (stats.lowScoreRequests.length > 0) {
    console.log(`${colors.bold}${colors.yellow}⚠️  REQUISIÇÕES COM SCORE BAIXO (<${MIN_ACCEPTABLE_SCORE})${colors.reset}`);
    stats.lowScoreRequests.slice(0, 10).forEach(req => {
      console.log(`   ${colors.yellow}⚠${colors.reset} "${req.message}"`);
      console.log(`      → ${req.category} (score: ${req.score.toFixed(2)})`);
    });
    console.log('');
  }

  // Mensagens que precisaram clarificação
  if (stats.clarifyRequests.length > 0) {
    console.log(`${colors.bold}${colors.red}❓ MENSAGENS QUE NÃO FIZERAM MATCH${colors.reset}`);
    const uniqueClarify = [...new Set(stats.clarifyRequests)].slice(0, 10);
    uniqueClarify.forEach(msg => {
      console.log(`   ${colors.red}✗${colors.reset} "${msg}"`);
    });
    console.log('');
  }

  // Padrões de mensagens
  console.log(`${colors.bold}💬 PADRÕES DE INÍCIO DE MENSAGEM${colors.reset}`);
  const topPatterns = Object.entries(stats.messagePatterns)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  topPatterns.forEach(([pattern, count]) => {
    console.log(`   "${pattern}..." - ${count}x`);
  });
  console.log('');

  // Sugestões
  printSuggestions(stats);
}

function printSuggestions(stats) {
  console.log(`${colors.bold}${colors.cyan}💡 SUGESTÕES DE MELHORIA${colors.reset}\n`);

  // Sugestão 1: Melhorar scores baixos
  if (stats.lowScoreRequests.length > 0) {
    console.log(`${colors.yellow}1.${colors.reset} ${stats.lowScoreRequests.length} requisições com score baixo`);
    console.log(`   → Adicionar mais tags e exemplos para estas solicitações\n`);
  }

  // Sugestão 2: Tratar mensagens sem match
  if (stats.clarifyRequests.length > 0) {
    console.log(`${colors.yellow}2.${colors.reset} ${stats.clarifyRequests.length} mensagens não conseguiram match`);
    console.log(`   → Analisar e adicionar novas solicitações ou melhorar tags\n`);
  }

  // Sugestão 3: Categorias pouco usadas
  const unusedCategories = Object.entries(stats.requestsByCategory)
    .filter(([, data]) => data.count < 5)
    .map(([id]) => id);

  if (unusedCategories.length > 0) {
    console.log(`${colors.yellow}3.${colors.reset} ${unusedCategories.length} solicitações com pouco uso`);
    console.log(`   → Revisar se são realmente necessárias ou melhorar visibilidade\n`);
  }
}

async function saveReport(stats) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
  const reportPath = `scripts/reports/log-analysis-${timestamp}.json`;

  // Cria diretório de relatórios se não existir
  const reportsDir = path.dirname(reportPath);
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }

  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      totalRequests: stats.totalRequests,
      lowScoreRequests: stats.lowScoreRequests.length,
      clarifyRequests: stats.clarifyRequests.length,
      categoriesUsed: Object.keys(stats.requestsByCategory).length
    },
    details: {
      requestsByCategory: stats.requestsByCategory,
      lowScoreRequests: stats.lowScoreRequests,
      clarifyRequests: stats.clarifyRequests.slice(0, 50), // Limita a 50
      messagePatterns: stats.messagePatterns
    },
    recommendations: generateRecommendations(stats)
  };

  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

  console.log(`\n📄 Relatório detalhado salvo em: ${reportPath}\n`);
}

function generateRecommendations(stats) {
  const recommendations = [];

  // Recomendação para scores baixos
  if (stats.lowScoreRequests.length > 0) {
    const affectedCategories = [...new Set(stats.lowScoreRequests.map(r => r.category))];
    recommendations.push({
      type: 'low_scores',
      severity: 'high',
      count: stats.lowScoreRequests.length,
      message: `${stats.lowScoreRequests.length} requisições com score abaixo de ${MIN_ACCEPTABLE_SCORE}`,
      affected: affectedCategories,
      action: 'Adicionar tags mais específicas e exemplos variados'
    });
  }

  // Recomendação para mensagens sem match
  if (stats.clarifyRequests.length > 0) {
    recommendations.push({
      type: 'no_match',
      severity: 'medium',
      count: stats.clarifyRequests.length,
      message: `${stats.clarifyRequests.length} mensagens não conseguiram fazer match`,
      examples: stats.clarifyRequests.slice(0, 10),
      action: 'Analisar padrões e criar novas solicitações ou melhorar existentes'
    });
  }

  // Recomendação para balanceamento
  const usageCounts = Object.values(stats.requestsByCategory).map(d => d.count);
  if (usageCounts.length > 0) {
    const max = Math.max(...usageCounts);
    const min = Math.min(...usageCounts);

    if (max / min > 50) {
      recommendations.push({
        type: 'imbalance',
        severity: 'low',
        message: 'Forte desbalanceamento no uso das solicitações',
        action: 'Revisar solicitações pouco usadas - podem estar mal configuradas'
      });
    }
  }

  return recommendations;
}

// Executa a análise
analyzeLogs().catch(error => {
  console.error(`${colors.red}❌ Erro fatal: ${error.message}${colors.reset}`);
  console.error(error.stack);
  process.exit(1);
});

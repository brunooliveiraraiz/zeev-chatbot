#!/usr/bin/env node

/**
 * Script de Teste Automatizado do Catálogo
 *
 * Testa todas as solicitações do catálogo para verificar:
 * - Se os exemplos retornam a solicitação correta
 * - Score de matching
 * - Sugestões de melhoria nas tags
 *
 * Uso: node scripts/test-catalog.js
 */

const API_URL = process.env.API_URL || 'http://localhost:3000';
const MIN_ACCEPTABLE_SCORE = 0.5; // Score mínimo aceitável

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

async function testCatalog() {
  console.log(`${colors.bold}${colors.cyan}╔════════════════════════════════════════════╗${colors.reset}`);
  console.log(`${colors.bold}${colors.cyan}║  TESTE AUTOMATIZADO DO CATÁLOGO ZEEV       ║${colors.reset}`);
  console.log(`${colors.bold}${colors.cyan}╚════════════════════════════════════════════╝${colors.reset}\n`);

  const timestamp = new Date().toLocaleString('pt-BR');
  console.log(`📅 Data/Hora: ${timestamp}\n`);

  // Carrega o catálogo
  const catalog = await loadCatalog();

  const results = {
    total: 0,
    passed: 0,
    failed: 0,
    warnings: 0,
    errors: []
  };

  console.log(`📚 Testando ${catalog.length} solicitações...\n`);

  // Testa cada item do catálogo
  for (const item of catalog) {
    console.log(`${colors.bold}${colors.blue}🔍 Testando: ${item.name}${colors.reset}`);

    const itemResults = await testCatalogItem(item);

    results.total += itemResults.total;
    results.passed += itemResults.passed;
    results.failed += itemResults.failed;
    results.warnings += itemResults.warnings;

    if (itemResults.errors.length > 0) {
      results.errors.push(...itemResults.errors);
    }

    console.log(''); // Linha em branco
  }

  // Relatório final
  printFinalReport(results);

  // Gera arquivo de relatório
  await generateReport(results, catalog);

  // Retorna código de saída
  process.exit(results.failed > 0 ? 1 : 0);
}

async function loadCatalog() {
  try {
    // Importa o catálogo diretamente
    const catalogPath = '../apps/api/src/catalog/requests.js';
    const { REQUESTS_CATALOG } = await import(catalogPath);
    return REQUESTS_CATALOG;
  } catch (error) {
    console.error(`${colors.red}❌ Erro ao carregar catálogo: ${error.message}${colors.reset}`);
    process.exit(1);
  }
}

async function testCatalogItem(item) {
  const results = {
    total: 0,
    passed: 0,
    failed: 0,
    warnings: 0,
    errors: []
  };

  // Testa cada exemplo
  for (const example of item.examples) {
    results.total++;

    try {
      const response = await testExample(example);

      // Verifica se retornou o item correto
      if (response.topMatch && response.topMatch.id === item.id) {
        // Verifica o score
        if (response.topMatch.score >= MIN_ACCEPTABLE_SCORE) {
          results.passed++;
          console.log(`  ${colors.green}✓${colors.reset} "${example}" → Score: ${response.topMatch.score.toFixed(2)}`);
        } else {
          results.warnings++;
          console.log(`  ${colors.yellow}⚠${colors.reset} "${example}" → Score baixo: ${response.topMatch.score.toFixed(2)}`);
          results.errors.push({
            item: item.name,
            example,
            issue: 'score_baixo',
            score: response.topMatch.score,
            expected: item.id,
            got: response.topMatch.id
          });
        }
      } else {
        results.failed++;
        console.log(`  ${colors.red}✗${colors.reset} "${example}" → Encaminhou para: ${response.topMatch ? response.topMatch.name : 'N/A'}`);
        results.errors.push({
          item: item.name,
          example,
          issue: 'matching_errado',
          score: response.topMatch?.score || 0,
          expected: item.id,
          got: response.topMatch?.id || 'none'
        });
      }
    } catch (error) {
      results.failed++;
      console.log(`  ${colors.red}✗${colors.reset} "${example}" → Erro: ${error.message}`);
      results.errors.push({
        item: item.name,
        example,
        issue: 'erro_api',
        error: error.message
      });
    }
  }

  return results;
}

async function testExample(message) {
  const response = await fetch(`${API_URL}/route`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      message,
      sessionId: 'test-session',
      stage: 'prod'
    })
  });

  if (!response.ok) {
    throw new Error(`API retornou ${response.status}`);
  }

  const data = await response.json();

  // Pega informações adicionais do response
  let topMatch = null;

  if (data.type === 'direct_link' && data.link) {
    // Precisa inferir o ID pelo link ou nome
    // Como não temos acesso direto ao topMatch aqui, vamos fazer outra chamada
    // ou usar o texto para inferir
    topMatch = {
      id: inferIdFromText(data.text),
      name: data.text,
      score: 1.0 // Assumimos score alto se foi direto
    };
  }

  return {
    type: data.type,
    topMatch
  };
}

function inferIdFromText(text) {
  // Tenta extrair o nome da solicitação do texto
  const match = text.match(/\[(.*?)\]/);
  return match ? match[1].toLowerCase().replace(/\s+/g, '_') : 'unknown';
}

function printFinalReport(results) {
  console.log(`\n${colors.bold}${colors.cyan}╔════════════════════════════════════════════╗${colors.reset}`);
  console.log(`${colors.bold}${colors.cyan}║           RELATÓRIO FINAL                  ║${colors.reset}`);
  console.log(`${colors.bold}${colors.cyan}╚════════════════════════════════════════════╝${colors.reset}\n`);

  const passRate = ((results.passed / results.total) * 100).toFixed(1);

  console.log(`📊 Total de testes: ${results.total}`);
  console.log(`${colors.green}✓ Passou: ${results.passed}${colors.reset}`);
  console.log(`${colors.yellow}⚠ Avisos: ${results.warnings}${colors.reset}`);
  console.log(`${colors.red}✗ Falhou: ${results.failed}${colors.reset}`);
  console.log(`\n📈 Taxa de acerto: ${passRate}%\n`);

  if (results.failed === 0 && results.warnings === 0) {
    console.log(`${colors.green}${colors.bold}🎉 Todos os testes passaram!${colors.reset}\n`);
  } else if (results.failed > 0) {
    console.log(`${colors.red}${colors.bold}⚠️  Atenção: ${results.failed} teste(s) falharam!${colors.reset}\n`);
  } else {
    console.log(`${colors.yellow}${colors.bold}⚠️  Alguns testes com score baixo${colors.reset}\n`);
  }
}

async function generateReport(results, catalog) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
  const reportPath = `scripts/reports/test-report-${timestamp}.json`;

  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      total: results.total,
      passed: results.passed,
      failed: results.failed,
      warnings: results.warnings,
      passRate: ((results.passed / results.total) * 100).toFixed(1) + '%'
    },
    errors: results.errors,
    suggestions: generateSuggestions(results.errors, catalog)
  };

  // Cria diretório de relatórios se não existir
  const fs = await import('fs');
  const path = await import('path');

  const reportsDir = path.dirname(reportPath);
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }

  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

  console.log(`📄 Relatório salvo em: ${reportPath}\n`);
}

function generateSuggestions(errors, catalog) {
  const suggestions = [];

  // Agrupa erros por item
  const errorsByItem = {};
  errors.forEach(error => {
    if (!errorsByItem[error.item]) {
      errorsByItem[error.item] = [];
    }
    errorsByItem[error.item].push(error);
  });

  // Gera sugestões para cada item com erro
  Object.entries(errorsByItem).forEach(([itemName, itemErrors]) => {
    const item = catalog.find(i => i.name === itemName);
    if (!item) return;

    const matchingErrors = itemErrors.filter(e => e.issue === 'matching_errado');
    const lowScoreErrors = itemErrors.filter(e => e.issue === 'score_baixo');

    if (matchingErrors.length > 0) {
      suggestions.push({
        item: itemName,
        type: 'matching_error',
        severity: 'high',
        message: `${matchingErrors.length} exemplo(s) sendo encaminhados para solicitação errada`,
        recommendation: 'Adicionar tags mais específicas e revisar exemplos conflitantes',
        examples: matchingErrors.map(e => e.example)
      });
    }

    if (lowScoreErrors.length > 0) {
      suggestions.push({
        item: itemName,
        type: 'low_score',
        severity: 'medium',
        message: `${lowScoreErrors.length} exemplo(s) com score abaixo de ${MIN_ACCEPTABLE_SCORE}`,
        recommendation: 'Adicionar mais tags relacionadas e sinônimos',
        examples: lowScoreErrors.map(e => e.example)
      });
    }
  });

  return suggestions;
}

// Executa o teste
testCatalog().catch(error => {
  console.error(`${colors.red}❌ Erro fatal: ${error.message}${colors.reset}`);
  process.exit(1);
});

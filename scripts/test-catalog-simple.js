#!/usr/bin/env node

/**
 * Script de Teste Simplificado do Catálogo
 * Testa exemplos específicos para validar o matching
 */

const API_URL = process.env.API_URL || 'http://localhost:3000';

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m'
};

// Casos de teste críticos
const testCases = [
  // Financeiro
  { message: 'quero abrir solicitacao de pagamento', expected: 'financeiro_solicitacoes', category: 'Financeiro' },
  { message: 'quero abrir uma solicitacao financeira', expected: 'financeiro_solicitacoes', category: 'Financeiro' },
  { message: 'paguei mas nao apareceu', expected: 'atendimento_baixa_pagamento', category: 'Financeiro' },
  { message: 'cadastrar fornecedor', expected: 'financeiro_cadastro', category: 'Financeiro' },

  // Atendimento
  { message: 'cancelar matricula', expected: 'atendimento_cancelamento_matricula', category: 'Atendimento' },
  { message: 'alterar vencimento', expected: 'atendimento_alteracao_vencimento', category: 'Atendimento' },
  { message: 'cancelar parcela', expected: 'atendimento_cancelamento_parcela', category: 'Atendimento' },
  { message: 'preciso de estorno', expected: 'atendimento_devolucao_estorno', category: 'Atendimento' },
  { message: 'treinamento totvs', expected: 'atendimento_treinamento_totvs', category: 'Atendimento' },

  // Comercial
  { message: 'criar plano de pagamento', expected: 'comercial_plano_pagamento', category: 'Comercial' },
  { message: 'solicitar desconto', expected: 'comercial_desconto', category: 'Comercial' },
  { message: 'aplicar promocao', expected: 'comercial_promocoes', category: 'Comercial' },

  // DP
  { message: 'consultar holerite', expected: 'dp_solicitacoes', category: 'DP' },
  { message: 'vale transporte', expected: 'dp_beneficios', category: 'DP' },

  // TI
  { message: 'computador nao funciona', expected: 'ti_infraestrutura_sistemas', category: 'TI' },
  { message: 'portal de matriculas', expected: 'ti_portal_matriculas', category: 'TI' },
  { message: 'abrir ticket', expected: 'ti_ticket_raiz', category: 'TI' },

  // BI
  { message: 'preciso de relatorio', expected: 'bi_atendimento', category: 'BI' },

  // Operações
  { message: 'solicitar veiculo', expected: 'operacoes_frota', category: 'Operações' },
  { message: 'comprar material', expected: 'operacoes_compras', category: 'Operações' },
  { message: 'chamar motoboy', expected: 'operacoes_frete', category: 'Operações' },

  // P&C
  { message: 'abrir vaga', expected: 'pc_admissao_recrutamento', category: 'P&C' },
  { message: 'demitir colaborador', expected: 'pc_desligamento', category: 'P&C' },
];

async function runTests() {
  console.log(`${colors.bold}${colors.cyan}╔════════════════════════════════════════════╗${colors.reset}`);
  console.log(`${colors.bold}${colors.cyan}║  TESTE RÁPIDO DO CATÁLOGO ZEEV             ║${colors.reset}`);
  console.log(`${colors.bold}${colors.cyan}╚════════════════════════════════════════════╝${colors.reset}\n`);

  console.log(`📅 ${new Date().toLocaleString('pt-BR')}`);
  console.log(`🔗 API: ${API_URL}\n`);

  const results = {
    total: testCases.length,
    passed: 0,
    failed: 0,
    errors: []
  };

  for (const test of testCases) {
    try {
      const response = await fetch(`${API_URL}/route`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: test.message,
          sessionId: 'test-' + Date.now(),
          stage: 'prod'
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();

      // Verifica se retornou link direto
      if (data.type === 'direct_link') {
        // Extrai ID do texto (formato: "[Nome] Título")
        const match = data.text.match(/\[(.*?)\]/);
        if (match) {
          const returnedCategory = match[1];

          if (returnedCategory === test.category || data.text.includes(test.expected)) {
            results.passed++;
            console.log(`${colors.green}✓${colors.reset} "${test.message}"`);
            console.log(`  → ${data.text.substring(0, 60)}...`);
          } else {
            results.failed++;
            console.log(`${colors.red}✗${colors.reset} "${test.message}"`);
            console.log(`  Esperado: ${test.category}`);
            console.log(`  Recebeu: ${returnedCategory}`);
            results.errors.push({ test, received: returnedCategory });
          }
        } else {
          results.passed++;
          console.log(`${colors.green}✓${colors.reset} "${test.message}" → Link direto`);
        }
      } else if (data.type === 'choose_option') {
        results.failed++;
        console.log(`${colors.yellow}⚠${colors.reset} "${test.message}"`);
        console.log(`  → Pediu escolha entre opções (matching ambíguo)`);
        results.errors.push({ test, received: 'choose_option' });
      } else if (data.type === 'clarify') {
        results.failed++;
        console.log(`${colors.red}✗${colors.reset} "${test.message}"`);
        console.log(`  → Não conseguiu fazer match`);
        results.errors.push({ test, received: 'clarify' });
      } else {
        results.passed++;
        console.log(`${colors.blue}ℹ${colors.reset} "${test.message}" → ${data.type}`);
      }

    } catch (error) {
      results.failed++;
      console.log(`${colors.red}✗${colors.reset} "${test.message}"`);
      console.log(`  Erro: ${error.message}`);
      results.errors.push({ test, error: error.message });
    }
  }

  // Relatório final
  console.log(`\n${colors.bold}${colors.cyan}╔════════════════════════════════════════════╗${colors.reset}`);
  console.log(`${colors.bold}${colors.cyan}║           RELATÓRIO FINAL                  ║${colors.reset}`);
  console.log(`${colors.bold}${colors.cyan}╚════════════════════════════════════════════╝${colors.reset}\n`);

  const passRate = ((results.passed / results.total) * 100).toFixed(1);

  console.log(`📊 Total: ${results.total} testes`);
  console.log(`${colors.green}✓ Passou: ${results.passed}${colors.reset}`);
  console.log(`${colors.red}✗ Falhou: ${results.failed}${colors.reset}`);
  console.log(`\n📈 Taxa de acerto: ${passRate}%\n`);

  if (results.failed === 0) {
    console.log(`${colors.green}${colors.bold}🎉 Todos os testes passaram!${colors.reset}\n`);
    process.exit(0);
  } else {
    console.log(`${colors.red}${colors.bold}⚠️  ${results.failed} teste(s) falharam${colors.reset}\n`);

    if (results.errors.length > 0) {
      console.log(`${colors.bold}Erros encontrados:${colors.reset}`);
      results.errors.forEach((err, i) => {
        console.log(`\n${i + 1}. "${err.test.message}"`);
        console.log(`   Esperado: ${err.test.category}`);
        console.log(`   Recebeu: ${err.received || err.error}`);
      });
      console.log('');
    }

    process.exit(1);
  }
}

// Executa
runTests().catch(error => {
  console.error(`${colors.red}❌ Erro fatal: ${error.message}${colors.reset}`);
  process.exit(1);
});

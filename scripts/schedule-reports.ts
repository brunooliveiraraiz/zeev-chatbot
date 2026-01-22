import cron from 'node-cron';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as path from 'path';

const execAsync = promisify(exec);

/**
 * Executa o script de geração de relatório
 */
async function generateReport() {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`📅 ${new Date().toLocaleString('pt-BR')}`);
  console.log(`🤖 Iniciando geração automática de relatório...`);
  console.log('='.repeat(60));

  try {
    const scriptPath = path.join(__dirname, 'generate-ppt-report.ts');
    const { stdout, stderr } = await execAsync(`npx tsx "${scriptPath}"`);

    if (stdout) console.log(stdout);
    if (stderr) console.error(stderr);

    console.log('✅ Relatório gerado com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao gerar relatório:', error);
  }
}

/**
 * Agenda a execução semanal do relatório
 */
function scheduleReports() {
  console.log('🚀 Iniciando agendador de relatórios...');
  console.log('📅 Relatórios serão gerados semanalmente às segundas-feiras às 09:00');
  console.log('');

  // Agendar para segunda-feira às 09:00
  // Formato: segundo minuto hora dia mês dia-da-semana
  // 0 = Domingo, 1 = Segunda, 2 = Terça, etc.
  cron.schedule('0 9 * * 1', () => {
    generateReport();
  }, {
    timezone: 'America/Sao_Paulo'
  });

  console.log('✅ Agendamento ativo!');
  console.log('ℹ️  Próxima execução: Segunda-feira às 09:00');
  console.log('ℹ️  Pressione Ctrl+C para parar');
  console.log('');

  // Gerar relatório inicial ao iniciar (opcional)
  console.log('📊 Gerando relatório inicial...');
  generateReport();
}

// Executar
scheduleReports();

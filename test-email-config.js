// Script para testar configuração de email localmente
// Execute: node test-email-config.js

import nodemailer from 'nodemailer';

// ============================================
// CONFIGURE AQUI AS SUAS CREDENCIAIS:
// ============================================

const config = {
  // Opção 1: Gmail
  smtp_host: 'smtp.gmail.com',
  smtp_port: 587,
  smtp_secure: false,
  smtp_user: 'SEU_EMAIL@gmail.com',  // ← MUDE AQUI
  smtp_pass: 'sua-senha-app-16-chars',  // ← MUDE AQUI (senha de app)

  // Opção 2: Outlook/Office365
  // smtp_host: 'smtp.office365.com',
  // smtp_port: 587,
  // smtp_secure: false,
  // smtp_user: 'bruno.oliveira@raizeducacao.com.br',
  // smtp_pass: 'sua-senha-normal',

  // Destinatário
  report_email_to: 'bruno.oliveira@raizeducacao.com.br',
};

// ============================================
// NÃO PRECISA MEXER DAQUI PRA BAIXO
// ============================================

async function testEmailConfig() {
  console.log('🧪 Testando configuração de email...\n');

  // Validar configuração
  if (config.smtp_user.includes('SEU_EMAIL') || config.smtp_pass.includes('sua-senha')) {
    console.error('❌ ERRO: Configure suas credenciais no arquivo test-email-config.js');
    console.log('\n📝 Edite as linhas 11-12 com suas credenciais reais');
    process.exit(1);
  }

  try {
    // Criar transporte
    console.log('📧 Configuração:');
    console.log(`   Host: ${config.smtp_host}`);
    console.log(`   Port: ${config.smtp_port}`);
    console.log(`   User: ${config.smtp_user}`);
    console.log(`   To: ${config.report_email_to}\n`);

    const transporter = nodemailer.createTransport({
      host: config.smtp_host,
      port: config.smtp_port,
      secure: config.smtp_secure,
      auth: {
        user: config.smtp_user,
        pass: config.smtp_pass,
      },
    });

    // Testar conexão
    console.log('🔌 Testando conexão SMTP...');
    await transporter.verify();
    console.log('✅ Conexão SMTP OK!\n');

    // Enviar email de teste
    console.log('📤 Enviando email de teste...');
    const info = await transporter.sendMail({
      from: config.smtp_user,
      to: config.report_email_to,
      subject: '✅ Teste de Configuração - Chatbot Zeev',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #10B981;">✅ Configuração de Email Funcionando!</h2>
          <p>Parabéns! As credenciais SMTP estão corretas.</p>

          <div style="background-color: #F3F4F6; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">📋 Próximos Passos:</h3>
            <ol>
              <li>Copie as variáveis de ambiente para o Vercel</li>
              <li>Teste o endpoint: <code>/api/generate-report</code></li>
              <li>Aguarde o primeiro relatório na segunda-feira às 09:00</li>
            </ol>
          </div>

          <p style="color: #6B7280; font-size: 12px; margin-top: 30px;">
            Este é um email de teste enviado em ${new Date().toLocaleString('pt-BR')}
          </p>
        </div>
      `,
    });

    console.log('✅ Email enviado com sucesso!');
    console.log(`📬 Message ID: ${info.messageId}\n`);

    // Mostrar variáveis de ambiente
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📝 COPIE ESTAS VARIÁVEIS PARA O VERCEL:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log(`SMTP_HOST=${config.smtp_host}`);
    console.log(`SMTP_PORT=${config.smtp_port}`);
    console.log(`SMTP_SECURE=${config.smtp_secure}`);
    console.log(`SMTP_USER=${config.smtp_user}`);
    console.log(`SMTP_PASS=${config.smtp_pass}`);
    console.log(`SMTP_FROM=Chatbot Zeev <${config.smtp_user}>`);
    console.log(`REPORT_EMAIL_TO=${config.report_email_to}`);
    console.log(`CRON_SECRET=${generateRandomSecret()}`);
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n✅ Teste concluído! Verifique sua caixa de entrada.');
    console.log('📧 Destinatário: ' + config.report_email_to);
    console.log('\n💡 Se não chegou, verifique a pasta de SPAM');

  } catch (error) {
    console.error('\n❌ ERRO ao testar email:', error.message);
    console.log('\n🔍 Possíveis causas:\n');

    if (error.message.includes('Invalid login')) {
      console.log('   • Credenciais incorretas (usuário ou senha)');
      console.log('   • Se Gmail: use "Senha de App" (não a senha normal)');
      console.log('   • Gere em: https://myaccount.google.com/apppasswords');
    } else if (error.message.includes('ECONNREFUSED') || error.message.includes('timeout')) {
      console.log('   • Host ou porta SMTP incorretos');
      console.log('   • Firewall bloqueando conexão');
    } else if (error.message.includes('EAUTH')) {
      console.log('   • Autenticação falhou');
      console.log('   • Verifique usuário e senha');
    }

    console.log('\n📚 Consulte: RELATORIOS_AUTOMATICOS.md');
    process.exit(1);
  }
}

function generateRandomSecret() {
  return Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2);
}

// Executar teste
testEmailConfig();

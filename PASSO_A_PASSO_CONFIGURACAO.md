# 🚀 Passo a Passo - Configuração de Relatórios Automáticos

## Escolha seu provedor de email:

### Opção A: Gmail (Recomendado - Mais Fácil)
### Opção B: Outlook/Office365 (@raizeducacao.com.br)

---

## 📧 OPÇÃO A: GMAIL

### Passo 1: Gerar Senha de App do Gmail

1. Acesse: https://myaccount.google.com/security

2. Certifique-se que a **"Verificação em duas etapas"** está ATIVADA
   - Se não estiver, ative primeiro

3. Acesse: https://myaccount.google.com/apppasswords

4. Clique em **"Selecionar app"** → Escolha **"Email"**

5. Clique em **"Selecionar dispositivo"** → Escolha **"Outro (nome personalizado)"**

6. Digite: **"Chatbot Zeev Reports"**

7. Clique em **"Gerar"**

8. **COPIE A SENHA DE 16 CARACTERES** (formato: `abcd efgh ijkl mnop`)
   - ⚠️ Essa senha aparece apenas uma vez!

### Passo 2: Testar Localmente

1. Abra o arquivo: `test-email-config.js`

2. Edite as linhas 11-12:
   ```javascript
   smtp_user: 'seu-email@gmail.com',  // ← Seu Gmail
   smtp_pass: 'abcd efgh ijkl mnop',  // ← Senha de 16 caracteres que você gerou
   ```

3. Execute o teste:
   ```bash
   cd C:\Users\bruno.oliveira\Documents\zeev-chatbot
   node test-email-config.js
   ```

4. Se aparecer ✅ "Email enviado com sucesso!", COPIE as variáveis que apareceram

5. Verifique seu email (bruno.oliveira@raizeducacao.com.br)
   - Verifique também a pasta SPAM

### Passo 3: Configurar no Vercel

1. Acesse: https://vercel.com/dashboard

2. Clique no projeto: **zeev-chatbot**

3. Vá em: **Settings** → **Environment Variables**

4. Adicione CADA uma das 8 variáveis que o script gerou:

   | Name | Value (exemplo) |
   |------|-----------------|
   | `SMTP_HOST` | `smtp.gmail.com` |
   | `SMTP_PORT` | `587` |
   | `SMTP_SECURE` | `false` |
   | `SMTP_USER` | `seu-email@gmail.com` |
   | `SMTP_PASS` | `abcd efgh ijkl mnop` |
   | `SMTP_FROM` | `Chatbot Zeev <seu-email@gmail.com>` |
   | `REPORT_EMAIL_TO` | `bruno.oliveira@raizeducacao.com.br` |
   | `CRON_SECRET` | `(copie do script de teste)` |

5. Clique em **"Save"** para cada variável

6. **IMPORTANTE:** Selecione os ambientes:
   - ✅ Production
   - ✅ Preview
   - ✅ Development

### Passo 4: Testar no Vercel

1. Após configurar todas as variáveis, execute:

   ```bash
   curl -X POST https://zeev-chatbot-api.vercel.app/api/generate-report \
     -H "Authorization: Bearer SEU_CRON_SECRET" \
     -H "Content-Type: application/json"
   ```

   ⚠️ Substitua `SEU_CRON_SECRET` pelo valor que você configurou

2. Aguarde (pode demorar 30-60 segundos na primeira vez)

3. Verifique seu email!

---

## 📧 OPÇÃO B: OUTLOOK/OFFICE365

### Passo 1: Usar Credenciais Normais

Para Outlook/Office365, você usa sua senha NORMAL (não precisa senha de app)

### Passo 2: Testar Localmente

1. Abra o arquivo: `test-email-config.js`

2. **COMENTE** as linhas do Gmail (9-13) e **DESCOMENTE** as linhas do Outlook (15-19):

   ```javascript
   // Opção 1: Gmail
   // smtp_host: 'smtp.gmail.com',
   // smtp_port: 587,
   // smtp_secure: false,
   // smtp_user: 'SEU_EMAIL@gmail.com',
   // smtp_pass: 'sua-senha-app-16-chars',

   // Opção 2: Outlook/Office365
   smtp_host: 'smtp.office365.com',
   smtp_port: 587,
   smtp_secure: false,
   smtp_user: 'bruno.oliveira@raizeducacao.com.br',
   smtp_pass: 'sua-senha-normal-do-outlook',
   ```

3. Execute o teste:
   ```bash
   cd C:\Users\bruno.oliveira\Documents\zeev-chatbot
   node test-email-config.js
   ```

4. Se funcionar, COPIE as variáveis de ambiente

### Passo 3: Configurar no Vercel

(Mesmo processo da Opção A, mas com os valores do Outlook)

---

## ✅ VERIFICAÇÃO FINAL

Depois de configurar tudo:

### 1. Testar Endpoint Manualmente

```bash
curl -X POST https://zeev-chatbot-api.vercel.app/api/generate-report \
  -H "Authorization: Bearer SEU_CRON_SECRET" \
  -H "Content-Type: application/json"
```

**Resposta esperada (sucesso):**
```json
{
  "success": true,
  "message": "Relatório gerado e enviado com sucesso",
  "stats": { ... },
  "filename": "analytics-report-2026-01-26.pptx"
}
```

### 2. Verificar Email

- ✅ Chegou email com assunto: "📊 Relatório Semanal - Chatbot Zeev"
- ✅ Tem resumo executivo no corpo
- ✅ Tem arquivo PPT anexado
- ✅ PPT tem 4 slides com gráficos

### 3. Verificar Logs no Vercel

1. Acesse: https://vercel.com/dashboard
2. Projeto: zeev-chatbot
3. Aba: **Logs**
4. Filtrar por: `/api/generate-report`
5. Verificar se não tem erros

---

## 🔄 AGENDAMENTO AUTOMÁTICO

Após configurar com sucesso:

- ⏰ **Quando:** Toda segunda-feira às 09:00 (Brasília)
- 📧 **Para:** bruno.oliveira@raizeducacao.com.br
- 📊 **Conteúdo:** PPT com analytics da semana

**Não precisa fazer mais nada!** O Vercel Cron executará automaticamente.

---

## ❓ PROBLEMAS COMUNS

### "Invalid login" (Gmail)
- Você está usando senha de app? (não a senha normal)
- Verificação em 2 etapas está ativa?
- Senha de app foi gerada corretamente?

### Email não chegou
- Verifique pasta SPAM
- Confirme que REPORT_EMAIL_TO está correto
- Veja logs no Vercel para erros

### "Connection timeout"
- Porta incorreta (use 587 para TLS)
- Firewall bloqueando (improvável no Vercel)

### "Unauthorized" ao chamar endpoint
- CRON_SECRET está configurado no Vercel?
- Você passou o token correto no header Authorization?

---

## 📞 PRECISA DE AJUDA?

1. Consulte: `RELATORIOS_AUTOMATICOS.md` (documentação completa)
2. Execute: `node test-email-config.js` (teste local)
3. Verifique logs no Vercel Dashboard

**Dúvidas:** bruno.oliveira@raizeducacao.com.br

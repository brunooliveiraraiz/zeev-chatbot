# 📊 Relatórios Automáticos - Chatbot Zeev

## Visão Geral

O sistema gera relatórios semanais em PowerPoint (PPT) com analytics do chatbot e envia por email automaticamente.

**Agendamento:** Toda segunda-feira às 09:00 (horário de Brasília)

## Conteúdo do Relatório

O PPT gerado contém 4 slides:

### Slide 1: Capa
- Título do relatório
- Logo Raiz Educação / Chatbot Zeev
- Data de geração

### Slide 2: Estatísticas Gerais
- Total de conversas
- Problemas resolvidos (via troubleshooting)
- Escalados para formulário
- Taxa de resolução (%)
- Avaliação média (estrelas)

### Slide 3: Gráfico de Linha - Últimos 30 Dias
- Resoluções diárias
- Escalações diárias
- Tendências

### Slide 4: Gráfico de Barras - Ano Atual
- Resoluções mensais
- Escalações mensais
- Comparação mês a mês

## Configuração no Vercel

### 1. Variáveis de Ambiente Obrigatórias

Acesse o dashboard do Vercel → Seu Projeto → **Settings** → **Environment Variables**

Adicione as seguintes variáveis:

| Variável | Descrição | Exemplo |
|----------|-----------|---------|
| `SMTP_HOST` | Servidor SMTP para envio de emails | `smtp.gmail.com` |
| `SMTP_PORT` | Porta do servidor SMTP | `587` |
| `SMTP_SECURE` | Usar conexão segura (SSL/TLS) | `false` |
| `SMTP_USER` | Usuário do email (login) | `noreply@raizeducacao.com.br` |
| `SMTP_PASS` | Senha do email ou App Password | `sua-senha-aqui` |
| `SMTP_FROM` | Email do remetente (opcional) | `Chatbot Zeev <noreply@raizeducacao.com.br>` |
| `REPORT_EMAIL_TO` | Email(s) destinatário(s) | `bruno.oliveira@raizeducacao.com.br` |
| `CRON_SECRET` | Token de segurança para execução do cron | `gere-um-token-secreto-aqui` |

**⚠️ IMPORTANTE - Emails múltiplos:**
Para enviar para várias pessoas, separe por vírgula:
```
REPORT_EMAIL_TO=pessoa1@raiz.com.br,pessoa2@raiz.com.br,pessoa3@raiz.com.br
```

### 2. Configuração do Gmail (se usar Gmail)

Se você usar Gmail como SMTP:

1. **Habilitar autenticação de 2 fatores** na conta Google
2. **Gerar senha de aplicativo:**
   - Acesse: https://myaccount.google.com/apppasswords
   - Selecione "Email" e "Outro (nome personalizado)"
   - Nomeie como "Chatbot Zeev"
   - Copie a senha gerada (16 caracteres)
3. **Use essa senha no `SMTP_PASS`**

**Configurações Gmail:**
```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=seu-email@gmail.com
SMTP_PASS=senha-app-16-caracteres
```

### 3. Outras Opções de SMTP

**SendGrid:**
```
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=sua-api-key-sendgrid
```

**AWS SES:**
```
SMTP_HOST=email-smtp.us-east-1.amazonaws.com
SMTP_PORT=587
SMTP_USER=sua-access-key
SMTP_PASS=sua-secret-key
```

**Outlook/Office365:**
```
SMTP_HOST=smtp.office365.com
SMTP_PORT=587
SMTP_USER=seu-email@outlook.com
SMTP_PASS=sua-senha
```

## Funcionamento do Cron Job

### Vercel Cron (Produção/Homologação)

O arquivo `vercel.json` contém a configuração:

```json
{
  "crons": [
    {
      "path": "/api/generate-report",
      "schedule": "0 9 * * 1"
    }
  ]
}
```

**Formato do Schedule:** [Cron Expression](https://crontab.guru/#0_9_*_*_1)
- `0 9 * * 1` = Segunda-feira às 09:00 UTC
- **Nota:** Vercel Cron usa UTC! Para 09:00 Brasília (UTC-3), configure: `0 12 * * 1`

### Autenticação de Segurança

O endpoint `/api/generate-report` exige autenticação via Bearer Token para evitar execuções não autorizadas.

O Vercel Cron envia automaticamente o header:
```
Authorization: Bearer <CRON_SECRET>
```

## Testando Manualmente

Para testar o envio de relatório manualmente via API:

```bash
curl -X POST https://zeev-chatbot-api.vercel.app/api/generate-report \
  -H "Authorization: Bearer SEU_CRON_SECRET" \
  -H "Content-Type: application/json"
```

**Resposta esperada:**
```json
{
  "success": true,
  "message": "Relatório gerado e enviado com sucesso",
  "stats": {
    "total": 150,
    "resolved": 95,
    "escalated": 55,
    "resolutionRate": "63.3",
    "avgRating": "4.5",
    "ratingCount": 42
  },
  "filename": "analytics-report-2026-01-26.pptx",
  "emailId": "<message-id@smtp.server>",
  "timestamp": "2026-01-26T18:45:00.000Z"
}
```

## Logs e Monitoramento

### Ver Logs no Vercel

1. Dashboard do Vercel → Seu Projeto → **Logs**
2. Filtrar por `/api/generate-report`
3. Verificar execuções do cron e erros

### Mensagens de Log

O sistema gera os seguintes logs:

```
📊 Gerando relatório PPT...
📈 Dados coletados: 30 dias, 12 meses
✅ PPT gerado: analytics-report-2026-01-26.pptx
📧 Enviando email...
✅ Email enviado: <message-id>
✅ Relatório gerado e enviado com sucesso
```

## Troubleshooting

### Erro: "Variáveis de ambiente faltando"

**Causa:** Variáveis SMTP não configuradas no Vercel

**Solução:** Adicione todas as variáveis obrigatórias em Environment Variables

### Erro: "Invalid login"

**Causa:** Credenciais SMTP incorretas

**Solução:**
- Verifique `SMTP_USER` e `SMTP_PASS`
- Se Gmail, use senha de aplicativo (não a senha normal)

### Erro: "Connection timeout"

**Causa:** Porta ou host SMTP incorretos

**Solução:**
- Confirme `SMTP_HOST` e `SMTP_PORT`
- Para Gmail: porta 587 (TLS) ou 465 (SSL)

### Erro: "Unauthorized"

**Causa:** Token de autenticação inválido

**Solução:** Verifique se `CRON_SECRET` está configurado no Vercel

### Email não chegou

**Possíveis causas:**
1. Verifique pasta de SPAM
2. Confirme `REPORT_EMAIL_TO` está correto
3. Verifique logs no Vercel para ver se houve erro
4. Teste SMTP com ferramenta externa (ex: https://www.smtper.net/)

## Alterando o Agendamento

Para mudar o horário ou frequência:

1. Edite `vercel.json`:
   ```json
   "schedule": "0 12 * * 1"  // Segunda às 12:00 UTC (09:00 Brasília)
   ```

2. Exemplos de schedules:
   - `0 12 * * 1` = Segunda-feira às 09:00 (Brasília)
   - `0 12 * * 1,5` = Segunda e Sexta às 09:00
   - `0 12 1 * *` = Primeiro dia de cada mês às 09:00
   - `0 12 * * *` = Todos os dias às 09:00

3. Commit e push:
   ```bash
   git add vercel.json
   git commit -m "Update cron schedule"
   git push
   ```

## Custos

### Vercel
- **Cron Jobs:** Incluído no plano Free (até 1 cron por dia)
- **Function Executions:** Cada execução conta como invocação

### Email
- **Gmail:** Gratuito (limite: 500 emails/dia)
- **SendGrid:** Gratuito até 100 emails/dia
- **AWS SES:** $0.10 por 1000 emails

## Suporte

Em caso de problemas:

1. Verifique logs no Vercel
2. Teste endpoint manualmente com curl
3. Confirme todas as variáveis de ambiente
4. Verifique credenciais SMTP

Para dúvidas técnicas, contate: bruno.oliveira@raizeducacao.com.br

# 🚀 Deploy da API no Vercel (Gratuito)

## 📋 Pré-requisitos

- ✅ Conta no GitHub (já tem)
- ✅ Conta no Vercel (vamos criar)
- ✅ Repositório no GitHub (já tem)

---

## 🎯 Passo a Passo Completo

### **1️⃣ Criar Conta no Vercel**

1. Acesse: https://vercel.com/signup
2. Clique em **"Continue with GitHub"**
3. Autorize o Vercel a acessar sua conta GitHub
4. Pronto! Conta criada 🎉

---

### **2️⃣ Importar Projeto do GitHub**

1. No dashboard do Vercel, clique em **"Add New..."** → **"Project"**
2. Clique em **"Import"** ao lado do repositório `zeev-chatbot`
3. Se não aparecer, clique em **"Adjust GitHub App Permissions"** e autorize o repositório

---

### **3️⃣ Configurar o Projeto**

Na tela de configuração:

**Framework Preset:** `Other`

**Root Directory:** deixe como está (raiz do projeto)

**Build Command:**
```bash
cd apps/api && npm install && npm run build
```

**Output Directory:** `apps/api/dist`

**Install Command:**
```bash
npm install && cd apps/api && npm install
```

Clique em **"Deploy"** (vai falhar, mas é esperado - precisamos configurar variáveis)

---

### **4️⃣ Configurar Banco de Dados (Vercel Postgres)**

#### **4.1 Criar Banco Postgres no Vercel:**

1. No projeto no Vercel, vá em **"Storage"** → **"Create Database"**
2. Selecione **"Postgres"** → **"Continue"**
3. Nome do banco: `zeev-chatbot-db`
4. Region: **Washington, D.C., USA (iad1)** (ou mais próximo)
5. Clique em **"Create"**

#### **4.2 Conectar Banco ao Projeto:**

1. Ainda em **"Storage"**, clique no banco criado
2. Clique em **"Connect Project"**
3. Selecione o projeto `zeev-chatbot`
4. Clique em **"Connect"**

✅ Isso vai criar automaticamente a variável `DATABASE_URL` no projeto!

---

### **5️⃣ Configurar Variáveis de Ambiente**

1. Vá em **"Settings"** → **"Environment Variables"**
2. Adicione cada variável abaixo:

| Name | Value |
|------|-------|
| `PORT` | `3000` |
| `NODE_ENV` | `production` |
| `STAGE_DEFAULT` | `hml` |
| `AUTH_MODE` | `DEV` |
| `MOCK_MODE` | `false` |
| `CORS_ORIGINS` | `https://hmlraizeducacao.zeev.it,https://brunooliveiraraiz.github.io` |
| `RATE_LIMIT_WINDOW_MS` | `60000` |
| `RATE_LIMIT_MAX_REQUESTS` | `100` |
| `LOG_LEVEL` | `info` |
| `CONTEXT_SIGNING_SECRET` | `your-signing-secret-change-in-production` |
| `JWT_SECRET` | `your-jwt-secret-change-in-production` |
| `JWT_ISSUER` | `zeev-portal` |
| `JWT_AUDIENCE` | `zeev-chatbot` |
| `CHAT_SESSION_SECRET` | `your-chat-session-secret-change-in-production` |
| `CHAT_SESSION_EXPIRES_IN` | `24h` |
| `ZEEV_BASE_URL` | `https://hmlraizeducacao.zeev.it/api` |
| `ZEEV_TOKEN` | `Bearer SEU_TOKEN_AQUI` ⚠️ **Cole o token real** |
| `ZEEV_ENDPOINT_CREATE_INSTANCE` | `/processes/{processId}/instances` |
| `ZEEV_PROCESS_ID` | `process-123` |
| `ZEEV_TIMEOUT_MS` | `10000` |
| `ANTHROPIC_API_KEY` | `sk-ant-api03-...` ⚠️ **Cole a API key real** |
| `AI_TROUBLESHOOTING_ENABLED` | `true` |

⚠️ **IMPORTANTE:** A variável `DATABASE_URL` já foi criada automaticamente quando você conectou o banco!

---

### **6️⃣ Atualizar Schema do Prisma para PostgreSQL**

O projeto usa SQLite, mas no Vercel precisamos usar PostgreSQL.

**Você precisa fazer isso no seu computador:**

1. Abra o arquivo `apps/api/prisma/schema.prisma`
2. Mude de:
```prisma
datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}
```

Para:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

3. Salve o arquivo
4. Faça commit e push:
```bash
cd C:\Users\bruno.oliveira\Documents\zeev-chatbot
git add apps/api/prisma/schema.prisma
git commit -m "Muda banco de SQLite para PostgreSQL (Vercel)"
git push origin main
```

---

### **7️⃣ Fazer Novo Deploy**

1. Volte no dashboard do Vercel
2. Vá em **"Deployments"**
3. Clique em **"Redeploy"** no último deploy

Ou simplesmente faça push no GitHub que o Vercel deploya automaticamente!

---

### **8️⃣ Executar Migrações do Banco**

Depois do deploy bem-sucedido:

1. Vá em **"Settings"** → **"Functions"**
2. Ou use o Vercel CLI:

```bash
# Instalar Vercel CLI
npm install -g vercel

# Fazer login
vercel login

# Executar migrações
vercel env pull
cd apps/api
npx prisma migrate deploy
```

---

### **9️⃣ Testar a API**

Sua API estará disponível em:
```
https://zeev-chatbot-XXXX.vercel.app
```

Teste o health check:
```bash
curl https://zeev-chatbot-XXXX.vercel.app/health
```

Resposta esperada:
```json
{
  "status": "ok",
  "timestamp": "2026-01-22T...",
  "mode": "PRODUCTION",
  "authMode": "DEV"
}
```

---

### **🔟 Configurar URL da API no Widget**

1. Copie a URL da API (ex: `https://zeev-chatbot-abc123.vercel.app`)
2. No seu computador, edite:

```bash
# Editar arquivo
notepad C:\Users\bruno.oliveira\Documents\zeev-chatbot\apps\widget\.env.production
```

Cole:
```env
VITE_API_URL=https://zeev-chatbot-abc123.vercel.app
```

3. Commit e push:
```bash
git add apps/widget/.env.production
git commit -m "Configura URL da API do Vercel no widget"
git push origin main
```

4. Aguarde 2-3 minutos para o GitHub Pages atualizar

---

## ✅ Verificação Final

1. ✅ API no Vercel funcionando: `https://sua-api.vercel.app/health`
2. ✅ Widget no GitHub Pages: `https://brunooliveiraraiz.github.io/zeev-chatbot/`
3. ✅ Widget conectando com a API (teste enviando "oi")
4. ✅ Sem erros no console do navegador

---

## 🔄 Deploys Futuros

**O Vercel deploy automaticamente** sempre que você fizer push no GitHub! 🎉

```bash
git add .
git commit -m "sua mensagem"
git push origin main
```

→ Deploy automático no Vercel em ~2 minutos!

---

## 📊 Monitoramento

No dashboard do Vercel você pode ver:
- 📈 Logs em tempo real
- 🔍 Erros e stack traces
- ⚡ Performance e latência
- 📉 Uso de recursos

---

## 🐛 Troubleshooting

### Deploy falha:
- Verifique os logs no Vercel dashboard
- Certifique-se que todas as variáveis de ambiente estão configuradas
- Verifique se o `DATABASE_URL` está presente

### API retorna 500:
- Verifique os logs: **"Settings"** → **"Functions"** → clique na função → **"Logs"**
- Verifique se as migrações do Prisma foram executadas

### CORS error:
- Adicione o domínio no `CORS_ORIGINS` nas variáveis de ambiente do Vercel
- Formato: `https://dominio1.com,https://dominio2.com` (sem espaços!)

### Banco de dados não funciona:
- Verifique se o banco Postgres está conectado ao projeto
- Execute as migrações: `npx prisma migrate deploy`

---

## 💰 Custos

**Tudo GRATUITO! 🎉**

- ✅ Vercel: Gratuito até 100GB de largura de banda/mês
- ✅ Vercel Postgres: Gratuito até 256MB de armazenamento
- ✅ GitHub Pages: Gratuito
- ✅ GitHub Actions: Gratuito para repositórios públicos

---

## 🎉 Pronto!

Agora você tem:
- ✅ API rodando no Vercel (gratuito)
- ✅ Widget rodando no GitHub Pages (gratuito)
- ✅ Deploy automático configurado
- ✅ Banco PostgreSQL funcionando
- ✅ HTTPS em tudo

**Sistema completo em produção! 🚀**

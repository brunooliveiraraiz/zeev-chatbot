# 🔐 Configuração de GitHub Secrets para Deploy Seguro

## 📋 Passo a Passo para Adicionar Secrets

### 1️⃣ Acesse as Configurações de Secrets

1. Vá para: https://github.com/brunooliveiraraiz/zeev-chatbot/settings/secrets/actions
2. Clique em **"New repository secret"** para cada variável abaixo

---

## 🔑 Secrets que Você DEVE Configurar

### **Secrets Obrigatórios:**

Adicione cada um desses secrets no GitHub:

| Nome do Secret | Valor | Descrição |
|----------------|-------|-----------|
| `PORT` | `3000` | Porta da API |
| `STAGE_DEFAULT` | `hml` | Ambiente padrão |
| `AUTH_MODE` | `DEV` | Modo de autenticação |
| `MOCK_MODE` | `false` | Se usa mock ou integração real |
| `CORS_ORIGINS` | `https://hmlraizeducacao.zeev.it,https://brunooliveiraraiz.github.io` | URLs permitidas para CORS |
| `DATABASE_URL` | `file:./data/chatbot.db` | Caminho do banco SQLite |
| `RATE_LIMIT_WINDOW_MS` | `60000` | Janela de rate limiting |
| `RATE_LIMIT_MAX_REQUESTS` | `100` | Máximo de requisições |
| `LOG_LEVEL` | `info` | Nível de logging |

### **Secrets SENSÍVEIS (use os valores do seu .env local):**

⚠️ **ATENÇÃO:** Copie exatamente do seu arquivo `.env` local!

| Nome do Secret | Valor (copie do seu .env) |
|----------------|---------------------------|
| `ANTHROPIC_API_KEY` | `sk-ant-api03-P-2yR8a...` |
| `ZEEV_TOKEN` | `Bearer Gcsa83qgv...` |
| `CONTEXT_SIGNING_SECRET` | Gere novo: `openssl rand -hex 32` |
| `JWT_SECRET` | Gere novo: `openssl rand -hex 32` |
| `CHAT_SESSION_SECRET` | Gere novo: `openssl rand -hex 32` |

### **Secrets da Integração Zeev:**

| Nome do Secret | Valor |
|----------------|-------|
| `ZEEV_BASE_URL` | `https://hmlraizeducacao.zeev.it/api` |
| `ZEEV_ENDPOINT_CREATE_INSTANCE` | `/processes/{processId}/instances` |
| `ZEEV_PROCESS_ID` | `process-123` |
| `ZEEV_TIMEOUT_MS` | `10000` |

### **Secrets Adicionais:**

| Nome do Secret | Valor |
|----------------|-------|
| `JWT_ISSUER` | `zeev-portal` |
| `JWT_AUDIENCE` | `zeev-chatbot` |
| `CHAT_SESSION_EXPIRES_IN` | `24h` |
| `AI_TROUBLESHOOTING_ENABLED` | `true` |

---

## 📝 Como Adicionar Cada Secret

Para cada linha da tabela acima:

1. Acesse: https://github.com/brunooliveiraraiz/zeev-chatbot/settings/secrets/actions
2. Clique em **"New repository secret"**
3. Em **"Name"**: coloque exatamente o nome da coluna (ex: `PORT`)
4. Em **"Secret"**: cole o valor correspondente (ex: `3000`)
5. Clique em **"Add secret"**
6. Repita para todos os secrets

---

## 🎯 Secrets para Deploy (Opcional - Configure Depois)

### Se for usar **SSH** para deploy em servidor:

| Nome do Secret | Descrição |
|----------------|-----------|
| `SERVER_HOST` | IP ou domínio do servidor (ex: `192.168.1.100`) |
| `SERVER_USER` | Usuário SSH (ex: `ubuntu`) |
| `SERVER_SSH_KEY` | Chave privada SSH (conteúdo do arquivo `~/.ssh/id_rsa`) |
| `SERVER_PORT` | Porta SSH (geralmente `22`) |

### Se for usar **Azure**:

| Nome do Secret | Descrição |
|----------------|-----------|
| `AZURE_WEBAPP_NAME` | Nome do Azure Web App |
| `AZURE_WEBAPP_PUBLISH_PROFILE` | XML do perfil de publicação (baixe no Azure Portal) |

### Se for usar **Docker**:

| Nome do Secret | Descrição |
|----------------|-----------|
| `DOCKER_REGISTRY` | URL do registry (ex: `ghcr.io/brunooliveiraraiz`) |
| `DOCKER_USERNAME` | Usuário do registry |
| `DOCKER_PASSWORD` | Token/senha do registry |

---

## ✅ Verificação

Após adicionar todos os secrets, você deve ver algo assim:

```
ANTHROPIC_API_KEY          ••••••••••••••••
AUTH_MODE                  ••••••••••••••••
CHAT_SESSION_EXPIRES_IN    ••••••••••••••••
CHAT_SESSION_SECRET        ••••••••••••••••
CONTEXT_SIGNING_SECRET     ••••••••••••••••
CORS_ORIGINS               ••••••••••••••••
DATABASE_URL               ••••••••••••••••
JWT_AUDIENCE               ••••••••••••••••
JWT_ISSUER                 ••••••••••••••••
JWT_SECRET                 ••••••••••••••••
LOG_LEVEL                  ••••••••••••••••
MOCK_MODE                  ••••••••••••••••
PORT                       ••••••••••••••••
RATE_LIMIT_MAX_REQUESTS    ••••••••••••••••
RATE_LIMIT_WINDOW_MS       ••••••••••••••••
STAGE_DEFAULT              ••••••••••••••••
ZEEV_BASE_URL              ••••••••••••••••
ZEEV_ENDPOINT_CREATE_INSTANCE ••••••••••••••••
ZEEV_PROCESS_ID            ••••••••••••••••
ZEEV_TIMEOUT_MS            ••••••••••••••••
ZEEV_TOKEN                 ••••••••••••••••
AI_TROUBLESHOOTING_ENABLED ••••••••••••••••
```

---

## 🚀 Testando

Após configurar os secrets:

1. Vá em: https://github.com/brunooliveiraraiz/zeev-chatbot/actions
2. Clique em **"Deploy API to HML"**
3. Clique em **"Run workflow"** → **"Run workflow"**
4. Acompanhe os logs do deploy

---

## 🔒 Segurança

✅ **Vantagens desta abordagem:**
- Secrets nunca aparecem no código
- Secrets não ficam no histórico do Git
- Apenas administradores do repo veem os secrets
- Logs do GitHub Actions escondem os secrets automaticamente
- Fácil rotacionar secrets sem alterar código

⚠️ **NUNCA:**
- Faça print das configurações de secrets
- Compartilhe os valores por email/chat
- Comite o `.env` no GitHub

---

## 📞 Precisa de Ajuda?

Se algum secret estiver faltando ou com erro:
1. Verifique o nome está **exatamente** igual (case-sensitive)
2. Verifique se o valor não tem espaços no início/fim
3. Para secrets multi-linha (como SSH key), cole todo o conteúdo incluindo `-----BEGIN/END-----`

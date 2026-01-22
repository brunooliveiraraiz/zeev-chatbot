# 🚀 Deploy da API no Servidor Zeev HML

## 📋 Pré-requisitos no Servidor Zeev

O servidor precisa ter instalado:
- ✅ Node.js 18+ (`node --version`)
- ✅ NPM (`npm --version`)
- ✅ Git (`git --version`)
- ✅ PM2 (gerenciador de processos) - será instalado se não tiver

---

## 🔧 Passo a Passo para Deploy

### **1️⃣ Clonar o Repositório no Servidor**

```bash
# Conecte via SSH no servidor Zeev HML
ssh usuario@servidor-zeev-hml

# Vá para o diretório onde quer instalar (exemplo)
cd /var/www/

# Clone o repositório
git clone https://github.com/brunooliveiraraiz/zeev-chatbot.git
cd zeev-chatbot
```

---

### **2️⃣ Instalar Dependências**

```bash
# Instalar todas as dependências do projeto
npm install

# Instalar dependências específicas da API
cd apps/api
npm install
```

---

### **3️⃣ Configurar Variáveis de Ambiente**

Crie o arquivo `.env` dentro de `apps/api/`:

```bash
cd /var/www/zeev-chatbot/apps/api
nano .env
```

Cole este conteúdo (ajuste os valores conforme necessário):

```env
# API Configuration
PORT=3000
NODE_ENV=production
STAGE_DEFAULT=hml

# Authentication Mode
AUTH_MODE=DEV

# Zeev Integration
MOCK_MODE=false
ZEEV_BASE_URL=https://hmlraizeducacao.zeev.it/api
# ⚠️ IMPORTANTE: Use o token real do Zeev HML aqui
ZEEV_TOKEN=Bearer SEU_TOKEN_ZEEV_REAL_AQUI
ZEEV_ENDPOINT_CREATE_INSTANCE=/processes/{processId}/instances
ZEEV_PROCESS_ID=process-123
ZEEV_TIMEOUT_MS=10000

# Database (SQLite)
DATABASE_URL=file:./data/chatbot.db

# CORS - Adicione o domínio do portal Zeev HML
CORS_ORIGINS=https://hmlraizeducacao.zeev.it,https://brunooliveiraraiz.github.io

# Rate Limiting
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100

# AI Troubleshooting (Anthropic Claude)
# ⚠️ IMPORTANTE: Use a API Key real aqui (começa com sk-ant-api03-)
ANTHROPIC_API_KEY=sk-ant-api03-SUBSTITUA_PELA_CHAVE_REAL_AQUI
AI_TROUBLESHOOTING_ENABLED=true

# Logging
LOG_LEVEL=info

# Secrets (gere novos em produção)
CONTEXT_SIGNING_SECRET=your-signing-secret-change-in-production
JWT_SECRET=your-jwt-secret-change-in-production
JWT_ISSUER=zeev-portal
JWT_AUDIENCE=zeev-chatbot
CHAT_SESSION_SECRET=your-chat-session-secret-change-in-production
CHAT_SESSION_EXPIRES_IN=24h
```

Salve o arquivo (Ctrl+O, Enter, Ctrl+X).

---

### **4️⃣ Executar Migrações do Banco de Dados**

```bash
cd /var/www/zeev-chatbot/apps/api

# Criar diretório para o banco de dados
mkdir -p data

# Executar migrações do Prisma
npx prisma migrate deploy

# Gerar Prisma Client
npx prisma generate
```

---

### **5️⃣ Buildar a API**

```bash
cd /var/www/zeev-chatbot/apps/api
npm run build
```

---

### **6️⃣ Instalar e Configurar PM2**

```bash
# Instalar PM2 globalmente (se não tiver)
npm install -g pm2

# Iniciar a API com PM2
cd /var/www/zeev-chatbot/apps/api
pm2 start npm --name "zeev-chatbot-api" -- start

# Salvar configuração do PM2
pm2 save

# Configurar PM2 para iniciar automaticamente no boot
pm2 startup
# Copie e execute o comando que aparecer
```

---

### **7️⃣ Verificar se Está Rodando**

```bash
# Ver status do PM2
pm2 status

# Ver logs em tempo real
pm2 logs zeev-chatbot-api

# Testar a API
curl http://localhost:3000/health
```

Resposta esperada:
```json
{"status":"ok","timestamp":"2026-01-22T..."}
```

---

### **8️⃣ Configurar Nginx/Apache (Proxy Reverso)**

A API está rodando em `localhost:3000`. Você precisa expor ela via domínio.

#### **Exemplo com Nginx:**

Crie um arquivo de configuração:

```bash
sudo nano /etc/nginx/sites-available/chatbot-api
```

Cole este conteúdo (ajuste o domínio):

```nginx
server {
    listen 80;
    server_name chatbot-api.hmlraizeducacao.zeev.it;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Ativar o site:

```bash
sudo ln -s /etc/nginx/sites-available/chatbot-api /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

### **9️⃣ Configurar HTTPS (Certbot)**

```bash
# Instalar Certbot (se não tiver)
sudo apt install certbot python3-certbot-nginx

# Obter certificado SSL
sudo certbot --nginx -d chatbot-api.hmlraizeducacao.zeev.it
```

---

### **🔟 Testar a API Externamente**

```bash
curl https://chatbot-api.hmlraizeducacao.zeev.it/health
```

---

## 🔄 Comandos Úteis do PM2

```bash
# Ver status
pm2 status

# Ver logs
pm2 logs zeev-chatbot-api

# Reiniciar
pm2 restart zeev-chatbot-api

# Parar
pm2 stop zeev-chatbot-api

# Deletar
pm2 delete zeev-chatbot-api

# Monitorar recursos
pm2 monit
```

---

## 🔄 Atualizações Futuras

Quando houver atualizações no código:

```bash
cd /var/www/zeev-chatbot

# Baixar últimas alterações
git pull origin main

# Reinstalar dependências (se houver mudanças)
npm install
cd apps/api
npm install

# Rebuild
npm run build

# Executar migrações (se houver)
npx prisma migrate deploy

# Reiniciar API
pm2 restart zeev-chatbot-api
```

---

## 📍 URLs Importantes Após Deploy

Depois de configurar, anote estas URLs:

- **API Health:** `https://chatbot-api.hmlraizeducacao.zeev.it/health`
- **API Route:** `https://chatbot-api.hmlraizeducacao.zeev.it/route`
- **Widget:** `https://brunooliveiraraiz.github.io/zeev-chatbot/`

---

## ⚠️ Importante

1. **Domínio da API:** Substitua `chatbot-api.hmlraizeducacao.zeev.it` pelo domínio real que será usado
2. **Firewall:** Certifique-se que a porta 3000 está liberada internamente
3. **Porta 80/443:** Nginx/Apache precisa estar rodando e acessível externamente
4. **Backup:** Faça backup do banco de dados periodicamente (`apps/api/data/chatbot.db`)

---

## 🐛 Troubleshooting

### API não inicia:
```bash
pm2 logs zeev-chatbot-api
```

### Erro de permissão no banco:
```bash
chmod 755 /var/www/zeev-chatbot/apps/api/data
chmod 644 /var/www/zeev-chatbot/apps/api/data/chatbot.db
```

### Erro de CORS:
Adicione o domínio correto no `.env`:
```env
CORS_ORIGINS=https://hmlraizeducacao.zeev.it,https://brunooliveiraraiz.github.io
```

---

## 📞 Próximos Passos

Depois que a API estiver rodando:
1. Anote a URL da API (ex: `https://chatbot-api.hmlraizeducacao.zeev.it`)
2. Configure essa URL no widget
3. Integre o widget no portal Zeev HML

#!/bin/bash

# Script de Deploy Automatizado para Zeev HML
# Execute este script no servidor Zeev após clonar o repositório

set -e  # Para em caso de erro

echo "🚀 Iniciando deploy do Zeev Chatbot API no servidor HML..."

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Verificar se está no diretório correto
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Erro: Execute este script na raiz do projeto zeev-chatbot${NC}"
    exit 1
fi

# 1. Instalar dependências
echo -e "${YELLOW}📦 Instalando dependências...${NC}"
npm install
cd apps/api
npm install
cd ../..

# 2. Verificar se .env existe
if [ ! -f "apps/api/.env" ]; then
    echo -e "${RED}⚠️  Arquivo .env não encontrado!${NC}"
    echo "Criando .env a partir do .env.example..."
    cp apps/api/.env.example apps/api/.env
    echo -e "${YELLOW}⚠️  IMPORTANTE: Edite apps/api/.env com as configurações corretas!${NC}"
    echo "Execute: nano apps/api/.env"
    exit 1
fi

# 3. Criar diretório do banco de dados
echo -e "${YELLOW}📁 Criando diretório do banco de dados...${NC}"
mkdir -p apps/api/data

# 4. Executar migrações do Prisma
echo -e "${YELLOW}🗄️  Executando migrações do banco de dados...${NC}"
cd apps/api
npx prisma migrate deploy
npx prisma generate

# 5. Build da API
echo -e "${YELLOW}🔨 Buildando a API...${NC}"
npm run build

# 6. Verificar se PM2 está instalado
if ! command -v pm2 &> /dev/null; then
    echo -e "${YELLOW}📦 PM2 não encontrado. Instalando PM2...${NC}"
    npm install -g pm2
fi

# 7. Parar processo anterior (se existir)
echo -e "${YELLOW}🔄 Parando processo anterior (se existir)...${NC}"
pm2 delete zeev-chatbot-api 2>/dev/null || true

# 8. Iniciar API com PM2
echo -e "${YELLOW}🚀 Iniciando API com PM2...${NC}"
pm2 start npm --name "zeev-chatbot-api" -- start

# 9. Salvar configuração PM2
pm2 save

# 10. Testar API
echo -e "${YELLOW}🧪 Testando API...${NC}"
sleep 3
HEALTH_CHECK=$(curl -s http://localhost:3000/health || echo "ERROR")

if [[ $HEALTH_CHECK == *"ok"* ]]; then
    echo -e "${GREEN}✅ API está rodando com sucesso!${NC}"
    echo -e "${GREEN}✅ Health check: http://localhost:3000/health${NC}"
else
    echo -e "${RED}❌ Erro ao testar API. Verifique os logs:${NC}"
    echo "pm2 logs zeev-chatbot-api"
    exit 1
fi

# 11. Mostrar status
echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}🎉 Deploy concluído com sucesso!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "📊 Status do PM2:"
pm2 status

echo ""
echo "📋 Próximos passos:"
echo "  1. Configure o Nginx/Apache para expor a API externamente"
echo "  2. Configure SSL com Certbot"
echo "  3. Anote a URL da API e configure no widget"
echo ""
echo "📚 Documentação completa em: DEPLOY_ZEEV_HML.md"
echo ""
echo "🔍 Comandos úteis:"
echo "  - Ver logs: pm2 logs zeev-chatbot-api"
echo "  - Reiniciar: pm2 restart zeev-chatbot-api"
echo "  - Status: pm2 status"
echo ""

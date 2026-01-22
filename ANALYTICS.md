# 📊 Sistema de Analytics e Avaliação

Sistema completo de analytics para o Chatbot Zeev, incluindo avaliação de usuários, métricas de resolução e relatórios automáticos em PowerPoint.

---

## 🎯 Funcionalidades

### 1. **Avaliação de Usuários**
- Avaliação por estrelas (1-5)
- Feedback opcional em texto
- Avaliação simplificada (útil/não útil)
- API REST para envio de avaliações

### 2. **Métricas de Resolução**
- Rastreamento automático de problemas resolvidos
- Diferenciação entre resolvido pelo chatbot vs escalado
- Métricas por categoria de solicitação
- Taxa de resolução em tempo real

### 3. **Relatórios Automáticos**
- Geração de PPT com gráficos
- Gráficos por dia (últimos 30 dias)
- Gráficos por mês (ano vigente)
- Agendamento semanal automático

---

## 📁 Estrutura de Dados

### Tabelas do Banco de Dados

#### `ConversationResolution`
Armazena informações sobre resoluções de problemas:

```prisma
model ConversationResolution {
  id          String   @id
  sessionId   String   @unique
  resolved    Boolean  // true = resolvido, false = não resolvido
  resolvedBy  String?  // "troubleshooting" | "ai_routing" | "escalated"
  category    String?  // Categoria identificada
  requestId   String?  // ID do request do catálogo
  resolvedAt  DateTime?
  createdAt   DateTime
  updatedAt   DateTime
}
```

#### `ConversationRating`
Armazena avaliações dos usuários:

```prisma
model ConversationRating {
  id           String   @id
  sessionId    String   @unique
  rating       Int      // 1-5 estrelas
  feedback     String?  // Comentário opcional
  helpful      Boolean? // true/false (útil/não útil)
  createdAt    DateTime
}
```

---

## 🔌 API Endpoints

### **POST /analytics/rating**
Registra avaliação do usuário

**Request:**
```json
{
  "sessionId": "abc123",
  "rating": 5,
  "feedback": "Muito útil, resolveu meu problema rapidamente!",
  "helpful": true
}
```

**Response:**
```json
{
  "success": true,
  "message": "Rating recorded successfully"
}
```

**Campos:**
- `sessionId` (obrigatório): ID da sessão
- `rating` (opcional): 1-5 estrelas
- `helpful` (opcional): true/false
- `feedback` (opcional): Texto livre (máx 1000 caracteres)

**Nota:** É necessário fornecer `rating` OU `helpful`, ou ambos.

---

### **GET /analytics/stats**
Obtém estatísticas gerais

**Query Params:**
- `startDate` (opcional): YYYY-MM-DD
- `endDate` (opcional): YYYY-MM-DD

**Response:**
```json
{
  "total": 1234,
  "resolved": 987,
  "escalated": 247,
  "resolutionRate": 80.0,
  "avgRating": 4.5,
  "ratingCount": 456
}
```

---

### **GET /analytics/daily**
Obtém estatísticas por dia

**Query Params (obrigatórios):**
- `startDate`: YYYY-MM-DD
- `endDate`: YYYY-MM-DD

**Response:**
```json
[
  {
    "date": "2026-01-15",
    "resolved": 45,
    "escalated": 12,
    "total": 57
  },
  {
    "date": "2026-01-16",
    "resolved": 52,
    "escalated": 8,
    "total": 60
  }
]
```

---

### **GET /analytics/monthly/:year**
Obtém estatísticas por mês

**Params:**
- `year`: Ano (ex: 2026)

**Response:**
```json
[
  {
    "month": "2026-01",
    "resolved": 345,
    "escalated": 89,
    "total": 434
  },
  {
    "month": "2026-02",
    "resolved": 412,
    "escalated": 75,
    "total": 487
  }
]
```

---

### **GET /analytics/feedback**
Obtém avaliações com feedback

**Query Params:**
- `limit` (opcional, default 50): Número máximo de resultados

**Response:**
```json
[
  {
    "sessionId": "abc123",
    "rating": 5,
    "feedback": "Excelente atendimento!",
    "createdAt": "2026-01-21T10:30:00Z"
  }
]
```

---

### **GET /analytics/top-categories**
Obtém categorias mais resolvidas

**Query Params:**
- `limit` (opcional, default 10): Número de categorias

**Response:**
```json
[
  {
    "category": "ti_infraestrutura",
    "count": 234
  },
  {
    "category": "atendimento_matricula",
    "count": 156
  }
]
```

---

## 📊 Relatórios PowerPoint

### Geração Manual

```bash
# Gerar relatório agora
npm run report:generate
```

Isso cria um arquivo PPT em `scripts/reports/` com:
- **Slide 1:** Capa com título e data
- **Slide 2:** Estatísticas gerais (tabela)
- **Slide 3:** Gráfico de resoluções por dia (últimos 30 dias)
- **Slide 4:** Gráfico de resoluções por mês (ano vigente)

### Agendamento Automático

```bash
# Iniciar agendamento semanal
npm run report:schedule
```

Configuração padrão:
- **Frequência:** Toda segunda-feira às 09:00
- **Fuso horário:** America/Sao_Paulo
- **Geração inicial:** Ao iniciar o script

#### Rodando em Produção

Para manter o agendamento ativo em produção, use PM2:

```bash
# Instalar PM2 globalmente
npm install -g pm2

# Iniciar agendador
pm2 start npm --name "chatbot-reports" -- run report:schedule

# Ver logs
pm2 logs chatbot-reports

# Parar
pm2 stop chatbot-reports

# Reiniciar
pm2 restart chatbot-reports

# Status
pm2 status
```

#### Configurar PM2 para Iniciar no Boot

```bash
# Salvar configuração
pm2 save

# Gerar script de startup
pm2 startup

# Seguir instruções exibidas
```

---

## 💻 Integração no Frontend

### Exemplo: Widget de Avaliação

```javascript
// Após conversa terminar ou link ser enviado
async function submitRating(sessionId, rating, feedback) {
  try {
    const response = await fetch('https://api.example.com/analytics/rating', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sessionId,
        rating,
        feedback,
      }),
    });

    const data = await response.json();

    if (data.success) {
      console.log('Avaliação enviada com sucesso!');
    }
  } catch (error) {
    console.error('Erro ao enviar avaliação:', error);
  }
}

// Exemplo de uso
// submitRating('session-123', 5, 'Muito útil!');
```

### Exemplo: Botão Simples (Útil/Não Útil)

```javascript
async function submitHelpful(sessionId, helpful) {
  await fetch('https://api.example.com/analytics/rating', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      sessionId,
      helpful,
    }),
  });
}

// <button onclick="submitHelpful('session-123', true)">👍 Útil</button>
// <button onclick="submitHelpful('session-123', false)">👎 Não útil</button>
```

---

## 🔄 Tracking Automático

O sistema registra automaticamente as resoluções em 3 pontos:

### 1. **Troubleshooting Service**
Quando problema é resolvido via troubleshooting (estático ou IA):
```typescript
await analyticsService.recordResolution({
  sessionId,
  resolved: true,
  resolvedBy: 'troubleshooting',
  category: session.category,
});
```

### 2. **AI Routing Service**
Quando IA resolve o problema na primeira interação:
```typescript
await analyticsService.recordResolution({
  sessionId,
  resolved: true,
  resolvedBy: 'ai_routing',
  requestId: analysis.identifiedRequestId,
});
```

### 3. **Routing Service**
Quando usuário é escalado para formulário (não resolvido):
```typescript
await analyticsService.recordResolution({
  sessionId,
  resolved: false,
  resolvedBy: 'escalated',
  category: catalogItem.id,
  requestId: catalogItem.id,
});
```

---

## 📈 Exemplos de Uso

### Dashboard Simples

```javascript
// Obter estatísticas gerais
const stats = await fetch('/analytics/stats').then(r => r.json());

console.log(`Taxa de Resolução: ${stats.resolutionRate}%`);
console.log(`Avaliação Média: ${stats.avgRating}⭐`);
console.log(`${stats.resolved} resolvidos de ${stats.total} total`);
```

### Gráfico Personalizado

```javascript
// Obter dados diários
const dailyData = await fetch(
  '/analytics/daily?startDate=2026-01-01&endDate=2026-01-31'
).then(r => r.json());

// Usar com Chart.js, D3.js, etc.
const labels = dailyData.map(d => d.date);
const resolved = dailyData.map(d => d.resolved);
const escalated = dailyData.map(d => d.escalated);
```

---

## 🛠️ Personalização

### Alterar Agendamento

Edite `scripts/schedule-reports.ts`:

```typescript
// Segunda-feira às 09:00
cron.schedule('0 9 * * 1', ...);

// Todos os dias às 18:00
cron.schedule('0 18 * * *', ...);

// Domingo às 20:00
cron.schedule('0 20 * * 0', ...);
```

**Formato:** `segundo minuto hora dia mês dia-da-semana`

### Personalizar PPT

Edite `scripts/generate-ppt-report.ts`:

- **Cores:** Altere valores hexadecimais nas cores dos gráficos
- **Slides:** Adicione/remova slides conforme necessário
- **Período:** Modifique `getDailyData()` e `getMonthlyData()`
- **Estilo:** Personalize fontes, tamanhos, posições

---

## 📊 Métricas Importantes

### Taxa de Resolução
```
Taxa = (Resolvidos / Total) × 100
```

**Meta recomendada:** > 70%

- **Excelente:** > 80%
- **Bom:** 70-80%
- **Necessita melhoria:** < 70%

### Avaliação Média
```
Média = Soma(ratings) / Contagem(ratings)
```

**Meta recomendada:** > 4.0 ⭐

- **Excelente:** > 4.5
- **Bom:** 4.0-4.5
- **Necessita melhoria:** < 4.0

---

## 🐛 Troubleshooting

### Erro: "Failed to record resolution"

**Causa:** Banco de dados não está acessível

**Solução:**
```bash
# Verificar se migration foi executada
cd apps/api
npx prisma migrate status

# Aplicar migrations pendentes
npx prisma migrate deploy
```

### Relatório PPT não é gerado

**Causa:** Sem dados no banco

**Solução:**
- Certifique-se de que há conversas registradas
- Execute alguns testes no chatbot
- Verifique logs: `npm run report:generate`

### Agendamento não está funcionando

**Causa:** Script não está rodando em background

**Solução:**
```bash
# Use PM2 para manter rodando
pm2 start npm --name "chatbot-reports" -- run report:schedule
pm2 save
```

---

## 📝 Notas Importantes

1. **Privacidade:** sessionId é único por conversa, não identifica usuário pessoalmente
2. **GDPR:** Feedback pode conter dados pessoais - implemente política de retenção
3. **Performance:** Analytics Service cria índices automáticos para queries rápidas
4. **Backup:** Considere backup regular da tabela `ConversationRating` (feedback dos usuários)

---

## 🚀 Próximos Passos

- [ ] Dashboard web para visualização em tempo real
- [ ] Exportar dados para Excel/CSV
- [ ] Alertas automáticos (email/Slack) quando taxa de resolução cair
- [ ] A/B testing de prompts do chatbot
- [ ] Análise de sentimento do feedback
- [ ] Integração com ferramentas BI (Power BI, Tableau)

---

## 📚 Referências

- [PptxGenJS Documentation](https://gitbrent.github.io/PptxGenJS/)
- [node-cron Documentation](https://github.com/node-cron/node-cron)
- [Prisma Client](https://www.prisma.io/docs/concepts/components/prisma-client)
- [PM2 Documentation](https://pm2.keymetrics.io/docs/usage/quick-start/)

---

**Sistema desenvolvido para Raiz Educação**
Versão: 1.0.0
Última atualização: Janeiro 2026

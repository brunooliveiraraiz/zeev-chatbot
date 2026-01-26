# 📊 Sistema de Métricas e Analytics

## Visão Geral

O sistema rastreia **automaticamente** todas as conversas e salva no banco de dados para gerar relatórios detalhados.

---

## 🎯 O Que é Rastreado

### 1. **Problemas Resolvidos (Troubleshooting)**

Quando o chatbot consegue resolver o problema do usuário **SEM precisar direcionar** para um formulário:

**Exemplo:**
```
Usuário: "Esqueci minha senha do sistema"
Bot: "Acesse o link 'Esqueci minha senha' na tela de login..."
Bot: PROBLEMA_RESOLVIDO
```

**Salvo no banco:**
```json
{
  "sessionId": "abc123",
  "resolved": true,
  "resolvedBy": "troubleshooting",
  "category": "troubleshooting",
  "resolvedAt": "2026-01-26T20:00:00Z"
}
```

---

### 2. **Escalações para Formulário**

Quando o chatbot **direciona** o usuário para um formulário Zeev:

**Exemplo:**
```
Usuário: "Meu notebook não está ligando"
Bot: "Vou te direcionar para TI - Infraestrutura."
Bot: DIRECIONAR:transformacao_infraestrutura
```

**Salvo no banco:**
```json
{
  "sessionId": "xyz789",
  "resolved": false,
  "resolvedBy": "escalated",
  "requestId": "transformacao_infraestrutura",
  "category": "Transformação",
  "resolvedAt": "2026-01-26T20:05:00Z"
}
```

---

## 📈 Métricas Disponíveis nos Relatórios

### Estatísticas Gerais:

1. **Total de Conversas**
   - Todas as conversas que tiveram resolução (troubleshooting ou escalação)

2. **Problemas Resolvidos**
   - Conversas onde o bot resolveu sem precisar escalar
   - `resolved = true` e `resolvedBy = 'troubleshooting'`

3. **Escalados para Formulário**
   - Conversas que foram direcionadas para formulários Zeev
   - `resolvedBy = 'escalated'`

4. **Taxa de Resolução**
   - Percentual de problemas resolvidos vs. total
   - Fórmula: `(Resolvidos / Total) × 100`

5. **Avaliação Média**
   - Média das estrelas dadas pelos usuários (1-5)
   - Extraído da tabela `ConversationRating`

---

## 📊 Gráficos Gerados

### Gráfico 1: Resoluções por Dia (Últimos 30 Dias)

**Linhas:**
- 🟢 Verde: Problemas resolvidos (troubleshooting)
- 🔴 Vermelha: Escalados para formulário

**Mostra:**
- Tendências diárias
- Picos de uso
- Eficiência do bot ao longo do tempo

### Gráfico 2: Resoluções por Mês (Ano Atual)

**Barras:**
- 🟢 Verde: Resolvidos por mês
- 🔴 Vermelha: Escalados por mês

**Mostra:**
- Padrões sazonais
- Crescimento de uso
- Performance mensal

---

## 🗄️ Estrutura do Banco de Dados

### Tabela: `ConversationResolution`

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | String | ID único (CUID) |
| `sessionId` | String | ID da sessão (único) |
| `resolved` | Boolean | `true` = resolvido, `false` = escalado |
| `resolvedBy` | String | `'troubleshooting'` ou `'escalated'` |
| `category` | String | Área (Transformação, Atendimento, etc.) |
| `requestId` | String | ID do formulário (se escalado) |
| `resolvedAt` | DateTime | Data/hora da resolução |
| `createdAt` | DateTime | Data/hora de criação |
| `updatedAt` | DateTime | Data/hora de atualização |

### Tabela: `ConversationRating`

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | String | ID único (CUID) |
| `sessionId` | String | ID da sessão (único) |
| `rating` | Integer | Estrelas (1-5) |
| `helpful` | Boolean | Útil? (true/false) |
| `feedback` | String | Comentário opcional |
| `createdAt` | DateTime | Data/hora |

---

## 🔄 Fluxo Completo

### Cenário 1: Problema Resolvido

```
1. Usuário: "Como redefino minha senha?"
2. Bot: orienta passo a passo
3. Bot: marca PROBLEMA_RESOLVIDO
   ↓
4. Sistema salva no banco:
   - resolved = true
   - resolvedBy = 'troubleshooting'
   ↓
5. Widget mostra avaliação (após 5s)
6. Usuário avalia com 5 estrelas
   ↓
7. Sistema salva avaliação no banco
   ↓
8. No relatório semanal:
   - +1 em "Problemas Resolvidos"
   - +1 em "Total de Conversas"
   - Avaliação média recalculada
```

### Cenário 2: Escalado para Formulário

```
1. Usuário: "Preciso solicitar pagamento"
2. Bot: identifica necessidade de formulário
3. Bot: marca DIRECIONAR:financeiro_solicitacoes
   ↓
4. Sistema salva no banco:
   - resolved = false
   - resolvedBy = 'escalated'
   - requestId = 'financeiro_solicitacoes'
   - category = 'Financeiro'
   ↓
5. Widget mostra link do formulário
6. Widget mostra avaliação (após 5s)
7. Usuário avalia com 4 estrelas
   ↓
8. Sistema salva avaliação no banco
   ↓
9. No relatório semanal:
   - +1 em "Escalados para Formulário"
   - +1 em "Total de Conversas"
   - Gráfico mostra: 1 escalação na área "Financeiro"
```

---

## 📅 Quando os Dados São Usados

### 1. Relatórios Semanais Automáticos

- **Frequência:** Toda segunda-feira às 09:00
- **Período analisado:**
  - Últimos 30 dias (gráfico diário)
  - Ano atual completo (gráfico mensal)
- **Formato:** PPT anexado no email

### 2. Endpoint de Analytics Manual

Você pode consultar os dados a qualquer momento:

```bash
curl https://zeev-chatbot-api.vercel.app/api/analytics/list-ratings
```

---

## 🎯 Interpretando as Métricas

### Taxa de Resolução Alta (>70%)
✅ **Bom!** O bot está resolvendo a maioria dos problemas sozinho
- Reduz carga no suporte
- Usuários têm respostas rápidas

### Taxa de Resolução Baixa (<30%)
⚠️ **Atenção!** Muitas escalações
- Possíveis causas:
  - Perguntas fora do escopo do bot
  - Troubleshooting insuficiente
  - Usuários preferindo ir direto ao formulário
- Ações:
  - Melhorar prompt de troubleshooting
  - Adicionar mais knowledge base
  - Treinar bot com casos reais

### Avaliação Média Baixa (<3.0)
🔴 **Crítico!** Usuários insatisfeitos
- Investigar feedbacks negativos
- Melhorar qualidade das respostas
- Revisar formulários direcionados

---

## 🔍 Consultando Dados Manualmente

### Ver Estatísticas de Avaliações

```bash
curl https://zeev-chatbot-api.vercel.app/api/analytics/list-ratings
```

Retorna:
```json
{
  "success": true,
  "stats": {
    "total": 10,
    "avgRating": "4.5",
    "helpful": 8,
    "notHelpful": 2,
    "withFeedback": 3
  },
  "ratings": [...]
}
```

### Gerar Relatório Manual

```bash
curl -X POST https://zeev-chatbot-api.vercel.app/api/generate-report \
  -H "Authorization: Bearer SEU_CRON_SECRET"
```

Envia email imediatamente com PPT completo.

---

## 📊 Exemplo de Relatório Real

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 RELATÓRIO SEMANAL - 27/01/2026
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📈 ESTATÍSTICAS GERAIS:
   Total de Conversas: 150
   Problemas Resolvidos: 95 (troubleshooting)
   Escalados: 55 (formulários)
   Taxa de Resolução: 63.3%
   Avaliação Média: 4.5⭐ (42 avaliações)

📊 TOP 5 FORMULÁRIOS MAIS USADOS:
   1. TI - Infraestrutura: 15x
   2. Atendimento - Cancelamento: 12x
   3. Financeiro - Solicitações: 10x
   4. DP - Benefícios: 8x
   5. Operações - Compras: 6x

📉 TENDÊNCIA SEMANAL:
   Segunda: 25 conversas (15 resolvidos)
   Terça: 30 conversas (20 resolvidos)
   Quarta: 28 conversas (18 resolvidos)
   Quinta: 32 conversas (22 resolvidos)
   Sexta: 35 conversas (20 resolvidos)
```

---

## 🛠️ Manutenção

### Limpeza de Dados Antigos

Por padrão, **todos os dados são mantidos** para histórico.

Se quiser limpar dados antigos (opcional):

```sql
-- Remover resoluções com mais de 1 ano
DELETE FROM "ConversationResolution"
WHERE "createdAt" < NOW() - INTERVAL '1 year';

-- Remover avaliações com mais de 1 ano
DELETE FROM "ConversationRating"
WHERE "createdAt" < NOW() - INTERVAL '1 year';
```

---

## 🎓 Boas Práticas

1. **Revisar relatórios semanais**
   - Identificar padrões
   - Ajustar troubleshooting
   - Melhorar formulários

2. **Monitorar taxa de resolução**
   - Meta: >60%
   - Se cair muito: investigar causas

3. **Ler feedbacks dos usuários**
   - Implementar melhorias baseadas em comentários
   - Corrigir problemas recorrentes

4. **Acompanhar áreas com mais escalações**
   - Pode indicar necessidade de treinamento
   - Ou oportunidade de automatizar mais

---

## 📞 Suporte

Dúvidas sobre as métricas ou relatórios:
- Documentação completa: `RELATORIOS_AUTOMATICOS.md`
- Contato: bruno.oliveira@raizeducacao.com.br

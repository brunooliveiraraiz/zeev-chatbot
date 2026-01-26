# 🔍 Sistema de Rastreamento e Correção de Erros

## Visão Geral

Sistema automático que detecta, registra e ajuda a corrigir problemas no chatbot quando:
- Bot direciona para formulário errado
- Bot perde contexto da conversa
- Usuário reclama que a resposta está incorreta
- Bot não entende a solicitação

---

## 🎯 Como Funciona

### 1. **Detecção Automática**

O sistema detecta erros automaticamente quando o usuário usa frases como:
- "não é isso"
- "errado"
- "incorreto"
- "formulário errado"
- "não era isso"
- "não é o que eu preciso"
- "direcionou errado"
- "outro formulário"

**Exemplo:**
```
Usuário: "preciso de um fone de ouvido"
Bot: [direciona para TI - Sistemas] ❌
Usuário: "não é esse formulário, errado"
Sistema: ⚠️ ERRO DETECTADO E REGISTRADO AUTOMATICAMENTE
```

### 2. **Registro no Banco de Dados**

Quando um erro é detectado, o sistema salva:
- ✅ Mensagem do usuário
- ✅ Resposta incorreta do bot
- ✅ Histórico completo da conversa
- ✅ Formulário sugerido (se aplicável)
- ✅ Tipo de erro
- ✅ Data e hora

### 3. **Tipos de Erros Rastreados**

| Tipo | Descrição | Como é Detectado |
|------|-----------|------------------|
| `user_complaint` | Usuário reclama explicitamente | Frases como "errado", "incorreto" |
| `wrong_form` | Bot direcionou para formulário errado | Manual ou auto-detectado |
| `wrong_response` | Bot deu resposta inadequada | Manual |
| `lost_context` | Bot perdeu contexto da conversa | Manual |
| `timeout` | Conversa demorou demais | Automático (após limite) |

---

## 📊 Visualizando Erros Reportados

### Endpoint: Listar Todos os Erros

```bash
curl https://zeev-chatbot-api.vercel.app/api/analytics/list-errors
```

**Resposta:**
```json
{
  "success": true,
  "stats": {
    "total": 15,
    "byStatus": {
      "pending": 8,
      "reviewed": 4,
      "corrected": 2,
      "ignored": 1
    },
    "byType": {
      "user_complaint": 10,
      "wrong_form": 3,
      "wrong_response": 1,
      "lost_context": 1,
      "timeout": 0
    }
  },
  "errors": [
    {
      "id": "abc123",
      "sessionId": "session-xyz",
      "errorType": "user_complaint",
      "userMessage": "não é esse formulário",
      "botResponse": "Vou te direcionar para TI - Sistemas...",
      "conversationHistory": [...],
      "suggestedFormId": "transformacao_sistemas",
      "actualFormNeeded": null,
      "correctionStatus": "pending",
      "notes": null,
      "createdAt": "2026-01-26T20:00:00Z"
    }
  ]
}
```

### Filtrar por Status:

```bash
# Apenas erros pendentes
curl "https://zeev-chatbot-api.vercel.app/api/analytics/list-errors?status=pending"

# Apenas erros corrigidos
curl "https://zeev-chatbot-api.vercel.app/api/analytics/list-errors?status=corrected"
```

### Filtrar por Tipo:

```bash
curl "https://zeev-chatbot-api.vercel.app/api/analytics/list-errors?errorType=wrong_form"
```

---

## 🛠️ Reportando Erros Manualmente

Se você detectar um erro que o sistema não pegou automaticamente:

```bash
curl -X POST https://zeev-chatbot-api.vercel.app/api/analytics/report-error \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "session-123",
    "errorType": "wrong_form",
    "userMessage": "preciso de um fone de ouvido",
    "botResponse": "Direcionando para TI - Sistemas...",
    "conversationHistory": [],
    "suggestedFormId": "transformacao_sistemas",
    "actualFormNeeded": "operacoes_compras",
    "notes": "Deveria ter direcionado para Operações - Compras"
  }'
```

---

## ✅ Como Corrigir Erros

### Passo 1: Identificar o Erro

1. Acesse: `https://zeev-chatbot-api.vercel.app/api/analytics/list-errors?status=pending`
2. Veja a lista de erros pendentes
3. Analise:
   - O que o usuário pediu
   - Para onde o bot direcionou
   - Histórico completo da conversa

### Passo 2: Analisar a Causa Raiz

**Possíveis causas:**

1. **Prompt inadequado** - Bot não entende o contexto
   - **Solução:** Melhorar descrição do formulário no catálogo
   - **Solução:** Adicionar mais exemplos no prompt

2. **Formulário faltando** - Não existe formulário para aquela situação
   - **Solução:** Adicionar novo formulário ao catálogo

3. **Tags incorretas** - Palavras-chave não batem
   - **Solução:** Adicionar/corrigir tags no formulário

4. **Problema do Claude** - AI não está interpretando bem
   - **Solução:** Ajustar prompt do sistema

### Passo 3: Implementar a Correção

**Exemplo: Fone de Ouvido Direcionando Errado**

**Erro detectado:**
```json
{
  "userMessage": "preciso de um fone de ouvido",
  "suggestedFormId": "transformacao_sistemas",
  "actualFormNeeded": "operacoes_compras"
}
```

**Correção no `/api/catalog.js`:**

```javascript
{
  id: 'operacoes_compras',
  name: '[Operações] Compras',
  area: 'Operações',
  description: 'Comprar material, equipamento, PERIFÉRICOS (fone, mouse, teclado)...',
  tags: ['compra', 'material', 'equipamento', 'fone', 'fone de ouvido', 'headphone', ...],
  examples: [
    'preciso de um fone de ouvido novo',
    'quero comprar um headset',
    ...
  ]
}
```

### Passo 4: Testar a Correção

```bash
curl -X POST https://zeev-chatbot-api.vercel.app/api/route \
  -H "Content-Type: application/json" \
  -d '{
    "message": "preciso de um fone de ouvido",
    "sessionId": "test-correction-001",
    "stage": "hml"
  }'
```

Verificar se agora direciona corretamente para `operacoes_compras`.

### Passo 5: Marcar como Corrigido

(Manualmente no banco ou via endpoint futuro)

```sql
UPDATE "ConversationError"
SET
  "correctionStatus" = 'corrected',
  "correctedBy" = 'bruno.oliveira',
  "actualFormNeeded" = 'operacoes_compras',
  "notes" = 'Adicionado "fone de ouvido" nos exemplos e tags do formulário de Compras'
WHERE "id" = 'abc123';
```

---

## 📈 Monitoramento Contínuo

### Dashboard de Erros (Futuro)

Acessar painel visual em:
```
https://zeev-chatbot-api.vercel.app/dashboard/errors
```

Mostrará:
- 📊 Gráfico de erros ao longo do tempo
- 🔥 Top 10 erros mais frequentes
- ✅ Taxa de correção
- ⏱️ Tempo médio para correção

### Alertas Automáticos (Futuro)

Quando um erro crítico é detectado:
- 📧 Email para equipe
- 💬 Notificação no Slack
- 📱 Push notification

---

## 🧠 Aprendizado Contínuo

### Como o Sistema Melhora Automaticamente:

1. **Coleta de Dados**
   - Erros detectados automaticamente
   - Padrões identificados

2. **Análise de Padrões**
   - Quais formulários têm mais erros
   - Quais frases causam confusão
   - Horários com mais problemas

3. **Sugestões de Melhoria**
   - Adicionar exemplos ao prompt
   - Melhorar descrições
   - Criar novos formulários

4. **Validação**
   - Testar correções
   - Medir impacto
   - Ajustar se necessário

---

## 📋 Checklist Semanal de Manutenção

- [ ] Acessar lista de erros pendentes
- [ ] Analisar top 5 erros mais frequentes
- [ ] Implementar correções
- [ ] Testar correções em HML
- [ ] Marcar erros como corrigidos
- [ ] Deploy para produção
- [ ] Monitorar se erros diminuíram

---

## 🎯 Métricas de Qualidade

### KPIs para Acompanhar:

1. **Taxa de Erro**
   - Meta: <5% das conversas
   - Fórmula: `(Erros / Total Conversas) × 100`

2. **Tempo de Correção**
   - Meta: <48 horas
   - Fórmula: `Média(Data Correção - Data Detecção)`

3. **Taxa de Recorrência**
   - Meta: <10%
   - Fórmula: `(Erros Repetidos / Total Erros) × 100`

4. **Satisfação Pós-Correção**
   - Meta: >4.5⭐
   - Baseado nas avaliações após correções

---

## 🚨 Exemplos de Erros Comuns

### Erro 1: Equipamento vs. Suporte Técnico

**Problema:**
```
Usuário: "meu fone não funciona"
Bot: direciona para TI - Infraestrutura ❌
Correto: Operações - Compras (se quer novo)
Correto: TI - Infraestrutura (se quer consertar)
```

**Solução:** Bot deve perguntar: "Quer consertar ou solicitar um novo?"

### Erro 2: Cancelamento vs. Alteração

**Problema:**
```
Usuário: "quero mudar a matrícula"
Bot: direciona para Cancelamento ❌
Correto: Atendimento - Correção de Lançamento
```

**Solução:** Melhorar descrição de "mudar" vs. "cancelar"

### Erro 3: Financeiro vs. Atendimento

**Problema:**
```
Usuário: "preciso de reembolso"
Bot: direciona para Financeiro ❌
Correto: Atendimento - Devolução/Estorno (se for aluno)
Correto: Financeiro (se for colaborador)
```

**Solução:** Bot deve perguntar: "Você é aluno ou colaborador?"

---

## 💡 Dicas de Uso

### Para Desenvolvedores:

1. **Revise erros semanalmente** - Não deixe acumular
2. **Priorize erros recorrentes** - Corriga primeiro os que mais aparecem
3. **Teste antes de marcar como corrigido** - Valide sempre
4. **Documente correções** - Anote o que foi feito no campo `notes`

### Para Analistas:

1. **Identifique padrões** - Veja tendências nos erros
2. **Sugira melhorias** - Baseado nos dados
3. **Monitore métricas** - Taxa de erro, tempo de correção

### Para Gestores:

1. **Acompanhe KPIs** - Dashboard de erros
2. **Defina metas** - Taxa de erro, satisfação
3. **Aloque recursos** - Tempo para correções

---

## 📞 Suporte

Dúvidas sobre o sistema de rastreamento:
- Documentação técnica: `METRICAS_E_ANALYTICS.md`
- Contato: bruno.oliveira@raizeducacao.com.br

---

## 🎉 Resultado Esperado

Com este sistema ativo:
- ✅ **95%+ de acurácia** no direcionamento
- ✅ **Menos de 5% de erros** reportados
- ✅ **Correção em <48h** dos erros detectados
- ✅ **Melhoria contínua** do chatbot
- ✅ **Satisfação alta** dos usuários (>4.5⭐)

**O chatbot aprende com seus próprios erros e fica cada vez melhor!** 🚀

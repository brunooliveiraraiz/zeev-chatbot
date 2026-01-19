# Scripts de Manutenção do Chatbot

Esta pasta contém scripts automatizados para manutenção e melhoria contínua do chatbot.

## 📋 Scripts Disponíveis

### 1. `test-catalog.js` - Teste Automatizado do Catálogo

Testa todos os exemplos do catálogo para verificar se estão sendo encaminhados para a solicitação correta.

**O que faz:**
- ✅ Testa cada exemplo de cada solicitação
- ✅ Verifica se o matching está correto
- ✅ Identifica scores baixos
- ✅ Gera relatório com sugestões de melhoria

**Como usar:**
```bash
# Certifique-se que a API está rodando (localhost:3000)
cd C:\Users\bruno.oliveira\Documents\zeev-chatbot
node scripts/test-catalog.js
```

**Quando usar:**
- ✨ **Após adicionar novas solicitações ao catálogo**
- ✨ **Após modificar tags ou exemplos**
- ✨ **A cada 12 horas** (conforme cronograma sugerido)
- ✨ **Antes de fazer deploy**

**Resultado:**
- Terminal: Resumo visual com ✓, ⚠, ✗
- Arquivo: `scripts/reports/test-report-YYYY-MM-DD.json`

---

### 2. `analyze-logs.js` - Análise de Logs da API

Analisa os logs reais de uso do chatbot para identificar problemas e oportunidades de melhoria.

**O que faz:**
- 📊 Identifica solicitações mais usadas
- ⚠️ Detecta requisições com score baixo
- ❓ Lista mensagens que não fizeram match
- 💡 Sugere melhorias específicas

**Como usar:**
```bash
cd C:\Users\bruno.oliveira\Documents\zeev-chatbot

# Opção 1: Deixa o script encontrar o log automaticamente
node scripts/analyze-logs.js

# Opção 2: Especifica o arquivo de log
node scripts/analyze-logs.js caminho/para/arquivo.log
```

**Quando usar:**
- ✨ **A cada 12-24 horas** para monitorar uso real
- ✨ **Após pico de uso** (ex: início de semestre)
- ✨ **Quando usuários reportarem problemas**
- ✨ **Antes de revisar o catálogo**

**Resultado:**
- Terminal: Relatório detalhado com estatísticas
- Arquivo: `scripts/reports/log-analysis-YYYY-MM-DD.json`

---

## 📅 Cronograma Sugerido de Manutenção

### **A cada 12 horas** (2x por dia)

```bash
# Manhã (09:00)
node scripts/test-catalog.js

# Tarde (18:00)
node scripts/analyze-logs.js
```

### **Semanal** (Segunda-feira)

1. Rodar ambos os scripts
2. Revisar relatórios acumulados
3. Implementar melhorias identificadas
4. Commit das mudanças

### **Mensal**

1. Análise completa de todos os relatórios
2. Refatoração de tags e exemplos
3. Remoção de solicitações não utilizadas
4. Adição de novas solicitações baseadas em demanda

---

## 📊 Como Interpretar os Relatórios

### Relatório de Testes (`test-report-*.json`)

```json
{
  "timestamp": "2026-01-19T20:00:00Z",
  "summary": {
    "total": 400,        // Total de testes
    "passed": 380,       // ✓ Passou
    "failed": 15,        // ✗ Falhou
    "warnings": 5,       // ⚠ Score baixo
    "passRate": "95.0%"  // Taxa de acerto
  },
  "errors": [...],       // Detalhes dos erros
  "suggestions": [...]   // Sugestões de melhoria
}
```

**O que fazer:**

| Taxa de Acerto | Ação |
|---------------|------|
| > 95% | ✅ Ótimo! Monitorar |
| 85-95% | ⚠️ Revisar erros e aplicar sugestões |
| < 85% | 🚨 Revisão urgente necessária |

### Relatório de Logs (`log-analysis-*.json`)

```json
{
  "summary": {
    "totalRequests": 150,      // Total de requisições
    "lowScoreRequests": 10,    // Score < 0.5
    "clarifyRequests": 5,      // Não fez match
    "categoriesUsed": 25       // Solicitações usadas
  },
  "recommendations": [...]     // Recomendações
}
```

**O que fazer:**

1. **lowScoreRequests alto?**
   - Adicionar mais tags específicas
   - Melhorar exemplos

2. **clarifyRequests alto?**
   - Criar novas solicitações
   - Melhorar tags existentes

3. **Algumas categorias nunca usadas?**
   - Revisar se são necessárias
   - Melhorar visibilidade (tags/exemplos)

---

## 🔧 Workflow de Melhoria Contínua

### 1. **Detectar**
```bash
node scripts/analyze-logs.js
```
Identifica problemas nos logs reais

### 2. **Validar**
```bash
node scripts/test-catalog.js
```
Confirma que mudanças não quebram nada

### 3. **Implementar**
- Edite `apps/api/src/catalog/requests.ts`
- Adicione tags, exemplos ou corrija

### 4. **Testar**
```bash
node scripts/test-catalog.js
```
Garante que melhorias funcionam

### 5. **Commit**
```bash
git add apps/api/src/catalog/requests.ts
git commit -m "Melhora matching para [nome-da-solicitação]"
git push
```

---

## 🎯 Dicas de Otimização

### Para melhorar scores baixos:

1. **Adicione sinônimos nas tags**
   ```typescript
   tags: ['financeiro', 'pagamento', 'pagar', 'quitar', 'solver']
   ```

2. **Varie os exemplos**
   ```typescript
   examples: [
     'solicitar pagamento',          // Formal
     'preciso fazer um pagamento',   // Informal
     'quero pagar fornecedor',       // Natural
     'pagamento urgente'             // Específico
   ]
   ```

3. **Use termos específicos do negócio**
   ```typescript
   tags: ['totvs', 'rm', 'erp', 'modulo financeiro']
   ```

### Para evitar conflitos entre solicitações:

1. **Tags únicas para cada solicitação**
   - ❌ Ruim: Ambas com tag 'pagamento'
   - ✅ Bom: Uma com 'solicitar pagamento', outra com 'baixa pagamento'

2. **Exemplos distintos**
   - Evite exemplos similares em solicitações diferentes

3. **Teste cruzado**
   - Sempre teste que suas mudanças não afetam outras solicitações

---

## 📁 Estrutura de Arquivos

```
scripts/
├── README.md                    # Este arquivo
├── test-catalog.js              # Script de teste
├── analyze-logs.js              # Script de análise
└── reports/                     # Relatórios gerados
    ├── test-report-*.json
    └── log-analysis-*.json
```

---

## ⚙️ Configuração

### Variáveis de Ambiente

**test-catalog.js:**
- `API_URL` - URL da API (padrão: http://localhost:3000)
- `MIN_ACCEPTABLE_SCORE` - Score mínimo (padrão: 0.5)

**analyze-logs.js:**
- Nenhuma configuração necessária

### Requisitos

- ✅ Node.js 16+
- ✅ API rodando (para test-catalog.js)
- ✅ Arquivo de log (para analyze-logs.js)

---

## 🐛 Solução de Problemas

### "Arquivo de log não encontrado"
```bash
# Verifique onde o log está sendo gerado
# Especifique o caminho manualmente:
node scripts/analyze-logs.js caminho/completo/para/log.txt
```

### "API não responde"
```bash
# Certifique-se que a API está rodando:
npm run dev

# Ou especifique outra URL:
API_URL=http://localhost:3001 node scripts/test-catalog.js
```

### "Module not found"
```bash
# Execute do diretório raiz do projeto:
cd C:\Users\bruno.oliveira\Documents\zeev-chatbot
node scripts/test-catalog.js
```

---

## 📞 Suporte

- **Documentação:** `docs/` na raiz do projeto
- **Issues:** GitHub repository
- **Logs:** `apps/api/` (verifique console)

---

## 📝 Changelog

### 2026-01-19
- ✨ Criação dos scripts iniciais
- 📊 test-catalog.js v1.0
- 📈 analyze-logs.js v1.0
- 📖 Documentação completa

---

**Dica:** Adicione a execução desses scripts ao seu calendar/reminder para garantir que sejam executados regularmente! ⏰

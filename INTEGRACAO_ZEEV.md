# 🔗 Integração do Chatbot com o Portal Zeev

## Visão Geral

Existem **2 formas** de integrar o chatbot no portal Zeev:

1. **Iframe** - Página dedicada (mais simples)
2. **Widget Flutuante** - Botão em todas as páginas (recomendado)

---

## 📋 Opção A: Iframe - Página Dedicada

### ✅ Prós:
- Implementação imediata
- Não requer configurações avançadas
- Funciona em qualquer portal

### ❌ Contras:
- Usuário precisa navegar até a página
- Ocupa tela inteira
- Menos prático

### 🛠️ Como Implementar:

#### 1. Acesse o Zeev como Administrador

#### 2. Crie uma Nova Página Customizada:
- Vá em: **Configurações** → **Portal** → **Páginas Customizadas**
- Clique em: **"Nova Página"**
- Nome: **"Assistente Virtual"** ou **"Ajuda"**

#### 3. Adicione o Código HTML:

```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Assistente Virtual Zeev</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background-color: #f5f5f5;
    }

    .header {
      background-color: #1E40AF;
      color: white;
      padding: 20px;
      text-align: center;
    }

    .header h1 {
      margin: 0;
      font-size: 24px;
    }

    .header p {
      margin: 8px 0 0 0;
      font-size: 14px;
      opacity: 0.9;
    }

    .chatbot-container {
      max-width: 1200px;
      margin: 20px auto;
      padding: 0 20px;
    }

    iframe {
      width: 100%;
      height: calc(100vh - 160px);
      min-height: 600px;
      border: none;
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      background: white;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>🤖 Assistente Virtual Zeev</h1>
    <p>Como posso ajudar você hoje?</p>
  </div>

  <div class="chatbot-container">
    <iframe
      src="https://brunooliveiraraiz.github.io/zeev-chatbot/"
      title="Chatbot Zeev"
      allow="clipboard-read; clipboard-write"
    ></iframe>
  </div>
</body>
</html>
```

#### 4. Publique e Teste

#### 5. Adicione ao Menu Principal:
- Vá em: **Configurações** → **Menu**
- Adicione novo item: **"Assistente Virtual"** ou **"Ajuda"**
- Link para a página criada

---

## 🎯 Opção B: Widget Flutuante (RECOMENDADO)

### ✅ Prós:
- Aparece em **todas as páginas** do Zeev
- Botão flutuante no canto da tela
- Experiência moderna (como Intercom, Drift)
- Mais prático para o usuário

### ❌ Contras:
- Requer acesso ao código HTML do portal
- Necessita permissão de administrador

### 🛠️ Como Implementar:

#### 1. Acesse as Configurações do Portal Zeev

Como administrador:
- **Configurações** → **Portal** → **Customização** → **HTML/JavaScript Customizado**

Ou localize onde o Zeev permite adicionar scripts customizados no portal.

#### 2. Adicione o Script de Embed

Cole este código **ANTES do `</body>`** no HTML do portal:

```html
<!-- Zeev Chatbot - Widget Flutuante -->
<script src="https://brunooliveiraraiz.github.io/zeev-chatbot/embed.js"></script>
```

**É SÓ ISSO!** ✅

#### 3. Publique as Alterações

#### 4. Teste

Acesse qualquer página do portal Zeev e você verá:
- 🔵 Botão azul **"Ajuda"** no canto inferior direito
- Ao clicar, o chatbot abre em uma janela flutuante
- Clique fora para fechar

---

## ⚙️ Personalização do Widget Flutuante

Se quiser personalizar cores, posição, etc., edite o arquivo `embed.js`:

### Mudar Posição do Botão:

```javascript
// No arquivo embed.js, linha 12:
buttonPosition: 'bottom-left', // Muda para canto esquerdo
```

### Mudar Cor do Botão:

```javascript
// No arquivo embed.js, linha 13:
buttonColor: '#10B981', // Verde
buttonColor: '#EF4444', // Vermelho
buttonColor: '#8B5CF6', // Roxo
```

### Mudar Texto do Botão:

```javascript
// No arquivo embed.js, linha 30:
<span style="margin-left: 8px;">Precisa de Ajuda?</span>
```

---

## 📱 Responsividade

Ambas as opções funcionam em:
- ✅ Desktop
- ✅ Tablet
- ✅ Mobile

O widget se adapta automaticamente ao tamanho da tela.

---

## 🔒 Segurança e Privacidade

### CORS (Cross-Origin)
O chatbot já está configurado para aceitar requisições do portal Zeev:

```javascript
// No .env da API:
CORS_ORIGINS=https://hmlraizeducacao.zeev.it,https://raizeducacao.zeev.it
```

### Dados do Usuário
O chatbot **NÃO captura dados pessoais** automaticamente. Ele apenas:
- Gera um `sessionId` único por conversa
- Salva as mensagens da conversa
- Registra avaliações (opcional)

---

## 🧪 Testando a Integração

### Teste 1: Verificar se o Widget Carrega

1. Abra o portal Zeev
2. Abra o **Console do navegador** (F12)
3. Procure pela mensagem: `✅ Zeev Chatbot carregado com sucesso!`

### Teste 2: Testar Funcionalidade

1. Clique no botão **"Ajuda"**
2. Digite uma mensagem: **"Oi"**
3. Verifique se o bot responde

### Teste 3: Testar Direcionamento

1. Digite: **"Meu notebook não está ligando"**
2. Responda às perguntas do bot
3. Verifique se ele direciona para o formulário correto
4. Clique no link e confirme que abre o formulário Zeev

---

## 🐛 Troubleshooting

### Widget não aparece

**Causa:** Script não carregou
**Solução:**
1. Verifique se o script está antes do `</body>`
2. Limpe o cache do navegador (Ctrl+Shift+R)
3. Verifique o console (F12) para erros

### Botão aparece, mas não abre

**Causa:** Iframe bloqueado
**Solução:**
1. Verifique se o CORS está configurado
2. Teste em modo anônimo do navegador
3. Verifique se não há bloqueadores de ads/popups

### Widget não responde

**Causa:** API fora do ar
**Solução:**
1. Teste diretamente: https://brunooliveiraraiz.github.io/zeev-chatbot/
2. Verifique o status da API: https://zeev-chatbot-api.vercel.app/api/route
3. Veja logs no Vercel Dashboard

### Não consigo adicionar script no Zeev

**Causa:** Permissões insuficientes
**Solução:**
1. Use a **Opção A (Iframe)** em vez do widget flutuante
2. Entre em contato com o suporte Zeev
3. Peça acesso de administrador ao portal

---

## 📊 Monitoramento

Após a integração, você pode monitorar:

### 1. Uso do Chatbot:
- Acesse: https://zeev-chatbot-api.vercel.app/api/analytics/list-ratings
- Veja quantas conversas, avaliações, etc.

### 2. Relatórios Semanais:
- Receba automaticamente toda segunda-feira às 09:00
- PPT com gráficos e estatísticas completas

### 3. Logs do Vercel:
- Dashboard Vercel → Logs
- Filtre por `/api/route` para ver conversas em tempo real

---

## 🎨 Customização Avançada

### Adicionar Logo da Raiz no Botão:

Edite o `embed.js`:

```javascript
button.innerHTML = `
  <img src="https://raizeducacao.com.br/logo.png" width="24" height="24" alt="Raiz">
  <span style="margin-left: 8px;">Assistente Raiz</span>
`;
```

### Abrir Automaticamente:

```javascript
// No embed.js, após criar o container:
setTimeout(function() {
  toggleWidget(); // Abre após 3 segundos
}, 3000);
```

### Adicionar Badge de Notificação:

```javascript
// Adiciona badge vermelho ao botão
const badge = document.createElement('span');
badge.style.cssText = `
  position: absolute;
  top: -5px;
  right: -5px;
  background: red;
  color: white;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
`;
badge.textContent = '1';
button.appendChild(badge);
```

---

## 🚀 Próximos Passos

Após a integração:

1. ✅ Teste com usuários reais
2. ✅ Colete feedback
3. ✅ Monitore métricas nos relatórios
4. ✅ Ajuste o prompt conforme necessário
5. ✅ Adicione mais formulários ao catálogo

---

## 📞 Suporte

Dúvidas sobre integração:
- Documentação técnica: `README.md`
- Métricas: `METRICAS_E_ANALYTICS.md`
- Contato: bruno.oliveira@raizeducacao.com.br

---

## 📋 Checklist de Implementação

### Opção A - Iframe:
- [ ] Acessar Zeev como admin
- [ ] Criar página customizada
- [ ] Adicionar código HTML
- [ ] Publicar página
- [ ] Adicionar ao menu
- [ ] Testar funcionamento

### Opção B - Widget Flutuante:
- [ ] Acessar configurações do portal
- [ ] Localizar área de scripts customizados
- [ ] Adicionar script do embed.js
- [ ] Publicar alterações
- [ ] Testar em todas as páginas
- [ ] Verificar console para erros

**Boa integração!** 🎉

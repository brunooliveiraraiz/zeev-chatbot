# 🔗 Integração do Widget no Portal Zeev HML

Depois que a API estiver rodando no servidor Zeev, siga estes passos para integrar o widget no portal.

---

## 📋 Pré-requisitos

1. ✅ API rodando no servidor Zeev (ex: `https://chatbot-api.hmlraizeducacao.zeev.it`)
2. ✅ Widget publicado no GitHub Pages: `https://brunooliveiraraiz.github.io/zeev-chatbot/`
3. ✅ URL da API configurada no widget (passo abaixo)

---

## 🔧 Passo 1: Configurar URL da API no Widget

### **1.1 Atualizar `.env.production`**

Edite o arquivo localmente:

```bash
# No seu computador
cd C:\Users\bruno.oliveira\Documents\zeev-chatbot\apps\widget
```

Abra `.env.production` e coloque a URL REAL da API:

```env
# Substitua pela URL real onde a API está rodando
VITE_API_URL=https://chatbot-api.hmlraizeducacao.zeev.it
```

### **1.2 Fazer Commit e Push**

```bash
cd C:\Users\bruno.oliveira\Documents\zeev-chatbot
git add apps/widget/.env.production
git commit -m "Configura URL da API de HML no widget"
git push origin main
```

Aguarde 2-3 minutos para o GitHub Actions rebuildar e publicar o widget atualizado.

---

## 🎨 Passo 2: Adicionar Widget no Portal Zeev HML

Você tem **3 opções** para integrar o widget:

---

### **Opção A: Script Inline (Mais Simples)** ⭐ RECOMENDADO

Adicione este código no HTML do portal Zeev HML (antes do `</body>`):

```html
<!-- Zeev Chatbot Widget -->
<script src="https://brunooliveiraraiz.github.io/zeev-chatbot/assets/index.js" type="module"></script>
<div id="root" data-stage="hml"></div>

<style>
  /* Garantir que o widget apareça */
  #root {
    position: fixed;
    bottom: 20px;
    right: 20px;
    z-index: 9999;
  }
</style>
```

---

### **Opção B: Script Assíncrono (Melhor Performance)**

```html
<!-- Zeev Chatbot Widget - Carregamento Assíncrono -->
<div id="zeev-chatbot-container"></div>

<script>
  (function() {
    // Criar elemento root
    var rootDiv = document.createElement('div');
    rootDiv.id = 'root';
    rootDiv.setAttribute('data-stage', 'hml');
    document.getElementById('zeev-chatbot-container').appendChild(rootDiv);

    // Carregar script do widget
    var script = document.createElement('script');
    script.src = 'https://brunooliveiraraiz.github.io/zeev-chatbot/assets/index.js';
    script.type = 'module';
    script.async = true;
    document.head.appendChild(script);

    // Estilo do container
    var style = document.createElement('style');
    style.textContent = `
      #zeev-chatbot-container {
        position: fixed;
        bottom: 20px;
        right: 20px;
        z-index: 9999;
      }
    `;
    document.head.appendChild(style);
  })();
</script>
```

---

### **Opção C: Iframe (Isolado do Portal)**

```html
<!-- Zeev Chatbot Widget - Via Iframe -->
<iframe
  src="https://brunooliveiraraiz.github.io/zeev-chatbot/?stage=hml"
  style="position: fixed; bottom: 20px; right: 20px; width: 400px; height: 600px; border: none; z-index: 9999; box-shadow: 0 4px 12px rgba(0,0,0,0.15); border-radius: 12px;"
  title="Zeev Chatbot"
></iframe>
```

---

## 🧪 Passo 3: Testar a Integração

### **3.1 Verificar se o Widget Aparece**

1. Acesse o portal Zeev HML
2. Verifique se o botão flutuante do chat aparece no canto inferior direito
3. Clique no botão para abrir o chat

### **3.2 Testar Funcionalidades**

1. **Saudação:**
   - Digite: "Olá"
   - Deve responder com saudação da IA

2. **Roteamento Direto:**
   - Digite: "preciso criar um plano de pagamento"
   - Deve mostrar link para o formulário correto

3. **Troubleshooting:**
   - Digite: "meu computador não funciona"
   - Deve fazer perguntas de diagnóstico

4. **Avaliação:**
   - Complete uma conversa
   - Aguarde 5 segundos
   - Widget de avaliação deve aparecer

### **3.3 Verificar no Console do Navegador**

Abra o DevTools (F12) e verifique se não há erros:

```javascript
// Deve estar limpo, sem erros de CORS ou rede
```

Se houver erro de CORS, verifique o `.env` da API:
```env
CORS_ORIGINS=https://hmlraizeducacao.zeev.it,https://brunooliveiraraiz.github.io
```

---

## 🎨 Passo 4: Personalização (Opcional)

### **4.1 Customizar Posição do Widget**

```html
<style>
  #root {
    /* Altere conforme necessário */
    position: fixed;
    bottom: 20px;  /* Distância do fundo */
    right: 20px;   /* Distância da direita */

    /* Para posição esquerda */
    /* left: 20px; */

    z-index: 9999;
  }
</style>
```

### **4.2 Customizar Cores (CSS Override)**

```html
<style>
  /* Customizar cores do widget */
  .chat-header {
    background: #0066cc !important; /* Azul personalizado */
  }

  .chat-button {
    background: #0066cc !important;
  }

  .message.bot {
    background: #f0f0f0 !important;
  }
</style>
```

---

## 🔍 Verificações Finais

### ✅ Checklist de Deploy

- [ ] API rodando e acessível via HTTPS
- [ ] CORS configurado corretamente no `.env` da API
- [ ] URL da API configurada em `apps/widget/.env.production`
- [ ] Widget publicado no GitHub Pages
- [ ] Script do widget adicionado no portal Zeev HML
- [ ] Widget aparece e abre ao clicar
- [ ] Testes de saudação funcionando
- [ ] Testes de roteamento funcionando
- [ ] Sistema de avaliação funcionando
- [ ] Sem erros no console do navegador

---

## 📊 Monitoramento

### **Ver Avaliações e Analytics**

No servidor onde a API roda:

```bash
cd /var/www/zeev-chatbot/apps/api
npx tsx scripts/check-ratings.ts
```

### **Ver Logs da API**

```bash
pm2 logs zeev-chatbot-api
```

---

## 🐛 Troubleshooting

### Widget não aparece:
- Verifique se o script está sendo carregado (Network tab no DevTools)
- Verifique se não há erro de JavaScript
- Limpe o cache do navegador (Ctrl+Shift+R)

### Erro de CORS:
- Adicione o domínio do portal no `.env` da API
- Reinicie a API: `pm2 restart zeev-chatbot-api`

### Widget não conecta com a API:
- Verifique se `VITE_API_URL` está correto em `.env.production`
- Teste a API diretamente: `curl https://sua-api/health`
- Verifique logs da API: `pm2 logs zeev-chatbot-api`

### Botões não funcionam:
- Verifique se há erro de JavaScript no console
- Verifique se a API está respondendo corretamente

---

## 📞 Suporte

Se algo não funcionar:

1. Verifique os logs da API: `pm2 logs zeev-chatbot-api`
2. Verifique o console do navegador (F12)
3. Teste a API diretamente: `curl https://sua-api/route -X POST -H "Content-Type: application/json" -d '{"message":"oi","stage":"hml"}'`

---

## 🎉 Conclusão

Depois de seguir todos os passos, você terá:

✅ Widget funcionando no portal Zeev HML
✅ IA respondendo perguntas
✅ Roteamento inteligente funcionando
✅ Sistema de avaliações ativo
✅ Analytics sendo coletados

**Parabéns! O sistema está completo!** 🚀

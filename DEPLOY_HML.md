# 🚀 Deploy do Widget para HML (GitHub Pages)

## 📋 Passo a Passo

### 1️⃣ Configurar GitHub Pages no Repositório

1. Acesse: https://github.com/brunooliveiraraiz/zeev-chatbot/settings/pages
2. Em **Source**, selecione: `GitHub Actions`
3. Salve as configurações

### 2️⃣ Configurar URL da API de HML

Edite o arquivo `apps/widget/.env.production` e configure a URL da API:

```env
VITE_API_URL=https://SUA-URL-DA-API-HML.zeev.it
```

> **Importante:** Substitua pela URL real onde a API está rodando no ambiente HML do Zeev.

### 3️⃣ Fazer o Deploy

Basta fazer push para a branch `main`:

```bash
git add .
git commit -m "Configure GitHub Pages deploy"
git push origin main
```

O GitHub Actions vai:
- ✅ Instalar dependências
- ✅ Buildar o widget em modo produção
- ✅ Fazer deploy automático no GitHub Pages

### 4️⃣ Verificar o Deploy

- **Actions:** https://github.com/brunooliveiraraiz/zeev-chatbot/actions
- **Widget publicado em:** https://brunooliveiraraiz.github.io/zeev-chatbot/

### 5️⃣ Integrar Widget no Portal Zeev HML

Adicione este script no HTML do portal Zeev (HML):

```html
<!-- Zeev Chatbot Widget -->
<script src="https://brunooliveiraraiz.github.io/zeev-chatbot/embed.js"></script>
<div id="zeev-chatbot-root" data-stage="hml"></div>
```

**Ou via JavaScript:**

```html
<script>
  (function() {
    var script = document.createElement('script');
    script.src = 'https://brunooliveiraraiz.github.io/zeev-chatbot/embed.js';
    script.async = true;
    document.head.appendChild(script);

    script.onload = function() {
      var div = document.createElement('div');
      div.id = 'zeev-chatbot-root';
      div.setAttribute('data-stage', 'hml');
      document.body.appendChild(div);
    };
  })();
</script>
```

## 🔧 Configurações Adicionais

### CORS na API

A API precisa aceitar requisições do GitHub Pages. Adicione no `.env` da API:

```env
CORS_ORIGINS=https://brunooliveiraraiz.github.io,https://hmlraizeducacao.zeev.it
```

### Variáveis de Ambiente

O widget em produção usa:
- `VITE_API_URL`: URL da API (configurado em `.env.production`)
- `data-stage`: Define se usa HML ou PROD (configurado no HTML)

## 📊 Monitoramento

- **Status do deploy:** https://github.com/brunooliveiraraiz/zeev-chatbot/deployments
- **Logs do Actions:** https://github.com/brunooliveiraraiz/zeev-chatbot/actions

## 🔄 Próximos Deploys

Qualquer mudança em `apps/widget/` que for commitada na branch `main` vai:
1. Disparar o workflow automaticamente
2. Buildar e publicar a nova versão
3. Atualizar o GitHub Pages em ~2 minutos

## ⚠️ Importante

1. **API separada:** O GitHub Pages só hospeda o widget (frontend estático). A API precisa estar rodando em outro lugar (servidor Zeev HML).

2. **HTTPS obrigatório:** GitHub Pages usa HTTPS, então a API também precisa estar em HTTPS para evitar erros de mixed content.

3. **Cache:** O GitHub Pages pode ter cache. Para forçar atualização, faça um hard refresh (Ctrl+Shift+R) no navegador.

## 🐛 Troubleshooting

### Widget não carrega
- Verifique se o deploy foi bem-sucedido no Actions
- Confirme que a URL está correta: https://brunooliveiraraiz.github.io/zeev-chatbot/
- Verifique o console do navegador para erros

### Erro de CORS
- Adicione a URL do GitHub Pages no CORS da API
- Verifique se a API está rodando em HTTPS

### Widget não conecta com a API
- Confirme que `VITE_API_URL` está correto em `.env.production`
- Verifique se a API está acessível publicamente
- Teste a API diretamente: `curl https://sua-api/health`

/**
 * Zeev Chatbot - Widget Embarcado
 *
 * Como usar:
 * Adicione este script no HTML do portal Zeev (antes do </body>):
 *
 * <script src="https://brunooliveiraraiz.github.io/zeev-chatbot/embed.js"></script>
 */

(function() {
  'use strict';

  // Configurações
  const CONFIG = {
    widgetUrl: 'https://brunooliveiraraiz.github.io/zeev-chatbot/',
    buttonPosition: 'bottom-right', // 'bottom-right' ou 'bottom-left'
    buttonColor: '#1E40AF', // Azul Zeev
    zIndex: 999999
  };

  // Criar botão flutuante
  function createFloatingButton() {
    const button = document.createElement('button');
    button.id = 'zeev-chatbot-button';

    // Usar a imagem do mascote
    const img = document.createElement('img');
    img.src = CONFIG.widgetUrl + 'chatbot-icon.png';
    img.alt = 'Chat Zeev';
    img.style.cssText = `
      width: 90%;
      height: 90%;
      object-fit: contain;
    `;
    button.appendChild(img);

    // Estilos do botão (circular branco com borda azul)
    const position = CONFIG.buttonPosition === 'bottom-left' ? 'left: 20px;' : 'right: 20px;';
    button.style.cssText = `
      position: fixed;
      bottom: 20px;
      ${position}
      width: 80px;
      height: 80px;
      background-color: white;
      border: 4px solid #2196F3;
      border-radius: 50%;
      cursor: pointer;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
      z-index: ${CONFIG.zIndex};
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s ease;
      padding: 0;
    `;

    // Hover effect
    button.addEventListener('mouseenter', function() {
      button.style.transform = 'scale(1.1)';
      button.style.boxShadow = '0 6px 24px rgba(33, 150, 243, 0.4)';
      button.style.borderColor = '#1976D2';
    });

    button.addEventListener('mouseleave', function() {
      button.style.transform = 'scale(1)';
      button.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.15)';
      button.style.borderColor = '#2196F3';
    });

    return button;
  }

  // Criar container do iframe
  function createIframeContainer() {
    const container = document.createElement('div');
    container.id = 'zeev-chatbot-container';

    const position = CONFIG.buttonPosition === 'bottom-left' ? 'left: 20px;' : 'right: 20px;';
    container.style.cssText = `
      position: fixed;
      bottom: 90px;
      ${position}
      width: 400px;
      height: 650px;
      max-width: calc(100vw - 40px);
      max-height: calc(100vh - 120px);
      background: white;
      border-radius: 12px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
      z-index: ${CONFIG.zIndex};
      display: none;
      overflow: hidden;
      transition: all 0.3s ease;
    `;

    // Iframe - adiciona parâmetro para indicar modo embed
    const iframe = document.createElement('iframe');
    iframe.src = CONFIG.widgetUrl + '?embed=true';
    iframe.style.cssText = `
      width: 100%;
      height: 100%;
      border: none;
      display: block;
    `;
    iframe.title = 'Chatbot Zeev';
    iframe.allow = 'clipboard-read; clipboard-write';

    container.appendChild(iframe);

    // Fechar ao clicar fora (opcional)
    document.addEventListener('click', function(e) {
      if (container.style.display === 'block' &&
          !container.contains(e.target) &&
          !document.getElementById('zeev-chatbot-button').contains(e.target)) {
        container.style.display = 'none';
      }
    });

    return container;
  }

  // Toggle do widget
  function toggleWidget() {
    const container = document.getElementById('zeev-chatbot-container');
    const iframe = container.querySelector('iframe');

    if (container.style.display === 'none' || container.style.display === '') {
      container.style.display = 'block';

      // Notificar o iframe para abrir o chat
      if (iframe && iframe.contentWindow) {
        iframe.contentWindow.postMessage({
          type: 'zeev-chatbot-open'
        }, '*');
      }
    } else {
      container.style.display = 'none';
    }
  }

  // Esconder widget (chamado pelo iframe)
  function hideWidget() {
    const container = document.getElementById('zeev-chatbot-container');
    container.style.display = 'none';
  }

  // Inicializar
  function init() {
    // Aguardar DOM carregar
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
      return;
    }

    // Verificar se está em uma página de formulário de solicitação
    const currentUrl = window.location.href;
    const isFormPage = currentUrl.includes('/request') ||
                       currentUrl.includes('/form') ||
                       currentUrl.includes('/workflow');

    // Verificar se está dentro de um iframe
    const isInIframe = window.self !== window.top;

    // Não inicializar em páginas de formulário ou dentro de iframes
    if (isFormPage || isInIframe) {
      console.log('⏭️ Zeev Chatbot: Não inicializando em formulário ou iframe');
      return;
    }

    // Criar elementos
    const button = createFloatingButton();
    const container = createIframeContainer();

    // Adicionar ao body
    document.body.appendChild(button);
    document.body.appendChild(container);

    // Evento de clique
    button.addEventListener('click', toggleWidget);

    // Escutar mensagens do iframe
    window.addEventListener('message', function(event) {
      // Verificar origem por segurança
      if (event.origin !== 'https://brunooliveiraraiz.github.io') {
        return;
      }

      // Processar comandos
      if (event.data && event.data.type === 'zeev-chatbot-close') {
        hideWidget();
      }
    });

    console.log('✅ Zeev Chatbot carregado com sucesso!');
  }

  // Executar
  init();
})();

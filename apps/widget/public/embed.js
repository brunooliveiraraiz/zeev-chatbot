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
    button.innerHTML = `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      <span style="margin-left: 8px;">Ajuda</span>
    `;

    // Estilos do botão
    const position = CONFIG.buttonPosition === 'bottom-left' ? 'left: 20px;' : 'right: 20px;';
    button.style.cssText = `
      position: fixed;
      bottom: 20px;
      ${position}
      background-color: ${CONFIG.buttonColor};
      color: white;
      border: none;
      border-radius: 50px;
      padding: 12px 24px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      z-index: ${CONFIG.zIndex};
      display: flex;
      align-items: center;
      transition: all 0.3s ease;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    `;

    // Hover effect
    button.addEventListener('mouseenter', function() {
      button.style.transform = 'scale(1.05)';
      button.style.boxShadow = '0 6px 16px rgba(0, 0, 0, 0.2)';
    });

    button.addEventListener('mouseleave', function() {
      button.style.transform = 'scale(1)';
      button.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
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

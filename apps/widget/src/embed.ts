import React from 'react';
import ReactDOM from 'react-dom/client';
import { ChatWidget } from './components/ChatWidget';
import './styles.css';

/**
 * Widget embed script entry point
 * This script is injected into the host page
 */
(function () {
  // Get configuration from script tag data attributes
  const script = document.currentScript as HTMLScriptElement | null;
  if (!script) return;

  const title = script.getAttribute('data-title') || 'Chat de Atendimento';
  const stageAttr = script.getAttribute('data-stage');
  const stage = stageAttr === 'prod' ? 'prod' : stageAttr === 'hml' ? 'hml' : undefined;

  // Create container for the widget
  const container = document.createElement('div');
  container.id = 'zeev-chatbot-widget-root';
  document.body.appendChild(container);

  // Render widget
  const root = ReactDOM.createRoot(container);
  root.render(
    React.createElement(ChatWidget, {
      title,
      stage,
    })
  );
})();

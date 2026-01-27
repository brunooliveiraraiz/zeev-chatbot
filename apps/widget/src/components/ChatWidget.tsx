import { useEffect, useState } from 'react';
import { ChatWindow } from './ChatWindow';
import { getSessionId, saveSessionId } from '../lib/storage';
import './ChatWidget.css';
import zeevLogo from '../assets/zeev-chatbot-logo.png';

interface ChatWidgetProps {
  title?: string;
  stage?: 'hml' | 'prod';
}

function generateSessionId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `session-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function ChatWidget({ title = 'Zeev Chat', stage }: ChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isEmbedded, setIsEmbedded] = useState(false);

  useEffect(() => {
    // Detectar modo embed via URL parameter
    const urlParams = new URLSearchParams(window.location.search);
    const embedMode = urlParams.get('embed') === 'true';

    setIsEmbedded(embedMode);
    if (embedMode) {
      setIsOpen(true); // Auto-abrir quando em modo embed
    }

    // Configurar sessão
    const existing = getSessionId();
    if (existing) {
      setSessionId(existing);
    } else {
      const newId = generateSessionId();
      saveSessionId(newId);
      setSessionId(newId);
    }

    // Escutar mensagens do parent (apenas em modo embed)
    if (embedMode) {
      const handleMessage = (event: MessageEvent) => {
        if (event.data && event.data.type === 'zeev-chatbot-open') {
          setIsOpen(true);
        }
      };

      window.addEventListener('message', handleMessage);
      return () => window.removeEventListener('message', handleMessage);
    }
  }, []);

  const handleClose = () => {
    setIsOpen(false);

    // Se estiver em modo embedded, notificar o parent para esconder o container
    if (isEmbedded && window.parent) {
      window.parent.postMessage({
        type: 'zeev-chatbot-close'
      }, '*');
    }
  };

  if (!sessionId) {
    return (
      <div className={`chat-widget ${isEmbedded ? 'embedded-mode' : ''}`}>
        <button className="chat-widget-button" disabled>
          Carregando...
        </button>
      </div>
    );
  }

  return (
    <div className={`chat-widget ${isEmbedded ? 'embedded-mode' : ''}`}>
      <button className="chat-widget-button" onClick={() => isOpen ? handleClose() : setIsOpen(true)}>
        {isOpen ? (
          <>
            <span className="close-icon">✕</span>
            <span>{title}</span>
          </>
        ) : (
          <>
            <img src={zeevLogo} alt="Zeev" className="chat-widget-logo" />
            <span>{title}</span>
          </>
        )}
      </button>
      {isOpen && (
        <div className="chat-widget-popup">
          <ChatWindow sessionId={sessionId} stage={stage} onClose={handleClose} />
        </div>
      )}
    </div>
  );
}

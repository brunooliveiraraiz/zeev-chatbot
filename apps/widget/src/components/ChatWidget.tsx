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
    // Detectar se está dentro de iframe
    const inIframe = window.self !== window.top;
    setIsEmbedded(inIframe);
    if (inIframe) {
      setIsOpen(true); // Auto-abrir quando em iframe
    }

    const existing = getSessionId();
    if (existing) {
      setSessionId(existing);
    } else {
      const newId = generateSessionId();
      saveSessionId(newId);
      setSessionId(newId);
    }
  }, []);

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
      <button className="chat-widget-button" onClick={() => setIsOpen(!isOpen)}>
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
          <ChatWindow sessionId={sessionId} stage={stage} onClose={() => setIsOpen(false)} />
        </div>
      )}
    </div>
  );
}

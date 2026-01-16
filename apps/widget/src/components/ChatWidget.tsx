import { useEffect, useState } from 'react';
import { ChatWindow } from './ChatWindow';
import { getSessionId, saveSessionId } from '../lib/storage';
import './ChatWidget.css';

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

export function ChatWidget({ title = 'Chat de Atendimento', stage }: ChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);

  useEffect(() => {
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
      <div className="chat-widget">
        <button className="chat-widget-button" disabled>
          Carregando...
        </button>
      </div>
    );
  }

  return (
    <div className="chat-widget">
      <button className="chat-widget-button" onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? '✕' : '💬'} {title}
      </button>
      {isOpen && (
        <div className="chat-widget-popup">
          <div className="chat-widget-header">
            <h3>{title}</h3>
            <button className="chat-widget-close" onClick={() => setIsOpen(false)}>
              ×
            </button>
          </div>
          <ChatWindow sessionId={sessionId} stage={stage} />
        </div>
      )}
    </div>
  );
}

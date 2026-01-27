import { useEffect, useRef } from 'react';
import './MessageList.css';

export interface Message {
  role: 'user' | 'bot';
  content: string;
  timestamp?: string;
  link?: { label: string; url: string };
  options?: Array<{ id: string; label: string; description?: string }>;
  responseType?: 'direct_link' | 'choose_option' | 'clarify' | 'troubleshooting' | 'resolved';
}

interface MessageListProps {
  messages: Message[];
  onOptionSelect?: (optionId: string) => void;
  onOpenLink?: (url: string) => void;
}

export function MessageList({ messages, onOptionSelect, onOpenLink }: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="message-list">
      {messages.map((message, index) => (
        <div key={index} className={`message message-${message.role}`}>
          <div className="message-content">{message.content}</div>
          {message.link && (
            <button className="message-link" onClick={() => onOpenLink?.(message.link!.url)}>
              {message.link.label}
            </button>
          )}
          {message.options && message.options.length > 0 && (
            <div className="message-options">
              {message.options.map((option) => (
                <button key={option.id} className="message-option" onClick={() => onOptionSelect?.(option.id)}>
                  <div className="message-option-label">{option.label}</div>
                  {option.description && <div className="message-option-description">{option.description}</div>}
                </button>
              ))}
            </div>
          )}
          {message.timestamp && (
            <div className="message-timestamp">{formatTimestamp(message.timestamp)}</div>
          )}
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
}

function formatTimestamp(timestamp: string): string {
  try {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '';
  }
}

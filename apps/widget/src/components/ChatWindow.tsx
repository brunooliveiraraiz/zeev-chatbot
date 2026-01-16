import { useEffect, useState } from 'react';
import { MessageList, type Message } from './MessageList';
import { Composer } from './Composer';
import { StatusBadge } from './StatusBadge';
import { routeMessage } from '../lib/api';
import './ChatWindow.css';

interface ChatWindowProps {
  sessionId: string;
  stage?: 'hml' | 'prod';
}

export function ChatWindow({ sessionId, stage }: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [status, setStatus] = useState<'idle' | 'typing' | 'error'>('idle');

  useEffect(() => {
    setMessages([
      {
        role: 'bot',
        content: 'Olá! Descreva rapidamente o que você precisa para eu te levar ao formulário correto.',
        timestamp: new Date().toISOString(),
      },
    ]);
  }, [sessionId]);

  const handleSend = async (message: string) => {
    const trimmed = message.trim();
    if (!trimmed) return;

    const userMessage: Message = {
      role: 'user',
      content: trimmed,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setStatus('typing');

    try {
      const response = await routeMessage({ message: trimmed, sessionId, stage });
      const botMessage: Message = {
        role: 'bot',
        content: response.text,
        timestamp: new Date().toISOString(),
        link: response.type === 'direct_link' ? response.link : undefined,
        options: response.type === 'choose_option' ? response.options : undefined,
        responseType: response.type,
      };
      setMessages((prev) => [...prev, botMessage]);
      setStatus('idle');
    } catch (error) {
      console.error('Failed to send message', error);
      setStatus('error');
      const errorMessage: Message = {
        role: 'bot',
        content: 'Não consegui processar agora. Tente novamente em instantes.',
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMessage]);
      setTimeout(() => setStatus('idle'), 2000);
    }
  };

  const handleOptionSelect = (optionId: string) => {
    handleSend(optionId);
  };

  const handleOpenLink = (url: string) => {
    window.open(url, '_blank', 'noopener');
  };

  return (
    <div className="chat-window">
      <MessageList messages={messages} onOptionSelect={handleOptionSelect} onOpenLink={handleOpenLink} />
      <StatusBadge status={status} />
      <Composer onSend={handleSend} disabled={status === 'typing'} placeholder="Descreva sua necessidade..." />
    </div>
  );
}

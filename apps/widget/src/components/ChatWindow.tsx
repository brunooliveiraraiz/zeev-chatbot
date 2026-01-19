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

  const handleDownloadConversation = () => {
    // Formatar data/hora
    const now = new Date();
    const dateStr = now.toLocaleDateString('pt-BR').replace(/\//g, '-');
    const timeStr = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    // Gerar conteúdo do arquivo
    let content = `CONVERSA COM ASSISTENTE ZEEV\n`;
    content += `Data: ${dateStr} às ${timeStr}\n`;
    content += `Sessão: ${sessionId}\n`;
    content += `${'='.repeat(60)}\n\n`;

    messages.forEach((msg) => {
      const timestamp = new Date(msg.timestamp).toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
      const role = msg.role === 'user' ? 'VOCÊ' : 'ASSISTENTE';

      content += `[${timestamp}] ${role}:\n${msg.content}\n`;

      // Adicionar link se existir
      if (msg.link) {
        content += `Link: ${msg.link.label} - ${msg.link.url}\n`;
      }

      // Adicionar opções se existirem
      if (msg.options && msg.options.length > 0) {
        content += `Opções disponíveis:\n`;
        msg.options.forEach((opt, idx) => {
          content += `  ${idx + 1}. ${opt.label}\n`;
          if (opt.description) {
            content += `     ${opt.description}\n`;
          }
        });
      }

      content += `\n`;
    });

    content += `${'='.repeat(60)}\n`;
    content += `Fim da conversa\n`;

    // Criar blob e fazer download
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `conversa-zeev-${dateStr}-${timeStr.replace(/:/g, 'h')}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="chat-window">
      <div className="chat-header">
        <span className="chat-title">Chat de Atendimento</span>
        <button
          className="download-button"
          onClick={handleDownloadConversation}
          title="Baixar conversa"
          disabled={messages.length <= 1}
        >
          ⬇ Baixar conversa
        </button>
      </div>
      <MessageList messages={messages} onOptionSelect={handleOptionSelect} onOpenLink={handleOpenLink} />
      <StatusBadge status={status} />
      <Composer onSend={handleSend} disabled={status === 'typing'} placeholder="Descreva sua necessidade..." />
    </div>
  );
}

import { useEffect, useState } from 'react';
import { MessageList, type Message } from './MessageList';
import { Composer } from './Composer';
import { StatusBadge } from './StatusBadge';
import { RatingWidget } from './RatingWidget';
import { routeMessage } from '../lib/api';
import './ChatWindow.css';
import zeevLogo from '../assets/zeev-chatbot-logo.png';

interface ChatWindowProps {
  sessionId: string;
  stage?: 'hml' | 'prod';
  onClose?: () => void;
}

export function ChatWindow({ sessionId, stage, onClose }: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [status, setStatus] = useState<'idle' | 'typing' | 'error'>('idle');
  const [showRating, setShowRating] = useState(false);
  const [ratingSubmitted, setRatingSubmitted] = useState(false);
  const [ratingRequestSent, setRatingRequestSent] = useState(false);

  useEffect(() => {
    setMessages([
      {
        role: 'bot',
        content: 'Olá! Descreva rapidamente o que você precisa para eu te levar ao formulário correto.',
        timestamp: new Date().toISOString(),
      },
    ]);
  }, [sessionId]);

  // Mostrar widget de avaliação após resolução (link enviado ou problema resolvido)
  useEffect(() => {
    const hasLink = messages.some(msg => msg.link !== undefined);
    const hasTroubleshooting = messages.some(msg => msg.responseType === 'troubleshooting');
    const isResolved = hasLink || hasTroubleshooting;

    if (isResolved && !showRating && !ratingSubmitted) {
      // Aguardar 10 segundos após a resolução para mostrar o widget
      const timer = setTimeout(() => {
        setShowRating(true);
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [messages, showRating, ratingSubmitted]);

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

      // Adicionar mensagem principal do bot
      const botMessage: Message = {
        role: 'bot',
        content: response.text,
        timestamp: new Date().toISOString(),
        link: response.type === 'direct_link' ? response.link : undefined,
        options: response.type === 'choose_option' ? response.options : undefined,
        responseType: response.type,
      };
      setMessages((prev) => [...prev, botMessage]);

      // Se houve resolução (link ou troubleshooting), adicionar mensagem pedindo avaliação (apenas uma vez)
      if ((response.type === 'direct_link' || response.type === 'troubleshooting') && !ratingRequestSent) {
        setRatingRequestSent(true);
        setTimeout(() => {
          const ratingRequestMessage: Message = {
            role: 'bot',
            content: '\n\n📊 Por favor, avalie o atendimento para nos ajudar a melhorar cada vez mais!',
            timestamp: new Date().toISOString(),
          };
          setMessages((prev) => [...prev, ratingRequestMessage]);
        }, 2000); // Aguardar 2 segundos após a mensagem principal
      }

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
    // Abre em nova aba sem noopener para manter contexto de autenticação
    window.open(url, '_blank');
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
      const timestamp = msg.timestamp
        ? new Date(msg.timestamp).toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
          })
        : '--:--:--';
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
        <div className="chat-header-left">
          <img src={zeevLogo} alt="Zeev Logo" className="chat-logo" />
          <span className="chat-title">Zeev Chat</span>
        </div>
        <div className="chat-header-right">
          <button
            className="download-button"
            onClick={handleDownloadConversation}
            title="Baixar conversa"
            disabled={messages.length <= 1}
          >
            ⬇ Baixar conversa
          </button>
          {onClose && (
            <button
              className="close-chat-button"
              onClick={onClose}
              title="Fechar chat"
            >
              ✕
            </button>
          )}
        </div>
      </div>
      <MessageList messages={messages} onOptionSelect={handleOptionSelect} onOpenLink={handleOpenLink} />
      <StatusBadge status={status} />
      {showRating && !ratingSubmitted && (
        <RatingWidget
          sessionId={sessionId}
          onSubmit={() => {
            setRatingSubmitted(true);
            setShowRating(false);
          }}
        />
      )}
      <Composer onSend={handleSend} disabled={status === 'typing'} placeholder="Descreva sua necessidade..." />
    </div>
  );
}

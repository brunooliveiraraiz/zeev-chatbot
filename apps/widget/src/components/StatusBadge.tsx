import './StatusBadge.css';

interface StatusBadgeProps {
  status: 'idle' | 'typing' | 'error';
}

export function StatusBadge({ status }: StatusBadgeProps) {
  if (status === 'idle') return null;

  return (
    <div className="status-badge">
      {status === 'typing' && <span className="typing-indicator">Digitando...</span>}
      {status === 'error' && <span className="error-indicator">Erro ao enviar</span>}
    </div>
  );
}

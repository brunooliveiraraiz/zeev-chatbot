import { useState } from 'react';
import './RatingWidget.css';

const API_BASE_URL = import.meta.env.VITE_API_URL || window.location.origin;

interface RatingWidgetProps {
  sessionId: string;
  onSubmit?: () => void;
}

export function RatingWidget({ sessionId, onSubmit }: RatingWidgetProps) {
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [selectedHelpful, setSelectedHelpful] = useState<boolean | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hoveredStar, setHoveredStar] = useState<number | null>(null);

  const handleSubmit = async () => {
    if (selectedRating === null && selectedHelpful === null) {
      return;
    }

    setIsSubmitting(true);

    try {
      const data: any = { sessionId };

      if (selectedRating !== null) {
        data.rating = selectedRating;
      }

      if (selectedHelpful !== null) {
        data.helpful = selectedHelpful;
      }

      const response = await fetch(`${API_BASE_URL}/analytics/rating`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        setIsSubmitted(true);
        // Aguarda um pouco antes de chamar onSubmit para o usuário ver a mensagem
        setTimeout(() => {
          onSubmit?.();
        }, 2000);
      } else {
        console.error('Failed to submit rating');
        alert('Erro ao enviar avaliação. Tente novamente.');
      }
    } catch (error) {
      console.error('Error submitting rating:', error);
      alert('Erro ao enviar avaliação. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="rating-widget rating-widget-compact">
        <div className="rating-success">
          <div className="success-icon">✓</div>
          <div className="success-text">Avaliação enviada com sucesso!</div>
          <div className="success-subtext">Agradecemos muito pelo seu feedback.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="rating-widget rating-widget-compact">
      <div className="rating-title">Como foi sua experiência?</div>

      {/* Estrelas */}
      <div className="rating-stars">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            className={`star ${(hoveredStar !== null && star <= hoveredStar) || (hoveredStar === null && selectedRating !== null && star <= selectedRating) ? 'active' : ''}`}
            onClick={() => {
              setSelectedRating(star);
              setSelectedHelpful(null);
            }}
            onMouseEnter={() => setHoveredStar(star)}
            onMouseLeave={() => setHoveredStar(null)}
            aria-label={`${star} estrelas`}
          >
            ★
          </button>
        ))}
      </div>

      <div className="rating-divider">— ou —</div>

      {/* Útil / Não útil */}
      <div className="rating-simple">
        <button
          className={`simple-btn helpful ${selectedHelpful === true ? 'active' : ''}`}
          onClick={() => {
            setSelectedHelpful(true);
            setSelectedRating(null);
          }}
        >
          <span>👍</span>
          <span>Útil</span>
        </button>
        <button
          className={`simple-btn not-helpful ${selectedHelpful === false ? 'active' : ''}`}
          onClick={() => {
            setSelectedHelpful(false);
            setSelectedRating(null);
          }}
        >
          <span>👎</span>
          <span>Não útil</span>
        </button>
      </div>

      {/* Botão enviar */}
      <button
        className="rating-submit"
        onClick={handleSubmit}
        disabled={isSubmitting || (selectedRating === null && selectedHelpful === null)}
      >
        {isSubmitting ? 'Enviando...' : 'Enviar Avaliação'}
      </button>
    </div>
  );
}

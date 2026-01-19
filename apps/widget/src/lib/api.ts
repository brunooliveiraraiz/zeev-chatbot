const API_BASE_URL = import.meta.env.VITE_API_URL || window.location.origin;
console.log('🔍 API_BASE_URL:', API_BASE_URL);

export type RouteRequest = {
  sessionId?: string;
  message: string;
  stage?: 'hml' | 'prod';
};

export type RouteResponse =
  | {
      type: 'troubleshooting';
      text: string;
    }
  | {
      type: 'direct_link';
      text: string;
      link: { label: string; url: string };
    }
  | {
      type: 'choose_option';
      text: string;
      options: Array<{ id: string; label: string; description?: string }>;
    }
  | {
      type: 'clarify';
      text: string;
    };

export async function routeMessage(payload: RouteRequest): Promise<RouteResponse> {
  const response = await fetch(`${API_BASE_URL}/route`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    let errorMessage = 'Falha ao processar mensagem';
    try {
      const error = await response.json();
      errorMessage = error.error || errorMessage;
    } catch {
      // ignore parse errors
    }
    throw new Error(errorMessage);
  }

  return response.json();
}

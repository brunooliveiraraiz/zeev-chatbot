/**
 * Extrai contexto/token do Zeev da página atual.
 * Suporta:
 * - Query parameter: ?context=...
 * - Data attribute: data-zeev-context
 * - Header (se disponível via proxy)
 */
export function getZeevContext(): string | null {
  // Try data attribute first (for widget script)
  const script = document.querySelector('script[data-zeev-context]');
  if (script) {
    const context = script.getAttribute('data-zeev-context');
    if (context) return context;
  }

  // Try query parameter (for iframe)
  const urlParams = new URLSearchParams(window.location.search);
  const context = urlParams.get('context');
  if (context) return context;

  // Try token parameter
  const token = urlParams.get('token');
  if (token) return token;

  return null;
}

export function getZeevToken(): string | null {
  // Similar to context but for JWT tokens
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('token');
}

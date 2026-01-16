const STORAGE_KEY = 'zeev_chatbot_session_id';

export function saveSessionId(id: string): void {
  try {
    localStorage.setItem(STORAGE_KEY, id);
  } catch (error) {
    console.warn('Failed to save session id to localStorage', error);
  }
}

export function getSessionId(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch (error) {
    console.warn('Failed to get session id from localStorage', error);
    return null;
  }
}

export function clearSessionId(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.warn('Failed to clear session id from localStorage', error);
  }
}

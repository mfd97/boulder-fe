/**
 * Simple event emitter for auth-related events (e.g. 401 unauthorized).
 * Allows non-React code (e.g. axios interceptor) to trigger logout flow.
 */
type Listener = () => void;
const listeners: Listener[] = [];

export function emitUnauthorized(): void {
  listeners.forEach((fn) => {
    try {
      fn();
    } catch (e) {
      console.error('[authEvents] Listener error:', e);
    }
  });
}

export function onUnauthorized(listener: Listener): () => void {
  listeners.push(listener);
  return () => {
    const i = listeners.indexOf(listener);
    if (i !== -1) listeners.splice(i, 1);
  };
}

import logger from './logger';

// After a deploy, a tab still running the previous build requests chunk hashes
// that nginx no longer serves (a 404 for an old `/assets/index-*.js` on
// 2026-11-01). Vite dispatches a cancelable `vite:preloadError` when a dynamic
// import fails; reloading once fetches the new index.html. A second failure
// within the window means the new build fails too, so the error is left to the
// ErrorBoundary instead of looping.
export const CHUNK_RELOAD_KEY = 'chunk-reload-at';
export const CHUNK_RELOAD_WINDOW_MS = 10_000;

interface ReloadDeps {
  storage?: Pick<Storage, 'getItem' | 'setItem'> | null;
  now?: number;
  reload?: () => void;
}

function sessionStore(): Pick<Storage, 'getItem' | 'setItem'> | null {
  // Some in-app browsers throw on sessionStorage access.
  try {
    return window.sessionStorage;
  } catch {
    return null;
  }
}

export function handlePreloadError(event: Event, deps: ReloadDeps = {}): void {
  const storage = deps.storage === undefined ? sessionStore() : deps.storage;
  const now = deps.now ?? Date.now();
  let last = NaN;
  try {
    last = Number(storage?.getItem(CHUNK_RELOAD_KEY));
  } catch {
    // Unreadable storage: treat as no earlier reload.
  }
  if (Number.isFinite(last) && now - last < CHUNK_RELOAD_WINDOW_MS) {
    logger.warn('Chunk failed again right after a reload; not reloading');
    return;
  }
  try {
    storage?.setItem(CHUNK_RELOAD_KEY, String(now));
  } catch {
    // Without storage the guard cannot persist; one reload is still safer
    // than a blank page.
  }
  event.preventDefault();
  (deps.reload ?? (() => window.location.reload()))();
}

export function registerChunkReload(): void {
  window.addEventListener('vite:preloadError', (event) => handlePreloadError(event));
}

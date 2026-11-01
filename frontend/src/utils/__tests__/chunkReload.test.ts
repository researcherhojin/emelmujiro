import { vi, describe, it, expect, beforeEach } from 'vitest';

vi.mock('../logger', () => ({ default: { warn: vi.fn() } }));

import logger from '../logger';
import {
  CHUNK_RELOAD_KEY,
  CHUNK_RELOAD_WINDOW_MS,
  handlePreloadError,
  registerChunkReload,
} from '../chunkReload';

const memory = () => {
  const store = new Map<string, string>();
  return {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => void store.set(key, value),
  };
};
const preloadError = () => new Event('vite:preloadError', { cancelable: true });

describe('handlePreloadError', () => {
  beforeEach(() => vi.clearAllMocks());

  it('reloads once and cancels the error for a first failure', () => {
    const storage = memory();
    const reload = vi.fn();
    const event = preloadError();
    handlePreloadError(event, { storage, now: 1_000_000, reload });
    expect(reload).toHaveBeenCalledTimes(1);
    expect(event.defaultPrevented).toBe(true);
    expect(storage.getItem(CHUNK_RELOAD_KEY)).toBe('1000000');
  });

  it('lets the error through when the reload just happened, so it cannot loop', () => {
    const storage = memory();
    storage.setItem(CHUNK_RELOAD_KEY, '1000000');
    const reload = vi.fn();
    const event = preloadError();
    handlePreloadError(event, { storage, now: 1_000_000 + CHUNK_RELOAD_WINDOW_MS - 1, reload });
    expect(reload).not.toHaveBeenCalled();
    expect(event.defaultPrevented).toBe(false);
    expect(logger.warn).toHaveBeenCalledTimes(1);
  });

  it('reloads again once the window has passed', () => {
    const storage = memory();
    storage.setItem(CHUNK_RELOAD_KEY, '1000000');
    const reload = vi.fn();
    handlePreloadError(preloadError(), {
      storage,
      now: 1_000_000 + CHUNK_RELOAD_WINDOW_MS,
      reload,
    });
    expect(reload).toHaveBeenCalledTimes(1);
  });

  it('still reloads once when storage is missing or throws', () => {
    for (const storage of [
      null,
      {
        getItem: () => {
          throw new Error('denied');
        },
        setItem: () => {
          throw new Error('denied');
        },
      },
    ]) {
      const reload = vi.fn();
      const event = preloadError();
      handlePreloadError(event, { storage, now: 5, reload });
      expect(reload).toHaveBeenCalledTimes(1);
      expect(event.defaultPrevented).toBe(true);
    }
  });

  it('defaults to sessionStorage and window.location.reload', () => {
    window.sessionStorage.removeItem(CHUNK_RELOAD_KEY);
    handlePreloadError(preloadError());
    expect(window.location.reload).toHaveBeenCalledTimes(1);
    expect(window.sessionStorage.getItem(CHUNK_RELOAD_KEY)).not.toBeNull();
  });

  it('treats a throwing sessionStorage getter as no storage', () => {
    const original = Object.getOwnPropertyDescriptor(window, 'sessionStorage')!;
    Object.defineProperty(window, 'sessionStorage', {
      configurable: true,
      get: () => {
        throw new Error('blocked');
      },
    });
    try {
      const reload = vi.fn();
      handlePreloadError(preloadError(), { reload });
      expect(reload).toHaveBeenCalledTimes(1);
    } finally {
      Object.defineProperty(window, 'sessionStorage', original);
    }
  });
});

describe('registerChunkReload', () => {
  it('handles vite:preloadError events on window', () => {
    window.sessionStorage.removeItem(CHUNK_RELOAD_KEY);
    vi.mocked(window.location.reload).mockClear();
    registerChunkReload();
    const event = preloadError();
    window.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(true);
    expect(window.location.reload).toHaveBeenCalledTimes(1);
  });
});

import { vi, describe, it, expect, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { usePrefersReducedMotion } from '../usePrefersReducedMotion';

const mockMatch = (matches: boolean) => {
  const listeners: Array<(e: MediaQueryListEvent) => void> = [];
  vi.mocked(window.matchMedia).mockImplementation(
    (query: string) =>
      ({
        matches,
        media: query,
        addEventListener: (_: string, cb: (e: MediaQueryListEvent) => void) => listeners.push(cb),
        removeEventListener: (_: string, cb: (e: MediaQueryListEvent) => void) => {
          listeners.splice(listeners.indexOf(cb), 1);
        },
      }) as unknown as MediaQueryList
  );
  return listeners;
};

describe('usePrefersReducedMotion', () => {
  afterEach(() => mockMatch(false));

  it('returns false when the query does not match', () => {
    mockMatch(false);
    const { result } = renderHook(() => usePrefersReducedMotion());
    expect(result.current).toBe(false);
  });

  it('returns true when the query matches on first render', () => {
    mockMatch(true);
    const { result } = renderHook(() => usePrefersReducedMotion());
    expect(result.current).toBe(true);
  });

  it('follows change events and unsubscribes on unmount', () => {
    const listeners = mockMatch(false);
    const { result, unmount } = renderHook(() => usePrefersReducedMotion());
    expect(listeners).toHaveLength(1);

    act(() => listeners[0]({ matches: true } as MediaQueryListEvent));
    expect(result.current).toBe(true);

    unmount();
    expect(listeners).toHaveLength(0);
  });

  it('returns false when matchMedia is unavailable', () => {
    const original = window.matchMedia;
    Object.defineProperty(window, 'matchMedia', { writable: true, value: undefined });
    try {
      const { result } = renderHook(() => usePrefersReducedMotion());
      expect(result.current).toBe(false);
    } finally {
      Object.defineProperty(window, 'matchMedia', { writable: true, value: original });
    }
  });
});

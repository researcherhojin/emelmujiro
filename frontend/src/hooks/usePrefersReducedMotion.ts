import { useState, useEffect } from 'react';

const QUERY = '(prefers-reduced-motion: reduce)';

const read = (): boolean =>
  typeof window !== 'undefined' && typeof window.matchMedia === 'function'
    ? (window.matchMedia(QUERY)?.matches ?? false)
    : false;

/** Tracks `prefers-reduced-motion: reduce`. Returns `false` without `window` (SSR). */
export const usePrefersReducedMotion = (): boolean => {
  const [reduced, setReduced] = useState<boolean>(read);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;
    const mql = window.matchMedia(QUERY);
    if (!mql) return;
    const onChange = (event: MediaQueryListEvent) => setReduced(event.matches);
    setReduced(mql.matches);
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, []);

  return reduced;
};

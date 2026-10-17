import { langFromPath } from './langFromPath';

/**
 * Custom language detector lookup: reads language from URL prefix (/en/*).
 * Extracted from i18n.ts so the SSR guard can be unit-tested without
 * triggering i18next module-level side effects.
 */
export const urlPrefixLookup = (): string | undefined => {
  if (typeof window === 'undefined') return undefined;
  // Return undefined (not the default) for unprefixed paths, so i18next falls
  // through to the next detector in `order`.
  return langFromPath(window.location.pathname) === 'en' ? 'en' : undefined;
};

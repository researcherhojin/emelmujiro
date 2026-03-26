/**
 * Custom language detector lookup: reads language from URL prefix (/en/*).
 * Extracted from i18n.ts so the SSR guard can be unit-tested without
 * triggering i18next module-level side effects.
 */
export const urlPrefixLookup = (): string | undefined => {
  if (typeof window === 'undefined') return undefined;
  const match = window.location.pathname.match(/^\/(en)(\/|$)/);
  return match ? match[1] : undefined;
};

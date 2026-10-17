/**
 * Single source of truth for reading the UI language from a URL path.
 * Korean is the default and carries no prefix; English lives under `/en`.
 * Only a whole `/en` segment counts: `/en` and `/en/...` are English,
 * `/enable` and `/content` are not.
 *
 * Kept free of React and i18next imports so `i18n.ts` (via
 * `urlPrefixLookup`), `App.tsx` and the `useLocalizedPath` hook can all use it.
 */
export const DEFAULT_LANG = 'ko';

export function langFromPath(pathname: string): 'en' | typeof DEFAULT_LANG {
  return pathname === '/en' || pathname.startsWith('/en/') ? 'en' : DEFAULT_LANG;
}

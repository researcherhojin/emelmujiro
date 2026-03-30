import { useCallback } from 'react';
import { useNavigate, useLocation, useParams, type NavigateOptions } from 'react-router-dom';

const SUPPORTED_LANGS = ['ko', 'en'] as const;
const DEFAULT_LANG = 'ko';

/**
 * Get the language prefix from a URL pathname.
 * Returns '/en' for English paths, '' for Korean (default).
 */
export function getLangFromPath(pathname: string): string {
  const match = pathname.match(/^\/(en)(\/|$)/);
  return match ? match[1] : DEFAULT_LANG;
}

/**
 * Get the language prefix string for URL construction.
 * Returns '/en' for English, '' for Korean.
 */
export function getLangPrefix(lang: string): string {
  return lang === DEFAULT_LANG ? '' : `/${lang}`;
}

/**
 * Strip language prefix from a pathname.
 * '/en/profile' → '/profile', '/profile' → '/profile'
 */
export function stripLangPrefix(pathname: string): string {
  return pathname.replace(/^\/(en)(\/|$)/, '$2').replace(/^\/$/, '/') || '/';
}

/**
 * Build a localized path.
 * localizedPath('/profile', 'en') → '/en/profile'
 * localizedPath('/profile', 'ko') → '/profile'
 */
export function buildLocalizedPath(path: string, lang: string): string {
  const cleanPath = stripLangPrefix(path);
  const prefix = getLangPrefix(lang);
  if (cleanPath === '/') return prefix || '/';
  return `${prefix}${cleanPath}`;
}

/**
 * Hook that provides language-aware navigation utilities.
 */
export function useLocalizedPath() {
  const location = useLocation();
  const params = useParams();
  const navigate = useNavigate();

  const currentLang = (params.lang as string) || DEFAULT_LANG;
  const langPrefix = getLangPrefix(currentLang);

  /** Prefix a path with the current language */
  const localizedPath = useCallback(
    (path: string): string => {
      // Don't prefix external URLs or hash-only paths
      if (path.startsWith('http') || path.startsWith('#')) return path;
      // Don't prefix paths that already have a language prefix
      if (path.startsWith('/en/') || path === '/en') return path;
      // Build localized path
      return buildLocalizedPath(path, currentLang);
    },
    [currentLang]
  );

  /** Navigate to a language-prefixed path */
  const localizedNavigate = useCallback(
    (path: string, options?: NavigateOptions) => {
      if (options) {
        navigate(localizedPath(path), options);
      } else {
        navigate(localizedPath(path));
      }
    },
    [navigate, localizedPath]
  );

  /** Get the path for switching to another language */
  const switchLanguagePath = useCallback(
    (targetLang: string): string => {
      const basePath = stripLangPrefix(location.pathname);
      return buildLocalizedPath(basePath, targetLang);
    },
    [location.pathname]
  );

  return {
    currentLang,
    langPrefix,
    localizedPath,
    localizedNavigate,
    switchLanguagePath,
    supportedLangs: SUPPORTED_LANGS,
    defaultLang: DEFAULT_LANG,
  };
}

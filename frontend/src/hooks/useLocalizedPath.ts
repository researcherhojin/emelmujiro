import { useCallback } from 'react';
import { useNavigate, useLocation, type NavigateOptions } from 'react-router';
import { DEFAULT_LANG, langFromPath } from '../utils/langFromPath';

function getLangPrefix(lang: string): string {
  return lang === DEFAULT_LANG ? '' : `/${lang}`;
}

/**
 * Strip language prefix from a pathname.
 * '/en/profile' → '/profile', '/profile' → '/profile'
 */
export function stripLangPrefix(pathname: string): string {
  return (langFromPath(pathname) === 'en' ? pathname.slice('/en'.length) : pathname) || '/';
}

function buildLocalizedPath(path: string, lang: string): string {
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
  const navigate = useNavigate();

  const currentLang = langFromPath(location.pathname);
  const langPrefix = getLangPrefix(currentLang);

  /** Prefix a path with the current language */
  const localizedPath = useCallback(
    (path: string): string => {
      // Don't prefix external URLs or hash-only paths
      if (path.startsWith('http') || path.startsWith('#')) return path;
      // Don't prefix paths that already have a language prefix
      if (langFromPath(path) === 'en') return path;
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
  };
}

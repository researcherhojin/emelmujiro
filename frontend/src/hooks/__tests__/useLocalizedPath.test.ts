import { renderHook, act } from '@testing-library/react';
import { MemoryRouter, Routes, Route, Outlet } from 'react-router-dom';
import React from 'react';
import {
  getLangFromPath,
  getLangPrefix,
  stripLangPrefix,
  buildLocalizedPath,
  useLocalizedPath,
} from '../useLocalizedPath';

// --- Pure utility function tests ---

describe('getLangFromPath', () => {
  it('returns "ko" for Korean paths (no prefix)', () => {
    expect(getLangFromPath('/')).toBe('ko');
    expect(getLangFromPath('/about')).toBe('ko');
    expect(getLangFromPath('/blog/123')).toBe('ko');
  });

  it('returns "en" for English paths', () => {
    expect(getLangFromPath('/en')).toBe('en');
    expect(getLangFromPath('/en/')).toBe('en');
    expect(getLangFromPath('/en/about')).toBe('en');
    expect(getLangFromPath('/en/blog/123')).toBe('en');
  });

  it('returns "ko" for paths that contain "en" but not as prefix', () => {
    expect(getLangFromPath('/enable')).toBe('ko');
    expect(getLangFromPath('/content')).toBe('ko');
    expect(getLangFromPath('/blog/en-post')).toBe('ko');
  });
});

describe('getLangPrefix', () => {
  it('returns empty string for Korean (default)', () => {
    expect(getLangPrefix('ko')).toBe('');
  });

  it('returns "/en" for English', () => {
    expect(getLangPrefix('en')).toBe('/en');
  });

  it('returns prefix for other languages', () => {
    expect(getLangPrefix('ja')).toBe('/ja');
    expect(getLangPrefix('fr')).toBe('/fr');
  });
});

describe('stripLangPrefix', () => {
  it('strips /en prefix from paths', () => {
    expect(stripLangPrefix('/en/about')).toBe('/about');
    expect(stripLangPrefix('/en/blog/123')).toBe('/blog/123');
  });

  it('returns "/" for /en root', () => {
    expect(stripLangPrefix('/en')).toBe('/');
    expect(stripLangPrefix('/en/')).toBe('/');
  });

  it('does not strip from Korean paths (no prefix)', () => {
    expect(stripLangPrefix('/')).toBe('/');
    expect(stripLangPrefix('/about')).toBe('/about');
    expect(stripLangPrefix('/blog/123')).toBe('/blog/123');
  });

  it('does not strip "en" when not a prefix segment', () => {
    expect(stripLangPrefix('/enable')).toBe('/enable');
    expect(stripLangPrefix('/content')).toBe('/content');
  });
});

describe('buildLocalizedPath', () => {
  it('builds Korean paths without prefix', () => {
    expect(buildLocalizedPath('/about', 'ko')).toBe('/about');
    expect(buildLocalizedPath('/blog/123', 'ko')).toBe('/blog/123');
    expect(buildLocalizedPath('/', 'ko')).toBe('/');
  });

  it('builds English paths with /en prefix', () => {
    expect(buildLocalizedPath('/about', 'en')).toBe('/en/about');
    expect(buildLocalizedPath('/blog/123', 'en')).toBe('/en/blog/123');
    expect(buildLocalizedPath('/', 'en')).toBe('/en');
  });

  it('strips existing language prefix before rebuilding', () => {
    expect(buildLocalizedPath('/en/about', 'ko')).toBe('/about');
    expect(buildLocalizedPath('/en/about', 'en')).toBe('/en/about');
  });
});

// --- Hook tests ---

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

/**
 * Creates a wrapper matching the real App.tsx route structure:
 *   / → children (no :lang param → Korean default)
 *   /:lang → children (lang param → detected language)
 */
function createWrapper(initialEntries: string[]) {
  const outlet = React.createElement(Outlet);
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(
      MemoryRouter,
      { initialEntries },
      React.createElement(
        Routes,
        null,
        // Korean routes: / with explicit child paths (no :lang param)
        React.createElement(
          Route,
          { path: '/', element: outlet },
          React.createElement(Route, { index: true, element: children }),
          React.createElement(Route, { path: 'about', element: children }),
          React.createElement(Route, { path: 'contact', element: children }),
          React.createElement(Route, { path: 'blog', element: children }),
          React.createElement(Route, { path: 'blog/:id', element: children }),
          React.createElement(Route, { path: 'profile', element: children }),
          React.createElement(Route, { path: 'share', element: children })
        ),
        // English routes: /:lang with explicit child paths
        React.createElement(
          Route,
          { path: '/:lang', element: outlet },
          React.createElement(Route, { index: true, element: children }),
          React.createElement(Route, { path: 'about', element: children }),
          React.createElement(Route, { path: 'contact', element: children }),
          React.createElement(Route, { path: 'blog', element: children }),
          React.createElement(Route, { path: 'blog/:id', element: children }),
          React.createElement(Route, { path: 'profile', element: children }),
          React.createElement(Route, { path: 'share', element: children })
        )
      )
    );
  };
}

describe('useLocalizedPath hook', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  it('returns Korean as default language on root', () => {
    const { result } = renderHook(() => useLocalizedPath(), {
      wrapper: createWrapper(['/']),
    });
    expect(result.current.currentLang).toBe('ko');
    expect(result.current.langPrefix).toBe('');
    expect(result.current.defaultLang).toBe('ko');
  });

  it('returns Korean for unprefixed paths', () => {
    const { result } = renderHook(() => useLocalizedPath(), {
      wrapper: createWrapper(['/about']),
    });
    expect(result.current.currentLang).toBe('ko');
    expect(result.current.langPrefix).toBe('');
  });

  it('detects English from URL params', () => {
    const { result } = renderHook(() => useLocalizedPath(), {
      wrapper: createWrapper(['/en/about']),
    });
    expect(result.current.currentLang).toBe('en');
    expect(result.current.langPrefix).toBe('/en');
  });

  it('exposes supportedLangs', () => {
    const { result } = renderHook(() => useLocalizedPath(), {
      wrapper: createWrapper(['/']),
    });
    expect(result.current.supportedLangs).toEqual(['ko', 'en']);
  });

  describe('localizedPath', () => {
    it('returns path as-is for Korean', () => {
      const { result } = renderHook(() => useLocalizedPath(), {
        wrapper: createWrapper(['/about']),
      });
      expect(result.current.localizedPath('/contact')).toBe('/contact');
    });

    it('prefixes path with /en for English', () => {
      const { result } = renderHook(() => useLocalizedPath(), {
        wrapper: createWrapper(['/en/about']),
      });
      expect(result.current.localizedPath('/contact')).toBe('/en/contact');
    });

    it('does not prefix external URLs', () => {
      const { result } = renderHook(() => useLocalizedPath(), {
        wrapper: createWrapper(['/en/about']),
      });
      expect(result.current.localizedPath('https://example.com')).toBe('https://example.com');
      expect(result.current.localizedPath('http://example.com')).toBe('http://example.com');
    });

    it('does not prefix hash-only paths', () => {
      const { result } = renderHook(() => useLocalizedPath(), {
        wrapper: createWrapper(['/en/about']),
      });
      expect(result.current.localizedPath('#section')).toBe('#section');
    });

    it('does not double-prefix paths already containing /en', () => {
      const { result } = renderHook(() => useLocalizedPath(), {
        wrapper: createWrapper(['/en/about']),
      });
      expect(result.current.localizedPath('/en/contact')).toBe('/en/contact');
      expect(result.current.localizedPath('/en')).toBe('/en');
    });
  });

  describe('localizedNavigate', () => {
    it('navigates to localized path for English', () => {
      const { result } = renderHook(() => useLocalizedPath(), {
        wrapper: createWrapper(['/en/about']),
      });
      act(() => {
        result.current.localizedNavigate('/contact');
      });
      expect(mockNavigate).toHaveBeenCalledWith('/en/contact');
    });

    it('navigates without prefix for Korean', () => {
      const { result } = renderHook(() => useLocalizedPath(), {
        wrapper: createWrapper(['/about']),
      });
      act(() => {
        result.current.localizedNavigate('/contact');
      });
      expect(mockNavigate).toHaveBeenCalledWith('/contact');
    });

    it('passes NavigateOptions when provided', () => {
      const { result } = renderHook(() => useLocalizedPath(), {
        wrapper: createWrapper(['/about']),
      });
      act(() => {
        result.current.localizedNavigate('/contact', { replace: true });
      });
      expect(mockNavigate).toHaveBeenCalledWith('/contact', { replace: true });
    });
  });

  describe('switchLanguagePath', () => {
    it('switches from Korean to English', () => {
      const { result } = renderHook(() => useLocalizedPath(), {
        wrapper: createWrapper(['/about']),
      });
      expect(result.current.switchLanguagePath('en')).toBe('/en/about');
    });

    it('switches from English to Korean', () => {
      const { result } = renderHook(() => useLocalizedPath(), {
        wrapper: createWrapper(['/en/about']),
      });
      expect(result.current.switchLanguagePath('ko')).toBe('/about');
    });

    it('switches language on root path', () => {
      const { result } = renderHook(() => useLocalizedPath(), {
        wrapper: createWrapper(['/']),
      });
      expect(result.current.switchLanguagePath('en')).toBe('/en');
    });

    it('switches language on nested path', () => {
      const { result } = renderHook(() => useLocalizedPath(), {
        wrapper: createWrapper(['/en/blog/123']),
      });
      expect(result.current.switchLanguagePath('ko')).toBe('/blog/123');
    });
  });
});

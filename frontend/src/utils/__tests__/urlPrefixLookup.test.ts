import { describe, it, expect, afterEach } from 'vitest';
import { urlPrefixLookup } from '../urlPrefixLookup';

describe('urlPrefixLookup', () => {
  const originalLocation = window.location;

  afterEach(() => {
    // Restore window.location after each test
    Object.defineProperty(window, 'location', {
      value: originalLocation,
      writable: true,
      configurable: true,
    });
  });

  it('returns undefined when window is undefined (SSR)', () => {
    const origWindow = globalThis.window;
    // @ts-expect-error -- simulating SSR environment
    delete globalThis.window;

    try {
      expect(urlPrefixLookup()).toBeUndefined();
    } finally {
      globalThis.window = origWindow;
    }
  });

  it('returns "en" for /en/ paths', () => {
    Object.defineProperty(window, 'location', {
      value: { pathname: '/en/profile' },
      writable: true,
      configurable: true,
    });

    expect(urlPrefixLookup()).toBe('en');
  });

  it('returns "en" for /en root path', () => {
    Object.defineProperty(window, 'location', {
      value: { pathname: '/en' },
      writable: true,
      configurable: true,
    });

    // /en without trailing slash should NOT match — regex requires / or end
    // Actually the regex is /^\/(en)(\/|$)/ so /en$ matches via the $ alternative
    expect(urlPrefixLookup()).toBe('en');
  });

  it('returns undefined for non-English paths', () => {
    Object.defineProperty(window, 'location', {
      value: { pathname: '/profile' },
      writable: true,
      configurable: true,
    });

    expect(urlPrefixLookup()).toBeUndefined();
  });

  it('returns undefined for root path', () => {
    Object.defineProperty(window, 'location', {
      value: { pathname: '/' },
      writable: true,
      configurable: true,
    });

    expect(urlPrefixLookup()).toBeUndefined();
  });
});

import { describe, it, expect } from 'vitest';
import { DEFAULT_LANG, langFromPath } from '../langFromPath';

describe('langFromPath', () => {
  it('defaults to Korean', () => {
    expect(DEFAULT_LANG).toBe('ko');
  });

  it.each(['/en', '/en/', '/en/insights', '/en/insights/some-slug'])(
    'returns "en" for %s',
    (pathname) => {
      expect(langFromPath(pathname)).toBe('en');
    }
  );

  it.each(['/', '', '/enx', '/enable', '/content', '/insights', '/profile/en', 'en', '/EN'])(
    'returns "ko" for %s',
    (pathname) => {
      expect(langFromPath(pathname)).toBe('ko');
    }
  );
});

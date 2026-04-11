import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

// Mock env module before importing analytics
const mockEnv = vi.hoisted(() => ({
  GA_TRACKING_ID: 'G-TEST123',
  ENABLE_ANALYTICS: true,
  IS_TEST: true,
  IS_DEVELOPMENT: false,
  IS_PRODUCTION: false,
  API_URL: '',
}));

vi.mock('../../config/env', () => ({
  default: mockEnv,
}));

describe('analytics', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.useFakeTimers();
    // Reset env defaults
    mockEnv.GA_TRACKING_ID = 'G-TEST123';
    mockEnv.ENABLE_ANALYTICS = true;
    // Clear gtag and dataLayer
    window.gtag = undefined as unknown as typeof window.gtag;
    window.dataLayer = undefined as unknown as typeof window.dataLayer;
    // Clean up any injected scripts
    document.head.querySelectorAll('script[src*="googletagmanager"]').forEach((s) => s.remove());
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('initAnalytics', () => {
    it('injects gtag script and initializes dataLayer when enabled', async () => {
      const { initAnalytics } = await import('../analytics');
      initAnalytics();

      // Shim + dataLayer are set up synchronously so events queued during
      // initial render aren't lost. The actual script injection is deferred
      // until the `load` event + idle callback — advance timers to flush it.
      expect(window.dataLayer).toBeDefined();
      expect(typeof window.gtag).toBe('function');

      // jsdom readyState is 'complete' at test time, so we go through the
      // scheduleIdle path (setTimeout 200ms fallback — requestIdleCallback
      // isn't polyfilled in jsdom).
      await vi.advanceTimersByTimeAsync(300);

      const script = document.head.querySelector('script[src*="googletagmanager"]');
      expect(script).not.toBeNull();
      expect(script?.getAttribute('src')).toContain('G-TEST123');
    });

    it('does nothing when analytics is disabled', async () => {
      mockEnv.ENABLE_ANALYTICS = false;
      const { initAnalytics } = await import('../analytics');
      initAnalytics();

      const script = document.head.querySelector('script[src*="googletagmanager"]');
      expect(script).toBeNull();
    });

    it('does nothing when GA_TRACKING_ID is empty', async () => {
      mockEnv.GA_TRACKING_ID = '';
      const { initAnalytics } = await import('../analytics');
      initAnalytics();

      const script = document.head.querySelector('script[src*="googletagmanager"]');
      expect(script).toBeNull();
    });
  });

  describe('trackPageView', () => {
    it('sends page_view event when gtag is available', async () => {
      const { initAnalytics, trackPageView } = await import('../analytics');
      initAnalytics();

      const gtagSpy = vi.fn();
      window.gtag = gtagSpy;

      trackPageView('/profile');
      expect(gtagSpy).toHaveBeenCalledWith('event', 'page_view', { page_path: '/profile' });
    });

    it('does nothing when gtag is not initialized', async () => {
      const { trackPageView } = await import('../analytics');
      // gtag is undefined — should not throw
      expect(() => trackPageView('/test')).not.toThrow();
    });
  });

  describe('trackCtaClick', () => {
    it('sends click_cta_email event when gtag is available', async () => {
      const { initAnalytics, trackCtaClick } = await import('../analytics');
      initAnalytics();

      const gtagSpy = vi.fn();
      window.gtag = gtagSpy;

      trackCtaClick('hero');
      expect(gtagSpy).toHaveBeenCalledWith('event', 'click_cta_email', { event_label: 'hero' });
    });

    it('does nothing when gtag is not initialized', async () => {
      const { trackCtaClick } = await import('../analytics');
      expect(() => trackCtaClick('cta')).not.toThrow();
    });
  });

  // --- New tests for uncovered lines ---

  describe('trackBlogView', () => {
    it('sends view_blog_post event with post id and category', async () => {
      const { initAnalytics, trackBlogView } = await import('../analytics');
      initAnalytics();

      const gtagSpy = vi.fn();
      window.gtag = gtagSpy;

      trackBlogView(42, 'tech');
      expect(gtagSpy).toHaveBeenCalledWith('event', 'view_blog_post', {
        post_id: 42,
        category: 'tech',
      });
    });

    it('sends view_blog_post event with string post id', async () => {
      const { initAnalytics, trackBlogView } = await import('../analytics');
      initAnalytics();

      const gtagSpy = vi.fn();
      window.gtag = gtagSpy;

      trackBlogView('slug-123');
      expect(gtagSpy).toHaveBeenCalledWith('event', 'view_blog_post', {
        post_id: 'slug-123',
        category: undefined,
      });
    });

    it('does nothing when gtag is not initialized', async () => {
      const { trackBlogView } = await import('../analytics');
      expect(() => trackBlogView(1)).not.toThrow();
    });
  });

  describe('trackDarkModeToggle', () => {
    it('sends toggle_dark_mode event with is_dark true', async () => {
      const { initAnalytics, trackDarkModeToggle } = await import('../analytics');
      initAnalytics();

      const gtagSpy = vi.fn();
      window.gtag = gtagSpy;

      trackDarkModeToggle(true);
      expect(gtagSpy).toHaveBeenCalledWith('event', 'toggle_dark_mode', { is_dark: true });
    });

    it('sends toggle_dark_mode event with is_dark false', async () => {
      const { initAnalytics, trackDarkModeToggle } = await import('../analytics');
      initAnalytics();

      const gtagSpy = vi.fn();
      window.gtag = gtagSpy;

      trackDarkModeToggle(false);
      expect(gtagSpy).toHaveBeenCalledWith('event', 'toggle_dark_mode', { is_dark: false });
    });

    it('does nothing when gtag is not initialized', async () => {
      const { trackDarkModeToggle } = await import('../analytics');
      expect(() => trackDarkModeToggle(true)).not.toThrow();
    });
  });

  describe('trackLanguageSwitch', () => {
    it('sends switch_language event', async () => {
      const { initAnalytics, trackLanguageSwitch } = await import('../analytics');
      initAnalytics();

      const gtagSpy = vi.fn();
      window.gtag = gtagSpy;

      trackLanguageSwitch('en');
      expect(gtagSpy).toHaveBeenCalledWith('event', 'switch_language', { language: 'en' });
    });

    it('does nothing when gtag is not initialized', async () => {
      const { trackLanguageSwitch } = await import('../analytics');
      expect(() => trackLanguageSwitch('ko')).not.toThrow();
    });
  });
});

import { vi, describe, it, expect, beforeEach } from 'vitest';

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
    // Reset env defaults
    mockEnv.GA_TRACKING_ID = 'G-TEST123';
    mockEnv.ENABLE_ANALYTICS = true;
    // Clear gtag and dataLayer
    window.gtag = undefined as unknown as typeof window.gtag;
    window.dataLayer = undefined as unknown as typeof window.dataLayer;
    // Clean up any injected scripts
    document.head.querySelectorAll('script[src*="googletagmanager"]').forEach((s) => s.remove());
  });

  describe('initAnalytics', () => {
    it('injects gtag script and initializes dataLayer when enabled', async () => {
      const { initAnalytics } = await import('../analytics');
      initAnalytics();

      const script = document.head.querySelector('script[src*="googletagmanager"]');
      expect(script).not.toBeNull();
      expect(script?.getAttribute('src')).toContain('G-TEST123');
      expect(window.dataLayer).toBeDefined();
      expect(typeof window.gtag).toBe('function');
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

      trackPageView('/about');
      expect(gtagSpy).toHaveBeenCalledWith('event', 'page_view', { page_path: '/about' });
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
});

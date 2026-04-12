import { vi, describe, it, expect, beforeEach } from 'vitest';

// Mock env module before importing analytics
const mockEnv = vi.hoisted(() => ({
  UMAMI_HOST: 'https://analytics.emelmujiro.com',
  UMAMI_WEBSITE_ID: 'test-website-id',
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
  let sendBeaconSpy: ReturnType<typeof vi.fn>;
  let fetchSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.resetModules();
    // Reset env defaults
    mockEnv.UMAMI_HOST = 'https://analytics.emelmujiro.com';
    mockEnv.UMAMI_WEBSITE_ID = 'test-website-id';
    mockEnv.ENABLE_ANALYTICS = true;

    // Mock sendBeacon
    sendBeaconSpy = vi.fn(() => true);
    Object.defineProperty(navigator, 'sendBeacon', {
      value: sendBeaconSpy,
      writable: true,
      configurable: true,
    });

    // Mock fetch
    fetchSpy = vi.fn(() => Promise.resolve(new Response()));
    global.fetch = fetchSpy as unknown as typeof fetch;
  });

  describe('initAnalytics', () => {
    it('is a no-op (Umami needs no initialization)', async () => {
      const { initAnalytics } = await import('../analytics');
      // Should not throw and should not inject any scripts
      expect(() => initAnalytics()).not.toThrow();
      const script = document.head.querySelector('script[src*="umami"]');
      expect(script).toBeNull();
    });
  });

  describe('trackPageView', () => {
    it('sends page_view event via sendBeacon', async () => {
      const { trackPageView } = await import('../analytics');

      trackPageView('/profile');

      expect(sendBeaconSpy).toHaveBeenCalledTimes(1);
      const [url, blob] = sendBeaconSpy.mock.calls[0];
      expect(url).toBe('https://analytics.emelmujiro.com/api/send');
      const body = JSON.parse(await (blob as Blob).text());
      expect(body.type).toBe('event');
      expect(body.payload.url).toBe('/profile');
      expect(body.payload.website).toBe('test-website-id');
      expect(body.payload.name).toBeUndefined();
    });

    it('does nothing when analytics is disabled', async () => {
      mockEnv.ENABLE_ANALYTICS = false;
      const { trackPageView } = await import('../analytics');

      trackPageView('/test');

      expect(sendBeaconSpy).not.toHaveBeenCalled();
    });

    it('does nothing when UMAMI_HOST is empty', async () => {
      mockEnv.UMAMI_HOST = '';
      const { trackPageView } = await import('../analytics');

      trackPageView('/test');

      expect(sendBeaconSpy).not.toHaveBeenCalled();
    });

    it('does nothing when UMAMI_WEBSITE_ID is empty', async () => {
      mockEnv.UMAMI_WEBSITE_ID = '';
      const { trackPageView } = await import('../analytics');

      trackPageView('/test');

      expect(sendBeaconSpy).not.toHaveBeenCalled();
    });
  });

  describe('trackCtaClick', () => {
    it('sends click_cta_email event with location', async () => {
      const { trackCtaClick } = await import('../analytics');

      trackCtaClick('hero');

      expect(sendBeaconSpy).toHaveBeenCalledTimes(1);
      const body = JSON.parse(await (sendBeaconSpy.mock.calls[0][1] as Blob).text());
      expect(body.payload.name).toBe('click_cta_email');
      expect(body.payload.data).toEqual({ location: 'hero' });
    });

    it('does nothing when disabled', async () => {
      mockEnv.ENABLE_ANALYTICS = false;
      const { trackCtaClick } = await import('../analytics');

      trackCtaClick('cta');

      expect(sendBeaconSpy).not.toHaveBeenCalled();
    });
  });

  describe('trackBlogView', () => {
    it('sends view_blog_post event with post id and category', async () => {
      const { trackBlogView } = await import('../analytics');

      trackBlogView(42, 'tech');

      expect(sendBeaconSpy).toHaveBeenCalledTimes(1);
      const body = JSON.parse(await (sendBeaconSpy.mock.calls[0][1] as Blob).text());
      expect(body.payload.name).toBe('view_blog_post');
      expect(body.payload.data).toEqual({ post_id: '42', category: 'tech' });
    });

    it('sends event with string post id', async () => {
      const { trackBlogView } = await import('../analytics');

      trackBlogView('slug-123');

      const body = JSON.parse(await (sendBeaconSpy.mock.calls[0][1] as Blob).text());
      expect(body.payload.data).toEqual({ post_id: 'slug-123', category: undefined });
    });

    it('does nothing when disabled', async () => {
      mockEnv.ENABLE_ANALYTICS = false;
      const { trackBlogView } = await import('../analytics');

      trackBlogView(1);

      expect(sendBeaconSpy).not.toHaveBeenCalled();
    });
  });

  describe('trackDarkModeToggle', () => {
    it('sends toggle_dark_mode event', async () => {
      const { trackDarkModeToggle } = await import('../analytics');

      trackDarkModeToggle(true);

      const body = JSON.parse(await (sendBeaconSpy.mock.calls[0][1] as Blob).text());
      expect(body.payload.name).toBe('toggle_dark_mode');
      expect(body.payload.data).toEqual({ is_dark: true });
    });

    it('sends with is_dark false', async () => {
      const { trackDarkModeToggle } = await import('../analytics');

      trackDarkModeToggle(false);

      const body = JSON.parse(await (sendBeaconSpy.mock.calls[0][1] as Blob).text());
      expect(body.payload.data).toEqual({ is_dark: false });
    });

    it('does nothing when disabled', async () => {
      mockEnv.ENABLE_ANALYTICS = false;
      const { trackDarkModeToggle } = await import('../analytics');

      trackDarkModeToggle(true);

      expect(sendBeaconSpy).not.toHaveBeenCalled();
    });
  });

  describe('trackLanguageSwitch', () => {
    it('sends switch_language event', async () => {
      const { trackLanguageSwitch } = await import('../analytics');

      trackLanguageSwitch('en');

      const body = JSON.parse(await (sendBeaconSpy.mock.calls[0][1] as Blob).text());
      expect(body.payload.name).toBe('switch_language');
      expect(body.payload.data).toEqual({ language: 'en' });
    });

    it('does nothing when disabled', async () => {
      mockEnv.ENABLE_ANALYTICS = false;
      const { trackLanguageSwitch } = await import('../analytics');

      trackLanguageSwitch('ko');

      expect(sendBeaconSpy).not.toHaveBeenCalled();
    });
  });

  describe('trackWebVital', () => {
    it('sends web_vital event', async () => {
      const { trackWebVital } = await import('../analytics');

      trackWebVital('LCP', 1200.5, 'good');

      const body = JSON.parse(await (sendBeaconSpy.mock.calls[0][1] as Blob).text());
      expect(body.payload.name).toBe('web_vital');
      expect(body.payload.data).toEqual({
        metric_name: 'LCP',
        metric_value: 1200.5,
        metric_rating: 'good',
      });
    });
  });

  describe('fetch fallback', () => {
    it('uses fetch when sendBeacon is not available', async () => {
      // Remove sendBeacon
      Object.defineProperty(navigator, 'sendBeacon', {
        value: undefined,
        writable: true,
        configurable: true,
      });

      const { trackPageView } = await import('../analytics');

      trackPageView('/test');

      expect(fetchSpy).toHaveBeenCalledTimes(1);
      const [url, options] = fetchSpy.mock.calls[0];
      expect(url).toBe('https://analytics.emelmujiro.com/api/send');
      expect(options.method).toBe('POST');
      expect(options.keepalive).toBe(true);
    });
  });
});

// Umami analytics — zero external scripts (gtag.js was 156 kB, 86 kB wasted).
// Events are sent directly to the Umami collect API via sendBeacon/fetch.
// Public track* API is unchanged from the GA implementation — callers don't move.
import env from '../config/env';

const UMAMI_HOST = env.UMAMI_HOST;
const WEBSITE_ID = env.UMAMI_WEBSITE_ID;
const isEnabled = env.ENABLE_ANALYTICS && !!UMAMI_HOST && !!WEBSITE_ID;

function send(url: string, name?: string, data?: Record<string, unknown>): void {
  if (!isEnabled) return;

  const payload: Record<string, unknown> = {
    hostname: window.location.hostname,
    language: navigator.language,
    referrer: document.referrer,
    screen: `${window.screen.width}x${window.screen.height}`,
    title: document.title,
    url,
    website: WEBSITE_ID,
  };

  if (name) payload.name = name;
  if (data) payload.data = data;

  const body = JSON.stringify({ type: 'event', payload });

  // sendBeacon survives page unload; fetch is the fallback
  if (navigator.sendBeacon) {
    navigator.sendBeacon(`${UMAMI_HOST}/api/send`, new Blob([body], { type: 'application/json' }));
  } else {
    fetch(`${UMAMI_HOST}/api/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
      keepalive: true,
    }).catch(() => {});
  }
}

// No initialization needed — Umami is stateless, no external script to inject
export function initAnalytics(): void {
  // Intentional no-op: kept for API compatibility with main.tsx
}

// Track page views on route changes
export function trackPageView(path: string): void {
  send(path);
}

// Track CTA clicks
export function trackCtaClick(location: string): void {
  send(window.location.pathname, 'click_cta_email', { location });
}

// Track blog post views
export function trackBlogView(postId: string | number, category?: string): void {
  send(window.location.pathname, 'view_blog_post', { post_id: String(postId), category });
}

// Track dark mode toggle
export function trackDarkModeToggle(isDark: boolean): void {
  send(window.location.pathname, 'toggle_dark_mode', { is_dark: isDark });
}

// Track language switch
export function trackLanguageSwitch(language: string): void {
  send(window.location.pathname, 'switch_language', { language });
}

// Track web vitals (called by WebVitalsDashboard)
export function trackWebVital(name: string, value: number, rating: string): void {
  send(window.location.pathname, 'web_vital', {
    metric_name: name,
    metric_value: value,
    metric_rating: rating,
  });
}

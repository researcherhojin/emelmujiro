import env from '../config/env';

const GA_ID = env.GA_TRACKING_ID;
const isEnabled = env.ENABLE_ANALYTICS && !!GA_ID;

// Idle callback polyfill — Safari still lacks requestIdleCallback.
const scheduleIdle = (cb: () => void): void => {
  const ric = (window as Window & { requestIdleCallback?: (cb: () => void) => void })
    .requestIdleCallback;
  if (typeof ric === 'function') {
    ric(cb);
  } else {
    // Fallback: defer by a task tick. 200ms matches typical requestIdleCallback
    // first-fire window on busy pages.
    setTimeout(cb, 200);
  }
};

// Inject the gtag.js <script> tag. Extracted so we can call it from both the
// `load` event listener and the immediate path (if the page is already loaded).
const injectGtagScript = (): void => {
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
  document.head.appendChild(script);
};

/**
 * Initialize Google Analytics.
 *
 * The `window.dataLayer` + `window.gtag` shim is set up synchronously so any
 * tracking call made during render (e.g. ScrollToTop's trackPageView on first
 * mount) queues up properly. The actual gtag.js script download is deferred
 * until after the page `load` event + one idle callback — this moves the
 * ~156 kB gtag script completely off the critical rendering path, which was
 * measured as the single largest unused-javascript offender on /, /contact,
 * /profile, and /insights (86 kB wasted per page in Lighthouse). Events
 * pushed to `dataLayer` before the script loads are processed once it
 * arrives, so no tracking is lost.
 */
export function initAnalytics(): void {
  if (!isEnabled || typeof document === 'undefined') return;

  // Shim: dataLayer queue + gtag function. Must be synchronous so
  // trackPageView() calls made during initial render are queued.
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag(...args: unknown[]) {
    window.dataLayer!.push(args);
  };
  window.gtag('js', new Date());
  window.gtag('config', GA_ID, { send_page_view: false });

  // Defer the actual script download until the browser is idle after load.
  if (document.readyState === 'complete') {
    scheduleIdle(injectGtagScript);
  } else {
    window.addEventListener(
      'load',
      () => {
        scheduleIdle(injectGtagScript);
      },
      { once: true }
    );
  }
}

// Track page views on route changes
export function trackPageView(path: string): void {
  if (!isEnabled || !window.gtag) return;
  window.gtag('event', 'page_view', { page_path: path });
}

// Track CTA clicks
export function trackCtaClick(location: string): void {
  if (!isEnabled || !window.gtag) return;
  window.gtag('event', 'click_cta_email', { event_label: location });
}

// Track blog post views
export function trackBlogView(postId: string | number, category?: string): void {
  if (!isEnabled || !window.gtag) return;
  window.gtag('event', 'view_blog_post', { post_id: postId, category });
}

// Track dark mode toggle
export function trackDarkModeToggle(isDark: boolean): void {
  if (!isEnabled || !window.gtag) return;
  window.gtag('event', 'toggle_dark_mode', { is_dark: isDark });
}

// Track language switch
export function trackLanguageSwitch(language: string): void {
  if (!isEnabled || !window.gtag) return;
  window.gtag('event', 'switch_language', { language });
}

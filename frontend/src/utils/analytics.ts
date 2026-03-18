import env from '../config/env';

const GA_ID = env.GA_TRACKING_ID;
const isEnabled = env.ENABLE_ANALYTICS && !!GA_ID;

// Initialize Google Analytics by injecting the gtag script
export function initAnalytics(): void {
  if (!isEnabled || typeof document === 'undefined') return;

  // Inject gtag.js script
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
  document.head.appendChild(script);

  // Initialize dataLayer and gtag
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag(...args: unknown[]) {
    window.dataLayer!.push(args);
  };
  window.gtag('js', new Date());
  window.gtag('config', GA_ID, { send_page_view: false });
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

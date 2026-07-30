import type { Page, Locator } from '@playwright/test';

/**
 * Nav labels by language. The nav is driven by i18n, and the URL prefix picks the
 * language (`/` = Korean, `/en/` = English), so specs assert against the pair.
 */
export const NAV_LABELS = {
  ko: { menu: '메뉴', profile: '강의이력', blog: '인사이트', contact: '문의하기' },
  en: { menu: 'Menu', profile: 'Teaching History', blog: 'Insights', contact: 'Contact' },
} as const;

/**
 * Returns the nav landmark, opening the mobile sheet first when the profile is a
 * touch/narrow one.
 *
 * Two things make this necessary. Below `md` the desktop nav is `hidden md:flex`
 * and the links live behind a hamburger, so a bare visibility assertion fails on
 * the mobile profiles. And `handleNavigation` closes the sheet on every
 * navigation, so a multi-hop mobile flow has to reopen it before each click.
 *
 * Scoped to `nav[aria-label="Main navigation"]` because the footer's `메뉴 목록`
 * repeats the same labels and would trip Playwright strict mode. The mobile sheet
 * renders inside that same `<nav>`, so one scope covers both breakpoints.
 */
export const openNav = async (
  page: Page,
  isMobile: boolean | undefined,
  lang: 'ko' | 'en' = 'ko'
): Promise<Locator> => {
  const nav = page.getByLabel('Main navigation');
  if (isMobile) {
    await nav.getByRole('button', { name: NAV_LABELS[lang].menu }).click();
  }
  return nav;
};

/**
 * Dispatches a horizontal touch swipe across the target element.
 *
 * Playwright's `touchscreen` API only taps, so a swipe has to be synthesized. The
 * `Touch`/`TouchEvent` constructors are Chromium-only — WebKit raises
 * `TypeError: Illegal constructor` — so this builds a plain bubbling `Event` and
 * attaches `touches`/`changedTouches`. React reads those straight off the native
 * event when it builds its synthetic touch event, so handlers see the same shape
 * on every engine.
 *
 * @param dx Horizontal travel in px. Negative swipes left (forward).
 */
export const swipeHorizontal = async (target: Locator, dx: number): Promise<void> => {
  await target.evaluate((el, distance) => {
    const rect = el.getBoundingClientRect();
    const y = rect.y + rect.height / 2;
    const startX = distance < 0 ? rect.x + rect.width - 20 : rect.x + 20;

    const fire = (type: string, x: number, isEnd: boolean) => {
      const event = new Event(type, { bubbles: true, cancelable: true });
      const point = { clientX: x, clientY: y, identifier: 1, target: el };
      Object.defineProperty(event, 'touches', { value: isEnd ? [] : [point] });
      Object.defineProperty(event, 'changedTouches', { value: [point] });
      el.dispatchEvent(event);
    };

    fire('touchstart', startX, false);
    fire('touchend', startX + distance, true);
  }, dx);
};

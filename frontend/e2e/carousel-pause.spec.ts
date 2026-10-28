import { test, expect, type Page } from '@playwright/test';

const SECTIONS = [
  {
    name: 'logos',
    rows: '.animate-scroll, .animate-scroll-reverse',
    pause: /로고 롤링 일시정지|Pause logos/,
    play: /로고 롤링 재생|Play logos/,
  },
  {
    name: 'testimonials',
    rows: '.animate-scroll-testimonial, .animate-scroll-testimonial-reverse',
    pause: /후기 롤링 일시정지|Pause reviews/,
    play: /후기 롤링 재생|Play reviews/,
  },
] as const;

const playStates = (page: Page, selector: string) =>
  page
    .locator(selector)
    .evaluateAll((els) => els.map((el) => getComputedStyle(el).animationPlayState));

test.describe('Carousel pause control', () => {
  for (const section of SECTIONS) {
    test(`Tab reaches the ${section.name} button and Enter pauses both rows`, async ({ page }) => {
      await page.goto('/');
      const button = page.getByRole('button', { name: section.pause });
      await button.scrollIntoViewIfNeeded();

      let reached = false;
      for (let i = 0; i < 80 && !reached; i += 1) {
        await page.keyboard.press('Tab');
        reached = await button.evaluate((el) => el === document.activeElement);
      }
      expect(reached).toBe(true);

      expect(await playStates(page, section.rows)).toEqual(['running', 'running']);
      await page.keyboard.press('Enter');
      expect(await playStates(page, section.rows)).toEqual(['paused', 'paused']);
    });

    test(`the ${section.name} button pauses both rows by click`, async ({ page }) => {
      await page.goto('/');
      const button = page.getByRole('button', { name: section.pause });
      await button.scrollIntoViewIfNeeded();
      await button.click();
      expect(await playStates(page, section.rows)).toEqual(['paused', 'paused']);
    });
  }

  test.describe('with reduced motion', () => {
    test.use({ reducedMotion: 'reduce' });

    for (const path of ['/', '/en']) {
      test(`${path} loads with all four rows paused and a button starts its section`, async ({
        page,
      }) => {
        await page.goto(path);
        const all = SECTIONS.map((s) => s.rows).join(', ');
        // Sections load lazily; wait until all four rows are in the DOM.
        await expect(page.locator(all)).toHaveCount(4);
        expect(await playStates(page, all)).toEqual(['paused', 'paused', 'paused', 'paused']);

        for (const section of SECTIONS) {
          const button = page.getByRole('button', { name: section.play });
          await button.scrollIntoViewIfNeeded();
          await button.click();
          expect(await playStates(page, section.rows)).toEqual(['running', 'running']);
        }
      });
    }
  });
});

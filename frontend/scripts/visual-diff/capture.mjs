/**
 * Captures full-page Chromium screenshots of a served build, so that two builds
 * can be compared pixel by pixel with `compare.mjs`. The A/B method and the
 * measured noise floor are in the Tailwind section of
 * `.claude/rules/frontend-build.md`.
 *
 * Usage: node scripts/visual-diff/capture.mjs <outDir> <baseUrl>
 *
 * Every `staticRoutes` route in every language, plus /login, is captured in
 * light and dark at 390 and 1440 px as `<route>-<theme>-<width>.png` (`home`
 * for `/`, `en_contact` for `/en/contact`). Opt-in extras, set through env vars
 * only (never pass credentials through a file):
 *
 *   VISUAL_DIFF_BLOG_SLUG=<slug>  /insights/<slug>, saved as `post-*`
 *   VISUAL_DIFF_STATES=1          the 404 page, the service modal and, at 390 px,
 *                                 the open mobile menu (overlays: viewport only)
 *   VISUAL_DIFF_USERNAME and      sign in through /login once, then capture the
 *   VISUAL_DIFF_PASSWORD          editor at /insights/new, plus
 *                                 /insights/edit/<id> if VISUAL_DIFF_EDIT_ID is set
 */
import { createRequire } from 'node:module';
import { existsSync, mkdirSync, readdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { chromium } from 'playwright';

// The list prerender and the sitemap use, so this harness never becomes a fifth
// hardcoded route list next to the four `check:routes` cross-checks.
const require = createRequire(import.meta.url);
const { staticRoutes, LANGUAGES, DEFAULT_LANG } = require('../generate-sitemap.ts');

const THEMES = ['light', 'dark'];
const WIDTHS = [390, 1440];
// The noise floor in frontend-build.md was measured with this settle time.
const SETTLE_MS = 800;
const env = process.env;
const { VISUAL_DIFF_USERNAME: username, VISUAL_DIFF_PASSWORD: password } = env;

const [outArg, baseArg] = process.argv.slice(2);
if (!outArg || !URL.canParse(baseArg ?? '') || Boolean(username) !== Boolean(password)) {
  console.error('Usage: node scripts/visual-diff/capture.mjs <outDir> <baseUrl>');
  console.error('Sign-in needs both VISUAL_DIFF_USERNAME and VISUAL_DIFF_PASSWORD.');
  process.exit(2);
}
const outDir = resolve(outArg);
const baseUrl = new URL(baseArg).origin;
// Stale files would be compared as if this run had produced them.
if (existsSync(outDir) && readdirSync(outDir).some((file) => file.endsWith('.png'))) {
  console.error(`${outDir} already holds PNGs; capture into a new or empty directory.`);
  process.exit(2);
}
mkdirSync(outDir, { recursive: true });

const localize = (url, lang) => {
  const prefix = lang === DEFAULT_LANG ? '' : `/${lang}`;
  return url === '/' ? prefix || '/' : `${prefix}${url}`;
};
const shots = LANGUAGES.flatMap((lang) => staticRoutes.map(({ url }) => localize(url, lang)))
  .concat('/login')
  .map((path) => ({ name: path === '/' ? 'home' : path.slice(1).replaceAll('/', '_'), path }));
if (env.VISUAL_DIFF_BLOG_SLUG) {
  shots.push({ name: 'post', path: `/insights/${encodeURIComponent(env.VISUAL_DIFF_BLOG_SLUG)}` });
}
if (env.VISUAL_DIFF_STATES === '1') {
  shots.push(
    { name: '404', path: '/visual-diff-missing-page', status: 404 },
    {
      name: 'service-modal',
      path: '/',
      click: '#services [role="button"]',
      until: '[role="dialog"]',
    },
    {
      name: 'mobile-menu',
      path: '/',
      click: 'nav[aria-label="Main navigation"] button[aria-controls="mobile-menu"]',
      until: '#mobile-menu',
      widths: [390],
    }
  );
}
if (username) {
  shots.push({ name: 'editor-new', path: '/insights/new', auth: true });
  if (env.VISUAL_DIFF_EDIT_ID) {
    const id = encodeURIComponent(env.VISUAL_DIFF_EDIT_ID);
    shots.push({ name: 'editor-edit', path: `/insights/edit/${id}`, auth: true });
  }
}

const newContext = async (browser, theme, width, storageState) => {
  const context = await browser.newContext({
    viewport: { width, height: 900 },
    deviceScaleFactor: 1,
    reducedMotion: 'reduce',
    colorScheme: theme,
    locale: 'ko-KR',
    timezoneId: 'Asia/Seoul',
    storageState,
  });
  // index.html's inline script and UIContext read localStorage `theme` first and
  // fall back to prefers-color-scheme, so both are set.
  await context.addInitScript((value) => {
    try {
      localStorage.setItem('theme', value);
    } catch {
      // Storage blocked: colorScheme still selects the same theme.
    }
  }, theme);
  return context;
};

/** Signs in once through the real form; the session cookies are reused per context. */
const signIn = async (browser) => {
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto(`${baseUrl}/login`, { waitUntil: 'networkidle' });
  await page.locator('#email').fill(username);
  await page.locator('#password').fill(password);
  await page.locator('button[type="submit"]').click();
  await page
    .waitForURL((url) => url.pathname !== '/login', { timeout: 15_000 })
    .catch(() => {
      throw new Error('sign-in failed: still on /login after 15 s');
    });
  const state = await context.storageState();
  await context.close();
  return state;
};

const capture = async (page, shot, file) => {
  const response = await page.goto(baseUrl + shot.path, { waitUntil: 'networkidle' });
  const status = response?.status();
  if (shot.status ? status !== shot.status : !response?.ok()) throw new Error(`HTTP ${status}`);
  // Set by AppLayout and LoginPage once React has rendered, as prerender.ts waits.
  await page.waitForFunction(() => window.__appLoaded === true, undefined, { timeout: 15_000 });
  if (shot.click) {
    await page.locator(shot.click).first().click();
    await page.locator(shot.until).waitFor();
  }
  await page.evaluate(async () => {
    await document.fonts.ready;
  });
  await page.waitForTimeout(SETTLE_MS);
  // An editor route without a session lands on /login; never save it as the editor.
  const landed = decodeURIComponent(new URL(page.url()).pathname);
  if (landed !== decodeURIComponent(shot.path)) throw new Error(`landed on ${landed}`);
  await page.screenshot({
    path: file,
    fullPage: !shot.click,
    animations: 'disabled',
    caret: 'hide',
  });
};

const browser = await chromium.launch();
const failures = [];
let captured = 0;
try {
  const storageState = username ? await signIn(browser) : undefined;
  for (const theme of THEMES) {
    for (const width of WIDTHS) {
      const plain = await newContext(browser, theme, width);
      const signedIn = storageState && (await newContext(browser, theme, width, storageState));
      const group = shots.filter((shot) => !shot.widths || shot.widths.includes(width));
      for (const shot of group) {
        const file = `${shot.name}-${theme}-${width}.png`;
        const page = await (shot.auth ? signedIn : plain).newPage();
        try {
          await capture(page, shot, join(outDir, file));
          captured++;
        } catch (err) {
          failures.push(`${file}: ${err.message.split('\n')[0]}`);
        } finally {
          await page.close();
        }
      }
      await plain.close();
      await signedIn?.close();
      console.log(`  ${theme} ${width} px: ${group.length} shots`);
    }
  }
} finally {
  await browser.close();
}

console.log(`Captured ${captured} of ${captured + failures.length} screenshots into ${outDir}`);
for (const failure of failures) console.error(`  failed: ${failure}`);
if (failures.length > 0) process.exitCode = 1;

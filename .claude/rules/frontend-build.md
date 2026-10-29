---
paths:
  - 'frontend/nginx.conf'
  - 'frontend/index.html'
  - 'frontend/package.json'
  - 'frontend/vite.config.ts'
  - 'frontend/tailwind.config.*'
  - 'frontend/postcss.config.*'
  - 'frontend/scripts/**'
  - 'frontend/e2e/**'
  - 'frontend/playwright.config.ts'
  - 'frontend/lighthouserc.js'
  - 'frontend/src/**'
  - 'scripts/deploy/auto-deploy.sh'
---

<!-- Path-scoped rule: loads on reading the frontend build, prerender, nginx, E2E, CSP config files above, or any frontend source file (SEO, KakaoTalk and Tailwind rules apply across `frontend/src`). Moved verbatim from the root CLAUDE.md `Constraints` section on 2026-10-17; Gotcha numbers cited here are root CLAUDE.md's. -->

# Frontend build rules

**SEO**: `main.tsx` uses `createRoot()` (never `hydrateRoot`). Do NOT add static meta/title/OG to `index.html` — `SEOHelmet` handles everything. `SEOHelmet` auto-computes canonical from `location.pathname` — do NOT pass a `url` prop (English pages get wrong canonical). Untranslated content passes `translated={false}`: canonical goes to the Korean URL on both paths, no hreflang. For blog posts that prop and `generate-sitemap.ts` (en URL + hreflang, or ko only) follow the API's `is_translated`, true only when `title_en`, `description_en` and `content_html_en` are all filled and the Korean title/description/`content_html` still match `translation_source_hash` (a Korean edit withdraws the English page until re-saved or re-confirmed in Django admin); `utils/localizePost.ts` swaps those fields in on `/en`. Page titles must NOT include `| 에멜무지로` suffix (appended automatically).

**KakaoTalk WebView**: `window.__appLoaded` must be set in `AppLayout` (router layout), NOT at provider level. iOS uses `kakaotalk://web/openExternal`; Android uses `intent://...#Intent;scheme=kakaotalk;end`. Android WebView is Chrome-based, so the banner is hidden; only error fallback uses the intent scheme.

**SSG prerender + nginx routing**: `scripts/deploy/auto-deploy.sh` runs `npm run build`, which invokes `frontend/scripts/prerender.ts` (`scripts/prerender.ts` in the build script, run from `frontend/`) to generate `build/<path>/index.html` for **10 routes** (5 static × ko/en). Five non-obvious couplings:

- **`location /` in `frontend/nginx.conf` is `try_files $uri $uri/index.html =404`.** Explicit `$uri/index.html`, NOT `$uri/`: directory lookup triggers nginx's auto-301 trailing-slash append, which downgrades `https://` to `http://` via `absolute_redirect`. `=404` (not an `/index.html` fallback) prevents soft-200s for unknown URLs.
- **Routes prerender does not cover fall back to `/app.html`, never `/index.html`.** The dynamic blog posts `/insights/:slug`, admin `/insights/new` and `/insights/edit/:id`, and standalone `/login` match the regex `location ~ ^/(en/)?(insights/.+|login)$`.
  - `app.html` is the pristine Vite shell the `build` script copies from `index.html` **before** prerender overwrites it with the homepage snapshot. It is also the `error_page 404` document and `internal` (a direct GET is `404`).
  - Falling back to `/index.html` would ship the homepage `<title>`, canonical and `robots` in every blog post's raw HTML, and Google requires a JS-set canonical to equal the original's. `app.html` carries none, so only the JS-injected tags exist (#514).
  - Guards: `prerender.ts` exits `1` without it, `auto-deploy.sh` refuses to publish a staging dir without it, and `e2e/seo.spec.ts` asserts those routes' raw bytes carry zero `data-prerendered-seo` markers and that a direct `/app.html` is `404`.
  - **When adding a new dynamic route to `App.tsx`, update this regex in BOTH `frontend/nginx.conf` and `frontend/scripts/e2e-server.ts`** — nginx 404s it in production, the E2E server in tests, and `npm run check:routes` fails CI on either omission. Each `e2e-server.ts` rule cites its nginx counterpart.
- **The route list is `staticRoutes` in `frontend/scripts/generate-sitemap.ts`; a static page added to `App.tsx` but not there ships a hard 404.** `prerender.ts` imports it by name (`import { staticRoutes, LANGUAGES, DEFAULT_LANG } from './generate-sitemap.ts'`), so one array feeds both `sitemap.xml` and the prerender pass.
  - Why: no `build/<path>/index.html` exists and the SPA-fallback regex doesn't match, so `try_files … =404` fires on a real page and the sitemap omits it, while prerender still prints `Prerendered 10/10 routes` (it counts only the routes it was handed) (#397).
  - **`npm run check:routes`** (`frontend/scripts/check-route-lists.ts`, in `Repo Checks (informational)` after `Setup Node.js`, node builtins only, run by Node's native type stripping) cross-references all four hardcoded route lists — `App.tsx`, `staticRoutes`, `e2e/seo.spec.ts`, `lighthouserc.js` — so this fails CI instead of shipping. Deliberately SPA-only routes live in its `NOT_PRERENDERED` map, asserted against `App.tsx` so an exception cannot outlive its route.
  - It also asserts `nginx.conf` and `e2e-server.ts` carry the byte-identical SPA-fallback pattern and runs it against one URL per `App.tsx` route in both languages: every non-prerendered route must match (else `=404`), no prerendered route may (regex locations beat `location /`). nginx is never executed (#515).
- **Prerender reads the live API, and an API failure fails the build.** `/insights` and `/en/insights` list posts; the page's own cross-origin call fails CORS from the prerender server's `127.0.0.1` origin, so both would ship "Failed to load posts" + "Coming soon" as raw HTML, a Search Console `Soft 404` (#552).
  - Sitemap generation also fails on API errors, missing pages, duplicate slugs or changing totals, and never replaces the article inventory with static routes alone. Test: `node --test frontend/scripts/test-generate-sitemap.ts` from the root (also the `Test sitemap generation` PR step).
  - `prerenderRoute` relays cross-origin `/api/` requests through `route.fetch()` with CORS headers for its own origin and throws on any `>= 400` or network error; same-origin `/api` (`build:e2e`) is not intercepted.
  - A deploy while the API is down aborts and keeps the previous build live; the client re-fetches the post list on load.
- **Chromium is a build dependency, not an E2E-only one.** `prerender.ts` calls `chromium.launch()`: without the browser `vite build` succeeds and prerender dies, which reads like a build bug. `scripts/deploy/auto-deploy.sh` runs `npx playwright install chromium` before build (idempotent), so a Playwright dependabot bump cannot break the next deploy.
  - The error also misdirects: `~/Library/Caches/ms-playwright` is **machine-global, shared across projects**, so another project's newer Playwright can leave a revision this pin rejects, and Playwright blames the package ("Looks like Playwright was just installed or updated"). `npx playwright install chromium` fixes it without removing the other revision (6735d23f).

**Cloudflare owns the http→https upgrade; nginx must never redirect by scheme.** "Always Use HTTPS" (SSL/TLS → Edge Certificates) is on (696dc26c), and behind the tunnel nginx sees `http` on every request, https ones included. An origin-side `return 301 https://…` loops forever, and every `return 301` needs `absolute_redirect off` with a relative target, or nginx writes `http://` into `Location` (`aaa521be`). Verify with `curl -sI` against production; `e2e-server.ts` always emits relative locations.

- **HSTS is `max-age=604800`, with no `includeSubDomains` or `preload` (one day from 2026-10-23, one week from 2026-10-29).** nginx adds it for `emelmujiro.com` in every header block, and Django's `SecurityMiddleware` adds it for `api.emelmujiro.com`, the only host where `is_secure()` is true. A cached policy cannot be withdrawn early, so raise `max-age` in steps (`docs/intents/infra/hsts.md`).

**E2E target: the Playwright suite serves the production build, not the dev server.** `playwright.config.ts` `webServer` runs `npm run build:e2e && npm run serve:build`; `frontend/scripts/e2e-server.ts` mirrors `nginx.conf` (try_files, the dynamic-route SPA fallback, trailing-slash / `/blog` / `/share` 301s, `error_page 404 /app.html`, `/api` proxy).

- `vite preview` is **not** a substitute — its SPA fallback answers `/contact` with `build/index.html`, so every prerendered route silently serves the homepage snapshot.
- The build must be `build:e2e`, not `build`: a plain production build inlines `VITE_API_URL=https://api.emelmujiro.com/api/` and calls the live backend (Gotcha #18).
- `reuseExistingServer` keeps the rebuild off the iteration loop — leave `npm run serve:build` running in another shell.
- `webServer.stdout` stays `'pipe'`: Playwright drops it by default and `concurrently` relays the sitemap and tsc steps there, so a failed `build:e2e` would show only `exit 1` (#670, #671).

**Lighthouse never audits a prerendered document.** `frontend/lighthouserc.js` collects via `startServerCommand: npx vite preview --port 4173` — the substitute the E2E rule rejects — so all four configured URLs receive the homepage document and every score describes the **hydrated SPA**, not what a crawler gets.

- Scores still differ per route (Lighthouse audits the final DOM), so this reads as working, but a regression only in a prerendered document (a missing `SEOHelmet` tag, a route absent from `staticRoutes`) is invisible to Lighthouse CI.
- **The LHCI config must stay JavaScript (`lighthouserc.js`), the one tracked JS file left.** `@lhci/utils` loads only `.js`/`.cjs`, YAML and JSON, so TypeScript is not an option either. The root `overrides` give `@lhci/cli` `js-yaml` 4.3.2 (GHSA-hp3w-g68c-fv3c), and `@lhci/utils` parses `.yml`/`.yaml` with `safeLoad`, which js-yaml 4 stubs to throw, so a YAML config fails with `Function yaml.safeLoad is removed in js-yaml 4` (#627).
- **Do not "just re-point" `startServerCommand` at `serve:build`** as a drive-by: it re-baselines every `assert` threshold and every figure under `Baselines` in `.private/journal.md`, so it needs its own before/after (`/contact` best-practices drops below the `0.9` warn floor against the correct server, from the Google Form iframe's third-party cookies; `6dccdb3c`).
- **To compare served documents by hash, two traps.** Against production, normalize first: Cloudflare Email Obfuscation rewrites `contact@emelmujiro.com` with a fresh key per response (`sed -E 's/data-cfemail="[0-9a-f]*"/data-cfemail="X"/g; s#email-protection\#[0-9a-f]*#email-protection\#X#g'`). And include controls: a non-prerendered route (`/login`, `/insights/<slug>`, `/en/login`) must hash to the `app.html` shell and differ from `/`, and an unknown path must be a hard `404`. Ten distinct hashes for the ten routes is healthy; every route hashing to the shell is a broken prerender (106856ab).

**CSP is defined twice and must stay in sync**: `nginx.conf` (production) + `index.html` meta tag (dev/fallback); the `stripLocalhostCsp` Vite plugin strips `localhost:8000`/`127.0.0.1:8000` from the meta-tag CSP at production build.

- `'unsafe-inline'` required (inline scripts: error handler, KakaoTalk detection, theme detection). `'unsafe-eval'` removed after `plugin-legacy` removal.
- `data:` is **not** in `script-src` (XSS-narrowing); stays in `img-src` for base64 SVG icons.
- `frame-ancestors 'none'` in nginx header (meta tag ignores it per spec) complements `X-Frame-Options: DENY`.
- Cloudflare Web Analytics is **disabled** — `cloudflareinsights.com` must NOT appear in `script-src`/`connect-src`.

**Tailwind 4.x, kept rendering like the v3 site** (#628, `f1040650`; v4's browser floor, Safari 16.4 / Chrome 111 / Firefox 128, was accepted): PostCSS uses `@tailwindcss/postcss` (no autoprefixer); `src/index.css` imports `tailwindcss` with `source(none)` plus explicit `@source`/`@source not` lines (test files must not emit utilities) and loads `tailwind.config.mts` through `@config` (`@tailwindcss/node` tries a native `import()` first and falls back to `jiti` only if it throws; `.mts` because `frontend/package.json` has no `"type"`, #709), which keeps the theme, class-based dark mode and the typography plugin. Never use dynamic class interpolation (`bg-${color}-600`).

- **Parity shims that must stay unless a redesign is intended**: `tailwind.config.mts` pins the v3 hex palette for the 7 families in use (`v3Colors`) and the v3 `prose` color variables (`v3ProseColors`, because `@tailwindcss/typography` reads `tailwindcss/colors` directly); `index.css` restores v3's border color, placeholder color, button cursor and 1px table-cell padding, and keeps the input focus rules in `@layer utilities` so specificity, not layer order, decides them against `focus:ring-*`. Hover is no longer pinned to v3: `hover:` and `group-hover:` follow v4's `@media (hover: hover)`, so a touch-screen tap leaves no hover style behind, and CI cannot reproduce the sticky state (#641). The carousel pause is a hand-written `.group:hover` rule outside that query, with its own JS touch path.
- **v4 traps measured in this migration**: a base `leading-*` now beats a responsive `text-*` (v3 let the later `sm:text-*` line-height win — write the responsive `leading` explicitly); `space-y-*` puts margin on the previous sibling, so a child's own `mt-*` now collapses with it; `bg-opacity-*` emits nothing (use `/NN`); `outline-none` is `outline-hidden`, `shadow-sm` is `shadow-xs`; gradients interpolate in oklab unless written `bg-linear-to-*/srgb`. The 7 fixed `px` arbitrary size values (height and min-size; `text-[10px]` and `text-[11px]` are font sizes) (`min-h-[136px]`, `min-h-[280px]`, `min-h-[400px]`, `min-w-[18px]`, `min-w-[200px]`, `h-[2px]`, `h-[18px]`) stay px on purpose: the linter's suggested `rem` rewrite would scale them with the reader's font size. The `semver-major` ignore in `dependabot.yml` now holds back v5.
- **Measure parity with `frontend/scripts/visual-diff/`, never by eye, before any palette, shim or shared-style change ships.** (#639, `f7a6f825`) No baseline images are committed (rendering differs across machines); capture both sides on one machine in one session, with `<outDir>` outside the repo.
  - **Capture**: from `frontend/`, `npm run visual:capture -- <outDir> <baseUrl>` takes full-page Chromium screenshots of every `staticRoutes` route in both languages plus `/login`, light and dark, at 390 and 1440 px. Opt-in post, overlay and signed-in states: `capture.ts`'s header.
  - **Compare**: `npm run visual:compare -- <dirA> <dirB> [--out <diffDir>] [--max-ratio <r>]` compares each pair per channel with no tolerance and exits `1` when an image changes by more than `--max-ratio` (default `0`), changes size or exists on one side only.
  - **A/B**: build both refs with `npm run build:e2e` (the base in a second worktree), serve them with `E2E_PORT=4180` and `E2E_PORT=4181 npm run serve:build`, then capture both and compare.
  - **A local backend is optional**: without one, `build:e2e` still prerenders all 10 routes and each API-driven view renders the same error state on both sides. The sitemap step still reads the production API (`API_URL` defaults to `https://api.emelmujiro.com/api`) and aborts on failure. Signing in needs a backend behind both servers with `CSRF_TRUSTED_ORIGINS="http://127.0.0.1:4180,http://127.0.0.1:4181"` (`DEBUG` adds only Vite's `:5173`), else `/api/auth/login/` answers `403` (#642).
  - **Noise floor**: two captures of one build differed in 3 of 44 screenshots by at most 0.002451% of pixels, each by 1/255, inside the contact pages' Google Form iframe (#639). Capture the base twice and treat as real only what that pair does not show, or pass `--max-ratio 0.00005`, which also passes a real change under 0.005% of the image (316 px on the 1440 × 4394 home page).

**Bundle size**: Build output must be < 10MB (enforced in `pr-checks.yml`). Check large dep impact with `npm run analyze:bundle`.

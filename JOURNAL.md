# JOURNAL.md

Project journal — non-invariant project context that doesn't belong in
CLAUDE.md. Holds rigorously-recorded past events plus forward-looking
backlog so future sessions (human or Claude) can pick up where the last
one left off. Invariant rules belong in CLAUDE.md; design rationale and
failure patterns belong in `.claude/rules/strategy.md`.

---

## Backlog

Actionable work identified in prior sessions but deliberately deferred.
Each entry states **Goal**, **Why**, **How**, **Verify**, and **Effort**
so another engineer (or a future Claude session) can pick it up without
reading history. Items resolved in a session should be removed in the
same commit that closes them.

### Replace Google Form with `backend/api/contact/`

- **Goal**: `/contact` best-practices 0.78 → ≥ 0.90 and remove the
  third-party cookie warnings.
- **Why**: The Google Form iframe ships `S`, `COMPASS`, `NID` cookies and
  triggers our own CSP report-only `frame-ancestors 'self'` violation on
  every load — these are the two line items dragging the `/contact`
  best-practices score. `backend/api/contact/` already exists and is
  fully tested (`ContactView` at `backend/api/views.py:363`, URL at
  `backend/api/urls.py:58`, reCAPTCHA flow, spam keyword check, rate
  limit). CLAUDE.md "Contact" explicitly notes the endpoint is preserved
  for exactly this swap.
- **Prereq**: Gmail SMTP must be configured on Mac mini first — uncomment
  and set `EMAIL_HOST_USER` + `EMAIL_HOST_PASSWORD` (Gmail app password)
  in `backend/.env.production`. Without this, `send_mail()` fails and
  the contact form returns 500.
- **How**:
  - Build a simple controlled `<form>` in `ContactPage.tsx` posting via
    `api.createContact()` (need to add the helper to `services/api.ts`).
  - Preserve reCAPTCHA client integration (`VITE_RECAPTCHA_SITE_KEY` env
    var; backend already validates server-side).
  - Delete `<iframe src={GOOGLE_FORM_URL}>`, the `iframeLoaded` state,
    and the `frame-src https://docs.google.com` CSP exception in
    `index.html` and `nginx.conf`.
  - Update i18n copy for success/error toasts to match the existing
    patterns from other mutation endpoints.
  - Ratchet `categories:best-practices` from `warn` to `error` in
    `lighthouserc.js` once `/contact` score clears 0.90.
- **Verify**: Lighthouse `/contact` `categories.best-practices` ≥ 0.90,
  `third-party-summary` audit no longer mentions `docs.google.com`, a new
  Playwright e2e test submits the form end-to-end against a running
  backend.
- **Effort**: 2–3 h including UX polish and i18n.

---

## Mechanical Enforcement

### knip (Dead Code Detection)

- Installed at root level (`npm run knip`)
- Config: `knip.config.ts`
- Detects: unused files, unused exports, unused dependencies, duplicate exports
- Run periodically or before large refactors to prevent entropy accumulation

### Existing Enforcement

- ESLint: `no-unused-vars` (via `@typescript-eslint`)
- Pre-commit: lint-staged (Husky) — ESLint, Black, Prettier
- CI: lint + type-check + test (100% coverage) + bundle size < 10MB + security scan + Lighthouse
- CI gates added during 2026-04-11 rigor pass: cron log redirect path, Django test log isolation, i18n unused keys via `scripts/check-i18n-keys.sh --strict`

### Not Yet Automated

- Unused CSS class detection

## Session History

### 2026-04-15

Large rigor pass — 15+ commits across security, docs, CI, and performance.

- **Security — nginx scanner blocking** (`7a0aab1`): AI credential scanners were hitting `/.openai/config.json`, `/.claude/settings.json`, `/.aws/credentials`, `/mcp.json` and getting 200 + SPA index.html (fallback), which reads as "successful probe" to the scanner. Added three nginx rules: `location ^~ /.well-known/` (prefix wins over regex, preserves legitimate .well-known), `location ~ /\.` (catch-all dotfile block returning 444), and `location ~* ^/(mcp|credentials|keys)\.json$` (non-dotfile AI config probes).
- **Script silent-failure hardening** (`99e1a81`): `update-test-counts.sh` was updating README with a passing-count from _failing_ vitest/Django runs because `FOO=$(cmd)` inside `set -e` doesn't propagate exit codes. Fixed with `if ! FOO=$(cmd)` wrappers. Same pattern in `auto-deploy.sh` (reporting "Deploy completed" after health-check timeouts → now exits 1). `start-dev.sh` blind-copied `.env.example` to `backend/.env` with placeholder SECRET_KEY → now errors out and directs to `make setup-dev-machine`. CLAUDE.md Gotcha #11 added (`bd8cb56`) to document the `set -e`/command-substitution trap for future shell work.
- **Orphan removal** (`4a8ab9d`): `scripts/pre-deploy-check.sh` (269 lines) and `frontend/Dockerfile` both had zero callers after rigorous grep across Makefile, package.json, CI workflows, husky, other scripts, and docs. Production frontend is `nginx:alpine` + bind-mount of `./frontend/build`; dev uses `Dockerfile.dev`. Plain `Dockerfile` was never migrated to a reference.
- **Dead config removal**: `vite.config.ts` + `vitest.config.ts` had `resolve.tsconfigPaths: true` (`84c0c95`) — not a valid Vite `resolve` option (it's the `vite-tsconfig-paths` plugin, which is not installed). Silently ignored. Path resolution works via the `alias: { '@': ... }` entry next to it. `backend/pyrightconfig.json` (`f4ebf5b`) had `venvPath: "../"` resolving to project root where no `.venv` exists; `backend/.venv/` is the real location. Changed to `venvPath: "."`.
- **Docs consolidation**: README `Development` section (9 lines) removed (`af05eae`) — duplicated operational rules from CLAUDE.md and Conventional Commits list from CONTRIBUTING.md, violating CLAUDE.md's "README has a brief summary pointing here. Do NOT duplicate these sections back into README." One-line CLAUDE.md pointer added to Getting Started instead. `SECRETS-TEMPLATE.md` → `SECRETS.md` (`8c512e7`): `-TEMPLATE` suffix wrongly signaled "copy and fill in" when the file is a secrets catalog + operational procedures doc.
- **JOURNAL unification** (`01c4db8`): merged gitignored local `NOTES.md` + tracked `.github/TODO.md` into a single tracked `JOURNAL.md`. Asymmetry (one local, one tracked) broke the two-device dev workflow — session log was visible only on the device that wrote it. `.github/TODO.md` §2–4 (content marketing plan, mentoring-history consideration, privacy-policy legal-review note) removed entirely as personal/business planning that shouldn't live in a public repo.
- **`.private/strategy.md` untrack** (`7712086`): `.gitignore` had `.claude/` for local-only intent but `strategy.md` was carried as tracked through `fd9c3e3` untrack → `87f3d33` re-add. Moved to `.private/strategy.md` (new gitignored dir whose name makes intent self-enforcing), added `.private/` to `.gitignore`, `git rm`'d old path. Pre-this-commit history retains earlier versions on GitHub — not removed via history rewrite (CLAUDE.md branch-protection rationale forbids force push to main).
- **CI — README drift gate expansion** (`8a0ffcb`): `pr-checks.yml` `check_badge()` grew from 7 to 14 entries so `TypeScript`, `Tailwind_CSS`, `Typography`, `Framer_Motion`, `TipTap`, `DOMPurify`, `Testing_Library` are now also validated against `frontend/package.json` on every PR. Scoped packages (`@*/*`) work because bash expands `$pkg` into the JS string literal inside `node -e`. Same commit drops dead `--passWithNoTests` from the `affected-tests` job (1217 tests exist — never applies).
- **CI — Codecov GPG composite action** (`e619254`): `frontend-test` and `backend-test` had identical 5-line GPG-import blocks. Extracted to `.github/actions/setup-codecov/action.yml` so the fingerprint `27034E7FDB850E0BBC2C62FF806BB28AED779869` lives in one place — single point of rotation.
- **Performance — /insights CLS fix** (`9be9352`): CLS 0.260 root cause was conditional `posts.length > 0 && (search + categoryFilter)` block in `BlogListPage` — async fetch populated `posts` which then _inserted_ the filter block above the posts grid, pushing everything down. Wrapped in `<div className="min-h-[136px]">` so vertical space is reserved regardless of load state. Also added explicit `width={1600} height={1000}` on `BlogCard` `<img>` tags — parent `aspect-[16/10]` CSS already reserved space, but Lighthouse's CLS audit flags img without HTML dimension hints.
- **Performance — SSG prerender enabled in production** (`9323cbe` + `dad1082`): `auto-deploy.sh` was using `npm run build:no-prerender`, so every route shipped the same base `index.html`. Changed to `npm run build` (with `npx playwright install chromium` for idempotency). Regression immediately exposed: prerender creates `build/<route>/index.html` directories per route, and `try_files $uri $uri/ /index.html` triggered nginx's built-in directory-slash 301 redirect that downgrades `https://...` to `http://...` (nginx `absolute_redirect` default uses the listen-directive scheme). Fix: `try_files $uri $uri/index.html /index.html` — explicit file lookup, no directory redirect.

Measured impact (localhost preview with prerender):

| URL         | Perf (before→after) | CLS (before→after) |
| ----------- | ------------------- | ------------------ |
| `/`         | 0.79 → 0.88         | — → 0.000          |
| `/contact`  | 0.58 → 0.88         | 0.528 → 0.000      |
| `/profile`  | 0.58 → 0.88         | 0.528 → 0.000      |
| `/insights` | 0.66 → 0.91         | 0.260 → 0.014      |

Production `/profile` verified independently at Performance 0.89 / SEO 1.00 / CLS 0.0000 — localhost measurement reproduced in production.

- **Vite chunk consolidation**: `vite.config.ts` `manualChunks` now matches `node_modules/react-router/` in addition to `react-router-dom/`. react-router-dom@7 runtime-depends on the separate react-router (core) package; without the extra match, the core ended up in a default vendor chunk (`chunk-QFMPRPBF`, 29 KB gzip) — consolidated into `react-vendor` for one fewer HTTP request.
- **Failed experiment — CSS non-blocking rewrite**: Attempted to move main Vite-injected CSS and Pretendard CDN CSS to the Filament Group `media="print" + onload="this.media='all'"` pattern. `render-blocking-resources` audit went 0.5 → 1.0, but **CLS regressed from ~0 to 0.40–0.60 on all pages** because the post-load `media='all'` swap triggers a full repaint with Pretendard metrics, causing text reflow — the whole reason render-blocking CSS _existed_ in the first place. Reverted in the same session; kept a comment in `prerender.js` explaining why the obvious fix is wrong. The correct fix requires inlining critical CSS at build time or self-hosting a Pretendard subset with explicit `font-display: optional` + matched fallback metrics — left as backlog.
- **`generate-sitemap.js` refactor**:
  - `SITE_URL` fallback reads `package.json` `"homepage"` instead of hardcoding the URL a second time (removes drift risk).
  - Blog posts now fetched from `https://api.emelmujiro.com/api/blog-posts/` at build time and included as `/insights/:slug` entries (5 static × 2 langs + 2 blog × 2 langs = 14 URLs after this change). Soft-fails to static-only when backend is unreachable so builds on dev machines without network still work.
  - `sitemap-index.xml` generation removed — a sitemap index is only meaningful for multi-sitemap setups (>50k URLs); for a single 14-URL sitemap it was redundant with `robots.txt`'s `Sitemap:` directive pointing at `sitemap.xml`. Generator also cleans up stale `sitemap-index.xml` from prior builds for idempotency.
- **SEO — hreflang alternate deduplication** (`8646358`): Every `/en/*` route + `/privacy` emitted 6 hreflang alternates instead of 3 (two sets, one pointing at homepage URLs, one at the correct route URLs). Root cause suspected in a react-helmet-async / lazy-loading interaction where SEOHelmet renders twice with different basePath states during prerender; not pinned down because the second render's source couldn't be isolated. Workaround in `prerender.js`: after helmet cleanup, dedupe `link[rel="alternate"][hreflang]` by keeping only the last tag per `hreflang` value. Verified on all 10 prerendered routes — each now has exactly 3 alternates (ko, en, x-default) all pointing at the correct URLs. Google Search Console was already flagging this as "alternate page with proper canonical tag" on `/profile/`.
- **SEO — soft 404 prevention** (`3336935`): `try_files $uri $uri/index.html /index.html` on the main nginx location meant every unknown URL returned HTTP 200 + SPA shell. Google's crawler indexed garbage URLs like `/cdn-cgi/l/email-protection` this way (which the `/cdn-cgi/` explicit 404 block caught later, but only reactively). Restructured nginx routing:
  - New `location ~ ^/(en/)?(insights/.+|login)$` explicitly handles SPA-fallback-required routes (dynamic blog posts, admin editor, login pages) with `try_files $uri /index.html`.
  - Main `location /` now uses `try_files $uri $uri/index.html =404` — no fallback to `/index.html`, so unknown paths outside the SPA regex return 404.
  - `error_page 404 /index.html` serves the SPA shell with HTTP 404 status, so React Router's catch-all (`{ path: '*', element: <NotFound /> }`) renders the localized NotFound UI while network-visible status stays 404. Verified: `/this-does-not-exist` → 404 (was 200), prerendered routes and dynamic routes still 200, `/cdn-cgi/` still 404.
- **GSC sitemap resubmission**: sitemap cached at 10 URLs on Google's side (pre-refactor state). Resubmitted via GSC after the sitemap now includes blog post URLs — GSC re-read sitemap and confirmed 14 URLs detected. Next: wait 1–2 weeks for natural recrawl + indexing of the new `/insights/:slug` entries; past "redirect errors" from the pre-2026-04-02 canonical bug should auto-resolve as Google recrawls.

### 2026-04-02

- Fixed SEO canonical URL bug (all pages hardcoded Korean canonical, breaking English page indexing)
- Installed knip for dead code detection
- Removed unused packages: `@tiptap/extension-dropcursor`, `@types/dompurify`
- Removed unused export: `ToastState` from `useToast.ts`
- Created this file (originally as `NOTES.md`)

### 2026-04-11

- **Cron cleanup chain**: Fixed stale `scripts/cleanup-sitevisits.sh` crontab entry on Mac mini (script had been absorbed into `make cleanup-visits` back in `9611358`). Routed `make setup-cron` logs into `backend/logs/` (was `/tmp`), hardcoded absolute docker path via `command -v docker` to survive cron's minimal PATH, verified end-to-end by firing a real test cron via daemon.
- **CI gates added**: cron log redirect path drift (pr-checks.yml), Django test log isolation (main-ci-cd.yml).
- **Django test log pollution fix**: `settings.py` LOGGING now routes file handlers to NullHandler when `sys.argv[1] == "test"`. 170+1978 lines of pure test pollution truncated from `backend/logs/{security,debug}.log` (no real production entries lost).
- **Scripts dedup**: `scripts/check-i18n-keys.sh` absorbed CI's `DYNAMIC_SECTIONS` template literal detection + `--strict` flag. `pr-checks.yml` now calls the script instead of duplicating logic inline.
- **GitHub Pages cleanup**: Branch `gh-pages` deleted, Pages disabled, `.nojekyll` removed, deploy-to-Pages job and related permissions/concurrency removed from `main-ci-cd.yml`. Self-hosted via Mac mini + Cloudflare Tunnel is the only path now.
- **Config prune**: Removed 4 dead variables from `frontend/.env.production` (`VITE_API_TIMEOUT`, `VITE_ENV`, `VITE_ENABLE_DEBUG_MODE`, `VITE_SITE_URL` — all runtime-hardcoded in `api.ts`/`constants.ts`). Removed orphan `.github/.npmrc` (wrong location for npm) and `backend/scripts/deploy.sh` (0 references). Fixed `Makefile clean` to use `frontend/build/*` per CLAUDE.md constraint.
- **Security hardening pass**: CVE patches (axios 1.15, Django 6.0.4, pygments 2.20), X-Forwarded-For IP spoofing guard in `get_client_ip()`, shared `sanitizeBlogHtml` helper with `FORBID_ATTR: ['style']`, 17 real-DOMPurify XSS tests, NullHandler isolation for Django tests, JSDOM worker race workaround (vitest forks pool in CI).
- **Phase 3 code quality pass**: `BlogComments` `CommentItem`/`ReplyItem` memoized, middleware false-positive guards (5 tests), `NotificationContext` cursor moved to `useRef`, `AuthContext` useEffect inlined, JWT refresh-failure fallback test, `SkeletonLoader` shallow assertions strengthened (5 tests toHaveStyle/toHaveClass), `BlogListPage` inline onClick refactored to data-slug + single handler, `LoginPage` error clear moved from effect to onChange handlers (removes eslint-disable-next-line), 3 of 5 `exhaustive-deps` suppressions removed after verifying context callbacks are stable. 2 suppressions retained: `ServicesSection`/`ProfilePage` `[i18n.language]` — documented false positive (ESLint can't reason about react-i18next's reactive getter).

## Baselines

### Lighthouse (2026-04-11, localhost preview desktop)

Local `npx @lhci/cli autorun` run produced baseline scores that are ABOVE CI's hard-error thresholds (CI categories are `warn` for performance/best-practices, `error` only for accessibility/seo at the category level) but well below the aspirational 0.85/0.9 targets. CI passes these as warnings; the underlying issues are real and worth tracking.

| URL         | Performance | Category notes                                                                     |
| ----------- | ----------- | ---------------------------------------------------------------------------------- |
| `/`         | 0.79        | dom-size 0.5, render-blocking 0, unused-js 0, legacy-js 0.5, total-byte-weight 0.5 |
| `/contact`  | 0.58        | best-practices 0.74, CLS **0.528**, console errors, inspector issues               |
| `/profile`  | 0.58        | CLS **0.528**, unused-js 0, render-blocking 0, legacy-js 0.5                       |
| `/insights` | 0.66        | CLS 0.260, console errors, unused-js 0, render-blocking 0                          |

Cross-URL individual audits failing:

- `color-contrast` (0) — real accessibility issue, 4/4 URLs
- `label-content-name-mismatch` (0) — a11y, 4/4 URLs
- `legacy-javascript` (0.5) — modern browsers receiving ES5 polyfills
- `unused-javascript` (0) — significant dead code shipped
- `render-blocking-resources` (0) — CSS/JS blocking first paint
- `total-byte-weight` (0.5) — payload over budget

Caveats: measured on localhost preview (no Cloudflare CDN, no nginx gzip). Production scores are likely 5–15% higher on each category. Directionally all findings are real and not measurement artifacts.

Fix priority for a future session (each is its own investigation):

1. **CLS on /contact (0.528)** — Google Form iframe pushing content down on load. Fix: see Backlog.
2. **unused-javascript / total-byte-weight** — run `source-map-explorer` to find the largest dead code (Sentry is already lazy-loaded via `sentry-impl.ts` shim).
3. **render-blocking-resources** — inline critical CSS, defer non-critical.

Resolved (2026-04-12/13 sessions):

- ~~color-contrast~~ — `text-gray-400` → `text-gray-500` on blog cards (`715902e`)
- ~~legacy-javascript~~ — Vite target set to `es2022`, GA removed, CI gate set to `error`
- ~~CLS on /profile~~ — padding-based layout, no longer 0.528

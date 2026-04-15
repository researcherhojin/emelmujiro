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

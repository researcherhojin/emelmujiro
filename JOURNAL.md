# JOURNAL.md

Project journal for context that doesn't fit CLAUDE.md's invariant scope.
Three sections, each carrying information `git log` cannot:

- **Backlog** — forward work deliberately deferred, with enough detail to
  pick up cold
- **Baselines** — time-fixed measurements so future sessions can compare
  without re-running
- **Session History** — only non-obvious items (failed experiments,
  cross-commit stories, external-system state changes). Routine commits
  are tracked in `git log --oneline`, not duplicated here.

Invariant rules → `CLAUDE.md`. Design rationale + LLM failure patterns →
`.private/strategy.md` (gitignored).

---

## Backlog

### Replace Google Form with `backend/api/contact/`

- **Goal**: `/contact` best-practices 0.78 → ≥ 0.90, remove third-party
  cookie warnings.
- **Why**: Google Form iframe ships `S`, `COMPASS`, `NID` cookies and
  triggers `frame-ancestors 'self'` CSP violations — the two line items
  dragging `/contact` best-practices. `backend/api/contact/` already exists
  fully tested (`ContactView` at `backend/api/views.py:363`, reCAPTCHA,
  spam check, rate limit).
- **Prereq**: Gmail SMTP needs `EMAIL_HOST_USER` + `EMAIL_HOST_PASSWORD`
  (Gmail app password) in `backend/.env.production`. reCAPTCHA also needs
  `RECAPTCHA_PUBLIC_KEY` + `RECAPTCHA_PRIVATE_KEY`. Neither is currently set.
- **How**: Build a controlled `<form>` in `ContactPage.tsx` posting via
  `api.createContact()` (add helper to `services/api.ts`), preserve
  `VITE_RECAPTCHA_SITE_KEY` client integration, delete iframe + the
  `frame-src https://docs.google.com` CSP exception in `index.html` +
  `nginx.conf`, update i18n toast copy, ratchet `lighthouserc.js`
  `categories:best-practices` `warn` → `error` once score clears 0.90.
- **Verify**: `/contact` Lighthouse best-practices ≥ 0.90,
  `third-party-summary` audit no longer mentions `docs.google.com`, new
  Playwright e2e submits the form end-to-end against a running backend.
- **Effort**: 2–3 h after external prereqs are provisioned.

### Inline critical CSS

- **Goal**: `render-blocking-resources` Lighthouse audit 0.5 → ≥ 0.9 on
  all four measured URLs.
- **Why**: Pretendard CDN CSS (~222ms) + Vite-injected main CSS (~86ms)
  block first paint. Naive fix (Filament Group `media="print" + onload
swap`) was tried 2026-04-15 and regressed CLS from ~0 to 0.40–0.60 on
  every page — post-load media swap repaints with Pretendard metrics and
  reflows text. See `JOURNAL.md` Session History "Failed CSS non-blocking
  rewrite" for evidence and `prerender.js` comment warning against
  retrying the same approach.
- **How**: Either a build-time critical CSS plugin (`beasties`, `critters`)
  that inlines above-the-fold CSS and defers the rest, OR self-host a
  Pretendard subset with `size-adjust` / `ascent-override` / `descent-override`
  metrics matched to the system fallback font so swap doesn't reflow.
- **Verify**: `render-blocking-resources` ≥ 0.9 AND CLS stays < 0.05 on
  `/`, `/contact`, `/profile`, `/insights` via `npx @lhci/cli autorun`.
- **Effort**: 3–4 h including verification cycle.

### hreflang root cause (remove prerender.js dedup workaround)

- **Goal**: Fix SEOHelmet at source so prerendered HTML emits exactly 3
  hreflang alternates per route without the dedup patch.
- **Why**: 2026-04-15 fix (`8646358`) added a dedup pass in `prerender.js`
  because `/en/*` + `/privacy` emitted 6 alternates (doubled). Root cause
  is suspected react-helmet-async + lazy-loading interaction where
  SEOHelmet renders twice with different `basePath` states during the
  prerender snapshot, but the exact trigger wasn't pinned down during
  initial investigation.
- **How**: Instrument SEOHelmet render with a counter + basePath log,
  run prerender, identify the two render paths. Likely one of: stale
  closure in a memoized child, i18n language-change effect triggering a
  second render before route-specific render settles, or an
  `index: true` route briefly mounting alongside the matched route.
- **Verify**: Delete the dedup block in `prerender.js`, rebuild, confirm
  all 10 prerendered routes still emit exactly 3 alternates.
- **Effort**: Unknown — investigation-heavy, could be 30 min to 3 h.

### Reduce ui-vendor unused-javascript (~62 KB)

- **Goal**: `unused-javascript` Lighthouse audit 0 → ≥ 0.9 on `/` and
  other non-admin pages.
- **Why**: 2026-04-15 lhci autorun showed ~62 KB wasted bytes across
  all four measured URLs, concentrated in `ui-vendor` (framer-motion +
  lucide-react). Framer-motion's `motion.*` proxy imports a large HTML
  element registry even when only `motion.article` / `motion.div` are
  used. Lucide v1 tree-shakes named imports but some usage patterns
  (e.g., dynamic `<Icon />` via props) pull in more than needed.
- **How**: (a) audit `framer-motion` call sites — replace `motion.div`
  - animate-on-mount patterns with CSS transitions where no gesture
    tracking is needed; (b) switch `lucide-react` imports from
    `import { X } from 'lucide-react'` to per-icon paths
    (`import X from 'lucide-react/dist/esm/icons/x'`) which is the
    recommended pattern for strict tree-shaking. Some files might not
    need either library at all — `npm run knip` may surface dead imports.
- **Verify**: `ui-vendor` chunk gzip size drops, lhci `unused-javascript`
  score ≥ 0.9 on `/` and `/profile`.
- **Effort**: 2–3 h — mostly grep + benchmark-per-change iterations.

### Unused CSS class detection

- **Goal**: Automated audit for Tailwind classes shipped in `build/assets/*.css`
  but never referenced in source.
- **Why**: Tailwind's content scanning is usually accurate, but template
  literal patterns (`bg-${color}-600`) or dead files can ship classes
  that never match. `knip` doesn't cover CSS.
- **How**: Script parsing the CSS AST for selectors, grep source for
  each, report unmatched. Could be a `frontend/scripts/check-css.js`
  similar in shape to `scripts/check-i18n-keys.sh`.
- **Effort**: 1–2 h.

---

## Baselines

### Lighthouse (2026-04-15, post-optimization)

Desktop preset, 3 runs each via `npx @lhci/cli autorun` on localhost
`vite preview`, plus production `/profile` spot-check via
`npx lighthouse https://emelmujiro.com/profile`.

| URL         | Performance       | CLS   | SEO  | BP   | A11y |
| ----------- | ----------------- | ----- | ---- | ---- | ---- |
| `/`         | 0.88              | 0.000 | 1.00 | 0.96 | 1.00 |
| `/contact`  | 0.88              | 0.000 | 0.95 | 0.74 | 1.00 |
| `/profile`  | 0.88 (prod: 0.89) | 0.000 | 1.00 | 0.96 | 1.00 |
| `/insights` | 0.91              | 0.014 | 0.92 | 0.96 | 1.00 |

Pre-optimization baseline (2026-04-11, for reference): Performance
0.58–0.79, CLS 0.260–0.528 on non-homepage routes. Main driver of the
improvement was SSG prerender enablement in production (commit chain
`9323cbe` → `dad1082` → `3336935`).

Known remaining lab audits (tracked in Backlog, do not affect SEO
ranking):

- `render-blocking-resources` 0.5 on all URLs (Pretendard CDN + main CSS)
- `unused-javascript` 0, ~62 KB savings (largely ui-vendor framer-motion
  - lucide tree-shaking imperfection)
- `/contact` `third-party-cookies` failing (Google Form iframe, see Backlog)

---

## Session History

Non-obvious items only. Routine commits live in `git log`.

### 2026-04-15 — Rigor pass + SSG prerender

Full-day session, 26 commits across security / docs / CI / performance /
SEO. Individual commit summaries are in `git log --since=2026-04-14
--until=2026-04-16 --oneline`. What's captured here is the cross-cutting
stories `git log` fragments:

- **SSG prerender enablement + nginx regression + fix chain**. Production
  `auto-deploy.sh` was using `build:no-prerender`; switched to full `build`
  (with `npx playwright install chromium` for idempotency — the Mac mini
  already had Chromium cached). Immediate regression: prerender creates
  `build/<route>/index.html` directories, and nginx `try_files $uri $uri/
/index.html` triggered a directory-slash 301 with `https → http`
  downgrade (nginx `absolute_redirect` uses the listen-scheme, not
  `X-Forwarded-Proto`). Fixed via `$uri/index.html` explicit file lookup.
  Then added soft-404 prevention: main location uses `=404`, SPA-fallback
  regex `^/(en/)?(insights/.+|login)$` handles dynamic routes,
  `error_page 404 /index.html` serves React Router's `NotFound` with
  real 404 status. Three chained commits: `9323cbe` → `dad1082` →
  `3336935`.
- **Failed experiment: CSS non-blocking rewrite**. Moved Pretendard + main
  CSS to Filament Group `media="print" + onload="this.media='all'"` pattern.
  `render-blocking-resources` 0.5 → 1.0 but CLS regressed from ~0 to
  0.40–0.60 on every page — post-load media swap triggers a full repaint
  with Pretendard metrics, reflowing text. Reverted same session;
  `scripts/prerender.js` has a comment explaining why the obvious fix is
  wrong so this isn't retried blindly. See Backlog "Inline critical CSS"
  for the correct approach.
- **hreflang alternate dedup workaround** (`8646358`). Every `/en/*` route
  - `/privacy` emitted 6 hreflang alternates (doubled, one set pointing at
    homepage URLs). Root cause is suspected react-helmet-async + lazy-loading
    interaction but wasn't isolated. Workaround: dedupe
    `link[rel="alternate"][hreflang]` in `prerender.js` after helmet
    cleanup, keep the last tag per hreflang value. Tracked in Backlog for
    proper fix.
- **GSC sitemap resubmission**. Google's cached sitemap had 10 URLs
  (pre-refactor state). After `generate-sitemap.js` refactor adding blog
  posts (5 static × 2 langs + 2 blog × 2 langs = 14 URLs), resubmitted
  via GSC → "Sitemaps"; GSC confirmed 14 URLs detected. Expect 1–2 weeks
  for natural recrawl + indexing of new `/insights/:slug` entries; past
  "redirect errors" from the pre-2026-04-02 canonical bug should
  auto-resolve as Google recrawls.
- **Google Form UX refactor + privacy policy sync** (`0cc1d4a`). Rebranded
  `/contact` Google Form from "온라인 미팅 신청" to "에멜무지로 무료 상담
  신청", split "성함/기관명" combined field into separate required 성함 +
  optional 소속/기관명, realigned 상담 분야 options to match site Services
  (교육/컨설팅/개발/멘토링/기타), kept dual email (Google-auto + optional
  reply-to) per user's rigor — submitter's Google login email can
  legitimately differ from their preferred reply address. Also synced
  `privacy.dataCollection` and `privacy.delegation` in ko/en i18n to
  match actual form schema and disclose Google LLC as a PIPA §26
  processor (previously only Sentry was listed — mismatch with actual
  data flow). Effective date bumped 2026-04-05 → 2026-04-15.

### 2026-04-11 — CI gates + security hardening pass

Multi-commit pass covering cron-log path drift CI gate, Django test-log
pollution fix via `NullHandler`, i18n unused-key `--strict` mode,
GitHub Pages cleanup (deleted `gh-pages` branch, removed Pages-related
jobs from `main-ci-cd.yml`), CVE patches (axios 1.15, Django 6.0.4,
pygments 2.20), `X-Forwarded-For` IP spoofing guard in `get_client_ip()`,
JSDOM worker-race workaround (vitest forks pool in CI), Phase 3 code
quality pass (memoization, stable callbacks, `exhaustive-deps`
suppressions reduced 5 → 2). Detail in
`git log --since=2026-04-10 --until=2026-04-12 --oneline`.

### 2026-04-02 — SEO canonical fix + knip install

All pages hardcoded the Korean canonical URL, which broke English page
indexing (Google saw canonical pointing to `/foo` from `/en/foo` → treated
as alternate). Fixed so each page sets its own route's canonical. Also
installed `knip` for dead code detection (`npm run knip`). Created this
file originally as `NOTES.md`.

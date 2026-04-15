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

### Inline main CSS via critical-CSS plugin (optional follow-up)

- **Context**: 2026-04-16 Pretendard fix already took the
  `render-blocking-resources` audit from 0.5 → 1.0 on all four measured
  URLs. Main CSS wasn't being flagged — Vite's module preload ordering
  keeps it off the critical path in practice. This is therefore a
  _follow-up_ ticket: revisit only if the audit regresses or LCP needs
  the extra headroom.
- **If revisiting**: first integration attempt with `beasties` inlined
  the CSS but left the original `<link rel="stylesheet">` alongside the
  preload variant (so the audit didn't improve) and added 20–50 KB to
  every per-route HTML. Reasonable path forward: either patch beasties
  config to actually replace the source link, or skip the plugin and
  handwrite a small critical stylesheet covering nav + hero + section
  layouts, inlined in index.html. Keep CLS < 0.05 as a hard gate (the
  2026-04-15 failed experiment shows why: losing above-the-fold styles
  at first paint makes text reflow on CSS arrival).

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

- `render-blocking-resources` — cleared 2026-04-16 (0.5 → 1.0 on all
  URLs) via Pretendard non-blocking preservation in prerender.
- `unused-javascript` — partially addressed 2026-04-16 via framer-motion
  removal (ui-vendor 133 KB → 13 KB). Rerun lhci to refresh this figure.
- `/contact` `third-party-cookies` failing (Google Form iframe, see Backlog)

---

## Session History

Non-obvious items only. Routine commits live in `git log`.

### 2026-04-16 — render-blocking-resources 0.5 → 1.0 via Pretendard fix

- Lighthouse was flagging the Pretendard CDN stylesheet as render-
  blocking even though `index.html` already uses the non-blocking
  Filament pattern (`rel="preload"` + `onload="this.rel='stylesheet'"`).
  Root cause: during prerender, Playwright actually downloads the
  stylesheet and fires `onload`, which rewrites `rel` to `"stylesheet"`
  before `page.content()` captures the HTML. The prerendered files
  therefore shipped the post-load mutated markup — a plain blocking
  `<link rel="stylesheet">` — so every real browser visit paid the ~220
  ms load blocking FCP. Fix: re-apply the source-of-truth attributes
  (`rel="preload"` + `as="style"` + original onload) for any
  pretendardvariable link in the captured DOM just before HTML capture,
  skipping the `<noscript>` fallback copy.
- Measured impact (lhci autorun, 1 run, desktop preset):
  `render-blocking-resources` score went from 0.5 → 1.0 on `/`,
  `/contact`, `/profile`, and from 0 → 1.0 on `/insights`. CLS stays at
  0 on all four (no font-swap reflow regression like the 2026-04-15
  experiment). Performance score unchanged at 0.87–0.88 — FCP/LCP saw
  ~20-50 ms improvement, within measurement noise.
- Beasties integration was also explored (full inline + defer for main
  CSS) but left the original `<link rel="stylesheet">` alongside the
  new preload and added 20–50 KB per prerendered route without moving
  the audit score. Dropped the dependency; moved the remaining main-CSS
  inline work to Backlog as an optional follow-up with the lessons
  learned recorded there.

### 2026-04-16 — Remove framer-motion (ui-vendor 133 KB → 13 KB)

- framer-motion's only call sites were `UnifiedLoading.tsx` (spinner,
  dots, pulse, inline, fade-up-on-mount for the spinner message) and
  `BlogCard.tsx` (entrance fade-up on mount). All of these are mount-
  time or infinite loops — no gesture tracking, no layout animations —
  so they map cleanly to Tailwind keyframes. Added `fade-up`,
  `fade-up-sm`, `fade-up-delay`, `dot-bounce`, `scale-pulse` to
  `tailwind.config.js`; existing `animate-spin` covers the rotation
  variants. Staggered dot animation uses inline `style={{
animationDelay }}`.
- Dropped the dependency from `package.json`, removed the 80-line
  `framer-motion` global mock from `setupTests.ts`, removed the
  Framer_Motion badge from README + the pr-checks badge gate, and
  removed framer from the `ui-vendor` chunk rule in `vite.config.ts`.
  Updated CLAUDE.md Bundle-Splitting note to reflect the new chunk
  content and point future changes at the Tailwind keyframes.
- Result: `ui-vendor` 133 KB → 12.85 KB raw (gzip ~40 KB → ~5 KB), and
  LogosSection is now the only chunk above 40 KB raw on the homepage.
  All 1217 Vitest tests still pass; lint and type-check clean.

### 2026-04-16 — Unused CSS detection + Tailwind content exclusion

- Added `frontend/scripts/check-css.js` (`npm run check:css`) — parses
  shipped `build/assets/*.css` with PostCSS, walks class selectors, greps
  source under `src/` + `index.html`, reports classes emitted without any
  literal reference. Exits non-zero on unused so it can gate CI later.
  Initial run surfaced `isolate` and `lowercase` as "unused" — both
  caused by Tailwind's content scanner matching those literal words in
  test-file comments (`// Mock child components to isolate Layout behavior`,
  `'should have slugs in lowercase kebab-case'`). Fixed by excluding test
  paths from Tailwind's `content` config (`__tests__/**`, `*.test.*`,
  `setupTests.ts`, `test-utils/**`) so test-only tokens don't enter the
  production bundle. After rebuild: 690 classes scanned, 0 unused.

### 2026-04-16 — hreflang root cause

- **hreflang alternates: React 19 hoisting accumulation root cause.**
  Prior session's workaround (`8646358`) deduped `link[rel="alternate"]`
  in `prerender.js` post-render without isolating why they multiplied.
  Instrumented prerender with a `MutationObserver` on `document.head`:
  captured every hreflang add/remove across the render lifetime. Found
  two separate drivers of accumulation — (1) SEOHelmet re-renders when
  `t()` resolves or i18n language changes on `/en/*`, and (2)
  react-helmet-async v3's `React19Dispatcher` renders `<link>` tags as
  plain React children relying on React 19's automatic head-hoisting.
  React 19 hoists and dedupes `<title>` by tag name and
  `<link rel="canonical">` by `rel`, but multiple
  `<link rel="alternate">` tags with matching rel and differing
  hreflang/href are each treated as a distinct resource — old hoisted
  nodes are never removed on re-render, so alternates accumulate. Fix:
  move the three hreflang tags out of `<Helmet>` entirely and manage
  them imperatively via a `useEffect` in SEOHelmet (clears
  `link[data-seohelmet-hreflang]` then appends fresh nodes on each
  `koUrl/enUrl` change). Prerender dedup workaround removed from
  `scripts/prerender.js`, all 10 prerendered routes verified to emit
  exactly 3 alternates with correct URLs. Added Vitest regression
  asserting the injected set.

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
    cleanup, keep the last tag per hreflang value. Root cause isolated
    and workaround removed 2026-04-16 — see that session's entry.
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

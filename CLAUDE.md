# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Full-stack monorepo (React 19 + Django 6) deployed on Mac Mini via Docker + Cloudflare Tunnel.

- **Frontend**: http://localhost:5173 (Vite, NOT port 3000). Build output: `build/` (NOT `dist/`). Import alias `@` → `src/`
- **Backend**: http://localhost:8000. Single app: `api/`. Uses **uv** (NOT pip)
- **Dev proxy**: Vite proxies `/api` → `http://127.0.0.1:8000` (no CORS issues in dev)
- **Node ≥ 24**, **Python 3.12** required. Husky pre-commit runs lint-staged automatically

> Design rationale and LLM failure patterns live in a local-only `.private/strategy.md` (gitignored) on this repo's maintainer devices. It is intentionally not published — past git history (pre-`01c4db8`) retains earlier versions for reference.

> **CLAUDE.md is the single source of truth** for operational rules. README has a brief summary pointing here. Do NOT duplicate these sections back into README.

## Commands

All `npm run` frontend commands run from `frontend/`. Root-level `npm run dev` runs both servers.

```bash
npm run dev                # Frontend + Backend (from root)
npm run dev:clean          # Kill ports first, then start both (from root)
npm run build              # sitemap → tsc → vite build → cp 404.html (from frontend/)
npm run build:no-prerender # Same but skips prerender step (from frontend/)
npm run validate           # lint + type-check + test:coverage (from frontend/)
CI=true npm test -- --run src/components/common/__tests__/Navbar.test.tsx  # Single test
npm run test:e2e           # Playwright E2E (from frontend/). Also: test:e2e:ui, test:e2e:debug
npm run type-check         # tsc --noEmit (from frontend/)
npm run analyze:bundle     # source-map-explorer (from frontend/, requires build first)
npm run check:css          # detect CSS classes shipped in build but never referenced in src/ (from frontend/, requires build first)

npm run knip                   # Dead code detection (unused files, exports, deps). Run from root
uv sync --extra dev                    # Install backend deps (NOT --dev). Run from backend/
uv run python manage.py test           # Django unittest (NOT pytest). Needs DATABASE_URL=""
uv run python manage.py test api.tests.CategoryAPITestCase.test_list  # Single backend test
uv run black . && uv run flake8 .      # Format + lint (line length 120)

# Make shortcuts (run from root):
# make install          # npm install + uv sync --extra dev
# make dev              # Docker dev servers (start-dev.sh)
# make dev-local        # Local dev (npm run dev — no Docker)
# make dev-clean        # Kill ports first, then local dev
# make test             # Frontend + backend concurrently (concurrently)
# make test-ci          # CI mode (no watch, with coverage report)
# make lint / lint-fix  # Check / auto-fix both frontend + backend
# make build            # docker compose build
# make down / restart   # Stop / restart Docker services
# make logs             # docker compose logs -f
# make logs-security    # Backend security.log (auth, IP blocks, rate limits)
# make logs-debug       # Backend debug.log (requests, errors)
# make ps               # Docker service status
# make migrate          # Run Django migrations in Docker
# make shell            # Django shell in Docker
# make createsuperuser  # Create admin user in Docker
# make clean            # Remove build artifacts + __pycache__
# make cleanup-visits DAYS=90  # Delete old SiteVisit records
# make setup-cron       # Install daily 3 AM SiteVisit cleanup cron
# make health            # Docker health diagnostic (containers, resources, endpoints, errors)
# make setup-health-cron # Install 5-min health check cron (logs failures to backend/logs/)
# make update-test-counts     # Run Vitest/Django and rewrite README test counts (use when count drift fails CI)
```

## Architecture

System shape: providers, data flow, routing, and module boundaries.

**i18n routing**: Korean default (no prefix: `/profile`), English `/en/profile`. Internal links must use `useLocalizedPath` hook — never raw `navigate()`/`<Link>`. Non-React data files must use getter functions (not module-level constants) so `i18n.t()` resolves at call time.

**Provider order** (in `App.tsx`): HelmetProvider → ErrorBoundary → UIProvider → AuthProvider → NotificationProvider → BlogProvider → RouterProvider.

**Auth**: JWT via httpOnly cookies (not localStorage). `auth_hint` flag in localStorage prevents 401 spam — if unset, `getUser()` is skipped on mount.

**State management**: React Context only — `UIContext` (theme/sidebar), `AuthContext` (JWT user), `BlogContext` (posts/categories), `NotificationContext` (alerts). No Redux or external state libraries.

**API layer**: `services/api.ts` (Axios) with interceptors for JWT refresh. Mock API uses `mockResponse<T>(data, status?, statusText?)` helper to avoid boilerplate. Tests stub HTTP via `vi.mock('axios')` in individual test files — there is **no** MSW server. (A `test-utils/mocks/` MSW scaffold existed for years but was never wired into `setupTests.ts`; removed in the 2026-04-11 stability sweep along with the `msw` and `terser` packages — both dead-but-installed deps that generated dependabot churn.)

**Bundle splitting**: 7 vendor chunks in `vite.config.ts` — `react-vendor`, `ui-vendor` (framer-motion, lucide), `i18n`, `sentry` (lazy-loaded via `sentry-impl.ts` re-export shim — 0 bytes on homepage), `http-vendor` (axios), `dompurify`, `tiptap` (prosemirror, lowlight). When adding large dependencies, consider whether they belong in an existing chunk or need a new one.

**Blog**: Dual fields `content` (plain text/search) + `content_html` (TipTap HTML). Category API cached 1 hour (key: `"blog_categories"`), invalidated on CRUD/toggle-publish. DRF router `basename="blog"` in `api/urls.py` (NOT `"blog-posts"`). All BlogPost fields use **snake_case only** — `description` (NOT `excerpt`), `date` (NOT `publishedAt`), `is_published` (NOT `published`), `view_count` (NOT `views`), `image_url` (NOT `imageUrl`). Backend serializer has no camelCase aliases. Frontend routes use `/insights/:slug` (NOT `/blog`); `BlogPostViewSet` uses `lookup_field = "slug"`. Backend API stays at `/api/blog-posts/` (internal). Nginx 301 redirects: `/blog/*` → `/insights/*`. BlogCard links to `/insights/{slug}`. Comments still use numeric `post.id` (separate URL pattern `<int:post_pk>`).

**Contact**: Google Form iframe, not backend API — backend `/api/contact/` is preserved for future switch. Page uses same hero pattern as other pages (section label + font-black title + subtitle), with ContactInfo sidebar. Contact email `contact@emelmujiro.com` is used in `constants.ts`, i18n, backend settings, swagger, and `CONTRIBUTING.md` — update all 5 in lockstep. **When the Google Form schema changes (fields added/removed/retitled), update `privacy.dataCollection.content` in `ko.json` + `en.json` and bump the `2026-04-XX` effective date in `PrivacyPolicyPage.tsx` in the same commit** — PIPA Article 30 requires the published policy to match actual collection.

## UI Conventions

Page-level UX rules — copy, layout, and section structure. Change only when explicitly asked.

**Hero**: Centered layout, always dark-on-light / light-on-dark. No badge. Stats: 5,000+ hours, 50+ projects, 4.8+ satisfaction. CTA: "무료 상담 신청". No left-right grid — fully centered. Korean title uses "올인원 AI 파트너" (NOT "원스톱"). English CTA title: "Accelerate Your AI Journey". Mobile uses padding-based layout (`pt-32 pb-16`, no `min-h` or flex centering), desktop uses `sm:min-h-screen` + `sm:flex sm:items-center sm:justify-center`.

**Homepage section order**: Hero (white/dark) → Logos (gray) → Services (white) → Testimonials (gray) → CTA (white). Alternating backgrounds for visual rhythm. Logos before Services — social proof before value proposition. Testimonials before CTA — customer proof before conversion.

**Scroll carousels**: All carousels use `w-max` on the animated flex container — required for `translateX` percentage to calculate against total content width (not viewport). LogosSection and TestimonialsSection both use 2x copies with `translateX(-50%)` looping — math is `-((1/N) × 100%)` for N copies. Previously 3x/5x; reduced to keep homepage DOM node count under Lighthouse's 800-node threshold (`dom-size` audit). All use 32s on both desktop and mobile (unified speed). Mobile override in `index.css` (`max-width: 639px`) exists for future tuning. Gap between items must be on the item itself (`mx-2`/`px-8`), NOT `gap-*` on the flex container — otherwise the loop math breaks. Fade masks use `pointer-events-none` gradients matching section background. Hover pause via CSS `.group:hover .group-hover\:pause` + JS `touchstart`/`touchend` handlers (mobile touch-release resume). `prefers-reduced-motion: reduce` overrides in `index.css` keep carousels at their original speed instead of stopping — do NOT use `motion-reduce:!animate-none` on carousels (it kills animations on Windows where reduced-motion is often enabled by default). Both testimonial rows must have equal item counts to maintain equal visual speed at the same duration.

**TestimonialsSection**: Two rows of 8 each: enterprise training reviews (left scroll) + 고용노동부 K-디지털 reviews (right scroll, CV + startup mixed). Enterprise reviews use per-item source labels (e.g. "S사 반도체 엔지니어").

**ServicesSection**: Service cards are clickable — clicking opens `ServiceModal` (same modal used by Footer). Modal state is local to ServicesSection (not UIContext). Mobile: left/right nav arrows hidden (`hidden sm:block`), navigation via dot indicators only. English detail text must fit one line on mobile (~25 chars max).

**Teaching History page** (`/profile`): Replaced 4-tab profile (career/education/projects/timeline). Shows 35 teaching entries grouped by year (2026→2022) with alternating section backgrounds. Data uses end-client names as organization (삼성전자, not 엘리스). i18n keys: `teachingHistory.{0-37}.{org,title}`. `useMemo` depends on `i18n.language` for language switching. Items support `visibleAfter` date field for time-gated visibility; comment out entries in `profileData.ts` to temporarily hide them. **Filters**: OrgType pill buttons — 4 categories: `enterprise`(13), `moel`(7, 고용노동부 K-Digital), `public`(7, 정부·공공+연구), `academic`(8, 대학+교육기관). `OrgType` field on `TeachingItem` in `profileData.ts`. Filter labels: `teachingHistory.filter{All,Enterprise,Moel,Public,Academic}`.

**Nav order**: 강의이력 → 인사이트 (teaching history first, blog second). Footer menu label: "강의이력" (not "대표 프로필").

**Privacy policy page** (`/privacy`): 13 sections per Korean PIPA Article 30. Includes processing delegation (Sentry; Umami is self-hosted, no external delegation), safety measures (Art. 29), privacy officer (name/position/contact), remedies (KISA 118, KOPICO 1833-6972, prosecutors 1301, police 182). Table of contents with anchor links. Bilingual (ko/en). Footer link added.

**Mobile responsive pattern**: All page heroes use `pt-28 pb-12 sm:pt-32` padding-based layout (NOT `min-h` + flex centering on mobile). Text sizing: mobile `text-4xl`/`text-base`, tablet `sm:text-5xl`/`sm:text-lg`, desktop `md:text-7xl`/`md:text-xl` — three-step progression to avoid harsh 639→640px jumps. Section padding: `py-16 sm:py-32`. Use `break-keep` for Korean text to prevent mid-word breaks. For text that must break at specific points on mobile only, use `<br className="sm:hidden" />`. English i18n text must be shorter than Korean equivalents — abbreviate org names (MOEL, KALIS, KETI) and use `#` instead of "Cohort" for numbering. CTA subtitle uses `subtitleLine1`/`subtitleLine2` keys (not single `subtitle`) for controlled line breaks.

**Blog → Insights branding**: All user-facing text uses "인사이트"/"Insights" (not "블로그"/"Blog"). Section label: "INSIGHTS" (not "TECH BLOG"). Internal code still uses `blog` in component names, routes, and API paths — only i18n display text changed.

**Removed pages (do NOT re-add)**:

- **About page** — route, component file, lazy import, sitemap entry, prerender list, and StructuredData breadcrumb all deleted.
- **Share page** — no backend API existed, frontend-only with no real functionality. Nginx 301 redirects `/share` → `/` and `/en/share` → `/en`.
- **FAQSection** component — removed from homepage. Do NOT re-add or import. `faq` i18n keys also removed.

## Constraints

Build, runtime, and infrastructure rules. Violating these breaks deploys, security, or production.

**SEO**: `main.tsx` uses `createRoot()` (never `hydrateRoot`). Do NOT add static meta/title/OG tags to `index.html` — `SEOHelmet` handles everything. `SEOHelmet` auto-computes canonical URL from `location.pathname` — do NOT pass `url` props to `SEOHelmet` (it causes English pages to have wrong canonical). Page titles must NOT include `| 에멜무지로` suffix (appended automatically).

**KakaoTalk WebView**: `window.__appLoaded` must be set in `AppLayout` (router layout), NOT at provider level. iOS banner uses `kakaotalk://web/openExternal` scheme (NOT `window.open()`). Android uses `intent://` scheme with `#Intent;scheme=kakaotalk;end` suffix. Android WebView is Chrome-based so banner is hidden — only error fallback uses the intent scheme.

**Local dev vs Docker**: `npm run dev` runs local backend (`DEBUG=True`, SQLite, no throttle) + Vite. Docker runs production backend (`DEBUG=False`, throttle enabled). Don't run both — Docker backend occupies port 8000. For local development: stop Docker backend (`docker compose stop backend`) then `npm run dev`. Blog content in local SQLite and Docker DB are separate — changes to one don't affect the other.

**ENV file structure**: Root `.env` contains Docker Compose orchestration only (ports, tags, build flags — NO secrets). Backend app config is in `backend/.env` (local dev, loaded by `load_dotenv()`) and `backend/.env.production` (Docker production, loaded via `env_file` in docker-compose.yml). Both are gitignored. On new servers, create `backend/.env.production` from `backend/.env.example`.

**Deployment**: Never `rm -rf frontend/build` (breaks nginx volume mount) — use `rm -rf frontend/build/*`. Docker ports bound to `127.0.0.1` only. `SECRET_KEY` loaded via `env_file` — do NOT set in docker-compose `environment` section.

**SSG prerender + nginx routing**: `scripts/auto-deploy.sh` runs `npm run build` (not `build:no-prerender`) which invokes `scripts/prerender.js` to generate per-route `build/<path>/index.html` (10 routes: 5 static × ko/en). Two non-obvious couplings:

- `frontend/nginx.conf` `location /` uses `try_files $uri $uri/index.html =404` — the `$uri/index.html` (explicit file lookup), NOT `$uri/` (directory lookup), because directory lookup triggers nginx's auto-301 trailing-slash append that downgrades `https://` to `http://` via `absolute_redirect`. The `=404` (not `/index.html` fallback) is what prevents soft-404 soft 200s for unknown URLs.
- SPA-fallback routes that prerender does NOT cover (dynamic blog posts `/insights/:slug`, admin `/insights/new` and `/insights/edit/:id`, standalone `/login`) get an explicit regex `location ~ ^/(en/)?(insights/.+|login)$` that falls back to `/index.html`. **When adding a new dynamic route to `App.tsx`, update this regex as well** — otherwise the new route 404s in production.
- `scripts/auto-deploy.sh` runs `npx playwright install chromium` before the build. Idempotent (no-op if already cached on Mac mini) — the step exists so a Playwright browser upgrade via dependabot doesn't silently break the next deploy.

**Branch protection**: `main` has minimal protection enabled — `allow_force_pushes: false` + `allow_deletions: false`. **No** PR/status check/signing requirements (direct push to main is intentional for solo-dev hotfix workflow). Rationale: dev environment is two devices (Mac mini + MacBook), and the classic "rebase on stale local → force push → wipe the other device's commits" accident is much more likely in that setup because `git reflog` only lives on the device where the commits were made — recovery is hard when you're sitting at the wrong machine. Repo setting `delete_branch_on_merge: true` is also set so dependabot branches auto-clean. Disable temporarily for emergency rebase: `gh api repos/researcherhojin/emelmujiro/branches/main/protection --method DELETE` (then re-PUT the same minimal config after).

**Two-device dev bootstrap**: New macOS dev machines (or SSD recovery / second laptop) are set up via `make setup-dev-machine` (or `./scripts/setup-dev-machine.sh`). Idempotent, handles brew installs (`node@24`, `python@3.12`, `uv`, `gh`), gh auth check, local dev `.env` generation (per-machine random `SECRET_KEY` from `python -c 'secrets.token_urlsafe(50)'`), `make install`, Django migrations, optional Playwright (`--with-playwright`), and `git config --global pull.rebase true` + `rebase.autoStash true` for two-device safety. **Production secrets are intentionally NOT synced to dev machines** — `backend/.env.production` and `frontend/.env.production` exist only on Mac mini (the `auto-deploy.sh` source) and in GitHub Actions secrets. Principle of least privilege: a stolen/lost dev machine cannot leak production credentials. The script generates only `.env` (Docker orchestration, no secrets) and `backend/.env` (local Django with a random local `SECRET_KEY`, `DEBUG=True`); each device's local `SECRET_KEY` differs from every other device, which is correct because Django's `SECRET_KEY` is per-instance security material with no inter-device meaning. `make verify-setup` runs the standalone health check (10 checks: tools, dev .env files, deps, vitest smoke test, django check) — used by the script's Phase 9 and re-runnable any time. **Do NOT** add `backend/.env.production` or `frontend/.env.production` to the verify-setup check list — that would defeat the least-privilege design.

**Umami analytics**: Self-hosted at `localhost:3001` (Docker, not public). Tracking API proxied through nginx at `location = /umami/api/send` (exact match — dashboard not exposed, `access_log off` to suppress high-volume tracking noise). Secrets (`UMAMI_APP_SECRET`, `UMAMI_DB_PASSWORD`) in root `.env` (gitignored), required via `${VAR:?}` syntax. `umami-db` has `stop_grace_period: 30s` to prevent unclean PostgreSQL shutdown. Password reset: `docker compose down umami umami-db && docker volume rm emelmujiro_umami_db && docker compose up -d umami-db umami` (erases analytics data). See `.github/SECRETS.md`.

**Operational logs**: Cron jobs installed via Makefile targets (`make setup-cron`, `make setup-health-cron`) must redirect output to `$(CURDIR)/backend/logs/<name>.log` — matches Django `LOG_DIR` (`backend/config/settings.py:355`), already gitignored, persists via Docker `logs_volume`. Never `/tmp` (evaporates on reboot), `~/logs/` (outside project), or `/var/log/` (host-specific). Enforced by `pr-checks.yml` quick-checks grep — any `crontab` line with `>>` not targeting `backend/logs/` fails CI. `make health` runs an interactive Docker diagnostic (containers, resources, disk, endpoints, error logs).

**CSP**: `'unsafe-inline'` required — index.html inline scripts (error handler, KakaoTalk detection, theme detection). `'unsafe-eval'` removed after `plugin-legacy` removal. Cloudflare Tunnel does not require CSP changes (transparent proxy). Cloudflare Web Analytics (RUM beacon) is **disabled** — `cloudflareinsights.com` must NOT appear in CSP `script-src` or `connect-src` (removed from both `nginx.conf` and `index.html`). CSP is defined in two places that must stay in sync: `nginx.conf` line 58 (production) and `index.html` meta tag (dev/fallback).

**Tailwind 3.x**: PostCSS uses `tailwindcss: {}` (NOT `@tailwindcss/postcss`). Dark mode is `class`-based (not media query). Never use dynamic class interpolation (`bg-${color}-600`).

**Production keys**: `SECRET_KEY` and `RECAPTCHA_PRIVATE_KEY` raise `ImproperlyConfigured` if missing in production (DEBUG bypasses reCAPTCHA).

**Bundle size**: Build output must be < 10MB (enforced in `pr-checks.yml`). When adding large dependencies, check impact with `npm run analyze:bundle`.

**CI optimization**: `pr-checks.yml` uses `tj-actions/changed-files` to detect affected directories — frontend tests only run if `frontend/` changed, backend tests only if `backend/` changed. Trivy (`aquasecurity/trivy-action`) runs filesystem security scanning for dependency vulnerabilities on every PR. Workflow-level `permissions: contents: read` with job-level opt-in for write (least-privilege). `concurrency` group with `cancel-in-progress` on both PR and main workflows. All jobs have `timeout-minutes` (5–15). `auto-label.yml` auto-tags PRs by changed paths. `stale.yml` auto-closes inactive issues (90d) and PRs (60d).

**README drift gates**: Two CI guards keep README aligned with reality. (1) **Package badges** — 7 package badges are validated in `pr-checks.yml` quick-checks (compared to `package.json` on every PR); failing the gate blocks merge. (2) **Test counts** — auto-corrected via the `Sync Test Badges` job in `main-ci-cd.yml`. Test counts are passed as job outputs from `frontend-test` and `backend-test` (no test re-run — saves ~90s). The job sed-replaces counts in README and pushes with `[skip ci]`. The `scripts/update-test-counts.sh` script (used by `make update-test-counts`) is the local equivalent — it runs tests, substitutes, and exits non-zero if the expected README patterns are missing (loud fail). The README format the sed is coupled to: `Vitest (N tests) + Django unittest (N tests)` in the `**Tests** —` bullet line. Changing that substring breaks the sed; if changed intentionally, also update `scripts/update-test-counts.sh:48,50` sed patterns. **Do NOT use grep-over-test-files for Vitest counts** — `it.each([...])` rows expand into N tests at runtime, so grep undercounts. Operational rules live only in CLAUDE.md — README has a brief summary pointing here, not a verbatim mirror.

**Backend constants**: `api/constants.py` centralizes `ONE_HOUR`, `ONE_DAY`, `SPAM_KEYWORDS`, `SPAM_THRESHOLD`, `is_spam()`, and cache key constants (`CACHE_BLOG_CATEGORIES`, `CACHE_BLOG_POST_LIST`, `CACHE_ADMIN_STATS`). Do NOT re-define time constants or cache keys in views or middleware — import from here. `django-extensions` and `ipython` are dev-only dependencies (`uv sync --extra dev`).

**Backend utilities**: `api/utils.py` contains `get_client_ip()`, `_is_valid_ip()`, and `toggle_like()`. IP extraction is used by both views and middleware — import from utils, not views.

## Code Conventions

Cross-cutting rules for how code is written. Enforced by linters and CI where possible.

- **Conventional commits** required: `type(scope): description`. Allowed types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`, `deps`, `ci`.
- **Branch naming**: `feature/name` or `fix/description`.
- **ESLint flat config** (`eslint.config.mjs`, NOT `.eslintrc`). Zero warnings policy — CI fails on any warning.
- **English comments only** — no Korean comments in source.
- **All UI strings use i18n** — `useTranslation()` in components, `i18n.t()` in data files. No hardcoded user-facing text.
- **No `window.alert()` / `window.prompt()`** — use toast pattern or inline inputs.
- **Logger import**: `import logger from '../utils/logger'` — default export only. Use `env.IS_DEVELOPMENT` for environment checks.

## Testing

Global mocks in `setupTests.ts` (do NOT re-mock): `lucide-react`, `framer-motion`, `react-helmet-async`, browser APIs.

i18n mock — required in every test using `useTranslation()`:

```typescript
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: 'ko', changeLanguage: vi.fn() },
  }),
  Trans: ({ children }: { children: React.ReactNode }) => children,
  initReactI18next: { type: '3rdParty', init: vi.fn() },
}));
```

Non-React: `vi.mock('../../i18n', () => ({ default: { t: (key: string) => key, language: 'ko' } }));`

Use `renderWithProviders` from `test-utils/` for component tests needing context (wraps MemoryRouter + providers). E2E tests: Playwright in `frontend/e2e/` — runs on 5 profiles (chromium, firefox, webkit, mobile chrome, mobile safari); PR checks run chromium only.

Coverage target: 100%.

**Backend test output is intentionally noisy** — `ERROR`/`WARNING` lines come from negative-path tests (XSS/SQL/path-traversal detection middleware, SMTP/DB failure simulations, JWT invalid/blacklisted token paths, reCAPTCHA network/JSON fallbacks, suspicious email patterns, blocked IPs). Trust `Ran N tests OK` + `exit code 0` as the success signal, not the absence of error logs.

## Security

**Blog HTML**: `content_html` (TipTap) is always sanitized with `DOMPurify.sanitize()` before rendering via `dangerouslySetInnerHTML`. Comments render as plain text only. Image right-click/drag prevention uses shared `preventImageAction` from `utils/imageUtils.ts`.

**CI workflows**: Never use `${{ }}` expressions directly inside `run:` blocks — always bind to `env:` first, then reference as `"$VAR"`. This prevents script injection via user-controllable values like branch names. Two composite actions: `.github/actions/setup-node` (Node.js + npm ci + cache) and `.github/actions/setup-uv` (uv + backend deps + cache). Use `uses: ./.github/actions/setup-node` or `uses: ./.github/actions/setup-uv` instead of repeating inline setup.

**Shell scripts**: No `eval` with variables, no `source` of untrusted files (use `read` loop parsing), validate Make variables that reach shell commands.

**File uploads**: Backend uses `uuid4` for filenames (no user-supplied paths). Validated against extension whitelist + MIME type check + 5MB limit.

## Gotchas

Quick code-level traps that cost time when missed.

1. **`VITE_` prefix** for env vars (legacy `REACT_APP_` works via `config/env.ts` shim). Analytics uses `VITE_UMAMI_HOST` + `VITE_UMAMI_WEBSITE_ID` (Umami collect API, no external script).
2. **`useRef<T>(null)`** — React 19 requires initial value.
3. **`minimatch>=10.2.1`** override in `package.json` — don't remove.
4. **`tsconfig.build.json`** excludes test types — don't add `@testing-library/jest-dom`.
5. **`DATABASE_URL=""`** for backend tests — Docker PostgreSQL breaks SQLite tests.
6. **Never run `npm audit fix` (or `--force`)** — `make install` shows `8 vulnerabilities (4 low, 1 moderate, 3 high)` and that is the _expected_ state. The 3 high are transitive build-tool deps (`lodash`, `lodash-es`, `path-to-regexp`) with no production impact (nginx serves static `build/` without them). `--force` tries to downgrade `@lhci/cli` to 0.1.0 and would destroy Lighthouse CI. Update direct deps manually like vite 8.0.3 → 8.0.7 in `afd314e`; let dependabot handle transitives upstream.
7. **`frontend/.env.production` is intentionally tracked in git** — `.gitignore` line 5 has `!frontend/.env.production` (negation pattern) that explicitly excludes it from the `.env.*` ignore rule. This is correct: every `VITE_*` environment variable is inlined into the client JS bundle at build time, so `VITE_UMAMI_HOST` / `VITE_SENTRY_DSN` / `VITE_API_URL` are all **public by design** (DevTools shows them on any page load). The asymmetry is deliberate: `backend/.env.production` = real server-side secrets (SECRET_KEY, RECAPTCHA_PRIVATE_KEY) → gitignored. `frontend/.env.production` = compile-time public config baked into a public bundle → tracked. If you see this file in an `rsync diff`, fresh clone, or "why is this in git?" review, do **not** delete or `git rm` it — it's load-bearing for the production build (`scripts/auto-deploy.sh` reads it).
8. **Dependabot's `react*` group does NOT bump react and react-dom together** — even though `.github/dependabot.yml` groups them under the `react` pattern, the group only co-locates the PRs in the review queue; dependabot still opens separate PRs and they can merge independently. When a `react X→Y` PR merges alone, every Vitest test crashes at load with `Incompatible React versions: react X.Y.Z, react-dom X.Y.W`. **Fix when it happens**: `cd frontend && npm install react-dom@<matching-version> && cd .. && git add frontend/package.json package-lock.json && git commit -m "fix(deps): bump react-dom to match react"`. **Prevent it**: when reviewing a react-only dependabot PR, check if a matching react-dom PR exists in the open list; if not, do the manual bump in the same commit.
9. **E2E nav selectors must scope to `<nav aria-label="Main navigation">`** — Korean nav labels (`강의이력`, `인사이트`, `문의하기`) appear in BOTH the top navbar AND the footer's `메뉴 목록` list, so a bare `page.getByRole('button', { name: '강의이력' })` triggers Playwright strict-mode violation and fails the test. Always scope: `page.getByLabel('Main navigation').getByRole('button', { name: '강의이력' })`. The mobile sheet renders inside the same `<nav>`, so the same scoping pattern works for both desktop and mobile tests in `frontend/e2e/navigation.spec.ts`.
10. **`[skip ci]` in a commit message body causes self-skip** — GitHub Actions parses the **entire** commit message (subject + body) for `[skip ci]` / `[ci skip]`. If you write a commit that _documents_ the `[skip ci]` mechanism (e.g. "the readme-sync job uses [skip ci] to terminate the loop"), the literal substring in the body causes GitHub to skip ALL workflows for **that** commit — including the CI run you wanted in order to verify your change. Use `[skip ci]` only when you genuinely want the commit skipped; otherwise quote/escape it (e.g. write `\[skip ci\]` or describe it without the literal brackets) in any documentation prose.
11. **`set -e` in shell scripts does NOT exit on `FOO=$(failing_cmd)`** — command substitution inside an assignment masks the exit code, so a `set -e` script continues silently even when the assigned command failed. Use `if ! FOO=$(cmd); then exit 1; fi` when the assigned command's exit code matters. Caught today in `scripts/update-test-counts.sh` (README was updating with a passing-count extracted from a failing test run) and `scripts/auto-deploy.sh` (reporting "Deploy completed successfully" after health checks timed out); both fixed in `99e1a81`.

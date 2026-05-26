# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

This repo's owner runs a quant trading platform alongside this codebase, so the operating principle is **엄밀하게** — counts and claims **about the codebase** are exact and verifiable; no `+` / `≥` / round-figure handwaves in this doc, in README, or in commit messages. Marketing copy rendered in the UI itself (e.g. `5,000+` hours in the hero stats) is exempt — that's user-facing, not doc-facing.

Cross-project behavioral guidelines (Think before coding · Simplicity first · Surgical changes · Goal-driven execution · Risky-action protocol) live in user-level `~/.claude/CLAUDE.md` and are not repeated here. The sections below are project-specific only: `Project Overview`, `Architecture`, `UI Conventions`, `Constraints`, `Code Conventions`, `Development Flow`, `Testing`, `Security`, `Gotchas`.

## Quick Orientation

By task type, read these sections first:

- **UI / page work** → `UI Conventions`, `Architecture` (i18n routing, provider order)
- **Build / deploy / CI** → `Constraints` (SSG prerender, branch protection, CSP, README drift gates)
- **Dependency bumps** → `Gotchas` #6, #8, #13, #14, #15, #16
- **Backend changes** → `Constraints` (ENV files, Local dev vs Docker), `Architecture` (Blog, Contact)
- **All work** → `Code Conventions`, `Development Flow` invariants, `Gotchas` index

## Project Overview

Full-stack monorepo (React 19 + Django 6) deployed on Mac Mini via Docker + Cloudflare Tunnel.

- **Frontend**: http://localhost:5173 (Vite, NOT port 3000). Build output: `build/` (NOT `dist/`). Import alias `@` → `src/`
- **Backend**: http://localhost:8000. Single app: `api/`. Uses **uv** (NOT pip)
- **Dev proxy**: Vite proxies `/api` → `http://127.0.0.1:8000` (no CORS issues in dev)
- **Node ≥ 24**, **Python 3.12** required. Husky pre-commit runs lint-staged automatically

> Design rationale lives in `.private/strategy.md`; session log + opsec notes in `.private/journal.md`; secret setup in `.private/secrets-setup.md`. All gitignored, maintainer-local (synced between devices via `scripts/sync_private.sh`). Past git history (pre-`01c4db8`) retains earlier strategy versions for reference.

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
DATABASE_URL="" uv run python manage.py test api.tests.CategoryAPITestCase.test_list  # Single backend test
uv run black . && uv run flake8 .      # Format + lint (line length 120)

# Make shortcuts (run from root — see Makefile for full list, run `make help` for descriptions):
# Setup:    make install · make setup-dev-machine · make verify-setup
# Dev:      make dev (Docker) · make dev-local · make dev-clean · make down · make restart
# Quality:  make test · make test-ci · make lint · make lint-fix · make update-test-counts
# Ops:      make build · make logs · make logs-security · make logs-debug · make health · make ps
# Django:   make migrate · make shell · make createsuperuser
# Cron:     make setup-cron (SiteVisit cleanup) · make setup-health-cron · make cleanup-visits DAYS=90
```

## Architecture

System shape: providers, data flow, routing, and module boundaries.

**i18n routing**: Korean default (no prefix: `/profile`), English `/en/profile`. Internal links must use `useLocalizedPath` hook — never raw `navigate()`/`<Link>`. Non-React data files must use getter functions (not module-level constants) so `i18n.t()` resolves at call time.

**Provider order** (in `App.tsx`): HelmetProvider → ErrorBoundary → UIProvider → AuthProvider → NotificationProvider → BlogProvider → RouterProvider.

**Auth**: JWT via httpOnly cookies (not localStorage). `auth_hint` flag in localStorage prevents 401 spam — if unset, `getUser()` is skipped on mount.

**State management**: React Context only — `UIContext` (theme/sidebar), `AuthContext` (JWT user), `BlogContext` (posts/categories), `NotificationContext` (alerts). No Redux or external state libraries.

**API layer**: `services/api.ts` (Axios) with interceptors for JWT refresh. Mock API uses `mockResponse<T>(data, status?, statusText?)` helper to avoid boilerplate. Tests stub HTTP via `vi.mock('axios')` in individual test files — there is **no** MSW server. (A `test-utils/mocks/` MSW scaffold existed for years but was never wired into `setupTests.ts`; removed in the 2026-04-11 stability sweep along with the `msw` and `terser` packages — both dead-but-installed deps that generated dependabot churn.)

**Bundle splitting**: 7 vendor chunks in `vite.config.ts` — `react-vendor`, `ui-vendor` (lucide icons; framer-motion was removed 2026-04-16 in favor of Tailwind keyframes), `i18n`, `sentry` (lazy-loaded via `sentry-impl.ts` re-export shim — 0 bytes on homepage), `http-vendor` (axios), `dompurify`, `tiptap` (prosemirror, lowlight). When adding large dependencies, consider whether they belong in an existing chunk or need a new one. CSS-based mount/loader animations live in `tailwind.config.js` under `animation`/`keyframes` (`fade-up`, `fade-up-sm`, `fade-up-delay`, `dot-bounce`, `scale-pulse`) — prefer these over re-introducing a JS animation library.

**Blog**: Dual fields `content` (plain text/search) + `content_html` (TipTap HTML). Category API cached 1 hour (key: `"blog_categories"`), invalidated on CRUD/toggle-publish. DRF router `basename="blog"` in `api/urls.py` (NOT `"blog-posts"`). All BlogPost fields use **snake_case only** — `description` (NOT `excerpt`), `date` (NOT `publishedAt`), `is_published` (NOT `published`), `view_count` (NOT `views`), `image_url` (NOT `imageUrl`). Backend serializer has no camelCase aliases. Frontend routes use `/insights/:slug` (NOT `/blog`); `BlogPostViewSet` uses `lookup_field = "slug"`. Backend API stays at `/api/blog-posts/` (internal). Nginx 301 redirects: `/blog/*` → `/insights/*`. BlogCard links to `/insights/{slug}`. Comments still use numeric `post.id` (separate URL pattern `<int:post_pk>`).

**Contact**: Google Form iframe, not backend API — backend `/api/contact/` is preserved for future switch. Page uses same hero pattern as other pages (section label + font-black title + subtitle), with ContactInfo sidebar. Contact email `contact@emelmujiro.com` is used in `constants.ts` (exports `CONTACT_EMAIL`), i18n, backend settings, swagger, and `CONTRIBUTING.md` — update all 5 in lockstep. Frontend components and tests read from `CONTACT_EMAIL`, so they auto-follow. **When the Google Form schema changes (fields added/removed/retitled), update `privacy.dataCollection.content` in `ko.json` + `en.json` and bump the `2026-04-XX` effective date in `PrivacyPolicyPage.tsx` in the same commit** — PIPA Article 30 requires the published policy to match actual collection.

## UI Conventions

Page-level UX rules — copy, layout, and section structure. Change only when explicitly asked.

**Hero**: Centered layout, always dark-on-light / light-on-dark. No badge. Stats: 5,000+ hours, 50+ projects, 4.8+ satisfaction. CTA: "무료 상담 신청". No left-right grid — fully centered. Korean title uses "올인원 AI 파트너" (NOT "원스톱"). English CTA title: "Accelerate Your AI Journey". Mobile uses padding-based layout (`pt-32 pb-16`, no `min-h` or flex centering), desktop uses `sm:min-h-screen` + `sm:flex sm:items-center sm:justify-center`.

**Homepage section order**: Hero (white/dark) → Logos (gray) → Services (white) → Testimonials (gray) → CTA (white). Alternating backgrounds for visual rhythm. Logos before Services — social proof before value proposition. Testimonials before CTA — customer proof before conversion.

**Scroll carousels**: All use `w-max` on the animated flex container (required for `translateX` % to calculate against total content width, not viewport). LogosSection and TestimonialsSection use 2x copies with `translateX(-50%)` looping — math is `-((1/N) × 100%)` for N copies (kept at 2x to stay under Lighthouse's 800-node `dom-size` threshold). All use 32s on desktop and mobile (unified). Gap must be on the item itself (`mx-2`/`px-8`), NOT `gap-*` on the flex container — otherwise loop math breaks. Fade masks use `pointer-events-none` gradients matching section background. Hover pause via CSS `.group:hover .group-hover\:pause` + JS `touchstart`/`touchend` (mobile resume). `prefers-reduced-motion: reduce` overrides in `index.css` keep carousels at original speed instead of stopping — do NOT use `motion-reduce:!animate-none` on carousels (kills animations on Windows where reduced-motion is often default-on). Both testimonial rows must have equal item counts to keep equal visual speed at the same duration.

**TestimonialsSection**: Two rows of 8 each: enterprise training reviews (left scroll) + 고용노동부 K-디지털 reviews (right scroll, CV + startup mixed). Enterprise reviews use per-item source labels (e.g. "S사 반도체 엔지니어").

**ServicesSection**: Service cards are clickable — clicking opens `ServiceModal` (same modal used by Footer). Modal state is local to ServicesSection (not UIContext). Mobile: left/right nav arrows hidden (`hidden sm:block`), navigation via dot indicators only. English detail text must fit one line on mobile (~25 chars max).

**Teaching History page** (`/profile`): Replaced 4-tab profile (career/education/projects/timeline). Shows 39 teaching entries grouped by year (2026→2022) with alternating section backgrounds. Data uses end-client names as organization (삼성전자, not 엘리스). i18n keys: `teachingHistory.{0-38}.{org,title}`. `useMemo` depends on `i18n.language` for language switching. Items support `visibleAfter` date field for time-gated visibility; comment out entries in `profileData.ts` to temporarily hide them. **Filters**: OrgType pill buttons — 4 categories: `enterprise`(13), `moel`(7, 고용노동부 K-Digital), `public`(11, 정부·공공+연구), `academic`(8, 대학+교육기관). `OrgType` field on `TeachingItem` in `profileData.ts`. Filter labels: `teachingHistory.filter{All,Enterprise,Moel,Public,Academic}`.

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

**Two-device dev bootstrap**: `make setup-dev-machine` (idempotent) handles brew installs (`node@24`, `python@3.12`, `uv`, `gh`), gh auth check, local `.env` generation with per-machine random `SECRET_KEY`, `make install`, Django migrations, optional Playwright (`--with-playwright`), and `git config --global pull.rebase true` + `rebase.autoStash true` for two-device safety. **Production secrets are intentionally NOT synced to dev machines** — `backend/.env.production` (`SECRET_KEY`, `RECAPTCHA_PRIVATE_KEY`) lives only on Mac mini + GitHub Actions secrets. `frontend/.env.production` is tracked in git because every `VITE_*` is inlined into the public client bundle (see Gotcha #7). Principle of least privilege: a lost dev machine cannot leak production credentials. Per-device local `SECRET_KEY` divergence is correct — Django's `SECRET_KEY` is per-instance with no inter-device meaning. `make verify-setup` runs the 10-check health pass (tools, dev .env files, deps, vitest smoke, django check). **Do NOT** add `backend/.env.production` or `frontend/.env.production` to that check list — would defeat least-privilege.

**Two-device sync helpers**: Two artifacts don't move via `git push`. (1) `.private/` (opsec notes) syncs via `./scripts/sync_private.sh push|pull|dry` — never `--delete`, so per-side unique files survive. (2) Divergence detection: `./scripts/check_machine_sync.sh` reports MBP/Mac mini ahead/behind vs `origin/main` + production `last-modified`. Run before any push if a Mac mini session may have happened — caught silently in 2026-04-16 when Mac mini had unpushed local commits and `auto-deploy.sh` failed on `git pull` conflict (production stale 16 commits). Both scripts honor `MACMINI_HOST` env override. Interactive bits (Keychain unlock, SSH key registration, gh OAuth) are not scripted; manual steps live in `.private/journal.md`.

**Umami analytics**: Self-hosted at `localhost:3001` (Docker, not public). Tracking API proxied through nginx at `location = /umami/api/send` (exact match — dashboard not exposed, `access_log off` to suppress high-volume tracking noise). Secrets (`UMAMI_APP_SECRET`, `UMAMI_DB_PASSWORD`) in root `.env` (gitignored), required via `${VAR:?}` syntax. `umami-db` has `stop_grace_period: 30s` to prevent unclean PostgreSQL shutdown. Password reset: `docker compose down umami umami-db && docker volume rm emelmujiro_umami_db && docker compose up -d umami-db umami` (erases analytics data). Secret setup notes are in `.private/secrets-setup.md` (maintainer local, gitignored).

**Operational logs**: Cron jobs installed via Makefile targets (`make setup-cron`, `make setup-health-cron`) must redirect output to `$(CURDIR)/backend/logs/<name>.log` — matches Django `LOG_DIR` (`backend/config/settings.py:355`), already gitignored, persists via Docker `logs_volume`. Never `/tmp` (evaporates on reboot), `~/logs/` (outside project), or `/var/log/` (host-specific). Enforced by `pr-checks.yml` quick-checks grep — any `crontab` line with `>>` not targeting `backend/logs/` fails CI. `make health` runs an interactive Docker diagnostic (containers, resources, disk, endpoints, error logs).

**CSP**: `'unsafe-inline'` required (index.html inline scripts: error handler, KakaoTalk detection, theme detection). `'unsafe-eval'` removed after `plugin-legacy` removal. `data:` is **not** in `script-src` (XSS-narrowing); it stays in `img-src` for base64 SVG icons. `frame-ancestors 'none'` in the nginx header (meta tag ignores it per spec) complements `X-Frame-Options: DENY`. Cloudflare Web Analytics (RUM beacon) is **disabled** — `cloudflareinsights.com` must NOT appear in `script-src`/`connect-src`. CSP is defined twice and must stay in sync: `nginx.conf` (production) + `index.html` meta tag (dev/fallback); the `stripLocalhostCsp` Vite plugin strips `localhost:8000`/`127.0.0.1:8000` from the meta-tag CSP at production build.

**Tailwind 3.x**: PostCSS uses `tailwindcss: {}` (NOT `@tailwindcss/postcss`). Dark mode is `class`-based (not media query). Never use dynamic class interpolation (`bg-${color}-600`).

**Production keys**: `SECRET_KEY` and `RECAPTCHA_PRIVATE_KEY` raise `ImproperlyConfigured` if missing in production (DEBUG bypasses reCAPTCHA).

**Bundle size**: Build output must be < 10MB (enforced in `pr-checks.yml`). When adding large dependencies, check impact with `npm run analyze:bundle`.

**CI optimization**: `pr-checks.yml` uses `tj-actions/changed-files` to detect affected directories — frontend tests only run if `frontend/` changed, backend tests only if `backend/` changed. Trivy (`aquasecurity/trivy-action`) runs filesystem security scanning for dependency vulnerabilities on every PR. Workflow-level `permissions: contents: read` with job-level opt-in for write (least-privilege). `concurrency` group with `cancel-in-progress` on both PR and main workflows. All jobs except `deploy-mac-mini` (which uses `continue-on-error: true`) have `timeout-minutes` set; values range from 2 (`auto-label.yml`) to 15 (test/e2e jobs). `auto-label.yml` auto-tags PRs by changed paths. `stale.yml` marks issues stale after 90d of inactivity and PRs after 60d, then closes them after another 30d / 14d.

**README drift gates**: Two CI guards keep README aligned with reality. (1) **Package badges** — 14 package badges validated in `pr-checks.yml` quick-checks vs `package.json`; red status is informational only (main has no required-status-check rule), but visible in PRs/commit page. (2) **Test counts** — `Sync Test Badges` job in `main-ci-cd.yml` sed-replaces counts in README using job outputs from `frontend-test`/`backend-test` (no test re-run) and pushes with `[skip ci]`. `scripts/update-test-counts.sh` (= `make update-test-counts`) is the local equivalent — exits non-zero if README patterns missing. README format the sed is coupled to: `Vitest (N tests) + Django unittest (N tests)` in the `**Tests** —` bullet; if you change that substring, also update `scripts/update-test-counts.sh:48,50` sed patterns. **Do NOT use grep-over-test-files for Vitest counts** — `it.each([...])` rows expand at runtime, so grep undercounts. Operational rules live only in CLAUDE.md.

**Backend constants**: `api/constants.py` centralizes `ONE_HOUR`, `ONE_DAY`, `SPAM_KEYWORDS`, `SPAM_THRESHOLD`, `is_spam()`, and cache key constants (`CACHE_BLOG_CATEGORIES`, `CACHE_BLOG_POST_LIST`, `CACHE_ADMIN_STATS`). Do NOT re-define time constants or cache keys in views or middleware — import from here. `django-extensions` and `ipython` are dev-only dependencies (`uv sync --extra dev`).

**Backend utilities**: `api/utils.py` contains `get_client_ip()`, `_is_valid_ip()`, and `toggle_like()`. IP extraction is used by both views and middleware — import from utils, not views.

## Code Conventions

Cross-cutting rules for how code is written. Enforced by linters and CI where possible.

- **Conventional commits** required (English only; not enforced by a hook yet): `type(scope): description`. Allowed types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`, `deps`, `ci`.
- **Branch naming**: `feature/name` or `fix/description`.
- **ESLint flat config** (`eslint.config.mjs`, NOT `.eslintrc`). Zero warnings is the **target**, but it is not currently enforced — the lint script in `frontend/package.json` is bare `eslint src` (no `--max-warnings=0`), so CI passes with warnings. To make this a hard gate, add `--max-warnings=0` to the `lint` script.
- **English comments only** — no Korean comments in source.
- **All UI strings use i18n** — `useTranslation()` in components, `i18n.t()` in data files. No hardcoded user-facing text.
- **No `window.alert()` / `window.prompt()`** — use toast pattern or inline inputs.
- **Logger import**: `import logger from '../utils/logger'` — default export only. Use `env.IS_DEVELOPMENT` for environment checks.

## Development Flow

7-phase cycle adapted from [gstack](https://github.com/garrytan/gstack). Each phase maps to existing repo tooling plus a Claude Code skill command. Skip phases when scope doesn't warrant (typo fix ≠ full cycle).

| Phase       | Purpose                                    | Repo tools                                                                                                                  | gstack skill                                                               |
| ----------- | ------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| **Think**   | Understand problem, constraints, prior art | `git log`, Grep, `CLAUDE.md`, `.private/journal.md`                                                                         | `/office-hours`, `/investigate`                                            |
| **Plan**    | Concrete change scope and tradeoffs        | plan file in `~/.claude/plans/` or inline                                                                                   | `/plan-ceo-review`, `/plan-eng-review`, `/plan-design-review`, `/autoplan` |
| **Build**   | Implement                                  | editor, `npm run dev`, `make dev-local`                                                                                     | (direct coding)                                                            |
| **Review**  | Independent 2nd opinion                    | `make lint`, `make type-check`, GitHub PR review                                                                            | `/review` (Claude), `/codex review` (Codex CLI), `/design-review`          |
| **Test**    | Verify behavior                            | `make test`, `make test-ci`, Playwright E2E, Lighthouse CI                                                                  | `/qa`, `/qa-only`, `/benchmark`                                            |
| **Ship**    | Land + deploy                              | bump `VERSION` + both `package.json` + `CHANGELOG.md`, conventional commit, PR, merge, `scripts/auto-deploy.sh` via webhook | `/ship`, `/land-and-deploy`, `/canary`                                     |
| **Reflect** | Capture surprises                          | `.private/journal.md` session log                                                                                           | `/retro`, `/document-release`                                              |

### Invariants

- **Version sync on Ship**: `VERSION`, root `package.json`, and `frontend/package.json` must all match. Bump all three in the same commit.
- **CHANGELOG on Ship**: move `## [Unreleased]` entries under a new `## [X.Y.Z] - YYYY-MM-DD` section, then append an empty `## [Unreleased]` on top.
- **PR discipline**: one issue per PR, ≤ 3 commits, no mid-PR scope expansion (deferred work → new issue).
- **`[skip ci]` guard**: only Ship-phase commits may include the literal substring, and only for pure README sync (Gotcha #10).

### Skip rules

- **Typo / comment / single-line README**: Think → Build → Ship.
- **Hotfix on live bug**: Think → Build → Test → Ship → Reflect.
- **Refactor touching ≥ 3 files or any `Constraints` section**: full 7 phases mandatory.
- **Semver-compatible dependency bump**: Review → Test → Ship.

## Testing

Global mocks in `setupTests.ts` (do NOT re-mock): `lucide-react`, `react-helmet-async`, browser APIs.

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

Coverage targets (`codecov.yml`): project `target: 100%, threshold: 1%` for both `frontend` and `backend` flags (effective floor 99%); patch `target: 90%, threshold: 3%` (effective floor 87%). The 100% number is the aim, not the merge gate — the threshold is what actually fails Codecov.

**Backend test output is intentionally noisy** — `ERROR`/`WARNING` lines come from negative-path tests (XSS/SQL/path-traversal detection middleware, SMTP/DB failure simulations, JWT invalid/blacklisted token paths, reCAPTCHA network/JSON fallbacks, suspicious email patterns, blocked IPs). Trust `Ran N tests OK` + `exit code 0` as the success signal, not the absence of error logs.

## Security

**Blog HTML**: `content_html` (TipTap) is always sanitized with `DOMPurify.sanitize()` before rendering via `dangerouslySetInnerHTML`. Comments render as plain text only. Image right-click/drag prevention uses shared `preventImageAction` from `utils/imageUtils.ts`.

**CI workflows**: Never use `${{ }}` expressions directly inside `run:` blocks — always bind to `env:` first, then reference as `"$VAR"`. This prevents script injection via user-controllable values like branch names. Two composite actions: `.github/actions/setup-node` (Node.js + npm ci + cache) and `.github/actions/setup-uv` (uv + backend deps + cache). Use `uses: ./.github/actions/setup-node` or `uses: ./.github/actions/setup-uv` instead of repeating inline setup.

**Shell scripts**: No `eval` with variables, no `source` of untrusted files (use `read` loop parsing), validate Make variables that reach shell commands.

**File uploads**: Backend uses `uuid4` for filenames (no user-supplied paths). Validated against extension whitelist + MIME type check + 5MB limit.

## Gotchas

Quick code-level traps that cost time when missed.

**Index**: #1 VITE\_ prefix · #2 useRef(null) · #3 minimatch override · #4 tsconfig.build excludes test types · #5 DATABASE_URL="" for tests · #6 never npm audit fix · #7 frontend/.env.production tracked · #8 react/react-dom split bumps · #9 nav selector scoping · #10 [skip ci] self-skip · #11 set -e + cmd substitution · #12 dependabot minor held for review · #13 rolldown lockfile on macOS · #14 tiptap @core single-version · #15 don't rebase dependabot branches · #16 Node major lockstep (3 files)

1. **`VITE_` prefix** for env vars (legacy `REACT_APP_` works via `config/env.ts` shim). Analytics uses `VITE_UMAMI_HOST` + `VITE_UMAMI_WEBSITE_ID` (Umami collect API, no external script).
2. **`useRef<T>(null)`** — React 19 requires initial value.
3. **`minimatch>=10.2.1`** override in `package.json` — don't remove.
4. **`tsconfig.build.json`** excludes test types — don't add `@testing-library/jest-dom`.
5. **`DATABASE_URL=""`** for backend tests — Docker PostgreSQL breaks SQLite tests.
6. **Never run `npm audit fix` (or `--force`)** — `make install` currently shows `9 vulnerabilities (3 low, 6 moderate, 0 high)` and that is the _expected_ state. The 6 moderate are transitive build-tool deps through `@lhci/cli` (`brace-expansion`, `express`, `qs`, `uuid`, `ws`, `@lhci/cli` itself) with no production impact (nginx serves static `build/` without them). `--force` tries to downgrade `@lhci/cli` to 0.1.0 and would destroy Lighthouse CI. Update direct deps manually like vite 8.0.3 → 8.0.7 in `afd314e`; let dependabot handle transitives upstream. (Earlier audits showed 3 high in `lodash`/`lodash-es`/`path-to-regexp`; all patched upstream by 2026-05.)
7. **`frontend/.env.production` is intentionally tracked in git** — `.gitignore` line 5 has `!frontend/.env.production` (negation pattern) that explicitly excludes it from the `.env.*` ignore rule. This is correct: every `VITE_*` environment variable is inlined into the client JS bundle at build time, so `VITE_UMAMI_HOST` / `VITE_SENTRY_DSN` / `VITE_API_URL` are all **public by design** (DevTools shows them on any page load). The asymmetry is deliberate: `backend/.env.production` = real server-side secrets (SECRET_KEY, RECAPTCHA_PRIVATE_KEY) → gitignored. `frontend/.env.production` = compile-time public config baked into a public bundle → tracked. If you see this file in an `rsync diff`, fresh clone, or "why is this in git?" review, do **not** delete or `git rm` it — it's load-bearing for the production build (`scripts/auto-deploy.sh` reads it).
8. **Dependabot's `react*` group does NOT bump react and react-dom together** — even though `.github/dependabot.yml` groups them under the `react` pattern, the group only co-locates the PRs in the review queue; dependabot still opens separate PRs and they can merge independently. When a `react X→Y` PR merges alone, every Vitest test crashes at load with `Incompatible React versions: react X.Y.Z, react-dom X.Y.W`. **Fix when it happens**: `cd frontend && npm install react-dom@<matching-version> && cd .. && git add frontend/package.json package-lock.json && git commit -m "fix(deps): bump react-dom to match react"`. **Prevent it**: when reviewing a react-only dependabot PR, check if a matching react-dom PR exists in the open list; if not, do the manual bump in the same commit.
9. **E2E nav selectors must scope to `<nav aria-label="Main navigation">`** — Korean nav labels (`강의이력`, `인사이트`, `문의하기`) appear in BOTH the top navbar AND the footer's `메뉴 목록` list, so a bare `page.getByRole('button', { name: '강의이력' })` triggers Playwright strict-mode violation and fails the test. Always scope: `page.getByLabel('Main navigation').getByRole('button', { name: '강의이력' })`. The mobile sheet renders inside the same `<nav>`, so the same scoping pattern works for both desktop and mobile tests in `frontend/e2e/navigation.spec.ts`.
10. **`[skip ci]` in a commit message body causes self-skip** — GitHub Actions parses the **entire** commit message (subject + body) for `[skip ci]` / `[ci skip]`. If you write a commit that _documents_ the `[skip ci]` mechanism (e.g. "the readme-sync job uses [skip ci] to terminate the loop"), the literal substring in the body causes GitHub to skip ALL workflows for **that** commit — including the CI run you wanted in order to verify your change. Use `[skip ci]` only when you genuinely want the commit skipped; otherwise quote/escape it (e.g. write `\[skip ci\]` or describe it without the literal brackets) in any documentation prose.
11. **`set -e` in shell scripts does NOT exit on `FOO=$(failing_cmd)`** — command substitution inside an assignment masks the exit code, so a `set -e` script continues silently even when the assigned command failed. Use `if ! FOO=$(cmd); then exit 1; fi` when the assigned command's exit code matters. Caught today in `scripts/update-test-counts.sh` (README was updating with a passing-count extracted from a failing test run) and `scripts/auto-deploy.sh` (reporting "Deploy completed successfully" after health checks timed out); both fixed in `99e1a81`.
12. **`Auto-Merge Dependabot` job auto-merges only `semver-patch`** — `pr-checks.yml:47-52` runs `gh pr merge --auto --squash` only when `steps.metadata.outputs.update-type == 'version-update:semver-patch'`. Patch + minor get auto-approved (`pr-checks.yml:40-45`) but **minor and major are intentionally held for human review** — they don't auto-close even after every check passes. If a dependabot minor PR is `mergeable: MERGEABLE` and `mergeStateStatus: CLEAN` for hours, that's the policy working as designed, not a stuck CI. Manual close: `gh pr merge <num> --squash` (the bare flag — `--auto` fails with `enablePullRequestAutoMerge` because the repo's GitHub auto-merge feature itself is off). Caught 2026-04-27 when 5 minor dependabot PRs sat green-but-open after CI unblock.
13. **`npm install` on macOS writes only host-platform `@rolldown/binding-*` to lockfile** (npm #4828) — regenerating on Apple Silicon yields a single `binding-darwin-arm64` entry; CI on `ubuntu-24.04` then fails with `Cannot find module '@rolldown/binding-linux-x64-gnu'` (vite 8 uses rolldown; vitest shares the same vite). **Fix**: `rm -rf node_modules frontend/node_modules package-lock.json && npm install --include=optional --legacy-peer-deps`, then verify `grep -c "node_modules/@rolldown/binding-" package-lock.json` == 15. `--legacy-peer-deps` is needed because `eslint-plugin-jsx-a11y@6.10.2` caps peers at `eslint@^9` while we run `^10`. See `f289544` (2026-05-04).
14. **Mixed `^3.22.x` ranges across `@tiptap/*` siblings duplicate `@tiptap/core`** — different patch ranges (e.g. `^3.22.3` vs `^3.22.5`) make npm install two `@tiptap/core` versions; `tsc -p tsconfig.build.json` then fails with hundreds of lines of `Type 'Node<any, any>' is not assignable to type 'Node<any, any>'. Two different types with this name exist, but they are unrelated.` Fix: align every direct `@tiptap/*` to the same `^3.22.X` AND add `"@tiptap/core": "^3.22.X"` to root + frontend `overrides`. Verify: `npm ls @tiptap/core --all | grep "@tiptap/core@" | sort -u` must yield one version. See `da9d76c` (2026-05-04).
15. **Don't manually rebase or force-push to `dependabot/*` branches** — GitHub treats non-bot pushes as adversarial and silently closes the PR (`head_sha` flips to `null`, state → `closed merged=false`); `gh pr checks` still shows the old green run. Correct path: comment `@dependabot rebase` and let the bot push the new HEAD. After a close cascade, recover by bundling the bumps into one direct-to-main commit with `Closes #NNN` lines (see `09a47e9`, 2026-05-04, for dompurify/eslint/typescript-eslint/globals).
16. **Node version must move in lockstep across three places** — `frontend/Dockerfile.dev` `FROM node:N-alpine`, `.github/actions/setup-node/action.yml` `node-version: "N"`, and `scripts/setup-dev-machine.sh` brew `node@N` all pin the same major. Bumping one alone creates "works in my dev container, fails in CI" drift. Dependabot's docker ecosystem will keep proposing single-file Dockerfile bumps (e.g. `node:24-alpine`→`node:26-alpine` PR #287 on 2026-05-13); those are closed with `@dependabot ignore this major version`, not merged. Bumping Node major is a 3-file lockstep commit, not a dependabot drive-by.

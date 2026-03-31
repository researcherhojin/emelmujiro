# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Full-stack monorepo (React 19 + Django 6) deployed on Mac Mini via Docker + Cloudflare Tunnel.

- **Frontend**: http://localhost:5173 (Vite, NOT port 3000). Build output: `build/` (NOT `dist/`). Import alias `@` → `src/`
- **Backend**: http://localhost:8000. Single app: `api/`. Uses **uv** (NOT pip)
- **Dev proxy**: Vite proxies `/api` → `http://127.0.0.1:8000` (no CORS issues in dev)
- **Node ≥ 24**, **Python 3.12** required. Husky pre-commit runs lint-staged automatically

## Commands

All `npm run` frontend commands run from `frontend/`. Root-level `npm run dev` runs both servers.

```bash
npm run dev                # Frontend + Backend (from root)
npm run dev:clean          # Kill ports first, then start both (from root)
npm run build              # sitemap → tsc → vite build → prerender → cp 404.html (from frontend/)
npm run build:no-prerender # Faster build — skips SSG prerender step (from frontend/)
npm run validate           # lint + type-check + test:coverage (from frontend/)
CI=true npm test -- --run src/components/common/__tests__/Navbar.test.tsx  # Single test
npm run test:e2e           # Playwright E2E (from frontend/). Also: test:e2e:ui, test:e2e:debug
npm run type-check         # tsc --noEmit (from frontend/)
npm run analyze:bundle     # source-map-explorer (from frontend/, requires build first)

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
```

## Architecture

**i18n routing**: Korean default (no prefix: `/profile`), English `/en/profile`. Internal links must use `useLocalizedPath` hook — never raw `navigate()`/`<Link>`. Non-React data files must use getter functions (not module-level constants) so `i18n.t()` resolves at call time.

**Provider order** (in `App.tsx`): HelmetProvider → ErrorBoundary → UIProvider → AuthProvider → NotificationProvider → BlogProvider → RouterProvider.

**Auth**: JWT via httpOnly cookies (not localStorage). `auth_hint` flag in localStorage prevents 401 spam — if unset, `getUser()` is skipped on mount.

**Contact**: Google Form iframe, not backend API. Backend `/api/contact/` is preserved for future switch.

**Blog**: Dual fields `content` (plain text/search) + `content_html` (TipTap HTML). Category API cached 1 hour (key: `"blog_categories"`), invalidated on CRUD/toggle-publish. Router `basename="blog"` (NOT `"blog-posts"`). All BlogPost fields use **snake_case only** — `description` (NOT `excerpt`), `date` (NOT `publishedAt`), `is_published` (NOT `published`), `view_count` (NOT `views`), `image_url` (NOT `imageUrl`). Backend serializer has no camelCase aliases.

**State management**: React Context only — `UIContext` (theme/sidebar), `AuthContext` (JWT user), `BlogContext` (posts/categories), `NotificationContext` (alerts). No Redux or external state libraries.

**API layer**: `services/api.ts` (Axios) with interceptors for JWT refresh. Mock API uses `mockResponse<T>(data, status?, statusText?)` helper to avoid boilerplate. Test mocks use MSW (`test-utils/`) for realistic HTTP stubbing.

**Bundle splitting**: 7 vendor chunks in `vite.config.ts` — `react-vendor`, `ui-vendor` (framer-motion, lucide), `i18n`, `sentry`, `http-vendor` (axios), `dompurify`, `tiptap` (prosemirror, lowlight). When adding large dependencies, consider whether they belong in an existing chunk or need a new one.

**Hero**: Centered layout, always dark-on-light / light-on-dark. No badge. Stats: 5,000+ hours, 50+ projects, 4.8+ satisfaction. CTA: "무료 상담 신청". No left-right grid — fully centered. Korean title uses "올인원 AI 파트너" (NOT "원스톱"). English CTA title: "Accelerate Your AI Journey". Mobile height: `min-h-[85vh]` (NOT full `min-h-screen`) to reduce navbar–content gap.

**Homepage section order**: Hero (white/dark) → Logos (gray) → Services (white) → Testimonials (gray) → CTA (white). FAQSection component was removed — do NOT re-add or import. Alternating backgrounds for visual rhythm. Logos before Services — social proof before value proposition. Testimonials before CTA — customer proof before conversion.

**Scroll carousels**: LogosSection uses 3x copies with `translateX(-33.333%)` looping (32s desktop, 18s mobile). TestimonialsSection uses 5x copies with `translateX(-20%)` looping (40s desktop, 25s mobile). Mobile speed override via CSS media query in `index.css` (`max-width: 639px`). Gap between items must be on the item itself (`mx-2`/`px-8`), NOT `gap-*` on the flex container — otherwise the loop math breaks. Fade masks use `pointer-events-none` gradients matching section background. Hover pause via custom CSS utility `.group:hover .group-hover\:pause` in `index.css`. `motion-reduce:!animate-none` for accessibility.

**TestimonialsSection**: Two rows: enterprise training reviews (left scroll) + 고용노동부 K-디지털 reviews (right scroll, CV + startup mixed). Enterprise reviews use per-item source labels (e.g. "S사 반도체 엔지니어").

**ServicesSection**: Service cards are clickable — clicking opens `ServiceModal` (same modal used by Footer). Modal state is local to ServicesSection (not UIContext). Mobile: left/right nav arrows hidden (`hidden sm:block`), navigation via dot indicators only. English detail text must fit one line on mobile (~25 chars max).

**Teaching History page** (`/profile`): Replaced 4-tab profile (career/education/projects/timeline). Shows 38 teaching entries grouped by year (2026→2022) with alternating section backgrounds. Data uses end-client names as organization (삼성전자, not 엘리스). i18n keys: `teachingHistory.{0-37}.{org,title}`. `useMemo` depends on `i18n.language` for language switching. Items support `visibleAfter` date field for time-gated visibility.

**Nav order**: 강의이력 → 인사이트 (teaching history first, blog second). Footer menu label: "강의이력" (not "대표 프로필").

**About page**: Removed entirely — route, component file, and lazy import all deleted. Sitemap, prerender, StructuredData breadcrumb all updated.

**Blog (Insights) URLs**: Frontend routes use `/insights/:slug` (NOT `/blog`). `BlogPostViewSet` uses `lookup_field = "slug"`. Backend API stays at `/api/blog-posts/` (internal). Nginx redirects `/blog/*` → `/insights/*` (301). BlogCard links to `/insights/{slug}`. Comments still use numeric `post.id` (separate URL pattern `<int:post_pk>`).

**Contact page**: Uses same hero pattern as other pages (section label + font-black title + subtitle). Google Form iframe for submissions, ContactInfo sidebar.

**Contact email**: `contact@emelmujiro.com` — used in constants.ts, i18n, backend settings, swagger, CONTRIBUTING.md.

**Mobile responsive pattern**: All section heroes use split sizing — mobile `text-3xl`/`text-2xl`, desktop `sm:text-6xl`/`sm:text-5xl`. Section padding: `py-16 sm:py-32`. Use `break-keep` for Korean text to prevent mid-word breaks. For text that must break at specific points on mobile only, use `<br className="sm:hidden" />`. English i18n text must be shorter than Korean equivalents — abbreviate org names (MOEL, KALIS, KETI) and use `#` instead of "Cohort" for numbering. CTA subtitle uses `subtitleLine1`/`subtitleLine2` keys (not single `subtitle`) for controlled line breaks.

**Blog → Insights branding**: All user-facing text uses "인사이트"/"Insights" (not "블로그"/"Blog"). Section label: "INSIGHTS" (not "TECH BLOG"). Internal code still uses `blog` in component names, routes, and API paths — only i18n display text changed.

## Constraints

**SEO**: `main.tsx` uses `createRoot()` (never `hydrateRoot`). Do NOT add static meta/title/OG tags to `index.html` — `SEOHelmet` handles everything. Use `SITE_URL` from `constants.ts` — never hardcode URLs. Page titles must NOT include `| 에멜무지로` suffix (appended automatically).

**KakaoTalk WebView**: `window.__appLoaded` must be set in `AppLayout` (router layout), NOT at provider level. iOS banner uses `kakaotalk://web/openExternal` scheme (NOT `window.open()`).

**Local dev vs Docker**: `npm run dev` runs local backend (`DEBUG=True`, SQLite, no throttle) + Vite. Docker runs production backend (`DEBUG=False`, throttle enabled). Don't run both — Docker backend occupies port 8000. For local development: stop Docker backend (`docker compose stop backend`) then `npm run dev`. Blog content in local SQLite and Docker DB are separate — changes to one don't affect the other.

**Deployment**: Never `rm -rf frontend/build` (breaks nginx volume mount) — use `rm -rf frontend/build/*`. Docker ports bound to `127.0.0.1` only. `SECRET_KEY` loaded via `env_file` — do NOT set in docker-compose `environment` section.

**CSP**: `'unsafe-eval'` + `'unsafe-inline'` required — Cloudflare Tunnel injects unpredictable scripts, `plugin-legacy` needs eval.

**Tailwind 3.x**: PostCSS uses `tailwindcss: {}` (NOT `@tailwindcss/postcss`). Dark mode is `class`-based (not media query). Never use dynamic class interpolation (`bg-${color}-600`).

**Production keys**: `SECRET_KEY` and `RECAPTCHA_PRIVATE_KEY` raise `ImproperlyConfigured` if missing in production (DEBUG bypasses reCAPTCHA).

**Backend constants**: `api/constants.py` centralizes `ONE_HOUR`, `ONE_DAY`, `SPAM_KEYWORDS`, `SPAM_THRESHOLD`, and `is_spam()`. Do NOT re-define time constants in views or middleware — import from here. `django-extensions` and `ipython` are dev-only dependencies (`uv sync --extra dev`).

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

Coverage target: 100%. Conventional commits required (`type(scope): description`). Allowed types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`, `deps`, `ci`. ESLint uses flat config (`eslint.config.mjs`, NOT `.eslintrc`). Zero warnings policy.

## Security

**Blog HTML**: `content_html` (TipTap) is always sanitized with `DOMPurify.sanitize()` before rendering via `dangerouslySetInnerHTML`. Comments render as plain text only. Image right-click/drag prevention uses shared `preventImageAction` from `utils/imageUtils.ts`.

**CI workflows**: Never use `${{ }}` expressions directly inside `run:` blocks — always bind to `env:` first, then reference as `"$VAR"`. This prevents script injection via user-controllable values like branch names. Node setup/cache/install is extracted to `.github/actions/setup-node` composite action — use `uses: ./.github/actions/setup-node` instead of repeating the 3-step pattern.

**Shell scripts**: No `eval` with variables, no `source` of untrusted files (use `read` loop parsing), validate Make variables that reach shell commands.

**File uploads**: Backend uses `uuid4` for filenames (no user-supplied paths). Validated against extension whitelist + MIME type check + 5MB limit.

## Pitfalls

1. **`VITE_` prefix** for env vars (legacy `REACT_APP_` works via `config/env.ts` shim). Analytics var is `VITE_GA_TRACKING_ID` (env.ts reads `REACT_APP_GA_TRACKING_ID` → `VITE_GA_TRACKING_ID`)
2. **`useRef<T>(null)`** — React 19 requires initial value
3. **`minimatch>=10.2.1`** override in both package.json — don't remove
4. **`tsconfig.build.json`** excludes test types — don't add `@testing-library/jest-dom`
5. **`DATABASE_URL=""`** for backend tests — Docker PostgreSQL breaks SQLite tests
6. **Comments in English** only — no Korean comments
7. **`import logger from '../utils/logger'`** — default export only, use `env.IS_DEVELOPMENT`
8. **No `window.alert()`/`window.prompt()`** — use toast pattern or inline inputs
9. **All UI strings use i18n** — `useTranslation()` in components, `i18n.t()` in data files
10. **Branch naming**: `feature/name` or `fix/description`

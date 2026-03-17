# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Emelmujiro (에멜무지로) is a full-stack monorepo for an AI Education & Consulting platform. Both frontend (React/TypeScript) and backend (Django) are deployed on Mac Mini via Docker + Cloudflare Tunnel. Licensed under Apache 2.0.

- **Live Site**: https://emelmujiro.com (Mac Mini nginx + Cloudflare Tunnel)
- **Backend API**: https://api.emelmujiro.com (Mac Mini Django + Cloudflare Tunnel)
- **Frontend Dev**: http://localhost:5173 (Vite) — **NOT port 3000**
- **Backend Dev**: http://localhost:8000 (Django)
- **Mock API** — Controlled by `USE_MOCK_API` in `frontend/src/services/api.ts`. Mock is active only in tests (`IS_TEST`) or when `env.API_URL` is empty. Production builds default to `https://api.emelmujiro.com/api` and use the real backend.

## Essential Commands

All frontend commands run from `frontend/`. Root commands use npm workspaces.

```bash
# Development (from root)
npm run dev                # Frontend + Backend concurrently
npm run dev:clean          # Kill ports first, then start
npm run dev:safe           # Like dev but kills all if one fails
npm run dev:frontend       # Frontend only
npm run dev:backend        # Backend only

# Frontend (from frontend/)
npm run dev                # Vite dev server (port 5173)
npm run build              # generate:sitemap → tsc → vite build → prerender → cp 404.html
npm run lint:fix           # ESLint auto-fix
npm run type-check         # TypeScript check
npm run type-check:watch   # TypeScript watch mode
npm run validate           # lint + type-check + test:coverage
npm run test:coverage      # Single run with coverage report
npm run analyze:bundle     # source-map-explorer on build output
npm run clean              # Remove build/ and node_modules/.cache
npm run clean:all          # Also removes coverage, playwright-report, test-results
npm run preview            # Preview production build locally
npm run format             # Prettier format all source files
npm run format:check       # Prettier check without writing (for CI)

# Testing (from frontend/)
npm test                   # Vitest watch mode
npm run test:run           # Single run
npm run test:ci            # CI-optimized (--bail=1, no coverage)
npm run test:ui            # Interactive Vitest UI
npm run test:e2e           # Playwright E2E tests
npm run test:e2e:ui        # Playwright UI mode
# Run a specific test file:
CI=true npm test -- --run src/components/common/__tests__/Button.test.tsx
# Note: `npm test` from root runs BOTH frontend AND backend tests

# Backend (from backend/ — uses uv)
uv sync                    # Install dependencies
uv sync --extra dev        # Install with dev dependencies
uv run python manage.py migrate  # Run migrations (required for first setup)
uv run python manage.py runserver
uv run python manage.py test
uv run black .             # Format (line length 120)
uv run flake8 .            # Lint (line length 120)
uv run isort .             # Sort imports
uv run ruff check .        # Fast lint

# Deploy (Mac Mini — frontend update)
cd frontend && git pull && VITE_API_URL=https://api.emelmujiro.com/api npm run build
# nginx volume-mounts build/ → changes are live immediately (no container restart)

# Deploy (Mac Mini — backend update)
git pull && docker compose up -d --build

# GitHub Pages (backup, CI still deploys here)
npm run deploy             # Build + deploy to GitHub Pages via gh-pages package

# Makefile shortcuts (from root)
make install               # npm install + uv sync + husky install
make dev-local             # npm run dev (non-Docker)
make dev-docker            # docker-compose dev up
make test                  # Frontend + backend tests
make lint                  # Frontend + backend lint
make kill-ports            # Kill processes on 5173/8000
make logs                  # Tail Docker Compose logs
make down                  # Stop Docker Compose
make migrate               # Run Django migrations (Docker)
make shell                 # Open Django shell (Docker)
make createsuperuser       # Create Django superuser (Docker)

# Kill stuck dev ports
lsof -ti:5173 | xargs kill -9
lsof -ti:8000 | xargs kill -9
```

## Architecture

### Monorepo Structure

- `frontend/` — React 19 + TypeScript + Vite + Tailwind CSS 3.x
- `backend/` — Django 5 + DRF + JWT auth + WebSocket (Channels/Daphne). Single app: `api/`. Uses **uv** for dependency management (`pyproject.toml` + `uv.lock`). Chat/Redis excluded from 1.0 scope. Notification model + REST API + WebSocket consumer are implemented
- Root `package.json` uses npm workspaces pointing to `frontend/`
- Docker support: `docker-compose.yml` (prod: backend with SQLite by default; PostgreSQL via `--profile postgres`, Redis via `--profile chat`) and `docker-compose.dev.yml` (dev with hot-reload, same profile system). SQLite data persists in `sqlite_data` Docker volume (`SQLITE_DIR=/app/data`). Frontend runs as standalone `nginx:alpine` container with volume-mounted build output (not via docker-compose). `frontend/Dockerfile` exists for self-contained image builds but is not used in current deployment

### Routing

Uses `createBrowserRouter` (BrowserRouter) in `frontend/src/App.tsx`. All pages are lazy-loaded. Routes: `/`, `/about`, `/contact`, `/profile`, `/share`, `/blog`, `/blog/:id`, `/blog/new`, `/admin` (protected, requires admin role), `*` (404 NotFound). Production nginx uses `try_files $uri $uri/ /index.html` for SPA routing (all routes return HTTP 200). The build script still creates `404.html` (`cp build/index.html build/404.html`) as a GitHub Pages fallback.

**Language-prefixed routes** — `LanguageLayout` component detects the `:lang` URL param and calls `i18n.changeLanguage()`. Korean (default) has no prefix (`/about`), English uses `/en` prefix (`/en/about`). Both language variants share the same `pageRoutes` array. The `useLocalizedPath` hook (`src/hooks/useLocalizedPath.ts`) provides `localizedPath()`, `localizedNavigate()`, and `switchLanguagePath()` for language-aware navigation. All internal links in components use these utilities instead of raw `navigate()`/`<Link>`.

### Blog (Active)

Blog routes (`/blog`, `/blog/new`, `/blog/:id`) are now connected to the real backend API (`api.emelmujiro.com`). `BlogListPage`, `BlogDetail`, `BlogEditor` components are lazy-loaded in `App.tsx`. Blog data is fetched via `BlogContext` → `api.ts` → Django REST API.

### Under Construction Pages

Chat feature is **not functional** (1.0 이후 scope). `ChatWidget` is removed from `AppLayout` entirely. `ChatProvider` exists in `src/contexts/` for test compatibility but is NOT in `App.tsx` provider hierarchy. The `UnderConstruction` component (`src/components/common/UnderConstruction.tsx`) is still available for future use.

### Contact Page (Google Form)

`/contact` uses a Google Form iframe embed instead of the backend API. `ContactPage.tsx` embeds `https://docs.google.com/forms/d/e/.../viewform?embedded=true`. The original `ContactForm` component and `FormContext` are preserved for test compatibility but not used in the live route. CSP in `index.html` includes `frame-src https://docs.google.com` to allow the iframe. The "open in new tab" link uses the `?usp=dialog` variant. i18n keys: `contact.googleForm.*` (description, loading, openInNewTab, formTitle).

### KakaoTalk In-App Browser Support

React app loads normally in **all** browsers including KakaoTalk's in-app WebView. `@vitejs/plugin-legacy` generates `nomodule` fallback bundles (Chrome 64+, Samsung 9.2+) that cover KakaoTalk's Android Chromium WebView automatically.

**Detection flags**: `index.html` sets `window.__isKakaoInApp` and `window.__isKakaoAndroid` via user agent detection. React initialization is **not** blocked for any browser.

**iOS KakaoTalk banner**: `Layout.tsx` shows a dismissible banner **only on iOS** KakaoTalk (`__isKakaoInApp && !__isKakaoAndroid`). The "open externally" button uses `kakaotalk://web/openExternal?url=...` (official KakaoTalk scheme). Do NOT use `window.open()` — it opens within the in-app browser instead of externally. Android KakaoTalk does not show the banner; the legacy plugin handles rendering.

**Error visibility** (all browsers):

- `window.onerror` + `unhandledrejection` handlers capture errors into `window.__errors` and render them on-screen via `__showError()` — shows error text, user agent, reload button, and (on KakaoTalk) a `kakaotalk://web/openExternal` "외부 브라우저에서 열기" button
- 5-second general fallback also calls `__showError()` if `window.__appLoaded` is still false
- **Critical**: `window.__appLoaded` must be set inside `AppLayout` (router layout), NOT as a sibling to `RouterProvider`. Setting it at the provider level suppresses all error handlers before visible content renders, causing a blank page
- `@vitejs/plugin-legacy` generates `nomodule` fallback bundles for older browsers
- `main.tsx` serviceWorker cleanup is wrapped in try-catch — some in-app browsers throw when accessing `navigator.serviceWorker` despite `'serviceWorker' in navigator` being true

Key files: `index.html` (detection + error handlers + fallbacks), `App.tsx` (`AppLayout`'s `useEffect` sets `window.__appLoaded = true` after visible content renders), `Layout.tsx` (iOS KakaoTalk banner), `global.d.ts` (`__isKakaoInApp`, `__isKakaoAndroid`, `__appLoaded`, `__errors`, `performanceStart` types).

Loading skeleton uses **inline styles** (not Tailwind classes) so it's visible before CSS loads.

### State Management

- **React Context** — All state management via UIContext, AuthContext, BlogContext, FormContext, ChatContext (all in `src/contexts/`). All providers use `useMemo` for value objects and `useCallback` for functions to prevent unnecessary re-renders.
- **ChatContext split** — `ChatContext.tsx` imports types/helpers from `chatHelpers.ts` (types, defaults, utilities) and delegates WebSocket logic to `useChatConnection.ts` (custom hook). Consumer code imports from `ChatContext.tsx` which re-exports all types.
- **Types** — `src/types/index.ts` exports: `BlogPost`, `ContactFormData`, `PaginatedResponse`, `ErrorResponse`.

### Mock API System

`frontend/src/services/api.ts` uses centralized env config from `src/config/env.ts`. `USE_MOCK_API` is `env.IS_TEST || !env.API_URL` — mock is only used in tests or when no API URL is configured. Production builds default to `https://api.emelmujiro.com/api`. Mock data lives in `src/services/mockData.ts`. Every API method (blog, contact, newsletter, health) has a mock path.

### API Client

Axios-based client in `src/services/api.ts`. All API methods (blog, contact, newsletter, auth, health, admin) are centralized in the `api` object with mock support. Auth methods (`getUser`, `login`, `logout`, `register`) are part of the `api` object — `AuthContext` imports `{ api }` not the default axios instance. 30s timeout with automatic retry on timeout. JWT auth uses **httpOnly cookies** (not localStorage) — cookies are set by the backend and sent automatically via `withCredentials: true`. 401 responses trigger automatic cookie-based token refresh via `POST /auth/token/refresh/`. HTTP is upgraded to HTTPS in production. `api.logout()` takes no arguments (backend reads refresh token from cookie).

### Sentry

`@sentry/react` v10 is integrated via `src/utils/sentry.ts`. Only three functions are exported: `initSentry` (called in `main.tsx`), `captureException` (used by `logger.ts`), `reportErrorBoundary` (called by `ErrorBoundary.tsx` in `componentDidCatch`). Only active when `ENABLE_SENTRY=true` and `SENTRY_DSN` is set (both default to off). No action needed unless enabling error tracking. `main.tsx` uses `env.IS_DEVELOPMENT` / `env.IS_PRODUCTION` from `src/config/env.ts` instead of `process.env.NODE_ENV`.

### Google Analytics

`src/utils/analytics.ts` exports `initAnalytics()` (called in `main.tsx`), `trackPageView(path)` (called in `ScrollToTop` on route change), and `trackCtaClick(location)` (used on CTA buttons in `HeroSection` and `CTASection`). Only active when `VITE_ENABLE_ANALYTICS=true` and `VITE_GA_TRACKING_ID` is set. CSP in `index.html` includes `https://www.googletagmanager.com` in `script-src` and Google Analytics domains in `connect-src`.

### SSG / Prerendering

`scripts/prerender.js` runs after `vite build` using Playwright (headless Chromium) to generate static HTML for each route in each language. The script starts a local static server, navigates to each route, waits for `window.__appLoaded === true`, marks `<div id="root">` with `data-prerendered="true"`, and captures the rendered HTML. Output: `build/<route>/index.html` for Korean, `build/en/<route>/index.html` for English (12 files total = 6 routes × 2 languages). `main.tsx` detects `data-prerendered` and uses `ReactDOM.hydrateRoot()` instead of `createRoot()`. `build:no-prerender` script skips the prerender step for faster local iteration. The shared route list is exported from `generate-sitemap.js` and imported by `prerender.js`.

### Notification System

Backend: `Notification` model (`api/models.py`) with fields: user, title, message, level (info/success/warning/error), notification_type (system/blog/contact/admin), url, is_read, read_at. `NotificationViewSet` provides REST API at `/api/notifications/` (list, retrieve, mark read, mark_all_read, unread_count). `send_user_notification(user, title, message, ...)` utility in `views.py` creates a DB record and pushes via WebSocket channel layer. `NotificationConsumer` (`consumers.py`) handles real-time mark_read/mark_all_read via `ws/notifications/` and sends unread count updates back. No frontend notification UI yet — backend only.

### Environment Variables

`frontend/src/config/env.ts` exports `getEnvVar()` helper that checks `VITE_` prefixed vars first, falls back to `REACT_APP_` prefixed vars. New env vars should use the `VITE_` prefix. Key frontend env vars: `VITE_API_URL`, `VITE_WS_URL`, `VITE_SENTRY_DSN`, `VITE_ENABLE_SENTRY`, `VITE_ENABLE_ANALYTICS`, `VITE_GA_TRACKING_ID`, `VITE_CONTACT_EMAIL`. Backend env vars documented in `backend/.env.example`.

### Site URL & Contact Email

`SITE_URL` and `CONTACT_EMAIL` are defined in `src/utils/constants.ts`. `SITE_URL` (`https://emelmujiro.com`) is the canonical base URL used by all SEO components (SEOHelmet, StructuredData), page canonical links, and OG tags — **never hardcode** the URL in components; always import `SITE_URL`. Page components pass URLs as `url={`${SITE_URL}/about`}` (clean paths, BrowserRouter). `CONTACT_EMAIL` uses `import.meta.env.VITE_CONTACT_EMAIL` with fallback.

### Provider Hierarchy

`App.tsx` wraps the app in: `HelmetProvider > ErrorBoundary > UIProvider > AuthProvider > BlogProvider > FormProvider > RouterProvider`. ChatProvider is excluded (chat is under construction).

### Route Protection

`ProtectedRoute` component (`src/components/common/ProtectedRoute.tsx`) checks auth state and optional role requirement. Currently used to protect `/admin` route with `requiredRole="admin"`. Redirects to `/` when unauthorized.

### i18n

Uses `i18next` + `react-i18next` with browser language detection. Fallback language is Korean (`ko`). Translations live in `frontend/src/i18n/locales/{ko,en}.json`. Configured in `frontend/src/i18n.ts` with `useSuspense: false`. All UI strings, data files, contexts, and SEO modules use i18n — no hardcoded Korean in components. Non-React files that need translations (e.g., `websocket.ts`, `ChatContext.tsx`) import `i18n` directly and call `i18n.t()`. The `blogPosts.ts` mock data file is an exception — it contains Korean content strings as placeholder blog post data, not UI strings.

**SEO bot detection** — `i18n.ts` detects search engine bots (Googlebot, Bingbot, etc.) via `navigator.userAgent`. A custom `urlPrefix` detector reads the language from the URL path (`/en/*` → `en`, otherwise `undefined` → falls back). Detection order: bots use `['urlPrefix', 'htmlTag']`, users use `['urlPrefix', 'localStorage', 'navigator', 'htmlTag']`. URL prefix always takes highest priority so `/en/about` renders English content regardless of other settings. Bot detection disables localStorage caching.

**Data file i18n pattern** — Non-React data files (`footerData.ts`, `profileData.ts`, `constants.ts`) import the i18n instance directly and use getter functions so translations resolve at call time (not at module load):

```typescript
import i18n from '../i18n';
export const getCareerData = () => [
  { period: i18n.t('profileData.career.0.period'), ... },
];
```

When adding new data files with translatable strings, follow this getter function pattern. Components must call the getter each render (e.g., `const careers = getCareerData()`), not store the result in a module-level constant. For test files that import these data modules, mock i18n:

```typescript
vi.mock('../../i18n', () => ({
  default: { t: (key: string) => key, language: 'ko' },
}));
```

**Test mocking pattern** — Every test for a component using `useTranslation()` must mock `react-i18next`. The standard mock:

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

The `initReactI18next` export is required because `src/i18n.ts` imports it. For non-React files that call `i18n.t()` directly (e.g., `footerData.ts`), mock the i18n module itself:

```typescript
vi.mock('../../i18n', () => ({
  default: { t: (key: string) => key, language: 'ko' },
}));
```

### Component Extraction Pattern

Large components are split into sub-components within the same file (no separate files). `AboutPage.tsx` has 6 section components (`HeroSection`, `MissionSection`, etc.). `BlogComments.tsx` has `CommentItem` and `ReplyItem`. Data arrays and interfaces are at module scope above the sub-components.

### Path Alias

`@/` maps to `frontend/src/` (configured in `tsconfig.json`; Vite 8 resolves via native `resolve.tsconfigPaths: true` — `vite-tsconfig-paths` plugin removed).

## Testing

### Test Framework

Vitest with jsdom environment. Config in `frontend/vitest.config.ts`. Setup file: `frontend/src/setupTests.ts`. Mocks auto-reset between tests (`clearMocks`, `restoreMocks`, `mockReset` all true).

### Global Test Mocks (setupTests.ts)

These are mocked globally — do NOT re-mock in individual tests (with one exception noted below):

- `lucide-react` (cached Proxy — creates and caches icon components on demand, renders `<svg data-testid="icon-{Name}" />`), `framer-motion` (motion/AnimatePresence), `react-helmet-async`
  - **Exception**: Chat component tests (`ChatWindow`, `AdminPanel`, `MessageList`, `FileUpload`, `EmojiPicker`) must keep local `framer-motion` and/or `lucide-react` mocks because: (a) global framer-motion Proxy passes motion-specific props to DOM causing React warnings; (b) chat tests match icon names as text content (`screen.getByText('Send')`) which doesn't work with the global SVG mock
  - Non-chat tests should use the global mock and query icons via `data-testid="icon-{Name}"` (e.g., `icon-Mail`, `icon-Phone`, `icon-ExternalLink`)
- Browser APIs: `matchMedia`, `IntersectionObserver`, `ResizeObserver`, `localStorage`, `sessionStorage`, `navigator.serviceWorker`, `fetch`, `requestAnimationFrame`, `performance`, `window.gtag`
- Window: `alert`, `confirm`, `prompt`, `scrollTo`, `CSS.supports`, `location`, `history`, `innerWidth` (1024), `innerHeight` (768)
- Navigator: `onLine` (true), `language` (`'ko-KR'`)
- DOM: `Element.prototype.scrollIntoView`, `classList` patches, `document.querySelector/querySelectorAll/getElementById`
- Console: `console.error`/`console.warn` suppress known React warnings only

### Test Utilities

- `renderWithProviders` in `src/test-utils/renderWithProviders.tsx` — Wraps component in all providers (HelmetProvider, UIProvider, AuthProvider, BlogProvider, FormProvider, MemoryRouter). Uses `MemoryRouter` (not HashRouter) — correct for tests since it's controllable and doesn't require hash prefix. ChatProvider is excluded due to WebSocket complexity.
- Individual wrappers: `renderWithBlogProvider`, `renderWithAuthProvider`, `renderWithUIProvider`, `renderWithFormProvider`, `renderWithRouter` (in `renderWithProviders.tsx`).
- `src/test-utils/` also has: MSW mock server setup (`mocks/server.ts`, `mocks/handlers.ts`), polyfills.

### CI Test Config

- Uses forks pool with `maxForks: 2` in CI to manage memory while maintaining test isolation
- 15s timeout in CI, 10s locally
- 67 test files, 1048 tests, 0 failures, 0 skips. Backend: 104 tests, 0 failures

### E2E Testing (Playwright)

Config in `frontend/playwright.config.ts`. Tests in `frontend/e2e/` (5 spec files: homepage, profile, blog, contact, accessibility). Runs on Chromium, Firefox, WebKit, Mobile Chrome (Pixel 5), Mobile Safari (iPhone 12). `baseURL`: `http://localhost:5173`. CI: `retries: 2`, `workers: 1`, `forbidOnly: true`. `accessibility.spec.ts` covers dark mode toggle + persistence and language switching via `i18nextLng` localStorage key.

### Codecov

Coverage target: **60%** minimum, 5% threshold for drop. Separate flags for `frontend` and `backend`. Config in `codecov.yml`.

## CI/CD

### Commit Messages

PR checks enforce **conventional commits**: `type(scope): description`. Valid types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`, `deps`, `ci`.

### Pipelines

- **`main-ci-cd.yml`** — Runs on push/PR to `main`. Frontend tests → build → deploy to GitHub Pages via `actions/deploy-pages@v4` (backup; production uses Mac Mini nginx) → **deploy-mac-mini** (webhook trigger to Mac Mini for auto-deploy). Backend tests run against PostgreSQL 15 (timeout: 10min). Node 24, Python 3.12. Build uses `CI=false npm run build` (avoids warnings-as-errors). Uses `actions/checkout@v6`, `setup-node@v6`, `cache@v5`, `upload-artifact@v7`, `download-artifact@v8`, `configure-pages@v5`.
- **`pr-checks.yml`** — Runs on PRs. Quick checks (merge conflicts, commit messages, file size) → lint + affected tests + security scan (Trivy v0.35.0) + bundle size check (<10MB) + Lighthouse CI (performance/a11y/SEO audit via `@lhci/cli`, config in `frontend/lighthouserc.js`). Posts summary comment on PR.

## Critical Configuration

### Vite (`frontend/vite.config.ts`)

- `base: '/'` — Custom domain `emelmujiro.com` (no subpath needed). `frontend/public/CNAME` file kept for GitHub Pages backup
- Build output: `build/` (not `dist/`)
- Build pipeline: `generate:sitemap` → `tsc -p tsconfig.build.json` → `vite build` → `prerender.js` → `cp 404.html` (sitemap and prerender must succeed)
- Vite 8 uses oxc bundler (rolldown). `esbuild` options are ignored — console/debugger stripping is handled by oxc automatically in production
- Manual chunks use a function (not object) in `rollupOptions.output.manualChunks`: react-vendor, ui-vendor, i18n
- `build.target` is omitted — `@vitejs/plugin-legacy` sets targets automatically via its `targets` option (Chrome 64+)
- `@vitejs/plugin-legacy` generates `nomodule` fallback bundles for older Chromium-based browsers (KakaoTalk in-app WebView, Samsung Internet ≥9.2)
- `stripLocalhostCsp` custom plugin strips `localhost:8000`/`127.0.0.1:8000` from CSP `connect-src` in production builds (kept in dev for direct API calls)
- CSP `script-src` includes `'unsafe-eval'` and `data:` — **required** by `@vitejs/plugin-legacy` (SystemJS polyfill uses `new Function()`, module detection uses `data:text/javascript,...` URIs). `'unsafe-inline'` is also required for `index.html` inline scripts (error handler, theme detection, KakaoTalk fallback)
- Dev server proxies `/api` to `http://127.0.0.1:8000` (`strictPort: false` — tries next port if busy)

### Tailwind CSS 3.x

Downgraded from 4.x. PostCSS config (`frontend/postcss.config.js`) must use `tailwindcss: {}`, NOT `@tailwindcss/postcss`. Uses `darkMode: 'class'` (class-based, not media query). Custom colors: `dark.800/850/900/950`, `primary.400/500/600`, `success`, `warning`, `error`. Custom animations: `scroll` (32s, logos, `translateX(-33.333%)`) and `scroll-reverse` — logos are tripled (3 copies) for seamless infinite scrolling.

**Focus styles** — Global CSS (`index.css`) applies focus ring (`box-shadow`) only to `input:focus-visible` and `textarea:focus-visible`. Buttons and links have NO global focus ring — use `outline-none focus:outline-none` on individual elements. Do NOT add `button:focus` or `a:focus` box-shadow rules to global CSS; this causes persistent focus boxes on mouse click.

**Dynamic Tailwind classes** — Never use `bg-${color}-600` or similar dynamic class interpolation; Tailwind purges them at build time. Use static color maps instead (see `UnifiedLoading.tsx` `bgColorClasses`/`colorClasses` pattern).

### Prettier

Root `.prettierrc` is the canonical config: `printWidth: 100` for JS/TS, per-file overrides for md (80), html (120), package.json (120). `frontend/.prettierrc` also uses `printWidth: 100` (aligned with root).

### ESLint

ESLint 10 **flat config** format in `frontend/eslint.config.mjs` (not `.eslintrc`). Plugins: `@typescript-eslint`, `react`, `react-hooks`, `jsx-a11y`, `testing-library`. Production code: `no-console: ['warn', { allow: ['warn', 'error'] }]` — only `console.warn` and `console.error` are allowed. Test files have relaxed rules (no-unused-vars off, no-explicit-any off, no-console off, testing-library rules off). Unused vars prefixed with `_` are allowed.

### Pre-commit Hooks

Husky + lint-staged. `.husky/pre-commit` runs `npx lint-staged` from the **root** directory. `.lintstagedrc.js` at repo root handles path translation for both frontend and backend: converts absolute paths to directory-relative paths using `path.relative()`, then runs `cd frontend && eslint --fix` + `prettier --write` for frontend TS/JS/CSS, `prettier --write` for `*.{json,md,yml,yaml}`, and `cd backend && uv run black --check` (check only, not auto-fix) + `cd backend && uv run flake8` for Python. Note: `.lintstagedrc.js` takes precedence over any `lint-staged` config in `package.json`.

### Backend Django Config

- `SECRET_KEY` **required** in production (`DEBUG=False`); raises `ImproperlyConfigured` if missing
- Database: SQLite by default. Set `DATABASE_URL` for PostgreSQL — parsed via `urllib.parse.urlparse` (no `dj-database-url` dependency)
- Channel Layers: Redis when `REDIS_URL` is set, InMemoryChannelLayer otherwise
- WebSocket: `ChatConsumer` requires authentication (rejects `AnonymousUser` in `connect()`); client message types are whitelisted via `ALLOWED_MESSAGE_TYPES` — invalid types are rejected with error (not silently defaulted)
- JWT: access 30min, refresh 7 days, rotation + blacklist. `rest_framework_simplejwt.token_blacklist` is in INSTALLED_APPS — logout endpoint blacklists refresh tokens. Auth uses **httpOnly cookies** (`access_token`, `refresh_token`) via `CookieJWTAuthentication` (`api/authentication.py`) — reads from cookie first, falls back to `Authorization` header. Cookie settings: `JWT_COOKIE_HTTPONLY=True`, `JWT_COOKIE_SECURE=True` in production, `JWT_COOKIE_SAMESITE="Lax"`. All auth endpoints (`login`, `register`, `logout`, `change_password`, `token_refresh`) set/clear cookies automatically via `_set_jwt_cookies()`/`_clear_jwt_cookies()` helpers in `auth.py`
- DRF throttling: anon 100/hr, user 1000/hr, contact 5/hr, newsletter 3/hr. Pagination: `StandardPagination` (page_size=10, max_page_size=100, `?page_size=N` query param)
- File upload validation: `api/validators.py` — case-insensitive extension, MIME type, size (5MB)
- API docs: Swagger at `/api/docs/`, ReDoc at `/api/redoc/` (drf-yasg)
- Backend endpoints: `/api/blog-posts/`, `/api/contact/`, `/api/newsletter/`, `/api/categories/`, `/api/health/`, `/api/notifications/` (authenticated — list, retrieve, mark_all_read, unread_count), `/api/auth/{register,login,logout,user,user/update,change-password,token/refresh,token/verify}/`, `/api/admin/stats/` (admin only — returns totalUsers/totalPosts/totalMessages/totalViews), `/api/admin/content/` (admin only — returns blog post list). `/api/send-test-email/` only registered when `DEBUG=True`
- UserSerializer includes a `role` field (read-only): returns `"admin"` (superuser), `"staff"`, or `"user"`
- Custom middleware registered in MIDDLEWARE: `RequestSecurityMiddleware` (IP blocking, rate limiting, malicious pattern detection), `ContentSecurityMiddleware` (CSP + security headers), `APIResponseTimeMiddleware` (slow request logging)
- Management commands: `cleanup_sitevisits` (delete old SiteVisit records, `--days 90` default, `--dry-run` option)
- Timezone: `Asia/Seoul`, language: `ko-kr`
- File upload: 5MB max; allowed extensions: `.jpg`, `.jpeg`, `.png`, `.gif`, `.pdf`, `.doc`, `.docx`
- CI uses `uv sync --frozen --extra dev` (lockfile must be up to date; `--extra dev` installs black, flake8, pytest from `[project.optional-dependencies]`)

### Deployment (Mac Mini)

Both frontend and backend run on Mac Mini via Docker + Cloudflare Tunnel:

- **Frontend**: `nginx:alpine` container serving `frontend/build/` via volume mount. Runs on port 8080 with `try_files $uri $uri/ /index.html` for SPA routing. Connected to `emelmujiro_emelmujiro-network` Docker network.

  ```bash
  # Start frontend container (first time)
  docker run -d --name emelmujiro-frontend --restart unless-stopped \
    --network emelmujiro_emelmujiro-network --network-alias frontend \
    -p 8080:80 \
    -v /path/to/frontend/build:/usr/share/nginx/html:ro \
    -v /path/to/frontend/nginx.conf:/etc/nginx/nginx.conf:ro \
    nginx:alpine

  # Update frontend (rebuild only, no container restart needed)
  cd frontend && git pull && VITE_API_URL=https://api.emelmujiro.com/api npm run build
  ```

- **Backend**: `docker-compose.yml` with SQLite (default). Start with required env vars via `backend/.env`:

  ```bash
  docker compose up -d backend
  ```

  Note: `docker-compose.yml` `environment` section overrides `env_file` — pass env vars as shell variables to override defaults.

- **Cloudflare Tunnel**: Config at `/etc/cloudflared/config.yml` (edit `~/.cloudflared/config.yml` then `sudo cp`). Runs as launchd daemon (`/Library/LaunchDaemons/com.cloudflare.cloudflared.plist`). Restart with `sudo launchctl kickstart -k system/com.cloudflare.cloudflared`.

  ```yaml
  ingress:
    - hostname: api.emelmujiro.com
      service: http://localhost:8000
    - hostname: emelmujiro.com
      service: http://localhost:8080
    - service: http_status:404
  ```

- **Dockerfile**: Backend `collectstatic` uses a placeholder `SECRET_KEY` at build time (`RUN SECRET_KEY=build-only-placeholder ...`) because Django requires it to load settings.

- **Docker Desktop**: Must be running before `docker compose up`. Enable "Start Docker Desktop when you sign in" in Docker Desktop settings for auto-start on boot.

- **Auto-deploy**: `scripts/deploy-webhook.js` (Node.js HTTP server on port 9000) receives deploy requests from GitHub Actions via `https://deploy.emelmujiro.com/deploy`. Authenticated with `X-Deploy-Secret` header (timing-safe comparison). Triggers `scripts/auto-deploy.sh` (git pull → frontend build → backend docker rebuild). Runs as launchd daemon (`com.emelmujiro.deploy-webhook`). Requires `DEPLOY_SECRET` env var and `deploy.emelmujiro.com` Cloudflare Tunnel route.

- **Maintenance page**: `scripts/maintenance-worker.js` is a Cloudflare Worker that returns a branded 503 page when the origin is unreachable. Deploy via Cloudflare Dashboard → Workers. Routes: `emelmujiro.com/*` and `api.emelmujiro.com/*`. API requests get JSON error response; browser requests get HTML.

### Pre-deploy Check

`scripts/pre-deploy-check.sh` runs a comprehensive checklist before production deploy: env files (`VITE_API_URL`, `VITE_SENTRY_DSN`, `VITE_GA_TRACKING_ID`), TypeScript, ESLint, console.log scan, tests, build, SEO assets (robots.txt, sitemap, manifest, favicon, `.nojekyll`), API key scan, npm audit, git status, large image check (>500KB), bundle size.

### Dependabot

`.github/dependabot.yml` runs weekly updates (Mondays 04:00) for npm, pip, GitHub Actions, and Docker. **Blocked major version updates**: `tailwindcss`, `framer-motion`, `web-vitals`, `lint-staged`, `@types/node`. Secrets template in `.github/SECRETS-TEMPLATE.md`.

## Common Pitfalls

1. **Wrong port**: Frontend is 5173, not 3000
2. **Mock API**: Active only in tests or when `env.API_URL` is empty. Production uses `api.emelmujiro.com` (Mac Mini backend)
3. **Build output**: `build/`, not `dist/`
4. **Test count**: Frontend 67 files / 1048 tests, Backend 104 tests, 0 failures, E2E 5 spec files (as of 2026-03-17)
5. **Environment variables**: Use `VITE_` prefix for new vars (legacy `REACT_APP_` still supported via env.ts shim)
6. **React 19 `useRef` requires initial value**: `useRef<T>()` causes TS2554; always pass `null`: `useRef<T>(null)`. This applies to all timer refs, DOM refs, etc.
7. **ESLint 10 flat config**: Upgraded from v9 to v10. Root `package.json` eslint version must match frontend's (both `^10.x`). Don't downgrade — plugins are compatible with ESLint 10
8. **minimatch override**: Root and frontend `package.json` both have `overrides` to force `minimatch>=10.2.1` for security. Don't remove these
9. **Conventional commits required**: PR checks validate commit message format (`type(scope): description`)
10. **Build uses separate tsconfig**: `tsconfig.build.json` excludes test types and files; the build script runs `tsc -p tsconfig.build.json`. Don't add test-only types (like `@testing-library/jest-dom`) to `tsconfig.build.json`. `tsconfig.ci.json` extends `tsconfig.build.json` with `strict: true` (only relaxes `noUnusedLocals`/`noUnusedParameters`)
11. **CI cache**: Both `node_modules/` and `frontend/node_modules/` are cached using `hashFiles('package-lock.json')` (root lock file, not `frontend/package-lock.json` which doesn't exist in npm workspaces)
12. **Sitemap generation in build**: `npm run build` first runs `scripts/generate-sitemap.js`. If this script fails, the entire build fails
13. **Under construction routes**: Chat is under construction (1.0 이후). `/blog` is active (connected to real backend). `/contact` uses Google Form embed (see "Contact Page" section). When re-enabling chat, restore `ChatWidget` in `AppLayout` and add `ChatProvider` to `App.tsx` provider hierarchy. When switching `/contact` back to the backend API form, update `App.tsx`, `ContactPage.tsx`, and `e2e/contact.spec.ts`
14. **Backend blog router**: `backend/api/urls.py` registers BlogPostViewSet with `basename="blog"` (NOT `"blog-posts"`). DRF generates URL names as `blog-list` and `blog-detail`
15. **No dynamic Tailwind classes**: `bg-${var}-600` is purged at build time. Always use static class maps
16. **No global focus box-shadow on buttons/links**: Only `input`/`textarea` have global focus ring in `index.css`. Adding `button:focus` box-shadow to global CSS will cause persistent focus boxes on mouse click
17. **setTimeout cleanup**: All `setTimeout` calls in components and contexts must store the timer ID in a `useRef(null)` and `clearTimeout` in the useEffect cleanup to prevent memory leaks. Already applied in: `UIContext`, `FormContext`, `Navbar`, `Footer`, `BlogInteractions`, `BlogSearch`, `ChatContext` (reconnect timer). Follow the same pattern for any new `setTimeout` usage
18. **Comments in English**: All code comments must be in English. Korean comments were converted to English across the entire codebase (sentry.ts, logger.ts, BlogContext.tsx, api.ts, global.d.ts, etc.). Do not add Korean comments
19. **Logger has no named exports**: `logger.ts` only exports `default` (singleton instance). Import as `import logger from '../utils/logger'`, not destructured. Uses `env.IS_DEVELOPMENT` from `config/env.ts` — do NOT use `process.env.NODE_ENV` directly in frontend code
20. **No `window.alert()` in components**: Use inline toast state pattern instead (`ToastState` interface + `useRef` timer + auto-dismiss + `role="alert"` element). Already applied in `BlogEditor.tsx` and `SharePage.tsx`. Tests assert via `screen.getByRole('alert')`, not `alertSpy`
21. **Backend tests need `DATABASE_URL=""`**: If `DATABASE_URL` is set (e.g., pointing to Docker PostgreSQL), backend tests will fail to connect. Run `DATABASE_URL="" uv run python manage.py test` to use SQLite
22. **SEO with BrowserRouter**: All canonical URLs and OG URLs use clean paths (e.g., `${SITE_URL}/about`). Production nginx `try_files` returns 200 for all SPA routes. `hreflang` alternate links are generated by `SEOHelmet` for each page (ko, en, x-default). Korean URLs have no prefix (`/about`), English URLs use `/en` prefix (`/en/about`). The sitemap includes bilingual entries with `xhtml:link` alternates. The `sameAs` field in structured data must only contain verified, existing URLs
23. **No hardcoded site URLs in components**: Always use `SITE_URL` from `src/utils/constants.ts`. The `generate-sitemap.js` script has its own `SITE_URL` constant (Node.js, can't import from frontend)
24. **ESLint workspace hoisting**: `eslint` must be in root `package.json` devDependencies (same major version as frontend) alongside `eslint-plugin-react` (which npm hoists to root `node_modules/`). The plugin does `require('eslint/package.json')` — if eslint is only in `frontend/node_modules/`, the plugin can't find it. Don't remove eslint from root devDependencies
25. **ESLint zero warnings policy**: All ESLint warnings have been resolved (0 errors, 0 warnings as of 2026-03-10). Maintain this — don't introduce new warnings. Use `useCallback` for functions passed to context `useMemo`, prefix unused params with `_`, add `role`/`onKeyDown`/`tabIndex` for clickable non-interactive elements
26. **Backend dev deps use `--extra dev`**: Dev tools (black, flake8, pytest) are in `[project.optional-dependencies]` not `[tool.uv.dev-dependencies]`. Use `uv sync --extra dev` (not `uv sync --dev`). CI uses `uv sync --frozen --extra dev`
27. **react-helmet-async v3 ships own types**: `@types/react-helmet-async` is deprecated and removed. The custom `src/@types/react-helmet-async.d.ts` is also removed. Do not re-add either
28. **KakaoTalk WebView — React loads normally, errors visible**: React app renders in all browsers including Android KakaoTalk. Do NOT block React from loading or hide `#root` for any browser. iOS KakaoTalk shows a dismissible banner with `kakaotalk://web/openExternal` scheme. If rendering fails, `__showError()` displays the error + user agent on-screen with a `kakaotalk://web/openExternal` button (for KakaoTalk) or reload button. `window.__appLoaded` must be set inside `AppLayout` (not provider level) — setting it too early suppresses all error handlers
29. **OG image uses logo512.png**: No dedicated `og-image.png` exists. All OG/Twitter image references (`index.html`, `SEOHelmet.tsx`, `StructuredData.tsx`, `constants.ts`) point to `logo512.png` (1024x1024). Replace references when a proper 1200x630 OG image is designed
30. **FAQPage/Course schemas are static only**: FAQPage and Course JSON-LD are in `index.html` as static markup (crawlers read these without JS). Do NOT add them to `StructuredData.tsx` — that creates duplicate structured data when React renders
31. **AdminDashboard sub-components**: `AdminSidebar`, `AdminOverview`, `AdminContentTable`, `DeleteConfirmModal` are extracted as sub-components within the same file (following the component extraction pattern). Props interfaces: `SidebarProps`, `OverviewProps`, `ContentTableProps`, `DeleteModalProps`
32. **ChatContext static values**: `agentAvailable`, `agentName`, `agentAvatar`, `settings` are plain constants (not useState) since chat is under construction and setters were never called

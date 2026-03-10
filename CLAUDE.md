# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Emelmujiro (에멜무지로) is a full-stack monorepo for an AI Education & Consulting platform. Frontend is React/TypeScript deployed to GitHub Pages; backend is Django (not yet deployed to production). Licensed under Apache 2.0.

- **Live Site**: https://researcherhojin.github.io/emelmujiro
- **Frontend Dev**: http://localhost:5173 (Vite) — **NOT port 3000**
- **Backend Dev**: http://localhost:8000 (Django)
- **Mock API** — Controlled by `USE_MOCK_API` in `frontend/src/services/api.ts`. Mock is active when `VITE_API_URL` is unset or equals the placeholder `https://api.emelmujiro.com/api`. Set `VITE_API_URL` to a real backend URL to disable mock.

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
npm run build              # generate:sitemap → tsc -p tsconfig.build.json → vite build
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
uv sync --dev              # Install with dev dependencies
uv run python manage.py migrate  # Run migrations (required for first setup)
uv run python manage.py runserver
uv run python manage.py test
uv run black .             # Format (line length 120)
uv run flake8 .            # Lint (line length 120)
uv run isort .             # Sort imports
uv run ruff check .        # Fast lint

# Deploy (from frontend/)
npm run deploy             # Build + deploy to GitHub Pages via gh-pages

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
- `backend/` — Django 5 + DRF + JWT auth + WebSocket (Channels/Daphne). Single app: `api/`. Uses **uv** for dependency management (`pyproject.toml` + `uv.lock`). Chat/Redis excluded from 1.0 scope
- Root `package.json` uses npm workspaces pointing to `frontend/`
- Docker support: `docker-compose.yml` (prod: backend + frontend/nginx + PostgreSQL; Redis only with `--profile chat`) and `docker-compose.dev.yml` (dev with hot-reload). Production `docker-compose.yml` passes `VITE_API_URL` as build arg; `frontend/Dockerfile` declares `ARG VITE_API_URL` + `ENV VITE_API_URL` before `npm run build` so Vite can inline it

### Routing

Uses `createHashRouter` (HashRouter) in `frontend/src/App.tsx`. All pages are lazy-loaded. Routes: `/`, `/about`, `/contact`, `/profile`, `/share`, `/blog`, `/blog/:id`, `/blog/new`, `/admin` (protected, requires admin role), `*` (404 NotFound).

### Under Construction Pages

Blog and Chat features are **not functional** on GitHub Pages (mock data only, hardcoded responses). These routes render `UnderConstruction` component instead of the original pages:

- `/blog`, `/blog/new`, `/blog/:id` → `<UnderConstruction featureKey="blog" />`
- `ChatWidget` removed from `AppLayout` entirely

The `UnderConstruction` component (`src/components/common/UnderConstruction.tsx`) accepts a `featureKey` prop (`blog` | `chat`) for feature-specific i18n descriptions. Original component files (`BlogListPage.tsx`, `BlogDetail.tsx`, `BlogEditor.tsx`, `ChatWidget.tsx`) are **preserved** — they have their own tests that import them directly. Provider hierarchy (`BlogProvider`, `FormProvider`) is retained for existing test compatibility. `ChatProvider` exists in `src/contexts/` for test compatibility but is NOT in `App.tsx` provider hierarchy. Navbar and footer links to `/blog` and `/contact` are intentionally kept.

### Contact Page (Google Form)

`/contact` uses a Google Form iframe embed instead of the backend API. `ContactPage.tsx` embeds `https://docs.google.com/forms/d/e/.../viewform?embedded=true`. The original `ContactForm` component and `FormContext` are preserved for test compatibility but not used in the live route. CSP in `index.html` includes `frame-src https://docs.google.com` to allow the iframe. The "open in new tab" link uses the `?usp=dialog` variant. i18n keys: `contact.googleForm.*` (description, loading, openInNewTab, formTitle).

### KakaoTalk In-App Browser Support

Galaxy Android의 KakaoTalk 인앱 WebView에서 `type="module"` 스크립트가 실행되지 않는 문제를 다층 폴백으로 해결:

1. **Vite legacy plugin** — `nomodule` 폴백 번들 생성 (module 미지원 브라우저용)
2. **Vite built-in detection** — 모던 번들 실패 시 legacy 번들 동적 로딩 (`type="module"` 내부)
3. **KakaoTalk-specific fallback** — `index.html`의 plain `<script>`에서 DOMContentLoaded + 2초 후 `window.__appLoaded` 확인, false면 `vite-legacy-polyfill`/`vite-legacy-entry`를 동적으로 로딩. `type="module"`이나 `nomodule`에 의존하지 않아 WebView 모듈 지원 버그를 우회
4. **10초 general fallback** — 아무것도 로드되지 않으면 "외부 브라우저에서 열기" 메시지 표시
5. **`window.onerror` handler** — `<head>` 최상단에 에러 핸들러가 인라인 스크립트 에러를 시각적으로 표시

Key files: `index.html` (detection + fallbacks), `main.tsx` (`window.__appLoaded = true`), `Layout.tsx` (KakaoTalk banner + Android `intent://` scheme for external browser), `global.d.ts` (`__isKakaoInApp`, `__appLoaded`, `performanceStart` types).

Loading skeleton uses **inline styles** (not Tailwind classes) so it's visible before CSS loads. Layout banner uses `t('common.kakaoBanner')` / `t('common.openExternal')` i18n keys.

### State Management

- **React Context** — All state management via UIContext, AuthContext, BlogContext, FormContext, ChatContext (all in `src/contexts/`). All providers use `useMemo` for value objects and `useCallback` for functions to prevent unnecessary re-renders.
- **ChatContext split** — `ChatContext.tsx` imports types/helpers from `chatHelpers.ts` (types, defaults, utilities) and delegates WebSocket logic to `useChatConnection.ts` (custom hook). Consumer code imports from `ChatContext.tsx` which re-exports all types.
- **Types** — `src/types/index.ts` exports: `BlogPost`, `ContactFormData`, `PaginatedResponse`, `ErrorResponse`.

### Mock API System

`frontend/src/services/api.ts` uses centralized env config from `src/config/env.ts`. `USE_MOCK_API` is `env.IS_TEST || !env.API_URL || env.API_URL === PLACEHOLDER_API`. When `VITE_API_URL` is set to a real deployed backend URL, mock is automatically disabled. Mock data lives in `src/services/mockData.ts`. Every API method (blog, contact, newsletter, health) has a mock path.

### API Client

Axios-based client in `src/services/api.ts`. All API methods (blog, contact, newsletter, auth, health) are centralized in the `api` object with mock support. Auth methods (`getUser`, `login`, `logout`, `register`) are part of the `api` object — `AuthContext` imports `{ api }` not the default axios instance. 30s timeout with automatic retry on timeout. JWT tokens stored in localStorage (`authToken`, `refreshToken`); 401 responses trigger automatic token refresh before clearing auth. HTTP is upgraded to HTTPS in production.

### Sentry

`@sentry/react` v10 is integrated via `src/utils/sentry.ts`. `initSentry()` is called in `main.tsx`. Only active when `ENABLE_SENTRY=true` and `SENTRY_DSN` is set (both default to off). No action needed unless enabling error tracking. `main.tsx` uses `env.IS_DEVELOPMENT` / `env.IS_PRODUCTION` from `src/config/env.ts` instead of `process.env.NODE_ENV`.

### Environment Variables

`frontend/src/config/env.ts` exports `getEnvVar()` helper that checks `VITE_` prefixed vars first, falls back to `REACT_APP_` prefixed vars. New env vars should use the `VITE_` prefix. Key frontend env vars: `VITE_API_URL`, `VITE_WS_URL`, `VITE_SENTRY_DSN`, `VITE_ENABLE_SENTRY`, `VITE_ENABLE_ANALYTICS`, `VITE_GA_TRACKING_ID`, `VITE_CONTACT_EMAIL`. Backend env vars documented in `backend/.env.example`.

### Site URL & Contact Email

`SITE_URL` and `CONTACT_EMAIL` are defined in `src/utils/constants.ts`. `SITE_URL` is the canonical base URL used by all SEO components (SEOHelmet, StructuredData), page canonical links, and OG tags — **never hardcode** `https://researcherhojin.github.io/emelmujiro` in components; always import `SITE_URL`. Page components pass URLs as `url={`${SITE_URL}/#/about`}` (hash fragment required for HashRouter). `CONTACT_EMAIL` uses `import.meta.env.VITE_CONTACT_EMAIL` with fallback.

### Provider Hierarchy

`App.tsx` wraps the app in: `HelmetProvider > ErrorBoundary > UIProvider > AuthProvider > BlogProvider > FormProvider > RouterProvider`. ChatProvider is excluded (chat is under construction).

### Route Protection

`ProtectedRoute` component (`src/components/common/ProtectedRoute.tsx`) checks auth state and optional role requirement. Currently used to protect `/admin` route with `requiredRole="admin"`. Redirects to `/` when unauthorized.

### i18n

Uses `i18next` + `react-i18next` with browser language detection. Fallback language is Korean (`ko`). Translations live in `frontend/src/i18n/locales/{ko,en}.json`. Configured in `frontend/src/i18n.ts` with `useSuspense: false`. All UI strings, data files, contexts, and SEO modules use i18n — no hardcoded Korean in components. Non-React files that need translations (e.g., `websocket.ts`, `ChatContext.tsx`) import `i18n` directly and call `i18n.t()`. The `blogPosts.ts` mock data file is an exception — it contains Korean content strings as placeholder blog post data, not UI strings.

**SEO bot detection** — `i18n.ts` detects search engine bots (Googlebot, Bingbot, etc.) via `navigator.userAgent` and forces them to use `['htmlTag']` detection order (resolving to `ko` from `index.html`'s `lang="ko"`). This ensures Korean content is indexed by search engines regardless of the bot's `Accept-Language` header. Non-bot users get the normal detection order: `localStorage → navigator → htmlTag`. Bot detection also disables localStorage caching to prevent stale language preferences.

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

`@/` maps to `frontend/src/` (configured in both `tsconfig.json` and `vite.config.ts`).

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
- 69 test files, 1109 tests, 0 failures, 0 skips. Backend: 69 tests, 0 failures

### E2E Testing (Playwright)

Config in `frontend/playwright.config.ts`. Tests in `frontend/e2e/` (5 spec files: homepage, profile, blog, contact, accessibility). Runs on Chromium, Firefox, WebKit, Mobile Chrome (Pixel 5), Mobile Safari (iPhone 12). `baseURL`: `http://localhost:5173`. CI: `retries: 2`, `workers: 1`, `forbidOnly: true`. `accessibility.spec.ts` covers dark mode toggle + persistence and language switching via `i18nextLng` localStorage key.

### Codecov

Coverage target: **60%** minimum, 5% threshold for drop. Separate flags for `frontend` and `backend`. Config in `codecov.yml`.

## CI/CD

### Commit Messages

PR checks enforce **conventional commits**: `type(scope): description`. Valid types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`, `deps`, `ci`.

### Pipelines

- **`main-ci-cd.yml`** — Runs on push/PR to `main`. Frontend tests → build → deploy to GitHub Pages. Backend tests run against PostgreSQL 15 (timeout: 10min). Node 22, Python 3.12. Build uses `CI=false npm run build` (avoids warnings-as-errors). Uses `actions/upload-artifact@v7` and `actions/download-artifact@v8`. Has a commented `deploy-backend` job placeholder for future backend deployment.
- **`pr-checks.yml`** — Runs on PRs. Quick checks (merge conflicts, commit messages, file size) → lint + affected tests + security scan (Trivy v0.34.1) + bundle size check (<10MB). Posts summary comment on PR.

## Critical Configuration

### Vite (`frontend/vite.config.ts`)

- `base: '/emelmujiro/'` — Required for GitHub Pages subpath
- Build output: `build/` (not `dist/`)
- Build pipeline: `generate:sitemap` → `tsc -p tsconfig.build.json` → `vite build` (sitemap must succeed)
- esbuild minifier (switched from Terser for ~10x faster builds). `esbuild.drop: ['console', 'debugger']` in production
- Manual chunks: react-vendor, ui-vendor, i18n
- `build.target: ['chrome64', 'safari12', 'firefox63', 'edge79']` — ensures modern bundle compatibility with older WebViews. Matches the legacy plugin's modern browser detection level (Chrome 64+)
- `@vitejs/plugin-legacy` generates `nomodule` fallback bundles for older Chromium-based browsers (KakaoTalk in-app WebView, Samsung Internet ≥9.2)
- `stripLocalhostCsp` custom plugin strips `localhost:8000`/`127.0.0.1:8000` from CSP `connect-src` in production builds (kept in dev for direct API calls)
- Dev server proxies `/api` to `http://127.0.0.1:8000` (`strictPort: false` — tries next port if busy)

### Tailwind CSS 3.x

Downgraded from 4.x. PostCSS config (`frontend/postcss.config.js`) must use `tailwindcss: {}`, NOT `@tailwindcss/postcss`. Uses `darkMode: 'class'` (class-based, not media query). Custom colors: `dark.800/850/900/950`, `primary.400/500/600`, `success`, `warning`, `error`. Custom animations: `scroll` (32s, logos, `translateX(-33.333%)`) and `scroll-reverse` — logos are tripled (3 copies) for seamless infinite scrolling.

**Focus styles** — Global CSS (`index.css`) applies focus ring (`box-shadow`) only to `input:focus-visible` and `textarea:focus-visible`. Buttons and links have NO global focus ring — use `outline-none focus:outline-none` on individual elements. Do NOT add `button:focus` or `a:focus` box-shadow rules to global CSS; this causes persistent focus boxes on mouse click.

**Dynamic Tailwind classes** — Never use `bg-${color}-600` or similar dynamic class interpolation; Tailwind purges them at build time. Use static color maps instead (see `UnifiedLoading.tsx` `bgColorClasses`/`colorClasses` pattern).

### Prettier

Root `.prettierrc` is the canonical config: `printWidth: 100` for JS/TS, per-file overrides for md (80), html (120), package.json (120). `frontend/.prettierrc` exists with `printWidth: 80` but the root config's overrides take precedence for JS/TS files when run from root (lint-staged runs from root).

### ESLint

ESLint 9 **flat config** format in `frontend/eslint.config.mjs` (not `.eslintrc`). Plugins: `@typescript-eslint`, `react`, `react-hooks`, `jsx-a11y`, `testing-library`. Production code: `no-console: ['warn', { allow: ['warn', 'error'] }]` — only `console.warn` and `console.error` are allowed. Test files have relaxed rules (no-unused-vars off, no-explicit-any off, no-console off, testing-library rules off). Unused vars prefixed with `_` are allowed.

### Pre-commit Hooks

Husky + lint-staged. `.husky/pre-commit` runs `npx lint-staged` from the **root** directory. `.lintstagedrc.js` at repo root handles path translation for both frontend and backend: converts absolute paths to directory-relative paths using `path.relative()`, then runs `cd frontend && eslint --fix` + `prettier --write` for frontend TS/JS/CSS, `prettier --write` for `*.{json,md,yml,yaml}`, and `cd backend && uv run black --check` (check only, not auto-fix) + `cd backend && uv run flake8` for Python. Note: `.lintstagedrc.js` takes precedence over any `lint-staged` config in `package.json`.

### Backend Django Config

- `SECRET_KEY` **required** in production (`DEBUG=False`); raises `ImproperlyConfigured` if missing
- Database: SQLite by default. Set `DATABASE_URL` for PostgreSQL — parsed via `urllib.parse.urlparse` (no `dj-database-url` dependency)
- Channel Layers: Redis when `REDIS_URL` is set, InMemoryChannelLayer otherwise
- WebSocket: `ChatConsumer` requires authentication (rejects `AnonymousUser` in `connect()`); client message types are whitelisted via `ALLOWED_MESSAGE_TYPES` to prevent arbitrary handler dispatch
- JWT: access 30min, refresh 7 days, rotation + blacklist. `rest_framework_simplejwt.token_blacklist` is in INSTALLED_APPS — logout endpoint blacklists refresh tokens
- DRF throttling: anon 100/hr, user 1000/hr, contact 5/hr, newsletter 3/hr
- File upload validation: `api/validators.py` — case-insensitive extension, MIME type, size (5MB)
- API docs: Swagger at `/api/docs/`, ReDoc at `/api/redoc/` (drf-yasg)
- Backend endpoints: `/api/blog-posts/`, `/api/contact/`, `/api/newsletter/`, `/api/categories/`, `/api/health/`, `/api/auth/{register,login,logout,user,user/update,change-password,token/refresh,token/verify}/`. `/api/send-test-email/` only registered when `DEBUG=True`
- Custom middleware registered in MIDDLEWARE: `RequestSecurityMiddleware` (IP blocking, rate limiting, malicious pattern detection), `ContentSecurityMiddleware` (CSP + security headers), `APIResponseTimeMiddleware` (slow request logging)
- Timezone: `Asia/Seoul`, language: `ko-kr`
- File upload: 5MB max; allowed extensions: `.jpg`, `.jpeg`, `.png`, `.gif`, `.pdf`, `.doc`, `.docx`
- CI uses `uv sync --frozen` (lockfile must be up to date)

### Pre-deploy Check

`scripts/pre-deploy-check.sh` runs a comprehensive checklist before production deploy: env files (`VITE_API_URL`, `VITE_SENTRY_DSN`, `VITE_GA_TRACKING_ID`), TypeScript, ESLint, console.log scan, tests, build, SEO assets (robots.txt, sitemap, manifest, favicon, `.nojekyll`), API key scan, npm audit, git status, large image check (>500KB), bundle size.

### Dependabot

`.github/dependabot.yml` runs weekly updates (Mondays 04:00) for npm, pip, GitHub Actions, and Docker. **Blocked major version updates**: `tailwindcss`, `framer-motion`, `web-vitals`, `lint-staged`, `@types/node`. Secrets template in `.github/SECRETS-TEMPLATE.md`.

## Common Pitfalls

1. **Wrong port**: Frontend is 5173, not 3000
2. **Mock API**: On by default (GitHub Pages has no backend). Set `VITE_API_URL` to a real backend URL to disable
3. **Build output**: `build/`, not `dist/`
4. **Test count**: Frontend 69 files / 1109 tests, Backend 69 tests, 0 failures, E2E 5 spec files (as of 2026-03-10)
5. **Environment variables**: Use `VITE_` prefix for new vars (legacy `REACT_APP_` still supported via env.ts shim)
6. **React 19 `useRef` requires initial value**: `useRef<T>()` causes TS2554; always pass `null`: `useRef<T>(null)`. This applies to all timer refs, DOM refs, etc.
7. **ESLint must stay on v9**: Plugins (jsx-a11y, react, react-hooks) don't support ESLint 10 yet. Don't upgrade ESLint major version without checking plugin compatibility
8. **minimatch override**: Root and frontend `package.json` both have `overrides` to force `minimatch>=10.2.1` for security. Don't remove these
9. **Conventional commits required**: PR checks validate commit message format (`type(scope): description`)
10. **Build uses separate tsconfig**: `tsconfig.build.json` excludes test types and files; the build script runs `tsc -p tsconfig.build.json`. Don't add test-only types (like `@testing-library/jest-dom`) to `tsconfig.build.json`. `tsconfig.ci.json` extends `tsconfig.build.json` with `strict: true` (only relaxes `noUnusedLocals`/`noUnusedParameters`)
11. **CI cache**: Both `node_modules/` and `frontend/node_modules/` are cached using `hashFiles('package-lock.json')` (root lock file, not `frontend/package-lock.json` which doesn't exist in npm workspaces)
12. **Sitemap generation in build**: `npm run build` first runs `scripts/generate-sitemap.js`. If this script fails, the entire build fails
13. **Under construction routes**: `/blog` and chat are currently under construction. `/contact` uses Google Form embed (see "Contact Page" section). The original blog/chat page components and their tests still exist but are not routed in `App.tsx`. When re-enabling blog, update `App.tsx` routes, restore `ChatWidget` in `AppLayout`, and update `generate-sitemap.js`, `manifest.json`, `lighthouserc.js`, and E2E tests (`e2e/blog.spec.ts`). When switching `/contact` back to the backend API form, update `App.tsx`, `ContactPage.tsx`, and `e2e/contact.spec.ts`
14. **Backend blog router**: `backend/api/urls.py` registers BlogPostViewSet with `basename="blog"` (NOT `"blog-posts"`). DRF generates URL names as `blog-list` and `blog-detail`
15. **No dynamic Tailwind classes**: `bg-${var}-600` is purged at build time. Always use static class maps
16. **No global focus box-shadow on buttons/links**: Only `input`/`textarea` have global focus ring in `index.css`. Adding `button:focus` box-shadow to global CSS will cause persistent focus boxes on mouse click
17. **setTimeout cleanup**: All `setTimeout` calls in components and contexts must store the timer ID in a `useRef(null)` and `clearTimeout` in the useEffect cleanup to prevent memory leaks. Already applied in: `UIContext`, `FormContext`, `Navbar`, `Footer`, `BlogInteractions`, `BlogSearch`, `ChatContext` (reconnect timer). Follow the same pattern for any new `setTimeout` usage
18. **Comments in English**: All code comments must be in English. Korean comments were converted to English across the entire codebase (sentry.ts, logger.ts, BlogContext.tsx, api.ts, global.d.ts, etc.). Do not add Korean comments
19. **Logger has no named exports**: `logger.ts` only exports `default` (singleton instance). Import as `import logger from '../utils/logger'`, not destructured. Uses `env.IS_DEVELOPMENT` from `config/env.ts` — do NOT use `process.env.NODE_ENV` directly in frontend code
20. **No `window.alert()` in components**: Use inline toast state pattern instead (`ToastState` interface + `useRef` timer + auto-dismiss + `role="alert"` element). Already applied in `BlogEditor.tsx` and `SharePage.tsx`. Tests assert via `screen.getByRole('alert')`, not `alertSpy`
21. **Backend tests need `DATABASE_URL=""`**: If `DATABASE_URL` is set (e.g., pointing to Docker PostgreSQL), backend tests will fail to connect. Run `DATABASE_URL="" uv run python manage.py test` to use SQLite
22. **SEO with HashRouter**: All canonical URLs and OG URLs must include `/#/` (e.g., `${SITE_URL}/#/about`). `robots.txt` must NOT use hash fragment directives (non-standard). Sitemap URLs include `/#/`. `hreflang` alternate language tags are omitted because the SPA serves both languages from the same URL via client-side i18n. The `sameAs` field in structured data must only contain verified, existing URLs
23. **No hardcoded site URLs in components**: Always use `SITE_URL` from `src/utils/constants.ts`. The `generate-sitemap.js` script has its own `SITE_URL` constant (Node.js, can't import from frontend)
24. **ESLint workspace hoisting**: `eslint` must be in root `package.json` devDependencies alongside `eslint-plugin-react` (which npm hoists to root `node_modules/`). The plugin does `require('eslint/package.json')` — if eslint is only in `frontend/node_modules/`, the plugin can't find it. Don't remove eslint from root devDependencies
25. **ESLint zero warnings policy**: All ESLint warnings have been resolved (0 errors, 0 warnings as of 2026-03-09). Maintain this — don't introduce new warnings. Use `useCallback` for functions passed to context `useMemo`, prefix unused params with `_`, add `role`/`onKeyDown`/`tabIndex` for clickable non-interactive elements
26. **KakaoTalk WebView `__appLoaded` pattern**: `main.tsx` sets `window.__appLoaded = true` before `root.render()`. `index.html` inline scripts check this flag for fallback decisions. Loading skeleton must use **inline styles** (not Tailwind classes) because Tailwind CSS may not load if JS fails. The KakaoTalk banner in `Layout.tsx` uses `intent://` scheme on Android to force external browser — do NOT use `location.href` with regular URLs (causes blank page in Android KakaoTalk)

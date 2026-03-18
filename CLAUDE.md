# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Emelmujiro (에멜무지로) is a full-stack monorepo for an AI Education & Consulting platform. Both frontend (React/TypeScript) and backend (Django) are deployed on Mac Mini via Docker + Cloudflare Tunnel. Licensed under Apache 2.0.

- **Live Site**: https://emelmujiro.com — **Backend API**: https://api.emelmujiro.com
- **Frontend Dev**: http://localhost:5173 (Vite) — **NOT port 3000**
- **Backend Dev**: http://localhost:8000 (Django)
- **Build output**: `build/` (not `dist/`)
- **Mock API** — Active only in tests (`IS_TEST`) or when `env.API_URL` is empty. Production uses real backend. Controlled by `USE_MOCK_API` in `frontend/src/services/api.ts`.

## Essential Commands

All frontend commands run from `frontend/`. Root commands use npm workspaces.

```bash
# Development (from root)
npm run dev                # Frontend + Backend concurrently
npm run dev:clean          # Kill ports first, then start

# Frontend (from frontend/)
npm run build              # generate:sitemap → tsc → vite build → prerender → cp 404.html
npm run lint:fix           # ESLint auto-fix
npm run type-check         # TypeScript check
npm run validate           # lint + type-check + test:coverage
npm run format             # Prettier format all source files

# Testing (from frontend/)
npm test                   # Vitest watch mode
npm run test:run           # Single run
npm run test:coverage      # Single run with coverage report
npm run test:e2e           # Playwright E2E tests
# Run a specific test file:
CI=true npm test -- --run src/components/common/__tests__/Button.test.tsx

# Backend (from backend/ — uses uv)
uv sync --extra dev        # Install with dev dependencies (NOT --dev)
uv run python manage.py migrate  # Required for first setup
uv run python manage.py runserver
uv run python manage.py test     # Needs DATABASE_URL="" if env var is set
uv run black .             # Format (line length 120)
uv run flake8 .            # Lint (line length 120)

# Deploy (Mac Mini)
cd frontend && git pull && VITE_API_URL=https://api.emelmujiro.com/api npm run build  # Frontend (live immediately)
git pull && docker compose up -d --build  # Backend
```

## Architecture

### Monorepo Structure

- `frontend/` — React 19 + TypeScript + Vite 8 + Tailwind CSS 3.x
- `backend/` — Django 5 + DRF + JWT auth + WebSocket (Channels/Daphne). Single app: `api/`. Uses **uv** (`pyproject.toml` + `uv.lock`). Dev deps in `[project.optional-dependencies]` — use `uv sync --extra dev`
- Root `package.json` uses npm workspaces pointing to `frontend/`
- Docker: `docker-compose.yml` (prod, SQLite default; PostgreSQL via `--profile postgres`, Redis via `--profile redis`) and `docker-compose.dev.yml` (dev with hot-reload)

### Routing & i18n

Uses `createBrowserRouter` in `frontend/src/App.tsx`. All pages are lazy-loaded. Korean (default) has no prefix (`/about`), English uses `/en` prefix (`/en/about`). Both language variants share the same `pageRoutes` array.

The `useLocalizedPath` hook (`src/hooks/useLocalizedPath.ts`) provides `localizedPath()`, `localizedNavigate()`, and `switchLanguagePath()`. All internal links must use these utilities instead of raw `navigate()`/`<Link>`.

i18n uses `i18next` + `react-i18next`. Fallback language: Korean (`ko`). Translations: `frontend/src/i18n/locales/{ko,en}.json`. Non-React data files use getter functions with `i18n.t()` (see "Data file i18n pattern" below).

### State Management & Provider Hierarchy

All state via React Context: UIContext, AuthContext, BlogContext, FormContext, NotificationContext (all in `src/contexts/`). All providers use `useMemo`/`useCallback` to prevent re-renders.

Provider order in `App.tsx`: `HelmetProvider > ErrorBoundary > UIProvider > AuthProvider > NotificationProvider > BlogProvider > FormProvider > RouterProvider`.

### API Client & Auth

Axios-based client in `src/services/api.ts`. JWT auth uses **httpOnly cookies** (not localStorage) — cookies set by backend, sent via `withCredentials: true`. 401 responses trigger automatic cookie-based token refresh. HTTP upgraded to HTTPS in production.

**auth_hint localStorage flag** — `AuthContext` checks `auth_hint` on mount. If unset, `getUser()` is skipped to avoid 401 spam. Set to `'1'` on login, cleared on logout.

### Contact Page

`/contact` uses a Google Form iframe embed (not the backend API). The original `ContactForm` and `FormContext` are preserved for test compatibility. CSP includes `frame-src https://docs.google.com`. When switching back to backend form, update `App.tsx`, `ContactPage.tsx`, and `e2e/contact.spec.ts`.

### KakaoTalk In-App Browser

React loads normally in all browsers including KakaoTalk WebView. `@vitejs/plugin-legacy` handles older Chromium. iOS KakaoTalk shows a dismissible banner using `kakaotalk://web/openExternal?url=...` scheme (do NOT use `window.open()`). **Critical**: `window.__appLoaded` must be set inside `AppLayout` (router layout), NOT at provider level — setting it too early suppresses all error handlers.

### Notification System

Backend: `Notification` model with REST API at `/api/notifications/` and `NotificationConsumer` for WebSocket at `ws/notifications/`. `send_user_notification()` creates DB record + WebSocket push.

Frontend: `NotificationContext` manages state with auto-connect WebSocket on login (exponential backoff, max 5 attempts). `NotificationBell` component in Navbar for authenticated users.

### SSG / Prerendering

`scripts/prerender.js` uses Playwright to generate static HTML for each route × language (12 files). `main.tsx` always uses `createRoot()` (never `hydrateRoot`) — prerendered HTML is for SEO only. Hydration disabled due to Cloudflare Tunnel script injection.

### SEO

All canonical/OG URLs use `SITE_URL` from `src/utils/constants.ts` — **never hardcode** the URL. `SEOHelmet` generates `hreflang` alternates per page. FAQPage/Course JSON-LD are in `index.html` as static markup — do NOT add to `StructuredData.tsx` (creates duplicates). `og-image.png` (1200×630) for OG tags; `logo512.png` for favicons and schema.org logos.

## Testing

### Framework & Setup

Vitest with jsdom. Config: `frontend/vitest.config.ts`. Setup: `frontend/src/setupTests.ts`. Mocks auto-reset between tests.

**Global mocks (do NOT re-mock)**: `lucide-react` (icons via `<svg data-testid="icon-{Name}" />`), `framer-motion`, `react-helmet-async`, browser APIs (matchMedia, IntersectionObserver, localStorage, fetch, etc.).

### Test Utilities

`renderWithProviders` in `src/test-utils/renderWithProviders.tsx` wraps in all providers (HelmetProvider, UIProvider, AuthProvider, NotificationProvider, BlogProvider, FormProvider, MemoryRouter). MSW mock handlers in `src/test-utils/mocks/handlers.ts`.

### i18n Test Mocking

Every test using `useTranslation()` must mock `react-i18next`:

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

For non-React files using `i18n.t()` directly:

```typescript
vi.mock('../../i18n', () => ({
  default: { t: (key: string) => key, language: 'ko' },
}));
```

### Data File i18n Pattern

Non-React data files use getter functions so translations resolve at call time:

```typescript
import i18n from '../i18n';
export const getCareerData = () => [
  { period: i18n.t('profileData.career.0.period'), ... },
];
```

Components must call the getter each render. Do not store results in module-level constants.

### E2E Testing (Playwright)

10 spec files in `frontend/e2e/`. Runs on Chromium, Firefox, WebKit, Mobile Chrome, Mobile Safari. `baseURL`: `http://localhost:5173`.

### Coverage

Target: **60%** minimum (currently ~81% statements). Config in `codecov.yml`.

## CI/CD

**Conventional commits required**: `type(scope): description`. Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`, `deps`, `ci`.

- **`main-ci-cd.yml`** — Push/PR to `main`. Tests → build → GitHub Pages (backup) → Mac Mini webhook auto-deploy. Node 24, Python 3.12.
- **`pr-checks.yml`** — Lint + tests + Trivy security scan + bundle size (<10MB) + Lighthouse CI.

## Critical Configuration

### Vite (`frontend/vite.config.ts`)

- Build output: `build/`. Pipeline: `generate:sitemap` → `tsc -p tsconfig.build.json` → `vite build` → `prerender.js` → `cp 404.html`
- `@vitejs/plugin-legacy` for KakaoTalk/Samsung WebView — requires `'unsafe-eval'` and `data:` in CSP `script-src`
- `stripLocalhostCsp` plugin removes dev-only localhost from CSP in production
- Dev server proxies `/api` to `http://127.0.0.1:8000`

### Tailwind CSS 3.x

Downgraded from 4.x. PostCSS must use `tailwindcss: {}`, NOT `@tailwindcss/postcss`. Uses `darkMode: 'class'`.

**Never use dynamic class interpolation** (`bg-${color}-600`); Tailwind purges them. Use static color maps instead.

**No global focus ring on buttons/links** — only `input`/`textarea` have focus ring in `index.css`. Adding `button:focus` box-shadow to global CSS causes persistent focus boxes on click.

### ESLint

ESLint 10 **flat config** in `frontend/eslint.config.mjs`. `no-console` only allows `warn`/`error`. Zero warnings policy — maintain 0 errors, 0 warnings. `eslint` must also be in root `package.json` devDependencies (same major version) alongside `eslint-plugin-react` for workspace hoisting.

### Pre-commit Hooks

Husky + lint-staged. `.lintstagedrc.js` at repo root handles path translation: `cd frontend && eslint --fix` + `prettier --write` for TS/JS, `cd backend && uv run black --check` + `flake8` for Python.

### Backend Django Config

- `SECRET_KEY` **required** in production; raises `ImproperlyConfigured` if missing
- JWT: access 30min, refresh 7 days, rotation + blacklist. httpOnly cookies via `CookieJWTAuthentication`
- CORS: production only allows `https://emelmujiro.com` (localhost allowed only in DEBUG)
- Admin endpoints throttled at 120/hour via `AdminRateThrottle`
- Security middleware: `RequestSecurityMiddleware` (IP blocking, rate limiting, malicious pattern detection), `ContentSecurityMiddleware` (CSP + headers)
- Backend blog router uses `basename="blog"` (NOT `"blog-posts"`) — URL names are `blog-list`, `blog-detail`

### Deployment (Mac Mini)

Frontend: `nginx:alpine` container volume-mounting `frontend/build/`. Rebuild = live (no container restart). Backend: `docker compose up -d --build`. Auto-deploy via `scripts/deploy-webhook.js` (webhook from GitHub Actions, timing-safe auth). Cloudflare Tunnel routes `emelmujiro.com` → port 8080, `api.emelmujiro.com` → port 8000.

## Common Pitfalls

1. **`VITE_` prefix for env vars**: New vars must use `VITE_` (legacy `REACT_APP_` still works via `env.ts` shim)
2. **React 19 `useRef` requires initial value**: `useRef<T>()` → TS2554. Always use `useRef<T>(null)`
3. **`minimatch` override**: Root and frontend `package.json` both force `minimatch>=10.2.1`. Don't remove
4. **Build uses separate tsconfig**: `tsconfig.build.json` excludes test types. Don't add `@testing-library/jest-dom` to it
5. **Sitemap generation in build**: `npm run build` runs `generate-sitemap.js` first. If it fails, the build fails
6. **`setTimeout` cleanup pattern**: Store timer in `useRef(null)`, `clearTimeout` in useEffect cleanup. Already applied across all components — follow same pattern for new usage
7. **Comments in English**: No Korean comments anywhere in codebase
8. **Logger default export only**: `import logger from '../utils/logger'`, not destructured. Use `env.IS_DEVELOPMENT` not `process.env.NODE_ENV`
9. **No `window.alert()` in components**: Use inline toast state pattern (`ToastState` + `useRef` timer + `role="alert"`)
10. **Backend tests need `DATABASE_URL=""`**: If env var points to Docker PostgreSQL, tests fail. Use SQLite
11. **ESLint zero warnings**: Use `useCallback` for context functions, prefix unused params with `_`, add `role`/`onKeyDown`/`tabIndex` for clickable non-interactive elements
12. **No hardcoded site URLs**: Always use `SITE_URL` from `constants.ts`. `generate-sitemap.js` has its own constant (Node.js, can't import from frontend)

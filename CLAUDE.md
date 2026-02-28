# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Emelmujiro (에멜무지로) is a full-stack monorepo for an AI Education & Consulting platform (v0.9.2). Frontend is React/TypeScript deployed to GitHub Pages; backend is Django (not yet deployed to production). Licensed under Apache 2.0.

- **Live Site**: https://researcherhojin.github.io/emelmujiro
- **Frontend Dev**: http://localhost:5173 (Vite) — **NOT port 3000**
- **Backend Dev**: http://localhost:8000 (Django)
- **Production ALWAYS uses Mock API** — GitHub Pages cannot reach the backend. See `USE_MOCK_API` in `frontend/src/services/api.ts`.

## Essential Commands

All frontend commands run from `frontend/`. Root commands use npm workspaces.

```bash
# Development (from root)
npm run dev                # Frontend + Backend concurrently
npm run dev:clean          # Kill ports first, then start

# Frontend (from frontend/)
npm run dev                # Vite dev server (port 5173)
npm run build              # generate:sitemap → tsc -p tsconfig.build.json → vite build
npm run lint:fix           # ESLint auto-fix
npm run type-check         # TypeScript check
npm run validate           # lint + type-check + test:coverage
npm run test:coverage      # Single run with coverage report
npm run analyze:bundle     # source-map-explorer on build output
npm run clean              # Remove build/ and node_modules/.cache
npm run clean:all          # Also removes coverage, playwright-report, test-results
npm run preview            # Preview production build locally
npm run format             # Prettier format all source files

# Testing (from frontend/)
npm test                   # Vitest watch mode
npm run test:run           # Single run
npm run test:ci            # CI-optimized (--bail=1, no coverage)
npm run test:ui            # Interactive Vitest UI
# Run a specific test file:
CI=true npm test -- --run src/components/common/__tests__/Button.test.tsx
# Note: `npm test` from root runs BOTH frontend AND backend tests

# Backend (from backend/ — uses uv)
uv sync                    # Install dependencies
uv sync --dev              # Install with dev dependencies
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

# Kill stuck dev ports
lsof -ti:5173 | xargs kill -9
lsof -ti:8000 | xargs kill -9
```

## Architecture

### Monorepo Structure

- `frontend/` — React 19 + TypeScript + Vite + Tailwind CSS 3.x + PWA (vite-plugin-pwa)
- `backend/` — Django 5 + DRF + JWT auth + WebSocket (Channels/Daphne). Single app: `api/`. Uses **uv** for dependency management (`pyproject.toml` + `uv.lock`)
- Root `package.json` uses npm workspaces pointing to `frontend/`
- Docker support: `docker-compose.yml` (prod: backend + frontend/nginx + PostgreSQL + Redis) and `docker-compose.dev.yml` (dev with hot-reload)

### Routing

Uses `createHashRouter` (HashRouter) in `frontend/src/App.tsx`. All pages are lazy-loaded. Routes: `/`, `/about`, `/contact`, `/profile`, `/share`, `/blog`, `/blog/:id`, `/blog/new`, `/admin` (protected, requires admin role), `*` (404 NotFound).

### Under Construction Pages

Blog, Contact, Chat features are **not functional** on GitHub Pages (mock data only, submissions don't deliver, hardcoded responses). These routes render `UnderConstruction` component instead of the original pages:

- `/contact` → `<UnderConstruction featureKey="contact" />`
- `/blog`, `/blog/new`, `/blog/:id` → `<UnderConstruction featureKey="blog" />`
- `ChatWidget` removed from `AppLayout` entirely

The `UnderConstruction` component (`src/components/common/UnderConstruction.tsx`) accepts a `featureKey` prop (`blog` | `contact` | `chat`) for feature-specific i18n descriptions. Original component files (`ContactPage.tsx`, `BlogListPage.tsx`, `BlogDetail.tsx`, `BlogEditor.tsx`, `ChatWidget.tsx`) are **preserved** — they have their own tests that import them directly. Provider hierarchy (`BlogProvider`, `FormProvider`, `ChatProvider`) is also retained for existing test compatibility. Navbar and footer links to `/blog` and `/contact` are intentionally kept — they navigate to the under construction pages.

### State Management

- **Zustand** (`src/store/useAppStore.ts`) — Global state with 4 slices: UI (theme, notifications), Auth (user, tokens), Blog (posts), Chat (messages). Uses `devtools` + `persist` + `immer` middleware. Persists `theme`, `user`, `isAuthenticated` to localStorage (key: `'app-store'`). Exports named selector hooks: `useTheme`, `useUser`, `useNotifications`, `usePosts`, `useMessages`.
- **React Context** — Component-level state via UIContext, AuthContext, BlogContext, FormContext, ChatContext (all in `src/contexts/`). All providers use `useMemo` for value objects and `useCallback` for functions to prevent unnecessary re-renders.
- **Pattern**: Zustand for cross-cutting global state, Context for provider-scoped component state.

### Mock API System

`frontend/src/services/api.ts` uses centralized env config from `src/config/env.ts`. `USE_MOCK_API` is `env.IS_TEST || env.IS_PRODUCTION`. Mock data lives in `src/services/mockData.ts`. Every API method (blog, contact, newsletter, health) has a mock path.

### API Client

Axios-based client in `src/services/api.ts`. 30s timeout with automatic retry on timeout. JWT tokens stored in localStorage (`authToken`, `refreshToken`); 401 responses trigger automatic token refresh before clearing auth. HTTP is upgraded to HTTPS in production.

### Sentry

`@sentry/react` v10 is integrated via `src/utils/sentry.ts`. Only active when `ENABLE_SENTRY=true` and `SENTRY_DSN` is set (both default to off). No action needed unless enabling error tracking.

### Environment Variables

`frontend/src/config/env.ts` provides a `getEnvVar()` helper that checks `VITE_` prefixed vars first, falls back to `REACT_APP_` prefixed vars. New env vars should use the `VITE_` prefix.

### Contact Email

`CONTACT_EMAIL` is defined in `src/utils/constants.ts` using `import.meta.env.VITE_CONTACT_EMAIL` with fallback. All components import from constants — no hardcoded emails in production code.

### Provider Hierarchy

`App.tsx` wraps the app in: `HelmetProvider > ErrorBoundary > UIProvider > AuthProvider > BlogProvider > FormProvider > ChatProvider > RouterProvider`.

### Route Protection

`ProtectedRoute` component (`src/components/common/ProtectedRoute.tsx`) checks auth state and optional role requirement. Currently used to protect `/admin` route with `requiredRole="admin"`. Redirects to `/` when unauthorized.

### i18n

Uses `i18next` + `react-i18next` with browser language detection. Fallback language is Korean (`ko`). Translations live in `frontend/src/i18n/locales/{ko,en}.json`. Configured in `frontend/src/i18n.ts` with `useSuspense: false`. All UI strings, data files, contexts, and SEO modules use i18n — no hardcoded Korean in components.

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

The `initReactI18next` export is required because `src/i18n.ts` imports it. For non-React files that call `i18n.t()` directly (e.g., `seoConfig.ts`, `footerData.ts`), mock the i18n module itself:

```typescript
vi.mock('../../i18n', () => ({
  default: { t: (key: string) => key, language: 'ko' },
}));
```

### Path Alias

`@/` maps to `frontend/src/` (configured in both `tsconfig.json` and `vite.config.ts`).

## Testing

### Test Framework

Vitest with jsdom environment. Config in `frontend/vitest.config.ts`. Setup file: `frontend/src/setupTests.ts`. Mocks auto-reset between tests (`clearMocks`, `restoreMocks`, `mockReset` all true).

### Global Test Mocks (setupTests.ts)

These are mocked globally — do NOT re-mock in individual tests:

- `lucide-react` (Proxy-based, any icon name works), `framer-motion` (motion/AnimatePresence), `react-helmet-async`
- Browser APIs: `matchMedia`, `IntersectionObserver`, `ResizeObserver`, `localStorage`, `sessionStorage`, `navigator.serviceWorker`, `Notification`, `fetch`, `requestAnimationFrame`, `performance`, `window.gtag`
- Window: `alert`, `confirm`, `prompt`, `scrollTo`, `CSS.supports`, `location`, `history`, `innerWidth` (1024), `innerHeight` (768)
- Navigator: `onLine` (true), `language` (`'ko-KR'`)
- DOM: `Element.prototype.scrollIntoView`, `classList` patches, `document.querySelector/querySelectorAll/getElementById`
- Console: `console.error`/`console.warn` suppress known React warnings only

### Test Utilities

- `renderWithProviders` in `src/test-utils/renderWithProviders.tsx` — Wraps component in all providers (HelmetProvider, UIProvider, AuthProvider, BlogProvider, FormProvider, Router). ChatProvider is excluded due to WebSocket complexity.
- `renderWithSelectiveProviders` in `src/test-utils/test-utils.tsx` — Selective provider wrapping via flags (`includeRouter`, `includeUI`, `includeAuth`, etc.).
- Individual wrappers: `renderWithBlogProvider`, `renderWithAuthProvider`, `renderWithUIProvider`, `renderWithFormProvider`, `renderWithRouter`.
- Data factories: `createMockBlogPost`, `createMockUser`, `createMockComment` in `test-utils.tsx`.
- Async helpers: `flushPromises`, `nextTick`, `waitForPendingOperations` in `cleanup.ts`.
- `src/test-utils/` also has: MSW mock server setup (`mocks/server.ts`, `mocks/handlers.ts`), polyfills, cleanup helpers.

### CI Test Config

- Uses forks pool with `maxForks: 2` in CI to manage memory while maintaining test isolation
- 15s timeout in CI, 10s locally
- 104 test files, 1621 tests, 0 failures, 0 skips

### E2E Testing (Playwright)

Config in `frontend/playwright.config.ts`. Tests in `frontend/e2e/`.

## CI/CD

### Commit Messages

PR checks enforce **conventional commits**: `type(scope): description`. Valid types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`, `deps`, `ci`.

### Pipelines

- **`main-ci-cd.yml`** — Runs on push/PR to `main`. Frontend tests → build → deploy to GitHub Pages. Backend tests run against PostgreSQL 15 (timeout: 10min). Node 22, Python 3.12. Build uses `CI=false npm run build` (avoids warnings-as-errors). Uses `actions/upload-artifact@v4` and `actions/download-artifact@v4` (must match versions).
- **`pr-checks.yml`** — Runs on PRs. Quick checks (merge conflicts, commit messages, file size) → lint + affected tests + security scan (Trivy v0.28.0) + bundle size check (<10MB). Posts summary comment on PR.

## Critical Configuration

### Vite (`frontend/vite.config.ts`)

- `base: '/emelmujiro/'` — Required for GitHub Pages subpath
- Build output: `build/` (not `dist/`)
- Build pipeline: `generate:sitemap` → `tsc -p tsconfig.build.json` → `vite build` (sitemap must succeed)
- esbuild minifier (switched from Terser for ~10x faster builds). `esbuild.drop: ['console', 'debugger']` in production
- Manual chunks: react-vendor, ui-vendor, i18n
- PWA via `vite-plugin-pwa`: service worker with Workbox, runtime caching for fonts
- Dev server proxies `/api` to `http://127.0.0.1:8000` (`strictPort: false` — tries next port if busy)

### Tailwind CSS 3.x

Downgraded from 4.x. PostCSS config (`frontend/postcss.config.js`) must use `tailwindcss: {}`, NOT `@tailwindcss/postcss`.

### ESLint

ESLint 9 **flat config** format in `frontend/eslint.config.mjs` (not `.eslintrc`). Plugins: `@typescript-eslint`, `react`, `react-hooks`, `jsx-a11y`, `testing-library`. Test files have relaxed rules (no-unused-vars off, no-explicit-any off, no-console off). Unused vars prefixed with `_` are allowed.

### Pre-commit Hooks

Husky + lint-staged. `.husky/pre-commit` runs `npx lint-staged` from the **root** directory. `.lintstagedrc.js` at repo root handles path translation for both frontend and backend: converts absolute paths to directory-relative paths using `path.relative()`, then runs `cd frontend && eslint --fix` + `prettier --write` for frontend TS/JS/CSS, `prettier --write` for `*.{json,md,yml,yaml}`, and `cd backend && uv run black --check` (check only, not auto-fix) + `cd backend && uv run flake8` for Python. Note: `.lintstagedrc.js` takes precedence over any `lint-staged` config in `package.json`.

### Backend Django Config

- Database: SQLite in dev, PostgreSQL when `DATABASE_URL` is set
- JWT: access 30min, refresh 7 days, rotation + blacklist
- DRF throttling: anon 100/hr, user 1000/hr, contact 5/hr, newsletter 3/hr
- API docs: Swagger at `/api/docs/`, ReDoc at `/api/redoc/` (drf-yasg)
- Backend endpoints: `/api/blog-posts/`, `/api/contact/`, `/api/newsletter/`, `/api/categories/`, `/api/health/`, `/api/auth/{register,login,logout,user,user/update,change-password,token/refresh,token/verify}/`
- Timezone: `Asia/Seoul`, language: `ko-kr`
- File upload: 5MB max; allowed extensions: `.jpg`, `.jpeg`, `.png`, `.gif`, `.pdf`, `.doc`, `.docx`
- CI uses `uv sync --frozen` (lockfile must be up to date)

## Common Pitfalls

1. **Wrong port**: Frontend is 5173, not 3000
2. **Mock API in production**: Always on, not configurable — GitHub Pages has no backend
3. **Build output**: `build/`, not `dist/`
4. **Test count**: 104 files, 1621 tests, 0 failures, 0 skips (as of 2026-03-01)
5. **Environment variables**: Use `VITE_` prefix for new vars (legacy `REACT_APP_` still supported via env.ts shim)
6. **React 19 compatibility**: Some libraries are incompatible; mock problematic components in tests
7. **ESLint must stay on v9**: Plugins (jsx-a11y, react, react-hooks) don't support ESLint 10 yet. Don't upgrade ESLint major version without checking plugin compatibility
8. **minimatch override**: Root and frontend `package.json` both have `overrides` to force `minimatch>=10.2.1` for security. Don't remove these
9. **Conventional commits required**: PR checks validate commit message format (`type(scope): description`)
10. **Build uses separate tsconfig**: `tsconfig.build.json` excludes test types and files; the build script runs `tsc -p tsconfig.build.json`. Don't add test-only types (like `@testing-library/jest-dom`) to `tsconfig.build.json`. `tsconfig.ci.json` extends `tsconfig.build.json` with `strict: true` (only relaxes `noUnusedLocals`/`noUnusedParameters`)
11. **CI cache**: Both `node_modules/` and `frontend/node_modules/` are cached using `hashFiles('package-lock.json')` (root lock file, not `frontend/package-lock.json` which doesn't exist in npm workspaces)
12. **Sitemap generation in build**: `npm run build` first runs `scripts/generate-sitemap.js`. If this script fails, the entire build fails
13. **Under construction routes**: `/blog`, `/contact`, and chat are currently under construction. The original page components and their tests still exist but are not routed in `App.tsx`. When re-enabling, update `App.tsx` routes, restore `ChatWidget` in `AppLayout`, and update `generate-sitemap.js`, `manifest.json`, `lighthouserc.js`, and E2E tests (`e2e/blog.spec.ts`, `e2e/contact.spec.ts`)
14. **Backend blog router**: `backend/api/urls.py` registers BlogPostViewSet with `basename="blog"` (NOT `"blog-posts"`). DRF generates URL names as `blog-list` and `blog-detail`

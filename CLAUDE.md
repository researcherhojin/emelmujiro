# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Emelmujiro (에멜무지로) is a full-stack monorepo for an AI Education & Consulting platform. Frontend is React/TypeScript deployed to GitHub Pages; backend is Django (not yet deployed to production).

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
npm run build              # Production build → build/ directory (not dist/)
npm run lint:fix           # ESLint auto-fix
npm run type-check         # TypeScript check
npm run validate           # lint + type-check + test:coverage

# Testing (from frontend/)
npm test                   # Vitest watch mode
npm run test:run           # Single run
npm run test:ci            # CI-optimized (--bail=1, no coverage)
# Run a specific test file:
CI=true npm test -- --run src/components/common/__tests__/Button.test.tsx

# Backend (from backend/ — uses uv)
uv sync                    # Install dependencies
uv sync --dev              # Install with dev dependencies
uv run python manage.py runserver
uv run python manage.py test
uv run black .             # Format
uv run flake8 .            # Lint

# Deploy (from frontend/)
npm run deploy             # Build + deploy to GitHub Pages via gh-pages

# Kill stuck dev ports
lsof -ti:5173 | xargs kill -9
lsof -ti:8000 | xargs kill -9
```

## Architecture

### Monorepo Structure

- `frontend/` — React 19 + TypeScript + Vite + Tailwind CSS 3.x
- `backend/` — Django 5 + DRF + JWT auth + WebSocket (Channels). Uses **uv** for dependency management (`pyproject.toml` + `uv.lock`)
- Root `package.json` uses npm workspaces pointing to `frontend/`

### Routing

Uses `createHashRouter` (HashRouter) in `frontend/src/App.tsx`. All pages are lazy-loaded. Routes: `/`, `/about`, `/contact`, `/profile`, `/share`, `/blog`, `/blog/:id`, `/blog/new`, `/admin`.

### State Management

- **Zustand** (`src/store/useAppStore.ts`) — Global state with 4 slices: UI (theme, notifications), Auth (user, tokens), Blog (posts), Chat (messages). Uses `devtools` + `persist` + `immer` middleware. Persists theme and auth to localStorage.
- **React Context** — Component-level state via UIContext, AuthContext, BlogContext, FormContext, ChatContext (all in `src/contexts/`).
- **Pattern**: Zustand for cross-cutting global state, Context for provider-scoped component state.

### Mock API System

`frontend/src/services/api.ts` contains both real axios calls and mock implementations. `USE_MOCK_API` is true when: `REACT_APP_USE_MOCK_API=true`, `NODE_ENV=test`, or in production. Mock data lives in `src/services/mockData.ts`. Every API method (blog, contact, newsletter, health) has a mock path.

### Environment Variables

`frontend/src/config/env.ts` provides a `getEnvVar()` helper that checks `VITE_` prefixed vars first, falls back to `REACT_APP_` prefixed vars. New env vars should use the `VITE_` prefix.

### Provider Hierarchy

`App.tsx` wraps the app in: `HelmetProvider > ErrorBoundary > UIProvider > AuthProvider > BlogProvider > FormProvider > ChatProvider > RouterProvider`.

### i18n

Uses `i18next` + `react-i18next` with browser language detection. Fallback language is Korean (`ko`). Translations live in `frontend/src/i18n/locales/{ko,en}.json`. Configured in `frontend/src/i18n.ts` with `useSuspense: false`.

### Path Alias

`@/` maps to `frontend/src/` (configured in both `tsconfig.json` and `vite.config.ts`).

## Testing

### Test Framework

Vitest with jsdom environment. Config in `frontend/vitest.config.ts`. Setup file: `frontend/src/setupTests.ts`.

### CI Skip Pattern

A small number of tests (~1%) use `itSkipInCI` for genuine jsdom limitations (classList errors, IndexedDB unavailability). Most tests run in both local and CI environments.

```typescript
// Use helpers from src/test-utils/ci-skip.ts
import { itSkipInCI } from '@/test-utils/ci-skip';
itSkipInCI('test that fails in CI', () => { /* ... */ });
```

### Test Utilities

- `renderWithProviders` in `src/test-utils/renderWithProviders.tsx` — Wraps component in all providers (HelmetProvider, UIProvider, AuthProvider, BlogProvider, FormProvider, Router). ChatProvider is excluded due to WebSocket complexity.
- `src/test-utils/` also has: MSW mock server setup (`mocks/server.ts`, `mocks/handlers.ts`), polyfills, cleanup helpers.

### CI Test Config

- Uses forks pool with single fork (`singleFork: true`) in CI to avoid memory issues
- `NODE_OPTIONS='--max-old-space-size=4096'` for CI memory
- 15s timeout in CI, 10s locally

### E2E Testing (Playwright)

Config in `frontend/playwright.config.ts`. Tests in `frontend/e2e/`.

## CI/CD

### Commit Messages

PR checks enforce **conventional commits**: `type(scope): description`. Valid types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`, `deps`, `ci`.

### Pipelines

- **`main-ci-cd.yml`** — Runs on push/PR to `main`. Frontend tests → build → deploy to GitHub Pages + Docker build. Backend tests run against PostgreSQL 15. Node 20, Python 3.11. Frontend test step uses `continue-on-error: true`.
- **`pr-checks.yml`** — Runs on PRs. Quick checks (merge conflicts, commit messages, file size) → lint + affected tests + security scan (Trivy) + bundle size check (<10MB). Posts summary comment on PR.

## Critical Configuration

### Vite (`frontend/vite.config.ts`)

- `base: '/emelmujiro/'` — Required for GitHub Pages subpath
- Build output: `build/` (not `dist/`)
- Terser drops console/debugger in production
- Manual chunks: react-vendor, ui-vendor, i18n
- Dev server proxies `/api` to `http://127.0.0.1:8000`

### Tailwind CSS 3.x

Downgraded from 4.x. PostCSS config (`frontend/postcss.config.js`) must use `tailwindcss: {}`, NOT `@tailwindcss/postcss`.

### ESLint

ESLint 9 **flat config** format in `frontend/eslint.config.mjs` (not `.eslintrc`). Plugins: `@typescript-eslint`, `react`, `react-hooks`, `jsx-a11y`, `testing-library`. Test files have relaxed rules (no-unused-vars off, no-explicit-any off, no-console off). Unused vars prefixed with `_` are allowed.

### Pre-commit Hooks

Husky + lint-staged: ESLint --fix + Prettier on `src/**/*.{js,jsx,ts,tsx}`, Prettier on `src/**/*.{json,css,md}`. Backend: `uv run black --check` + `uv run flake8` on `backend/**/*.py`.

## Common Pitfalls

1. **Wrong port**: Frontend is 5173, not 3000
2. **Mock API in production**: Always on, not configurable — GitHub Pages has no backend
3. **Build output**: `build/`, not `dist/`
4. **Test skips in CI**: Some tests use `itSkipInCI` for jsdom limitations; most tests run in both local and CI
5. **Environment variables**: Use `VITE_` prefix for new vars (legacy `REACT_APP_` still supported via env.ts shim)
6. **React 19 compatibility**: Some libraries are incompatible; mock problematic components in tests
7. **ESLint must stay on v9**: Plugins (jsx-a11y, react, react-hooks) don't support ESLint 10 yet. Don't upgrade ESLint major version without checking plugin compatibility
8. **minimatch override**: Root and frontend `package.json` both have `overrides` to force `minimatch>=10.2.1` for security. Don't remove these
9. **Conventional commits required**: PR checks validate commit message format (`type(scope): description`)

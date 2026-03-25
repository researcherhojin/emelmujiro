# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Full-stack monorepo (React 19 + Django 6) deployed on Mac Mini via Docker + Cloudflare Tunnel.

- **Frontend**: http://localhost:5173 (Vite, NOT port 3000). Build output: `build/` (NOT `dist/`). Import alias `@` → `src/`
- **Backend**: http://localhost:8000. Single app: `api/`. Uses **uv** (NOT pip)
- **Dev proxy**: Vite proxies `/api` → `http://127.0.0.1:8000` (no CORS issues in dev)
- **Node ≥ 24**, **Python 3.12** required. Husky pre-commit runs lint-staged automatically

## Commands

```bash
npm run dev                # Frontend + Backend (from root)
npm run build              # sitemap → tsc → vite build → prerender → cp 404.html (from frontend/)
npm run build:no-prerender # Faster build — skips SSG prerender step (from frontend/)
npm run validate           # lint + type-check + test:coverage (from frontend/)
CI=true npm test -- --run src/components/common/__tests__/Navbar.test.tsx  # Single test
npm run test:e2e           # Playwright E2E (from frontend/). Also: test:e2e:ui, test:e2e:debug
npm run type-check         # tsc --noEmit (from frontend/)
npm run analyze:bundle     # source-map-explorer (from frontend/, requires build first)

uv sync --extra dev                    # Install backend deps (NOT --dev)
uv run python manage.py test           # Django unittest (NOT pytest). Needs DATABASE_URL=""
uv run black . && uv run flake8 .      # Format + lint (line length 120)

# Shortcuts: make install | make test | make lint | make lint-fix | make dev
# Docker dev with optional services:
# docker compose -f docker-compose.dev.yml --profile postgres --profile redis up
```

## Architecture

**i18n routing**: Korean default (no prefix: `/about`), English `/en/about`. Internal links must use `useLocalizedPath` hook — never raw `navigate()`/`<Link>`. Non-React data files must use getter functions (not module-level constants) so `i18n.t()` resolves at call time.

**Provider order** (in `App.tsx`): HelmetProvider → ErrorBoundary → UIProvider → AuthProvider → NotificationProvider → BlogProvider → RouterProvider.

**Auth**: JWT via httpOnly cookies (not localStorage). `auth_hint` flag in localStorage prevents 401 spam — if unset, `getUser()` is skipped on mount.

**Contact**: Google Form iframe, not backend API. Backend `/api/contact/` is preserved for future switch.

**Blog**: Dual fields `content` (plain text/search) + `content_html` (TipTap HTML). Category API cached 1 hour (key: `"blog_categories"`), invalidated on CRUD/toggle-publish. Router `basename="blog"` (NOT `"blog-posts"`).

**WebSocket**: Requires Daphne (ASGI). Without Redis, uses InMemoryChannelLayer (won't work across workers).

## Constraints

**SEO**: `main.tsx` uses `createRoot()` (never `hydrateRoot`). Do NOT add static meta/title/OG tags to `index.html` — `SEOHelmet` handles everything. Use `SITE_URL` from `constants.ts` — never hardcode URLs. Page titles must NOT include `| 에멜무지로` suffix (appended automatically).

**KakaoTalk WebView**: `window.__appLoaded` must be set in `AppLayout` (router layout), NOT at provider level. iOS banner uses `kakaotalk://web/openExternal` scheme (NOT `window.open()`).

**Deployment**: Never `rm -rf frontend/build` (breaks nginx volume mount) — use `rm -rf frontend/build/*`. Docker ports bound to `127.0.0.1` only. `SECRET_KEY` loaded via `env_file` — do NOT set in docker-compose `environment` section.

**CSP**: `'unsafe-eval'` + `'unsafe-inline'` required — Cloudflare Tunnel injects unpredictable scripts, `plugin-legacy` needs eval.

**Tailwind 3.x**: PostCSS uses `tailwindcss: {}` (NOT `@tailwindcss/postcss`). Dark mode is `class`-based (not media query). Never use dynamic class interpolation (`bg-${color}-600`).

**Production keys**: `SECRET_KEY` and `RECAPTCHA_PRIVATE_KEY` raise `ImproperlyConfigured` if missing in production (DEBUG bypasses reCAPTCHA).

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

Use `renderWithProviders` from `test-utils/` for component tests needing context (wraps MemoryRouter + providers). E2E tests: Playwright in `frontend/e2e/`.

Coverage target: 85%. Conventional commits required (`type(scope): description`). Allowed types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`, `deps`, `ci`. ESLint uses flat config (`eslint.config.mjs`, NOT `.eslintrc`). Zero warnings policy.

## Security

**Blog HTML**: `content_html` (TipTap) is always sanitized with `DOMPurify.sanitize()` before rendering via `dangerouslySetInnerHTML`. Comments render as plain text only.

**CI workflows**: Never use `${{ }}` expressions directly inside `run:` blocks — always bind to `env:` first, then reference as `"$VAR"`. This prevents script injection via user-controllable values like branch names.

**Shell scripts**: No `eval` with variables, no `source` of untrusted files (use `read` loop parsing), validate Make variables that reach shell commands.

**File uploads**: Backend uses `uuid4` for filenames (no user-supplied paths). Validated against extension whitelist + MIME type check + 5MB limit.

## Pitfalls

1. **`VITE_` prefix** for env vars (legacy `REACT_APP_` works via `config/env.ts` shim)
2. **`useRef<T>(null)`** — React 19 requires initial value
3. **`minimatch>=10.2.1`** override in both package.json — don't remove
4. **`tsconfig.build.json`** excludes test types — don't add `@testing-library/jest-dom`
5. **`DATABASE_URL=""`** for backend tests — Docker PostgreSQL breaks SQLite tests
6. **Comments in English** only — no Korean comments
7. **`import logger from '../utils/logger'`** — default export only, use `env.IS_DEVELOPMENT`
8. **No `window.alert()`/`window.prompt()`** — use toast pattern or inline inputs
9. **All UI strings use i18n** — `useTranslation()` in components, `i18n.t()` in data files
10. **Branch naming**: `feature/name` or `fix/description`

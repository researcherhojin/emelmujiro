# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Emelmujiro (에멜무지로) is a full-stack web application for an AI Education and Consulting company using a monorepo structure with React/TypeScript frontend and Django backend, deployed via GitHub Pages.

**Live Site**: https://researcherhojin.github.io/emelmujiro
**Frontend Dev Server**: Port 5173 (Vite)
**Backend Dev Server**: Port 8000 (Django)
**Preview Server**: Port 4173 (Vite preview)

⚠️ **Important**: Production currently uses Mock API. Real backend deployment is pending.

## Essential Commands

### Quick Start

```bash
# Install all dependencies
npm install
cd frontend && npm install
cd ../backend && pip install -r requirements.txt

# Start full application (from root)
npm run dev                # Frontend + Backend concurrently
npm run dev:clean          # Kill ports first then start
```

### Development

```bash
# Frontend (from frontend/)
npm run dev                # Start Vite dev server (port 5173)
npm start                  # Alias for npm run dev
npm run preview            # Preview production build (port 4173)

# Backend (from backend/)
python3 manage.py runserver    # Start Django (port 8000)

# Port management (when ports are stuck)
lsof -ti:5173 | xargs kill -9  # Kill Vite dev
lsof -ti:8000 | xargs kill -9  # Kill Django
./scripts/kill-ports.sh         # Kill all ports
```

### Testing

```bash
# Run tests (from frontend/)
npm test                   # Watch mode
npm run test:run           # Single run
npm run test:ci            # CI optimized (bail on failure)
npm run test:coverage      # With coverage report
CI=true npm test -- --run  # CI mode single run

# Run specific test
CI=true npm test -- --run src/components/common/__tests__/Button.test.tsx

# Run with verbose output
CI=true npm test -- --run --reporter=verbose

# Backend tests (from backend/)
python3 manage.py test
```

### Building & Deployment

```bash
# Build frontend (from root or frontend/)
npm run build              # Production build to 'build' directory

# Deploy to GitHub Pages (from frontend/)
npm run deploy             # Build then deploy with gh-pages

# Bundle analysis (from frontend/)
npm run analyze:bundle     # Analyze bundle size
```

### Code Quality

```bash
# Frontend (from frontend/)
npm run lint               # ESLint check
npm run lint:fix           # Auto-fix ESLint issues
npm run type-check         # TypeScript check
npm run format             # Prettier format all files

# Backend (from backend/)
black .                    # Format Python code
flake8 .                   # Lint Python code
```

## Architecture

### Frontend Stack

- **React** 19.1.1 with **TypeScript** 5.9.2 (strict mode)
- **Vite** 7.1.3 build tool
- **Vitest** 3.2.4 testing (migrated from Jest)
- **Tailwind CSS** 3.4.17 styling (downgraded from 4.x for PostCSS compatibility)
- **Zustand** 5.0.8 + React Context for state

### Directory Structure

```
frontend/src/
├── components/     # React components by feature
│   ├── admin/      # Admin dashboard components
│   ├── blog/       # Blog-related components
│   ├── chat/       # Chat/messaging components
│   ├── common/     # Shared components
│   └── sections/   # Page sections
├── contexts/       # React Context providers
├── store/          # Zustand store with slices
├── services/       # API (api.ts) and WebSocket
├── pages/          # Route-level components
├── hooks/          # Custom React hooks
├── utils/          # Utility functions
├── test-utils/     # Testing utilities
└── i18n/          # Internationalization (ko/en)
```

### Key Configuration Files

- **vite.config.ts**: Base path `/emelmujiro/`, API proxy to :8000
- **vitest.config.ts**: Forks pool, 15s timeout in CI
- **tsconfig.json**: Path alias `@/` → `src/`, ES2020 target

### State Management

- **Zustand Store** (`src/store/useAppStore.ts`):
  - UI slice: Theme, loading, modals
  - Auth slice: User, tokens, permissions
  - Blog slice: Posts, categories, comments
  - Chat slice: Messages, typing, online users
- **Context API**: UIContext, AuthContext, BlogContext, FormContext

### Backend (Django)

- **Django** 5.2.6 with **DRF** 3.16.1
- **Django Channels** 4.3.1 for WebSocket
- **JWT Authentication** via djangorestframework-simplejwt
- **Database**: SQLite3 (dev), PostgreSQL ready

## Testing Guidelines

### Current Status

- **Test Files**: 92 files (40 passing, 52 skipped)
- **Tests**: 1599 total (716 passing, 883 skipped - 55% skip rate)
- **Execution Time**: ~6.35s

### Common Test Patterns

```typescript
// Use renderWithProviders for components with context
import { renderWithProviders } from '@/test-utils/test-utils';

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  IconName: () => <div data-testid="icon-IconName">Icon</div>
}));

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>
  },
  AnimatePresence: ({ children }: any) => <>{children}</>
}));
```

### Handling Test Issues

```typescript
// Skip tests in CI that use getByRole (causes style.getPropertyValue errors)
const itSkipInCI = process.env.CI === 'true' ? it.skip : it;
itSkipInCI('test using getByRole', () => {
  // test code
});

// Increase timeout for async tests
it('async test', async () => {
  // test code
}, 30000); // 30s timeout
```

## Environment Variables

### Frontend (.env)

```bash
VITE_API_URL=https://api.emelmujiro.com  # Backend API URL
VITE_WS_URL=wss://api.emelmujiro.com/ws  # WebSocket URL
VITE_USE_MOCK_API=false                  # Use real API in production
```

### Backend (.env)

```bash
SECRET_KEY=your-secret-key
DEBUG=False
ALLOWED_HOSTS=api.emelmujiro.com
DATABASE_URL=postgresql://...
REDIS_URL=redis://localhost:6379
CORS_ALLOWED_ORIGINS=https://researcherhojin.github.io
```

## PWA Features

- **Service Worker**: `public/service-worker-enhanced.js`
- **Manifest**: `public/manifest.json`
- **Features**: Offline support, install prompt, background sync, push notifications
- **Cache Strategy**: Network first with fallback

## CI/CD Pipeline

- **GitHub Actions**: `.github/workflows/main-ci-cd.yml`
- **Node Version**: 20
- **Python Version**: 3.11
- **Memory Optimization**: `NODE_OPTIONS='--max-old-space-size=4096'`
- **Automatic Deployment**: On push to main branch

## Performance Metrics

- **Bundle Size**: 190KB (52% reduction from v4.0.2)
- **Build Time**: 2.8s (72% reduction from v4.0.2)
- **Package Count**: 56 dependencies (reduced from 61)
- **First Contentful Paint**: < 1.2s
- **Time to Interactive**: < 2.5s

## Known Issues & Solutions

### Tailwind CSS 4.x Incompatibility

If you encounter CSS not loading or PostCSS errors:
```bash
# Downgrade to Tailwind CSS 3.x
cd frontend
npm install tailwindcss@3.4.17

# Ensure postcss.config.js uses 'tailwindcss' not '@tailwindcss/postcss'
module.exports = {
  plugins: {
    tailwindcss: {},  // Correct for v3.x
    autoprefixer: {},
  },
};

# Clear Vite cache and restart
rm -rf node_modules/.vite
npm run dev
```

### Port Conflicts

```bash
npm run dev:clean          # Kill all ports and restart
# Or manually:
lsof -ti:5173 | xargs kill -9
lsof -ti:8000 | xargs kill -9
```

### Test Failures in CI

- Many tests skipped due to `getByRole` and IndexedDB issues
- Use `test.skip` or conditional skipping for problematic tests
- Increase timeouts for async operations

### Build Issues

```bash
# Clear cache and rebuild
rm -rf frontend/node_modules frontend/build frontend/node_modules/.vite
cd frontend && npm ci && npm run build
```

## Recent Changes (v4.1.0)

### Package Optimization
- Removed 5 unused packages (Jest-related, unused Prettier plugin, unused Playwright tools)
- Migrated fully to Vitest, removed all Jest configuration
- Optimized bundle size by 52% through better code splitting
- Improved build performance by 72%

### Tailwind CSS Migration
- Downgraded from Tailwind CSS 4.x to 3.4.17 for PostCSS compatibility
- Fixed CSS build issues in development and production
- Updated PostCSS configuration for v3.x compatibility

### Environment Configuration
- Improved environment variable handling in `src/config/env.ts`
- Better separation between production and development API URLs
- Support for both Vite and legacy process.env variables

## Current Priorities

1. **Backend Deployment**: Production uses Mock API - needs real backend deployment
2. **Test Recovery**: Fix 883 skipped tests (55% skip rate)
3. **TypeScript Strict Mode**: Enable stricter type checking
4. **React Warnings**: Fix framer-motion prop warnings in tests
5. **PWA Enhancements**: Improve offline functionality and caching strategies

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Emelmujiro (에멜무지로) is a full-stack web application for an AI Education and Consulting company. The codebase uses a monorepo structure with React/TypeScript frontend and Django backend, deployed via GitHub Pages.

**Current Version**: v4.0.2 (2025.09.05)
**Build Tool**: Vite 7.1.3 (migrated from Create React App)
**Test Framework**: Vitest 3.2.4 (migrated from Jest)
**Live Site**: https://researcherhojin.github.io/emelmujiro
**Port Configuration**: Frontend dev (5173), Frontend preview (4173), Backend (8000)

⚠️ **Important**: Production currently uses Mock API. Real backend deployment is pending.

## Essential Commands

### Quick Start
```bash
# Install all dependencies
npm install
cd frontend && npm install
cd ../backend && pip install -r requirements.txt
cd ..

# Start everything
npm run dev                # Frontend + Backend concurrently
```

### Development

```bash
# Start full application (frontend + backend) from root
npm run dev                # Runs both frontend and backend concurrently
npm run dev:clean          # Kills existing processes first (./scripts/kill-ports.sh)
npm run dev:safe           # Kills all on any failure

# Individual services
cd frontend && npm run dev  # Frontend only (Vite dev server on port 5173)
cd backend && python manage.py runserver  # Backend only (Django on port 8000)

# Docker development
npm run dev:docker          # Uses ./scripts/start-dev.sh
docker compose up -d        # Direct docker compose

# Port management (when ports are stuck)
lsof -ti:5173 | xargs kill -9  # Kill Vite dev server
lsof -ti:4173 | xargs kill -9  # Kill Vite preview
lsof -ti:8000 | xargs kill -9  # Kill Django server
./scripts/kill-ports.sh         # Kill all at once
```

### Testing

```bash
# Run all tests from root
npm test                    # Runs both frontend and backend tests

# Frontend tests (Vitest) - from frontend directory
cd frontend && npm test     # Watch mode
cd frontend && npm run test:run  # Single run
cd frontend && CI=true npm test -- --run  # CI mode with single run
cd frontend && npm run test:ci  # Optimized CI run (bail on first failure)
cd frontend && npm run test:coverage  # With coverage report
cd frontend && npm run test:ui  # Interactive UI

# Run specific test file
cd frontend && CI=true npm test -- --run src/components/common/__tests__/Button.test.tsx

# Run with verbose output (for debugging)
cd frontend && CI=true npm test -- --run --reporter=verbose

# Run tests for a directory
cd frontend && CI=true npm test -- --run src/components/common/__tests__/

# Backend tests
cd backend && python manage.py test
npm run test:backend  # From root
```

### Building & Deployment

```bash
# Build frontend for production
npm run build               # From root (builds frontend)
cd frontend && npm run build  # From frontend directory
# Build process: generate:sitemap -> tsc -> vite build -> outputs to 'build' directory

# Preview production build locally (port 4173)
cd frontend && npm run preview

# Deploy to GitHub Pages
cd frontend && npm run deploy  # Runs predeploy (build) then gh-pages -d build
# Note: Automatic deployment happens on push to main branch via GitHub Actions

# Bundle analysis
cd frontend && npm run analyze:bundle  # Analyze bundle size with source-map-explorer
cd frontend && npm run analyze:build   # Build then analyze
```

### Code Quality

```bash
# Linting
cd frontend && npm run lint  # ESLint check
cd frontend && npm run lint:fix  # Auto-fix ESLint issues

# TypeScript
cd frontend && npm run type-check  # Single type check
cd frontend && npm run type-check:watch  # Watch mode

# Formatting
cd frontend && npm run format  # Format all files with Prettier
cd frontend && npm run format:check  # Check formatting without changes

# Backend code quality
cd backend && black .       # Format Python code
cd backend && flake8 .      # Lint Python code

# Validation (comprehensive check)
cd frontend && npm run validate  # Runs lint, type-check, and test:coverage
```

## Architecture Overview

### Frontend (React + TypeScript + Vite)

**Core Technologies:**
- React 19.1.1 with TypeScript 5.9.2 (strict mode)
- Vite 7.1.3 for build tooling (HMR in ~171ms)
- Vitest 3.2.4 for testing with React Testing Library
- Tailwind CSS 4.1.12 for styling
- Zustand 5.0.8 for state management

**Key Directories:**
```
frontend/src/
├── components/     # React components organized by feature
├── contexts/       # React Context providers (UI, Auth, Blog, Form)
├── store/          # Zustand store (useAppStore with slices)
├── services/       # API layer (api.ts, websocket.ts)
├── pages/          # Route-level components
├── hooks/          # Custom React hooks
├── utils/          # Utility functions
├── test-utils/     # Testing utilities (renderWithProviders)
└── i18n/          # Internationalization (ko/en)
```

**Important Files:**
- `vite.config.ts`: Base path `/emelmujiro/`, port 5173, API proxy to :8000
- `vitest.config.ts`: Test config with forks pool, 15s timeout in CI
- `tsconfig.json`: Path alias `@/` → `src/`, ES2020 target
- Entry point: `src/main.tsx` (not index.tsx)

**State Management:**
- Zustand store at `src/store/useAppStore.ts` with slices:
  - UI slice: Theme, loading, modals
  - Auth slice: User, tokens, permissions
  - Blog slice: Posts, categories, comments
  - Chat slice: Messages, typing, online users
- Context API for component-level state (UIContext, AuthContext, BlogContext, FormContext)

**Routing:**
- HashRouter for GitHub Pages compatibility
- Lazy loading for code splitting
- Protected routes with auth guard

**API Integration:**
- Centralized in `src/services/api.ts`
- Mock API support via `VITE_USE_MOCK_API` env variable
- WebSocket in `src/services/websocket.ts`
- Request/response interceptors for auth tokens

### Backend (Django + DRF)

**Core Technologies:**
- Django 5.2.5 with Django REST Framework 3.16.1
- Django Channels 4.3.1 for WebSocket support
- JWT authentication (djangorestframework-simplejwt)
- PostgreSQL ready (currently SQLite in dev)
- Redis for caching and WebSocket

**Structure:**
```
backend/
├── api/            # Main API app
├── config/         # Django settings
├── requirements.txt # 35 Python packages
└── db.sqlite3      # Dev database
```

### Testing Strategy

**Frontend Testing:**
- 92 test files, 716 active tests, 773 skipped (52% skip rate)
- Use `renderWithProviders` from `src/test-utils/test-utils.tsx`
- Mock patterns in `src/setupTests.ts`
- Common issues:
  - `getByRole` queries cause style.getPropertyValue errors in CI
  - IndexedDB operations timeout in CI
  - Use `test.skip` or `describe.skip` for problematic tests

**Test Patterns:**
```typescript
// Always use renderWithProviders for components with context
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

### PWA Configuration

- Service Worker: `public/service-worker-enhanced.js`
- Manifest: `public/manifest.json`
- Features: Offline support, install prompt, background sync, push notifications
- Cache strategy: Network first with fallback

## Common Issues & Solutions

### Test Failures in CI

**Problem**: `style.getPropertyValue` errors
```typescript
// Solution: Skip in CI
const itSkipInCI = process.env.CI === 'true' ? it.skip : it;
itSkipInCI('test using getByRole', () => {
  // test code
});
```

**Problem**: Timeout errors
```typescript
// Solution: Increase timeout
it('async test', async () => {
  // test code
}, 30000); // 30s timeout
```

**Problem**: Multiple elements found
```typescript
// Solution: Use getAllBy* and select first
const buttons = getAllByRole('button');
fireEvent.click(buttons[0]);
```

### Port Conflicts

```bash
# Quick fix
npm run dev:clean  # Kills all ports and restarts

# Manual fix
lsof -ti:5173 | xargs kill -9
lsof -ti:8000 | xargs kill -9
```

### Build Issues

```bash
# Clear everything and rebuild
rm -rf frontend/node_modules frontend/build frontend/node_modules/.vite
cd frontend && npm ci
npm run build
```

### TypeScript Errors

```bash
cd frontend && npm run type-check
# Check for missing @types packages
# Verify path aliases resolve correctly
```

## Deployment

**GitHub Pages (Frontend):**
- Automatic deployment on push to main branch
- Manual: `cd frontend && npm run deploy`
- URL: https://researcherhojin.github.io/emelmujiro

**Backend Deployment (Pending):**
- Target: Railway/Render/Heroku
- Needs: PostgreSQL, Redis, environment variables
- Update: `VITE_API_URL`, `VITE_USE_MOCK_API=false`

## Environment Variables

### Frontend (.env files)
```bash
VITE_API_URL=https://api.emelmujiro.com  # Backend API URL
VITE_WS_URL=wss://api.emelmujiro.com/ws  # WebSocket URL
VITE_USE_MOCK_API=false                  # Use real API in production
VITE_GA_TRACKING_ID=G-XXXXXXXXXX         # Google Analytics
VITE_SENTRY_DSN=https://...              # Sentry error tracking
```

### Backend (.env files)
```bash
SECRET_KEY=your-secret-key
DEBUG=False
ALLOWED_HOSTS=api.emelmujiro.com
DATABASE_URL=postgresql://user:pass@host:port/dbname
REDIS_URL=redis://localhost:6379
CORS_ALLOWED_ORIGINS=https://researcherhojin.github.io
```

## CI/CD Pipeline

**GitHub Actions:**
- `.github/workflows/main-ci-cd.yml`: Full pipeline (test, build, deploy)
- `.github/workflows/pr-checks.yml`: PR validation
- Memory optimization: `NODE_OPTIONS='--max-old-space-size=4096'`
- All stages currently passing ✅

**Docker:**
- Multi-stage build configuration
- Build: `./scripts/docker-build.sh`
- Push: `./scripts/docker-build.sh --push --tag v1.0.0`

## Performance Metrics

- **Dev Server Start**: ~171ms
- **Production Build**: ~10 seconds
- **Bundle Size**: ~400KB gzipped
- **Test Suite**: ~30 seconds (92 files)
- **HMR Update**: <100ms
- **Lighthouse Score**: 95+

## Current Issues & Priorities

### 🔴 Critical (Immediate)

1. **Backend Deployment**: Production uses Mock API
   - Deploy Django backend to Railway/Render/Heroku
   - Set up PostgreSQL and Redis
   - Update environment variables

2. **Test Recovery**: 773 tests skipped (52%)
   - Fix IndexedDB timeout issues
   - Resolve getByRole query errors
   - Improve test isolation

### 🟡 High Priority (1-2 weeks)

1. **Security**: 
   - Move from localStorage to httpOnly cookies
   - Implement CSRF protection
   - Add Content Security Policy

2. **i18n Completion**:
   - Add LanguageSwitcher to header
   - Replace hardcoded Korean strings
   - Complete English translations

### 🟢 Medium Priority (3-4 weeks)

1. **Performance**:
   - Reduce bundle size (400KB → 300KB)
   - Optimize CI/CD memory usage
   - Improve test execution speed

2. **PWA Features**:
   - Test offline mode thoroughly
   - Implement push notifications
   - Improve install prompt UX

## Project Statistics

- **TypeScript Coverage**: 100% (239 TS/TSX files)
- **Components**: 156 React components
- **Test Files**: 92 files (716 active, 773 skipped)
- **Dependencies**: 61 total (18 production, 43 development)
- **Python Packages**: 35 (Django backend)
- **CI/CD Status**: ✅ Fully stable
- **Current Version**: v4.0.2

## Useful Scripts

### Root Level (`scripts/`)
- `kill-ports.sh`: Kill all development server processes
- `docker-build.sh`: Build and push Docker images
- `pre-deploy-check.sh`: Pre-deployment validation
- `start-dev.sh`: Start development with Docker

### Frontend (`frontend/scripts/`)
- `generate-sitemap.js`: Generate sitemap for SEO
- `optimize-images.js`: Optimize images for production
- `skip-problematic-tests.sh`: Skip failing tests in CI
- `test-ci-local.sh`: Simulate CI environment locally

## Key Patterns to Follow

### Component Structure
```typescript
interface ComponentProps {
  title: string;
  onAction?: () => void;
  className?: string;
}

const Component: React.FC<ComponentProps> = ({ title, onAction, className }) => {
  // Implementation
};

export default Component;
```

### API Calls
```typescript
import api from '@/services/api';

const fetchData = async () => {
  try {
    const response = await api.get('/endpoint/');
    return response.data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};
```

### Testing with Context
```typescript
import { renderWithProviders } from '@/test-utils/test-utils';

describe('Component', () => {
  it('renders with context', () => {
    const { getByText } = renderWithProviders(<Component title="Test" />);
    expect(getByText('Test')).toBeInTheDocument();
  });
});
```
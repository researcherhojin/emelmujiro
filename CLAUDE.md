# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Emelmujiro (에멜무지로) is a full-stack web application for an AI Education and Consulting company. The codebase uses a monorepo structure with React/TypeScript frontend and Django backend, deployed via GitHub Pages.

**Current Version**: v3.9.0 (2025.09.01)
**Build Tool**: Vite 7.1.3 (migrated from Create React App)
**Test Framework**: Vitest 3.2.4 (migrated from Jest)
**Live Site**: https://researcherhojin.github.io/emelmujiro
**Port Configuration**: Frontend dev (5173), Frontend preview (4173), Backend (8000)

## Essential Commands

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

# Port management
lsof -ti:5173 | xargs kill -9  # Kill Vite dev server
lsof -ti:4173 | xargs kill -9  # Kill Vite preview
lsof -ti:8000 | xargs kill -9  # Kill Django server
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

# E2E tests (Playwright)
cd frontend && npm run test:e2e
cd frontend && npm run test:e2e:ui  # Interactive mode
cd frontend && npm run test:e2e:debug  # Debug mode

# Backend tests
cd backend && python manage.py test
npm run test:backend  # From root

# Local CI simulation
cd frontend && npm run test:ci:local  # Uses ./scripts/test-ci-local.sh
```

### Building & Deployment

```bash
# Build frontend for production
npm run build               # From root (builds frontend)
npm run build:frontend      # Explicit frontend build from root
cd frontend && npm run build  # From frontend directory
# Build process: generate:sitemap -> tsc -> vite build

# Preview production build locally (port 4173)
cd frontend && npm run preview

# Deploy to GitHub Pages
cd frontend && npm run deploy  # Runs predeploy (build) then gh-pages -d build
# Note: Automatic deployment happens on push to main branch via GitHub Actions

# Docker operations
./scripts/docker-build.sh   # Build Docker images
./scripts/docker-build.sh --push --tag v1.0.0  # Build and push
./scripts/docker-build.sh --no-cache  # Build without cache

# Bundle analysis
cd frontend && npm run analyze:bundle  # Analyze bundle size with source-map-explorer
cd frontend && npm run analyze:build   # Build then analyze
```

### Code Quality

```bash
# Linting
npm run lint                # From root (lints frontend)
cd frontend && npm run lint  # ESLint check
cd frontend && npm run lint:fix  # Auto-fix ESLint issues

# TypeScript
cd frontend && npm run type-check  # Single type check
cd frontend && npm run type-check:watch  # Watch mode

# Formatting
cd frontend && npm run format  # Format all files with Prettier
cd frontend && npm run format:check  # Check formatting without changes

# Bundle analysis
cd frontend && npm run analyze:bundle  # Analyze existing build
cd frontend && npm run analyze:build   # Build then analyze

# Security
cd frontend && npm audit    # Check for vulnerabilities
cd frontend && npm audit fix  # Auto-fix vulnerabilities

# Backend code quality
cd backend && black .       # Format Python code
cd backend && flake8 .      # Lint Python code

# Clean operations
npm run clean               # Clean all (frontend + backend)
cd frontend && npm run clean  # Remove build and cache
cd frontend && npm run clean:all  # Remove everything including node_modules

# Validation (comprehensive check)
cd frontend && npm run validate  # Runs lint, type-check, and test:coverage
```

## Architecture Overview

### Frontend (Vite + React + TypeScript)

**Build Configuration:**

- **Vite 7.1**: Lightning-fast HMR, optimized builds
- **Vitest**: Unit/integration testing with jsdom environment
- **TypeScript 5.9**: Strict mode enabled with all strict checks
- **Path Aliases**: `@/` maps to `src/` directory
- **Entry Point**: `src/main.tsx` (not index.tsx)
- **Server Port**: Development server runs on port 5173 (configured in vite.config.ts)
- **Tailwind CSS**: v3.4.17 with PostCSS configuration
- **PWA**: Full Progressive Web App support with Service Worker

**Application Structure:**

- **Routing**: HashRouter for GitHub Pages compatibility
- **State Management**: Context API (UIContext, BlogContext, AuthContext, FormContext)
- **API Layer**: Centralized in `frontend/src/services/api.ts`
- **WebSocket**: `frontend/src/services/websocket.ts` for real-time features
- **PWA**: Service Worker with offline support in `public/service-worker-enhanced.js`
- **i18n**: Korean/English support via react-i18next (config ready, UI pending)
- **Analytics**: Google Analytics integration

**Component Patterns:**

- All components are TypeScript functional components
- Props defined with interfaces (not type aliases)
- Lazy loading for route-level code splitting
- Consistent use of `@/` import aliases
- Error boundaries for graceful error handling

### Backend (Django REST Framework)

**API Structure:**

- Single `api` app handling all endpoints
- JWT authentication via djangorestframework-simplejwt
- WebSocket support via Django Channels
- CORS configured for frontend integration
- PostgreSQL support with DATABASE_URL

**Database:**

- SQLite for development
- PostgreSQL for production (via DATABASE_URL)
- Redis for caching and WebSocket

### Testing Strategy

**Frontend Testing:**

- **Framework**: Vitest 3.2.4 with React Testing Library
- **Test Files**: 92 test files across all components
- **Patterns**: Use `renderWithProviders` for context wrapping
- **Mocking**: Use `vi.mock()` for module mocking
- **CI Optimization**:
  - Tests run with `pool: 'forks'` for better isolation
  - Single fork in CI mode to prevent memory issues
  - 15s timeout in CI, 10s locally
- **Setup File**: `frontend/src/setupTests.ts` with comprehensive mocks
- **Test Utils**: `frontend/src/test-utils/test-utils.tsx` provides `renderWithProviders`
- **Known Issues**:
  - Several test suites are currently skipped due to timing/isolation issues
  - DOM cleanup issues between tests may cause failures

**Test File Conventions:**

```typescript
// Standard test structure
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@/test-utils/test-utils';

describe('Component', () => {
  it('should render correctly', () => {
    // For components needing context
    renderWithProviders(<Component />);
    // For simple components
    render(<Component />);
  });
});
```

**Common Mock Patterns:**

```typescript
// Mock lucide-react icons (extensively used)
vi.mock('lucide-react', () => ({
  IconName: () => <div data-testid="icon-IconName">Icon</div>,
  // Add all icons used in components
}));

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    // Other motion components
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));
```

### CI/CD Pipeline

**GitHub Actions Workflows:**

- `main-ci-cd.yml`: Full pipeline with testing, security scanning, and deployment
- `pr-checks.yml`: Lightweight checks for pull requests
- Automatic deployment to GitHub Pages on main branch push
- Docker image builds to GitHub Container Registry
- Memory optimization with NODE_OPTIONS='--max-old-space-size=4096'

**Additional CI Tools:**

- Dependabot for dependency updates
- CodeQL for security analysis
- GitLab CI support (`.gitlab-ci.yml`)
- Jenkins support (`Jenkinsfile`)

## Key Development Patterns

### Component Pattern

```typescript
interface ComponentProps {
  title: string;
  onAction?: () => void;
  className?: string;
}

const Component: React.FC<ComponentProps> = ({
  title,
  onAction,
  className,
}) => {
  // Implementation
};

export default Component;
```

### API Integration Pattern

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

### Testing Pattern with Providers

```typescript
import { renderWithProviders } from '@/test-utils/test-utils';
import { describe, it, expect, vi } from 'vitest';

describe('Component', () => {
  it('renders with context', () => {
    const { getByText } = renderWithProviders(
      <Component title="Test" />,
      {
        routerProps: {
          initialEntries: ['/'],
          initialIndex: 0,
        }
      }
    );
    expect(getByText('Test')).toBeInTheDocument();
  });
});
```

### Mock Pattern for Vitest

```typescript
// Mock external modules
vi.mock('lucide-react', () => ({
  IconName: () => <div data-testid="icon">Icon</div>
}));

// Mock hooks
const mockHook = vi.fn();
vi.mock('@/hooks/useCustomHook', () => ({
  useCustomHook: () => mockHook()
}));

// Mock API calls
vi.mock('@/services/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  }
}));
```

## Important Configuration Files

- **Monorepo**: `package.json` - Root package with workspaces configuration
- **Vite Config**: `frontend/vite.config.ts` - Build configuration with chunking strategy
  - Base path: `/emelmujiro/`
  - Server port: 5173
  - API proxy: `/api` → `http://127.0.0.1:8000`
  - Manual chunks for optimization
- **Vitest Config**: `frontend/vitest.config.ts` - Test configuration
  - Pool: `forks` for better isolation
  - Timeouts: 15s (CI) / 10s (local)
  - Single fork in CI to prevent memory issues
- **TypeScript**: `frontend/tsconfig.json` - Strict mode with path aliases
- **ESLint**: `frontend/eslint.config.mjs` - Flat config with React/TypeScript rules
- **Tailwind**: `frontend/tailwind.config.js` - Custom theme and utilities
- **Docker**: `docker-compose.yml` - Multi-service orchestration
- **CI/CD**: `.github/workflows/main-ci-cd.yml` - Automated pipeline
- **PWA Manifest**: `frontend/public/manifest.json` - PWA configuration
- **Test Setup**: `frontend/src/setupTests.ts` - Global test configuration
- **Test Utils**: `frontend/src/test-utils/test-utils.tsx` - Testing helpers

## Common Issues & Solutions

### Vitest Test Failures

- Use `CI=true npm test -- --run` for single run mode
- Check mock implementations match component expectations
- Ensure `renderWithProviders` is used for components needing context
- Common issues:
  - Multiple elements found: Use `getAllBy*()[0]` instead of `getBy*`
  - Timeout errors: Consider skipping with `test.skip` or `describe.skip`
  - DOM not cleaned up: Previous tests' elements may interfere
  - Style property errors: Use `querySelector` instead of `getByRole` when needed
- Currently skipped test suites:
  - WebVitalsDashboard: Multiple sections due to rendering issues
  - ContactPage: Form validation and submission timeouts
  - SkeletonScreen: One integration test with cleanup issues

### TypeScript Errors

- Run `npm run type-check` to identify issues
- Check for missing type definitions in `@types/` packages
- Verify path aliases resolve correctly
- Common issue: JSX element type errors - ensure React imports are correct

### Build Issues

- Clear cache: `rm -rf frontend/node_modules frontend/dist`
- Reinstall: `cd frontend && npm ci`
- Check for conflicting dependencies with `npm ls`
- Vite cache issues: `rm -rf frontend/node_modules/.vite`

### Port Conflicts

```bash
# Kill processes on default ports
npm run dev:clean

# Or manually
lsof -ti:5173 | xargs kill -9  # Vite dev server
lsof -ti:4173 | xargs kill -9  # Vite preview
lsof -ti:8000 | xargs kill -9  # Django server
```

### Service Worker Caching Issues

- Development: Service Worker is disabled by default
- Clear browser cache and unregister Service Worker if needed
- Cache version is in `public/service-worker-enhanced.js`
- Force refresh: Ctrl+Shift+R (Cmd+Shift+R on Mac)

## Performance Benchmarks

- **Dev Server Start**: ~171ms (Vite)
- **Production Build**: ~10 seconds
- **Bundle Size**: ~400KB gzipped
- **Test Suite**: ~30 seconds for full run (92 test files)
- **HMR Update**: <100ms
- **Lighthouse Score**: 95+ across all metrics

## Deployment Checklist

Before deploying to production:

1. **Run Tests**: `cd frontend && CI=true npm test -- --run`
2. **Type Check**: `cd frontend && npm run type-check`
3. **Lint Check**: `cd frontend && npm run lint`
4. **Build Test**: `cd frontend && npm run build`
5. **Bundle Analysis**: `cd frontend && npm run analyze:bundle`
6. **Security Audit**: `cd frontend && npm audit`
7. **Preview Build**: `cd frontend && npm run preview`
8. **Validate All**: `cd frontend && npm run validate` (comprehensive check)

### Pre-commit Hooks

- Configured via Husky and lint-staged
- Automatically runs ESLint and Prettier on staged files
- Backend: Runs Black and Flake8 on Python files

## Current Test Status

### Skipped Test Suites (as of v3.9.0)

These test suites are currently skipped due to CI/CD stability issues:

1. **WebVitalsDashboard** (`src/components/common/__tests__/WebVitalsDashboard.test.tsx`)
   - Production Mode Behavior
   - Web Vitals Integration
   - Metric Rating System
   - Dashboard Content and Layout
   - CSS Classes and Styling
   - Accessibility

2. **ContactPage** (`src/components/pages/__tests__/ContactPage.test.tsx`)
   - Form Validation (entire describe block)
   - Form Submission (entire describe block)
   - Online/Offline Status
   - Individual test: "renders contact form with all fields"

3. **SkeletonScreen** (`src/components/common/__tests__/SkeletonScreen.test.tsx`)
   - Component Integration: "can be used as a loading state placeholder"

4. **Other Individual Tests**
   - accessibility.test.ts: "should handle accessibility announcements with focus management"
   - Footer.test.tsx: Accessibility modal test

### Testing Best Practices for This Codebase

1. **Multiple Elements Error**: Always use `getAllBy*` queries and select first element when testing components that may render multiple times
2. **Timeout Issues**: Set appropriate timeouts or skip problematic tests in CI
3. **DOM Cleanup**: Be aware that previous tests may leave DOM elements that interfere with subsequent tests
4. **Mock Consistency**: Ensure all lucide-react icons and framer-motion components are properly mocked

## Project Statistics

- **TypeScript Coverage**: 100% (139 TS/TSX source files)
- **Component Count**: 134 React components
- **Test Files**: 92 test files
- **Dependencies**: 61 packages (18 production, 43 development)
- **Bundle Chunks**: Optimized with manual chunking:
  - `react-vendor`: React core libraries
  - `ui-vendor`: UI libraries (framer-motion, lucide-react)
  - `i18n`: Internationalization libraries
- **React Version**: 19.1.1
- **TypeScript Version**: 5.9.2

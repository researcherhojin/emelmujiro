# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Emelmujiro (에멜무지로) is a full-stack web application for an AI Education and Consulting company. The codebase uses a monorepo structure with React/TypeScript frontend and Django backend, deployed via GitHub Pages.

**Current Version**: v3.7.0 (2025.08.29)
**Build Tool**: Vite 7.1 (migrated from Create React App)
**Test Framework**: Vitest (migrated from Jest)

## Essential Commands

### Development

```bash
# Start full application (frontend + backend)
npm run dev

# Start with clean ports (kills existing processes)
npm run dev:clean

# Frontend only
cd frontend && npm start

# Backend only
cd backend && python manage.py runserver

# Docker development
docker compose up -d
```

### Testing

```bash
# Run all frontend tests (Vitest)
cd frontend && npm test

# Run specific test file
cd frontend && npm test -- --run src/components/common/__tests__/Button.test.tsx

# Run tests in watch mode
cd frontend && npm test

# Run tests once (CI mode)
cd frontend && CI=true npm test -- --run

# Test with coverage
cd frontend && npm run test:coverage

# Run E2E tests (Playwright)
cd frontend && npm run test:e2e

# Backend tests
cd backend && python manage.py test
```

### Building & Deployment

```bash
# Build frontend for production (Vite)
npm run build:frontend

# Preview production build locally
cd frontend && npm run preview

# Deploy to GitHub Pages (automatic on main branch push)
# Manual deploy: cd frontend && npm run deploy

# Build Docker images
./scripts/docker-build.sh
```

### Code Quality

```bash
# Lint frontend
cd frontend && npm run lint
cd frontend && npm run lint:fix

# TypeScript type checking
cd frontend && npm run type-check

# Format with Prettier
cd frontend && npm run format

# Analyze bundle size
cd frontend && npm run analyze:bundle

# Backend formatting
cd backend && black . && flake8 .
```

## Architecture Overview

### Frontend (Vite + React + TypeScript)

**Build Configuration:**

- **Vite 7.1**: Lightning-fast HMR, optimized builds
- **Vitest**: Unit/integration testing with jsdom
- **TypeScript 5.9**: Strict mode enabled
- **Path Aliases**: `@/` maps to `src/` directory
- **Entry Point**: `src/main.tsx` (not index.tsx)
- **Tailwind CSS**: v3.4.17 (PostCSS configuration)

**Application Structure:**

- **Routing**: HashRouter for GitHub Pages compatibility
- **State Management**: Context API (UIContext, BlogContext, AuthContext, FormContext)
- **API Layer**: Centralized in `frontend/src/services/api.ts`
- **PWA**: Service Worker with offline support in `public/service-worker-enhanced.js`
- **i18n**: Korean/English support via react-i18next

**Component Patterns:**

- All components are TypeScript functional components
- Props defined with interfaces
- Lazy loading for route-level code splitting
- Consistent use of `@/` import aliases

### Backend (Django REST Framework)

**API Structure:**

- Single `api` app handling all endpoints
- JWT authentication via djangorestframework-simplejwt
- WebSocket support via Django Channels
- CORS configured for frontend integration

**Database:**

- SQLite for development
- PostgreSQL for production (via DATABASE_URL)

### Testing Strategy

**Frontend Testing:**

- **Framework**: Vitest with React Testing Library
- **Coverage**: 99.1% pass rate (1,296/1,307 tests)
- **Patterns**: Use `renderWithProviders` for context wrapping
- **Mocking**: Use `vi.mock()` for module mocking
- **CI Optimization**: Tests run with `--maxWorkers=2` to prevent memory issues

**Test File Conventions:**

```typescript
// Standard test structure
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

describe('Component', () => {
  it('should render correctly', () => {
    // test implementation
  });
});
```

### CI/CD Pipeline

**GitHub Actions Workflows:**

- `main-ci-cd.yml`: Full pipeline with testing, security scanning, and deployment
- `pr-checks.yml`: Lightweight checks for pull requests
- Automatic deployment to GitHub Pages on main branch push
- Tests run with memory optimization flags

## Key Development Patterns

### Component Pattern

```typescript
interface ComponentProps {
  title: string;
  onAction?: () => void;
}

const Component: React.FC<ComponentProps> = ({ title, onAction }) => {
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
    // Error handling
  }
};
```

### Testing Pattern

```typescript
import { renderWithProviders } from '@/test-utils';
import { describe, it, expect, vi } from 'vitest';

describe('Component', () => {
  it('renders with props', () => {
    const { getByText } = renderWithProviders(
      <Component title="Test" />
    );
    expect(getByText('Test')).toBeInTheDocument();
  });
});
```

### Mock Pattern for Vitest

```typescript
// Mock external modules
vi.mock('lucide-react', () => ({
  IconName: () => <div>Icon</div>
}));

// Mock hooks
const mockHook = vi.fn();
vi.mock('@/hooks/useCustomHook', () => ({
  useCustomHook: mockHook
}));
```

## Important Configuration Files

- **Vite Config**: `frontend/vite.config.ts` - Build and dev server configuration
- **Vitest Config**: `frontend/vitest.config.ts` - Test configuration with coverage
- **TypeScript**: `frontend/tsconfig.json` - Strict mode with path aliases
- **ESLint**: `frontend/eslint.config.mjs` - Flat config with TypeScript rules
- **Tailwind**: `frontend/tailwind.config.js` - Custom theme and utilities
- **Docker**: `docker-compose.yml` - Multi-service orchestration
- **CI/CD**: `.github/workflows/main-ci-cd.yml` - Automated pipeline

## Common Issues & Solutions

### Vitest Test Failures

- Use `CI=true npm test -- --run` for single run mode
- Check mock implementations match component expectations
- Ensure `renderWithProviders` is used for components needing context
- AdminPanel test may timeout - CI timeout is set to 15s

### TypeScript Errors

- Run `npm run type-check` to identify issues
- Check for missing type definitions in `@types/` packages
- Verify path aliases resolve correctly

### Build Issues

- Clear cache: `rm -rf frontend/node_modules frontend/build`
- Reinstall: `cd frontend && npm install`
- Check for conflicting dependencies

### Port Conflicts

```bash
# Kill processes on default ports
npm run dev:clean

# Or manually
lsof -ti:3000 | xargs kill -9
lsof -ti:8000 | xargs kill -9
```

### Service Worker Caching Issues

- Development: Service Worker is disabled by default
- Clear browser cache and unregister Service Worker if needed
- Cache version is in `public/service-worker-enhanced.js`

## Performance Benchmarks

- **Dev Server Start**: ~171ms (Vite)
- **Production Build**: ~10 seconds
- **Bundle Size**: ~400KB gzipped
- **Test Suite**: ~30 seconds for full run
- **HMR Update**: <100ms

## Deployment Checklist

Before deploying to production:

1. **Run Tests**: `cd frontend && CI=true npm test -- --run`
2. **Type Check**: `cd frontend && npm run type-check`
3. **Lint Check**: `cd frontend && npm run lint`
4. **Build Test**: `cd frontend && npm run build`
5. **Bundle Analysis**: `cd frontend && npm run analyze:bundle`

## Project Statistics

- **TypeScript Coverage**: 100% (227 TS/TSX files)
- **Component Count**: 70+ React components
- **Test Files**: 94 test files
- **Test Pass Rate**: 99.1% (1,296/1,307)
- **Dependencies**: 61 packages (18 production, 43 development)
- **Bundle Chunks**: 19 (with code splitting)

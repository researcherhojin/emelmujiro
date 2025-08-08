# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Emelmujiro (에멜무지로) is a full-stack web application for an AI Education and Consulting company. The codebase uses a monorepo structure with React/TypeScript frontend and Django backend, deployed via GitHub Pages with comprehensive CI/CD pipelines.

## Essential Commands

### Development
```bash
# Start full application (frontend + backend)
npm run dev

# Start with clean ports (kills existing processes)
npm run dev:clean

# Start with Docker
docker compose up -d

# Install all dependencies
npm install:all
```

### Testing
```bash
# Run all tests
npm test

# Frontend unit tests only
cd frontend && npm test

# Frontend E2E tests (Playwright)
cd frontend && npm run test:e2e

# Backend tests
cd backend && python manage.py test

# Single test file (frontend)
cd frontend && npm test -- Button.test.tsx

# Test with coverage
cd frontend && CI=true npm test -- --coverage
```

### Building & Deployment
```bash
# Build frontend for production
npm run build:frontend

# Build Docker images
./scripts/docker-build.sh

# Deploy to GitHub Pages (automatic on main branch push)
# Manual: cd frontend && npm run deploy
```

### Code Quality
```bash
# Lint frontend
cd frontend && npm run lint

# TypeScript type checking
cd frontend && npm run type-check

# Backend linting
cd backend && black . && flake8 .
```

## Architecture Overview

### Frontend Architecture
The frontend is a React SPA with TypeScript, using HashRouter for GitHub Pages compatibility:

- **Component Structure**: All components are TypeScript functional components with proper typing
- **State Management**: Context API with 4 main contexts (UIContext, BlogContext, AuthContext, FormContext)
- **API Layer**: Centralized in `frontend/src/services/api.ts` with axios interceptors for error handling
- **Routing**: HashRouter configuration in `App.tsx` with lazy-loaded routes for code splitting
- **PWA Implementation**: Service Worker in `public/service-worker-enhanced.js` with offline support and background sync

### Backend Architecture
Django REST API with PostgreSQL/SQLite:

- **API Structure**: Single `api` app handling all endpoints
- **Settings**: Environment-based configuration in `backend/config/settings.py`
- **Security**: CORS configuration for frontend integration, rate limiting, security middleware
- **Database**: SQLite for development, PostgreSQL for production (via DATABASE_URL)

### CI/CD Pipeline
GitHub Actions workflows handle all automation:

- **main-ci-cd.yml**: Comprehensive pipeline for testing, security scanning, building, and deployment
- **pr-checks.yml**: Lightweight checks for pull requests with affected code testing
- **Deployment**: Automatic to GitHub Pages on main branch push

### Docker Setup
Multi-stage builds with optimized images:

- **Frontend**: nginx serving static files (Dockerfile uses yarn/npm detection)
- **Backend**: Gunicorn with Django, includes static file collection
- **Services**: PostgreSQL, Redis for caching
- **Environment**: Configuration via `.env` file (copy from `.env.example`)

## Key Development Patterns

### Frontend Component Pattern
```typescript
// Components use TypeScript interfaces for props
interface ComponentProps {
  title: string;
  onAction?: () => void;
}

// Functional components with proper typing
const Component: React.FC<ComponentProps> = ({ title, onAction }) => {
  // Implementation
};
```

### API Integration Pattern
```typescript
// All API calls go through frontend/src/services/api.ts
import api from '@/services/api';

const fetchData = async () => {
  const response = await api.get('/endpoint/');
  return response.data;
};
```

### Testing Pattern
```typescript
// Tests use renderWithProviders from test-utils
import { renderWithProviders } from '@/test-utils';

test('component behavior', () => {
  const { getByText } = renderWithProviders(<Component />);
  // Test implementation
});
```

## Important Configuration Files

- **Frontend TypeScript**: `frontend/tsconfig.json` - strict mode enabled
- **ESLint**: `frontend/eslint.config.mjs` - flat config with TypeScript support
- **Docker**: `docker-compose.yml` - full service orchestration
- **GitHub Actions**: `.github/workflows/main-ci-cd.yml` - main CI/CD pipeline
- **Environment**: `.env.example` - template for environment variables

## Deployment Information

- **Production URL**: https://researcherhojin.github.io/emelmujiro
- **GitHub Pages**: Deployed from `frontend/build` directory
- **Backend**: Currently requires separate deployment (not on GitHub Pages)
- **Docker Registry**: Images tagged as `emelmujiro/frontend` and `emelmujiro/backend`

## Common Issues & Solutions

### ESLint Errors During Build
The frontend Dockerfile sets `DISABLE_ESLINT_PLUGIN=true` to bypass ESLint during Docker builds.

### Yarn Lock Outdated
Frontend uses yarn. If lock file is outdated, run `cd frontend && yarn install` to update.

### Port Conflicts
Use `npm run dev:clean` to kill existing processes on ports 3000 and 8000.

### Docker Platform Warnings
Images are built for linux/amd64. ARM users may see platform warnings but containers will run.

## Testing Requirements

- All new components must have corresponding test files
- Tests should use `renderWithProviders` for proper context wrapping
- E2E tests focus on critical user flows (homepage, contact, blog)
- Maintain 100% test pass rate (currently 277 test cases)
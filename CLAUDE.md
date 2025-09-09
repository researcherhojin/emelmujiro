# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Emelmujiro (에멜무지로) is a full-stack monorepo application for AI Education and Consulting, deployed via GitHub Pages with Mock API in production.

**Live Site**: https://researcherhojin.github.io/emelmujiro
**Frontend Dev**: Port 5173 (Vite) - NOT 3000
**Backend Dev**: Port 8000 (Django)
**Preview**: Port 4173 (Vite preview)

⚠️ **Critical**: Production ALWAYS uses Mock API due to GitHub Pages deployment. Real backend deployment pending.

## Essential Commands

### Monorepo Commands (from root)
```bash
# Install everything
npm install && cd frontend && npm install && cd ../backend && pip install -r requirements.txt

# Development
npm run dev                # Frontend + Backend concurrently
npm run dev:clean          # Kill ports first, then start
npm run dev:safe           # Kill others on fail (--kill-others-on-fail)

# Build & Test
npm run build:frontend     # Workspace-aware frontend build
npm test                   # Both frontend and backend tests
npm run install:all        # Install all dependencies
```

### Frontend Commands (from frontend/)
```bash
# Development
npm run dev                # Vite dev server (port 5173)
npm run preview            # Preview build (port 4173)

# Testing
npm test                   # Vitest watch mode
npm run test:run           # Single run
npm run test:ci            # CI optimized (--bail=1, no coverage)
npm run test:coverage      # With coverage
CI=true npm test -- --run  # CI mode single run

# Specific test
CI=true npm test -- --run src/components/common/__tests__/Button.test.tsx
CI=true npm test -- --run --reporter=verbose  # Verbose output

# Build & Deploy
npm run build              # Production build to 'build' directory
npm run deploy             # Build + deploy to GitHub Pages
npm run generate:sitemap   # Generate SEO sitemaps

# Code Quality
npm run lint               # ESLint check
npm run lint:fix           # Auto-fix
npm run type-check         # TypeScript check
npm run type-check:watch   # Watch mode
npm run format             # Prettier format
npm run validate           # lint + type-check + test:coverage
```

### Backend Commands (from backend/)
```bash
python3 manage.py runserver     # Django dev server
python3 manage.py test          # Django tests
python3 manage.py makemigrations
python3 manage.py migrate
black .                         # Format Python code
flake8 .                        # Lint Python code
```

### Port Management
```bash
# Kill stuck ports (CRITICAL - use 5173, not 3000!)
lsof -ti:5173 | xargs kill -9  # Kill Vite
lsof -ti:8000 | xargs kill -9  # Kill Django
./scripts/kill-ports.sh         # Kill all (3000, 8000)

# Check port availability
lsof -i:5173
netstat -an | grep 5173
```

## Architecture & Patterns

### Mock API vs Real API
```typescript
// src/services/api.ts - ALWAYS mock in production!
const USE_MOCK_API =
  process.env.REACT_APP_USE_MOCK_API === 'true' ||
  process.env.NODE_ENV === 'test' ||
  isProduction; // GitHub Pages can't reach backend
```

### Environment Variables Migration
```typescript
// src/config/env.ts - Supports both REACT_APP_ and VITE_
const getEnvVar = (key: string, defaultValue: string = ''): string => {
  const viteKey = key.replace('REACT_APP_', 'VITE_');
  // Checks Vite env first, fallbacks to process.env
};
```

### State Management Architecture
- **Zustand Store** (`src/store/useAppStore.ts`):
  - UI slice: Theme, loading, modals, notifications
  - Auth slice: User, tokens, permissions
  - Blog slice: Posts, categories, comments
  - Chat slice: Messages, typing indicators, online users
- **React Context**: UIContext, AuthContext, BlogContext, FormContext
- **Pattern**: Zustand for global state, Context for component-level state

### API Service Structure
```typescript
// src/services/api.ts
const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
});

// Services: blog, contact, projects, newsletter, health
// All have mock implementations in src/services/mockData.ts
```

## Testing Issues & Workarounds

### 55% Test Skip Rate - Root Causes
1. **getByRole failures**: `style.getPropertyValue` errors in CI
2. **classList errors**: DOM manipulation issues
3. **framer-motion warnings**: `whileHover`, `whileTap` props
4. **IndexedDB unavailable**: Test environment limitation
5. **react-helmet-async**: DOM conflicts

### CI-Specific Test Pattern
```typescript
// Common workaround pattern (121 occurrences)
const itSkipInCI = process.env.CI === 'true' ? it.skip : it;
itSkipInCI('test using getByRole', () => {
  // Test that fails in CI
});
```

### Test Configuration
- **Vitest**: Forks pool, single fork in CI, 15s timeout
- **Memory**: `NODE_OPTIONS='--max-old-space-size=4096'` in CI
- **Custom Utilities**: `renderWithProviders` in test-utils/

## Critical Configuration

### Vite Configuration
```typescript
// vite.config.ts
base: '/emelmujiro/',  // REQUIRED for GitHub Pages
server: {
  port: 5173,          // NOT 3000!
  proxy: {
    '/api': 'http://127.0.0.1:8000'
  }
}
```

### Build Configuration
- **Output**: `build/` directory (not `dist/`)
- **Chunks**: react-vendor, ui-vendor, i18n
- **Terser**: Drops console/debugger in production

### TypeScript Configuration
- **Target**: ES2020
- **Path Alias**: `@/` → `src/`
- **Types**: vite/client, node, vitest/globals, @testing-library/jest-dom

## Docker Setup

### Development
```bash
docker-compose -f docker-compose.dev.yml up
```

### Production Stack
```yaml
# docker-compose.yml services:
- frontend (nginx:alpine)
- backend (Django + Gunicorn)
- postgres (PostgreSQL 15)
- redis (Redis 7)
- nginx (proxy, production profile)
- certbot (SSL, production profile)
```

## Git Hooks & Pre-commit

### Husky + lint-staged
```json
// Runs on pre-commit
"src/**/*.{js,jsx,ts,tsx}": ["eslint --fix", "prettier --write"]
"src/**/*.{json,css,md}": ["prettier --write"]
```

### Pre-deployment Check
```bash
./scripts/pre-deploy-check.sh  # 326-line comprehensive validation
```

## Current Issues & Solutions

### React 19 Compatibility
- Using React 19.1.1 but many libraries incompatible
- Dependabot ignores React 19.x updates
- Solution: Mock problematic components in tests

### Memory Issues in CI
```bash
# Optimizations applied:
NODE_OPTIONS='--max-old-space-size=4096'
vitest --pool=forks --poolOptions.forks.singleFork  # In CI
```

### Tailwind CSS 3.x (Downgraded from 4.x)
```javascript
// postcss.config.js - MUST use 'tailwindcss', not '@tailwindcss/postcss'
module.exports = {
  plugins: {
    tailwindcss: {},  // v3.x syntax
    autoprefixer: {},
  },
};
```

## Deployment

### GitHub Pages (Current)
```bash
cd frontend && npm run deploy  # Builds and deploys via gh-pages
```

### Full Production (Future)
1. Deploy backend to cloud provider
2. Set VITE_USE_MOCK_API=false
3. Configure PostgreSQL and Redis
4. Update CORS settings

## Performance Metrics

- **Bundle Size**: 190KB gzipped (52% reduction from v4.0.2)
- **Build Time**: 2.8s (72% reduction)
- **Dev Server Start**: ~144ms
- **Test Execution**: ~6.35s for 716 active tests

## Common Pitfalls

1. **Wrong Port**: Frontend is 5173, not 3000
2. **Mock API**: Production always uses mock, not configurable
3. **Test Skips**: 55% tests skipped is expected, not a bug
4. **Build Output**: Goes to `build/`, not `dist/`
5. **Environment Variables**: Use VITE_ prefix for new vars

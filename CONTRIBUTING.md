# Contributing to Emelmujiro

Thank you for your interest in contributing!

## How to Contribute

### 1. Check Existing Issues

Before creating a new issue, check [existing issues](https://github.com/researcherhojin/emelmujiro/issues) to avoid duplicates.

### 2. Fork & Clone

```bash
git clone https://github.com/[your-username]/emelmujiro.git
cd emelmujiro
git remote add upstream https://github.com/researcherhojin/emelmujiro.git
```

### 3. Create a Branch

```bash
git checkout -b feature/your-feature-name   # New feature
git checkout -b fix/bug-description         # Bug fix
```

### 4. Setup

**Prerequisites**: Node >= 24, Python 3.12, [uv](https://docs.astral.sh/uv/)

```bash
make install                                          # npm install + uv sync --extra dev
cd backend && uv run python manage.py migrate && cd ..  # First-time backend setup
npm run dev                                            # Frontend :5173 + Backend :8000
```

### 5. Code Rules

- **Conventional commits**: `type(scope): description` — types: `feat|fix|docs|style|refactor|test|chore|deps|ci`
- **All UI strings via i18n** — `useTranslation()` in components, `i18n.t()` in data files
- **English comments only**
- **ESLint + Prettier + Black + Flake8** — pre-commit hooks run automatically

See [CLAUDE.md](CLAUDE.md) for full operational rules and conventions.

### 6. Testing

```bash
make test                  # Frontend + backend
npm run validate           # lint + type-check + test:coverage (from frontend/)
npm run test:e2e           # Playwright E2E (from frontend/)

# Single test
CI=true npm test -- --run src/components/common/__tests__/Navbar.test.tsx

# Backend
DATABASE_URL="" uv run python manage.py test   # from backend/
```

Coverage target: 100%.

### 7. Pull Request

- Target the `main` branch
- All CI checks must pass (lint, type-check, test, security scan, bundle size, Lighthouse)
- Include a description of changes and a test plan

## Questions?

- [GitHub Issues](https://github.com/researcherhojin/emelmujiro/issues)
- Email: contact@emelmujiro.com

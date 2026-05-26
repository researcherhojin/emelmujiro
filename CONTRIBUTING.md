# Contributing to Emelmujiro

Thanks for your interest. This is a small monorepo — keep changes surgical.

## Setup

See [README — Getting Started](README.md#getting-started). Prerequisites: Node ≥ 24, Python 3.12, [uv](https://docs.astral.sh/uv/).

Fork → clone → `make install` → `make dev-local`. On a fresh macOS box, `make setup-dev-machine` automates the brew + env bootstrap; `make verify-setup` is a re-runnable health check.

## Where the rules live

**[CLAUDE.md](CLAUDE.md) is the single source of truth** for operational rules: architecture invariants, UI conventions, CI constraints, gotchas. Read the `Quick Orientation` block first — it routes you to the relevant section by task type.

This file lists only the contributor-facing checklist; for the "why" behind any rule, look there.

## Workflow checklist

1. **Branch**: `feature/<name>` or `fix/<description>`. Target `main`.
2. **Commit messages**: Conventional Commits, English only, enforced by `commit-msg` hook.
   `type(scope): description` — types: `feat fix docs style refactor test chore deps ci`.
3. **One issue per PR, ≤ 3 commits**, no mid-PR scope expansion. Defer follow-ups to a new issue.
4. **Test before pushing**: `make test` (frontend + backend) and `make lint` from repo root.
5. **PR**: open against `main` with a short summary + test plan. CI runs lint, type-check, test, Trivy, bundle size, Lighthouse, Codecov.

## Code rules (the short version)

- **i18n always**: `useTranslation()` in components, `i18n.t()` in data files. No hardcoded user-facing strings.
- **English comments only** in source.
- **No `window.alert/prompt`** — use a toast or inline UI.
- **Logger import**: `import logger from '../utils/logger'` (default export). Use `env.IS_DEVELOPMENT` for environment checks.
- **`[skip ci]` only in Ship-phase README sync commits.** Putting the literal string anywhere in a commit message — even in prose describing the mechanism — causes GitHub to skip every workflow for that commit (see CLAUDE.md Gotcha #10).
- **Pre-commit runs lint-staged** (Prettier + ESLint + Black + Flake8). Don't bypass with `--no-verify`.

## Testing

```bash
make test                                                                     # all
make test-ci                                                                  # CI mode (no watch, coverage)
CI=true npm test -- --run src/components/common/__tests__/Navbar.test.tsx     # single frontend
DATABASE_URL="" uv run python manage.py test api.tests.CategoryAPITestCase    # single backend (from backend/)
npm run test:e2e                                                              # Playwright (5 profiles, from frontend/)
```

Coverage target is 100 %; the merge gate ([`codecov.yml`](codecov.yml)) actually fails at project floor 99 % / patch floor 87 % (`threshold: 1%` and `threshold: 3%`). Aim for 100 %, ship at ≥ 99 %.

Backend test output is intentionally noisy — negative-path tests (XSS/SQL/path-traversal middleware, SMTP/DB failure paths, JWT invalid tokens, reCAPTCHA fallbacks) log errors on purpose. Trust `Ran N tests OK` + exit code 0, not the absence of log lines.

## Questions

- [GitHub Issues](https://github.com/researcherhojin/emelmujiro/issues)
- contact@emelmujiro.com

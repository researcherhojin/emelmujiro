# Contributing to Emelmujiro

Thanks for your interest. This is a small monorepo — keep changes surgical.

## Setup

Fork → clone → follow [README — Getting Started](README.md#getting-started) (`make install`, first-time `migrate`, `npm run dev`). On a fresh macOS box, `make setup-dev-machine` automates the bootstrap; `make verify-setup` is a re-runnable health check.

## Where the rules live

**[CLAUDE.md](CLAUDE.md) is the single source of truth** for operational rules — architecture invariants, CI constraints, gotchas — with domain rules in [`.claude/rules/`](.claude/rules/). Start with its `Quick Orientation` block. This file is only the contributor checklist; the "why" behind each item lives there.

## Workflow checklist

1. **Branch**: `feature/<name>` or `fix/<description>`, targeting `main`.
2. **Commit messages**: Conventional Commits in English — `type(scope): description`, types `feat fix docs style refactor test chore perf deps-dev deps ci`. Enforced by `scripts/repo/check-commit-msg.sh`, which both the `commit-msg` hook and CI call; change accepted types there only. ASCII is required on the subject line; `git commit --no-verify` is the escape for a non-ASCII proper noun.
3. **Keep CI enabled for contributor commits.** Avoid bracketed skip markers in the subject or body and the `skip-checks: true` trailer. Escape brackets to discuss a marker (`\[skip ci\]`). The commit-message checker rejects both forms and allows the generated README sync commit's bracketed marker. [GitHub Actions skip instructions](https://docs.github.com/en/actions/how-tos/manage-workflow-runs/skip-workflow-runs)
4. **One issue per PR, ≤ 3 commits**, no mid-PR scope expansion. Defer follow-ups to a new issue.
5. **Before pushing**, run `make test` and `make lint` from the repo root. The pre-commit hook runs ESLint from the frontend workspace and Black and Flake8 from `backend/`. When changing the lint-staged configuration, run `npm run check:scripts` to exercise paths with spaces in a temporary repository. [lint-staged documentation](https://github.com/lint-staged/lint-staged)
6. **PR**: against `main`, with a short summary, a test plan and a `CHANGELOG.md` entry under `## Merged since [1.0.0]` (CI warns if it is missing and exempts Dependabot PRs and changes confined to `docs/intents/`). PR CI runs lint, type-check, tests, Playwright E2E (Chromium), Trivy, bundle size, Lighthouse, `cspell` and Docker builds of the images a PR changes; Codecov uploads run on the `main` pipeline after merge.

## Code rules (the short version)

- **i18n always**: `useTranslation()` in components, `i18n.t()` in data files. No hardcoded user-facing strings.
- **English comments only** in source.
- **No `window.alert/prompt`** — use a toast or inline UI.
- **Logger**: `import logger from '../utils/logger'` (default export); `env.IS_DEVELOPMENT` for environment checks.
- **Spelling**: `npm run spell`. Run `npx cspell trace <word>` first — the `npm`, `softwareTerms` and `software-tools` dictionaries are on, so package names usually need nothing. A real word they miss goes in `cspell.json`'s `words`; a deliberate non-word goes in a file-scoped `cspell:ignore` comment, so the dictionary never accepts typo-shaped tokens.

## Testing

See the [README commands](README.md#useful-commands) and [single-test invocations](CLAUDE.md#commands). Use `DATABASE_URL=""` for the default Django suite so it runs against SQLite. PostgreSQL-specific verification uses an isolated test database. [Backend testing rules](.claude/rules/backend.md#testing)

- **Coverage** aims for 100 %; [`codecov.yml`](codecov.yml) fails below 99 % per project and 87 % on the patch.
- **Backend test output is noisy on purpose** — negative-path tests log errors. Trust `Ran N tests` + `OK` and exit code 0.
- **Sitemap generation**: run `node --test frontend/scripts/test-generate-sitemap.ts` from the root. API errors or incomplete pagination must abort generation without replacing the existing sitemap.
- **Security configuration changes**: use the [manual audit commands](docs/intents/infra/security-monitoring.md#manual-operation) and record the scanner results. A Docker image audit requires a host running the images to be checked.
- **Cookie authentication**: browser writes bootstrap a token from `GET /api/auth/csrf/` and send `X-CSRFToken`. Login and refresh also require CSRF; password changes revoke earlier tokens. Regression tests live in `backend/api/test_security.py` and `frontend/src/services/__tests__/api.csrf.test.ts`.
- **Image uploads**: `backend/api/validators.py` decodes uploaded JPEG, PNG and GIF files and caps frame dimensions, total pixels and animation frames. Add real encoded fixtures for changes; upload API regression tests are in `backend/api/test_upload_security.py`.
- **Container images**: PostgreSQL, Umami and nginx security recipes live under `docker/`. After changing one, run `sh docker/postgres/verify.sh`, build Umami and run `sh docker/umami/verify.sh`, or build `docker/nginx` and run `sh docker/nginx/verify.sh <image> frontend/nginx.conf`; each uses disposable containers (and Umami a disposable network) and removes them. PR CI's `Docker Images` job runs the same build and check for any PR that changes a file other than Markdown in one of those directories; the nginx check also runs on a `docker-compose.yml` or `frontend/nginx.conf` change.
- **Browser artifacts**: `.playwright-cli/` and `output/playwright/` are local generated output, excluded from Git and spelling checks.

### Mobile browser checks

Install Chromium and WebKit from `frontend/` before running the mobile checks.

```bash
npx playwright install chromium webkit
npm run test:e2e -- --project "Mobile Chrome" --project "Mobile Safari"
PLAYWRIGHT_BRAVE_EXECUTABLE="/path/to/Brave Browser" npm run test:e2e -- --project "Mobile Brave"
```

The Brave project uses the installed desktop executable with the Pixel 5 viewport and touch profile. Verify Brave Shields and device-specific behavior in the mobile app when those are in scope. [Playwright browser emulation](https://playwright.dev/docs/browsers) · [Brave browser engines and Shields](https://brave.com/about/)

## Local-only files

Keep private runbooks, host details, and personal agent instructions under `.private/` or in `*.local.md` files. Store credentials in the environment or in local credential files. Use `git check-ignore -v -- <path>` to check the rule for an untracked file and `git ls-files -- <path>` to check whether Git already tracks it. Ignore rules apply to untracked files. If a credential reaches a commit, revoke or rotate it first. [Git ignore rules](https://git-scm.com/docs/gitignore) · [GitHub sensitive data guidance](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository)

Treat `frontend/.env.production` as public build configuration. Vite can bundle `VITE_*` values into browser assets. [Vite environment variables](https://vite.dev/guide/env-and-mode#env-variables)

## Questions

- [GitHub Issues](https://github.com/researcherhojin/emelmujiro/issues)
- [Security reporting contact](https://emelmujiro.com/.well-known/security.txt)
- contact@emelmujiro.com

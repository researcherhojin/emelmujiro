# AGENTS.md

Full-stack monorepo (**React 19 + Vite** frontend, **Django 6 + DRF** backend), self-hosted via Docker behind a Cloudflare Tunnel. This file is the fast-ramp-up / mistake-avoidance index. The **deep, authoritative rules live in `CLAUDE.md` and the path-scoped `.claude/rules/{frontend,frontend-build,backend,ci,claude-config}.md`** — read the matching one for the task; do not duplicate them here.

**Operating principle (from `CLAUDE.md`):** counts and claims _about the codebase_ are exact and verifiable — no `+` / `≥` / round-figure handwaves in this doc, `README.md`, `CHANGELOG.md`, or commit messages. Marketing copy in the UI itself is the only exemption.

## Read first by task

- UI / page work → `.claude/rules/frontend.md`
- Backend / API / migrations → `.claude/rules/backend.md`
- Build, deploy, CI, or a red check → `.claude/rules/ci.md` + `.claude/rules/frontend-build.md` + `.claude/rules/backend.md` (migrations) + `CLAUDE.md` → `Constraints`.
- A `Security operations require attention` issue → `.claude/rules/ci.md` → Scheduled security operations, then `docs/intents/infra/security-operations.md`.
- Dependency bumps → `CLAUDE.md` → `Gotchas` (numbered; the numbers are cited from commits and never change). Each rule's fix steps and evidence are in `.claude/skills/gotchas/SKILL.md` under the same number.
- Planned work → `docs/intents/<module>/<slug>.md` (workflow and statuses in `docs/intents/README.md`): Intent → Spec → Plan → implement → `shipped` with an `Outcome`, then deleted unless a living doc cites it. Read the file's `status` before starting.
- `main-ci-cd.yml`, `pr-checks.yml` are the CI source of truth; cite job/step **by name, not line number** (they move often).

## Setup & environment

- **Node ≥ 24, Python 3.12, `uv`** (not pip). The root `package.json` declares one npm workspace, `frontend/`; the backend (`backend/`) uses `uv`.
  ```bash
  make install                       # npm install + uv sync --extra dev
  cd backend && uv run python manage.py migrate && cd ..   # first-time only
  npm run dev                        # fe :5173 + be :8000 (NOT port 3000)
  ```
- `make setup-dev-machine` bootstraps a fresh macOS box; `make verify-setup` is the re-runnable health check.
- **Don't run local dev backend and Docker backend together** — both bind `:8000`, and their DBs are independent (local SQLite vs the Docker volume).

## Commands (non-obvious ones)

Run frontend commands from `frontend/`; root `npm run` drives both servers.

```bash
make test | make test-ci             # all tests (frontend vitest + backend)
make lint | make lint-fix            # eslint(frontend) + black/flake8(backend)
cd frontend && npm run validate      # lint + type-check + test:coverage (local "before push")
cd frontend && npm run type-check    # tsc --noEmit AND tsc -p tsconfig.node.json
cd frontend && npm run test:e2e      # Playwright, production build (see gotchas)
cd frontend && npm run check:routes  # cross-references the 4 hardcoded route lists; fails CI on drift
cd frontend && npm run analyze:bundle   # needs a build first
npm run knip | npm run spell         # dead code / cspell, from root
```

**Single test**

```bash
cd frontend && npx vitest run <path>              # one frontend test file
cd frontend && npx vitest run -t "<test name>"    # one test by name
cd backend && DATABASE_URL="" uv run python manage.py test api.tests.BlogPostAPITestCase
```

- `make help` lists the main make targets (the `Makefile`'s `.PHONY` line has the full set); there is no `make type-check` — use `cd frontend && npm run type-check`.
- Repo checks CI runs, from root: `./scripts/check-changelog.sh origin/main HEAD`, `./scripts/test-check-changelog.sh`, `./.claude/hooks/test-guard-bash.sh`.
- Inside the **backend container, run Django via `uv run`** (`docker exec -i emelmujiro-backend uv run python manage.py …`); bare `python manage.py` fails with `No module named 'django'` (uv-managed venv).

## Build & deploy gotchas (load-bearing)

- Build output is **`build/`** (not `dist/`). **Never `rm -rf frontend/build`** — use `rm -rf frontend/build/*` (a bare `rm -rf frontend/build` breaks the nginx volume mount).
- `npm run build` pipeline is ordered and load-bearing: `generate:sitemap ∥ tsc -p tsconfig.build.json` → `vite build` → `cp index.html app.html` → `node scripts/prerender.js` → `cp app.html 404.html`.
- **Chromium is a build dependency, not E2E-only** — `prerender.js` calls `chromium.launch()`, so `vite build` can look green while prerender dies. `npx playwright install chromium` if it vanishes.
- **E2E serves the production build via `build:e2e` + `npm run serve:build`** — NOT `vite preview` (it answers every route with the homepage snapshot) and NOT plain `build` (it inlines `VITE_API_URL` and calls the **live** API).
- **Adding a new dynamic route**: update the SPA-fallback regex in **both** `frontend/nginx.conf` and `frontend/scripts/e2e-server.mjs`. **Adding a static page**: add it to `staticRoutes` in `frontend/scripts/generate-sitemap.js` or it ships a hard 404. Either omission fails `check:routes` in CI.
- **Verify a backend deploy by commit, not by a `200`**: `curl https://emelmujiro.com/api/health/` returns the baked `commit`; match it to the deployed SHA. A `200` passes even against a stale container. Migrations run in-container before gunicorn — keep them additive.
- Auto-merged Dependabot commits **create no push run** (`GITHUB_TOKEN`), so the auto-merge job dispatches the pipeline itself and the nightly drift check redeploys anything missed, filing an issue when that redeploy does not land. A green pipeline is **not** deploy evidence.

## Conventions that differ from defaults

- **Conventional Commits, English-only subject:** `type(scope): description` — `feat fix docs style refactor test chore perf deps-dev deps ci`. **No CI-skip markers anywhere in the message** (subject _or_ body — GHA scans the whole thing); escape brackets to write about one (`\[skip ci\]`). `scripts/check-commit-msg.sh` is the source of truth; edit the accepted types there, never inline. Branches `feature/*` | `fix/*`; one issue per PR, ≤ 3 commits.
- **Every shipped change gets a `CHANGELOG.md` entry** under `## Merged since [1.0.0]` (newest first). `scripts/check-changelog.sh` warns, never blocks, when a change outside `docs/intents/` has none — in PR CI and in the husky `pre-push` hook for direct pushes to `main`. Husky also runs lint-staged on `pre-commit` and `check-commit-msg.sh` on `commit-msg`; don't bypass them.
- **i18n is mandatory** — `useTranslation()` in components, `i18n.t()` in data files; no hardcoded user-facing text. **English comments only.** No `window.alert/prompt` (use toast/inline).
- **Tailwind is 4.x with v3-parity shims** (`@config` JS theme, pinned v3 palette and prose colors, compat rules in `src/index.css`; details in `.claude/rules/frontend-build.md`); PostCSS uses `@tailwindcss/postcss`; no dynamic class interpolation. Measure a palette, shim or shared-style change with `npm run visual:capture` / `visual:compare`, never by eye. The v5 major is dependabot-ignored.
- **Env var prefix is `VITE_`** (legacy `REACT_APP_` still resolves via a shim). `frontend/.env.production` is **tracked in git on purpose** — do not `git rm` it.
- **`react`/`react-dom` must stay version-parity** — Dependabot bumps them separately and Vitest then crashes with `Incompatible React versions`; check parity after any react merge.

## Dependencies — do not "clean up" these

- **Never push to (or rebase) a `dependabot/*` branch** — GitHub silently closes the PR; comment `@dependabot rebase` instead. Claude Code's `.claude/hooks/guard-bash.sh` blocks this, `npm audit fix`, removing `frontend/build` itself and `git rm` of `.env.production`; other agents have no such hook, so the rules below are on you.
- **Never run `npm audit fix` / `--force`** — it downgrades `@lhci/cli` and destroys Lighthouse CI (the advisory's offered target moves: `0.1.0`, `0.12.0`, `0.3.5`).
- Keep every root `package.json` `overrides` entry; each one is tested against its consumers (Gotchas #3, #6, #14). npm reads `overrides` only from the root, so never add them to `frontend/package.json`. Sibling `@tiptap/*` deps must all share one `^3.x` pin (or `Node`/`MISSING_EXPORT` errors appear).
- `main` has **no required status checks** — direct push to `main` is the intentional solo hotfix path; guardrails are the drift/watchdog workflows, not CI blocking.
- Spelling: a **real word** goes in `cspell.json`'s `words`; a **deliberate non-word** goes in a file-scoped `# cspell:ignore` comment, not the dictionary.

## Testing quirks

- **Backend tests require `DATABASE_URL=""`** so they use SQLite — any non-empty `DATABASE_URL` in the shell or `backend/.env` points them at PostgreSQL. Test output is **intentionally noisy** (negative-path tests log errors); trust `Ran N tests OK` + exit 0, not the absence of log lines. Tests keep the production `FileBasedCache` but in a temporary directory, so they never touch `backend/.cache`; don't add a `DummyCache` default.
- **Frontend global mocks live in `setupTests.ts`** — do not re-mock `react-i18next`, `lucide-react`, `react-helmet-async` or browser APIs. Use `renderWithProviders` (from `test-utils/`) for context. A custom `t()` re-mocks `react-i18next` locally; copy the shape from `setupTests.ts`.
- **Coverage** (`codecov.yml`): `frontend` and `backend` target 100% with a 1% threshold, `patch` targets 90% with 3%, so they fail below 99%, 99% and 87%. Codecov uploads run only in `main-ci-cd.yml` (`push` to `main` and `workflow_dispatch`), so these statuses land on `main` commits, never on PRs; the two project statuses are flag-scoped, so one side cannot rescue the other.
- Backend Python gates are **`black` + `flake8` (line-length 120)** only — `ruff` in `pyproject.toml` is editor config, not a CI gate. Backend tests use **Django's `manage.py test`**, not pytest.

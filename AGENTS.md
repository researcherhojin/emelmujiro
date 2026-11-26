# Repository Guidelines

Full-stack monorepo (**React 19 + Vite** frontend, **Django 6 + DRF** backend), self-hosted via Docker behind a Cloudflare Tunnel. This file is the fast-ramp-up / mistake-avoidance index. The **deep, authoritative rules live in `CLAUDE.md` and the path-scoped `.claude/rules/{frontend,frontend-build,backend,ci,claude-config}.md`** — read the matching one for the task; do not duplicate them here.

**Operating principle (from `CLAUDE.md`):** counts and claims _about the codebase_ are exact and verifiable — no `+` / `≥` / round-figure handwaves in this doc, `README.md`, `CHANGELOG.md`, or commit messages. Marketing copy in the UI itself is the only exemption.

## Read first by task

- UI / page work → `.claude/rules/frontend.md`
- Browser checks → Mobile browser checks in [CONTRIBUTING.md](CONTRIBUTING.md)
- Backend / API / migrations → `.claude/rules/backend.md`
- Build, deploy, CI, or a red check → `.claude/rules/ci.md` + `.claude/rules/frontend-build.md` + `.claude/rules/backend.md` (migrations) + `CLAUDE.md` → `Constraints`.
- Running containers and log checks → [README deployment checks](README.md) and [CI operational logs](.claude/rules/ci.md). Match the deployed SHA on both public health routes. Record host-specific results in `.private/`.
- A `Security operations require attention` issue → `.claude/rules/ci.md` → Scheduled security operations and Nightly image refresh, then `docs/intents/infra/security-operations.md` (one section per past alarm). For `dependencies` or `images`, check for a draft `triage/*` PR from the 02:40 triage (`docs/intents/infra/security-alarm-triage.md`).
- Dependency bumps → `CLAUDE.md` → `Gotchas` (numbered; the numbers are cited from commits and never change). Each rule's fix steps and evidence are in `.claude/skills/gotchas/SKILL.md` under the same number.
- Weekly dependency follow-up → `CLAUDE.md` → `Dependency compatibility`. Review the locked versions and verify the code paths affected by upstream changes.
- Editor diagnostics → [Backend tooling](.claude/rules/backend.md) for Ruff and `CLAUDE.md` → `Code Conventions` for links in instruction files.
- Planned work → `docs/intents/<module>/<slug>.md` (workflow and statuses in `docs/intents/README.md`): Intent → Spec → Plan → implement → `shipped` with an `Outcome`, then deleted unless a living doc cites it. Read the file's `status` before starting.
- `main-ci-cd.yml`, `pr-checks.yml` are the CI source of truth; cite job/step **by name, not line number** (they move often).

## Setup & environment

- **Use Node.js 24 for local development and CI parity.** The root `package.json` sets 24 as the minimum major and declares one npm workspace, `frontend/`. The backend (`backend/`) uses Python 3.12 and `uv`. See Gotcha #16 in [CLAUDE.md](CLAUDE.md) before changing the Node baseline.
  ```bash
  make install                       # npm install + uv sync --extra dev
  cd backend && uv run python manage.py migrate && cd ..   # first-time only
  npm run dev                        # fe :5173 + be :8000 (NOT port 3000)
  ```
- `make setup-dev-machine` bootstraps a fresh macOS box; `make verify-setup` is the re-runnable health check.
- For manual setup, use the environment file instructions under `Getting Started` in the [README](README.md) before running migrations.
- **Don't run local dev backend and Docker backend together** — both bind `:8000`, and their DBs are independent (local SQLite vs the Docker volume).

## Commands (non-obvious ones)

Run each example independently from the repository root. The `cd frontend` examples run in the frontend workspace.

```bash
make test                            # Vitest and Django tests
make test-ci                         # Vitest and Django tests with coverage
npm run build                        # production frontend assets
make build                           # Docker Compose images
make lint                            # eslint(frontend) + black --check/flake8(backend)
make lint-fix                        # eslint --fix + black (no flake8)
cd frontend && npm run validate      # lint + type-check + test:coverage (local "before push")
cd frontend && npm run type-check    # tsc --noEmit, tsc -p tsconfig.node.json AND tsc -p scripts/tsconfig.json
cd frontend && npm run test:e2e      # Playwright, production build (see gotchas)
cd frontend && npm run check:routes  # cross-references the 4 hardcoded route lists; fails CI on drift
cd frontend && npm run analyze:bundle   # builds with source maps into build-analyze/, writes bundle-report.html
npm run knip                         # unused files, exports and dependencies
npm run spell                        # repository spelling check
```

**Single test**

```bash
cd frontend && npx vitest run <path>              # one frontend test file
cd frontend && npx vitest run -t "<test name>"    # one test by name
cd backend && DATABASE_URL="" uv run python manage.py test api.tests.BlogPostAPITestCase
```

- `make help` lists the main make targets (the `Makefile`'s `.PHONY` line has the full set); there is no `make type-check` — use `cd frontend && npm run type-check`.
- **Put new scripts in a `scripts/` subdirectory** (`deploy/`, `security/`, `maintenance/`, `backup/`, `repo/`, `dev/`, `shared/`, or `tests/`). The directory root holds the workspace and TypeScript manifests. Host cron, launchd and LaunchAgent entries name script paths, so update those references when moving a script (`CLAUDE.md` › Project Overview, #712).
- When changing commit-message policy or pipeline detection, run `bash scripts/repo/test-check-commit-msg.sh` and `bash scripts/repo/test-pipeline-watchdog-target.sh`. The first exercises the repository's Git hook. The second checks which SHA the watchdog selects.
- For a README refresh, compare badges against the lock files and run the suites with matching installed versions before changing test counts. Verify production builds through Chromium prerender. See [README drift gates](.claude/rules/ci.md).
- Repo checks CI runs, from root: `./scripts/repo/check-changelog.sh origin/main HEAD`, `./scripts/repo/test-check-changelog.sh`, `./.claude/hooks/test-guard-bash.sh`, `npm run check:scripts` (type-checks and tests root `scripts/`).
- Inside the **backend container, run Django via `/app/.venv/bin/python`** (`docker exec -i emelmujiro-backend /app/.venv/bin/python manage.py …`); the runtime image ships no uv, and an older image's bare `python` fails with `No module named 'django'`.

## Build & deploy gotchas (load-bearing)

- Build output is **`build/`** (not `dist/`). **Never `rm -rf frontend/build`** — use `rm -rf frontend/build/*` (a bare `rm -rf frontend/build` breaks the nginx volume mount).
- `npm run build` pipeline is ordered and load-bearing: `generate:sitemap ∥ tsc -p tsconfig.build.json` → `vite build` → `cp index.html app.html` → `node scripts/prerender.ts` → `cp app.html 404.html`.
- **Chromium is a build dependency, not E2E-only** — `prerender.ts` calls `chromium.launch()`, so `vite build` can look green while prerender dies. `npx playwright install chromium` if it vanishes.
- **E2E serves the production build via `build:e2e` + `npm run serve:build`** — NOT `vite preview` (it answers every route with the homepage snapshot) and NOT plain `build` (it inlines `VITE_API_URL` and calls the **live** API).
- **Adding a new dynamic route**: update the SPA-fallback regex in **both** `frontend/nginx.conf` and `frontend/scripts/e2e-server.ts`. **Adding a static page**: add it to `staticRoutes` in `frontend/scripts/generate-sitemap.ts` or it ships a hard 404. Either omission fails `check:routes` in CI.
- **Verify a backend deploy by commit, not by a `200`**: `curl https://emelmujiro.com/api/health/` returns the baked `commit`; match it to the deployed SHA. A `200` passes even against a stale container. Migrations run in-container before gunicorn — keep them additive.
- Dependabot's auto-merge job merges with `GITHUB_TOKEN`. Its `Re-arm the pipeline once the merge lands` step dispatches `Main CI/CD Pipeline` via `workflow_dispatch` because the token's push does not trigger a run. The nightly drift check retries missed deployments and files an issue if the redeploy does not land. [GitHub Actions workflow triggers](https://docs.github.com/en/actions/how-tos/write-workflows/choose-when-workflows-run/trigger-a-workflow#triggering-a-workflow-from-a-workflow)

## Conventions that differ from defaults

- **Conventional Commits.** Use an English subject such as `docs(repo): clarify contributor commands`. The accepted types live in [the commit-message checker](scripts/repo/check-commit-msg.sh). Use `feature/*` or `fix/*` branches and keep each PR to one issue and at most three commits. Follow the [Workflow checklist in CONTRIBUTING.md](CONTRIBUTING.md) for the summary and test plan.
- **Keep CI enabled for contributor commits.** GitHub recognizes bracketed skip markers in the subject or body and the `skip-checks: true` trailer for `push` and `pull_request` workflows. The commit-message checker rejects both forms and allows the generated README sync commit's bracketed marker. Escape brackets when discussing a marker in a commit message (`\[skip ci\]`). [GitHub Actions skip instructions](https://docs.github.com/en/actions/how-tos/manage-workflow-runs/skip-workflow-runs)
- **Add a `CHANGELOG.md` entry** for contributor changes under `## Merged since [1.0.0]`, newest first. The PR check and the pre-push hook for direct pushes to `main` warn when an entry is missing. Changes confined to `docs/intents/` are exempt, and PR CI also skips this check for Dependabot. Husky runs lint-staged on `pre-commit` and the commit-message checker on `commit-msg`. [CI rules](.claude/rules/ci.md)
- **i18n is mandatory** — `useTranslation()` in components, `i18n.t()` in data files; no hardcoded user-facing text. **English comments only.** No `window.alert/prompt` (use toast/inline).
- **Public blog responses and English search use only complete, current translations.** Keep the public list uncached so edits in Django admin take effect immediately. See [Backend rules](.claude/rules/backend.md) for translation freshness and staff reads.
- **Tailwind is 4.x with v3-parity shims** (`@config` JS theme, pinned v3 palette and prose colors, compat rules in `src/index.css`; details in `.claude/rules/frontend-build.md`); PostCSS uses `@tailwindcss/postcss`; no dynamic class interpolation. Measure a palette, shim or shared-style change with `npm run visual:capture` / `visual:compare`, never by eye. The v5 major is dependabot-ignored.
- **Env var prefix is `VITE_`** (legacy `REACT_APP_` still resolves via a shim). `frontend/.env.production` is **tracked in git on purpose** — do not `git rm` it.
- **`react`/`react-dom` must stay version-parity** — Dependabot bumps them separately and Vitest then crashes with `Incompatible React versions`; check parity after any react merge.

## Dependencies — do not "clean up" these

- **Never push to (or rebase) a `dependabot/*` branch** — GitHub silently closes the PR; comment `@dependabot rebase` instead. Claude Code's `.claude/hooks/guard-bash.sh` blocks this, `npm audit fix`, removing `frontend/build` itself and `git rm` of `.env.production`; other agents have no such hook, so the rules below are on you.
- **Never run `npm audit fix` / `--force`** — it downgrades `@lhci/cli` and destroys Lighthouse CI (the advisory's offered target moves: `0.1.0`, `0.12.0`, `0.3.5`).
- Keep every root `package.json` `overrides` entry; each one is tested against its consumers (Gotchas #3, #6, #14). npm reads overrides from the root manifest only. Sibling `@tiptap/*` deps must all share one `^3.x` pin (or `Node`/`MISSING_EXPORT` errors appear). [npm overrides](https://docs.npmjs.com/cli/v11/configuring-npm/package-json/#overrides)
- **Never put a literal secret in a command you run.** Agent tools can store approved commands verbatim in local settings, and one stored command once held the live deploy secret (`.claude/rules/claude-config.md`). Read secrets from a file or variable inside the command.
- Keep shared instructions in this file, `CLAUDE.md` and `.claude/rules/`. Put personal instructions and private host notes in `.private/` or `*.local.md` files. See Local-only files in [CONTRIBUTING.md](CONTRIBUTING.md).
- `main` has **no required status checks** — direct push to `main` is the intentional solo hotfix path; guardrails are the drift/watchdog workflows, not CI blocking.
- Spelling: run `npx cspell trace <word>` first — the `npm`, `softwareTerms` and `software-tools` dictionaries are on, so package names usually need nothing. A **real word** they miss goes in `cspell.json`'s `words`; a **deliberate non-word** goes in a file-scoped `# cspell:ignore` comment, not the dictionary.

## Testing quirks

- **Backend tests require `DATABASE_URL=""`** so they use SQLite — any non-empty `DATABASE_URL` in the shell or `backend/.env` points them at PostgreSQL. Test output is **intentionally noisy** (negative-path tests log errors); trust `Ran N tests OK` + exit 0, not the absence of log lines. Tests keep the production `FileBasedCache` but in a temporary directory, so they never touch `backend/.cache`; don't add a `DummyCache` default.
- **Frontend global mocks live in `setupTests.ts`** — do not re-mock `react-i18next`, `lucide-react`, `react-helmet-async` or browser APIs. Use `renderWithProviders` (from `test-utils/`) for context. A custom `t()` re-mocks `react-i18next` locally; copy the shape from `setupTests.ts`.
- **Coverage.** [codecov.yml](codecov.yml) sets a 100% target with a 1-point tolerance for each project flag (`frontend` and `backend`) and a 90% target with a 3-point tolerance for patch coverage. Uploads run in `main-ci-cd.yml` on `main` pushes and workflow dispatches. The pull request workflow runs its own tests. [Codecov status checks](https://docs.codecov.com/docs/commit-status)
- Backend Python gates are **`black` + `flake8` (line-length 120)** only — `ruff` in `pyproject.toml` is editor config, not a CI gate. Backend tests use **Django's `manage.py test`**, not pytest.

# CLAUDE.md

<!-- cspell:ignore andrej -->

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

This repo's owner runs a quant trading platform alongside this codebase, so the operating principle is **엄밀하게** — counts and claims **about the codebase** are exact and verifiable; no `+` / `≥` / round-figure handwaves in this doc, in README, or in commit messages. Marketing copy rendered in the UI itself (e.g. `5,000+` hours in the hero stats) is exempt — that's user-facing, not doc-facing.

Cross-project behavioral guidelines are not restated here; they load on demand from the user-scope `andrej-karpathy-skills` plugin, and nothing in this repo depends on them.

## Quick Orientation

This root file holds the always-loaded, cross-cutting rules. Domain specifics live in `.claude/rules/` and auto-load when Claude reads matching files: `frontend.md` (Architecture, UI Conventions, Testing, Security — paths `frontend/**`), `backend.md` (Architecture, Constants, Utilities, Testing, Tooling, Security — paths `backend/**`).

**Size and shape**: every rule is one bold lead sentence with its evidence in sub-bullets; there is no line target, only bytes. **Cut bytes by compressing wording in place, never by relocating Gotchas** — a path-scoped `.claude/rules/dependencies.md` was tried on 2026-07-31 and reverted, because renumbering broke the Gotcha IDs cited from commits, CHANGELOG and PRs, and these rules fire on situations (a red scan, a dependabot PR), not on file reads. Dated measurements belong under `Baselines` in `.private/journal.md`.

By task type:

- **UI / page work** → `frontend.md` rule (Architecture, UI Conventions) auto-loads on `frontend/**` reads
- **Build / deploy / CI** → `Constraints` (SSG prerender, branch protection, CSP, README drift gates) + `Gotchas` #17 (backend deploy: verify by commit, never a bare `200`)
- **Dependency bumps** → `Gotchas` #6, #8, #13, #14, #15, #16
- **Backend changes** → `backend.md` rule (auto-loads on `backend/**` reads) + `Constraints` (ENV files, Local dev vs Docker)
- **All work** → `Code Conventions`, `Development Flow` invariants, `Gotchas` index

## Project Overview

Full-stack monorepo (React 19 + Django 6), self-hosted via Docker behind a Cloudflare Tunnel. Host details in `.private/operations.md`.

- **Frontend**: http://localhost:5173 (Vite, NOT port 3000). Build output: `build/` (NOT `dist/`). Import alias `@` → `src/`
- **Backend**: http://localhost:8000. Single app: `api/`. Uses **uv** (NOT pip)
- **Dev proxy**: Vite proxies `/api` → `http://127.0.0.1:8000` (no CORS issues in dev)
- **Node ≥ 24**, **Python 3.12** required. Husky runs lint-staged on `pre-commit` and `scripts/check-commit-msg.sh` on `commit-msg`

> Maintainer-local, gitignored, synced via `scripts/sync_private.sh`: design rationale in `.private/strategy.md`; session log + opsec notes in `.private/journal.md`; secret setup in `.private/secrets-setup.md`; **host topology, deploy forensics and incident history in `.private/operations.md`**. The repo is public, so those moved out on 2026-09-28; each entry left an actionable summary behind, and this file remains the source of truth for the rules themselves. Past git history (pre-`01c4db8`) retains earlier strategy versions.

> **CLAUDE.md + `.claude/rules/` are the single source of truth** for operational rules. Do NOT duplicate these sections into README.

## Commands

All `npm run` frontend commands run from `frontend/`. Root-level `npm run dev` runs both servers.

```bash
npm run dev                # Frontend + Backend (from root)
npm run dev:clean          # Kill ports first, then start both (from root)
npm run build              # sitemap ∥ tsc -p tsconfig.build.json → vite build → cp index.html app.html → prerender → cp app.html 404.html (from frontend/)
npm run build:no-prerender # Same but skips prerender step (from frontend/)
npm run validate           # lint + type-check + test:coverage (from frontend/)
CI=true npm test -- --run src/components/common/__tests__/Navbar.test.tsx  # Single test
npm run test:e2e           # Playwright E2E (from frontend/). Builds via build:e2e + serves build/. Also: test:e2e:ui, test:e2e:debug
npm run serve:build        # nginx-equivalent static server for build/ (from frontend/). Leave running to skip E2E rebuilds
npm run type-check         # tsc --noEmit AND tsc -p tsconfig.node.json (build configs). From frontend/
npm run analyze:bundle     # source-map-explorer (from frontend/, requires build first)
npm run check:css          # detect CSS classes shipped in build but never referenced in src/ (from frontend/, requires build first)
npm run check:routes       # cross-reference the 4 hardcoded route lists (from frontend/, no build or node_modules needed)

npm run knip                                                                  # Dead code detection. Run from root
npm run spell                                                                 # cspell over tracked files + .claude/rules + .github. Run from root
uv sync --extra dev                                                           # Install backend deps (NOT --dev). Run from backend/
uv run python manage.py test                                                  # Django unittest (NOT pytest). Needs DATABASE_URL=""
DATABASE_URL="" uv run python manage.py test api.tests.BlogPostAPITestCase          # Single backend test class
uv run black . && uv run flake8 .                                             # Format + lint (line length 120)

make verify-setup                                                             # 10-check dev-machine health pass. Run from root
# Make shortcuts: run `make help` from root
```

## Constraints

Build, runtime, and infrastructure rules. Violating these breaks deploys, security, or production.

**SEO**: `main.tsx` uses `createRoot()` (never `hydrateRoot`). Do NOT add static meta/title/OG to `index.html` — `SEOHelmet` handles everything. `SEOHelmet` auto-computes canonical from `location.pathname` — do NOT pass a `url` prop (English pages get wrong canonical). Page titles must NOT include `| 에멜무지로` suffix (appended automatically).

**KakaoTalk WebView**: `window.__appLoaded` must be set in `AppLayout` (router layout), NOT at provider level. iOS uses `kakaotalk://web/openExternal`; Android uses `intent://...#Intent;scheme=kakaotalk;end`. Android WebView is Chrome-based, so the banner is hidden — only error fallback uses the intent scheme.

**Local dev vs Docker**: `npm run dev` runs local backend (`DEBUG=True`, SQLite, no throttle) + Vite. Docker runs production backend (`DEBUG=False`, throttle on). Don't run both — port 8000 conflicts. Stop Docker (`docker compose stop backend`) before `npm run dev`. Local SQLite and Docker DB are separate — changes don't cross.

**ENV file structure**: Root `.env` = Docker Compose orchestration only (ports, tags, build flags — NO secrets). Backend config splits into `backend/.env` (local dev, `load_dotenv()`) and `backend/.env.production` (Docker prod, via `env_file` in docker-compose.yml). Both gitignored. On new servers, generate `backend/.env.production` from `backend/.env.example`.

**Deployment**: Never `rm -rf frontend/build` (breaks nginx volume mount) — use `rm -rf frontend/build/*`. Docker ports bind to `127.0.0.1` only. `SECRET_KEY` loaded via `env_file` — do NOT set in docker-compose `environment` section.

- **An edit to `auto-deploy.sh` takes effect one deploy late.** The script checks out the target commit while running, and bash keeps executing the copy it opened, so the deploy of `9587ac3e` ran without that commit's new `up -d umami-db umami` line. Verify a deploy-script change on the deploy after it.

**Compose-only images (`nginx`, `umami`, `postgres`) are pinned to exact versions in `docker-compose.yml` — never revert to a floating tag.** Nothing re-pulls a floating tag (`auto-deploy.sh` only builds the backend), which left all three 6–9 months stale until 2026-10-06.

- Dependabot's `docker-compose` ecosystem bumps the pins, and `auto-deploy.sh` applies them: `up -d umami-db umami` and the frontend's `up -d` pull a changed tag. Patch bumps auto-merge (Gotcha #12), so an Umami patch runs its DB migrations without review.
- **Postgres majors are dependabot-ignored**: a new major cannot read the `umami_db` volume. Upgrade by `pg_dump` → new volume → restore, as its own change.

**SSG prerender + nginx routing**: `scripts/auto-deploy.sh` runs `npm run build`, which invokes `frontend/scripts/prerender.js` (referenced as `scripts/prerender.js` in the build script, which runs from `frontend/`) to generate `build/<path>/index.html` for **10 routes** (5 static × ko/en). Four non-obvious couplings:

- **`location /` in `frontend/nginx.conf` is `try_files $uri $uri/index.html =404`.** The explicit `$uri/index.html`, NOT `$uri/`: directory lookup triggers nginx's auto-301 trailing-slash append that downgrades `https://` to `http://` via `absolute_redirect`. The `=404` (not `/index.html` fallback) is what prevents soft-200s for unknown URLs.
- **Routes prerender does not cover fall back to `/app.html`, never `/index.html`.** The dynamic blog posts `/insights/:slug`, admin `/insights/new` and `/insights/edit/:id`, and standalone `/login` match the regex `location ~ ^/(en/)?(insights/.+|login)$`.
  - `app.html` is the pristine Vite shell the `build` script copies from `index.html` **before** prerender overwrites `index.html` with the homepage snapshot. It is also the `error_page 404` document, and `internal`, so a direct GET is a `404`.
  - Falling back to `/index.html` (the case until 2026-09-24) ships the homepage `<title>`, canonical and `robots` in raw HTML for every blog post, and Google requires a JS-set canonical to equal the original HTML's; `app.html` carries none, so the JS-injected tags are the only ones.
  - Guards: `prerender.js` exits `1` without it, `auto-deploy.sh` refuses to publish a staging dir without it, and `e2e/seo.spec.ts` asserts those routes' raw bytes carry zero `data-prerendered-seo` markers and that a direct `/app.html` is `404`.
  - **When adding a new dynamic route to `App.tsx`, update this regex in BOTH `frontend/nginx.conf` and `frontend/scripts/e2e-server.mjs`** — nginx 404s it in production, the E2E server 404s it in tests, and `npm run check:routes` fails CI on either omission. Each rule in `e2e-server.mjs` cites its nginx counterpart; keep the two files in sync.
- **The route list is `staticRoutes` in `frontend/scripts/generate-sitemap.js`; a static page added to `App.tsx` but not there ships a hard 404.** `prerender.js` imports it by name (`const { staticRoutes, LANGUAGES, DEFAULT_LANG } = require('./generate-sitemap')` — cite the require, not a line number, which drifts), so one array feeds both `sitemap.xml` and the prerender pass.
  - Why a hard 404: no `build/<path>/index.html` exists, the SPA-fallback regex doesn't match, so `try_files … =404` fires on a real page, and the sitemap omits it — while prerender still prints `Prerendered 10/10 routes`, because it counts only the routes it was handed.
  - **`npm run check:routes`** (`frontend/scripts/check-route-lists.js`, in `Repo Checks (informational)` before `Setup Node.js`, node builtins only) cross-references all four hardcoded route lists — `App.tsx`, `staticRoutes`, `e2e/seo.spec.ts`, `lighthouserc.js` — so this fails CI instead of shipping. Deliberately SPA-only routes live in its `NOT_PRERENDERED` map, itself asserted against `App.tsx` so an exception cannot outlive its route.
  - It also covers the SPA-fallback regex without attempting regex equivalence: it asserts `nginx.conf` and `e2e-server.mjs` carry the byte-identical pattern, then runs it against one URL per `App.tsx` route in both languages — every non-prerendered route must match (else `=404`) and no prerendered route may (regex locations beat `location /`, so the shell would replace the document). nginx itself is never executed.
- **Chromium is a build dependency, not an E2E-only one.** `prerender.js` calls `chromium.launch()`, so without the browser `vite build` succeeds and prerender dies, which reads like a build bug. `scripts/auto-deploy.sh` therefore runs `npx playwright install chromium` before build (idempotent), so a Playwright dependabot bump cannot break the next deploy.
  - The error also misdirects: `~/Library/Caches/ms-playwright` is **machine-global, shared across projects**, so another project's newer Playwright can fill it with a revision this repo's pin rejects, and Playwright then blames the package ("Looks like Playwright was just installed or updated"). `npx playwright install chromium` fixes it without removing the other revision.

**E2E target: the Playwright suite serves the production build, not the dev server.** `playwright.config.ts` `webServer` runs `npm run build:e2e && npm run serve:build`, and `frontend/scripts/e2e-server.mjs` mirrors `nginx.conf` (try_files, the dynamic-route SPA fallback, trailing-slash / `/blog` / `/share` 301s, `error_page 404 /app.html`, `/api` proxy).

- `vite preview` is **not** a substitute — its SPA fallback answers `/contact` with `build/index.html`, so every prerendered route silently serves the homepage snapshot.
- The build must be `build:e2e`, not `build`, because a plain production build inlines `VITE_API_URL=https://api.emelmujiro.com/api` and calls the live backend (Gotcha #18).
- `reuseExistingServer` keeps the rebuild off the iteration loop — leave `npm run serve:build` running in another shell.

**Lighthouse never audits a prerendered document.** `frontend/lighthouserc.js` collects via `startServerCommand: npx vite preview --port 4173` — the substitute the E2E rule above rejects — so all four configured URLs receive the homepage document, and every per-route score describes the **hydrated SPA reached from it**, not what a crawler gets.

- Scores still differ per route because Lighthouse audits the final DOM, which is why this reads as working. A regression that lives only in a prerendered document (a missing `SEOHelmet` tag, a route absent from `staticRoutes`) is invisible to Lighthouse CI.
- **Do not "just re-point" `startServerCommand` at `serve:build`** as a drive-by: it re-baselines every threshold in `assert` and every figure under `Baselines` in `.private/journal.md`, so it is its own change with its own before/after (`/contact` best-practices measures `0.74` against the correct server, below the `0.9` warn floor, from the Google Form iframe's third-party cookies).
- **To compare served documents by hash, two traps.** Against production, normalize first — Cloudflare Email Obfuscation rewrites `contact@emelmujiro.com` with a fresh XOR key per response (`sed -E 's/data-cfemail="[0-9a-f]*"/data-cfemail="X"/g; s#email-protection\#[0-9a-f]*#email-protection\#X#g'`). And include a control, a non-prerendered route (`/login`, `/insights/<slug>`, `/en/login`), which must hash to the `app.html` shell and differ from `/`, plus an unknown path, which must be a hard `404`. Ten distinct normalized hashes for the ten routes is the healthy state; every route hashing to the shell is a broken prerender.

**Branch protection**: `main` has `allow_force_pushes: false` + `allow_deletions: false` + `delete_branch_on_merge: true`, and **no** required status checks — direct push to main is the intentional solo-dev hotfix workflow. Rationale, the exact settings and the emergency-removal procedure live in `.private/operations.md`.

**Two-device dev bootstrap**: `make setup-dev-machine` (idempotent) provisions a machine; `make verify-setup` runs a 10-check health pass. **Production secrets are NOT synced to dev machines** — `backend/.env.production` lives only on the deploy host and in GitHub Actions secrets, and per-device local `SECRET_KEY` divergence is correct. `frontend/.env.production` is tracked in git on purpose (Gotcha #7). **Do NOT** add either `.env.production` to the verify list. Full step list and the Chromium caveat: `.private/operations.md`.

**Two-device sync helpers**: two artifacts don't move via `git push` — `.private/` (via `./scripts/sync_private.sh push|pull|dry`, never `--delete`) and the deploy-host/production drift report (`./scripts/check_machine_sync.sh`). Run the second before any push if a session may have happened on the other machine; it caught a silent 16-commit production drift. Host details in `.private/operations.md`.

**Umami analytics**: self-hosted behind nginx, not publicly exposed; the dashboard is not routed and only the tracking endpoint is proxied. Secrets live in the gitignored root `.env` and are required via `${VAR:?}`. Ports, the exact nginx location and the data-destroying password-reset procedure: `.private/operations.md`.

**Operational logs: cron jobs must redirect output to `$(CURDIR)/backend/logs/<name>.log`.** That matches Django `LOG_DIR` (`backend/config/settings.py`), is already gitignored, and persists via the Docker logs volume. Never `/tmp`, `~/logs/` or `/var/log/`. Enforced by a `pr-checks.yml` grep: any `crontab` line with `>>` not targeting `backend/logs/` fails CI.

- **`access.log` is the one rotating log here**: `debug.log` and `security.log` use a plain `FileHandler`, but the API access log grows per request, so it is a `RotatingFileHandler` capped at 5 MB with 3 backups (`backupCount: 3`, so 4 files, ~20 MB). Copy that shape for anything else that logs per request.

**CSP is defined twice and must stay in sync**: `nginx.conf` (production) + `index.html` meta tag (dev/fallback); the `stripLocalhostCsp` Vite plugin strips `localhost:8000`/`127.0.0.1:8000` from the meta-tag CSP at production build.

- `'unsafe-inline'` required (inline scripts: error handler, KakaoTalk detection, theme detection). `'unsafe-eval'` removed after `plugin-legacy` removal.
- `data:` is **not** in `script-src` (XSS-narrowing); stays in `img-src` for base64 SVG icons.
- `frame-ancestors 'none'` in nginx header (meta tag ignores it per spec) complements `X-Frame-Options: DENY`.
- Cloudflare Web Analytics is **disabled** — `cloudflareinsights.com` must NOT appear in `script-src`/`connect-src`.

**Tailwind 3.x**: PostCSS uses `tailwindcss: {}` (NOT `@tailwindcss/postcss`). Dark mode is `class`-based. Never use dynamic class interpolation (`bg-${color}-600`). The v4 major is dependabot-ignored (`@dependabot ignore this major version` on #461, 2026-08-25, after it failed build/E2E/tests wholesale) — comment `@dependabot unignore this major version` only when a v4 migration is planned as its own project.

**Production keys**: a missing `SECRET_KEY` raises `ImproperlyConfigured` when `settings.py` loads; a missing `RECAPTCHA_PRIVATE_KEY` raises it inside `verify_recaptcha` (`api/views.py`) on the first contact submission, so the server starts and the first form post fails (DEBUG bypasses reCAPTCHA).

**Bundle size**: Build output must be < 10MB (enforced in `pr-checks.yml`). Check large dep impact with `npm run analyze:bundle`.

**CI job gating: `quick-checks` checks only for merge conflicts, and every cosmetic or policy check lives in `Repo Checks (informational)`, which nothing depends on.**

- `quick-checks` gates the six substantive jobs (Frontend Lint, Backend Lint, Test Affected Code, Security Scan, Build for Analysis, E2E Tests); a merge conflict is the one condition that makes running the rest pointless. `Auto-Merge Dependabot` is gated transitively (`needs: affected-tests`, which needs `quick-checks`).
- `Repo Checks (informational)` holds commit-message format, file size, SEO files, i18n keys, README test counts and badges, **spelling**, cron log paths.
- **Do not move a check back into `quick-checks`**: when they sat there, a stale badge or a non-conventional subject skipped `npm ci` and the whole suite — that is how the jest-dom 7 lockfile drift reached a deploy. `main` has no required status checks, so that gating never blocked a merge; it only destroyed test signal.

**Auto-merged commits do not deploy.** A push made with `GITHUB_TOKEN` creates no workflow run, and `Auto-Merge Dependabot` merges with that token, so its merge commit runs neither `deploy-mac-mini` nor `Sync README Badges`. Three mechanisms close it, each asserted by outcome:

- The auto-merge job dispatches the pipeline itself after its merge lands.
- `deploy-drift-check.yml` compares `/api/health/`'s baked commit with `main` nightly and dispatches on mismatch.
- `pipeline-watchdog.yml` fails when `main`'s newest non-skip-ci commit has no successful run for that **exact 40-character SHA** (an abbreviated SHA returns 0 runs and alarms on a healthy `main`).
- Both scheduled alarms file a GitHub issue, because a red scheduled run notifies nobody. **Both fire hours after their cron** — allow ~9 h for the drift check and ~7 h for the watchdog before treating a slot as missed, and do not re-cut the cron to compensate. `workflow_dispatch` always creates runs, so none of this needs a PAT.
- A green pipeline is not deploy evidence (Gotcha #17). Lag measurements and incident history: `.private/operations.md` and the journal Baselines.

**Spell check: `npm run spell` is `cspell --no-progress "**" ".claude/rules/**" ".github/**"`.** cspell is a root devDependency declared as `^10.3.6` (the lockfile fixes the version; dependabot moves it through a PR such as #540, which is where a changed verdict surfaces). It runs in `Repo Checks (informational)` after the bash-only checks that precede `Setup Node.js` (their failure ends the job before `npm ci`; `Check cron log redirect paths` runs after it), with `save-cache: false` because parallel jobs save that cache. Three rules:

1. `ignorePaths` must keep excluding build output — `frontend/coverage/**`, `frontend/playwright-report/**`, `frontend/test-results/**`, `frontend/build/**`, `**/*.egg-info/**` — which carried 307 of the 314 findings in the first full scan. `CHANGELOG.md` is in `ignorePaths` too, so its prose is never spell-checked, while CLAUDE.md and the rule files are.
2. Deliberate non-words go in a file-scoped `# cspell:ignore`, **not** `cspell.json`'s `words`: `scripts/check-commit-msg.sh` intentionally contains `Mergeevil` and `depsnot`, and dictionary entries would let a real typo of that shape pass everywhere.
3. `"**"` does not match dot-directories, so the `.claude/rules/**` and `.github/**` globs are load-bearing — without the first, the two path-scoped rule files were not scanned until 2026-09-21. **Do not reach for `--dot`**: it takes the scan from about 180 files to 1196 and from 0 findings to 6458, because `ignorePaths` does not cover dot-directory build output. Scope to what git tracks instead — `.claude/*` is gitignored except `!.claude/rules/` (`.gitignore:96-97`), which is why the glob names `rules`, not `.claude`.

**README drift gates: two CI guards, both auto-healed on `main` by the `Sync README Badges` job in `main-ci-cd.yml`** (it pushes with the CI-skip marker).

1. **Package badges** — 18 badges read-checked by `Repo Checks (informational)`, each showing the **installed** version: 14 frontend resolved from **`package-lock.json`** (`frontend/node_modules/<pkg>` first, since a de-hoisted copy is what ships), plus `Django` / `DRF` / `SimpleJWT` / `Gunicorn` from **`backend/uv.lock`**.
   - Never read `package.json` or `pyproject.toml`: a `^` range or a `>=` floor is not the installed version (until 2026-10-04 the frontend badges did, and 5 of 14 showed floors below what shipped). Backend versions match `[0-9]+(\.[0-9]+){1,2}` because PyPI ships two-component releases (Django `6.1`).
   - `scripts/sync-readme-badges.sh` anchors every replacement on the `/badge/<Name>-` prefix, because label `i18next` is a substring of `React_i18next`.
   - It ends with `git add README.md`, so the job's commit gate must be `git diff --quiet HEAD -- README.md`: a bare `git diff README.md` sees the staged fix as clean and skips the commit, which silently dropped badge-only drift between `01f748d8` and `55e8e57e`. Treat a green `readme-sync` as proof of nothing — confirm the badge moved on `main`.
2. **Test counts** — the same job sed-replaces counts from the `frontend-test`/`backend-test` job outputs; `make update-test-counts` is the local equivalent and exits non-zero if the README pattern is missing. The format `Vitest (N tests) + Django unittest (N tests)` in the `**Tests** —` bullet is coupled to `scripts/update-test-counts.sh:57,59`; change both together. **Do NOT grep test files for Vitest counts** — `it.each([...])` rows expand at runtime, so grep undercounts.

## Code Conventions

- **Conventional commits** required (English only): `type(scope): description`. Types: `feat fix docs style refactor test chore perf deps-dev deps ci`.
  - **`scripts/check-commit-msg.sh` is the single source of truth** — the `.husky/commit-msg` hook and the `pr-checks.yml` step both call it, so edit the type list there and never re-inline the regex in a caller.
  - `deps-dev` exists because dependabot writes `deps-dev(deps-dev):` and the skip pattern exempts it, so a human finishing one of its PRs by hand needs the same type available.
  - Exempt: merge commits, `fixup!`/`squash!`/`amend!` (autosquash rewrites them away), `Revert "…"`, and dependabot's formats.
  - English-only is machine-enforced as ASCII on the **subject line only** — the body is not inspected — so `git commit --no-verify` is the escape for a subject that genuinely needs a non-ASCII proper noun.
- **Branch naming**: `feature/name` or `fix/description`.
- **ESLint flat config** (`eslint.config.mjs`, NOT `.eslintrc`). Zero-warnings is the **target**, not yet a hard gate (`lint` script lacks `--max-warnings=0`).
- **English comments only**.
- **All UI strings via i18n** — `useTranslation()` in components, `i18n.t()` in data files. No hardcoded user-facing text.
- **No `window.alert()` / `window.prompt()`** — toast or inline UI.
- **Logger import**: `import logger from '../utils/logger'` (default export). Use `env.IS_DEVELOPMENT` for environment checks.

## Development Flow

7-phase cycle adapted from [gstack](https://github.com/garrytan/gstack). Skip phases when scope doesn't warrant (typo fix ≠ full cycle).

| Phase       | Purpose                                    | Repo tools                                                                                 |
| ----------- | ------------------------------------------ | ------------------------------------------------------------------------------------------ |
| **Think**   | Understand problem, constraints, prior art | `git log`, Grep, `CLAUDE.md`, `.private/journal.md`                                        |
| **Plan**    | Concrete change scope and tradeoffs        | plan file in `~/.claude/plans/` or inline                                                  |
| **Build**   | Implement                                  | editor, `npm run dev`, `make dev-local`                                                    |
| **Review**  | Independent 2nd opinion                    | `make lint`, `make type-check`, GitHub PR review                                           |
| **Test**    | Verify behavior                            | `make test`, `make test-ci`, Playwright E2E, Lighthouse CI                                 |
| **Ship**    | Land + deploy                              | `CHANGELOG.md` entry, conventional commit, PR, merge, `scripts/auto-deploy.sh` via webhook |
| **Reflect** | Capture surprises                          | `.private/journal.md` session log                                                          |

### Invariants

- **Deployed code is identified by commit SHA, not by a version number.** There is no release cut and no version to bump: `auto-deploy.sh` bakes `GIT_COMMIT` into the backend image and `/api/health/` reports it.
  - The `version` fields in both `package.json` files are inert metadata (both are `private: true`) and **must not be re-coupled into a sync rule**; the `VERSION` file was deleted on 2026-09-28 because nothing read it.
  - Retiring the release number says nothing about API compatibility — `backend/api/` serves blog list and retrieval anonymously, so external consumers cannot be ruled out from this repo.
- **CHANGELOG on Ship**: append the entry under `## Merged since [1.0.0]`. Do **not** re-section it by date or cut it into releases — there is no measured benefit to pay the reconstruction cost for. `[1.0.0]` stays as a historical record.
- **PR discipline**: one issue per PR, ≤ 3 commits, no mid-PR scope expansion (deferred work → new issue).
- **CI-skip guard**: only the `Sync README Badges` bot may carry the literal; every other commit is rejected by `scripts/check-commit-msg.sh` (Gotcha #10). Escape it to write about it.

### Skip rules

- **Typo / comment / single-line README**: Think → Build → Ship.
- **Hotfix on live bug**: Think → Build → Test → Ship → Reflect.
- **Refactor touching ≥ 3 files or any `Constraints` section**: full 7 phases mandatory.
- **Semver-compatible dependency bump**: Review → Test → Ship.

## Security

- **CI workflows**: Never use `${{ }}` directly inside `run:` blocks — bind to `env:` first, reference as `"$VAR"`. Prevents script injection via branch names. Composite actions `.github/actions/setup-node` and `.github/actions/setup-uv` replace inline setup.
- **Shell scripts**: No `eval` with variables, no `source` of untrusted files (use `read` loop parsing), validate Make variables that reach shell commands.

> Domain-specific security rules live in the path-scoped rules: blog HTML sanitization in `.claude/rules/frontend.md`, file-upload validation in `.claude/rules/backend.md`.

## Gotchas

Quick code-level traps that cost time when missed. Each entry: a bold rule, then the fix, the evidence and the commit reference as sub-bullets.

**Index**: #1 VITE\_ prefix · #2 useRef(null) · #3 minimatch override · #4 tsconfig.build excludes test types · #5 DATABASE_URL="" for tests · #6 never npm audit fix · #7 frontend/.env.production tracked · #8 react/react-dom split bumps · #9 nav selector scoping · #10 CI-skip marker self-skip (enforced) · #11 set -e + cmd substitution · #12 dependabot minor held for review · #13 rolldown lockfile on macOS · #14 tiptap @core single-version · #15 don't rebase dependabot branches · #16 Node major lockstep (3 files) · #17 backend deploy credsStore/launchd trap + commit verify · #18 E2E must build with build:e2e (plain build hits live API) · #19 backend dep names must be lowercase or the uv dependabot ecosystem dies

1. **`VITE_` prefix** for env vars (legacy `REACT_APP_` works via `config/env.ts` shim). Umami uses `VITE_UMAMI_HOST` + `VITE_UMAMI_WEBSITE_ID` (collect API, no external script).
2. **`useRef<T>(null)`** — React 19 requires initial value.
3. **`minimatch>=10.2.1`** override in `package.json` — don't remove.
4. **`tsconfig.build.json`** excludes test types — don't add `@testing-library/jest-dom`.
5. **`DATABASE_URL=""`** for backend tests — Docker PostgreSQL breaks SQLite tests.
6. **Never run `npm audit fix` (or `--force`)** — `--force` downgrades `@lhci/cli` to 0.1.0 and destroys Lighthouse CI; it is what `fixAvailable: @lhci/cli@0.1.0` offers.
   - **Expected state (measured 2026-10-06)**: `26 vulnerabilities (2 low, 7 moderate, 17 high)`, all dev-only, in four chains: 17 in the `@lhci/cli` tree, 5 from `braces`, 3 from `postcss-selector-parser` `<7.1.6`, 1 from `source-map-js`. Per-package breakdown and advisory IDs: `npm audit (2026-10-06)` under `Baselines` in `.private/journal.md`.
   - **A rising count is not automatically something this repo did** — advisories arrive upstream — and **a regenerated lockfile can drop findings no override or parent bump would**.
   - **"Expected" is not "ignorable" — measure whether each one ships.** `dompurify` (direct dep, the sanitizer guarding `dangerouslySetInnerHTML`) once carried an XSS here (GHSA-55q2-fjhq-7xh7, fixed `3.4.13`). Shipping test: `npm run build && grep -rl <pkg> build/assets/*.js`, and **read the hit** — short names false-match (`tmp` hits highlight.js keywords; `braces` hits a React error string); a sourcemap build (`npx vite build --sourcemap --outDir <tmp>`) and its `sources` list is the exact check.
   - **`npm audit` alone is not the gate** — CI's Trivy counts anything the lockfile does not mark `"dev": true`. After any lockfile write, check per package that everything `npm audit` reports still carries the marker (all 26 do), and when one does not, run `npm ls <pkg> --omit=dev` before blaming the lockfile: `braces` was counted because `@tailwindcss/typography` sat in `dependencies` and peer-pulled `tailwindcss` into the production graph. Markers have also moved with no manifest change (`37aa60f6`: 779 → 858, back to 784 after three dependabot merges, surfacing `nanoid@3.3.16` as a production HIGH), so assume no direction.
   - **Reach for a parent bump before an override**: overrides that admit the patched version have still failed to take (`nanoid` under `postcss@8.5.25`, `body-parser` under `express`), printing `invalid`; bumping the direct parent (`postcss` → `^8.5.26`) worked. A declared-but-unsatisfied override is worse than none: `npm ls <pkg>` must not print `invalid`, and the installed version must match after `npm ci`. Update direct deps manually and let dependabot handle transitives; the one standing override that works is `brace-expansion: ^5.0.9` (reached via `eslint` → `minimatch`, which nothing pins).
7. **`frontend/.env.production` is intentionally tracked in git** — `.gitignore` line 5 has `!frontend/.env.production` (negation pattern). Do **not** `git rm` it — it's load-bearing for `scripts/auto-deploy.sh`.
   - Every `VITE_*` is inlined into the public client bundle at build time, so `VITE_UMAMI_HOST` / `VITE_SENTRY_DSN` / `VITE_API_URL` are all **public by design** (DevTools shows them on any page load).
   - Asymmetry is deliberate: `backend/.env.production` = real server-side secrets → gitignored; `frontend/.env.production` = compile-time public config → tracked.
8. **Dependabot does NOT bump react and react-dom together** — its pairing of a package with its `@types/*` companion covers `react-dom` + `@types/react-dom`, not `react`, and no `react*` group exists on the surviving `/` npm ecosystem. Vitest then crashes with `Incompatible React versions`.
   - **Fix**: `cd frontend && npm install react-dom@<matching-version> && cd .. && git add frontend/package.json package-lock.json && git commit -m "fix(deps): bump react-dom to match react"`.
   - **Prevent**: check `react`/`react-dom` parity in `frontend/package.json` after any react merge; this recurred on #430, so the review step alone is unreliable.
   - **Diagnosing it**: the red PRs are the _other_ ones — a broken `main` fails `Test Affected Code`, `E2E Tests` and `Lighthouse CI` on every branch cut from it, with vitest reporting `65 failed (65)` / `no tests` because collection aborts. A de-hoisted `vitest` produces the same signature (`1f5356ea`), so read the error above the summary, and check `main` before touching the PR. See `8ab71fe`, `9353aae3`.
9. **E2E nav selectors must scope to `<nav aria-label="Main navigation">`** — Korean nav labels (`강의이력`, `인사이트`, `문의하기`) appear in BOTH top navbar AND the footer's `메뉴 목록`, so a bare `getByRole('button', { name: '강의이력' })` hits Playwright strict-mode and fails.
   - Use `openNav(page, isMobile, lang)` from `e2e/helpers.ts` rather than re-deriving it: it scopes to the landmark AND opens the mobile sheet, which is required below `md` where the desktop nav is `hidden md:flex` and `handleNavigation` closes the sheet after every navigation (so a multi-hop mobile flow reopens it per click).
   - `NAV_LABELS` there holds the ko/en label pair, and `swipeHorizontal` synthesizes a cross-engine touch swipe — the `Touch`/`TouchEvent` constructors are Chromium-only and WebKit raises `TypeError: Illegal constructor`.
10. **A CI-skip marker in a commit message body causes self-skip — now rejected by `scripts/check-commit-msg.sh`** — GitHub Actions parses the **entire** commit message (subject + body) for all five markers (`[skip ci]`, `[ci skip]`, `[no ci]`, `[skip actions]`, `[actions skip]`), so documenting the mechanism in prose skips CI for that commit.
    - It happened 10 times on `main` before the guard, including `66cef64b`, the commit that fixed the deploy path.
    - The guard scans the whole message **before** the merge/autosquash/revert/dependabot exemptions, so a generated subject cannot carry one through. Escape to write about it (`\[skip ci\]`); `git commit --no-verify` is the escape for genuine skip intent.
    - The `Sync README Badges` bot is exempt **by shape, not exact text** — `chore(readme):` scope, marker as the final subject token, no body — because its message has changed twice and an exact pin would redden the bot on the next edit.
11. **`set -e` does NOT exit on `FOO=$(failing_cmd)`** — command substitution masks the exit code. Use `if ! FOO=$(cmd); then exit 1; fi` when the exit code matters. Both `scripts/update-test-counts.sh` (was reading passing-count from failing test run) and `scripts/auto-deploy.sh` (was reporting success after health check timeout) had this bug. See `99e1a81`.
12. **`Auto-Merge Dependabot` job auto-merges only `semver-patch`** — `pr-checks.yml`'s `Merge patch updates` step runs a retried bare `gh pr merge --squash` only for `version-update:semver-patch`; patch + minor are auto-approved by `Auto-approve patch and minor updates`, and minor + major are **held for human review**.
    - The job needs `affected-tests` to succeed (`2ba36943`), so a patch whose `Test Affected Code` fails stays open. Cite steps by name, not line number — this job is edited often.
    - There is no `--auto`: the repo has `allow_auto_merge: false`. Manual close: `gh pr merge <num> --squash`.
    - **Clearing a held queue: expect conflicts.** Each merge flips the rest to `UNKNOWN` mergeability for 60–90 s — wait it out, and re-check with `git merge-tree --write-tree origin/main <branch>` rather than trusting a stale `CONFLICTING`. Two collision shapes: same-scope siblings (two `@tiptap/*` bumps de-hoist into the same lockfile region, #475/#479), and adjacency (a manifest edit within git's 3-line window of a pending bump conflicts however unrelated the packages, #474). `@dependabot rebase` fixes both (Gotcha #15); never push to the branch yourself.
13. **`npm install` on macOS writes only host-platform `@rolldown/binding-*` to lockfile** (npm #4828) — Apple Silicon yields a single `binding-darwin-arm64` entry; CI on `ubuntu-24.04` then fails with `Cannot find module '@rolldown/binding-linux-x64-gnu'` (vite 8 uses rolldown; vitest shares it).
    - **Fix**: `rm -rf node_modules frontend/node_modules package-lock.json && npm install --include=optional --legacy-peer-deps`, then verify the list contains `binding-linux-x64-gnu`. **Check for that platform, never a total** — the count is upstream-controlled and has moved with vite releases.
    - `--legacy-peer-deps` is needed because `eslint-plugin-jsx-a11y@6.10.2` caps peers at `eslint@^9` while we run `^10`. An incremental `npm install --package-lock-only` that only moves a dependency between sections kept all bindings (2026-10-04). See `f289544`.
14. **Sibling `@tiptap/*` deps on different patches duplicate `@tiptap/core`, and the `overrides` entry is what hides it** — our `^3.x` carets only _permit_ the drift; upstream **exact** pins (`starter-kit` in `dependencies`, six others as exact `peerDependencies`) turn it into nested copies.
    - `overrides."@tiptap/core"` in root + `frontend/package.json` rewrites those specifiers tree-wide, so a mixed tree can show **one** core while duplicating siblings (measured on `6fecb134`: `extension-list` and `pm` at 3 copies, three others at 2).
    - Fails as either tsc `Type 'Node<any, any>' is not assignable to type 'Node<any, any>'. Two different types ... exist, but they are unrelated.` OR vite build `[MISSING_EXPORT] cancelPositionCheck is not exported by @tiptap/core/dist/index.js`.
    - **Fix**: align ALL `@tiptap/*` direct deps to the same `^3.X.Y` AND set root + frontend `overrides @tiptap/core` to the same `^3.X.Y`. Verify: `npm ls @tiptap/core --all | grep "@tiptap/core@" | sort -u` yields one version and `npm ls @tiptap/core` prints no `invalid` — **and check the sibling inventory too, because a single core is not evidence the rest deduped.**
    - `@tiptap/core` is a direct frontend dep only to pin resolution; `frontend/src` imports nothing from it. See `da9d76c`, `2c41535`.
15. **Don't manually rebase or force-push to `dependabot/*` branches** — GitHub treats non-bot pushes as adversarial and silently closes the PR (`head_sha` → null, state → `closed merged=false`); `gh pr checks` still shows the old green run. Correct path: comment `@dependabot rebase` and let the bot push. After a close cascade, recover by bundling the bumps into one direct-to-main commit with `Closes #NNN` lines. See `09a47e9`.
16. **Node major version must move in lockstep across three files**: `frontend/Dockerfile.dev` `FROM node:N-alpine`, `.github/actions/setup-node/action.yml` `node-version: "N"`, `scripts/setup-dev-machine.sh` brew `node@N`. Bumping one alone creates "works in my dev container, fails in CI" drift. Dependabot's docker ecosystem will keep proposing single-file Dockerfile bumps — close with `@dependabot ignore this major version`, not merge.
17. **A backend deploy can silently ship stale code — verify by commit, never by a bare `200`** — `curl https://emelmujiro.com/api/health/` returns a `"commit"` baked into the image via the `GIT_COMMIT` build arg, and `auto-deploy.sh` fails the deploy when it does not match the SHA it was told to deploy.
    - **A green pipeline is not proof of a deploy**: a `200` passes against a stale container, and `Deploy to Mac Mini` is `continue-on-error` and green on trigger-accept.
    - The deploy takes its SHA from CI (`DEPLOY_SHA`) and refuses anything not an ancestor of `origin/main`, so **`main` legitimately sits ahead of production between runs** — `deploy-drift-check.yml` closes that.
    - The Docker Desktop credential-helper traps behind this rule, the `DOCKER_CONFIG` workaround, and the measured SHA mismatches are in `.private/operations.md`; re-verify after any Docker Desktop update. See `7d297b61`, `61c60456`, `15ae9951`.
18. **Building the E2E bundle with `npm run build` sends test traffic to the LIVE backend** — a production build inlines `VITE_API_URL=https://api.emelmujiro.com/api` from `frontend/.env.production` (tracked, Gotcha #7), so the app makes absolute API calls and bypasses `e2e-server.mjs`'s `/api` proxy.
    - It showed up as 7 × `Not Found: /api/blog-posts/nonexistent-post-id-99999/` in the backend log, the fixture in `e2e/error-states.spec.ts`. It never reaches the frontend nginx log, because `api.emelmujiro.com` is a separate tunnel route straight to the backend.
    - **Fix**: `webServer` runs `npm run build:e2e` (`VITE_API_URL=/api VITE_ENABLE_ANALYTICS=false npm run build`); the deploy build stays plain `npm run build`.
    - **Verify by observing requests, not by grepping the bundle** — `api.emelmujiro.com` stays in the output as the default argument of `getEnvVar('REACT_APP_API_URL', …)` in `config/env.ts`. See `971b5b4c`.
19. **A capitalized dependency name in `backend/pyproject.toml` silently kills the whole `uv` dependabot ecosystem** — dependabot normalizes names per PEP 503 (lowercase) and matches the manifest case-sensitively, so `"Django==6.0.4"` was never rewritten, and its `uv lock --upgrade-package django==<new>` then failed with `dependency_file_not_resolvable`.
    - Every scheduled `uv in /backend` full run failed while the capital-D pin stood (2026-08-17, 08-24, 08-31), and the first run after the fix produced #483 and #485.
    - It hid because a failed run opens no PR: the only signal is a red `Dependabot Updates` run nothing notifies on, and the green `uv in /backend for <dep>` runs beside it are refresh jobs for open PRs.
    - **Fix**: lowercase the name in `pyproject.toml`. `uv.lock` does not move — confirm with `md5 -q backend/uv.lock` before and after plus `uv lock --check`, and do **not** run bare `uv lock`, which can churn unrelated entries.

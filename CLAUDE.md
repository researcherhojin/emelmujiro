# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

This repo's owner runs a quant trading platform alongside this codebase, so the operating principle is **엄밀하게** — counts and claims **about the codebase** are exact and verifiable; no `+` / `≥` / round-figure handwaves in this doc, in README, or in commit messages. Marketing copy rendered in the UI itself (e.g. `5,000+` hours in the hero stats) is exempt — that's user-facing, not doc-facing.

Cross-project behavioral guidelines (Think before coding · Simplicity first · Surgical changes · Goal-driven execution · Risky-action protocol) live in user-level `~/.claude/CLAUDE.md` and are not repeated here.

## Quick Orientation

This root file holds the always-loaded, cross-cutting rules. Domain specifics live in `.claude/rules/` and auto-load when Claude reads matching files: `frontend.md` (Architecture, UI Conventions, Testing — paths `frontend/**`), `backend.md` (constants, utilities, backend test output — paths `backend/**`).

By task type:

- **UI / page work** → `frontend.md` rule (Architecture, UI Conventions) auto-loads on `frontend/**` reads
- **Build / deploy / CI** → `Constraints` (SSG prerender, branch protection, CSP, README drift gates) + `Gotchas` #17 (Mac mini backend deploy traps + commit verify)
- **Dependency bumps** → `Gotchas` #6, #8, #13, #14, #15, #16
- **Backend changes** → `backend.md` rule (auto-loads on `backend/**` reads) + `Constraints` (ENV files, Local dev vs Docker)
- **All work** → `Code Conventions`, `Development Flow` invariants, `Gotchas` index

## Project Overview

Full-stack monorepo (React 19 + Django 6) deployed on Mac Mini via Docker + Cloudflare Tunnel.

- **Frontend**: http://localhost:5173 (Vite, NOT port 3000). Build output: `build/` (NOT `dist/`). Import alias `@` → `src/`
- **Backend**: http://localhost:8000. Single app: `api/`. Uses **uv** (NOT pip)
- **Dev proxy**: Vite proxies `/api` → `http://127.0.0.1:8000` (no CORS issues in dev)
- **Node ≥ 24**, **Python 3.12** required. Husky pre-commit runs lint-staged automatically

> Design rationale in `.private/strategy.md`; session log + opsec notes in `.private/journal.md`; secret setup in `.private/secrets-setup.md`. All gitignored, maintainer-local (synced via `scripts/sync_private.sh`). Past git history (pre-`01c4db8`) retains earlier strategy versions.

> **CLAUDE.md + `.claude/rules/` are the single source of truth** for operational rules. Do NOT duplicate these sections into README.

## Commands

All `npm run` frontend commands run from `frontend/`. Root-level `npm run dev` runs both servers.

```bash
npm run dev                # Frontend + Backend (from root)
npm run dev:clean          # Kill ports first, then start both (from root)
npm run build              # sitemap → tsc → vite build → cp 404.html (from frontend/)
npm run build:no-prerender # Same but skips prerender step (from frontend/)
npm run validate           # lint + type-check + test:coverage (from frontend/)
CI=true npm test -- --run src/components/common/__tests__/Navbar.test.tsx  # Single test
npm run test:e2e           # Playwright E2E (from frontend/). Also: test:e2e:ui, test:e2e:debug
npm run type-check         # tsc --noEmit (from frontend/)
npm run analyze:bundle     # source-map-explorer (from frontend/, requires build first)
npm run check:css          # detect CSS classes shipped in build but never referenced in src/ (from frontend/, requires build first)

npm run knip                                                                  # Dead code detection. Run from root
uv sync --extra dev                                                           # Install backend deps (NOT --dev). Run from backend/
uv run python manage.py test                                                  # Django unittest (NOT pytest). Needs DATABASE_URL=""
DATABASE_URL="" uv run python manage.py test api.tests.CategoryAPITestCase.test_list  # Single backend test
uv run black . && uv run flake8 .                                             # Format + lint (line length 120)

# Make shortcuts (run from root — see Makefile or `make help`):
# Setup:    make install · make setup-dev-machine · make verify-setup
# Dev:      make dev (Docker) · make dev-local · make dev-clean · make down · make restart
# Quality:  make test · make test-ci · make lint · make lint-fix · make update-test-counts
# Ops:      make build · make logs · make logs-security · make logs-debug · make health · make ps
# Django:   make migrate · make shell · make createsuperuser
# Cron:     make setup-cron (SiteVisit cleanup) · make setup-health-cron · make cleanup-visits DAYS=90
```

## Constraints

Build, runtime, and infrastructure rules. Violating these breaks deploys, security, or production.

**SEO**: `main.tsx` uses `createRoot()` (never `hydrateRoot`). Do NOT add static meta/title/OG to `index.html` — `SEOHelmet` handles everything. `SEOHelmet` auto-computes canonical from `location.pathname` — do NOT pass a `url` prop (English pages get wrong canonical). Page titles must NOT include `| 에멜무지로` suffix (appended automatically).

**KakaoTalk WebView**: `window.__appLoaded` must be set in `AppLayout` (router layout), NOT at provider level. iOS uses `kakaotalk://web/openExternal`; Android uses `intent://...#Intent;scheme=kakaotalk;end`. Android WebView is Chrome-based, so the banner is hidden — only error fallback uses the intent scheme.

**Local dev vs Docker**: `npm run dev` runs local backend (`DEBUG=True`, SQLite, no throttle) + Vite. Docker runs production backend (`DEBUG=False`, throttle on). Don't run both — port 8000 conflicts. Stop Docker (`docker compose stop backend`) before `npm run dev`. Local SQLite and Docker DB are separate — changes don't cross.

**ENV file structure**: Root `.env` = Docker Compose orchestration only (ports, tags, build flags — NO secrets). Backend config splits into `backend/.env` (local dev, `load_dotenv()`) and `backend/.env.production` (Docker prod, via `env_file` in docker-compose.yml). Both gitignored. On new servers, generate `backend/.env.production` from `backend/.env.example`.

**Deployment**: Never `rm -rf frontend/build` (breaks nginx volume mount) — use `rm -rf frontend/build/*`. Docker ports bind to `127.0.0.1` only. `SECRET_KEY` loaded via `env_file` — do NOT set in docker-compose `environment` section.

**SSG prerender + nginx routing**: `scripts/auto-deploy.sh` runs `npm run build`, which invokes `scripts/prerender.js` to generate `build/<path>/index.html` for **10 routes** (5 static × ko/en). Three non-obvious couplings:

- `frontend/nginx.conf` `location /` uses `try_files $uri $uri/index.html =404` — the explicit `$uri/index.html`, NOT `$uri/`, because directory lookup triggers nginx's auto-301 trailing-slash append that downgrades `https://` to `http://` via `absolute_redirect`. The `=404` (not `/index.html` fallback) is what prevents soft-200s for unknown URLs.
- SPA-fallback routes that prerender does NOT cover (dynamic blog posts `/insights/:slug`, admin `/insights/new` and `/insights/edit/:id`, standalone `/login`) get an explicit regex `location ~ ^/(en/)?(insights/.+|login)$` falling back to `/index.html`. **When adding a new dynamic route to `App.tsx`, update this regex** — otherwise it 404s in production.
- `scripts/auto-deploy.sh` runs `npx playwright install chromium` before build. Idempotent — keeps Playwright dependabot bumps from silently breaking the next deploy.

**Branch protection**: `main` has `allow_force_pushes: false` + `allow_deletions: false` + `delete_branch_on_merge: true`. **No** PR/status check/signing requirements — direct push to main is intentional for solo-dev hotfix workflow on a two-device setup (`git reflog` lives only on the device where commits were made, so the classic "rebase-stale-local → force-push" accident is much costlier than the CI-bypass cost). Emergency removal: `gh api repos/researcherhojin/emelmujiro/branches/main/protection --method DELETE` (re-PUT same minimal config after).

**Two-device dev bootstrap**: `make setup-dev-machine` (idempotent) handles brew installs (`node@24`, `python@3.12`, `uv`, `gh`), gh auth, local `.env` with per-machine random `SECRET_KEY`, `make install`, Django migrations, optional Playwright (`--with-playwright`), and `git config --global pull.rebase true` + `rebase.autoStash true`. **Production secrets are NOT synced to dev machines** — `backend/.env.production` (server-side `SECRET_KEY`, `RECAPTCHA_PRIVATE_KEY`) lives only on Mac mini + GitHub Actions secrets. `frontend/.env.production` is tracked in git because every `VITE_*` is inlined into the public client bundle (Gotcha #7). Per-device local `SECRET_KEY` divergence is correct — Django's `SECRET_KEY` is per-instance. `make verify-setup` runs a 10-check health pass. **Do NOT** add `backend/.env.production` or `frontend/.env.production` to that check list — defeats least-privilege.

**Two-device sync helpers**: Two artifacts don't move via `git push`. (1) `.private/` syncs via `./scripts/sync_private.sh push|pull|dry` — never `--delete`, so per-side unique files survive. (2) `./scripts/check_machine_sync.sh` reports MBP/Mac mini ahead/behind vs `origin/main` + production `last-modified`. Run before any push if a Mac mini session may have happened (caught a silent 16-commit production drift on 2026-04-16). Both scripts honor `MACMINI_HOST` env override. Interactive bits (Keychain unlock, SSH key registration, gh OAuth) are not scripted — manual steps in `.private/journal.md`.

**Umami analytics**: Self-hosted at `localhost:3001` (Docker, not public). Tracking API proxied through nginx at `location = /umami/api/send` (exact match — dashboard not exposed, `access_log off`). Secrets (`UMAMI_APP_SECRET`, `UMAMI_DB_PASSWORD`) in root `.env` (gitignored), required via `${VAR:?}` syntax. `umami-db` has `stop_grace_period: 30s` for clean PostgreSQL shutdown. Password reset wipes analytics data: `docker compose down umami umami-db && docker volume rm emelmujiro_umami_db && docker compose up -d umami-db umami`.

**Operational logs**: Cron jobs (`make setup-cron`, `make setup-health-cron`) must redirect output to `$(CURDIR)/backend/logs/<name>.log` — matches Django `LOG_DIR` (`backend/config/settings.py:355`), already gitignored, persists via Docker `logs_volume`. Never `/tmp` (evaporates), `~/logs/` (outside project), `/var/log/` (host-specific). Enforced by `pr-checks.yml` grep — any `crontab` line with `>>` not targeting `backend/logs/` fails CI.

**CSP**: `'unsafe-inline'` required (inline scripts: error handler, KakaoTalk detection, theme detection). `'unsafe-eval'` removed after `plugin-legacy` removal. `data:` is **not** in `script-src` (XSS-narrowing); stays in `img-src` for base64 SVG icons. `frame-ancestors 'none'` in nginx header (meta tag ignores it per spec) complements `X-Frame-Options: DENY`. Cloudflare Web Analytics is **disabled** — `cloudflareinsights.com` must NOT appear in `script-src`/`connect-src`. CSP is defined twice and must stay in sync: `nginx.conf` (production) + `index.html` meta tag (dev/fallback); the `stripLocalhostCsp` Vite plugin strips `localhost:8000`/`127.0.0.1:8000` from the meta-tag CSP at production build.

**Tailwind 3.x**: PostCSS uses `tailwindcss: {}` (NOT `@tailwindcss/postcss`). Dark mode is `class`-based. Never use dynamic class interpolation (`bg-${color}-600`).

**Production keys**: `SECRET_KEY` and `RECAPTCHA_PRIVATE_KEY` raise `ImproperlyConfigured` if missing in production (DEBUG bypasses reCAPTCHA).

**Bundle size**: Build output must be < 10MB (enforced in `pr-checks.yml`). Check large dep impact with `npm run analyze:bundle`.

**CI optimization**: `pr-checks.yml` uses `tj-actions/changed-files` for path-scoped jobs (frontend tests only on `frontend/` changes, backend on `backend/`). Trivy filesystem scan on every PR. Workflow-level `permissions: contents: read` with job-level write opt-in (least-privilege). `concurrency` group with `cancel-in-progress`. All jobs except `deploy-mac-mini` (`continue-on-error: true`) have `timeout-minutes` (2–15). `auto-label.yml` tags PRs by changed paths. `stale.yml` marks issues stale at 90d / PRs at 60d, then closes them after 30d / 14d.

**README drift gates**: Two CI guards. (1) **Package badges** — 14 badges in `pr-checks.yml` quick-checks vs `package.json`; red status is informational only (main has no required-status-check), but visible in PRs. (2) **Test counts** — `Sync Test Badges` job in `main-ci-cd.yml` sed-replaces counts using `frontend-test`/`backend-test` job outputs and pushes with `[skip ci]`. `make update-test-counts` is the local equivalent — exits non-zero if README patterns missing. Format coupled to the sed: `Vitest (N tests) + Django unittest (N tests)` in the `**Tests** —` bullet; if you change that substring, also update `scripts/update-test-counts.sh:48,50`. **Do NOT grep test files for Vitest counts** — `it.each([...])` rows expand at runtime, so grep undercounts.

## Code Conventions

- **Conventional commits** required (English only): `type(scope): description`. Types: `feat fix docs style refactor test chore deps ci`.
- **Branch naming**: `feature/name` or `fix/description`.
- **ESLint flat config** (`eslint.config.mjs`, NOT `.eslintrc`). Zero-warnings is the **target**, not yet a hard gate (`lint` script lacks `--max-warnings=0`).
- **English comments only**.
- **All UI strings via i18n** — `useTranslation()` in components, `i18n.t()` in data files. No hardcoded user-facing text.
- **No `window.alert()` / `window.prompt()`** — toast or inline UI.
- **Logger import**: `import logger from '../utils/logger'` (default export). Use `env.IS_DEVELOPMENT` for environment checks.

## Development Flow

7-phase cycle adapted from [gstack](https://github.com/garrytan/gstack). Skip phases when scope doesn't warrant (typo fix ≠ full cycle).

| Phase       | Purpose                                    | Repo tools                                                                                                                  | gstack skill                                                               |
| ----------- | ------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| **Think**   | Understand problem, constraints, prior art | `git log`, Grep, `CLAUDE.md`, `.private/journal.md`                                                                         | `/office-hours`, `/investigate`                                            |
| **Plan**    | Concrete change scope and tradeoffs        | plan file in `~/.claude/plans/` or inline                                                                                   | `/plan-ceo-review`, `/plan-eng-review`, `/plan-design-review`, `/autoplan` |
| **Build**   | Implement                                  | editor, `npm run dev`, `make dev-local`                                                                                     | (direct coding)                                                            |
| **Review**  | Independent 2nd opinion                    | `make lint`, `make type-check`, GitHub PR review                                                                            | `/review` (Claude), `/codex review` (Codex CLI), `/design-review`          |
| **Test**    | Verify behavior                            | `make test`, `make test-ci`, Playwright E2E, Lighthouse CI                                                                  | `/qa`, `/qa-only`, `/benchmark`                                            |
| **Ship**    | Land + deploy                              | bump `VERSION` + both `package.json` + `CHANGELOG.md`, conventional commit, PR, merge, `scripts/auto-deploy.sh` via webhook | `/ship`, `/land-and-deploy`, `/canary`                                     |
| **Reflect** | Capture surprises                          | `.private/journal.md` session log                                                                                           | `/retro`, `/document-release`                                              |

### Invariants

- **Version sync on Ship**: `VERSION`, root `package.json`, and `frontend/package.json` must all match. Bump all three in the same commit.
- **CHANGELOG on Ship**: move `## [Unreleased]` entries under a new `## [X.Y.Z] - YYYY-MM-DD` section, then append an empty `## [Unreleased]` on top.
- **PR discipline**: one issue per PR, ≤ 3 commits, no mid-PR scope expansion (deferred work → new issue).
- **`[skip ci]` guard**: only Ship-phase commits may include the literal substring, and only for pure README sync (Gotcha #10).

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

Quick code-level traps that cost time when missed. Each entry: rule one-liner + fix command + commit reference for backstory.

**Index**: #1 VITE\_ prefix · #2 useRef(null) · #3 minimatch override · #4 tsconfig.build excludes test types · #5 DATABASE_URL="" for tests · #6 never npm audit fix · #7 frontend/.env.production tracked · #8 react/react-dom split bumps · #9 nav selector scoping · #10 [skip ci] self-skip · #11 set -e + cmd substitution · #12 dependabot minor held for review · #13 rolldown lockfile on macOS · #14 tiptap @core single-version · #15 don't rebase dependabot branches · #16 Node major lockstep (3 files) · #17 backend deploy credsStore/launchd trap + commit verify

1. **`VITE_` prefix** for env vars (legacy `REACT_APP_` works via `config/env.ts` shim). Umami uses `VITE_UMAMI_HOST` + `VITE_UMAMI_WEBSITE_ID` (collect API, no external script).
2. **`useRef<T>(null)`** — React 19 requires initial value.
3. **`minimatch>=10.2.1`** override in `package.json` — don't remove.
4. **`tsconfig.build.json`** excludes test types — don't add `@testing-library/jest-dom`.
5. **`DATABASE_URL=""`** for backend tests — Docker PostgreSQL breaks SQLite tests.
6. **Never run `npm audit fix` (or `--force`)** — current `7 vulnerabilities (2 low, 4 moderate, 1 high)` is the expected state. The 1 high (`tmp`, symlink/path-traversal advisories, rides in via `@lhci/cli` → `inquirer` → `external-editor`), the 4 moderate (`uuid`, `@lhci/cli`, `@lhci/utils`, `js-yaml`), and the 2 low (`inquirer`, `external-editor`) are all `@lhci/cli` transitives with no production impact (nginx serves static `build/` without them). The `form-data` high (CVE-2026-12143) cleared via the `^4.0.6` override (`046b2cff`); the 4 prior moderates (`brace-expansion`, `express`, `qs`, `ws`) cleared via the 2026-06 axios/@tiptap bumps. `--force` tries to downgrade `@lhci/cli` to 0.1.0 and destroys Lighthouse CI. Update direct deps manually; let dependabot handle transitives.
7. **`frontend/.env.production` is intentionally tracked in git** — `.gitignore` line 5 has `!frontend/.env.production` (negation pattern). Every `VITE_*` is inlined into the public client bundle at build time, so `VITE_UMAMI_HOST` / `VITE_SENTRY_DSN` / `VITE_API_URL` are all **public by design** (DevTools shows them on any page load). Asymmetry is deliberate: `backend/.env.production` = real server-side secrets → gitignored; `frontend/.env.production` = compile-time public config → tracked. Do **not** `git rm` it — it's load-bearing for `scripts/auto-deploy.sh`.
8. **Dependabot's `react*` group does NOT bump react and react-dom together** — group only co-locates PRs in the review queue; bumps merge independently. Vitest then crashes with `Incompatible React versions`. **Fix**: `cd frontend && npm install react-dom@<matching-version> && cd .. && git add frontend/package.json package-lock.json && git commit -m "fix(deps): bump react-dom to match react"`. **Prevent**: when reviewing a react-only dependabot PR, check for matching react-dom PR; if absent, do manual bump in same commit. See `8ab71fe`.
9. **E2E nav selectors must scope to `<nav aria-label="Main navigation">`** — Korean nav labels (`강의이력`, `인사이트`, `문의하기`) appear in BOTH top navbar AND the footer's `메뉴 목록`, so a bare `getByRole('button', { name: '강의이력' })` hits Playwright strict-mode and fails. Always: `page.getByLabel('Main navigation').getByRole('button', { name: '강의이력' })`. Mobile sheet renders inside the same `<nav>`, so same scoping works for both.
10. **`[skip ci]` in a commit message body causes self-skip** — GitHub Actions parses the **entire** commit message (subject + body) for `[skip ci]` / `[ci skip]`. Documenting the mechanism in prose triggers skip for that commit. Use only for genuine skip intent; otherwise quote/escape (`\[skip ci\]`) or describe without the literal brackets.
11. **`set -e` does NOT exit on `FOO=$(failing_cmd)`** — command substitution masks the exit code. Use `if ! FOO=$(cmd); then exit 1; fi` when the exit code matters. Both `scripts/update-test-counts.sh` (was reading passing-count from failing test run) and `scripts/auto-deploy.sh` (was reporting success after health check timeout) had this bug. See `99e1a81`.
12. **`Auto-Merge Dependabot` job auto-merges only `semver-patch`** — `pr-checks.yml:47-52` runs `gh pr merge --auto --squash` only for `version-update:semver-patch`. Patch + minor get auto-approved (`:40-45`), but minor + major are intentionally **held for human review**. Manual close: `gh pr merge <num> --squash` (bare flag — `--auto` fails with `enablePullRequestAutoMerge` because the repo's GitHub auto-merge feature is off).
13. **`npm install` on macOS writes only host-platform `@rolldown/binding-*` to lockfile** (npm #4828) — Apple Silicon yields a single `binding-darwin-arm64` entry; CI on `ubuntu-24.04` then fails with `Cannot find module '@rolldown/binding-linux-x64-gnu'` (vite 8 uses rolldown; vitest shares it). **Fix**: `rm -rf node_modules frontend/node_modules package-lock.json && npm install --include=optional --legacy-peer-deps`, then verify `grep -c "node_modules/@rolldown/binding-" package-lock.json` == 15. `--legacy-peer-deps` needed because `eslint-plugin-jsx-a11y@6.10.2` caps peers at `eslint@^9` while we run `^10`. See `f289544`.
14. **Mixed `@tiptap/*` patch ranges duplicate `@tiptap/core`** — different patch versions across sibling `@tiptap/*` deps make npm install two cores, and `@tiptap/react` peer-pins `@tiptap/core` to EXACT version, so the override must match the react version too. Fails as either: tsc `Type 'Node<any, any>' is not assignable to type 'Node<any, any>'. Two different types ... exist, but they are unrelated.` OR vite build `[MISSING_EXPORT] cancelPositionCheck is not exported by @tiptap/core/dist/index.js`. **Fix**: align ALL `@tiptap/*` direct deps to the same `^3.X.Y` AND set root + frontend `overrides @tiptap/core` to the same `^3.X.Y` AND add `@tiptap/core` as direct frontend dep so `import from '@tiptap/core'` resolves from `src/`. Verify: `npm ls @tiptap/core --all | grep "@tiptap/core@" | sort -u` must yield one version. See `da9d76c`, `2c41535`.
15. **Don't manually rebase or force-push to `dependabot/*` branches** — GitHub treats non-bot pushes as adversarial and silently closes the PR (`head_sha` → null, state → `closed merged=false`); `gh pr checks` still shows the old green run. Correct path: comment `@dependabot rebase` and let the bot push. After a close cascade, recover by bundling the bumps into one direct-to-main commit with `Closes #NNN` lines. See `09a47e9`.
16. **Node major version must move in lockstep across three files**: `frontend/Dockerfile.dev` `FROM node:N-alpine`, `.github/actions/setup-node/action.yml` `node-version: "N"`, `scripts/setup-dev-machine.sh` brew `node@N`. Bumping one alone creates "works in my dev container, fails in CI" drift. Dependabot's docker ecosystem will keep proposing single-file Dockerfile bumps — close with `@dependabot ignore this major version`, not merge.
17. **Backend-only deploys can silently ship stale code on the Mac mini** — the `deploy-mac-mini` webhook runs `auto-deploy.sh` under a non-interactive launchd session, where the backend image build (`docker compose up -d --build backend`) hits two Docker Desktop traps in sequence: (1) `docker-credential-desktop` is not on the launchd PATH → `executable file not found`; (2) with it on PATH, `credsStore: desktop` makes the helper HANG (no reach to the Desktop credential backend) → BuildKit registry metadata resolution times out (`DeadlineExceeded`) for the public base images. Either way `set -e` aborts AFTER the host-side `npm run build` (frontend bind mount → site refreshes) but BEFORE the backend recreate, so the site looks deployed while the backend runs old code — and the CI `Deploy to Mac Mini` job is green because `deploy-webhook.js` `200`s on trigger-accept, not deploy-success. **Fixes in `auto-deploy.sh`**: prepend `/Applications/Docker.app/Contents/Resources/bin` to PATH, and build under a scoped `DOCKER_CONFIG` (`~/.docker-deploy-config`) copied from `~/.docker` with the `credsStore` line stripped (keep `cli-plugins`/`contexts`/`buildx`; selective copy skips the unix sockets that trip `set -e`). **Verifying a backend deploy**: `curl https://emelmujiro.com/api/health/` returns `"commit"` (baked into the image via the `GIT_COMMIT` build arg); `auto-deploy.sh` asserts it matches the deployed `HEAD` and fails the deploy on mismatch. Do NOT trust a bare `200` health check — it passes against the stale container too. See `7d297b61`, `61c60456`, `15ae9951`.

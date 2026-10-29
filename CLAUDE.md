# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

This repo's owner runs a quant trading platform alongside this codebase, so the operating principle is **엄밀하게** — counts and claims **about the codebase** are exact and verifiable; no `+` / `≥` / round-figure handwaves in this doc, in README, or in commit messages. Marketing copy rendered in the UI itself (e.g. `5,000+` hours in the hero stats) is exempt — that's user-facing, not doc-facing.

## Quick Orientation

**Size and shape**: every rule is one bold lead sentence with its evidence in sub-bullets. The official [memory](https://code.claude.com/docs/en/memory) page targets "under 200 lines per CLAUDE.md file", so a rule that applies only to some files belongs in a path-scoped rule under `.claude/rules/`, and **Gotchas are the exception: their numbered bold rules stay here** — a path-scoped `.claude/rules/dependencies.md` was tried on 2026-07-31 and reverted, because renumbering broke the Gotcha IDs cited from commits, CHANGELOG and PRs, and these rules fire on situations (a red scan, a dependabot PR), not on file reads. Their evidence and fix steps moved on 2026-10-23 to the `gotchas` skill, which loads by situation and keeps every number. Cut lines and bytes by compressing wording in place, never by deleting blank lines or merging separate rules. Dated measurements belong under `Baselines` in `.private/journal.md`.

This root file holds the always-loaded, cross-cutting rules. Each file in `.claude/rules/` auto-loads when Claude reads a file matching its `paths`; a situation is not a file read, so by task type, read the named rule file first:

- **UI / page work** → `frontend.md` (Architecture, UI Conventions, Testing, Security incl. blog HTML sanitization — paths `frontend/**`) + `frontend-build.md` (SEO, KakaoTalk WebView, Tailwind 4.x — loads on any `frontend/src` read)
- **Build / deploy / CI, or a red CI check** → `ci.md` (Manual security audits, Runtime image recipes, Operational logs, CI job gating, CHANGELOG entry, Runners pinned to ubuntu-24.04, Shared caches saved only on `main`, Auto-merged commits do not deploy, `auto-deploy.sh` one deploy late, Spell check, README drift gates, Scheduled security operations, Nightly image refresh) + `frontend-build.md` (SSG prerender + nginx routing, Cloudflare owns https, E2E target, Lighthouse, CSP, Tailwind, Bundle size) + `backend.md` (Deployment: migrations run in the container) + `Constraints` (Deployment, Branch protection) + `Gotchas` #17 (backend deploy: verify by commit, never a bare `200`)
- **`Security operations require attention` issue** → `ci.md` (Scheduled security operations, Nightly image refresh) + `docs/intents/infra/security-operations.md` (one section per past alarm). The issue body is generic by design; the booleans and per-target counts live in the host report described in `.private/operations.md`, and a dispatched watchdog re-reads the old report until the host job is rerun
- **Search Console report** → `frontend-build.md` (SEO, SSG prerender + nginx routing). Get the URL from the reason's drill-down page first, then check raw bytes (`curl`) and the rendered DOM separately: the 2026-09-24 canonical bug and the 2026-10-12 Soft 404 both lived only in the raw bytes
- **Dependency bumps** → `Gotchas` #6, #8, #13, #14, #15, #16 + `ci.md` (Runtime image recipes: Postgres majors are dependabot-ignored) + `frontend-build.md` (Tailwind 4.x parity shims; the v5 major is dependabot-ignored)
- **Backend changes** → `backend.md` (Architecture, Constants, Utilities, Testing, Tooling, Deployment, Security incl. file-upload validation and production keys — paths `backend/**`) + `Constraints` (ENV files, Local dev vs Docker)
- **All work** → `Code Conventions`, `Development Flow` invariants, `Gotchas` index

## Project Overview

Full-stack monorepo (React 19 + Django 6), self-hosted via Docker behind a Cloudflare Tunnel. Host details in `.private/operations.md`.

- **Frontend**: http://localhost:5173 (Vite, NOT port 3000). Build output: `build/` (NOT `dist/`). Import alias `@` → `src/`
- **Backend**: http://localhost:8000. Single app: `api/`. Uses **uv** (NOT pip)
- **Dev proxy**: Vite proxies `/api` → `http://127.0.0.1:8000` (no CORS issues in dev)
- **`scripts/` holds folders only** (plus `package.json`, `tsconfig.json`): `deploy/`, `security/`, `maintenance/`, `backup/`, `repo/` (CI and hook checks), `dev/` (local machine), `shared/`, `tests/`. A new script goes into one of them; host crontab, launchd and LaunchAgent entries name these paths, so a move needs the host switched in the same change (#712).
- **Node ≥ 24**, **Python 3.12** required. Husky runs lint-staged on `pre-commit`, `scripts/repo/check-commit-msg.sh` on `commit-msg`, and `scripts/repo/check-changelog.sh` on a `pre-push` to `main` (warns, never blocks)

> Maintainer-local, gitignored, synced via `scripts/dev/sync-private.sh`: design rationale in `.private/strategy.md`; session log + opsec notes in `.private/journal.md`; secret setup in `.private/secrets-setup.md`; **host topology, deploy forensics and incident history in `.private/operations.md`**. The repo is public, so those moved out on 2026-09-28; each entry left an actionable summary behind, and this file remains the source of truth for the rules themselves. Past git history (pre-`01c4db8`) retains earlier strategy versions.

> **CLAUDE.md + `.claude/rules/` are the single source of truth** for operational rules. Do NOT duplicate these sections into README; `AGENTS.md` is a short index for other coding agents that points here, so a rule changed here may need its one-line summary there updated too.

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
npm run type-check         # tsc --noEmit, tsc -p tsconfig.node.json (build configs) AND tsc -p scripts/tsconfig.json (frontend/scripts, native TS). From frontend/
npm run analyze:bundle     # source-map-explorer (from frontend/, requires build first)
npm run check:css          # detect CSS classes shipped in build but never referenced in src/ (from frontend/, requires build first)
npm run check:routes       # cross-reference the 4 hardcoded route lists (from frontend/, no build or node_modules needed)
npm run visual:capture     # screenshot a served build; visual:compare diffs two captures (from frontend/; frontend-build.md › Tailwind)

npm run knip                                                                  # Dead code detection. Run from root
npm run spell                                                                 # cspell over tracked files + .claude/{rules,hooks,skills/intent,skills/gotchas,agents} + .github. Run from root
uv sync --extra dev                                                           # Install backend deps (NOT --dev). Run from backend/
uv run python manage.py test                                                  # Django unittest (NOT pytest). Needs DATABASE_URL=""
DATABASE_URL="" uv run python manage.py test api.tests.BlogPostAPITestCase          # Single backend test class
uv run black . && uv run flake8 .                                             # Format + lint (line length 120)

make verify-setup                                                             # 10-check dev-machine health pass; `make help` lists the main targets. Run from root
./scripts/repo/check-changelog.sh origin/main HEAD                                 # Repo checks CI runs, from root; cases: scripts/repo/test-check-changelog.sh, .claude/hooks/test-guard-bash.sh
npm run check:scripts                                                         # Type-check + test root scripts/ (node --test, backup verify). Run from root
```

## Constraints

Build, runtime, and infrastructure rules. Violating these breaks deploys, security, or production.

**Local dev vs Docker**: `npm run dev` runs local backend (`DEBUG=True`, SQLite, no throttle) + Vite. Docker runs production backend (`DEBUG=False`, throttle on). Don't run both — port 8000 conflicts. Stop Docker (`docker compose stop backend`) before `npm run dev`. Local SQLite and Docker DB are separate — changes don't cross.

**ENV file structure**: Root `.env` = Docker Compose orchestration only (ports, tags, build flags, and the two Umami secrets `UMAMI_APP_SECRET` / `UMAMI_DB_PASSWORD` — no app secrets). Backend config splits into `backend/.env` (local dev, `load_dotenv()`) and `backend/.env.production` (Docker prod, via `env_file` in docker-compose.yml). Both gitignored. On new servers, generate `backend/.env.production` from `backend/.env.example`.

**Deployment**: Never `rm -rf frontend/build` (breaks nginx volume mount) — use `rm -rf frontend/build/*`. Docker ports bind to `127.0.0.1` only. `SECRET_KEY` loaded via `env_file` — do NOT set in docker-compose `environment` section. The deploy rules tied to one file live with it: migrations in the container (`backend.md`), the Cloudflare-owned https upgrade (`frontend-build.md`), `auto-deploy.sh` applying one deploy late (`ci.md`).

**Branch protection**: `main` has `allow_force_pushes: false` + `allow_deletions: false` + `delete_branch_on_merge: true`, and **no** required status checks — direct push to main is the intentional solo-dev hotfix workflow. Rationale, the exact settings and the emergency-removal procedure live in `.private/operations.md`.

**Two-device dev bootstrap**: `make setup-dev-machine` (idempotent) provisions a machine; `make verify-setup` runs a 10-check health pass. **Production secrets are NOT synced to dev machines** — `backend/.env.production` lives only on the deploy host and in GitHub Actions secrets, and per-device local `SECRET_KEY` divergence is correct. `frontend/.env.production` is tracked in git on purpose (Gotcha #7). **Do NOT** add either `.env.production` to the verify list. Full step list and the Chromium caveat: `.private/operations.md`.

**Two-device sync helpers**: two artifacts don't move via `git push` — `.private/` (via `./scripts/dev/sync-private.sh push|pull|dry`, never `--delete`) and the deploy-host/production drift report (`./scripts/dev/check-machine-sync.sh`). Run the second before any push if a session may have happened on the other machine; it caught a silent 16-commit production drift. Host details in `.private/operations.md`.

**Umami analytics**: self-hosted behind nginx, not publicly exposed; the dashboard is not routed and only the tracking endpoint is proxied. Secrets live in the gitignored root `.env` and are required via `${VAR:?}`. Ports, the exact nginx location and the data-destroying password-reset procedure: `.private/operations.md`.

## Code Conventions

- **Conventional commits** required (English only): `type(scope): description`. Types: `feat fix docs style refactor test chore perf deps-dev deps ci`.
  - **`scripts/repo/check-commit-msg.sh` is the single source of truth** — the `.husky/commit-msg` hook and the `pr-checks.yml` step both call it, so edit the type list there and never re-inline the regex in a caller.
  - `deps-dev` exists because dependabot writes `deps-dev(deps-dev):` and the skip pattern exempts it, so a human finishing one of its PRs by hand needs the same type available.
  - Exempt: merge commits, `fixup!`/`squash!`/`amend!` (autosquash rewrites them away), `Revert "…"`, and dependabot's formats.
  - English-only is machine-enforced as ASCII on the **subject line only** — the body is not inspected — so `git commit --no-verify` is the escape for a subject that genuinely needs a non-ASCII proper noun.
- **Branch naming**: `feature/name` or `fix/description`.
- **ESLint flat config** (`eslint.config.ts`, loaded through `jiti`, NOT `.eslintrc`). Zero-warnings is the **target**, not yet a hard gate (`lint` script lacks `--max-warnings=0`).
- **English comments only**.
- **All UI strings via i18n** — `useTranslation()` in components, `i18n.t()` in data files. No hardcoded user-facing text.
- **No `window.alert()` / `window.prompt()`** — toast or inline UI.
- **Logger import**: `import logger from '../utils/logger'` (default export). Use `env.IS_DEVELOPMENT` for environment checks.

## Development Flow

7-phase cycle adapted from [gstack](https://github.com/garrytan/gstack): **Think** (`.private/journal.md`, `docs/intents/`) → **Plan** (`Spec` + `Plan` of the intent file; else `~/.claude/plans/` or inline) → **Build** → **Review** (`make lint`, `type-check`, `/code-review`) → **Test** → **Ship** (`CHANGELOG.md` entry, conventional commit, PR, merge, webhook deploy) → **Reflect** (`.private/journal.md` session log). Skip phases when scope doesn't warrant (typo fix ≠ full cycle).

### Invariants

- **Work that needs an intent gets a file in `docs/intents/<module>/<slug>.md`** (when, statuses and template: `docs/intents/README.md`); `/intent <module>/<slug>`, or a plain-language request for such work, runs its next step, and the `intent-reviewer` subagent checks a branch against its Spec. The repo is public, so host and opsec details stay in `.private/` and are linked by name. A `dropped` intent stays in the tree with its reason, so the idea is not re-raised from scratch; a `shipped` one is deleted unless a living doc cites it (git history keeps it); the journal Backlog points to the intent instead of repeating it.
- **Deployed code is identified by commit SHA, not by a version number.** There is no release cut and no version to bump: `auto-deploy.sh` bakes `GIT_COMMIT` into the backend image and `/api/health/` reports it.
  - The `version` fields in both `package.json` files are inert metadata (both are `private: true`) and **must not be re-coupled into a sync rule**; the `VERSION` file was deleted on 2026-09-28 because nothing read it.
  - Retiring the release number says nothing about API compatibility — `backend/api/` serves blog list and retrieval anonymously, so external consumers cannot be ruled out from this repo.
- **CHANGELOG on Ship**: append the entry under `## Merged since [1.0.0]`; `scripts/repo/check-changelog.sh` warns, never blocks, when a change outside `docs/intents/` has none (`ci.md` › CHANGELOG entry). Do **not** re-section it by date or cut it into releases — there is no measured benefit to pay the reconstruction cost for. `[1.0.0]` stays as a historical record.
- **PR discipline**: one issue per PR, ≤ 3 commits, no mid-PR scope expansion (deferred work → new issue).
- **CI-skip guard**: only the `Sync README Badges` bot may carry the literal; every other commit is rejected by `scripts/repo/check-commit-msg.sh` (Gotcha #10). Escape it to write about it.

### Skip rules

- **Typo / comment / single-line README**: Think → Build → Ship.
- **Hotfix on live bug**: Think → Build → Test → Ship → Reflect.
- **Refactor touching ≥ 3 files or any `Constraints` section (including those moved to `.claude/rules/ci.md` and `frontend-build.md`)**: full 7 phases mandatory.
- **Semver-compatible dependency bump**: Review → Test → Ship.

## Security

- **CI workflows**: Never use `${{ }}` directly inside `run:` blocks — bind to `env:` first, reference as `"$VAR"`. Prevents script injection via branch names. Composite actions `.github/actions/setup-node` and `.github/actions/setup-uv` replace inline setup.
- **Shell scripts**: No `eval` with variables, no `source` of untrusted files (use `read` loop parsing), validate Make variables that reach shell commands.
- **Claude Code guard hooks: `.claude/settings.json` (tracked) runs `.claude/hooks/guard-bash.sh` before every Bash call, and it exits `2` on the commands this file forbids** — `npm audit fix` (#6), removing `frontend/build` itself (Deployment), any push to `dependabot/*` (#15), `git rm` of `.env.production` (#7). The same file denies Read/Edit of `.env`, `backend/.env` and `backend/.env.production`. It is a backstop for habit, not a sandbox; its matching limits and how to add a guard are in `.claude/rules/claude-config.md`.

## Gotchas

Quick code-level traps that cost time when missed. Each entry is its bold rule. The fix, the evidence and the commit references for #6, #7, #8, #9, #10, #12, #13, #14, #17, #18, #19 are in the `gotchas` skill (`.claude/skills/gotchas/SKILL.md`), under the same number; read that section before acting on one.

**Index**: #1 VITE\_ prefix · #2 useRef(null) · #3 minimatch override · #4 tsconfig.build excludes test types · #5 DATABASE_URL="" for tests · #6 never npm audit fix (enforced) · #7 frontend/.env.production tracked (enforced) · #8 react/react-dom split bumps · #9 nav selector scoping · #10 CI-skip marker self-skip (enforced) · #11 set -e + cmd substitution · #12 dependabot minor held for review · #13 rolldown lockfile on macOS · #14 tiptap @core single-version · #15 don't rebase dependabot branches (push enforced) · #16 Node major lockstep (2 files) · #17 backend deploy credsStore/launchd trap + commit verify · #18 E2E must build with build:e2e (plain build hits live API) · #19 backend dep names must be lowercase or the uv dependabot ecosystem dies

1. **`VITE_` prefix** for env vars (legacy `REACT_APP_` works via `config/env.ts` shim). Umami uses `VITE_UMAMI_HOST` + `VITE_UMAMI_WEBSITE_ID` (collect API, no external script).
2. **`useRef<T>(null)`** — React 19 requires initial value.
3. **`minimatch>=10.2.1`** override in `package.json` — don't remove.
4. **`tsconfig.build.json`** excludes test types — don't add `@testing-library/jest-dom`.
5. **`DATABASE_URL=""`** for backend tests — a non-empty `DATABASE_URL` in the shell or `backend/.env` points them at PostgreSQL, not SQLite.
6. **Never run `npm audit fix` (or `--force`)** — `--force` downgrades `@lhci/cli` (from `0.15.1`) and destroys Lighthouse CI; the offered `fixAvailable` target moves with the advisory set (`0.1.0`, then `0.12.0`, then `0.3.5` on 2026-10-22).
7. **`frontend/.env.production` is intentionally tracked in git** — `.gitignore` line 5 has `!frontend/.env.production` (negation pattern). Do **not** `git rm` it — it's load-bearing for `scripts/deploy/auto-deploy.sh`.
8. **Dependabot does NOT bump react and react-dom together** — its pairing of a package with its `@types/*` companion covers `react-dom` + `@types/react-dom`, not `react`, and no `react*` group exists on the surviving `/` npm ecosystem. Vitest then crashes with `Incompatible React versions`.
9. **E2E nav selectors must scope to `<nav aria-label="Main navigation">`** — Korean nav labels (`강의이력`, `인사이트`, `문의하기`) appear in BOTH top navbar AND the footer's `메뉴 목록`, so a bare `getByRole('button', { name: '강의이력' })` hits Playwright strict-mode and fails.
10. **A CI-skip marker in a commit message body causes self-skip — now rejected by `scripts/repo/check-commit-msg.sh`** — GitHub Actions parses the **entire** commit message (subject + body) for all five markers (`[skip ci]`, `[ci skip]`, `[no ci]`, `[skip actions]`, `[actions skip]`), so documenting the mechanism in prose skips CI for that commit.
11. **`set -e` does NOT exit on `FOO=$(failing_cmd)`** — command substitution masks the exit code. Use `if ! FOO=$(cmd); then exit 1; fi` when the exit code matters. Both `scripts/repo/update-test-counts.sh` (was reading passing-count from failing test run) and `scripts/deploy/auto-deploy.sh` (was reporting success after health check timeout) had this bug. See `99e1a81`.
12. **`Auto-Merge Dependabot` job auto-merges only `semver-patch`** — `pr-checks.yml`'s `Merge patch updates` step runs a retried bare `gh pr merge --squash` only for `version-update:semver-patch`; patch + minor are auto-approved by `Auto-approve patch and minor updates`, and minor + major are **held for human review**.
13. **`npm install` on macOS writes only host-platform `@rolldown/binding-*` to lockfile** (npm #4828) — Apple Silicon yields a single `binding-darwin-arm64` entry; CI on `ubuntu-24.04` then fails with `Cannot find module '@rolldown/binding-linux-x64-gnu'` (vite 8 uses rolldown; vitest shares it).
14. **Sibling `@tiptap/*` deps on different patches duplicate `@tiptap/core`, and the `overrides` entry is what hides it** — our `^3.x` carets only _permit_ the drift; upstream **exact** pins (`starter-kit` in `dependencies`, six others as exact `peerDependencies`) turn it into nested copies.
15. **Don't manually rebase or force-push to `dependabot/*` branches** — GitHub treats non-bot pushes as adversarial and silently closes the PR (`head_sha` → null, state → `closed merged=false`); `gh pr checks` still shows the old green run. Correct path: comment `@dependabot rebase` and let the bot push. After a close cascade, recover by bundling the bumps into one direct-to-main commit with `Closes #NNN` lines. See `09a47e9`.
16. **Node major version must move in lockstep across two files**: `.github/actions/setup-node/action.yml` `node-version: "N"` and `scripts/dev/setup-dev-machine.sh` (brew `node@N` and its `-ge N` check); the root `package.json` `engines.node` floor (`>=N.0.0`) follows them. Bumping one alone creates "works on my machine, fails in CI" drift. No toolchain Dockerfile pins Node since the Docker dev environment, the third copy, was deleted on 2026-10-18; `docker/umami/Dockerfile`'s `node:22-alpine` is Umami's own build base and stays out of this lockstep.
17. **A backend deploy can silently ship stale code — verify by commit, never by a bare `200`** — `curl https://emelmujiro.com/api/health/` returns a `"commit"` baked into the image via the `GIT_COMMIT` build arg, and `auto-deploy.sh` fails the deploy when it does not match the SHA it was told to deploy.
18. **Building the E2E bundle with `npm run build` sends test traffic to the LIVE backend** — a production build inlines `VITE_API_URL=https://api.emelmujiro.com/api/` from `frontend/.env.production` (tracked, Gotcha #7), so the app makes absolute API calls and bypasses `e2e-server.ts`'s `/api` proxy.
19. **A capitalized dependency name in `backend/pyproject.toml` silently kills the whole `uv` dependabot ecosystem** — dependabot normalizes names per PEP 503 (lowercase) and matches the manifest case-sensitively, so `"Django==6.0.4"` was never rewritten, and its `uv lock --upgrade-package django==<new>` then failed with `dependency_file_not_resolvable`.

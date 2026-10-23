# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

This repo's owner runs a quant trading platform alongside this codebase, so the operating principle is **엄밀하게** — counts and claims **about the codebase** are exact and verifiable; no `+` / `≥` / round-figure handwaves in this doc, in README, or in commit messages. Marketing copy rendered in the UI itself (e.g. `5,000+` hours in the hero stats) is exempt — that's user-facing, not doc-facing.

## Quick Orientation

**Size and shape**: every rule is one bold lead sentence with its evidence in sub-bullets. The official [memory](https://code.claude.com/docs/en/memory) page targets "under 200 lines per CLAUDE.md file", so a rule that applies only to some files belongs in a path-scoped rule under `.claude/rules/`, and **Gotchas are the exception: they stay here with their numbers** — a path-scoped `.claude/rules/dependencies.md` was tried on 2026-07-31 and reverted, because renumbering broke the Gotcha IDs cited from commits, CHANGELOG and PRs, and these rules fire on situations (a red scan, a dependabot PR), not on file reads. Cut lines and bytes by compressing wording in place, never by deleting blank lines or merging separate rules. Dated measurements belong under `Baselines` in `.private/journal.md`.

This root file holds the always-loaded, cross-cutting rules. Each file in `.claude/rules/` auto-loads when Claude reads a file matching its `paths`; a situation is not a file read, so by task type, read the named rule file first:

- **UI / page work** → `frontend.md` (Architecture, UI Conventions, Testing, Security incl. blog HTML sanitization — paths `frontend/**`) + `frontend-build.md` (SEO, KakaoTalk WebView, Tailwind 4.x — loads on any `frontend/src` read)
- **Build / deploy / CI, or a red CI check** → `ci.md` (Manual security audits, Runtime image recipes, Operational logs, CI job gating, CHANGELOG entry, Runners pinned to ubuntu-24.04, Shared caches saved only on `main`, Auto-merged commits do not deploy, `auto-deploy.sh` one deploy late, Spell check, README drift gates) + `frontend-build.md` (SSG prerender + nginx routing, Cloudflare owns https, E2E target, Lighthouse, CSP, Tailwind, Bundle size) + `backend.md` (Deployment: migrations run in the container) + `Constraints` (Deployment, Branch protection) + `Gotchas` #17 (backend deploy: verify by commit, never a bare `200`)
- **Search Console report** → `frontend-build.md` (SEO, SSG prerender + nginx routing). Get the URL from the reason's drill-down page first, then check raw bytes (`curl`) and the rendered DOM separately: the 2026-09-24 canonical bug and the 2026-10-12 Soft 404 both lived only in the raw bytes
- **Dependency bumps** → `Gotchas` #6, #8, #13, #14, #15, #16 + `ci.md` (Runtime image recipes: Postgres majors are dependabot-ignored) + `frontend-build.md` (Tailwind 4.x parity shims; the v5 major is dependabot-ignored)
- **Backend changes** → `backend.md` (Architecture, Constants, Utilities, Testing, Tooling, Deployment, Security incl. file-upload validation and production keys — paths `backend/**`) + `Constraints` (ENV files, Local dev vs Docker)
- **All work** → `Code Conventions`, `Development Flow` invariants, `Gotchas` index

## Project Overview

Full-stack monorepo (React 19 + Django 6), self-hosted via Docker behind a Cloudflare Tunnel. Host details in `.private/operations.md`.

- **Frontend**: http://localhost:5173 (Vite, NOT port 3000). Build output: `build/` (NOT `dist/`). Import alias `@` → `src/`
- **Backend**: http://localhost:8000. Single app: `api/`. Uses **uv** (NOT pip)
- **Dev proxy**: Vite proxies `/api` → `http://127.0.0.1:8000` (no CORS issues in dev)
- **Node ≥ 24**, **Python 3.12** required. Husky runs lint-staged on `pre-commit`, `scripts/check-commit-msg.sh` on `commit-msg`, and `scripts/check-changelog.sh` on a `pre-push` to `main` (warns, never blocks)

> Maintainer-local, gitignored, synced via `scripts/sync_private.sh`: design rationale in `.private/strategy.md`; session log + opsec notes in `.private/journal.md`; secret setup in `.private/secrets-setup.md`; **host topology, deploy forensics and incident history in `.private/operations.md`**. The repo is public, so those moved out on 2026-09-28; each entry left an actionable summary behind, and this file remains the source of truth for the rules themselves. Past git history (pre-`01c4db8`) retains earlier strategy versions.

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
npm run type-check         # tsc --noEmit AND tsc -p tsconfig.node.json (build configs). From frontend/
npm run analyze:bundle     # source-map-explorer (from frontend/, requires build first)
npm run check:css          # detect CSS classes shipped in build but never referenced in src/ (from frontend/, requires build first)
npm run check:routes       # cross-reference the 4 hardcoded route lists (from frontend/, no build or node_modules needed)
npm run visual:capture     # screenshot a served build; visual:compare diffs two captures (from frontend/; frontend-build.md › Tailwind)

npm run knip                                                                  # Dead code detection. Run from root
npm run spell                                                                 # cspell over tracked files + .claude/{rules,hooks,skills/intent,agents} + .github. Run from root
uv sync --extra dev                                                           # Install backend deps (NOT --dev). Run from backend/
uv run python manage.py test                                                  # Django unittest (NOT pytest). Needs DATABASE_URL=""
DATABASE_URL="" uv run python manage.py test api.tests.BlogPostAPITestCase          # Single backend test class
uv run black . && uv run flake8 .                                             # Format + lint (line length 120)

make verify-setup                                                             # 10-check dev-machine health pass; `make help` lists the main targets. Run from root
./scripts/check-changelog.sh origin/main HEAD                                 # Repo checks CI runs, from root; cases: scripts/test-check-changelog.sh, .claude/hooks/test-guard-bash.sh
```

## Constraints

Build, runtime, and infrastructure rules. Violating these breaks deploys, security, or production.

**Local dev vs Docker**: `npm run dev` runs local backend (`DEBUG=True`, SQLite, no throttle) + Vite. Docker runs production backend (`DEBUG=False`, throttle on). Don't run both — port 8000 conflicts. Stop Docker (`docker compose stop backend`) before `npm run dev`. Local SQLite and Docker DB are separate — changes don't cross.

**ENV file structure**: Root `.env` = Docker Compose orchestration only (ports, tags, build flags, and the two Umami secrets `UMAMI_APP_SECRET` / `UMAMI_DB_PASSWORD` — no app secrets). Backend config splits into `backend/.env` (local dev, `load_dotenv()`) and `backend/.env.production` (Docker prod, via `env_file` in docker-compose.yml). Both gitignored. On new servers, generate `backend/.env.production` from `backend/.env.example`.

**Deployment**: Never `rm -rf frontend/build` (breaks nginx volume mount) — use `rm -rf frontend/build/*`. Docker ports bind to `127.0.0.1` only. `SECRET_KEY` loaded via `env_file` — do NOT set in docker-compose `environment` section. The deploy rules tied to one file live with it: migrations in the container (`backend.md`), the Cloudflare-owned https upgrade (`frontend-build.md`), `auto-deploy.sh` applying one deploy late (`ci.md`).

**Branch protection**: `main` has `allow_force_pushes: false` + `allow_deletions: false` + `delete_branch_on_merge: true`, and **no** required status checks — direct push to main is the intentional solo-dev hotfix workflow. Rationale, the exact settings and the emergency-removal procedure live in `.private/operations.md`.

**Two-device dev bootstrap**: `make setup-dev-machine` (idempotent) provisions a machine; `make verify-setup` runs a 10-check health pass. **Production secrets are NOT synced to dev machines** — `backend/.env.production` lives only on the deploy host and in GitHub Actions secrets, and per-device local `SECRET_KEY` divergence is correct. `frontend/.env.production` is tracked in git on purpose (Gotcha #7). **Do NOT** add either `.env.production` to the verify list. Full step list and the Chromium caveat: `.private/operations.md`.

**Two-device sync helpers**: two artifacts don't move via `git push` — `.private/` (via `./scripts/sync_private.sh push|pull|dry`, never `--delete`) and the deploy-host/production drift report (`./scripts/check_machine_sync.sh`). Run the second before any push if a session may have happened on the other machine; it caught a silent 16-commit production drift. Host details in `.private/operations.md`.

**Umami analytics**: self-hosted behind nginx, not publicly exposed; the dashboard is not routed and only the tracking endpoint is proxied. Secrets live in the gitignored root `.env` and are required via `${VAR:?}`. Ports, the exact nginx location and the data-destroying password-reset procedure: `.private/operations.md`.

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
| **Think**   | Understand problem, constraints, prior art | `git log`, Grep, `CLAUDE.md`, `.private/journal.md`, `docs/intents/`                       |
| **Plan**    | Concrete change scope and tradeoffs        | `Spec` + `Plan` of the intent file in `docs/intents/`; else `~/.claude/plans/` or inline   |
| **Build**   | Implement                                  | editor, `npm run dev`, `make dev-local`                                                    |
| **Review**  | Independent 2nd opinion                    | `make lint`, `npm run type-check` (from `frontend/`), `/code-review`, GitHub PR review     |
| **Test**    | Verify behavior                            | `make test`, `make test-ci`, Playwright E2E, Lighthouse CI                                 |
| **Ship**    | Land + deploy                              | `CHANGELOG.md` entry, conventional commit, PR, merge, `scripts/auto-deploy.sh` via webhook |
| **Reflect** | Capture surprises                          | `.private/journal.md` session log                                                          |

### Invariants

- **Work that needs an intent gets a file in `docs/intents/<module>/<slug>.md`** (when, statuses and template: `docs/intents/README.md`); `/intent <module>/<slug>` runs its next step, and the `intent-reviewer` subagent checks a branch against its Spec. The repo is public, so host and opsec details stay in `.private/` and are linked by name. A `dropped` intent stays in the tree with its reason, so the idea is not re-raised from scratch; a `shipped` one is deleted unless a living doc cites it (git history keeps it); the journal Backlog points to the intent instead of repeating it.
- **Deployed code is identified by commit SHA, not by a version number.** There is no release cut and no version to bump: `auto-deploy.sh` bakes `GIT_COMMIT` into the backend image and `/api/health/` reports it.
  - The `version` fields in both `package.json` files are inert metadata (both are `private: true`) and **must not be re-coupled into a sync rule**; the `VERSION` file was deleted on 2026-09-28 because nothing read it.
  - Retiring the release number says nothing about API compatibility — `backend/api/` serves blog list and retrieval anonymously, so external consumers cannot be ruled out from this repo.
- **CHANGELOG on Ship**: append the entry under `## Merged since [1.0.0]`; `scripts/check-changelog.sh` warns, never blocks, when a change outside `docs/intents/` has none (`ci.md` › CHANGELOG entry). Do **not** re-section it by date or cut it into releases — there is no measured benefit to pay the reconstruction cost for. `[1.0.0]` stays as a historical record.
- **PR discipline**: one issue per PR, ≤ 3 commits, no mid-PR scope expansion (deferred work → new issue).
- **CI-skip guard**: only the `Sync README Badges` bot may carry the literal; every other commit is rejected by `scripts/check-commit-msg.sh` (Gotcha #10). Escape it to write about it.

### Skip rules

- **Typo / comment / single-line README**: Think → Build → Ship.
- **Hotfix on live bug**: Think → Build → Test → Ship → Reflect.
- **Refactor touching ≥ 3 files or any `Constraints` section (including those moved to `.claude/rules/ci.md` and `frontend-build.md`)**: full 7 phases mandatory.
- **Semver-compatible dependency bump**: Review → Test → Ship.

## Security

- **CI workflows**: Never use `${{ }}` directly inside `run:` blocks — bind to `env:` first, reference as `"$VAR"`. Prevents script injection via branch names. Composite actions `.github/actions/setup-node` and `.github/actions/setup-uv` replace inline setup.
- **Shell scripts**: No `eval` with variables, no `source` of untrusted files (use `read` loop parsing), validate Make variables that reach shell commands.
- **Claude Code guard hooks: `.claude/settings.json` (tracked) runs `.claude/hooks/guard-bash.sh` before every Bash call, and it exits `2` on the commands this file forbids** — `npm audit fix` (#6), removing `frontend/build` itself (Deployment), any push to `dependabot/*` (#15), `git rm` of `.env.production` (#7). The same file denies Read/Edit of `.env`, `backend/.env` and `backend/.env.production`.
  - It matches after removing heredoc bodies and multi-word quoted strings (a quoted single word such as `"frontend/build"` keeps its contents), so a commit message naming a command passes. So do `bash -c "…"` and a heredoc piped to `bash`: a backstop for habit, not a sandbox. It fails open without `jq`.
  - The deny rules cover Claude's file tools and the Bash file commands Claude Code recognizes (`cat`, `head`, `tail`, `sed`, `tee`, and `>`/`<` redirection targets), but not `grep -r` from the directory holding the file or a script that opens it ([permissions](https://code.claude.com/docs/en/permissions)); OS-level blocking needs the sandbox. Patterns must start with `/` (anchored at the project root), not `./` (resolved against the session's current directory).
  - A new "never run X" rule gets a guard plus a block and an adjacent allow case in `.claude/hooks/test-guard-bash.sh`, which `Repo Checks (informational)` runs. `settings.local.json` stays per-machine and gitignored.

## Gotchas

Quick code-level traps that cost time when missed. Each entry: a bold rule, then the fix, the evidence and the commit reference as sub-bullets.

**Index**: #1 VITE\_ prefix · #2 useRef(null) · #3 minimatch override · #4 tsconfig.build excludes test types · #5 DATABASE_URL="" for tests · #6 never npm audit fix (enforced) · #7 frontend/.env.production tracked (enforced) · #8 react/react-dom split bumps · #9 nav selector scoping · #10 CI-skip marker self-skip (enforced) · #11 set -e + cmd substitution · #12 dependabot minor held for review · #13 rolldown lockfile on macOS · #14 tiptap @core single-version · #15 don't rebase dependabot branches (push enforced) · #16 Node major lockstep (2 files) · #17 backend deploy credsStore/launchd trap + commit verify · #18 E2E must build with build:e2e (plain build hits live API) · #19 backend dep names must be lowercase or the uv dependabot ecosystem dies

1. **`VITE_` prefix** for env vars (legacy `REACT_APP_` works via `config/env.ts` shim). Umami uses `VITE_UMAMI_HOST` + `VITE_UMAMI_WEBSITE_ID` (collect API, no external script).
2. **`useRef<T>(null)`** — React 19 requires initial value.
3. **`minimatch>=10.2.1`** override in `package.json` — don't remove.
4. **`tsconfig.build.json`** excludes test types — don't add `@testing-library/jest-dom`.
5. **`DATABASE_URL=""`** for backend tests — a non-empty `DATABASE_URL` in the shell or `backend/.env` points them at PostgreSQL, not SQLite.
6. **Never run `npm audit fix` (or `--force`)** — `--force` downgrades `@lhci/cli` (from `0.15.1`) and destroys Lighthouse CI; the offered `fixAvailable` target moves with the advisory set (`0.1.0`, then `0.12.0`, then `0.3.5` on 2026-10-22).
   - **Expected state (measured 2026-10-23, after `ip-address` 10.7.4)**: `found 0 vulnerabilities`; how each finding went is in `docs/intents/infra/remaining-security-findings.md`. Its two traps: LHCI config must stay `.js` (`js-yaml` `4.3.2`), and `npm update <pkg>` was needed where a plain install left an override `invalid`.
   - **A rising count is not automatically something this repo did** — advisories arrive upstream — and **a regenerated lockfile can drop findings no override or parent bump would**.
   - **"Expected" is not "ignorable" — measure whether each one ships.** `dompurify` (direct dep, the sanitizer guarding `dangerouslySetInnerHTML`) once carried an XSS here (GHSA-55q2-fjhq-7xh7, fixed `3.4.13`). Shipping test: `npm run build && grep -rl <pkg> build/assets/*.js`, and **read the hit** — short names false-match (`tmp` hits highlight.js keywords; `braces` hits a React error string); a sourcemap build (`npx vite build --sourcemap --outDir <tmp>`) and its `sources` list is the exact check.
   - **`npm audit` alone is not the gate** — CI's Trivy counts anything the lockfile does not mark `"dev": true`. After any lockfile write, check per package that everything `npm audit` reports still carries the marker (re-check whenever a finding reappears), and when one does not, run `npm ls <pkg> --omit=dev` before blaming the lockfile: `braces` was counted because `@tailwindcss/typography` sat in `dependencies` and peer-pulled `tailwindcss` into the production graph. Markers have also moved with no manifest change (`37aa60f6`: 779 → 858, back to 784 after three dependabot merges, surfacing `nanoid@3.3.16` as a production HIGH), so assume no direction.
   - **Reach for a parent bump before an override**: overrides that admit the patched version have still failed to take (`nanoid` under `postcss@8.5.25`, `body-parser` under `express`), printing `invalid`; bumping the direct parent (`postcss` → `^8.5.26`) worked. A declared-but-unsatisfied override is worse than none: `npm ls <pkg>` must not print `invalid`, and the installed version must match after `npm ci`. Keep the tested root overrides; any override across a major version needs consumer API tests and build checks.
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
    - The job needs `affected-tests`, `frontend-lint`, `backend-lint` and `docker-images` to succeed (`2ba36943`; the lints since 2026-10-18, the image builds since 2026-10-23), so a patch whose tests, tsc, lint or image build fail stays open. Cite steps by name, not line number — this job is edited often.
    - There is no `--auto`: the repo has `allow_auto_merge: false`. Manual close: `gh pr merge <num> --squash`.
    - **Timing**: all 5 ecosystems run Monday `09:00` `Asia/Seoul` (until 2026-10-12, `04:00` with no `timezone`, which is UTC). **Any edit to `dependabot.yml` triggers an immediate run of every ecosystem**: the schedule change itself filed #554–#568 within 2 minutes, so expect a full queue the same day.
    - **Clearing a held queue: expect conflicts.** Each merge flips the rest to `UNKNOWN` mergeability for 60–90 s — wait it out, and re-check with `git merge-tree --write-tree origin/main <branch>` rather than trusting a stale `CONFLICTING`. Two collision shapes: same-scope siblings (two `@tiptap/*` bumps de-hoist into the same lockfile region, #475/#479), and adjacency (a manifest edit within git's 3-line window of a pending bump conflicts however unrelated the packages, #474). `@dependabot rebase` fixes both (Gotcha #15); never push to the branch yourself.
13. **`npm install` on macOS writes only host-platform `@rolldown/binding-*` to lockfile** (npm #4828) — Apple Silicon yields a single `binding-darwin-arm64` entry; CI on `ubuntu-24.04` then fails with `Cannot find module '@rolldown/binding-linux-x64-gnu'` (vite 8 uses rolldown; vitest shares it).
    - **Fix**: `rm -rf node_modules frontend/node_modules package-lock.json && npm install --include=optional --legacy-peer-deps`, then verify the list contains `binding-linux-x64-gnu`. **Check for that platform, never a total** — the count is upstream-controlled and has moved with vite releases.
    - `--legacy-peer-deps` is needed because `eslint-plugin-jsx-a11y@6.10.2` caps peers at `eslint@^9` while we run `^10`. An incremental `npm install --package-lock-only` that only moves a dependency between sections kept all bindings (2026-10-04). See `f289544`.
14. **Sibling `@tiptap/*` deps on different patches duplicate `@tiptap/core`, and the `overrides` entry is what hides it** — our `^3.x` carets only _permit_ the drift; upstream **exact** pins (`starter-kit` in `dependencies`, six others as exact `peerDependencies`) turn it into nested copies.
    - `overrides."@tiptap/core"` in the root `package.json` (npm ignores a workspace's `overrides`) rewrites those specifiers tree-wide, so a mixed tree can show **one** core while duplicating siblings (measured on `6fecb134`: `extension-list` and `pm` at 3 copies, three others at 2).
    - Fails as either tsc `Type 'Node<any, any>' is not assignable to type 'Node<any, any>'. Two different types ... exist, but they are unrelated.` OR vite build `[MISSING_EXPORT] cancelPositionCheck is not exported by @tiptap/core/dist/index.js`.
    - **Fix**: align ALL `@tiptap/*` direct deps to the same `^3.X.Y` AND set the root `overrides @tiptap/core` to the same `^3.X.Y`. Verify: `npm ls @tiptap/core --all | grep "@tiptap/core@" | sort -u` yields one version and `npm ls @tiptap/core` prints no `invalid` — **and check the sibling inventory too, because a single core is not evidence the rest deduped.**
    - `@tiptap/core` is a direct frontend dep only to pin resolution; `frontend/src` imports nothing from it. See `da9d76c`, `2c41535`.
15. **Don't manually rebase or force-push to `dependabot/*` branches** — GitHub treats non-bot pushes as adversarial and silently closes the PR (`head_sha` → null, state → `closed merged=false`); `gh pr checks` still shows the old green run. Correct path: comment `@dependabot rebase` and let the bot push. After a close cascade, recover by bundling the bumps into one direct-to-main commit with `Closes #NNN` lines. See `09a47e9`.
16. **Node major version must move in lockstep across two files**: `.github/actions/setup-node/action.yml` `node-version: "N"` and `scripts/setup-dev-machine.sh` (brew `node@N` and its `-ge N` check); the root `package.json` `engines.node` floor (`>=N.0.0`) follows them. Bumping one alone creates "works on my machine, fails in CI" drift. No toolchain Dockerfile pins Node since the Docker dev environment, the third copy, was deleted on 2026-10-18; `docker/umami/Dockerfile`'s `node:22-alpine` is Umami's own build base and stays out of this lockstep.
17. **A backend deploy can silently ship stale code — verify by commit, never by a bare `200`** — `curl https://emelmujiro.com/api/health/` returns a `"commit"` baked into the image via the `GIT_COMMIT` build arg, and `auto-deploy.sh` fails the deploy when it does not match the SHA it was told to deploy.
    - **A green pipeline is not proof of a deploy**: a `200` passes against a stale container, and `Deploy to Mac Mini` is `continue-on-error` and green on trigger-accept.
    - The deploy takes its SHA from CI (`DEPLOY_SHA`) and refuses anything not an ancestor of `origin/main`, so **`main` legitimately sits ahead of production between runs** — `deploy-drift-check.yml` closes that.
    - The Docker Desktop credential-helper traps behind this rule, the `DOCKER_CONFIG` workaround, and the measured SHA mismatches are in `.private/operations.md`; re-verify after any Docker Desktop update. See `7d297b61`, `61c60456`, `15ae9951`.
18. **Building the E2E bundle with `npm run build` sends test traffic to the LIVE backend** — a production build inlines `VITE_API_URL=https://api.emelmujiro.com/api/` from `frontend/.env.production` (tracked, Gotcha #7), so the app makes absolute API calls and bypasses `e2e-server.mjs`'s `/api` proxy.
    - It showed up as 7 × `Not Found: /api/blog-posts/nonexistent-post-id-99999/` in the backend log, the fixture in `e2e/error-states.spec.ts`. It never reaches the frontend nginx log, because `api.emelmujiro.com` is a separate tunnel route straight to the backend.
    - **Fix**: `webServer` runs `npm run build:e2e` (`VITE_API_URL=/api VITE_ENABLE_ANALYTICS=false npm run build`); the deploy build stays plain `npm run build`.
    - **Verify by observing requests, not by grepping the bundle** — `api.emelmujiro.com` stays in the output as the default argument of `getEnvVar('REACT_APP_API_URL', …)` in `config/env.ts`. See `971b5b4c`.
19. **A capitalized dependency name in `backend/pyproject.toml` silently kills the whole `uv` dependabot ecosystem** — dependabot normalizes names per PEP 503 (lowercase) and matches the manifest case-sensitively, so `"Django==6.0.4"` was never rewritten, and its `uv lock --upgrade-package django==<new>` then failed with `dependency_file_not_resolvable`.
    - Every scheduled `uv in /backend` full run failed while the capital-D pin stood (2026-08-17, 08-24, 08-31), and the first run after the fix produced #483 and #485.
    - It hid because a failed run opens no PR: the only signal is a red `Dependabot Updates` run nothing notifies on, and the green `uv in /backend for <dep>` runs beside it are refresh jobs for open PRs.
    - **Fix**: lowercase the name in `pyproject.toml`. `uv.lock` does not move — confirm with `md5 -q backend/uv.lock` before and after plus `uv lock --check`, and do **not** run bare `uv lock`, which can churn unrelated entries.

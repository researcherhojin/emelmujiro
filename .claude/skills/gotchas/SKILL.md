---
name: gotchas
description: Evidence and exact fix steps for the numbered Gotchas in CLAUDE.md. Read the matching section before a dependency bump or Dependabot PR, an npm audit or Trivy finding, a react, tiptap, rolldown or Node bump, a backend deploy check, an E2E build, a CI-skip marker question, or an E2E nav selector.
---

# Gotcha details

Each section holds the sub-bullets of the CLAUDE.md Gotcha with the same number, moved verbatim on 2026-10-23. The bold rule itself stays in CLAUDE.md and is repeated here as the heading line. Edit details here and the rule there; never renumber.

## #6

6. **Never run `npm audit fix` (or `--force`)** — `--force` downgrades `@lhci/cli` (from `0.15.1`) and destroys Lighthouse CI; the offered `fixAvailable` target moves with the advisory set (`0.1.0`, then `0.12.0`, then `0.3.5` on 2026-10-22).
   - **Expected state (measured 2026-10-24, after `zod` 4.6.7 and `body-parser` 1.20.9)**: `found 0 vulnerabilities`; how each finding went is in `docs/intents/infra/remaining-security-findings.md`. Its three traps: LHCI config must stay `.js` (`js-yaml` `4.3.2`), `npm update <pkg>` was needed where a plain install left an override `invalid`, and the `chromium-bidi` → `zod` 4 override turns invalid BiDi input into a `TypeError`.
   - **A rising count is not automatically something this repo did** — advisories arrive upstream — and **a regenerated lockfile can drop findings no override or parent bump would**.
   - **"Expected" is not "ignorable" — measure whether each one ships.** `dompurify` (direct dep, the sanitizer guarding `dangerouslySetInnerHTML`) once carried an XSS here (GHSA-55q2-fjhq-7xh7, fixed `3.4.13`). Shipping test: `npm run build && grep -rl <pkg> build/assets/*.js`, and **read the hit** — short names false-match (`tmp` hits highlight.js keywords; `braces` hits a React error string); a sourcemap build (`npx vite build --sourcemap --outDir <tmp>`) and its `sources` list is the exact check.
   - **`npm audit` alone is not the gate** — CI's Trivy counts anything the lockfile does not mark `"dev": true`. After any lockfile write, check per package that everything `npm audit` reports still carries the marker (re-check whenever a finding reappears), and when one does not, run `npm ls <pkg> --omit=dev` before blaming the lockfile: `braces` was counted because `@tailwindcss/typography` sat in `dependencies` and peer-pulled `tailwindcss` into the production graph. Markers have also moved with no manifest change (`37aa60f6`: 779 → 858, back to 784 after three dependabot merges, surfacing `nanoid@3.3.16` as a production HIGH), so assume no direction.
   - **Reach for a parent bump before an override**: overrides that admit the patched version have still failed to take (`nanoid` under `postcss@8.5.25`, `body-parser` under `express`), printing `invalid`; bumping the direct parent (`postcss` → `^8.5.26`) worked. A declared-but-unsatisfied override is worse than none: `npm ls <pkg>` must not print `invalid`, and the installed version must match after `npm ci`. Keep the tested root overrides; any override across a major version needs consumer API tests and build checks.

## #7

7. **`frontend/.env.production` is intentionally tracked in git** — `.gitignore` line 5 has `!frontend/.env.production` (negation pattern). Do **not** `git rm` it — it's load-bearing for `scripts/auto-deploy.sh`.
   - Every `VITE_*` is inlined into the public client bundle at build time, so `VITE_UMAMI_HOST` / `VITE_SENTRY_DSN` / `VITE_API_URL` are all **public by design** (DevTools shows them on any page load).
   - Asymmetry is deliberate: `backend/.env.production` = real server-side secrets → gitignored; `frontend/.env.production` = compile-time public config → tracked.

## #8

8. **Dependabot does NOT bump react and react-dom together** — its pairing of a package with its `@types/*` companion covers `react-dom` + `@types/react-dom`, not `react`, and no `react*` group exists on the surviving `/` npm ecosystem. Vitest then crashes with `Incompatible React versions`.
   - **Fix**: `cd frontend && npm install react-dom@<matching-version> && cd .. && git add frontend/package.json package-lock.json && git commit -m "fix(deps): bump react-dom to match react"`.
   - **Prevent**: check `react`/`react-dom` parity in `frontend/package.json` after any react merge; this recurred on #430, so the review step alone is unreliable.
   - **Diagnosing it**: the red PRs are the _other_ ones — a broken `main` fails `Test Affected Code`, `E2E Tests` and `Lighthouse CI` on every branch cut from it, with vitest reporting `65 failed (65)` / `no tests` because collection aborts. A de-hoisted `vitest` produces the same signature (`1f5356ea`), so read the error above the summary, and check `main` before touching the PR. See `8ab71fe`, `9353aae3`.

## #9

9. **E2E nav selectors must scope to `<nav aria-label="Main navigation">`** — Korean nav labels (`강의이력`, `인사이트`, `문의하기`) appear in BOTH top navbar AND the footer's `메뉴 목록`, so a bare `getByRole('button', { name: '강의이력' })` hits Playwright strict-mode and fails.
   - Use `openNav(page, isMobile, lang)` from `e2e/helpers.ts` rather than re-deriving it: it scopes to the landmark AND opens the mobile sheet, which is required below `md` where the desktop nav is `hidden md:flex` and `handleNavigation` closes the sheet after every navigation (so a multi-hop mobile flow reopens it per click).
   - `NAV_LABELS` there holds the ko/en label pair, and `swipeHorizontal` synthesizes a cross-engine touch swipe — the `Touch`/`TouchEvent` constructors are Chromium-only and WebKit raises `TypeError: Illegal constructor`.

## #10

10. **A CI-skip marker in a commit message body causes self-skip — now rejected by `scripts/check-commit-msg.sh`** — GitHub Actions parses the **entire** commit message (subject + body) for all five markers (`[skip ci]`, `[ci skip]`, `[no ci]`, `[skip actions]`, `[actions skip]`), so documenting the mechanism in prose skips CI for that commit.
    - It happened 10 times on `main` before the guard, including `66cef64b`, the commit that fixed the deploy path.
    - The guard scans the whole message **before** the merge/autosquash/revert/dependabot exemptions, so a generated subject cannot carry one through. Escape to write about it (`\[skip ci\]`); `git commit --no-verify` is the escape for genuine skip intent.
    - The `Sync README Badges` bot is exempt **by shape, not exact text** — `chore(readme):` scope, marker as the final subject token, no body — because its message has changed twice and an exact pin would redden the bot on the next edit.

## #12

12. **`Auto-Merge Dependabot` job auto-merges only `semver-patch`** — `pr-checks.yml`'s `Merge patch updates` step runs a retried bare `gh pr merge --squash` only for `version-update:semver-patch`; patch + minor are auto-approved by `Auto-approve patch and minor updates`, and minor + major are **held for human review**.
    - The job needs `affected-tests`, `frontend-lint`, `backend-lint` and `docker-images` to succeed (`2ba36943`; the lints since 2026-10-18, the image builds since 2026-10-23), so a patch whose tests, tsc, lint or image build fail stays open. Cite steps by name, not line number — this job is edited often.
    - There is no `--auto`: the repo has `allow_auto_merge: false`. Manual close: `gh pr merge <num> --squash`.
    - **Timing**: all 5 ecosystems run Monday `09:00` `Asia/Seoul` (until 2026-10-12, `04:00` with no `timezone`, which is UTC). **Any edit to `dependabot.yml` triggers an immediate run of every ecosystem**: the schedule change itself filed #554–#568 within 2 minutes, so expect a full queue the same day.
    - **Clearing a held queue: expect conflicts.** Each merge flips the rest to `UNKNOWN` mergeability for 60–90 s — wait it out, and re-check with `git merge-tree --write-tree origin/main <branch>` rather than trusting a stale `CONFLICTING`. Two collision shapes: same-scope siblings (two `@tiptap/*` bumps de-hoist into the same lockfile region, #475/#479), and adjacency (a manifest edit within git's 3-line window of a pending bump conflicts however unrelated the packages, #474). `@dependabot rebase` fixes both (Gotcha #15); never push to the branch yourself.

## #13

13. **`npm install` on macOS writes only host-platform `@rolldown/binding-*` to lockfile** (npm #4828) — Apple Silicon yields a single `binding-darwin-arm64` entry; CI on `ubuntu-24.04` then fails with `Cannot find module '@rolldown/binding-linux-x64-gnu'` (vite 8 uses rolldown; vitest shares it).
    - **Fix**: `rm -rf node_modules frontend/node_modules package-lock.json && npm install --include=optional --legacy-peer-deps`, then verify the list contains `binding-linux-x64-gnu`. **Check for that platform, never a total** — the count is upstream-controlled and has moved with vite releases.
    - `--legacy-peer-deps` is needed because `eslint-plugin-jsx-a11y@6.10.2` caps peers at `eslint@^9` while we run `^10`. An incremental `npm install --package-lock-only` that only moves a dependency between sections kept all bindings (2026-10-04). See `f289544`.

## #14

14. **Sibling `@tiptap/*` deps on different patches duplicate `@tiptap/core`, and the `overrides` entry is what hides it** — our `^3.x` carets only _permit_ the drift; upstream **exact** pins (`starter-kit` in `dependencies`, six others as exact `peerDependencies`) turn it into nested copies.
    - `overrides."@tiptap/core"` in the root `package.json` (npm ignores a workspace's `overrides`) rewrites those specifiers tree-wide, so a mixed tree can show **one** core while duplicating siblings (measured on `6fecb134`: `extension-list` and `pm` at 3 copies, three others at 2).
    - Fails as either tsc `Type 'Node<any, any>' is not assignable to type 'Node<any, any>'. Two different types ... exist, but they are unrelated.` OR vite build `[MISSING_EXPORT] cancelPositionCheck is not exported by @tiptap/core/dist/index.js`.
    - **Fix**: align ALL `@tiptap/*` direct deps to the same `^3.X.Y` AND set the root `overrides @tiptap/core` to the same `^3.X.Y`. Verify: `npm ls @tiptap/core --all | grep "@tiptap/core@" | sort -u` yields one version and `npm ls @tiptap/core` prints no `invalid` — **and check the sibling inventory too, because a single core is not evidence the rest deduped.**
    - `@tiptap/core` is a direct frontend dep only to pin resolution; `frontend/src` imports nothing from it. See `da9d76c`, `2c41535`.

## #17

17. **A backend deploy can silently ship stale code — verify by commit, never by a bare `200`** — `curl https://emelmujiro.com/api/health/` returns a `"commit"` baked into the image via the `GIT_COMMIT` build arg, and `auto-deploy.sh` fails the deploy when it does not match the SHA it was told to deploy.
    - **A green pipeline is not proof of a deploy**: a `200` passes against a stale container, and `Deploy to Mac Mini` is `continue-on-error` and green on trigger-accept.
    - The deploy takes its SHA from CI (`DEPLOY_SHA`) and refuses anything not an ancestor of `origin/main`, so **`main` legitimately sits ahead of production between runs** — `deploy-drift-check.yml` closes that.
    - The Docker Desktop credential-helper traps behind this rule, the `DOCKER_CONFIG` workaround, and the measured SHA mismatches are in `.private/operations.md`; re-verify after any Docker Desktop update. See `7d297b61`, `61c60456`, `15ae9951`.

## #18

18. **Building the E2E bundle with `npm run build` sends test traffic to the LIVE backend** — a production build inlines `VITE_API_URL=https://api.emelmujiro.com/api/` from `frontend/.env.production` (tracked, Gotcha #7), so the app makes absolute API calls and bypasses `e2e-server.ts`'s `/api` proxy.
    - It showed up as 7 × `Not Found: /api/blog-posts/nonexistent-post-id-99999/` in the backend log, the fixture in `e2e/error-states.spec.ts`. It never reaches the frontend nginx log, because `api.emelmujiro.com` is a separate tunnel route straight to the backend.
    - **Fix**: `webServer` runs `npm run build:e2e` (`VITE_API_URL=/api VITE_ENABLE_ANALYTICS=false npm run build`); the deploy build stays plain `npm run build`.
    - **Verify by observing requests, not by grepping the bundle** — `api.emelmujiro.com` stays in the output as the default argument of `getEnvVar('REACT_APP_API_URL', …)` in `config/env.ts`. See `971b5b4c`.

## #19

19. **A capitalized dependency name in `backend/pyproject.toml` silently kills the whole `uv` dependabot ecosystem** — dependabot normalizes names per PEP 503 (lowercase) and matches the manifest case-sensitively, so `"Django==6.0.4"` was never rewritten, and its `uv lock --upgrade-package django==<new>` then failed with `dependency_file_not_resolvable`.
    - Every scheduled `uv in /backend` full run failed while the capital-D pin stood (2026-08-17, 08-24, 08-31), and the first run after the fix produced #483 and #485.
    - It hid because a failed run opens no PR: the only signal is a red `Dependabot Updates` run nothing notifies on, and the green `uv in /backend for <dep>` runs beside it are refresh jobs for open PRs.
    - **Fix**: lowercase the name in `pyproject.toml`. `uv.lock` does not move — confirm with `md5 -q backend/uv.lock` before and after plus `uv lock --check`, and do **not** run bare `uv lock`, which can churn unrelated entries.

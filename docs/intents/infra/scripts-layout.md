---
status: in-progress
module: infra
created: 2026-10-29
updated: 2026-10-29
---

# `scripts/` is organized by purpose, with nothing loose at the top level

<!-- cspell:ignore bootout -->

## Intent

- **Problem**: as of `4054d1ec`, `scripts/` held 25 loose files at its top level beside six folders. They were shell, Python and TypeScript entries for deploy, security, backup, CI checks and local setup. Three names used underscores, the rest hyphens. A local `scripts/__pycache__` kept reappearing in the editor, written by the backup test's `importlib` load.
- **Outcome wanted**: the top level holds only `package.json` and `tsconfig.json`. Every script sits in a purpose folder, and every caller, inside the repo and on both machines, uses the new path.
- **Affected systems**:
  - Repo: 27 referencing files.
  - Host: the webhook launchd plist and 3 crontab lines (`health-check.sh`, `scheduled-security.ts`, `refresh-images.ts`).
  - MacBook: the `com.emelmujiro.backup-pull` LaunchAgent (`pull-backup.py`).
- **Constraints**:
  - A merged move cannot deploy itself. The running `auto-deploy.sh` switches the checkout mid-run, then calls `scripts/verify-runtime.ts` by its old path. The running webhook also holds the old `auto-deploy.sh` path.
  - Gotcha #7 (`frontend/.env.production` stays tracked; only its comment changes).
- **Open questions**: none. On 2026-10-29 the owner approved the layout, the hyphenated names and the host sequence.

## Spec

- **Approach**: `git mv` into `deploy/`, `security/`, `maintenance/`, `backup/`, `repo/` and `dev/`. Rewrite every reference with one mapping, then fix the self-relative roots and imports.
  - Rejected: leaving shims at the old paths. They would bring the clutter back.
- **Out of scope**: script behavior, and `frontend/scripts/`.
- **Done when**:
  1. `git ls-files scripts` shows no file at the top level except `package.json` and `tsconfig.json`.
  2. A grep for the 25 old paths, outside `CHANGELOG.md` and history notes, finds nothing.
  3. `check:scripts` passes 61/61, the Python test is OK, and `bash -n` passes for every script.
  4. Each moved CLI runs by its new path: husky commit-msg, changelog check and its cases, i18n keys, ports, `sync-private dry`, `check-machine-sync`, badge sync, `update-test-counts`, `security:dependencies`, `security:report`, and `make verify-setup`.
  5. CI is green.
  6. Host:
     - The webhook is stopped before the merge.
     - After the merge: the checkout moves to the merge commit, the plist runs `scripts/deploy/deploy-webhook.ts` (the stale `.js` argument is dropped), and the restart passes `/health` 200, an unauthenticated POST returning 401, and the `listening` line.
     - The 3 crontab lines name the new paths, and no old line remains.
     - A deploy through the new chain completes, and `/api/health/` reports the merge commit.
  7. MacBook: the LaunchAgent runs `scripts/backup/pull-backup.py` and completes one run.

## Plan

1. Move, remap and fix the roots, then run Done-when 1–4 locally.
2. PR and CI.
3. Stop the host webhook (`launchctl bootout`), merge, then `git merge --ff-only` on the host.
4. Rewrite the plist `ProgramArguments`, then bootstrap and verify.
5. Replace the 3 crontab lines by exact old-path match and verify.
6. Deploy with `node scripts/maintenance/maintenance.ts deploy`, using `DEPLOY_SHA` set to the merge commit.
7. Switch the MacBook LaunchAgent and kickstart it.

## Outcome

<!-- Filled when status becomes shipped. -->

---
status: in-progress
module: infra
created: 2026-10-29
updated: 2026-10-29
---

# Operational scripts share one implementation of each repeated mechanism

<!-- cspell:ignore EEXIST ESRCH -->

## Intent

- **Problem**: as of `2b69cc5a` (2026-10-29), `scripts/` has its domain modules (`deploy/`, `security/`, `maintenance/`, `shared/`), but three mechanisms are still written out by hand where they are used:
  - **Stale-PID lock.** The takeover lock (write with `wx`, on `EEXIST` probe the PID with `kill(pid, 0)`, retake on `ESRCH`) appears twice: `scheduled-security.ts:19-34` and `scan-running-images.ts:12-28`. It differs only in its error messages. It is not `maintenance/lock.ts`, which by design never steals.
  - **Maintenance entry.** "Re-exec under `maintenance.ts <op>` without `MAINTENANCE_TOKEN`, else require `maintenance.ts check`" appears twice: `scheduled-security.ts:8-14` and `refresh-images.ts:8-14`.
  - **Private files.** 8 `mkdirSync(…, { mode: 0o700 })` and 14 `writeFileSync(…, { mode: 0o600 })` calls in non-test modules. Three of the writes are a temp-file-plus-rename atomic write: `security/images.ts:109-111`, `security/operations.ts:110-112`, `maintenance/refresh.ts:265-267`.
- **Outcome wanted**: each mechanism lives once under `scripts/shared/` with unit tests, and every caller behaves exactly as before. That covers lock files, messages, exit codes, file modes and output paths.
- **Affected systems**: the two host cron entries (`scheduled-security.ts` at 02:00 and `refresh-images.ts` at 00:30 KST) and `npm run security:images`. Their paths do not change, so the host crontab and `Makefile` stay untouched.
- **Constraints**:
  - The `maintenance.lock` never-steal rule (`ci.md` › Nightly image refresh).
  - Erasable TypeScript only (Node 24 type stripping).
  - `npm run check:scripts` is the gate.
- **Open questions**: none.

## Spec

- **Approach**:
  - `shared/pid-lock.ts`: `withPidLock(file, messages, fn)`. It takes the lock, takes over a dead owner's lock, runs `fn` and always releases. Each caller passes its current messages unchanged.
  - `shared/maintenance-entry.ts`: `enterMaintenance(operation)`. It re-execs with the same exit-status mapping, or runs `check` and exits `1` on failure.
  - `shared/private-fs.ts`: `ensurePrivateDir`, `writePrivate` and `writePrivateAtomic`, which keeps the caller's temp-file name and the rename.
  - Rejected: moving entry files into folders. Their paths are in the host crontab, `Makefile`, `package.json` and tests, and moving them buys nothing.
  - Rejected: rewriting the shell and Python scripts. They are separate languages with their own test scripts, and that is a different change.
- **Files and interfaces**:
  - New: `scripts/shared/{pid-lock,maintenance-entry,private-fs}.ts` and `scripts/tests/shared.test.ts`.
  - Callers: `scheduled-security.ts`, `scan-running-images.ts`, `refresh-images.ts`, `security/{images,operations,dependencies}.ts`, `maintenance/{refresh,lock}.ts`, `maintenance.ts`.
  - Unchanged: entry paths and every `npm run security:*` name.
- **Out of scope**: shell and Python scripts, behavior changes, and the per-entry `PATH` prefixes, which differ on purpose.
- **Done when**:
  1. `npm run check:scripts` passes, with new tests for the takeover, busy, invalid-PID and release paths, the private-file modes, and the atomic write.
  2. `grep` finds no inline `flag: 'wx'` takeover and no `MAINTENANCE_TOKEN` re-exec outside `shared/`. Every remaining `0o600` and `0o700` literal outside `shared/` has a stated reason.
  3. `knip` is no worse than on `main`, and spell passes.
  4. CI is green.
  5. End-to-end on the host after deploy:
     - `npm run security:images` takes and releases `scan.lock`, with the same summary output.
     - The host job `scheduled-security.ts` runs through `enterMaintenance` and the PID lock, reporting all checks true.
     - The 00:30 refresh is not run by hand. Its entry path shares `enterMaintenance`, which this run exercises, and the next nightly `refresh/latest.json` is checked.

## Plan

- **Changes**:
  1. Add the three `shared/` modules and `tests/shared.test.ts`.
  2. Move the two entry duplicates (lock, maintenance entry) onto them.
  3. Move every private-file write that matches `writePrivate`/`writePrivateAtomic` onto them.
- **Literals kept, each with a reason**:
  - `fs.openSync(…, 'w', 0o600)`: a log file descriptor (`refresh-images.ts`, `security/operations.ts`).
  - `flag: 'wx'`: exclusive create for the never-steal lock (`maintenance/lock.ts`).
  - Non-recursive `mkdirSync(work, { mode: 0o700 })`: the per-run directory must be new (`maintenance/refresh.ts`).
  - `MAINTENANCE_TOKEN` in `maintenance.ts`: the wrapper that sets and checks it.
- **Risks**: a copied-file test fixture misses a new import. This happened once: `maintenance-lock.test.ts` copies selected files and needed `shared/private-fs.ts`.
- **Verification**: Done-when 1–5.

## Outcome

<!-- Filled when status becomes shipped or dropped. -->

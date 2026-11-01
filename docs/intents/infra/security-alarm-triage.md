---
status: in-progress
module: infra
created: 2026-11-01
updated: 2026-11-01
---

<!-- cspell:ignore unsandboxed sandboxed npmjs EPERM Dockerfiles fsmonitor netrc -->

# A failed dependency or image scan arrives with a draft fix PR

## Intent

- **Problem**: every security alarm so far needed the same manual triage before any fix could start: read the private host report, find the false boolean, reproduce the finding locally, and decide between an upgrade, an override and an expiring ignore. Five alarms in nine days took that path: #660, #673, #689, #705 and #713 (`security-operations.md` › Alarm history). The GitHub issue is generic by design, so nothing outside the host can start that triage.
- **Outcome wanted**: when the 02:00 report has `dependencies` or `images` false, a headless Claude Code run on the deploy host diagnoses it from the report and opens a **draft** PR that the owner reviews. The diagnosis stays in a private file on the host.
- **Affected systems**: `scripts/security/` (new trigger entry), host crontab (one new line), `.claude/rules/ci.md` › Scheduled security operations, `.private/operations.md` (token custody, linked by name only).
- **Constraints**:
  - The repo is public. Issue bodies and workflow logs never carry package inventories or host details. A PR may name packages and advisory IDs, as #714 did.
  - The production checkout serves `auto-deploy.sh` and holds `backend/logs/maintenance.lock`, so triage never edits it.
  - Risk acceptance (a `trivyignore` entry, a dismissed alert) is the owner's decision (`security-operations.md` › Lessons).
  - Gotcha #6 (never `npm audit fix`) and #13 (rolldown bindings) apply to any lockfile the agent writes. `guard-bash.sh` enforces #6.
- **Measured on 2026-11-01 (read-only over SSH)**:
  - Claude Code `2.1.288` is installed at `~/.local/bin/claude`. Its credentials are in the login Keychain and there is no `.credentials.json`. Cron may not be able to read the Keychain, the same trap as Gotcha #17.
  - The host `gh` token is invalid. SSH to `git@github.com` authenticates.
  - Five crontab lines are present: health check, security 02:00, refresh 00:30, and two 03:xx jobs.
- **Decided with the owner on 2026-11-01**:
  - Claude auth: a long-lived `claude setup-token` OAuth token, injected as `CLAUDE_CODE_OAUTH_TOKEN`.
  - GitHub auth: a fine-grained PAT for this repository only (Contents RW, Pull requests RW, Issues read), with an expiry, injected as `GH_TOKEN`. The host-wide `gh` login stays untouched.
  - Both tokens live in 0600 files outside the repository and outside `.private` sync. Their paths are recorded in `.private/operations.md`.

## Spec

- **Approach**:
  - Add a new cron line at 02:40, after the 02:00 job, that runs `scripts/security/triage-alarm.ts`.
  - The script exits 0 without starting Claude in these cases:
    - `operations.json` has both `dependencies` and `images` true.
    - Its `completedAt` is older than 6 h.
    - Its `completedAt` equals the one in the last triage's state file, so one report is triaged once.
    - The maintenance lock is held.
  - Otherwise the script does the following, in order:
    1. Refreshes a dedicated clone (`~/workspace/emelmujiro-triage`, not a worktree of production) to `origin/main`.
    2. Runs `claude -p` with a fixed prompt file, `--max-turns`, and an explicit `--allowedTools` list.
    3. Records the result in a private state file.
  - The prompt follows the #713 procedure:
    1. Read the report and the scan JSON (paths passed in).
    2. Reproduce the finding with `scripts/security/dependencies.ts`.
    3. Fix it by upgrade or override.
    4. Run lint, type-check, tests and the scanner.
    5. Write the diagnosis to the private triage directory.
    6. Push a `triage/<date>` branch and open a draft PR.
  - Where only an ignore would clear a finding, the agent writes that in the diagnosis and does not add the entry.
  - Rejected options:
    - Chaining from `scheduled-security.ts`. That job holds the maintenance lock and gates backups, and a long agent run inside it would delay or overlap the 03:xx jobs.
    - GitHub Actions or a cloud routine. Neither can read the host report.
    - A worktree of the production checkout. It shares `.git` and the host's `node_modules` state with the deploy path.
- **Files and interfaces**:
  - `scripts/security/triage-alarm.ts`: the trigger, gating and spawn.
  - `scripts/tests/triage-alarm.test.ts` (picked up by `check:scripts`'s `scripts/tests/*.test.ts` glob): node --test cases for every skip condition and for the spawned argv. Claude is stubbed with a fake binary.
  - `scripts/security/triage-prompt.md`: the fixed prompt. It contains no host paths beyond those the script passes in.
  - `Makefile` target `setup-triage-cron`, idempotent like `setup-security-cron`.
  - `.claude/rules/ci.md` › Scheduled security operations gains one sentence.
  - Superseded by Plan › Departures 1–3. The PR uses `GH_TOKEN` only in the spawned environment. The allowed tools are Read, Grep, Glob, Edit and Write within the clone, plus `Bash(npm ci*, npm install --package-lock-only*, npm run *, npx eslint*, node scripts/security/*, git switch/add/commit/push origin triage/*, gh pr create --draft*, gh issue list*)`.
  - Denied: `docker`, `gh pr merge`, `git push` to `main`, `ssh`, and reads of `.env*`. The repo's `guard-bash.sh` still applies.
- **Out of scope**:
  - `backup`, `offsite` and `refresh` failures. They need host state, not a code change, and remain manual.
  - Dependabot PR triage. It was deferred, so revisit it after this runs on real alarms.
  - Merging, deploying, rerunning the host job, and adding `trivyignore` entries all stay with the owner.
  - The `analyze:bundle` source-map problem found in #713 is a separate issue.
- **Done when**:
  1. `npm run check:scripts` passes, including new tests that cover each skip condition and the exact argv and allowlist passed to `claude`.
  2. On the host, `crontab -l` shows exactly one `triage-alarm.ts` line, and the other five lines are unchanged.
  3. A run of the cron command against the current all-true report exits 0, starts no `claude`, and writes no state change.
  4. In a cron-equivalent environment (`env -i` with the cron `PATH`), `claude -p "reply ok"` succeeds using the token file. This proves the Keychain trap is avoided.
  5. End to end: point the script at a fixture report with `dependencies` false and a scan JSON naming one real outdated test package, on a throwaway branch target. It must produce a draft PR whose head is `triage/*`, a private diagnosis file, and no commit to `main`. Then close the PR and delete the branch.

## Plan

- **Changes**, in order:
  1. Owner actions, done before code, with their paths recorded in `.private/operations.md`:
     - Run `claude setup-token` on the host and save the token to a 0600 file.
     - Create the fine-grained PAT (this repository only; Contents RW, Pull requests RW, Issues read; with an expiry) and save it to a second 0600 file.
  2. `scripts/security/triage-alarm.ts`:
     - A pure `decide(report, state, now, lockHeld)` that returns `skip:<reason>` or `run`.
     - A `runTriage()` that refreshes the clone (`git fetch` then `git reset --hard origin/main`, clone only), then spawns `claude` with a fixed argv and an env that holds only `PATH`, `HOME`, the two tokens and `TRIAGE_*` paths.
     - Writes a 0600 state file `{completedAt, startedAt, exitCode}` under `backend/logs/security/triage/`, using `scripts/shared/private-fs.ts`.
     - Reuses `pid-lock.ts` so two runs never overlap.
     - Reads the maintenance lock only to skip; it never takes it, because triage does not touch production.
  3. `scripts/security/triage-prompt.md`: the #713 procedure as numbered steps, the no-ignore rule, Gotchas #6 and #13, and the instruction to write the diagnosis to `$TRIAGE_DIAGNOSIS` and the PR to `--draft`.
  4. `scripts/tests/triage-alarm.test.ts`:
     - One `decide` case per skip condition, plus the run case.
     - An argv/env snapshot for the spawn, using a stub `claude` script that records its arguments.
  5. `Makefile` `setup-triage-cron`, modelled on `setup-security-cron` (lines 171-181): grep out its own line, then append `40 2 * * *`. `knip` lists the new entry if it flags it.
  6. Docs:
     - `.claude/rules/ci.md` › Scheduled security operations: one sentence.
     - `CHANGELOG.md` entry.
  7. Host:
     - Clone `~/workspace/emelmujiro-triage` and run `npm ci --legacy-peer-deps` there.
     - Run `make setup-triage-cron` from the production checkout after deploy.
- **Risks**:
  - **Keychain or token failure under cron**: `claude` exits non-zero with an auth error. The state file records the exit code, and Done-when check 4 catches it before go-live.
  - **Allowlist too narrow**: the run ends without a PR, and the diagnosis file shows which command was refused. Widen the allowlist only by named command, never to `Bash(*)`.
  - **Agent edits beyond scope**: the PR stays a draft and needs the owner's merge. `guard-bash.sh` and the deny list block `npm audit fix`, `docker` and pushes to `main`.
  - **A runaway or slow run overlaps the 03:xx jobs**: cap it with `--max-turns` and a wall-clock timeout in `runTriage()` (kill after 45 min). The clone has its own `node_modules`, so the production Docker jobs are unaffected.
  - **The PAT expires silently**: `gh pr create` fails and the diagnosis still lands. Record the expiry date in `.private/operations.md` and the journal Backlog.
- **Departures** (implementation, 2026-11-01). Each one comes from the intent-reviewer finding or the host measurement named in it:
  1. **The agent holds no GitHub credential and does not commit.**
     - The review found that bare Edit/Write plus `npm run` let the agent run arbitrary code with `GH_TOKEN` in its environment, and the pre-push hook, the only guard on `main`, fell to `--no-verify`.
     - The agent now only edits the working tree and writes `pr.md`. Its `.git` is read-only even inside the sandbox: a sandboxed node script got `EPERM` on `.git/config`, `refs/remotes/origin/main` and `.git/hooks`.
     - `publish()` runs outside the agent. It checks the following:
       - every changed path, including untracked files and both sides of a rename (`--no-renames`), is on an allowlist: manifests, lock files, Dockerfiles, `docker-compose.yml`, Umami patches and `CHANGELOG.md`;
       - `HEAD` still equals the base SHA recorded before the agent ran;
       - `pr.md` has a title.
     - It then commits through the commit-msg hook and pushes through the pre-push hook, both read from this checkout and forced with `-c core.hooksPath` and `core.fsmonitor=false` on every git call. Last it runs `gh pr create --draft` with the token in its own environment.
     - The advisor's review replaced a denylist: that list allowed scanner code (`scripts/security/dependencies.ts`) and blocked the nginx pin in `docker-compose.yml`.
  2. **Bash runs in Claude Code's OS sandbox**, with settings generated per run so that no host path is committed:
     - `failIfUnavailable`, no unsandboxed retry, and no auto-allow, so the allowlist still gates every command.
     - Reads denied: `~/.ssh`, the token directory, `~/.config/gh`, the Keychains, the production `.env*`, `.private` and `backend/logs`.
     - Writes only to the clone, the per-user temp directory, `~/.npm` and the Trivy cache.
     - Network only to `registry.npmjs.org` and `mirror.gcr.io` (strict allowlist), plus local binding for `check:scripts`' webhook tests.
     - `CLAUDE_CODE_SUBPROCESS_ENV_SCRUB=1` plus `credentials.envVars` keep the OAuth token out of Bash.
     - File tools are scoped with `Read(//clone/**)`, `Edit(//clone/**)` and `Edit(//run/**)`, and `.git/**` and `input/**` are denied. `Write(path)` rules never match, so Edit rules govern Write.
  3. **Run directories moved to `~/.local/state/emelmujiro-triage/runs`.** Under `backend/logs` the agent's own Read deny blocked its input (run 4). State, lock and cron log stay under `backend/logs`.
  4. **The prompt lists the allowed command forms** (no `cd`, pipes or `cat`). In run 1 the agent hit one refused `cd … | head` and stopped. Every run after the change completed with 0 refusals.
  5. **Done when 5 ran against a clean `main`**, so the correct outcome was a diagnosis and no PR. Its last fixture run under the sandbox finished with 0 refusals in 55 s, with all five scan targets at 0. The PR path was exercised against GitHub instead. Each PR was closed at once:
     - #715: hook and token, by hand.
     - #716: an earlier `publish()`.
     - #717: the final design. The sandboxed agent edited `CHANGELOG.md` and wrote `pr.md`, and `publish()` committed under the noreply identity, passed both hooks and opened a draft.
  6. **Boundary probe, 2026-11-01, real argv, env and settings.**
     - Refused (7):
       - Read and Grep of the token directory
       - Write to the production checkout
       - Write under `.git`
       - `git push --dry-run … HEAD:main`
       - `cat` of the token
       - a sandboxed node script reading the token or `~/.ssh`, writing to the production checkout, or reaching `api.github.com`
     - The OAuth token was absent from the Bash environment.
     - A second attack prompt (rewrite `.git/config`, move `origin/main`, rename a workflow) was declined by the model itself, so it measured nothing. The rename and scratch-file cases are covered by `publish()` unit tests on a real git repository instead.
  7. **`CLAUDE_CODE_SUBPROCESS_ENV_SCRUB=1` makes the init event report `permissionMode: default`.** Measured by bisecting the flags. In `-p` an unapproved call is still denied, as all the refusals above show.
  8. **A second review (2026-11-01) closed three more paths.**
     - **The clone's own Claude Code hook.** `.claude/settings.json` runs `.claude/hooks/guard-bash.sh` outside the sandbox before every Bash call, so an edited hook would have run as the host user.
       - `Edit(//clone/.claude/**)` is denied, and both `.claude` and `.git` are in the sandbox `denyWrite`.
       - Probe results: the Write tool on `.claude/hooks` was refused. Sandboxed node got `EPERM` on `.claude/hooks`, `.git`, `.git/objects` and `.git/info`, and the `guard-bash.sh` hash was unchanged.
     - **Manifest content.** `publish()` refuses a change to any `package.json` `scripts` block, because those scripts define the scans and CI steps.
     - **PR text.** `publish()` refuses a `pr.md` naming host paths, the host name or an image digest.
     - The sandbox `denyRead` also covers `~/.docker`, `~/.claude`, `~/.claude.json`, `~/.npmrc`, `~/.netrc` and `~/.git-credentials`.
     - Residual: Dockerfiles, `docker-compose.yml` and Umami patches stay publishable because image fixes need them. A draft PR from the PAT still runs this repo's `pull_request` CI on that content, so the owner's review of the draft is the control there.
- **Verification**: the `Done when` list, run in order. Check 5 uses a fixture directory passed through `TRIAGE_REPORT_DIR`, so the real report is never edited.

## Outcome

<!-- Filled when status becomes shipped or dropped. -->

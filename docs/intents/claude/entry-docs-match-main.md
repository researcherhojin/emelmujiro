---
status: in-progress
module: claude
created: 2026-10-23
updated: 2026-10-23
---

# The entry docs describe the CI, alarms and tools that shipped on 2026-10-23

## Intent

- **Problem**: #634–#641 each updated the rule file they touched, but the docs a contributor or another agent opens first still describe the earlier state.
  - `CONTRIBUTING.md` lists what PR CI runs without the `Docker Images` job (#637), and its container-image bullet does not say that PR CI now runs both `verify.sh` scripts.
  - `README.md`'s CI/CD bullet predates the image checks and the "Deploy not landing" alarm (#635).
  - `AGENTS.md` says auto-merged Dependabot commits do not deploy and that drift "is caught nightly". `ci.md` names three mechanisms, the first being the auto-merge job's own dispatch.
  - The visual-diff harness (#639) appears only in `frontend-build.md`. `CLAUDE.md` › Commands, where `README.md` sends readers for such commands, does not list it, and neither does `AGENTS.md`'s Tailwind line.
  - `frontend-build.md` says to serve both A/B builds "against the same local backend". The #640 and #641 A/Bs ran with none: `build:e2e` printed `Prerendered 10/10 routes`, and each of the three builds captured 54 of 54, because prerender does not intercept same-origin `/api`.
  - `docker/umami/README.md` describes the manual build and `verify.sh`, but not the PR job that now runs them.
- **Outcome wanted**: each statement above matches `main`, and the docs grow only by what the new facts need: `CLAUDE.md` gains one Commands line.
- **Affected systems**: `README.md`, `CONTRIBUTING.md`, `AGENTS.md`, `CLAUDE.md` › Commands, `.claude/rules/frontend-build.md` › Tailwind, `docker/umami/README.md`, `CHANGELOG.md`.
- **Constraints**:
  - `AGENTS.md` is edited line by line, never rewritten.
  - `CLAUDE.md` stays under 200 lines, Gotcha numbers do not move, and no blank line is deleted to save space.
  - README badge and test-count lines belong to the `Sync README Badges` job.
  - Shipped Outcomes and past CHANGELOG entries keep their text.
- **Open questions**: none.

## Spec

- **Approach**: in-place edits that state what shipped and name the rule or job that holds the detail. The harness bullet in `frontend-build.md` becomes a bold lead with sub-bullets, the shape `CLAUDE.md` asks of every rule, and keeps every fact.
  - Rejected: a wider compression pass. An 8-word-shingle scan of the nine docs found overlap only where it is meant to be: `AGENTS.md` and `CONTRIBUTING.md` restating `CLAUDE.md` rules in one line each, and the rule files' provenance comments.
- **Files and interfaces**: as listed under Affected systems.
- **Out of scope**: the maintainer-local `.private/` notes, synced separately; Gotcha text; shipped intents.
- **Done when**:
  - prettier and `npm run spell` pass, and `wc -l CLAUDE.md` is under 200.
  - Every new claim has a source on `main`: the `Docker Images` job and its `docker/umami/` trigger in `pr-checks.yml`, the dispatch and the alarm in `ci.md`, the `visual:*` scripts in `frontend/package.json`.
  - The newly documented commands run as written: `npm run visual:compare` with no arguments prints its usage and exits `2`.
  - PR checks pass, and production reports the merge commit.

## Plan

- **Changes**: this intent; then `frontend-build.md`, `CLAUDE.md`, `AGENTS.md`, `README.md`, `CONTRIBUTING.md` and `docker/umami/README.md`; then the `CHANGELOG.md` entry.
- **Risks**: a summary line that overstates what a job does. Each line names the job or file that holds the detail, so a reader can check it.
- **Verification**: the Done-when checks, run before the PR opens.

## Outcome

<!-- Filled when status becomes shipped or dropped. -->

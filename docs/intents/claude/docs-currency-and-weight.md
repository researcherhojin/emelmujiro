---
status: in-progress
module: claude
created: 2026-10-28
updated: 2026-10-28
---

# Living docs match the code and say it in fewer bytes

## Intent

- **Problem**: the always-loaded and path-loaded docs drift from the code and carry wording that costs tokens without adding facts.
  - `CLAUDE.md:13` lists `ci.md`'s sections but omits **Nightly image refresh** (`ci.md:114`, added in #696).
  - `CLAUDE.md:15` and `AGENTS.md:12` name only the First and Second alarms of `security-operations.md`; it now also has Third alarm and the Umami build-time advisory.
  - `security-operations.md:160` points to `periodic-image-rebuild.md` as follow-up. That intent is shipped, and its rules live in `ci.md` › Nightly image refresh; only another intent cites it, so `docs/intents/README.md` says delete it.
  - `frontend-build.md` lists the kept px arbitrary values with a trailing `…` (`4bf11bf0`); `frontend/src` has exactly 7.
  - `ci.md` is 117 lines and `frontend-build.md` 80; most paragraphs are single lines of several hundred bytes.
- **Outcome wanted**: every concrete claim in the living docs (`CLAUDE.md`, `AGENTS.md`, `README.md` prose, `CONTRIBUTING.md`, `.claude/rules/*`, `.claude/skills/{gotchas,intent}`, `.claude/agents/*`, `docs/intents/README.md`, `docker/umami/README.md`) is true of the branch head, and `ci.md` plus `frontend-build.md` are smaller in bytes with no fact lost.
- **Affected systems**: the files above; `CLAUDE.md` › Quick Orientation; `ci.md` and `frontend-build.md` hold moved `Constraints` sections, so all 7 phases apply.
- **Constraints**: Gotcha numbers never change; bold leads cited by name (`pr-checks.yml:381` "Operational logs", `:415` and `check-changelog.sh:13` "CHANGELOG entry", `update-test-counts.sh:71` "README drift gates", `CLAUDE.md` › Quick Orientation lists) stay verbatim; `paths:` front matter stays byte-identical; README badges and test counts belong to the bots.
- **Open questions**: none. The owner asked on 2026-10-28 for a separate intent covering full currency and lightening, and for `periodic-image-rebuild.md` to stop waiting on the 00:30 run.

## Spec

- **Approach**: two passes in separate commits. Currency first: fix claims that are false, each verified against a file or command. Then compression: reword `ci.md` and `frontend-build.md` in place, changing no fact. Rejected: one mixed commit, because a fact-diff cannot then tell an intended correction from a loss.
- **Files and interfaces**: the living docs listed above; delete `docs/intents/infra/periodic-image-rebuild.md` and update the pointer at `security-operations.md:160`.
- **Out of scope**: shipped intents' dated numbers (records, not claims); README badges and test counts; renumbering or merging rules; host scheduling.
- **Done when**:
  - `npm run spell` reports 0 issues and `npx prettier --check` passes on every changed file.
  - A fact-diff of the compression commit against the currency commit prints no missing SHA, number, version, ref or bold lead for `ci.md` and `frontend-build.md`, and `wc -c` is lower for both.
  - `git grep` finds no reference to a deleted intent outside `CHANGELOG.md` and notes marked deleted.
  - `./scripts/test-check-changelog.sh`, `./.claude/hooks/test-guard-bash.sh` and `npm run check:routes` (from `frontend/`) pass.
  - End to end: PR CI on the branch is green, including `Repo Checks (informational)`.

## Plan

- **Changes**: (1) this file; (2) currency fixes and the `periodic-image-rebuild.md` deletion; (3) compression of `ci.md` and `frontend-build.md`, then `CHANGELOG.md`.
- **Risks**: a reworded bold lead breaks a by-name citation (shows as a grep miss for the quoted lead); a compressed sentence drops a number (shows in the fact-diff).
- **Verification**: the `Done when` commands, plus the `intent-reviewer` subagent on the branch before the PR.

## Outcome

<!-- Filled when status becomes shipped or dropped. -->

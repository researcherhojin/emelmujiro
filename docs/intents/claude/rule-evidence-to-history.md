---
status: approved
module: claude
created: 2026-10-28
updated: 2026-10-28
---

# Path-scoped rules state the rule and point to git for the evidence

## Intent

- **Problem**: the path-scoped rules load whenever Claude reads a matching file, and much of their text is evidence that justifies a rule, not the rule itself. Rewording in place saved only 340 B of `ci.md` and 457 B of `frontend-build.md` in #700, because every evidence sentence carries a SHA, run ID or count that a reword must keep.
  - Measured on `origin/main` `510310ae` (2026-10-28) with a sentence heuristic: a sentence counts as evidence if it contains a date, "measured", a run or PR ID of 4 or more digits, or a past-tense report verb ("was", "showed", "printed", "found", "returned", "failed", …).
  - `ci.md`: 19,975 B body, 19 of 98 sentences, 5,121 B (26%). `frontend-build.md`: 16,048 B, 14 of 60, 5,905 B (37%). `backend.md`: 13,792 B, 8 of 64, 2,474 B (18%). `frontend.md`: 11,539 B, 6 of 66, 1,652 B (14%). These are upper bounds: some flagged sentences are rules phrased in the past tense.
  - The evidence already lives in git: the commit or PR that introduced each sentence, its PR body and `CHANGELOG.md`. `git log -S` or `git blame` on the rule file finds it.
- **Outcome wanted**: each rule keeps its rule sentence, the reason in one clause, and the failure signature Claude would see. Narrative and measurements are replaced by one pointer (`#NNN` or a commit SHA) where the full evidence is recoverable.
- **Affected systems**: `.claude/rules/*.md`; the `Constraints` sections moved there, so all 7 phases apply.
- **Constraints**: bold leads cited by name stay verbatim (`pr-checks.yml:381` "Operational logs", `:415` and `scripts/check-changelog.sh:13` "CHANGELOG entry", `scripts/update-test-counts.sh:71` "README drift gates", `CLAUDE.md` › Quick Orientation). `paths:` front matter stays byte-identical. Exactness: a kept number stays exact. Rejected in the 2026-10-28 discussion: moving the evidence into a new skill, because a skill loads only when its description matches, and adds a second copy to maintain.
- **Open questions**: none. The owner answered on 2026-10-28: all four rule files; a PR number where one exists, else a commit SHA; failure signatures stay inline.

## Spec

- **Approach**: per rule, keep the rule sentence, a one-clause reason, any failure signature (an error string or exit pattern Claude would see), and every current-state fact (a path, setting, version pin, count, step name). Replace measurement narrative and past incidents with one pointer: `#NNN` when the sentence came from a PR, else the short SHA of the commit that introduced it (found with `git log -S`). Rejected: a new evidence skill (loads only on a description match, and is a second copy); rewording in place (#700 showed it saves 1.7–2.7%).
- **Files and interfaces**: `.claude/rules/ci.md`, `frontend-build.md`, `backend.md`, `frontend.md`. `claude-config.md` (1,267 B, no evidence sentences) is unchanged.
- **Out of scope**: `CLAUDE.md` and the `gotchas` skill (their evidence is the situation-loaded part by design); shipped intents; any rule's meaning; renumbering, merging or reordering rules.
- **Done when**:
  - Every removed number, SHA, run ID or date either is still in the file or belongs to a sentence whose pointer resolves: `gh pr view <N>` or `git show <sha>` contains that token. A script checks each one and prints `0 unresolved`.
  - Every bold lead and every `paths:` block is unchanged, checked by the fact-diff script.
  - `wc -c` of `ci.md` and `frontend-build.md` each drops by at least 15%. The bound is half the heuristic estimate, because some flagged sentences are rules.
  - `npm run spell`, `npx prettier --check`, `./scripts/test-check-changelog.sh`, `./.claude/hooks/test-guard-bash.sh` and `npm run check:routes` pass.
  - End to end: PR CI is green, including `Repo Checks (informational)`, whose steps cite `ci.md` sections by name.

## Plan

- **Changes**, one file per step, largest evidence share first: `frontend-build.md` (37%), `ci.md` (26%), `backend.md` (18%), `frontend.md` (14%). For each evidence sentence: keep what it says about the current state; find its source with `git log -S '<distinctive phrase>' --format='%h %s' -- <file>`; take the `(#NNN)` from that subject, or the short SHA if there is none; write the pointer once at the end of the rule (`(#NNN)`), not per sentence. Then `CHANGELOG.md`.
- **Arithmetic**: the 15% floor is half of the heuristic share for `ci.md` (26% / 2 = 13%, rounded up to 15% so both files share one bound); `frontend-build.md`'s 37% leaves room.
- **Risks**:
  - A current-state fact is mistaken for history and dropped. It shows as a token missing from the file and from its pointer's commit, so the resolver script flags it.
  - A pointer names a commit that only moved the text, not the one that wrote it (#572 moved the `Constraints` paragraphs into `.claude/rules/` byte-identical on 2026-10-17). Use `git log -S` with `--diff-filter` past the move, or `git log --follow` on `CLAUDE.md`, and confirm with `git show` that the commit adds the sentence's evidence.
  - A bold lead cited by a script or workflow changes. The fact-diff's bold-lead check flags it.
- **Verification**: the `Done when` commands. The resolver script: for each token the fact-diff reports missing from a file, check that it appears in `git show <sha>` or `gh pr view <N> --json body,title` for a pointer in the same rule; print each unresolved token and the total.

## Outcome

<!-- Filled when status becomes shipped or dropped. -->

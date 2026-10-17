---
status: shipped
module: claude
created: 2026-10-17
updated: 2026-10-17
---

# CLAUDE.md meets the official size target without renumbering a Gotcha

## Intent

- **Problem**: `CLAUDE.md` is 286 lines and 49,559 bytes (69 blank lines, 0 HTML comments), measured 2026-10-17 on top of #571. The official [memory](https://code.claude.com/docs/en/memory) page says: "target under 200 lines per CLAUDE.md file. Longer files consume more context and reduce adherence." The [best practices](https://code.claude.com/docs/en/best-practices) page adds: "If Claude keeps doing something you don't want despite having a rule against it, the file is probably too long and the rule is getting lost." The repo's own meta-rule says the opposite — `Quick Orientation` › `Size and shape`: "there is no line target, only bytes."
- **Outcome wanted**: `wc -l CLAUDE.md` below 200, with every rule still reachable when it applies and every Gotcha ID `#1`–`#19` still resolving to the same rule.
- **Affected systems**: `CLAUDE.md` (`Quick Orientation`, `Constraints`, `Gotchas` index, `Development Flow`); new path-scoped files under `.claude/rules/`; `npm run spell` glob already covers `.claude/rules/**`.
- **Constraints**:
  - The 2026-07-31 attempt (a path-scoped `.claude/rules/dependencies.md`) was reverted because renumbering broke Gotcha IDs cited from commits, CHANGELOG and PRs, and because Gotchas "fire on situations (a red scan, a dependabot PR), not on file reads". Gotchas therefore stay in `CLAUDE.md` with their numbers.
  - `@path` imports are not a size fix: "Imports help you organize a long file but don't reduce its context cost, because imported files also load at launch" (memory page).
  - Exactness rule: every count and claim stays verifiable; nothing is dropped silently.
- **Open questions**: none left. The owner chose the staged approach below on 2026-10-17, and left `AGENTS.md` untouched.

## Spec

- **Approach** (owner-chosen 2026-10-17):
  1. **Move file-bound `Constraints` into path-scoped rules.** The memory page: "Move instructions that matter for only part of the codebase into path-scoped rules, which load only when Claude works with matching files." A rule loads "when Claude uses the Read, Write, or Edit tool on a matching file", and also for `cat`/`head` on a single file. Candidates, by the files whose edit is the trigger:
     - `.claude/rules/frontend-build.md` — `SEO`, `KakaoTalk WebView`, `SSG prerender + nginx routing`, `E2E target`, `Lighthouse never audits a prerendered document`, `CSP is defined twice` (paths: `frontend/nginx.conf`, `frontend/index.html`, `frontend/scripts/**`, `frontend/e2e/**`, `frontend/playwright.config.ts`, `frontend/lighthouserc.js`, `frontend/src/App.tsx`, `frontend/src/components/common/SEOHelmet.tsx`, `scripts/auto-deploy.sh`).
     - `.claude/rules/ci.md` — `CI job gating`, `Auto-merged commits do not deploy`, `Spell check`, `README drift gates`, `Operational logs` (paths: `.github/**`, `scripts/**`, `Makefile`, `cspell.json`, `README.md`).
     - Each moved rule keeps a one-line pointer in `Quick Orientation` › `By task type`, because some triggers are situations, not file reads (a Search Console report, a red CI check); the pointer tells Claude which rule file to read first.
  2. **Turn human-only evidence into block-level HTML comments.** The memory page: "Block-level HTML comments (`<!-- maintainer notes -->`) in CLAUDE.md files are stripped before the content is injected into Claude's context." Incident counts and history that do not change what Claude should do move into comments in place; the rule sentence stays visible. This reduces context bytes, not `wc -l`.
  3. **Mark hook-enforced Gotchas.** `#6`, `#7` and `#15` become `(enforced)` in the index, as `#10` already is, and their bodies keep the rule plus evidence but drop prose the hook now guarantees. Best practices: "If Claude already does something correctly without the instruction, delete it or convert it to a hook."
  4. **Rewrite `Size and shape`** to state the official target and this file's own exceptions (Gotchas stay, IDs stay), citing the memory page.
  - Rejected: moving Gotchas to a skill (more invasive; not chosen); `@path` imports (no context saving); merging separate rules onto one line or deleting blank lines that Prettier needs (would game `wc -l` without reducing what Claude reads).
- **Files and interfaces**: `CLAUDE.md`; new `.claude/rules/frontend-build.md` and `.claude/rules/ci.md` with `paths:` frontmatter (`paths` is "the only field Claude Code reads from a rule"); `CHANGELOG.md`.
- **Out of scope**: renumbering or relocating any Gotcha; `.claude/rules/frontend.md` and `backend.md` content; `AGENTS.md`; skills; README.
- **Done when**:
  - `wc -l CLAUDE.md` prints a number below 200, reported with bytes before and after.
  - Every rule paragraph removed from `CLAUDE.md` appears verbatim in exactly one rule file (a script diffs the removed lines against the new files and prints zero unmatched lines), except lines turned into comments, which still appear in `CLAUDE.md`.
  - Counting only from `## Gotchas` onward, `^[0-9]+\. \*\*` matches 19 lines, identical to `main`. (Counted over the whole file it printed 21 on `main`, because `README drift gates` carried a numbered list; that list moves to `ci.md`.)
  - `npm run spell` 0 issues, `prettier --check` clean, `npm run check:routes` and the guard-hook tests still pass.
  - End to end (measured with `claude -p` and an `InstructionsLoaded` hook passed via `--settings`, a script-friendly equivalent of `/context`): a fresh Claude Code session that reads `frontend/nginx.conf` shows `.claude/rules/frontend-build.md` under **Memory files** in `/context` (the check the memory page itself uses), and one that has not touched a matching file does not.

## Plan

Line counts below include each paragraph's trailing blank line, measured on `4e510f96` (286 lines).

- **Changes**, in order:
  1. Create `.claude/rules/frontend-build.md` and move these `Constraints` paragraphs into it verbatim: `SEO` (2), `KakaoTalk WebView` (2), `SSG prerender + nginx routing` (18), `E2E target` (6), `Lighthouse never audits a prerendered document` (6), `CSP is defined twice` (7), `Tailwind 3.x` (2), `Bundle size` (2) — 45 lines. `paths`: `frontend/nginx.conf`, `frontend/index.html`, `frontend/vite.config.ts`, `frontend/tailwind.config.*`, `frontend/postcss.config.*`, `frontend/scripts/**`, `frontend/e2e/**`, `frontend/playwright.config.ts`, `frontend/lighthouserc.js`, `frontend/src/main.tsx`, `frontend/src/App.tsx`, `frontend/src/components/common/SEOHelmet.tsx`, `scripts/auto-deploy.sh`.
  2. Create `.claude/rules/ci.md` and move: `Compose-only images` (5), `Operational logs` (5), `CI job gating` (6), `Auto-merged commits do not deploy` (8), `Spell check` (6), `README drift gates` (8) — 38 lines. `paths`: `.github/**`, `scripts/**`, `Makefile`, `docker-compose.yml`, `cspell.json`, `package.json`, `README.md`.
  3. Rewrite `Quick Orientation`: `Size and shape` states the official target and the Gotcha exception; `By task type` points each situation-triggered task (Build / deploy / CI, Search Console report, a red check) at the rule file to read first. Net change must not add lines.
  4. Update every cross-reference to a moved paragraph: `git grep -n "Constraints"` over tracked files except `CHANGELOG.md` (known: `.claude/rules/frontend.md:53` "see `Constraints` → E2E target in root `CLAUDE.md`"; the two `<!-- Path-scoped rule -->` comments in `frontend.md` and `backend.md`, which say cross-cutting rules "stay in root CLAUDE.md").
  5. Index markers: `#6`, `#7`, `#15` gain `(enforced)`. Wrap human-only evidence in block-level `<!-- -->` comments where a sub-bullet records history rather than instructs.
  6. `CHANGELOG.md` entry with before/after lines and bytes; this intent's `Outcome`.
- **Arithmetic**: 286 − 45 − 38 = 203 before step 3. The remaining 4 or more lines come from step 3 and from compressing wording in place; if the count still ends at 200 or above, stop and report the figure rather than deleting blank lines or merging rules.
- **Risks**: a moved rule whose trigger is a situation rather than a file read stops loading (mitigated by the step 3 pointers); a stale cross-reference (step 4 grep); YAML in `paths` that does not parse, which makes the rule load unconditionally ("If the YAML between the markers doesn't parse, Claude Code ignores the frontmatter and loads the rule as if it had no `paths`").
- **Verification**: the `Done when` list in `Spec`; plus `git diff --stat` showing only `CLAUDE.md`, the two new rule files, `frontend.md`/`backend.md` comment or pointer lines, `CHANGELOG.md` and this file.

## Outcome

**Shipped 2026-10-17 in #572** (`f74f5abb`); CHANGELOG entry "CLAUDE.md is under the official 200-line target". `CLAUDE.md` 286 → 199 lines, 49,559 → 33,014 bytes; all 19 Gotchas unchanged; the end-to-end `InstructionsLoaded` check passed for both new rules and the backend control.

Departures from the Plan, each recorded in the PR:

- **More globs.** `frontend-build.md` matches all of `frontend/src/**`, not the listed files, and `ci.md` also matches `backend/config/settings.py`. Found by `/code-review`: SEO, KakaoTalk and Tailwind rules apply across the source tree, and `LOG_DIR` couples to the cron log paths.
- **More pointers.** `Quick Orientation` also sends dependency bumps to `ci.md` (Postgres majors) and `frontend-build.md` (Tailwind v4). Both dependabot-ignore rules were always loaded before this change.
- **Deferred, then dropped.** Trimming the bodies of Gotchas `#6`, `#7` and `#15`, and wrapping history in HTML comments. Neither changes `wc -l`. A prompt audit on 2026-10-17 found the Gotcha sub-bullets are almost all operative (what a failure looks like, how to diagnose it); only two lines are pure history (`#10` "It happened 10 times…", `#19` "Every scheduled `uv in /backend` full run failed…"), worth about 100 est. tokens. Not worth a pass.

Lesson for the next intent: the `Done when` grep counted the whole file (21 on `main`, not 19). Scope a count to the section it claims to measure.

---
status: in-progress
module: claude
created: 2026-10-18
updated: 2026-10-18
---

# The intent workflow runs from one command, with a reviewer that checks the diff against the Spec

## Intent

- **Problem**: `docs/intents/README.md` describes a six-step workflow, and #572 followed it by hand: a prompt written from scratch to delegate implementation, an ad-hoc `/code-review` call, and steps remembered from the README. Each run re-derives the procedure, and #572's review used a generic bug review where the README asks for a check against the Spec.
- **Outcome wanted**: `/intent <module>/<slug>` performs the next step for that file's `status`, and a project subagent reviews a branch against its intent's `Done when` and `Out of scope`.
- **Affected systems**: `.claude/skills/intent/SKILL.md`, `.claude/agents/intent-reviewer.md`, `.gitignore`, `docs/intents/README.md`, `CLAUDE.md` (`Development Flow`), `npm run spell` and its rule in `.claude/rules/ci.md`.
- **Constraints**: `.claude/*` is gitignored and `.claude/skills/` already holds 19 per-machine skills, so only the two new paths may be un-ignored. `CLAUDE.md` stays below 200 lines (199 on `6f241e12`).
- **Open questions**: none. The owner asked on 2026-10-18 for the workflow to use the Claude Code and Anthropic engineering-blog concepts that make development easier.

## Spec

- **Approach**, each part from an official source:
  - **A skill for the procedure.** The [skills](https://code.claude.com/docs/en/skills) page puts "step-by-step procedures, checklists" in skills, and defines `disable-model-invocation: true` as "Claude can't invoke the skill on its own. Use this for workflows with side effects or that you want to control timing". The [best practices](https://code.claude.com/docs/en/best-practices) `/fix-issue` example has the same shape.
  - **Live state injected at invocation.** "The `` !`<command>` `` syntax runs shell commands before the skill content is sent to Claude" (skills page). The skill injects `git status` and every intent's `status:` line.
  - **Progressive disclosure.** Anthropic's engineering post [Equipping agents for the real world with Agent Skills](https://www.anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills) describes "the `name` and `description` of every installed skill" preloaded and the full `SKILL.md` read only when relevant. With `disable-model-invocation`, the skills page says the description is not in context either, so the skill costs nothing until invoked.
  - **A reviewer subagent against the plan.** Best practices: "Use a subagent to review the rate limiter diff against PLAN.md … Report gaps, not style preferences", plus the caution that a gap-finding reviewer "will usually report some, even when the work is sound". The [subagents](https://code.claude.com/docs/en/sub-agents) page: project agents live in `.claude/agents/`, "check into git", and a description with "use proactively" encourages delegation.
  - Rejected: a Stop hook that blocks until `Done when` passes (the checks differ per intent, so a generic hook cannot run them); `context: fork` for the whole skill (the Intent and Spec steps need the owner's answers, which a forked subagent cannot collect).
- **Files and interfaces**: the two new files; `.gitignore` un-ignores exactly `.claude/agents/` and `.claude/skills/intent/`; `npm run spell` scans both.
- **Out of scope**: the 19 per-machine skills; `AGENTS.md`; any change to the workflow's steps themselves (the skill encodes the README, it does not redefine it).
- **Done when**:
  - `git check-ignore` still ignores `.claude/skills/docx/SKILL.md`, and `git status` shows only the two new files under `.claude/`.
  - Both frontmatter blocks parse; `SKILL.md` is under the skills page's 500-line target.
  - End to end: `claude -p "/intent claude/claude-md-alignment"` (a `shipped` intent) runs the injected commands, reports the `Outcome` and changes no file (`git status` unchanged).
  - The `intent-reviewer` subagent runs on this branch against this intent and returns a report.
  - `npm run spell` 0 issues, `prettier --check` clean, `CLAUDE.md` still below 200 lines.

## Plan

- **Changes**: `.gitignore`; `SKILL.md`; `intent-reviewer.md`; `package.json` `spell` globs and the `Spell check` paragraph in `.claude/rules/ci.md`; `docs/intents/README.md`; one existing line in `CLAUDE.md` `Development Flow` › `Invariants` and the `Commands` comment for `npm run spell` (edited in place, so the line count does not move); `CHANGELOG.md`.
- **Risks**: an injected command that is denied aborts the skill ("If a command fails, the entire skill invocation aborts"); both are read-only (`git status`, `grep`). A `.gitignore` negation that also un-ignores the 19 local skills (checked by `git check-ignore`).
- **Verification**: the `Done when` list. This change is small enough to implement in the planning session; the end-to-end run is the fresh-context check.

## Outcome

<!-- Filled when status becomes shipped. -->

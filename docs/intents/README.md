# Intents

One file per piece of work, filed under the module it changes. A file starts as an **Intent** (the problem and the outcome wanted), gains a **Spec** once the approach is decided, a **Plan** before the first edit, and an **Outcome** when it ships or is dropped. Git history on the file is the record of who decided what, and when.

Adapted from the intent → spec → plan chain in Anthropic's [AI-native SDLC playbook](https://claude.com/ko/resources/articles/the-ai-native-sdlc-playbook). With one maintainer, the three stages live in one file instead of three.

## When to write one

- **Write one** for work that touches a `Constraints` section of `CLAUDE.md` (or of `.claude/rules/ci.md` or `frontend-build.md`, which hold the ones moved out), spans 3 or more files, or is deferred with a decision still open. This matches where the official [best practices](https://code.claude.com/docs/en/best-practices) say planning pays: "when you're uncertain about the approach, when the change modifies multiple files, or when you're unfamiliar with the code being modified."
- **Skip it** for a typo, a single-line fix, a dependency bump, or a hotfix — the same page: "If you could describe the diff in one sentence, skip the plan." The `Skip rules` in `CLAUDE.md` decide; this file adds no phase of its own.

## Working an intent with Claude Code

`/intent <module>/<slug>` (`.claude/skills/intent/`), or a plain-language request that needs an intent, performs the next step below for the file's `status`, and the `intent-reviewer` subagent (`.claude/agents/`) is step 5's review against the Spec. The steps stay the source of truth.

The sections follow the official explore → plan → implement → commit workflow ([best practices](https://code.claude.com/docs/en/best-practices), "Explore first, then plan, then code"):

1. **Intent — explore.** Start in plan mode (`Shift+Tab` until `⏸ plan mode on`, or `claude --permission-mode plan`), so Claude reads and measures without editing. Write what it finds into `Intent` with its evidence.
2. **Spec — interview.** Have Claude interview you with the `AskUserQuestion` tool until the open questions are closed, then fill `Spec`. The official bar for a spec: "The most useful specs are self-contained: they name the files and interfaces involved, state what is out of scope, and end with an end-to-end verification step that proves the feature works." The template's `Spec` fields are those three, plus the approach.
3. **Plan — plan mode.** Still in plan mode, have Claude write the implementation plan (`Ctrl+G` opens it in your editor), and copy the approved plan into `Plan`.
4. **Implement — fresh session.** "Once the spec is complete, start a fresh session to execute it." Point the new session at the intent file; it needs no other context.
5. **Verify and review.** Run the `Done when` checks and show their output; then run the `intent-reviewer` subagent against the Spec and the bundled `/code-review` for correctness, each in a fresh subagent context. The official caution applies: a reviewer asked for gaps usually reports some, so act on gaps in correctness or the stated requirements and treat the rest as optional.
6. **Ship.** PR, merge, deploy, then fill `Outcome` and set `status`.

## Layout

```
docs/intents/
├── README.md       # this file
├── _template.md    # copy it to start an intent
└── <module>/<slug>.md
```

Modules are folders, created when the first intent needs one: `blog`, `seo`, `contact`, `infra` (Docker, nginx, deploy, cron), `ci`, `frontend`, `backend`, `claude` (Claude Code setup: `CLAUDE.md`, rules, hooks, settings). The slug is kebab-case and names the outcome, not the mechanism (`health-check-alerting`, not `add-gh-issue-to-cron`).

## Status

`status:` in the front matter is one of:

| Status        | Meaning                                                     | Sections filled     |
| ------------- | ----------------------------------------------------------- | ------------------- |
| `draft`       | Problem stated, approach or a decision still open           | Intent              |
| `approved`    | Approach decided; the Plan and the branch may follow        | Intent, Spec (Plan) |
| `in-progress` | Implementation started                                      | Intent, Spec, Plan  |
| `shipped`     | Merged and deployed; `Outcome` cites the commit or PR       | all                 |
| `dropped`     | Decided against; `Outcome` says why, so it is not re-raised | Intent, Outcome     |

A `dropped` intent stays in the tree. The reasoning for not doing something is as reusable as the reasoning for doing it.

A `shipped` intent is deleted once its deploy is verified, unless a living doc (`CLAUDE.md`, `AGENTS.md`, a `.claude/rules/` file, a workflow or script) cites it as the source of a fact. `CHANGELOG.md` is the shipped record, and git history keeps the file (`git log --diff-filter=D --name-only -- docs/intents`). Thirteen shipped intents that nothing cited were deleted this way on 2026-10-23.

## Rules

- **The repo is public.** Host topology, credentials, deploy forensics and anything else that lives in `.private/operations.md` stay there. Link to it by name; never copy it in.
- **Evidence is exact**, as everywhere in this repo: a measured number with its date or commit, never a round figure.
- **One home per fact.** Evidence lives in the file that first recorded it; another file points to it (`file.md` › Section) instead of restating it. Keep entries short: the run ID, SHA and count, not the narrative around them.
- **One intent per PR.** The PR body links the intent file; the merge updates `status` and `Outcome` in the same PR or the next commit. `CHANGELOG.md` remains the shipped record, and the intent links to its entry rather than repeating it.
- **Plan mode output goes in `Plan`**, not only in `~/.claude/plans/`, so the plan is reviewed with the code and survives the session, including the fresh one that implements it.
- **Commit type** for intent-only changes is `docs(intents):`.

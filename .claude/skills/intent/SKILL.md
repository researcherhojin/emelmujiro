---
name: intent
description: Start or advance a docs/intents/ file through Intent, Spec, Plan, implementation, review and shipping, as docs/intents/README.md defines. Use it whenever a request needs an intent under CLAUDE.md's Skip rules (a refactor touching 3 or more files or any Constraints section, or work the owner asks to plan), or names an existing intent, even when the request is plain language and no /intent command is typed.
argument-hint: <module>/<slug> | docs/intents/<module>/<slug>.md
---

# Intent workflow

Target: $ARGUMENTS

Resolve the target to `docs/intents/<module>/<slug>.md`. Read `docs/intents/README.md` and the target file (if it exists) before doing anything else; the README is the source of truth and wins over this skill.

## Current state

```!
git status --short --branch
grep -H "^status:" docs/intents/*/*.md
```

## Do the next step, chosen by the target's `status`

**No file yet: write the Intent.**

1. Explore read-only first. Measure; do not guess. Every number gets its date or commit.
2. Copy `docs/intents/_template.md` to the target, set `module`, `created` and `updated` to today, and fill `Intent` with the evidence.
3. Interview the owner with `AskUserQuestion` until every open question is answered. Ask only questions whose answer changes the work, and recommend an option.
4. Fill `Spec`: approach (and what was rejected, with why), files and interfaces, out of scope, and `Done when` as runnable checks ending with one end-to-end check. Scope every count to what it claims to measure.
5. Show the Spec and ask for approval. On approval, set `status: approved`.

**`approved`, `Plan` empty: write the Plan.**

1. Fill `Plan`: changes in order, the arithmetic behind any target number, risks and how each would show, verification.
2. Create a branch (`feature/<slug>` or `fix/<slug>`) and commit the intent alone as `docs(intents): …`.
3. Stop. Tell the owner to implement in a fresh context, as the README's step 4 says: either a new session running `/intent <module>/<slug>`, or a subagent given only the intent path.

**`approved` with a filled `Plan`: implement.**

1. Set `status: in-progress` and implement the Plan. Departures are allowed when the Plan is wrong; record each one with its reason.
2. Run every `Done when` check and keep the exact output. If a check cannot pass honestly, stop and report the figure; do not adjust the check.
3. Use the `intent-reviewer` subagent on the branch. Apply findings about correctness or the stated requirements; treat the rest as optional.
4. Add the `CHANGELOG.md` entry, commit, push, and open the PR with the intent linked and the `Done when` outputs in the body.

**`in-progress`, PR merged: close it out.**

1. Confirm the merge, and for deployed files confirm production reports the merge commit (`CLAUDE.md` Gotcha #17).
2. Set `status: shipped`, fill `Outcome` (PR, commit, measured result, departures from the Plan, one lesson for the next intent), and commit it to `main` as `docs(intents): …`.
3. If no living doc (`CLAUDE.md`, `AGENTS.md`, a `.claude/rules/` file, a workflow or script) cites the file, delete it in that same commit instead: the PR body and `CHANGELOG.md` hold the evidence, and git history keeps the file.

**`shipped` or `dropped`:** report the status and the `Outcome`, and stop.

## Always

- The repo is public. Nothing from `.private/` goes into an intent; link it by name.
- Gotchas in `CLAUDE.md` never move or change number.
- Follow the `Skip rules` in `CLAUDE.md`: if the diff fits in one sentence, say so and skip the intent.

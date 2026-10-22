---
status: in-progress
module: claude
created: 2026-10-23
updated: 2026-10-23
---

# CLAUDE.md regains headroom by moving file-scoped deploy rules to their rule files

## Intent

- **Problem**: `CLAUDE.md` is 199 lines, against the official target of "under 200 lines per CLAUDE.md file" (`docs/intents/claude/claude-md-alignment.md`). The next rule added would cross that target. The 2026-10-22 doc audit listed always-loaded rules that apply only when particular files are read:
  - **Constraints › Deployment** has three sub-bullets:
    - migrations run in the backend container (`backend/Dockerfile`)
    - Cloudflare owns the http→https upgrade (`frontend/nginx.conf`)
    - an `auto-deploy.sh` edit applies one deploy late (`scripts/auto-deploy.sh`)
  - **Constraints › Production keys**: `settings.py` and `api/views.py`.
  - The owner chose this move on 2026-10-23.
- **Outcome wanted**:
  - Each of those rules lives in the path-scoped rule file that loads when its file is read.
  - Every one of them is still reachable from the task index.
  - `CLAUDE.md` drops 7 lines, from 199 to 192.
- **Affected systems**:
  - `CLAUDE.md` (Constraints and the Quick Orientation index)
  - `.claude/rules/backend.md`, `frontend-build.md` and `ci.md`
  - `AGENTS.md` (index line)
  - the `backend/config/settings.py` comment that cites the old location
- **Constraints** (`CLAUDE.md` › Quick Orientation › Size and shape):
  - No Gotcha moves or is renumbered.
  - Lines are cut by moving rules, never by deleting blank lines or merging rules.
  - `AGENTS.md` is edited line by line, never overwritten.

## Spec

- **Approach**: each rule moves verbatim.
  - **migrations**: to a new `## Deployment` section in `backend.md`. Its paths are `backend/**`, which includes the Dockerfile.
  - **Production keys**: to `backend.md` › Security.
  - **Cloudflare https upgrade**: to `frontend-build.md`, after the SSG prerender and nginx routing rules. Its paths include `frontend/nginx.conf`.
  - **`auto-deploy.sh` one deploy late**: to `ci.md`, after "Auto-merged commits do not deploy". Its paths include `scripts/**`.
  - **What stays in `CLAUDE.md`**:
    - The Deployment lead line, which the `guard-bash.sh` messages cite. It gains a pointer to the three new homes.
    - "Local dev vs Docker" and "ENV file structure". They apply to every dev session, not to one path.
  - **The index**:
    - The Build/deploy/CI line names the moved rules in `ci.md` and `frontend-build.md` and adds `backend.md` for migrations.
    - The Backend line adds Deployment and production keys.
    - `AGENTS.md`'s index line adds `backend.md`.
- **Files and interfaces**:
  - `CLAUDE.md`, the three rule files and `AGENTS.md`
  - the comment at `backend/config/settings.py:346`
- **Out of scope**: other duplications in the audit list. They cut no `CLAUDE.md` lines, or they would move cross-cutting rules.
- **Done when**:
  - `wc -l CLAUDE.md` is 192.
  - Each moved rule appears once in its new file, word for word.
  - `git grep` finds no remaining citation of the old location.
  - The `Repo Checks` spell check and prettier pass.

## Plan

- **Changes**: the edits above, plus the CHANGELOG entry.
- **Risks**: a session that only runs a deploy without reading the files could miss a moved rule. The index line for Build/deploy/CI names all three, and the Deployment lead line points to them.
- **Verification**: the Done-when items.

## Outcome

<!-- Filled when status becomes shipped or dropped. -->

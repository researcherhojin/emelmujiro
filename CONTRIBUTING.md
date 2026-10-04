# Contributing to Emelmujiro

Thanks for your interest. This is a small monorepo — keep changes surgical.

## Setup

Fork → clone → follow [README — Getting Started](README.md#getting-started) (`make install`, first-time `migrate`, `npm run dev`). On a fresh macOS box, `make setup-dev-machine` automates the bootstrap; `make verify-setup` is a re-runnable health check.

## Where the rules live

**[CLAUDE.md](CLAUDE.md) is the single source of truth** for operational rules — architecture invariants, CI constraints, gotchas — with domain rules in [`.claude/rules/`](.claude/rules/). Start with its `Quick Orientation` block. This file is only the contributor checklist; the "why" behind each item lives there.

## Workflow checklist

1. **Branch**: `feature/<name>` or `fix/<description>`, targeting `main`.
2. **Commit messages**: Conventional Commits in English — `type(scope): description`, types `feat fix docs style refactor test chore perf deps-dev deps ci`. Enforced by `scripts/check-commit-msg.sh`, which both the `commit-msg` hook and CI call; change accepted types there only. ASCII is required on the subject line; `git commit --no-verify` is the escape for a non-ASCII proper noun.
3. **No CI-skip markers anywhere in the message**, body included — GitHub reads the whole message, so prose about the mechanism skips CI. Escape the brackets to write about one (`\[skip ci\]`). See CLAUDE.md Gotcha #10.
4. **One issue per PR, ≤ 3 commits**, no mid-PR scope expansion. Defer follow-ups to a new issue.
5. **Before pushing**: `make test` and `make lint` from the repo root. Pre-commit runs lint-staged (Prettier, ESLint, Black, Flake8); don't bypass it.
6. **PR**: against `main`, with a short summary and test plan. CI runs lint, type-check, tests, Trivy, bundle size, Lighthouse, Codecov and `cspell`.

## Code rules (the short version)

- **i18n always**: `useTranslation()` in components, `i18n.t()` in data files. No hardcoded user-facing strings.
- **English comments only** in source.
- **No `window.alert/prompt`** — use a toast or inline UI.
- **Logger**: `import logger from '../utils/logger'` (default export); `env.IS_DEVELOPMENT` for environment checks.
- **Spelling**: `npm run spell`. A real word goes in `cspell.json`'s `words`; a deliberate non-word goes in a file-scoped `cspell:ignore` comment, so the dictionary never accepts typo-shaped tokens.

## Testing

Commands are in [README — Useful Commands](README.md#useful-commands); single-test invocations are in CLAUDE.md `Commands`. Two things to know:

- **Coverage** aims for 100 %; [`codecov.yml`](codecov.yml) fails below 99 % per project and 87 % on the patch.
- **Backend test output is noisy on purpose** — negative-path tests log errors. Trust `Ran N tests` + `OK` and exit code 0.

## Questions

- [GitHub Issues](https://github.com/researcherhojin/emelmujiro/issues)
- contact@emelmujiro.com

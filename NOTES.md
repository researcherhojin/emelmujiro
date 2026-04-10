# NOTES.md

Structured notes for cross-session context. Claude Code reads this to pick up where the last session left off.

---

## Mechanical Enforcement

### knip (Dead Code Detection)

- Installed at root level (`npm run knip`)
- Config: `knip.config.ts`
- Detects: unused files, unused exports, unused dependencies, duplicate exports
- Run periodically or before large refactors to prevent entropy accumulation

### Existing Enforcement

- ESLint: `no-unused-vars` (via `@typescript-eslint`)
- Pre-commit: lint-staged (Husky) — ESLint, Black, Prettier
- CI: lint + type-check + test (100% coverage) + bundle size < 10MB + security scan + Lighthouse
- CI gates added during 2026-04-11 rigor pass: cron log redirect path, Django test log isolation, i18n unused keys via `scripts/check-i18n-keys.sh --strict`

### Not Yet Automated

- Unused CSS class detection

## Session History

### 2026-04-02

- Fixed SEO canonical URL bug (all pages hardcoded Korean canonical, breaking English page indexing)
- Installed knip for dead code detection
- Removed unused packages: `@tiptap/extension-dropcursor`, `@types/dompurify`
- Removed unused export: `ToastState` from `useToast.ts`
- Created this NOTES.md

### 2026-04-11

- **Cron cleanup chain**: Fixed stale `scripts/cleanup-sitevisits.sh` crontab entry on Mac mini (script had been absorbed into `make cleanup-visits` back in `9611358`). Routed `make setup-cron` logs into `backend/logs/` (was `/tmp`), hardcoded absolute docker path via `command -v docker` to survive cron's minimal PATH, verified end-to-end by firing a real test cron via daemon.
- **CI gates added**: cron log redirect path drift (pr-checks.yml), Django test log isolation (main-ci-cd.yml).
- **Django test log pollution fix**: `settings.py` LOGGING now routes file handlers to NullHandler when `sys.argv[1] == "test"`. 170+1978 lines of pure test pollution truncated from `backend/logs/{security,debug}.log` (no real production entries lost).
- **Scripts dedup**: `scripts/check-i18n-keys.sh` absorbed CI's `DYNAMIC_SECTIONS` template literal detection + `--strict` flag. `pr-checks.yml` now calls the script instead of duplicating logic inline.
- **GitHub Pages cleanup**: Branch `gh-pages` deleted, Pages disabled, `.nojekyll` removed, deploy-to-Pages job and related permissions/concurrency removed from `main-ci-cd.yml`. Self-hosted via Mac mini + Cloudflare Tunnel is the only path now.
- **Config prune**: Removed 4 dead variables from `frontend/.env.production` (`VITE_API_TIMEOUT`, `VITE_ENV`, `VITE_ENABLE_DEBUG_MODE`, `VITE_SITE_URL` — all runtime-hardcoded in `api.ts`/`constants.ts`). Removed orphan `.github/.npmrc` (wrong location for npm) and `backend/scripts/deploy.sh` (0 references). Fixed `Makefile clean` to use `frontend/build/*` per CLAUDE.md constraint.

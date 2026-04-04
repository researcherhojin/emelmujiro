# NOTES.md

Structured notes for cross-session context. Claude Code reads this to pick up where the last session left off.

---

## Active Issues

### Google Search Console (2026-04-02)

- **Redirect errors (4)**: Likely from old `/blog/*` → `/insights/*` 301 redirects. Google will resolve these over time after recrawling.
- **Pages with redirects (2)**: Same `/blog` → `/insights` migration. Expected.
- **Discovered but not indexed (3)**: `/en/profile`, `/en/share`, `/share` — **ROOT CAUSE FIXED**: canonical URLs were hardcoded to Korean paths. SEOHelmet now auto-computes canonical from `location.pathname`. Redeploy and request reindexing in GSC.
- **404 (1)**: Likely a deleted page (e.g., `/about`). Will clear from GSC after Google recrawls.
- **Privacy policy page**: Implemented at `/privacy` (ko) and `/en/privacy` (en) — 13 sections per PIPA Article 30. Pending legal professional review.

## Mechanical Enforcement

### knip (Dead Code Detection)

- Installed at root level (`npm run knip`)
- Config: `knip.config.ts`
- Detects: unused files, unused exports, unused dependencies, duplicate exports
- Current status: **CLEAN** (0 findings)
- Run periodically or add to CI to prevent entropy accumulation

### Existing Enforcement

- ESLint: `no-unused-vars` (via `@typescript-eslint`)
- Pre-commit: lint-staged (Husky) — ESLint, Black, Prettier
- CI: lint + type-check + test (100% coverage) + bundle size < 10MB + security scan + Lighthouse

### Not Yet Automated

- i18n dead key detection (manual grep for `t('section.` before removing keys from JSON)
- Unused CSS class detection

## Session History

### 2026-04-02

- Fixed SEO canonical URL bug (all pages hardcoded Korean canonical, breaking English page indexing)
- Installed knip for dead code detection
- Removed unused packages: `@tiptap/extension-dropcursor`, `@types/dompurify`
- Removed unused export: `ToastState` from `useToast.ts`
- Created this NOTES.md

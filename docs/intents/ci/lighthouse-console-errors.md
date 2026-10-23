---
status: in-progress
module: ci
created: 2026-10-23
updated: 2026-10-23
---

# Lighthouse's errors-in-console reports real errors, not CI gaps

## Intent

- **Problem**: in PR #656's run `39898674138`, `errors-in-console` scored 0 on all four audited pages. Its findings came from the CI setup, not the site:
  - every page: `404` for `/umami/api/send`. The analysis build kept analytics on, and CI has no Umami.
  - `/insights`: `502` for `/api/blog-posts/?page=1&page_size=6` and `/api/categories/`. `vite preview` proxies `/api` to `127.0.0.1:8000`, where nothing runs.
  - The assertion therefore always fails, and a real browser error could not change its result. `lighthouserc.js` downgraded it to `warn` with the comment "Console errors from missing API in CI".
- **Production is clean**: Chromium loaded `/`, `/contact`, `/profile`, `/insights`, `/en` and `/en/insights` from `https://emelmujiro.com` on 2026-10-23. Only `/contact` logged an error, `requestStorageAccess: Permission denied.`, which comes from the embedded Google Form.
- **Outcome wanted**: in CI, `errors-in-console` finds nothing on `/`, `/profile` and `/insights`. On `/contact`, only the Google Form's own messages remain.
- **Out of scope**:
  - `/contact`'s `third-party-cookies` and `inspector-issues`. Both come from the Google Form and reCAPTCHA (`docs/intents/contact/replace-google-form.md`).
  - `unused-javascript` and `total-byte-weight` (`docs/intents/frontend/critical-css.md`).

## Spec

- **Approach**:
  - `Build for Analysis` builds with `VITE_ENABLE_ANALYTICS=false`, as `build:e2e` already does.
  - The Lighthouse job starts Django on `127.0.0.1:8000` with an empty SQLite database, waits for `/api/health/`, and fails if the backend does not answer.
- **Files**: `.github/workflows/pr-checks.yml`, `frontend/lighthouserc.js`, `CHANGELOG.md`.
- **Done when**:
  - This PR's `lighthouse-results` show `errors-in-console` passing (no items) on `/`, `/profile` and `/insights`.
  - `/contact` shows only Google-origin items.
  - Then decide whether to raise the assertion to `error` for every page except `/contact`.

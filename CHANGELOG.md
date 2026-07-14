# Changelog

All notable changes to this project are documented in this file.

The format follows [Keep a Changelog 1.1.0](https://keepachangelog.com/en/1.1.0/).
This project adheres to [Semantic Versioning 2.0.0](https://semver.org/spec/v2.0.0.html).

`VERSION`, root `package.json`, and `frontend/package.json` must stay in sync on every bump.

## [Unreleased]

Accumulating since `[1.0.0]` (2026-04-16). Production at `https://emelmujiro.com` is current main; this section records what has been merged but not yet cut as a release.

### Added

- Deploy verification: `/api/health/` now returns the running backend's git `commit` (baked into the image via a `GIT_COMMIT` build arg → image `ENV` → `settings.GIT_COMMIT`). `auto-deploy.sh` asserts the live backend reports the just-pulled `HEAD` and fails the deploy if it doesn't — closing the gap where a stale/failed backend build passed the bare `200` health check (the exact masking that hid the credsStore build failures). Defaults to `unknown` outside a built container (tests, local dev)
- 3 teaching-history entries for 2026: 한국환경산업기술원(KEITI) AI에코혁신랩 (LLM·RAG, surfaced immediately as the class starts 2026-06-09), plus two pre-scheduled (hidden until their start date via `visibleAfter`) — 이화여자대학교 임직원 대상 생성형 AI 활용 교육 (`2026-06-23`) and 과학기술연합대학원대학교(UST) AI 연구역량 강화 워크숍 (`2026-07-08`). New i18n keys 41/42. Entry count 39 → 41 active (`69da502`, `ae50f21`, `de618d5`). Two one-shot remote routines re-run the deploy on 06-23 / 07-08 so the SSG prerender snapshot picks the gated entries up for crawlers
- Two-device sync helpers: `.private/` rsync via `scripts/sync_private.sh`, MBP/Mac mini divergence detector via `scripts/check_machine_sync.sh` — caught a silent 16-commit production drift incident retroactively (`0f84140`)
- `npm run check:css` script for detecting CSS classes shipped in build but never referenced in `src/` (`0560f32`)
- cSpell project dictionary (`cspell.json`, 60+ entries spanning Makefile, Docker, CLAUDE.md, gitignore, codecov, env files; later expanded with proper-nouns from locales + scripts) (`bcaf16a`, `61f21e0`, `eceb64c`, `ddc8191`)
- 4 new partner logos in `LogosSection` carousel: Starbucks Korea (AX 직무 아카데미), Day1 Company (AI 교육 콘텐츠), 한국지방재정공제회 (AX 업무혁신 교육), 암뮤니티 (cancer-survivor AI program) (`a014563`)
- New teaching history entry — 암뮤니티 cancer-survivor AI training at 국립암센터 암환자사회복귀지원센터 (2026-05-12, UOS SI CORE venue) (`6385fe2`)
- 2 more teaching entries backfilled — Starbucks Korea (AX 직무 아카데미 — 바이브 코딩, `visibleAfter: 2026-05-01`) + 한국지방재정공제회 (생성형 AI 기반 업무혁신 AX 역량 강화 교육) — these got carousel logos in `a014563` but were missing from `/profile` until now. Counts: 39 → 41 entries (`a14a56c`, `7769f71`)
- CLAUDE.md `Quick Orientation` block + one-line Gotchas index (#1–#16 navigation aid) (`5e53ee1`)
- Contact-form spam detection now tracks failed attempts: `ContactAttempt.failure_count` increments on each failed submission, and an IP with `failure_count >= MAX_FAILED_CONTACT_ATTEMPTS` (5) is blocked — catches bots that repeatedly fail validation without tripping the per-hour total-attempt limit. Wires up the previously-discarded `success` flag in `_log_contact_attempt`; new field surfaced in `ContactAttemptAdmin`. Migration `0012_contactattempt_failure_count`

### Changed

- SEO: nginx now `301`s trailing-slash URLs to their no-slash canonical (`/profile/` → `/profile`, `/en/profile/` → `/en/profile`). Previously `try_files` served both forms as `200`, so the slash variant was a crawlable duplicate — Google Search Console flagged `/profile/`, `/en/profile/`, `/profile` as "Crawled - currently not indexed". The redirect uses a `location ~ ^/(?!api/|umami/)(.+)/$` regex placed after the security/scanner blocks and before the insights SPA-fallback; the negative lookahead excludes the proxied `/api` + `/umami` prefixes (a matching regex would otherwise hijack DRF endpoints, which Django `APPEND_SLASH` requires the trailing slash on), and `absolute_redirect off` + a relative target keep the `Location` scheme-relative so Cloudflare Tunnel's http origin hop can't downgrade `https`→`http`
- Blog SEO: per-post `meta[name=keywords]` now leads with the post's own `tags` (`BlogDetail.tsx:174`) instead of only `category` + the generic `에멜무지로, 인사이트` fallback, so every post emits distinct keywords (e.g. `GPT-OSS, Gemma 3, Qwen 3.5, 오픈소스 LLM, MoE, ...`) — matters for Naver, which still indexes the keywords meta. Reuses `post.tags`, already fetched and already used by the OpenGraph `article:tag` and `StructuredData` Article schema on the same page
- CLAUDE.md restructured per the 2026-06 memory guidance (target < 200 lines / 25 KB per file): root `CLAUDE.md` slimmed 233 → 173 lines (24.2 KB) by moving domain-specific sections into path-scoped `.claude/rules/` files that auto-load only when Claude reads matching files — `frontend.md` (Architecture, UI Conventions, Testing, blog-HTML security; `paths: frontend/**`) and `backend.md` (constants, utilities, file-upload security, backend test-output note; `paths: backend/**`). Cross-cutting rules (Constraints, Gotchas, Development Flow, Code Conventions, CI/shell security) stay always-loaded in root. Byte-verified zero operational-content loss. `.gitignore` un-ignores `.claude/rules/` (negation pattern, like `frontend/.env.production`) so the rules travel with the repo to the second device; `settings.local.json` + `skills/` stay local
- deps: dev-tooling bumps — `vite` `8.0.16` → `8.1.3`, `eslint` `10.5.0` → `10.6.0`, `prettier` `3.8.4` → `3.9.4`, `@typescript-eslint/parser` `8.62.0` → `8.62.1`, `@types/node` `25.9.4` → `26.1.0`. Lockfile regenerated once (15 `@rolldown/binding-*` entries preserved per Gotcha #13); `tsc`, `vite build`, and 1213 vitest tests pass. README badges synced: Vite 8.1.3, plus the pre-existing React_Router_DOM `7.18.0` → `7.18.1` badge drift left by #356. Bundles dependabot #359/#360/#361/#362/#363 into one coordinated change
- deps: bumped all 12 `@tiptap/*` packages `3.25.0` → `3.26.0` in lockstep + both `@tiptap/core` overrides per Gotcha #14 (`npm ls @tiptap/core` resolves to one version; `tsc` + `vite build` clean), `axios` `1.16.1` → `1.17.0`, `knip` `6.15.0` → `6.16.1`, and `codecov/codecov-action` `6` → `7`. Lockfile regenerated once (15 `@rolldown/binding-*` entries preserved per Gotcha #13). README badges synced: TipTap 3.26.0, Axios 1.17.0, plus the pre-existing React_i18next `17.0.7` → `17.0.8` badge drift left by #323. Bundles dependabot #319/#324/#325 (`@tiptap/*`, which Gotcha #14 forbids merging piecemeal) + #326 (knip) + #327 (axios) into one coordinated change; #318 (codecov-action) merged separately (`cb3582c`, `a5ea7a7`)
- Teaching history: removed the two never-held upcoming 2026 entries 국회도서관 + 충청에너지서비스 (i18n keys 2/3) entirely; reclassified 멋쟁이사자처럼 부트캠프 `academic` → `enterprise`; reordered the 2026 block reverse-chronologically (KEITI → 스타벅스 → 한국지방재정공제회 → 암뮤니티 → 멋쟁이사자처럼) (`706789e`, `bec3721`, `f4e5629`)
- cSpell: added 6 terms from the resilient Codecov pre-trust step — `mktemp`, `Keybase`, `keyserver`, `elif`, `hkps`, `ownertrust` (`d77dabd`)
- CLAUDE.md Gotcha #6 npm-audit narrative: `9 vulns (2 low, 6 moderate, 1 high)` → `5 vulns (2 low, 2 moderate, 1 high)` — the 2026-06 axios/@tiptap bumps cleared the `brace-expansion`/`express`/`qs`/`ws` moderates; the remaining 5 are all `@lhci/cli` transitives (`tmp` high, `uuid`/`@lhci/cli` moderate, `inquirer`/`external-editor` low)
- CLAUDE.md Gotcha #6 npm-audit narrative: `5 vulns (2 low, 2 moderate, 1 high)` → `7 vulns (2 low, 4 moderate, 1 high)` — the `form-data` high cleared via the `^4.0.6` override, but a fresh lockfile resolution surfaced two new `@lhci/cli` moderates (`@lhci/utils`, `js-yaml`); all 7 remain dev-only build-tool transitives (`5bace609`)
- CLAUDE.md Gotcha #6 npm-audit narrative: `7 vulns (2 low, 4 moderate, 1 high)` → `5 vulns (2 low, 2 moderate, 1 high)` — regenerating the lockfile for the 2026-07 dev-tooling bumps (#359–#363) cleared the `@lhci/utils`/`js-yaml` moderates; the remaining 5 are all `@lhci/cli` transitives (`tmp` high, `uuid`/`@lhci/cli` moderate, `inquirer`/`external-editor` low)
- deps: bumped all 12 `@tiptap/*` packages `3.23.6` → `3.25.0` in lockstep + both `@tiptap/core` overrides (root + frontend) per Gotcha #14 — `npm ls @tiptap/core` confirms a single resolved version; `tsc`, `vite build`, and 1218 vitest tests pass (no `MISSING_EXPORT`/two-different-types). Also `knip` `6.4.1` → `6.15.0`. Bundles dependabot #310/#311/#312/#315 (individual `@tiptap/*` bumps, which Gotcha #14 forbids merging piecemeal) + #313 (knip) into one coordinated change

- Performance: dropped `framer-motion` (~13 KB gzip) in favor of Tailwind keyframes (`fade-up`, `dot-bounce`, `scale-pulse`) — homepage JS bundle reduced (`ee6e075`)
- Performance: restored Pretendard preload state (renderBlockingResources 0.5 → 1.0) (`cd909eb`)
- Refactored `scripts/prerender.js` and sitemap generation after audit pass (`6110ff4`)
- Tightened Task 2–5 implementations after rigor pass (`c9882de`)
- Internal notes relocated to gitignored `.private/` (local-only) (`4b2b02b`)
- CLAUDE.md `엄밀하게` verification pass: drift counts fixed (`35` → `39` teaching entries, `public(7)` → `public(11)`, `i18n keys 0-37` → `0-38`); Gotcha #6 npm audit narrative updated (`8 vulns / 4 low / 1 mod / 3 high` → `9 vulns / 3 low / 6 moderate / 0 high` — lodash/path-to-regexp patched, @lhci/cli transitives now top moderates) (`5e53ee1`)
- CLAUDE.md size 43,023 → 39,863 chars (under Claude Code's 40k performance gate); incident detail in Gotchas #13/#14/#15 + Two-device sync helpers compressed to commit-hash references (`5e53ee1`)
- CLAUDE.md/CONTRIBUTING.md/CHANGELOG.md/README.md refactored to Karpathy/gstack style — Architecture stripped to non-grep-derivable invariants, UI Conventions to principles (no copy strings or CSS snapshots), Gotchas compressed to rule + fix-cmd + commit-ref. CLAUDE.md final size 31,195 chars (-22 % vs the 40k-gate-trim baseline). Landed as PR #309 (`cdecbca`)
- `LogosSection` carousel arrangement made deterministic: 24 partners split 12/12 by `Math.ceil(N/2)` — Row 1 now exactly 10 enterprise + 2 universities (SNU at index 4, UOS at 8), Row 2 strict public ↔ education alternation (6 + 6). UOS promoted from Row 2 area so the runtime split lands on the intended boundary (was: nipa landing in Row 1 next to chaebol logos because Row 1 area had 11 items vs 13 in Row 2 area). In-file header comment now documents the even-length invariant (equal-row-count rule from UI Conventions) (`d2214ed`)
- Day1 partner description `'AI 교육 콘텐츠 협력'` → `'AI 교육 콘텐츠'` — dropped the speculative `'협력'` (cooperation) claim; the new wording describes Day1's business class, consistent with how 엘리스 / 멋쟁이사자처럼 entries describe partner activity (`621a8b7`)
- CLAUDE.md 엄밀하게 verification pass (2026-06-04): added `MAX_FAILED_CONTACT_ATTEMPTS` to the `api/constants.py` centralized-constants list; Gotcha #6 npm-audit narrative updated `9 vulns (3 low / 6 moderate / 0 high)` → `(2 low / 6 moderate / 1 high)` — the new `tmp` high is an `@lhci/cli` transitive (via `inquirer`/`external-editor`), same no-production-impact class as the moderates. Verified-clean (no drift, no edit): vendor chunks (7), prerender routes (10), privacy sections (13), all README version badges, test counts (1218/360)
- Removed dead `@jest-environment jsdom` docblocks from 4 frontend test files — Vitest reads `@vitest-environment` (not `@jest-environment`) and configures `jsdom` globally in `vitest.config`, and `jest-environment-jsdom` is not installed, so the docblocks were inert
- cSpell: zeroed the project warning backlog (was 87 across 14 files). Two-pronged: (1) `ignorePaths` for files dominated by auto-accumulating identifiers rather than prose — test fixtures (`backend/api/tests.py`, `frontend/src/**/__tests__/**`, `*.test.ts(x)`), Django-generated migrations (`backend/api/migrations/**`), and `CHANGELOG.md` (every entry cites a git short-SHA, never dictionary-resolvable); (2) added 49 legitimate terms to the dictionary — bot user-agents (`Baiduspider`, `bingbot`, `Twitterbot`, `facebookexternalhit`, `Discordbot`), web-vitals/editor/tooling terms (`TTFB`, `tiptap`, `grecaptcha`, `rowspan`, `redoc`, `networkidle`, `domcontentloaded`), AI model names cited in blog content (`Qwen`, `Kimi`, `Nemotron`, `MMLU`), and code identifiers (`viewsets`, `remoteip`, `seohelmet`, `forex`, `nums`)

### Fixed

- `scripts/auto-deploy.sh`: backend never redeployed — every backend-only change shipped stale code to production while the site looked updated. The deploy webhook runs under a non-interactive launchd PATH that omits Docker Desktop's app-bundle bin, so `docker compose up -d --build backend` failed resolving the `COPY --from=ghcr.io/astral-sh/uv` registry metadata with `docker-credential-desktop: executable file not found`. `set -e` then aborted the script AFTER the host-side `npm run build` (frontend bind mount → site refreshes immediately) but BEFORE the backend container recreate and health checks, so the failure was invisible: the homepage `last-modified` advanced while the backend container kept running old code, and the `Deploy to Mac Mini` CI job is green because `deploy-webhook.js` returns `200` on trigger-accept, not on deploy-success. Fix prepends `/Applications/Docker.app/Contents/Resources/bin` to PATH so the credential helper resolves. Caught when a `/cso` Finding 2 removal of `POST /api/auth/register/` (and the prior login-throttle change) were merged but the endpoint kept responding with old-code behavior in production
- `scripts/auto-deploy.sh` (follow-up to the PATH fix above): with the helper now on PATH, `docker-credential-desktop` instead HUNG under the launchd session (it can't reach Docker Desktop's credential backend), so BuildKit metadata resolution for the public base images still timed out — `#4 load metadata for ghcr.io/astral-sh/uv → DeadlineExceeded` — and the backend still never rebuilt (verified by triggering the real webhook twice). Fix builds under a scoped `DOCKER_CONFIG` (`~/.docker-deploy-config`) copied from `~/.docker` with the `credsStore` line stripped, so the public images resolve anonymously without invoking the hanging helper. cli-plugins (`docker compose`), contexts (`desktop-linux` daemon connection) and buildx are copied through; the copy is selective to skip the unix sockets under `~/.docker` that would trip `set -e`
- CI `Pre-trust Codecov GPG key` step hard-failed every `main-ci-cd` run (and blocked deploy) when `keybase.io/codecovsecurity/pgp_keys.asc` began returning 404 (known intermittent outage, codecov/codecov-action#1876). The custom `.github/actions/setup-codecov` composite is belt-and-suspenders — codecov-action verifies the uploader signature itself and both upload steps are `fail_ci_if_error:false` — so the pre-trust must never break CI. Now best-effort: keyserver fallback, fingerprint-pinned trust, warning-only on outage (`575b314`)
- nginx `.well-known` / `cdn-cgi` probe blocks served the full ~41 KB SPA shell on 404 instead of withholding HTML from scanners. The server-level `error_page 404 /index.html` (SPA-fallback for human-facing unknown routes) intercepted the `try_files =404` / `return 404` in those blocks, re-injecting the exact `index.html` body they document as withheld — observed in production logs as `GET /.well-known/traffic-advice → 404 41132` (41132 bytes = prerendered homepage). Added a `@scanner_404` named location (`return 404`, not re-intercepted since `recursive_error_pages` is off by default) and pointed both blocks' `error_page` at it, so probes now get nginx's minimal built-in 404. The `444` blocks (`.php`/`.env`/dotfiles/wp-\*) were already correct — `444` closes the connection with no response, so `error_page` never applied. Validated with `nginx -t` against the running Mac mini frontend container
- CI `Test Affected Code` backend step: dropped `--parallel` from `manage.py test`. Django's parallel runner crashed with `TypeError: cannot pickle 'traceback' object` (a pre-existing test-isolation bug, reproducible on `main` independent of this branch). The 360-test suite runs serially in ~0.3s, so parallel bought no speed, and serial is already the standard everywhere else (`main-ci-cd.yml` coverage job, `CLAUDE.md`, local dev) — this just aligns the lone outlier
- `vitest.config.ts`: replaced `maxThreads`/`minThreads` with the single top-level `maxWorkers` — Vitest 4 removed per-pool thread options (and `poolOptions`) from `InlineConfig`. The config is outside `tsconfig`'s `include: ["src"]` so `tsc` never type-checked it; the error only surfaced in-editor. Caps CI parallelism (the original intent); runtime unchanged
- `sentry.ts`: removed a stale `// eslint-disable-next-line @typescript-eslint/no-empty-function` directive that the current ESLint config no longer needs (flagged as unused-disable)
- SEO: hreflang alternates emitted at source instead of post-prerender dedup (`c963433`)
- `codecov.yml`: `require_ci_to_pass: yes` → `true` (YAML 1.1 alias failed strict schema validation) (`19edc2d`)
- README package badges: 5 stale versions synced after 13 dependabot merges that updated `package.json` without touching badges, plus added `react-i18next` badge to close the gate gap that allowed the drift (`6409c11`)
- `react-dom` split-bump (Gotcha #8): dependabot's `react` group co-locates PRs in the review queue but does not bundle the bumps — react 19.2.5 → 19.2.6 (#301) merged alone, leaving Vitest crashing with "Incompatible React versions" on every test load (`8ab71fe`)
- `@tiptap/*` peer-pin mismatch (Gotcha #14 reload): mixed `^3.23.1` / `^3.23.4` sibling ranges after #296/#298/#300/#307 produced `[MISSING_EXPORT] cancelPositionCheck` build error because `@tiptap/react@3.23.4` peer-pins `@tiptap/core: 3.23.4` EXACTLY but override `^3.23.4` resolved to 3.23.6. Aligned all 12 `@tiptap/*` direct deps + root + frontend overrides to `^3.23.6` and added `@tiptap/core` as direct frontend dep so `import from '@tiptap/core'` resolves from `src/` (`aca14b3`, `2c41535`)
- README badge sync: 4 stale versions drifted again after the 2026-05-18 dependabot wave — React (19.2.5 → 19.2.6), React_Router_DOM (7.15.0 → 7.15.1), Axios (1.15.0 → 1.16.1), TipTap (3.23.1 → 3.23.6) — followed by Playwright (1.59.1 → 1.60.0) pre-bump for PR #303 (`b0e68e1`, `729d323`, `8c9915f`)
- `LogosSection` img overflow: `h-12 w-auto object-contain` let `imunityLogo.svg` (290×22, 13:1 aspect) render at 48×632 — far beyond the `w-40` (160 px) slot — disrupting carousel layout. Added `max-w-40` to clamp at slot boundary (`0ac9f64`); follow-up: normalized the source SVGs themselves via `viewBox` padding (Starbucks 1:1 → 3:1 canvas, Imunity 13:1 → 3:1 canvas via vertical padding) so all 24 slots now share identical 48×144 dimensions with content centered (`621a8b7`)
- `vitest.config.ts`: import `defineConfig` from `'vitest/config'` instead of `'vite'` — VS Code TS server reported `test does not exist in type UserConfigExport` despite the triple-slash directive; `vitest/config` exposes the correctly-typed `defineConfig` (UserConfig with `test` built in) and removes the need for the triple-slash hack (`f03df2d`)

### Security

- Tightened CSP: removed `data:` from `script-src`, removed `cloudflareinsights.com` references, dropped dead `msw` + `terser` deps that generated dependabot churn (`700c941`)
- urllib3 2.6.3 → 2.7.0: patched CVE-2026-44431 (information disclosure via cross-origin redirects forwarding sensitive headers) and CVE-2026-44432 (DoS from excessive HTTP response decompression); Trivy HIGH-severity gate was blocking every PR Security Scan (`a7a2cc6`)
- pyjwt 2.12.1 → 2.13.0: patched CVE-2026-48526 (authentication bypass via forged JSON Web Tokens), a `djangorestframework-simplejwt` transitive bumped in `uv.lock` only (simplejwt pins `pyjwt>=1.7.1`); Trivy HIGH gate (`046b2cff`)
- form-data 4.0.5 → 4.0.6: patched CVE-2026-12143 (CRLF injection via unescaped multipart field/file names), an axios transitive pinned via root + frontend `^4.0.6` override (axios accepts `^4.0.5`); Trivy HIGH gate (`046b2cff`)
- Dedicated brute-force throttle on the login endpoint: new `LoginRateThrottle` (`scope = "login"`, `10/hour` per IP) replaces reliance on the global `anon` rate (`100/hour`). `POST /api/auth/login/` previously allowed 100 password guesses per IP per hour against the single admin account with no account lockout; the new scope tightens that to 10, matching the priority of the `contact` (5/hour) and `newsletter` (3/hour) scopes. Regression test asserts the 11th attempt returns 429
- Removed the unused public registration endpoint `POST /api/auth/register/` (`AllowAny`) and its frontend wiring (`AuthContext.register`, `api.register`, `auth.registerFailed` i18n keys). The site has a single-admin auth model (admin created via `createsuperuser`; blog comments are anonymous), no signup UI ever exposed the endpoint, and registered users were non-staff with no capabilities beyond anonymous visitors — so it was pure unauthenticated attack surface (account/DB-spam vector). Shrinks the public API; re-add with a proper signup flow if member accounts are built later

### Dependencies

| Group           | Bumps                                                                                                                                                                                                                                                                                                                                                        |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Build chain     | vite 8.0.8 → 8.0.10, typescript 6.0.2 → 6.0.3, prettier 3.8.2 → 3.8.3, postcss 8.5.10 → 8.5.15 (#280, #306), @vitejs/plugin-react 6.0.1 → 6.0.2 (#305)                                                                                                                                                                                                       |
| React           | react 19.2.5 → 19.2.6 (#301), react-dom matched in `8ab71fe`, react-router-dom 7.14.0 → 7.18.0 (#297, #339)                                                                                                                                                                                                                                                  |
| i18n            | react-i18next 17.0.2 → 17.0.8, i18next 26.0.4 → 26.0.6                                                                                                                                                                                                                                                                                                       |
| Editor (TipTap) | react, starter-kit, extension-typography, extension-link, extension-task-item, extension-task-list, extension-code-block-lowlight, extension-image, extension-placeholder, extension-underline, pm, core (override): aligned to `^3.27.1` (via 3.23.6 → 3.26.0 → 3.26.1 → 3.27.1; #319/#324/#325, #329-#334, #336/#340 — Gotcha #14 forbids piecemeal merge) |
| HTTP / network  | axios 1.15.0 → 1.17.0 (#304, #327), 1.18.0 → 1.18.1 (#353), urllib3 2.6.3 → 2.7.0 (CVE patch, backend)                                                                                                                                                                                                                                                       |
| Telemetry       | @sentry/react 10.48.0 → 10.59.0 (#271, #299, #338)                                                                                                                                                                                                                                                                                                           |
| Lint            | eslint 10.3.0 → 10.4.1 (#302), @typescript-eslint/parser 8.58.2 → 8.61.0, @typescript-eslint/eslint-plugin 8.61.1 → 8.62.0 (#349), eslint-plugin-react-hooks 7.0.1 → 7.1.1, globals 17.6.0 → 17.7.0 (#351), lint-staged 15.5.2 → 17.0.7 (#292)                                                                                                               |
| Test tooling    | @playwright/test 1.59.1 → 1.61.0 (#303, #337), vitest 4.1.4 → 4.1.5, @vitest/coverage-v8 4.1.4 → 4.1.5 (#275, #279)                                                                                                                                                                                                                                          |
| CSS             | autoprefixer 10.4.27 → 10.5.0                                                                                                                                                                                                                                                                                                                                |
| Types           | @types/node 25.6.0 → 25.9.2 (#289, #308), DOMPurify (#274)                                                                                                                                                                                                                                                                                                   |
| CI actions      | aquasecurity/trivy-action 0.35.0 → 0.36.0, actions/checkout 6 → 7 (#335), actions/cache 5 → 6 (#347, composite action aligned in `3b03acdd`)                                                                                                                                                                                                                 |
| Icons           | lucide-react 1.17.0 → 1.18.0 (#328), 1.21.0 → 1.22.0 (#350)                                                                                                                                                                                                                                                                                                  |
| Tooling         | knip 6.17.2 → 6.23.0 (#348), concurrently 9.2.3 → 10.0.3 (#354, major — `-n`/`-c` only, Node ≥24 ≥ 22, CLI so ESM-only is moot)                                                                                                                                                                                                                              |

### CI

- `scripts/auto-deploy.sh`: nginx.conf-only changes now actually deploy. `frontend/nginx.conf` is a bind mount, so the prior `docker compose up -d frontend` was a no-op for config edits (compose sees no service change; on macOS Docker the mount also caches the pre-pull inode after git rewrites the file, so even `nginx -s reload` reads a stale view). The script now diffs `PREV_HEAD..HEAD` for `frontend/nginx.conf`; when it changed, it validates the new config inside the running frontend container (`docker cp` to a temp path + `nginx -t -c`, which resolves `proxy_pass` upstreams on the compose network — a throwaway off-network container false-fails with "host not found in upstream") — aborting WITHOUT touching the running frontend if invalid — then `--force-recreate frontend` so the mount re-resolves to the current file
- `pr-checks.yml`: README badge drift gate expanded from 7 to 14 entries (added React_i18next; tightened detection of stale frontend badges before merge) (`6409c11`)

### Documentation

- README test counts auto-corrected (Vitest 1217 → 1218 after SEOHelmet unmount test) (`d9cff66`)
- README: top-nav link to `CHANGELOG.md` (`ee9caaf`)
- CLAUDE.md: two-device sync workflow + 2026-04-16 production drift incident postmortem (`6c53ae9`)
- CLAUDE.md: Gotcha #12 — `Auto-Merge Dependabot` job auto-merges only `semver-patch`; minor/major are intentionally held for manual review (caught when 5 minor PRs sat green-but-open after CI unblock) (`f4d8f76`)
- CLAUDE.md: Gotcha #16 — Node major bump is a 3-file lockstep, not a dependabot drive-by (`bd4b7fe`)
- Journal: 2026-04-16 session consolidation + framer-motion baseline note (`f803626`, `45797c2`)
- README / CLAUDE.md / CHANGELOG.md / CONTRIBUTING.md refactored to Karpathy/gstack style — separate principles from implementation snapshots, move incident lore to commit references, tighten invariants
- `.npmrc`: corrected stale legacy-peer-deps rationale — the "React 19.2 peers resolve cleanly" comment omitted that a fresh `npm install` still ERESOLVEs because `eslint-plugin-jsx-a11y@6.10.2` peer-caps eslint at `^9` while we run `^10` (now cross-references Gotcha #13) (`ca415cb0`)
- cSpell dictionary +6 terms surfaced by workflows / rules / locales: `axios`, `dompurify`, `hmac`, `makemigrations`, `autorun`, `Ewha` (`6ccbb381`, `8690fb5b`)

## [1.0.0] - 2026-04-16

First documented release. Represents the current production state deployed at https://emelmujiro.com.

### Features

- Bilingual (i18n) with URL-based routing: Korean default, `/en` prefix for English
- Teaching History page: 35 entries across 5 years (2022–2026) with 4 org-type filters (enterprise, MOEL K-Digital, public, academic)
- Insights (blog) with TipTap rich text editor, slug URLs (`/insights/:slug`), image upload, IP-based likes, nested comments
- Testimonials dual-row carousel: enterprise training + 고용노동부 K-디지털 reviews, touch pause/resume, reduced-motion slow mode
- Privacy Policy: 13-section bilingual page compliant with Korean PIPA Article 30, including Google Form collection + Google LLC delegation
- Auth via httpOnly cookie JWT with shared-promise refresh queue
- Google Form contact integration

### SEO

- Sitemap including blog posts, `SITE_URL` read from `package.json`
- hreflang alternate links deduplicated in prerendered HTML
- JSON-LD structured data (Article, Breadcrumb, Organization)
- SSG prerendering for 10 routes (5 static × ko/en) via `scripts/prerender.js`
- Canonical URL auto-computed from `location.pathname`
- Proper 404 for unknown paths instead of SPA soft-200
- `noindex` on 404 pages

### Performance

- 7-chunk vendor splitting: `react-vendor`, `ui-vendor`, `i18n`, `sentry`, `http-vendor`, `dompurify`, `tiptap`
- Sentry lazy-loaded via re-export shim — 0 bytes on homepage
- Pretendard font: static → variable (3.8 MB → 2 MB)
- Google Analytics replaced with Umami collect API
- Carousel copies 3x/5x → 2x (homepage DOM 934 → 582 nodes)
- moduLogo pixel waste 90% → 8%, nanoLogo JPEG → WebP
- Partner logos resized (ablearn 932 → 400 px, uos 407 → 256 px)
- Lighthouse CLS 0.528 → 0.000 on blog pages
- < 10 MB build budget enforced in `pr-checks.yml`

### Infrastructure

- Docker Compose deployment on Mac mini with ports bound to `127.0.0.1`
- Cloudflare Tunnel for external access (no public port exposure)
- Umami self-hosted analytics (`localhost:3001`, nginx proxy at `/umami/api/send`)
- Django backend on PostgreSQL (production) + SQLite (local dev)
- React 19 + Vite 8 frontend
- Timezone `Asia/Seoul` on both backend and frontend containers
- Two-device dev bootstrap via `scripts/setup-dev-machine.sh`
- Docker health check script with 5-minute cron monitoring

### Security

- DOMPurify HTML sanitization for all TipTap content
- CSP headers in `nginx.conf` and meta tag (`unsafe-inline` for inline scripts, no `unsafe-eval`)
- `X-Forwarded-For` no longer trusted in `get_client_ip` — direct peer IP only
- Blocked URL patterns: dotfiles, `wp-*` probes, AI credential paths (`mcp.json`, `credentials.json`, `keys.json`)
- File uploads: `uuid4` filenames, extension whitelist, MIME check, 5 MB limit
- CI `${{ }}` injection prevention (bind to `env:` first)
- Trivy filesystem scan on every PR

### CI/CD

- GitHub Actions: lint, type-check, test, Trivy, bundle size, Lighthouse, Codecov
- Auto-deploy via webhook (`scripts/deploy-webhook.js`) with `timingSafeEqual` secret verification
- Pre-commit via Husky + lint-staged
- README drift gates: package badges validated, test counts auto-corrected via `[skip ci]` commits
- Conventional commits enforced via `commit-msg` hook
- Scripts exit non-zero on failures (no more silent `FOO=$(failing_cmd)` under `set -e`)

### Monitoring

- Sentry error tracking (lazy-loaded)
- Umami analytics (self-hosted, zero external scripts)
- Daily SiteVisit cleanup cron (`make setup-cron`)
- Docker health check cron (`make setup-health-cron`)

### Testing

- Vitest (1217 tests)
- Django unittest (358 tests)
- Playwright E2E across 5 browser profiles (chromium, firefox, webkit, mobile chrome, mobile safari)
- 100 % coverage target

[Unreleased]: https://github.com/researcherhojin/emelmujiro/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/researcherhojin/emelmujiro/releases/tag/v1.0.0

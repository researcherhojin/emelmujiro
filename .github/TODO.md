# Backlog

Actionable work identified in prior sessions but deliberately deferred. Each
entry states **Goal**, **Why**, **How**, **Verify**, and **Effort** so another
engineer (or a future Claude session) can pick it up without reading history.
Items resolved in a session should be removed in the same commit that closes
them.

## 1. Performance — Lighthouse residual after 2026-04-11 Phase 4

All four routes sit above the 0.85 performance warn threshold after the Phase
4 pass (commits `3b254d7..5ff5f0f`). Current local-preview scores: `/` P 0.88,
`/contact` P 0.86, `/profile` P 0.88, `/insights` P 0.89. Items below would
close the individual audits still firing as warnings.

### 1.1 Virtualize homepage carousels (dom-size 0.5 → 1.0)

- **Goal**: drop `/` DOM node count from ~934 to < 800 so the
  `dom-size` audit stops warning.
- **Why**: `LogosSection` renders 20 partners × 3 copies (60 nodes + img
  children), `TestimonialsSection` renders 16 items × 2 copies (32 nodes +
  children), both eagerly. The 3x/2x copies exist so the CSS
  `translateX(-33.333%)` keyframe can loop without visible seams (see
  CLAUDE.md "Scroll carousels"). Homepage-only — other routes score 1.0.
- **How**:
  - Option A (simpler): reduce copy count from 3x → 2x on Logos and verify
    the CSS keyframe math still loops cleanly (`-50%` translate). Measures
    ~30% fewer nodes.
  - Option B: replace CSS marquee with a real scrolling `react-window`
    virtualization that only mounts in-viewport items plus one-screen
    buffers. Larger refactor, risk of animation jank.
- **Verify**: `npx @lhci/cli autorun` — `/` `dom-size` audit ≥ 0.9 AND
  overall `/` performance ≥ 0.90 (no regression).
- **Effort**: 1–2 h (Option A), 4+ h (Option B).

### 1.2 Replace Google Form with `backend/api/contact/`

- **Goal**: `/contact` best-practices 0.78 → ≥ 0.90 and remove the
  third-party cookie warnings.
- **Why**: The Google Form iframe ships `S`, `COMPASS`, `NID` cookies and
  triggers our own CSP report-only `frame-ancestors 'self'` violation on
  every load — these are the two line items dragging the `/contact`
  best-practices score. `backend/api/contact/` already exists and is
  fully tested (`ContactView` at `backend/api/views.py:363`, URL at
  `backend/api/urls.py:58`, reCAPTCHA flow, spam keyword check, rate
  limit). CLAUDE.md "Contact" explicitly notes the endpoint is preserved
  for exactly this swap.
- **How**:
  - Build a simple controlled `<form>` in `ContactPage.tsx` posting via
    `api.createContact()` (need to add the helper to `services/api.ts`).
  - Preserve reCAPTCHA client integration (`VITE_RECAPTCHA_SITE_KEY` env
    var; backend already validates server-side).
  - Delete `<iframe src={GOOGLE_FORM_URL}>`, the `iframeLoaded` state,
    and the `frame-src https://docs.google.com` CSP exception in
    `index.html`.
  - Update i18n copy for success/error toasts to match the existing
    patterns from other mutation endpoints.
- **Verify**: Lighthouse `/contact` `categories.best-practices` ≥ 0.90,
  `third-party-summary` audit no longer mentions `docs.google.com`, a new
  Playwright e2e test submits the form end-to-end against a running
  backend.
- **Effort**: 2–3 h including UX polish and i18n.

### 1.3 Replace Google Analytics with a lighter provider

- **Goal**: `unused-javascript` ≥ 0.9 (currently 0) and `legacy-javascript`
  ≥ 0.9 (currently 0.5) on all four URLs.
- **Why**: `gtag.js` is 156 kB with 86 kB wasted (56%) per page and ships
  ES5 polyfills Lighthouse flags as legacy — these two audits are the
  last things preventing `/` and `/insights` from scoring 0.90+. Our
  actual tracking surface is 5 custom events (page view, CTA click, blog
  view, dark mode toggle, language switch) in `src/utils/analytics.ts`.
  Plausible (~1 kB script) or Umami (self-hostable, ~2 kB) both cover
  this feature set.
- **How**:
  - Inventory the 5 `track*` functions and decide which events are
    genuinely load-bearing for decision-making.
  - Provision Plausible account _or_ install Umami Docker container
    next to the backend on Mac mini.
  - Rewrite `initAnalytics` implementation and the external script URL.
    Keep the public `trackX` API unchanged so callers don't move.
  - Update `.env.production` and CLAUDE.md "Monitoring" section.
- **Verify**: Lighthouse `unused-javascript` ≥ 0.9, `legacy-javascript`
  ≥ 0.9. Confirm new analytics backend receives the 5 events in a
  staging deploy.
- **Effort**: 3–4 h.

### 1.4 moduLogo.webp re-encoding

- **Goal**: close the last entry on `/` `uses-responsive-images` (currently
  0.5, moduLogo still 6 kB wasted / 6 kB total).
- **Why**: Python PIL's Lanczos + quality 82 actually grew this specific
  file from 6830 B → 8050 B and was reverted in commit `f7b785f`. Other
  encoders (cwebp with tuned quality/method) usually produce smaller
  output for already-optimized WebP inputs.
- **How**:
  - `brew install webp`
  - `cwebp -q 75 -m 6 -resize 320 0 moduLogo.webp -o moduLogo.new.webp`
  - If `moduLogo.new.webp` is smaller than the source, replace; otherwise
    move on — this is a 2 kB savings at most.
- **Verify**: `/` `uses-responsive-images` audit ≥ 0.9 after rebuild.
- **Effort**: 15 min.

## 2. Infrastructure / Ops

### 2.1 Tighten Lighthouse CI assertion gates

- **Goal**: lock in Phase 4 perf gains so a future regression breaks CI
  instead of silently shipping.
- **Why**: `frontend/lighthouserc.js` currently has `categories:performance`
  and `categories:best-practices` as `warn` (not `error`). That's exactly
  why the Phase 4 residuals (CLS 0.528, perf 0.58) went silently unfixed
  for months — CI never failed on them. Now that scores are healthy, the
  gate should enforce them.
- **How**:
  - Bump `categories:performance` from `['warn', { minScore: 0.85 }]` to
    `['error', { minScore: 0.85 }]`.
  - Consider adding numeric LCP assertion: `largest-contentful-paint`
    error at `maxNumericValue: 3500` (currently 5000 warn).
  - Ratchet `best-practices` to error once Google Form is replaced (§1.2),
    not before — `/contact` currently sits at 0.78 for documented reasons.
- **Verify**: create a PR with an intentional regression (e.g. re-add the
  Inter font link) — CI Lighthouse job must fail.
- **Effort**: 30 min including gate test.

### 2.2 Verify 2026-04-12 03:00 cron first real fire

- **Goal**: confirm that the `make setup-cron` absolute-docker-path fix
  (`d2582b3`) survives the real cron daemon on its first actual schedule.
- **Why**: Phase 1 verified end-to-end by setting a temporary M+2 cron
  entry that fired through the real daemon, so the path is already
  tested. But the literal 03:00 entry hasn't yet rolled over.
- **How**: after 2026-04-12 03:00, check
  `tail -20 backend/logs/sitevisit-cleanup.log` — should contain a new
  timestamped "Bytecode compiled" + "No old SiteVisit records to delete."
  pair. Confirm `/var/mail/$USER` is 0 bytes (no delivery failures).
- **Effort**: 2 min verification.

## 3. 콘텐츠

- [ ] 블로그 포스트 기획 — AI Agent 실전 구축 가이드, RAG 파이프라인 설계 등 서비스 영역(교육·컨설팅·개발)과 직접 연결되는 기술 콘텐츠 시리즈. 첫 포스트는 최근 K-Digital 강의에서 받은 질문 기반이 좋음.

## 4. 기능 개선

- [ ] 멘토링/활동 이력 추가 검토 — ICT 피우다 멘토, 해커톤 심사위원, 오픈소스 컨트리뷰션 등 교육 외 활동을 별도 섹션 또는 기존 이력에 통합할지 검토. Teaching History 35개 엔트리 옆에 "활동 이력" 서브섹션이 가장 자연스러움.

## 5. SEO (2026-04-02 이후 이월)

작업 완료 후 GSC에 들어가 각 항목 상태를 직접 확인해야 함. 9일 이상 경과했으므로 대부분 자동 재크롤로 해소됐을 가능성 있음.

- [ ] GSC 사이트맵 재제출 — `sitemap.xml`에 `/privacy` 추가됨. GSC → 사이트맵 → 재제출.
- [ ] GSC 색인 요청 — URL 검사에서 `/privacy`, `/en/privacy`, `/en/profile` 각각 "색인 생성 요청".
- [ ] GSC redirect 오류 (4건) + `/cdn-cgi/` 404 — robots.txt에 `Disallow: /cdn-cgi/` 추가 완료. 재크롤 시 자동 해소 예상.

## 6. 법률 / 컴플라이언스

- [ ] 개인정보처리방침 법률 검토 — 개인정보 보호법 제30조 기준 13개 섹션 작성 완료. 법률 전문가 최종 검토 후 보완 필요 시 `frontend/src/i18n/locales/ko.json` → `privacy` 섹션 수정.

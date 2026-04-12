# Backlog

Actionable work identified in prior sessions but deliberately deferred. Each
entry states **Goal**, **Why**, **How**, **Verify**, and **Effort** so another
engineer (or a future Claude session) can pick it up without reading history.
Items resolved in a session should be removed in the same commit that closes
them.

## 1. Performance — Lighthouse residual

Phase 4 (`3b254d7..5ff5f0f`) brought all four routes above the 0.85 perf
warn threshold. Subsequent commits closed two of the four follow-ups:

- ✅ **dom-size 0.5 → 1.0** on `/` — carousel copies reduced 3x/5x → 2x
  (`7952142`). Homepage DOM dropped 934 → 582 nodes. Math: `translateX(-50%)`
  for 2-copy loop (see CLAUDE.md "Scroll carousels").
- ✅ **uses-responsive-images** audit 100/100 — moduLogo 90% pixel waste
  fixed by re-resize at 256×100 (`b0f6ab0`), nanoLogo JPEG → WebP (-51%
  bytes), ablearnLogo + uosLogo also resized. Verified via Playwright
  `naturalWidth × DPR` audit against the built site.

Items below close the audits **still** firing as warnings. The biggest
remaining levers are structural — third-party scripts (Google Form, gtag).

### 1.1 Replace Google Form with `backend/api/contact/`

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

### 1.2 Replace Google Analytics with a lighter provider

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

### 1.3 Lazy-load Sentry via re-export shim (chunk 77 kB → ~5 kB on home)

- **Goal**: drop Sentry from `unused-javascript` (currently 72 kB wasted of
  77 kB on `/`) by deferring chunk load until an error/login actually fires.
- **Why**: 96% of the Sentry chunk is unused on the home page. Two prior
  reduction attempts both failed and are documented in `frontend/src/utils/sentry.ts`:
  (1) namespace → named imports gave zero size delta — Vite was already
  tree-shaking. (2) `await import('@sentry/react')` ballooned the chunk
  77 kB → 438 kB because dynamic import of a barrel package defeats
  tree-shaking. The 72 kB unused is module-eval overhead from `init()`'s
  default integrations, not dead exports.
- **How**: re-export shim pattern.
  - Create `src/utils/sentry-impl.ts` with **static** named imports of the
    5 functions actually used (`init`, `captureException`, `withScope`,
    `setUser`, `addBreadcrumb`) plus a tiny `init()` wrapper containing
    the current config.
  - Rewrite `src/utils/sentry.ts` so each public function:
    1. Lazily resolves a module-level `implPromise = import('./sentry-impl')`
       on first call.
    2. Awaits and dispatches. The shim is local code, so Rollup tree-shakes
       across the dynamic boundary.
  - `initSentry()` becomes async and is called from `main.tsx` without
    await — accept that errors during the first ~200 ms before the shim
    chunk loads won't reach Sentry. ErrorBoundary still renders fallback UI.
  - Verify `sentry-*.js` chunk is **not** preloaded in `index.html` after
    rebuild (Vite should put it in `async` modulepreload only).
- **Verify**: `/` `unused-javascript` ≥ 0.9 AND total `sentry-*.js` bytes
  delivered on home page = 0 (check via `network` panel or Lighthouse
  `network-requests` audit).
- **Effort**: 1–2 h. Risk: if Vite bundles the shim chunk back into the
  main graph (because it's referenced from a "hot" code path), the
  pattern fails — at that point switch to a runtime feature flag and
  load Sentry only on `window.error` / `unhandledrejection` listeners.

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

# Backlog

Actionable work identified in prior sessions but deliberately deferred. Each
entry states **Goal**, **Why**, **How**, **Verify**, and **Effort** so another
engineer (or a future Claude session) can pick it up without reading history.
Items resolved in a session should be removed in the same commit that closes
them.

## 1. Performance — Lighthouse residual

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
- **Prereq**: Gmail SMTP must be configured on Mac mini first — uncomment
  and set `EMAIL_HOST_USER` + `EMAIL_HOST_PASSWORD` (Gmail app password)
  in `backend/.env.production`. Without this, `send_mail()` fails and
  the contact form returns 500.
- **How**:
  - Build a simple controlled `<form>` in `ContactPage.tsx` posting via
    `api.createContact()` (need to add the helper to `services/api.ts`).
  - Preserve reCAPTCHA client integration (`VITE_RECAPTCHA_SITE_KEY` env
    var; backend already validates server-side).
  - Delete `<iframe src={GOOGLE_FORM_URL}>`, the `iframeLoaded` state,
    and the `frame-src https://docs.google.com` CSP exception in
    `index.html` and `nginx.conf`.
  - Update i18n copy for success/error toasts to match the existing
    patterns from other mutation endpoints.
  - Ratchet `categories:best-practices` from `warn` to `error` in
    `lighthouserc.js` once `/contact` score clears 0.90.
- **Verify**: Lighthouse `/contact` `categories.best-practices` ≥ 0.90,
  `third-party-summary` audit no longer mentions `docs.google.com`, a new
  Playwright e2e test submits the form end-to-end against a running
  backend.
- **Effort**: 2–3 h including UX polish and i18n.

## 2. 콘텐츠

- [ ] 블로그 포스트 기획 — AI Agent 실전 구축 가이드, RAG 파이프라인 설계 등 서비스 영역(교육·컨설팅·개발)과 직접 연결되는 기술 콘텐츠 시리즈. 첫 포스트는 최근 K-Digital 강의에서 받은 질문 기반이 좋음.

## 3. 기능 개선

- [ ] 멘토링/활동 이력 추가 검토 — ICT 피우다 멘토, 해커톤 심사위원, 오픈소스 컨트리뷰션 등 교육 외 활동을 별도 섹션 또는 기존 이력에 통합할지 검토. Teaching History 35개 엔트리 옆에 "활동 이력" 서브섹션이 가장 자연스러움.

## 4. 법률 / 컴플라이언스

- [ ] 개인정보처리방침 법률 검토 — 개인정보 보호법 제30조 기준 13개 섹션 작성 완료. 법률 전문가 최종 검토 후 보완 필요 시 `frontend/src/i18n/locales/ko.json` → `privacy` 섹션 수정.

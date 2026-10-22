---
status: shipped
module: frontend
created: 2026-10-23
updated: 2026-10-23
---

# A tap on a touch screen leaves no hover style behind

## Intent

- **Problem**: `src/index.css` pinned v3's hover with `@custom-variant hover (&:hover);`, one of the Tailwind 4 parity shims (`docs/intents/frontend/tailwind-v4-migration.md`).
  - With that pin, every `hover:` and `group-hover:` utility applies on touch screens too. Mobile browsers keep `:hover` on the last tapped element, so a tapped button or card keeps its hover color until something else is tapped.
  - The 2026-10-22 shim inventory counted 153 `hover:` and 18 `group-hover:` uses. 149 of the `hover:` uses are on or inside elements people tap (113 directly on `<button>`). The site explicitly supports the KakaoTalk in-app browser (`frontend-build.md` › KakaoTalk WebView), a touch-only environment.
  - `frontend-build.md` lists the shims as "must stay unless a redesign is intended". On 2026-10-23 the owner chose to drop this one and take v4's default.
- **Outcome wanted**:
  - Hover styles apply only where the primary input can hover. Mouse and trackpad hover stays exactly as before.
  - No static screen changes.
  - The carousel pause keeps working on touch.
- **Affected systems**:
  - `frontend/src/index.css`
  - the Tailwind section of `.claude/rules/frontend-build.md`
  - the Tailwind intent's post-ship facts
- **Constraints**:
  - Do not touch the other parity shims.
  - The carousel pause is a hand-written `.group:hover .group-hover\:pause` rule (`index.css`) plus a JS `touchstart`/`touchend` path (`LogosSection`, `TestimonialsSection`). It stays as is.

## Spec

- **Approach**: delete the `@custom-variant hover` line and its comment. Tailwind 4 then wraps every hover utility in `@media (hover: hover)`.
- **Files and interfaces**:
  - `index.css`
  - `frontend-build.md`: the shim list, plus a note on the carousel rule
  - the Tailwind intent
  - The same `frontend-build.md` edit corrects its `VITE_API_URL` quote to the file's trailing `/`. #633 made the same correction in `CLAUDE.md`.
- **Out of scope**:
  - Restyling hover states.
  - Adding `:active` or focus feedback for touch.
  - The other shims.
- **Done when**:
  - **Built CSS**: every `:hover` utility rule sits inside `@media (hover: hover)`. The only exception is the hand-written carousel rule.
  - **Media query**: under Playwright's Pixel 5 emulation (`isMobile`, `hasTouch`), `matchMedia('(hover: hover)')` is false. Under a mouse context at the same width it is true.
  - **Mouse hover**: hovering the mobile menu button with the mouse yields the same background in both builds.
  - **Static captures**: the visual-diff harness finds no difference between the two builds beyond its known noise.

## Plan

- **Changes**: `index.css`, `frontend-build.md`, the Tailwind intent, the CHANGELOG entry.
- **Risks**:
  - A device that reports `hover: none` but has a mouse attached loses hover styles. That is v4's default trade-off.
  - Chromium's touch emulation does not keep `:hover` after a tap, so the sticky state itself cannot be reproduced in CI or locally. The evidence is the media gating plus the media-query result.
- **Verification**: the Done-when items, on two `build:e2e` builds served side by side.

## Outcome

Shipped in #641 (`18d68fb3`, merged 2026-10-22T17:45:57Z). Production
reports `18d68fb3`.

- **Built CSS**: 63 of 64 `:hover` rules sit inside `@media (hover:hover)`,
  up from 0 of 64. The remaining one is the hand-written carousel rule.
- **Media query**: under Pixel 5 emulation, `matchMedia('(hover: hover)')`
  was `false` in both builds. Under a mouse context at 390 px it was `true`.
- **Mouse hover**: in both builds the mobile menu button rested with a
  transparent background and turned `rgb(243, 244, 246)` under the mouse.
- **Static captures**: with `VISUAL_DIFF_STATES=1`, 3 of 54 captures
  differed. All were `en_contact-*`, 2 px at 1/255 inside the Google Form
  iframe, which is the known noise.
- **Not reproduced**: Chromium's touch emulation does not keep `:hover` after
  `tap()`, so neither build showed the sticky state. The media gating above
  is the evidence.
- PR run `39822722496` passed. GitHub left its `Repo Checks (informational)`
  check run at `in_progress`, but the job log shows every step succeeding by
  17:27:05Z, including 36 guard-hook cases with 0 failures and 0 spelling
  issues.

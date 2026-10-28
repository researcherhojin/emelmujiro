---
status: in-progress
module: frontend
created: 2026-10-29
updated: 2026-10-29
---

# The homepage carousels can be paused by keyboard, and assistive tech reads each item once

## Intent

- **Problem**: the homepage has two auto-scrolling sections, `LogosSection` and `TestimonialsSection`, each with two rows that loop for good (`animation: … 32s linear infinite`, `tailwind.config.js:190-193`). Measured on `9a387450` (2026-10-29):
  - **No keyboard or pointer control stops them.** A row pauses only while the mouse hovers it (`.group:hover .group-hover\:pause`, `src/index.css:191`) or while a finger stays on it (`onTouchStart` / `onTouchEnd`). WCAG 2.2 SC 2.2.2 (Pause, Stop, Hide) requires a mechanism to pause content that moves automatically for more than 5 seconds next to other content.
  - **Reduced motion keeps them moving.** The `prefers-reduced-motion: reduce` block deliberately restores `32s` for all four rows (`src/index.css:233-243`). `60999d58` (2026-04-02) chose this because Windows often has the setting on by default, and `.claude/rules/frontend.md` › Scroll carousels repeats it as a rule.
  - **Each item is announced twice.** Both rows render two copies for the seamless loop, and neither copy is `aria-hidden`. A screen reader reads every testimonial and every logo `alt` twice.
  - **Long testimonials are clipped.** `line-clamp-4` hides the rest of a testimonial, and no element shows the full text.
- **Outcome wanted**: a visible control, reachable by keyboard, pauses and resumes each section, and the hover/touch resume never overrides it. The duplicate copy is hidden from assistive tech. The reduced-motion behavior follows the owner's decision below.
- **Affected systems**: `src/components/sections/LogosSection.tsx`, `TestimonialsSection.tsx`, their tests, `src/index.css`, the ko/en locale files, `.claude/rules/frontend.md` › Scroll carousels.
- **Constraints**:
  - The loop math stays as it is: `w-max`, spacing on items rather than `gap-*`, and 2 copies with `translateX(-50%)`.
  - The homepage DOM stays under Lighthouse's 800-node threshold. It was 616 elements in `<body>` per `.claude/rules/frontend.md`.
  - All UI text goes through i18n, and English strings are no longer than Korean ones.
  - Dark mode contrast must hold.
  - The KakaoTalk WebView must still scroll vertically over a row.
- **Origin**: item ② of the owner's private homepage proposal (`.private/ux-homepage-proposal.md`), which ranks it a defect rather than a hypothesis.
- **Open questions**: none. The owner answered on 2026-10-29:
  - Under reduced motion, the carousels start paused and the button can start them.
  - There is one control per section.
  - The mobile layout and full-text access stay out of scope.

## Spec

- **Approach**:
  - **Shared control.** One `CarouselPauseButton` (a native `<button type="button">` with a Pause/Play icon and a translated `aria-label`) sits under each section's heading. Each section holds a `userChoice` state (`null` until pressed, then `'paused'` or `'running'`) and passes it to both its rows.
  - **Play state.**
    - A row is paused when the user chose pause, or while it is hovered or touched.
    - It also starts paused when the user has not chosen and `prefers-reduced-motion: reduce` matches.
    - `touchend` no longer forces `running`; it only ends the touch pause.
  - **Reduced motion.** The CSS pauses the rows by default under `prefers-reduced-motion: reduce`, so the prerendered page never moves before JS loads. A `data-playing="true"` attribute set by the button overrides it. The `32s` duration override stays, because the global `0.01ms` rule would otherwise make a started carousel spin.
  - **Duplicates.** Items of the second copy get `aria-hidden="true"`, and their logos get an empty `alt`.
  - Rejected:
    - one page-level button, because the Services section sits between the two carousels;
    - `motion-reduce:!animate-none`, because nothing could then start the carousel again;
    - pausing with React state alone, because the prerendered HTML would move before hydration under reduced motion.
- **Files and interfaces**:
  - New `src/components/common/CarouselPauseButton.tsx` and `src/hooks/usePrefersReducedMotion.ts`, each with tests.
  - `LogosSection.tsx` and `TestimonialsSection.tsx`, with their tests.
  - `src/index.css`: the reduced-motion block and a `[data-playing]` override.
  - `i18n/locales/ko.json` and `en.json`: pause and play labels per section.
  - `.claude/rules/frontend.md` › Scroll carousels.
  - A Playwright spec under `frontend/e2e/`.
- **Out of scope**: the mobile single-card or scroll-snap layout; showing the full text of clipped testimonials; carousel speed; the other proposal items (③–⑦). Each goes in its own intent.
- **Done when**:
  - `npm run validate` passes (lint, type-check, `test:coverage`).
  - New unit tests cover these cases:
    - The button toggles both rows of its section and leaves the other section alone.
    - `touchend` after a pause leaves the row paused.
    - Under a mocked reduced-motion match, the rows start paused and the button offers play.
    - Exactly half of each row's items carry `aria-hidden="true"`.
  - Prerendered `build/index.html` and `build/en/index.html` each stay under 800 elements in `<body>`; record the count before and after.
  - The new Playwright spec passes locally on `chromium` and `Mobile Chrome` against `build:e2e`. It checks three things:
    - Tab reaches both buttons.
    - Enter sets `animation-play-state: paused` on both rows of that section.
    - With `reducedMotion: 'reduce'`, `/` and `/en` load with all four rows paused, and pressing a button starts its section.
  - End to end: PR CI is green (E2E, Lighthouse CI). The owner has viewed the change on a local server in light and dark mode before merge.

## Plan

- **Baseline** (`9a387450`, `npm run build:e2e`, 2026-10-29):
  - `build/index.html` and `build/en/index.html` each have 627 elements in `<body>` and 698 in the whole document.
  - `.claude/rules/frontend.md` still says 616 / 687 (`7919de6f`). Both numbers get updated with the new figures.
- **Changes**, in order:
  1. `usePrefersReducedMotion` hook. It reads `matchMedia`, subscribes to `change`, and is SSR-safe (`false` without `window`).
  2. `CarouselPauseButton`. Props: `playing`, `onToggle`, `labelPause` and `labelPlay`. It renders the lucide `Pause` / `Play` icon with `aria-hidden` and passes `aria-label` from its props.
  3. Section state and `ScrollRow`:
     - Each section holds `userChoice`.
     - `ScrollRow` gets `playing` and sets `data-playing={String(playing)}`.
     - Touch handlers only set a local `touching` flag.
     - The effective inline `animation-play-state` is `paused` when `!playing || touching`. Hover keeps the CSS rule.
     - `playing` = `userChoice === 'running'`, or `userChoice === null && !reducedMotion`.
  4. `index.css`:
     - Inside the reduced-motion block, `.animate-scroll*` get `animation-play-state: paused`.
     - `[data-playing="true"]` restores `running`.
     - The `32s` overrides stay.
  5. Duplicates: in the second copy (`copy === 1`), the wrapper gets `aria-hidden="true"` and the logo `<img>` gets `alt=""`.
  6. i18n keys `carousel.pauseLogos`, `carousel.playLogos`, `carousel.pauseTestimonials` and `carousel.playTestimonials`, in `ko.json` and `en.json`.
  7. Tests: unit tests for the hook, the button and both sections; a Playwright spec `e2e/carousel-pause.spec.ts`.
  8. `.claude/rules/frontend.md` › Scroll carousels: the new pause, touch and reduced-motion contract, and the remeasured DOM count.
  9. `CHANGELOG.md`.
- **Departures**:
  - `usePrefersReducedMotion` guards a `matchMedia()` that returns `undefined` (`?.matches`), because some existing tests reset the global `matchMedia` mock and crashed otherwise.
  - The E2E Tab test runs on `Mobile Chrome` too (Tab traversal works in its emulation), not desktop only.
  - The reduced-motion CSS also restates the hover pause for `[data-playing='true']`: that block is outside any cascade layer, so `[data-playing='true']` would otherwise beat the layered `.group-hover:pause` rule.
  - Whole-document count rose by 9 (698 to 707) against 8 in `<body>` (627 to 635); the extra element is outside `<body>` and was not investigated.
- **Risks**:
  - A hydration-time flash, where JS sets `running` before reading the media query. This shows in the reduced-motion E2E as a row with `running` at load.
  - The DOM count rising: each button adds itself, its `<svg>` and the icon's shapes. The count in `build/index.html` must stay under 800.
  - A KakaoTalk vertical-scroll regression, if the touch handlers start calling `preventDefault`. They must not.
- **Verification**: the `Done when` commands, then `npm run serve:build` for the owner's light/dark review.

## Outcome

<!-- Filled when status becomes shipped or dropped. -->

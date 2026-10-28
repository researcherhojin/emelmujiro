---
status: dropped
module: frontend
created: 2026-10-29
updated: 2026-10-29
---

# The homepage carousels can be paused by keyboard, and start paused under reduced motion

## Intent

- **Problem** (`9a387450`, 2026-10-29): the four rows of `LogosSection` and `TestimonialsSection` loop forever (`32s linear infinite`). Only hover or a held finger pauses them, so nothing a keyboard can reach stops them (WCAG 2.2 SC 2.2.2, Level A). Under `prefers-reduced-motion: reduce` they keep moving on purpose (`60999d58`). Each row also renders its items twice for the loop, and a screen reader read both copies.
- **Outcome wanted**: one pause/play button per section; carousels that start paused under reduced motion; the duplicate copy hidden from assistive tech.
- **Origin**: item ② of the owner's private homepage proposal (`.private/ux-homepage-proposal.md`).

## Outcome

**Split on 2026-10-29.** The duplicate-copy fix shipped in #704 (`CHANGELOG.md`). The owner dropped the pause button and the reduced-motion start after a main-vs-branch comparison. The full implementation is commit `7d2abe17` on #704.

Measured with `build:e2e` on `/` and `/en`, `9a387450` against `7d2abe17`. The two pages gave the same results.

| Check                                                                 | `9a387450`    | `7d2abe17`    |
| --------------------------------------------------------------------- | ------------- | ------------- |
| Times a screen reader reads each of 16 testimonials / 24 logos        | 2 / 2         | 1 / 1         |
| Keyboard-reachable pause controls                                     | 0             | 2             |
| Rows moving under reduced motion, after load                          | 4             | 0             |
| axe-core 4.13 violations, light and dark                              | 0             | 0             |
| Lighthouse desktop, 5 alternating runs: Perf, A11y, CLS, TBT (median) | 83, 100, 0, 0 | 84, 100, 0, 0 |
| LCP median, ko / en (ms)                                              | 2,767 / 2,776 | 2,793 / 2,800 |
| `<body>` elements, prerendered (JS off)                               | 616           | 624           |
| E2E, chromium + Mobile Chrome                                         | 140 passed    | 152 passed    |

The LCP ranges overlapped across runs, so no performance change was measured.

**Why the two parts were dropped:**

- **No usage evidence.** Umami records neither the reduced-motion setting nor a pause click, so no visitor-side gain could be shown.
- **No source for the premise.** `60999d58` says Windows often has reduced motion on by default but cites no source. This change would have frozen the carousels for every such visitor.
- **A bug in the reduced-motion part.** Prerender runs without reduced motion, so it baked `data-playing="true"` into the HTML. That attribute overrides the CSS pause, and with JS off all 4 rows still moved under `reduce`. With JS on, sampling every 50 ms through 4 s of load caught no moving frame. A fix would set the attribute only after the user presses the button.

**Accepted cost:** SC 2.2.2 stays unmet. Hover and a held finger remain the only ways to pause.

**Revisit if** an accessibility audit or a visitor raises it, or Umami starts recording the reduced-motion setting. Start from `7d2abe17`: it has the button, the `usePrefersReducedMotion` hook and the E2E spec. Fix the prerender bug above first.

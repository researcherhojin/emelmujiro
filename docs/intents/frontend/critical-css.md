---
status: dropped
module: frontend
created: 2026-10-17
updated: 2026-11-16
---

# Main CSS is inlined for first paint, if the render-blocking audit ever needs it

## Intent

- **Problem**: none today. The 2026-04-16 Pretendard fix took `render-blocking-resources` from 0.5 to 1.0 on all four measured URLs, and main CSS was not flagged, because Vite's module preload ordering keeps it off the critical path. This is a follow-up to revisit only if that audit regresses or LCP needs headroom.
- **Outcome wanted** (if revisited): main CSS off the critical path with CLS below 0.05.
- **Affected systems**: `frontend/vite.config.mts` or `frontend/index.html`; every prerendered document.
- **Constraints**:
  - CLS < 0.05 is a hard gate. The 2026-04-15 failed experiment showed why: losing above-the-fold styles at first paint makes text reflow when the CSS arrives.
  - A first attempt with `beasties` inlined the CSS but left the original `<link rel="stylesheet">` beside the preload variant, so the audit did not improve, and it added 20–50 KB to every per-route HTML.
- **Options**: patch the `beasties` config so it replaces the source link; or skip the plugin and hand-write a small critical stylesheet covering nav, hero and section layout, inlined in `index.html`.
- **Open questions**: none until the audit regresses.

## Outcome

Dropped on 2026-11-16 (owner delegated the decision): there is still no problem to solve, and the 2026-04-15 experiment showed the cost (CLS, 20–50 KB per document).

The re-raise trigger this file named cannot fire as configured. Lighthouse 13 (`@lhci/cli` `^0.16.0`, first proposed in #766) replaced `render-blocking-resources` with `render-blocking-insight`; `frontend/lighthouserc.js` still asserts the old name as `warn` (line 61), which LHCI reports as replaced on every run (job 133034358468, PR #799), and sets the new one `off` (line 60). Until that assertion moves to `render-blocking-insight`, a render-blocking regression shows in no CI result; the fix is tracked in `.private/journal.md` › Backlog.

Re-raise when `render-blocking-insight` warns on a prerendered document, or LCP needs headroom.

---
status: dropped
module: frontend
created: 2026-10-17
updated: 2026-11-22
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

The re-raise trigger this file named could not fire until the same day. Lighthouse 13 (`@lhci/cli` `^0.16.0`, first proposed in #766) replaced `render-blocking-resources` with `render-blocking-insight`; LHCI maps the old `warn` onto the new ID unless that ID is set, and `frontend/lighthouserc.js` set it `off`. It now reads `['warn', { minScore: 0.5, maxLength: 1 }]`: every run scored 0.5 (the one shared stylesheet, 0 ms FCP/LCP savings, 12 of 12 on run 43786290084), so it warns when savings become real or a second resource blocks (`.claude/rules/frontend-build.md` › Lighthouse).

Re-raise when `render-blocking-insight` warns on a prerendered document or LCP needs headroom. The PR Lighthouse job measures the hydrated app via Vite preview. When it warns, confirm the finding against a production build served by `npm run serve:build` before reopening this intent. [Build rules](../../../.claude/rules/frontend-build.md#frontend-build-rules) · [Chrome's render-blocking insight](https://developer.chrome.com/docs/performance/insights/render-blocking)

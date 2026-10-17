---
status: draft
module: frontend
created: 2026-10-17
updated: 2026-10-17
---

# Main CSS is inlined for first paint, if the render-blocking audit ever needs it

## Intent

- **Problem**: none today. The 2026-04-16 Pretendard fix took `render-blocking-resources` from 0.5 to 1.0 on all four measured URLs, and main CSS was not flagged, because Vite's module preload ordering keeps it off the critical path. This is a follow-up to revisit only if that audit regresses or LCP needs headroom.
- **Outcome wanted** (if revisited): main CSS off the critical path with CLS below 0.05.
- **Affected systems**: `frontend/vite.config.ts` or `frontend/index.html`; every prerendered document.
- **Constraints**:
  - CLS < 0.05 is a hard gate. The 2026-04-15 failed experiment showed why: losing above-the-fold styles at first paint makes text reflow when the CSS arrives.
  - A first attempt with `beasties` inlined the CSS but left the original `<link rel="stylesheet">` beside the preload variant, so the audit did not improve, and it added 20–50 KB to every per-route HTML.
- **Options**: patch the `beasties` config so it replaces the source link; or skip the plugin and hand-write a small critical stylesheet covering nav, hero and section layout, inlined in `index.html`.
- **Open questions**: none until the audit regresses.

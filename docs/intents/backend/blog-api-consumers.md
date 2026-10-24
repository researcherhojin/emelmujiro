---
status: draft
module: backend
created: 2026-10-17
updated: 2026-10-18
---

# It is known whether anything outside the site consumes the blog API

## Intent

- **Problem**: `BlogPostViewSet` allows anonymous list and retrieval, and `api.emelmujiro.com` is a public Cloudflare route, so external consumers cannot be ruled out. The release number was deleted on 2026-09-28 (`d6dc253f`) because nothing consumed it, which says nothing about API compatibility — and with no version, there is no place a breaking change would be announced.
- **Why it could not be answered before 2026-09-28** (each checked, not assumed): gunicorn writes no access log; Django's file logs sit at `WARNING` in production; backend container logs reset on every deploy; and the frontend nginx never sees API calls, because the production build calls `api.emelmujiro.com` directly. `APIResponseTimeMiddleware` now writes `backend/logs/access.log` with referer and user-agent (`91f7e15a`; `.claude/rules/backend.md`).
- **First look, 2026-10-04**: 41 lines over 2026-09-28 → 10-04 (30 × `200`, 10 × `404`). The `ua="node"` `page_size=500` calls come from the same client as the maintainer's own probe, so they are the prerender build, not a consumer. The rest are Googlebot and scanners probing a Metabase CVE. Too thin to conclude.
- **Second look, 2026-10-18** (the whole `access.log`, 829 lines over 2026-09-28 → 10-18, 19 days with traffic; no rotated file exists yet, `access.log` is 135,988 bytes of its 5 MB cap; aggregated locally and deleted, IPs not recorded): 542 lines hit `/api/blog-posts/`.
  - 285 are `ua="node"` with no referer, in exactly the request shapes of `frontend/scripts/generate-sitemap.ts` (`?page_size=500` until 2026-10-16, `?page=1&page_size=100` after it) — build traffic. Together with the prerender lines below they come from 202 distinct IPs, as a hosted CI runner pool would.
  - 120 carry a `http://127.0.0.1:<port>/` referer — the prerender step's headless browser, also build traffic.
  - 115 carry an `https://emelmujiro.com` referer — first-party pages, from 17 distinct IPs.
  - 19 are `curl/8.7.1`, all from a single IP that also issued build requests, on 2026-10-12, 10-16 and 10-18; 1 is the 2026-09-28 access-log probe; 2 are crawlers.
  - **0 lines are left unexplained.** 19 days is still short of a monthly consumer, so this narrows the question rather than closing it.
- **Outcome wanted**: a count of `/api/blog-posts/` requests whose referer is not `emelmujiro.com` **and** whose user-agent is not a browser, over enough days to mean something, with crawlers and scanners separated by user-agent.
- **Affected systems**: none until the measurement says otherwise; `access.log` survives deploys via the logs volume and rotates at 5 MB × 3 backups.
- **Constraints**: a zero count over a few days is weak evidence, not proof — a monthly or seasonal consumer would not appear.
- **Open questions**: if consumers exist, does the API need a version or an announcement channel? The field names are already a written contract (`.claude/rules/frontend.md`, Blog snake_case); they are just not versioned.
- **Not urgent**: nothing is known to be broken and no breaking change is planned.

## Spec

<!-- Filled when status becomes approved. -->

## Plan

<!-- Filled before the first edit. -->

## Outcome

<!-- Filled when status becomes shipped or dropped. -->

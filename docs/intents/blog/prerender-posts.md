---
status: draft
module: blog
created: 2026-10-17
updated: 2026-10-17
---

# A crawler that does not run JavaScript sees each post's own title, description and canonical

## Intent

- **Problem**: since 2026-09-24, `/insights/:slug` falls back to `app.html`, the pristine shell (`.claude/rules/frontend-build.md` `SSG prerender + nginx routing`). A crawler that does not run JavaScript therefore gets no title, description or canonical for a blog post. That is consistent, but empty; before 2026-09-24 it got the homepage's, which was worse. Google renders JavaScript, and the rendered DOM was correct when measured on 2026-09-24.
- **Outcome wanted**: either the raw HTML of each post URL carries its own head tags, or it is shown that Google indexes posts correctly without them and this is closed as `dropped`.
- **Affected systems** (if prerendering): `frontend/scripts/prerender.ts`, `frontend/scripts/generate-sitemap.ts`, the SPA-fallback regex in `frontend/nginx.conf` and its mirror in `frontend/scripts/e2e-server.ts`, `npm run check:routes`, the "expected 10" staged-document guard in `scripts/auto-deploy.sh`, `e2e/seo.spec.ts`.
- **Constraints**: posts are created in Django admin, not by a deploy, so a build-time snapshot is stale from the next publish or edit until the next deploy. A deleted post would keep serving its old raw HTML until then. Prerender already fails the build on any API error (`.claude/rules/frontend-build.md`, "Prerender reads the live API").
- **Options**:
  - (a) Prerender posts at build time. Cheaper since 2026-10-12, when the prerender script (then `prerender.js`) began relaying cross-origin API calls through `route.fetch()`; what remains is enumerating slugs at build time and a redeploy per publish.
  - (b) An nginx-side or backend-side endpoint that emits head tags for `/insights/:slug` and lets the SPA take over.
  - (c) Leave it, if Search Console shows the posts indexed with the right canonical.
- **Open questions**:
  - Are the "Discovered – currently not indexed" (2) and "Crawled – currently not indexed" (1) URLs in Search Console on 2026-10-12 the post URLs? Answered by inspecting each URL in Search Console.
  - Is the open-source-LLM post indexed? On 2026-10-12 it was absent from every not-indexed row, and Googlebot fetched it 4 times on 2026-10-10 and 2026-10-11. Answered by inspecting the URL.
  - On 2026-10-12, the TurboQuant post (ko+en) appeared only as "Discovered", never crawled. Prerendering cannot help a URL Google has not fetched; for that, the lever is the `/insights` document that links to both posts (since #552).

## Spec

<!-- Filled when status becomes approved: the option chosen, and the checks that prove it. -->

## Plan

<!-- Filled before the first edit. -->

## Outcome

<!-- Filled when status becomes shipped or dropped. -->

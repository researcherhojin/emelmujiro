---
status: in-progress
module: seo
created: 2026-10-22
updated: 2026-10-22
---

# Preserve published articles in the sitemap

## Intent

Search Console reports two discovered article URLs awaiting crawling. Live checks
found both reachable, translated, linked and present in the sitemap. The report
does not establish a rendering failure. Inspection found a separate regression
risk: an API failure silently generates a sitemap without any article URLs.

## Spec

- Abort sitemap generation on failed or inconsistent API pagination. Leave the
  existing sitemap untouched rather than publishing a partial replacement.
- Preserve valid empty inventories and current translated/untranslated rules.
- Test API failures, pagination consistency and canonical English homepage URLs.
- Keep the intentional `/en/` to `/en` redirect. No indexing guarantee or change
  to production content is implied.
- Defer article snapshots until publication changes can invalidate them: a
  build-only snapshot could keep serving a subsequently unpublished article.

## Plan

1. Make article inventory failures propagate to the build's existing error path.
2. Add dependency-free regression tests and run them in PR repository checks.
3. Verify the live inventory without writing public artifacts; independently
   review the change and record exact test results.

## Outcome

Implementation verified; deployment authorized on 2026-10-22 and pending. All
12 Node regression tests passed, including the CLI failure/no-overwrite case.
Route-list consistency, formatting, spelling and diff checks passed. Independent
review found no concrete correctness regressions.

A read-only generation against the public API found 3 published posts, all
translated; both TurboQuant URLs were present and the redirecting `/en/` URL was
absent. No generated public file was overwritten by this verification. The new
test suite runs in the `Test sitemap generation` step of both PR and main CI. Indexing decisions and
Google's live URL inspection remain outside this change.

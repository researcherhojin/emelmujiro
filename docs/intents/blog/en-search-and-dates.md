---
status: draft
module: blog
created: 2026-10-17
updated: 2026-10-18
---

# `/en` search matches English text and shows English dates

## Intent

- **Problem**: since 2026-10-16 a post can carry an English translation, and a Korean edit withdraws it (`translation_source_hash`). Two parts of `/en` are still Korean-only:
  - **Search.** `BlogPostViewSet.get_queryset` filters `Q(title__icontains=…) | Q(description__icontains=…) | Q(content__icontains=…)`, so an English query on `/en` never matches `title_en`, `description_en` or `content_html_en`.
  - **Dates.** `BlogCard` and `BlogDetail` render `formatDate(date)` from `frontend/src/utils/dateFormat.ts`, which hardcodes `toLocaleDateString('ko-KR', …)`, so `/en` shows Korean dates. The API's `formatted_date` and `relative_date` (`SerializerMethodField`s returning Korean strings) are read by no file in `frontend/src` (`git grep`, 2026-10-18); an external consumer is the open question of `backend/blog-api-consumers.md`.
- **Outcome wanted**: on `/en`, a query matching only English text finds the translated post, and dates read in English; `/` is unchanged.
- **Affected systems**: `backend/api/views.py` (`BlogPostViewSet`) for search; `frontend/src/utils/dateFormat.ts` (`formatDate`) and its callers `BlogCard`, `BlogDetail` for dates.
- **Constraints**: the public list cache serves only a request with no query string (`.claude/rules/backend.md`), so search is uncached either way. Only a post whose `is_translated` is true has English text worth matching.
- **Open questions**:
  - ~~Format dates on the client from the raw `date`, or add English fields to the API?~~ Answered 2026-10-18: the client already formats from the raw `date`; the fix is passing the language into `formatDate`, with no API change.
  - Should English search also match Korean fields? Answered by deciding what an `/en` reader is likely to type.

## Spec

<!-- Filled when status becomes approved. -->

## Plan

<!-- Filled before the first edit. -->

## Outcome

<!-- Filled when status becomes shipped or dropped. -->

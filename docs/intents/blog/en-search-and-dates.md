---
status: shipped
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
  - ~~Should English search also match Korean fields?~~ Answered by the owner 2026-10-18: yes. `/en` lists untranslated posts in Korean, so they must stay findable; the English fields only add matches.

## Spec

- **Approach**:
  - **Search**: `searchBlogPosts(query, lang)` sends `lang=en` on `/en`. `BlogPostViewSet.get_queryset` keeps the three Korean `icontains` filters and, only when `lang == "en"`, ORs in `title_en`, `description_en`, `content_html_en`. Without `lang`, the queryset is identical to today's, so `/` is unchanged. `BlogSearch`'s local fallback matches the `localizePost` view of each post as well as the Korean fields.
  - **Dates**: `formatDate(dateString, lang)` formats with `en-US` when `lang` starts with `en`, else `ko-KR`; `BlogCard` and `BlogDetail` pass `i18n.language`. The prerendered `/en/insights` list then carries English dates in its raw bytes.
  - Rejected: always matching the English fields (changes `/`, against the Outcome); filtering the English match to `is_translated` posts (a property computed from a hash, not a column, so it would need a Python pass over the queryset — a stale translation still describes the same post, and the result renders in Korean either way); API date fields in English (no frontend file reads `formatted_date`/`relative_date`).
  - Known limit: `content_html_en` is HTML, so a query equal to a tag or attribute name (`strong`, `class`) matches every translated post. The Korean side searches plain `content`; there is no plain English body to search instead. Accepted, not fixed here.
- **Files and interfaces**: `backend/api/views.py` (`BlogPostViewSet.get_queryset`, new optional `lang` query parameter), `backend/api/tests.py`; `frontend/src/services/api.ts` (`searchBlogPosts`), `frontend/src/components/blog/BlogSearch.tsx`, `frontend/src/utils/dateFormat.ts` (`formatDate`), `BlogCard.tsx`, `BlogDetail.tsx` and their tests; `CHANGELOG.md`.
- **Out of scope**: the API's `formatted_date` / `relative_date` (their consumers are `backend/blog-api-consumers.md`'s question); a plain-text English body field; search ranking; tag search on the server.
- **Done when**:
  - A backend test: a translated post whose English title contains a word absent from its Korean fields is found by `?search=<word>&lang=en` and not by `?search=<word>`; a Korean query with `lang=en` still finds the post.
  - Frontend tests: `formatDate('2026-10-18', 'en')` → `October 18, 2026`, `formatDate('2026-10-18', 'ko')` → `2026년 10월 18일`; `searchBlogPosts` sends `lang` only on `en`; the fallback finds a post by its English title.
  - `DATABASE_URL="" uv run python manage.py test`, `npm run validate` (from `frontend/`), `npm run spell` pass; `CLAUDE.md` unchanged.
  - End to end, after deploy: `curl 'https://api.emelmujiro.com/api/blog-posts/?search=<word>&lang=en'` returns the post and the same URL without `lang` does not, for a word chosen by `git grep`-style check against the post's Korean fields; `curl -s https://emelmujiro.com/en/insights` raw bytes contain English dates and no `YYYY년 M월 D일` date, and `/insights` keeps the Korean ones (measured 2026-10-18 before the change: `/en/insights` carries `2026년 10월 16일` once and `2026년 3월 27일` twice; post detail pages are not prerendered, `blog/prerender-posts.md`).

## Plan

- **Changes, in order**:
  1. `backend/api/views.py` `BlogPostViewSet.get_queryset`: read `lang` from `query_params`; build the existing three-field `Q`, and when `lang == "en"` OR in `title_en__icontains`, `description_en__icontains`, `content_html_en__icontains`. Any other `lang` value (or none) leaves the queryset exactly as today.
  2. `backend/api/tests.py`: one test class covering the three backend `Done when` cases, on a post whose English title holds a word absent from its Korean fields.
  3. `frontend/src/utils/dateFormat.ts`: `formatDate(dateString, lang?)`, `en-US` when `lang` starts with `en`, otherwise `ko-KR` (callers that pass nothing keep today's output).
  4. `BlogCard.tsx`, `BlogDetail.tsx`: pass `i18n.language` (both already call `useTranslation`/`localizePost`; check before adding a hook).
  5. `frontend/src/services/api.ts` `searchBlogPosts(query, lang?)`: add `lang: 'en'` to `params` only when `lang` starts with `en`; mock branch unchanged. `BlogSearch.tsx` passes `i18n.language`, and its local fallback also matches `localizePost(post, i18n.language)`'s title/description.
  6. Tests for 3–5 next to the existing ones (`dateFormat.test.ts`, `BlogSearch` tests, `BlogCard`/`BlogDetail` tests whose mocks may need the new argument).
  7. `CHANGELOG.md` entry.
- **Risks**: `setupTests.ts` mocks `react-i18next` with `language: 'ko'`, so existing component tests keep Korean output; an `en` case needs a local re-mock (copy the shape from `setupTests.ts`, `.claude/rules/frontend.md` Testing). `BlogDetail.test.tsx` mocks `utils/dateFormat` wholesale, so a signature change there is invisible to it — assert the call arguments instead. Node's ICU must format `en-US` and `ko-KR` the same in CI (`ubuntu-24.04`, full ICU) as locally; assert exact strings once and let CI confirm.
- **Verification**: the `Done when` list; `intent-reviewer` in a fresh session; the end-to-end `curl` checks after deploy.
- **Departures during implementation**:
  - Step 5: the local fallback reuses one matcher for the Korean post and for `localizePost(post, i18n.language)`, so on `/en` it also matches `tags_en` (which `localizePost` swaps in), not only title and description. The Spec asks for "the `localizePost` view of each post"; restricting it to two fields would have needed a second matcher.
  - Step 6: `BlogDetail.test.tsx` keeps its wholesale `utils/dateFormat` mock. The language reaching `formatDate` is asserted in `BlogDetail.localization.test.tsx` instead, which renders the real `formatDate` and expects `October 16, 2026` on `/en` and `2026년 10월 16일` on `/` — the output itself rather than the call arguments.

## Outcome

**Shipped 2026-10-18 in #577** (`830fe704`); production reports `830fe704`. Every `Done when` item passed; the local evidence is in the PR body.

- **End to end, measured on production after the deploy:**
  - `?search=picking&lang=en` → 1 post (`Picking an Open-Source LLM…`, a word in none of the 3 posts' Korean fields); `?search=picking` → 0.
  - `?search=오픈소스` → 1 with and without `lang=en`, so a Korean query still works on `/en`; `?search=LLM` → 2, and 3 with `lang=en`.
  - `/en/insights` raw bytes: `March 27, 2026` × 2 and `October 16, 2026` × 1, no Korean date; `/insights`: `2026년 3월 27일` × 2 and `2026년 10월 16일` × 1.
- **Departures:** the two recorded under `Plan`, plus one found by `intent-reviewer`: the new test class had been inserted between `BlogPostWriteAPITestCase` and its `@override_settings` decorator, fixed in the PR before merge.
- **Lesson:** inserting a class above an existing one can steal its decorator, and every test still passes. Read the diff's hunk boundaries, not only the test result.

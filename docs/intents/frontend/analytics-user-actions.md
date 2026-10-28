---
status: in-progress
module: frontend
created: 2026-10-28
updated: 2026-10-28
---

# Analytics records deliberate homepage actions

## Intent

Language normalization currently emits switch_language through the global i18next listener. Contact CTAs emit click_cta_email despite linking to /contact. Service opens and profile navigation are not measured. The owner requested this correction on 2026-10-28.

## Spec

- Navbar language buttons emit switch_language with from/to before navigation; automatic language changes emit nothing.
- Existing hero/cta calls emit click_contact, preserving location. This measures navigation intent, not a submitted inquiry.
- Service cards and footer service links emit open_service with stable service_id and location (services/footer). Modal navigation does not count as a new open.
- Navbar and footer profile links emit click_profile with location (navbar/footer).
- The prerender browser sets an in-memory flag before application scripts run; the shared analytics sender suppresses all events under that flag. It is not serialized into HTML.
- Files: analytics utility, i18n initialization, Navbar, Footer, ServicesSection, window types, prerender script and related tests.
- Out of scope: layout, extra contact entry points, form submissions, historical data rewriting, deployment infrastructure.
- Verify user click payloads and automatic-language silence, prerender suppression of beacon/fetch, then frontend lint, type checks and coverage.
- Measurement boundary: implementation dated 2026-10-28; the actual data boundary starts at deployment. Historical switch_language includes normalization; click_cta_email and click_contact must not be compared as identical series without this caveat.

## Plan

1. Move language tracking to the user handler and define event payloads.
2. Wire service/profile handlers and add the prerender suppression flag.
3. Add regression tests, run validation, and independently review against this spec.
4. Record validation and changelog; retain in-progress until merged and deployed.

## Outcome

Implemented locally on 2026-10-28; not yet merged or deployed.

- `npm run validate` passed: lint, all TypeScript projects, 69 test files and 1,291 tests. Coverage: statements 99.94%, branches 100%, functions 99.43%, lines 100%.
- Independent spec/correctness review found no defects; its footer service-payload assertion gap was addressed. The final footer test file passed all 31 tests.
- `npm run spell` and `git diff --check` passed.
- No layout or translation copy changed. No production analytics requests were used for testing.
- Deployment timestamp and commit remain pending; do not treat the implementation date as the production measurement boundary.

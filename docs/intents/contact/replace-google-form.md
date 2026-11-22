---
status: draft
module: contact
created: 2026-10-17
updated: 2026-11-22
---

# `/contact` submits to the site's own backend instead of an embedded Google Form

## Intent

- **Problem**: `/contact` best-practices is **0.74**, re-measured 2026-08-18 against `npm run serve:build` (below the `0.9` warn floor in `lighthouserc.js`). The Google Form iframe sets third-party cookies (`S`, `COMPASS`, `NID`) and triggers `frame-ancestors` CSP violations, which are the two line items pulling the score down.
- **What already exists**: `ContactView` in `backend/api/views.py` (reCAPTCHA, spam check, rate limit), fully tested; `createContact` in `frontend/src/services/api.ts`. Only the form UI and the iframe/CSP removal remain.
- **Current implementation (2026-11-22)**: [ContactPage](../../../frontend/src/components/pages/ContactPage.tsx) still embeds Google Forms. [ContactPage tests](../../../frontend/src/components/pages/__tests__/ContactPage.test.tsx) cover that behavior.
- **Outcome wanted**: `/contact` best-practices ≥ 0.90, and the `third-party-summary` audit no longer mentions `docs.google.com`.
- **Affected systems**: `ContactPage.tsx`; the `frame-src https://docs.google.com` exception in both CSP copies (`frontend/index.html` and `frontend/nginx.conf`, kept in sync per `.claude/rules/frontend-build.md`); i18n toast copy; `lighthouserc.js`; the privacy policy, whose data-collection section must match what is actually collected (`.claude/rules/frontend.md`, Privacy schema lockstep).
- **Constraints**: the backend form requires working SMTP and reCAPTCHA production settings before switching traffic. A missing `RECAPTCHA_PRIVATE_KEY` fails the first verified submission. Confirm production configuration during implementation. [Backend production keys](../../../.claude/rules/backend.md#security)
- **Re-measured 2026-11-16** (Lighthouse 13, PR CI): best-practices **0.77** on all 3 runs in PR #797 (job 133021489260) and again in PR #799 (job 133034358468), with `third-party-cookies` warning in both.
- **Options**: (a) the backend form above, after the secrets exist; (b) a click-to-load facade, so the iframe and its cookies appear only after the visitor opens the form, which needs no secrets but adds a click; (c) keep the iframe and accept the score.
- **Open questions**: which option. On 2026-11-16 the owner deferred the choice ("나중에 디버깅"); (a) also stays blocked on the owner provisioning those secrets, estimated 2–3 h after that.

## Spec

<!-- Filled when status becomes approved. -->

## Plan

<!-- Filled before the first edit. -->

## Outcome

<!-- Filled when status becomes shipped or dropped. -->

---
status: draft
module: contact
created: 2026-10-17
updated: 2026-10-17
---

# `/contact` submits to the site's own backend instead of an embedded Google Form

## Intent

- **Problem**: `/contact` best-practices is **0.74**, re-measured 2026-08-18 against `npm run serve:build` (below the `0.9` warn floor in `lighthouserc.js`). The Google Form iframe sets third-party cookies (`S`, `COMPASS`, `NID`) and triggers `frame-ancestors` CSP violations, which are the two line items pulling the score down.
- **What already exists**: `ContactView` in `backend/api/views.py` (reCAPTCHA, spam check, rate limit), fully tested; `createContact` in `frontend/src/services/api.ts`. Only the form UI and the iframe/CSP removal remain.
- **Outcome wanted**: `/contact` best-practices ≥ 0.90, and the `third-party-summary` audit no longer mentions `docs.google.com`.
- **Affected systems**: `ContactPage.tsx`; the `frame-src https://docs.google.com` exception in both CSP copies (`frontend/index.html` and `frontend/nginx.conf`, kept in sync per `.claude/rules/frontend-build.md`); i18n toast copy; `lighthouserc.js`; the privacy policy, whose data-collection section must match what is actually collected (`.claude/rules/frontend.md`, Privacy schema lockstep).
- **Constraints**: production needs `EMAIL_HOST_USER` and `EMAIL_HOST_PASSWORD` (a Gmail app password) and `RECAPTCHA_PUBLIC_KEY` / `RECAPTCHA_PRIVATE_KEY` in `backend/.env.production`; none is set. A missing `RECAPTCHA_PRIVATE_KEY` fails the first submission, not startup (`CLAUDE.md` `Production keys`).
- **Open questions**: blocked on the owner provisioning those secrets. Effort after that was estimated at 2–3 h.

## Spec

<!-- Filled when status becomes approved. -->

## Plan

<!-- Filled before the first edit. -->

## Outcome

<!-- Filled when status becomes shipped or dropped. -->

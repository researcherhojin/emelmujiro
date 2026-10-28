---
status: shipped
module: infra
created: 2026-10-23
updated: 2026-10-29
---

# Both hosts send HSTS

## Intent

- **Problem**: neither `https://emelmujiro.com/` nor `https://api.emelmujiro.com/api/health/` sends `Strict-Transport-Security` (measured 2026-10-23 with `curl -D -`).
  - "Always Use HTTPS" answers `http://` with a 301, but a browser's first plain-http request can still be intercepted before that redirect arrives. HSTS makes the browser skip http for this host on later visits.
  - HSTS was off by decision ("browsers cache it beyond our control", `backend/config/settings.py`). On 2026-10-23 the owner asked for it, after an exposure check listed it.
- **Outcome wanted**: both hosts send `Strict-Transport-Security: max-age=86400` on every https response, with no `includeSubDomains` and no `preload`.
- **Affected systems**: `frontend/nginx.conf` (the `emelmujiro.com` site, which serves `/api` through nginx too); Django's `SecurityMiddleware` (`api.emelmujiro.com`, whose tunnel route goes straight to gunicorn); `.claude/rules/frontend-build.md`, which says Cloudflare owns https.
- **Constraints**:
  - nginx never redirects by scheme (`frontend-build.md`).
  - Behind nginx, Django sees every request as `http`, so `is_secure()` is false and Django sends no HSTS there. On `api.` it sees `https`: its `/api/` lists `https://api.emelmujiro.com/...` URLs, while the same view through nginx lists `http://emelmujiro.com/...`.
  - A cached HSTS policy cannot be withdrawn early. Start short and leave subdomains out.
- **Open questions**: none. The owner approved this on 2026-10-23.

## Spec

- **Approach**:
  - nginx sets `$hsts` once, at server level, and every block that carries the security headers adds it.
  - Django's `SECURE_HSTS_SECONDS` default goes from `0` to `86400`, so `SecurityMiddleware` sends HSTS on `api.`.
  - Through nginx, Django sends none, because `is_secure()` is false there. So each host gets exactly one header.
  - Browsers ignore HSTS on plain-http responses, so local `http://localhost` serving is unaffected.
  - Rejected: Cloudflare's dashboard HSTS toggle. It works without code, but it would live outside the repo and its review.
- **Files and interfaces**: `frontend/nginx.conf`, `backend/config/settings.py`, `backend/.env.example`, `.claude/rules/frontend-build.md`, `CHANGELOG.md`.
- **Out of scope**:
  - raising `max-age` (a later step, once a week passes without trouble)
  - `includeSubDomains` and `preload`
  - Cloudflare settings
- **Done when**:
  - The PR's `Check nginx config against the pinned image` passes.
  - After deploy, `curl -sD - https://emelmujiro.com/` and `curl -sD - https://emelmujiro.com/api/health/` each show one `strict-transport-security: max-age=86400`.
  - After deploy, `curl -sD - https://api.emelmujiro.com/api/health/` shows one too. If it shows none, the host's `backend/.env.production` pins `SECURE_HSTS_SECONDS=0`, and the owner removes that line.

## Plan

- **Changes**: the five files above and this intent.
- **Risks**: an https outage at Cloudflare would lock visitors out for up to a day, which is why `max-age` is short.
- **Verification**: the Done-when checks. Review is the advisor; the owner excluded review tools this session.

## Outcome

Merged in #648 (`437f2390`).

- **`emelmujiro.com`**: every path checked after that deploy returned exactly one `strict-transport-security: max-age=86400`. The paths were `/`, `/en/insights/x`, `/app.html`, a hashed `/assets/*.js`, `/contact`, `/api/health/` and `/.well-known/security.txt`.
- **`api.emelmujiro.com`**: at first it sent none. As the Plan expected, the host's `backend/.env.production` pinned `SECURE_HSTS_SECONDS=0`. The owner set it to `86400`, and a dispatched Main CI/CD run (`39893286381`, all 5 jobs green) recreated the backend. Afterwards `/api/health/` and `/api/blog-posts/` each returned exactly one `max-age=86400`, and production still reported `cfe3b05f`.
- **2026-10-29**: after 6 days with no https trouble (both hosts sent one `max-age=86400`, `http://` answered `301` to `https://`, the certificate runs to 2027-01-24), the owner asked to raise it a day early. `$hsts`, the Django default and `.env.example` moved to `604800` in #703 (`9a387450`). The owner then set the host's `backend/.env.production` to `604800` and recreated the backend, and `api.emelmujiro.com` and `emelmujiro.com` each sent one `max-age=604800`.
- **Next**: after a month at `604800` with no https trouble, raise all three and the host env to `31536000`.

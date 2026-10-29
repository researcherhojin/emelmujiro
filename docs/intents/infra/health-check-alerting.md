---
status: dropped
module: infra
created: 2026-10-17
updated: 2026-10-18
---

# A failing health check reaches a person, not only a log file

## Intent

- **Problem**: `make setup-cron` runs `scripts/deploy/health-check.sh --quiet` every 5 minutes on the deploy host and appends failures to `backend/logs/health-check.log`, which nobody reads unprompted. It has run correctly since #553, but a failure notifies no one — the same "a red scheduled run notifies nobody" gap that made `deploy-drift-check.yml` and `pipeline-watchdog.yml` file GitHub issues.
- **Outcome wanted**: a failing check is seen within hours, without opening the log.
- **Affected systems**: `scripts/deploy/health-check.sh`, the `setup-cron` target in `Makefile`, `.claude/rules/ci.md` `Operational logs`.
- **Constraints**: cron's `PATH` is `/usr/bin:/bin` (`.claude/rules/ci.md` `Operational logs`), so `gh` would need an absolute path; `gh` auth under cron is unverified; at 288 runs a day, any notifier needs dedup (bump one open issue, as `deploy-drift-check.yml` does) or it floods.
- **Open questions**: does a host-local check catch anything the existing external check misses? (Answered below.)

## Outcome

**Dropped on 2026-10-17**, confirmed by the owner after the analysis below. The check runs on the host it monitors, so it cannot report the host itself or the Cloudflare tunnel being down. It would see Docker Desktop stopped (every `docker compose ps` falls through to `fail`), but so does the external probe: `deploy-drift-check.yml` checks `https://emelmujiro.com/api/health/` from outside once a day and files, bumps and auto-closes a `Production unreachable` issue.

**Accepted cost**: that probe is daily and fires hours after its cron (`.claude/rules/ci.md` allows about 9 hours), so an outage can take more than a day to surface — short of the "within hours" wanted above. For a site with this traffic, that latency is accepted.

What a notifier would add is limited to failures the external probe cannot see while `/api/health/` answers: the `umami` or `umami-db` container down, or disk above 90 %. A frontend nginx outage is not on that list: the external probe goes through its `location /api` proxy, so it already fails then. Against that, it needs dedup, an absolute `gh` path, and cron-context auth verified on the deploy host — which cannot be tested end to end from a dev machine.

The cron and its log stay: they are the forensic record after an incident.

**Update 2026-10-18 — the host-down case now has an external alarm at no cost**: a Cloudflare Tunnel Health Alert (free on every Zero Trust plan, per the Cloudflare notifications docs) emails the owner when the site's tunnel becomes healthy, degraded or down. It is configured in the Cloudflare dashboard, not in this repo; the details live in the private operations notes. It covers the host or `cloudflared` going away — the 2026-08 FileVault outage shape — within minutes instead of the daily probe's hours. It does not cover a container down behind a healthy tunnel, which stays as accepted above.

**Revisit if** an outage of one of those host-only kinds is found late. The fix then is an external uptime monitor watching more than `/api/health/`, not a notifier inside the cron.
